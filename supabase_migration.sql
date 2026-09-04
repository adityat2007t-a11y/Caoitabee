-- ============================================================================
-- CAPITABEE FINANCIAL SERVICES - COMPLETE SUPABASE MIGRATION SCRIPT
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'employee', 'associate', 'customer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE loan_stage_status AS ENUM ('Completed', 'In Progress', 'Pending', 'Rejected', 'Action Required');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE document_status AS ENUM ('Requested', 'Pending Upload', 'Uploaded', 'Under Review', 'Verified', 'Rejected', 'Re-upload Required');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE review_status AS ENUM ('Pending', 'Approved', 'Rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE lead_status AS ENUM ('New', 'Contacted', 'Closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'alert');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE chat_sender AS ENUM ('customer', 'associate', 'system');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. TABLE SCHEMAS

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'customer',
  full_name TEXT NOT NULL,
  email TEXT,
  mobile_number TEXT,
  customer_id TEXT UNIQUE,
  associate_code TEXT UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.associates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  associate_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  designation TEXT DEFAULT 'Loan Processing Associate',
  branch TEXT DEFAULT 'Thane',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.loan_products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Retail', 'Commercial', 'MSME', 'Specialized')),
  starting_rate TEXT,
  max_tenure TEXT,
  tagline TEXT,
  description TEXT,
  key_highlights JSONB DEFAULT '[]'::jsonb,
  sub_products JSONB DEFAULT '[]'::jsonb,
  eligibility JSONB DEFAULT '[]'::jsonb,
  typical_documents JSONB DEFAULT '{"salaried": [], "selfEmployed": [], "common": []}'::jsonb,
  benefits JSONB DEFAULT '[]'::jsonb,
  icon_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.applications (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES public.customers(customer_id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  email TEXT,
  loan_type TEXT NOT NULL,
  required_loan_amount NUMERIC(15, 2) NOT NULL,
  employment_type TEXT DEFAULT 'Salaried',
  city TEXT DEFAULT 'Thane',
  state TEXT DEFAULT 'Maharashtra',
  preferred_contact_method TEXT DEFAULT 'Phone Call',
  associate_id UUID REFERENCES public.associates(id) ON DELETE SET NULL,
  associate_name TEXT,
  assigned_employee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_employee_name TEXT,
  assigned_at TIMESTAMPTZ,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_officer TEXT DEFAULT 'Capitabee Loan Processing Team',
  status TEXT NOT NULL DEFAULT 'Received',
  current_stage INTEGER NOT NULL DEFAULT 1 CHECK (current_stage >= 1 AND current_stage <= 12),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.application_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id TEXT NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  stage_number INTEGER NOT NULL CHECK (stage_number >= 1 AND stage_number <= 12),
  name TEXT NOT NULL,
  description TEXT,
  status loan_stage_status NOT NULL DEFAULT 'Pending',
  remarks TEXT,
  action_required_reason TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT uq_application_stage UNIQUE (application_id, stage_number)
);

CREATE TABLE IF NOT EXISTS public.application_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id TEXT NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  stage INTEGER NOT NULL,
  stage_name TEXT,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  customer_message TEXT NOT NULL,
  internal_note TEXT,
  updated_by TEXT NOT NULL,
  updated_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.documents (
  id TEXT PRIMARY KEY DEFAULT ('doc-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text), 1, 6)),
  application_id TEXT NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  customer_id TEXT REFERENCES public.customers(customer_id) ON DELETE SET NULL,
  document_type TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other' CHECK (category IN ('KYC', 'Income', 'Property', 'Business', 'Financials', 'Other')),
  file_name TEXT NOT NULL DEFAULT '',
  file_size TEXT,
  file_url TEXT,
  storage_path TEXT,
  status document_status NOT NULL DEFAULT 'Pending Upload',
  rejection_reason TEXT,
  instructions TEXT,
  is_requested BOOLEAN NOT NULL DEFAULT FALSE,
  requested_by TEXT,
  requested_at TIMESTAMPTZ,
  uploaded_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id TEXT NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  type notification_type NOT NULL DEFAULT 'info',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY DEFAULT ('msg-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text), 1, 6)),
  application_id TEXT NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  sender chat_sender NOT NULL DEFAULT 'customer',
  sender_name TEXT NOT NULL,
  sender_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY DEFAULT ('rev-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text), 1, 6)),
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  loan_type TEXT NOT NULL,
  city TEXT,
  photo_url TEXT,
  status review_status NOT NULL DEFAULT 'Pending',
  moderated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  moderated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id TEXT PRIMARY KEY DEFAULT ('contact-' || extract(epoch from now())::bigint),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  subject TEXT DEFAULT 'General Inquiry',
  message TEXT NOT NULL,
  status lead_status NOT NULL DEFAULT 'New',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.callback_requests (
  id TEXT PRIMARY KEY DEFAULT ('cb-' || extract(epoch from now())::bigint),
  full_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  email TEXT,
  loan_type TEXT NOT NULL,
  amount TEXT,
  city TEXT,
  state TEXT,
  associate_name TEXT,
  associate_id UUID REFERENCES public.associates(id) ON DELETE SET NULL,
  message TEXT,
  status lead_status NOT NULL DEFAULT 'New',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.associate_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  associate_id UUID NOT NULL REFERENCES public.associates(id) ON DELETE CASCADE,
  month_year DATE NOT NULL,
  target_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  achieved_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  target_files INTEGER NOT NULL DEFAULT 0,
  logged_files INTEGER NOT NULL DEFAULT 0,
  disbursed_files INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_associate_month UNIQUE (associate_id, month_year)
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entity_name TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_applications_cust ON public.applications(customer_id);
CREATE INDEX IF NOT EXISTS idx_applications_usr ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_asc ON public.applications(associate_id);
CREATE INDEX IF NOT EXISTS idx_stages_app ON public.application_stages(application_id);
CREATE INDEX IF NOT EXISTS idx_timeline_app ON public.application_timeline(application_id);
CREATE INDEX IF NOT EXISTS idx_documents_app ON public.documents(application_id);
CREATE INDEX IF NOT EXISTS idx_notifications_app ON public.notifications(application_id);
CREATE INDEX IF NOT EXISTS idx_messages_app ON public.messages(application_id);
CREATE INDEX IF NOT EXISTS idx_reviews_stat ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_callbacks_stat ON public.callback_requests(status);

-- SEQUENCES FOR ATOMIC, COLLISION-SAFE ID GENERATION
CREATE SEQUENCE IF NOT EXISTS public.seq_application_number START WITH 1;
CREATE SEQUENCE IF NOT EXISTS public.seq_customer_number START WITH 1;

-- 6. AUTOMATED CUSTOMER PROVISIONING TRIGGER (SECURITY DEFINER)
-- Ensures that EVERY application inserted is linked to a valid public.customers record matching mobile_number
CREATE OR REPLACE FUNCTION public.ensure_customer_for_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_cust_id TEXT;
  v_cust_uuid UUID;
  v_seq_val BIGINT;
  v_clean_phone TEXT;
BEGIN
  -- If customer_id is already provided and valid in customers table, proceed
  IF NEW.customer_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.customers WHERE customer_id = NEW.customer_id) THEN
    RETURN NEW;
  END IF;

  v_clean_phone := REGEXP_REPLACE(TRIM(NEW.mobile_number), '[^0-9]', '', 'g');
  IF LENGTH(v_clean_phone) > 10 AND LEFT(v_clean_phone, 2) = '91' THEN
    v_clean_phone := SUBSTRING(v_clean_phone FROM 3);
  ELSIF LENGTH(v_clean_phone) = 11 AND LEFT(v_clean_phone, 1) = '0' THEN
    v_clean_phone := SUBSTRING(v_clean_phone FROM 2);
  END IF;

  -- Check if a customer record already exists for this mobile number or email
  SELECT customer_id, id INTO v_cust_id, v_cust_uuid
  FROM public.customers
  WHERE (LENGTH(v_clean_phone) = 10 AND (mobile_number = v_clean_phone OR mobile_number = ('+91' || v_clean_phone) OR REGEXP_REPLACE(mobile_number, '[^0-9]', '', 'g') = v_clean_phone))
     OR (NEW.email IS NOT NULL AND NULLIF(TRIM(NEW.email), '') IS NOT NULL AND LOWER(email) = LOWER(TRIM(NEW.email)))
  ORDER BY created_at ASC
  LIMIT 1;

  -- If not found, create new customer using atomic sequence
  IF v_cust_id IS NULL THEN
    LOOP
      v_seq_val := nextval('public.seq_customer_number');
      v_cust_id := 'CUST-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(v_seq_val::TEXT, 6, '0');
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.customers WHERE customer_id = v_cust_id);
    END LOOP;

    v_cust_uuid := gen_random_uuid();

    INSERT INTO public.customers (id, customer_id, full_name, mobile_number, email)
    VALUES (v_cust_uuid, v_cust_id, NEW.full_name, NEW.mobile_number, NEW.email);
  END IF;

  -- Assign the matched/created customer_id to this application
  NEW.customer_id := v_cust_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ensure_customer_for_application ON public.applications;
CREATE TRIGGER trg_ensure_customer_for_application
BEFORE INSERT ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.ensure_customer_for_application();

-- 7. AUTOMATED STAGE INITIALIZATION TRIGGER (SECURITY DEFINER with safe search_path)
CREATE OR REPLACE FUNCTION public.create_default_12_stages()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  stage_names TEXT[] := ARRAY[
    'Inquiry & Eligibility Check', 'Application Form & File Login', 'Document Collection & Verification',
    'Multi-Bank Evaluation & Login', 'Bank Credit & Risk Assessment', 'In-Principle Sanction Letter',
    'Legal Vetting & Title Search', 'Technical Valuation & Property Inspection', 'Final Sanction & Loan Offer',
    'One-Time Condition (OTC) Clearance', 'Loan Agreement Signing & Disbursement', 'Post-Disbursement Documentation (PDD)'
  ];
  stage_descs TEXT[] := ARRAY[
    'Initial loan inquiry received and preliminary eligibility assessed across lending parameters.',
    'Application file created and registered in the Capitabee underwriting desk.',
    'Collection and formal verification of KYC, financial, and property documents.',
    'Application file logged with chosen banking and NBFC partners for credit appraisal.',
    'Lender credit manager assessment, CIBIL evaluation, and income assessment.',
    'Lending institution issues formal in-principle sanction approval indicating loan eligibility.',
    'Advocate/legal firm executes 30-year property title search and clearance report.',
    'Certified civil engineer/valuer conducts on-site valuation and technical clearance.',
    'Issuance of final sanction letter containing precise ROI, tenure, and sanction conditions.',
    'Execution and satisfaction of pre-disbursement lender stipulations.',
    'Execution of loan agreement and direct credit transfer to designated account.',
    'Handover of original title deeds, welcome kit, and repayment schedule.'
  ];
  i INT;
  st_status loan_stage_status;
BEGIN
  -- Prevent duplicate stage creation if stages already exist for this application
  IF EXISTS (SELECT 1 FROM public.application_stages WHERE application_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  FOR i IN 1..12 LOOP
    IF i < NEW.current_stage THEN st_status := 'Completed';
    ELSIF i = NEW.current_stage THEN st_status := 'In Progress';
    ELSE st_status := 'Pending'; END IF;

    INSERT INTO public.application_stages (
      application_id,
      stage_number,
      name,
      description,
      status
    )
    VALUES (
      NEW.id,
      i,
      stage_names[i],
      stage_descs[i],
      st_status
    )
    ON CONFLICT (application_id, stage_number) DO NOTHING;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_application_stages ON public.applications;
CREATE TRIGGER trg_create_application_stages
AFTER INSERT ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.create_default_12_stages();

-- 8. SECURE PUBLIC INTAKE RPC FUNCTION (SECURITY DEFINER)
-- Allows anonymous website users to submit loan applications and returns sanitized result
-- Generates standard APP-YYYY-XXXXXX and CUST-YYYY-XXXXXX identifiers
CREATE OR REPLACE FUNCTION public.submit_public_loan_application(
  p_full_name TEXT,
  p_mobile_number TEXT,
  p_email TEXT DEFAULT NULL,
  p_loan_type TEXT DEFAULT 'Working Capital (MSME)',
  p_required_loan_amount NUMERIC DEFAULT 0,
  p_employment_type TEXT DEFAULT 'Salaried',
  p_city TEXT DEFAULT 'Thane',
  p_state TEXT DEFAULT 'Maharashtra',
  p_preferred_contact_method TEXT DEFAULT 'Phone Call',
  p_associate_name TEXT DEFAULT NULL,
  p_associate_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_customer_id TEXT;
  v_customer_uuid UUID;
  v_application_id TEXT;
  v_seq_app BIGINT;
  v_seq_cust BIGINT;
  v_clean_phone TEXT;
  v_clean_name TEXT;
  v_clean_email TEXT;
BEGIN
  -- Clean inputs
  v_clean_name := TRIM(p_full_name);
  v_clean_email := LOWER(NULLIF(TRIM(p_email), ''));
  v_clean_phone := REGEXP_REPLACE(TRIM(p_mobile_number), '[^0-9]', '', 'g');

  IF LENGTH(v_clean_phone) > 10 AND LEFT(v_clean_phone, 2) = '91' THEN
    v_clean_phone := SUBSTRING(v_clean_phone FROM 3);
  ELSIF LENGTH(v_clean_phone) = 11 AND LEFT(v_clean_phone, 1) = '0' THEN
    v_clean_phone := SUBSTRING(v_clean_phone FROM 2);
  END IF;

  IF v_clean_name = '' OR v_clean_phone = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Full Name and Mobile Number are required.');
  END IF;

  -- 1. Find or create Customer
  SELECT id, customer_id INTO v_customer_uuid, v_customer_id
  FROM public.customers
  WHERE (LENGTH(v_clean_phone) = 10 AND (mobile_number = v_clean_phone OR mobile_number = ('+91' || v_clean_phone) OR REGEXP_REPLACE(mobile_number, '[^0-9]', '', 'g') = v_clean_phone))
     OR (v_clean_email IS NOT NULL AND LOWER(email) = v_clean_email)
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_customer_id IS NULL THEN
    LOOP
      v_seq_cust := nextval('public.seq_customer_number');
      v_customer_id := 'CUST-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(v_seq_cust::TEXT, 6, '0');
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.customers WHERE customer_id = v_customer_id);
    END LOOP;

    v_customer_uuid := gen_random_uuid();

    INSERT INTO public.customers (id, customer_id, full_name, mobile_number, email)
    VALUES (v_customer_uuid, v_customer_id, v_clean_name, v_clean_phone, v_clean_email);
  ELSE
    UPDATE public.customers
    SET full_name = COALESCE(NULLIF(v_clean_name, ''), full_name),
        email = COALESCE(v_clean_email, email),
        updated_at = NOW()
    WHERE id = v_customer_uuid;
  END IF;

  -- 2. Generate Application ID (APP-YYYY-XXXXXX)
  LOOP
    v_seq_app := nextval('public.seq_application_number');
    v_application_id := 'APP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(v_seq_app::TEXT, 6, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.applications WHERE id = v_application_id);
  END LOOP;

  -- 3. Insert Application
  INSERT INTO public.applications (
    id,
    customer_id,
    full_name,
    mobile_number,
    email,
    loan_type,
    required_loan_amount,
    employment_type,
    city,
    state,
    preferred_contact_method,
    associate_name,
    associate_id,
    status,
    current_stage,
    notes
  )
  VALUES (
    v_application_id,
    v_customer_id,
    v_clean_name,
    v_clean_phone,
    v_clean_email,
    p_loan_type,
    p_required_loan_amount,
    COALESCE(p_employment_type, 'Salaried'),
    COALESCE(p_city, 'Thane'),
    COALESCE(p_state, 'Maharashtra'),
    COALESCE(p_preferred_contact_method, 'Phone Call'),
    p_associate_name,
    p_associate_id,
    'Received',
    1,
    p_notes
  );

  -- 4. Initial Audit Timeline Record
  INSERT INTO public.application_timeline (
    application_id,
    stage,
    stage_name,
    previous_status,
    new_status,
    customer_message,
    internal_note,
    updated_by
  )
  VALUES (
    v_application_id,
    1,
    'Inquiry & Eligibility Check',
    'None',
    'In Progress',
    'Your loan application file has been initialized.',
    'Application submitted via website public intake.',
    'Capitabee System'
  );

  RETURN jsonb_build_object(
    'success', true,
    'application_id', v_application_id,
    'customer_id', v_customer_id,
    'status', 'Received',
    'current_stage', 1
  );
END;
$$;

-- Grant EXECUTE permission to anon and authenticated
GRANT EXECUTE ON FUNCTION public.submit_public_loan_application TO anon, authenticated, service_role;

-- 7. AUTH USER SYNC PROFILE TRIGGER
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, email, mobile_number, customer_id, associate_code)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    NEW.raw_user_meta_data->>'mobile_number',
    NEW.raw_user_meta_data->>'customer_id',
    NEW.raw_user_meta_data->>'associate_code'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    mobile_number = EXCLUDED.mobile_number;
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 8. SECURITY HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_employee_or_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'));
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_assigned_associate(app_id TEXT) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.applications a
    LEFT JOIN public.associates asc_tbl ON a.associate_id = asc_tbl.id
    WHERE a.id = app_id AND (asc_tbl.user_id = auth.uid() OR a.assigned_employee_id = auth.uid())
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_application_owner(app_id TEXT) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.applications a
    LEFT JOIN public.profiles p ON p.id = auth.uid()
    WHERE a.id = app_id AND (a.user_id = auth.uid() OR a.customer_id = p.customer_id)
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 9. ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.associates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.callback_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.associate_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 10. POLICIES
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (id = auth.uid() OR is_employee_or_admin());
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "products_select" ON public.loan_products;
CREATE POLICY "products_select" ON public.loan_products FOR SELECT USING (is_active = TRUE OR is_employee_or_admin());
DROP POLICY IF EXISTS "products_admin" ON public.loan_products;
CREATE POLICY "products_admin" ON public.loan_products FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "associates_select" ON public.associates;
CREATE POLICY "associates_select" ON public.associates FOR SELECT USING (user_id = auth.uid() OR is_employee_or_admin());
DROP POLICY IF EXISTS "associates_admin" ON public.associates;
CREATE POLICY "associates_admin" ON public.associates FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "customers_select" ON public.customers;
CREATE POLICY "customers_select" ON public.customers FOR SELECT USING (user_id = auth.uid() OR is_employee_or_admin());
DROP POLICY IF EXISTS "customers_staff" ON public.customers;
CREATE POLICY "customers_staff" ON public.customers FOR ALL USING (is_employee_or_admin());

DROP POLICY IF EXISTS "apps_insert_public" ON public.applications;
CREATE POLICY "apps_insert_public" ON public.applications FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "apps_select" ON public.applications;
CREATE POLICY "apps_select" ON public.applications FOR SELECT USING (is_application_owner(id) OR is_assigned_associate(id) OR is_employee_or_admin());
DROP POLICY IF EXISTS "apps_update" ON public.applications;
CREATE POLICY "apps_update" ON public.applications FOR UPDATE USING (is_assigned_associate(id) OR is_employee_or_admin());

DROP POLICY IF EXISTS "stages_select" ON public.application_stages;
CREATE POLICY "stages_select" ON public.application_stages FOR SELECT USING (is_application_owner(application_id) OR is_assigned_associate(application_id) OR is_employee_or_admin());
DROP POLICY IF EXISTS "stages_update" ON public.application_stages;
CREATE POLICY "stages_update" ON public.application_stages FOR UPDATE USING (is_assigned_associate(application_id) OR is_employee_or_admin());

DROP POLICY IF EXISTS "timeline_select" ON public.application_timeline;
CREATE POLICY "timeline_select" ON public.application_timeline FOR SELECT USING (is_application_owner(application_id) OR is_assigned_associate(application_id) OR is_employee_or_admin());
DROP POLICY IF EXISTS "timeline_insert" ON public.application_timeline;
CREATE POLICY "timeline_insert" ON public.application_timeline FOR INSERT WITH CHECK (is_assigned_associate(application_id) OR is_employee_or_admin());

DROP POLICY IF EXISTS "documents_select" ON public.documents;
CREATE POLICY "documents_select" ON public.documents FOR SELECT USING (is_application_owner(application_id) OR is_assigned_associate(application_id) OR is_employee_or_admin());
DROP POLICY IF EXISTS "documents_insert" ON public.documents;
CREATE POLICY "documents_insert" ON public.documents FOR INSERT WITH CHECK (is_application_owner(application_id) OR is_assigned_associate(application_id) OR is_employee_or_admin());
DROP POLICY IF EXISTS "documents_update" ON public.documents;
CREATE POLICY "documents_update" ON public.documents FOR UPDATE USING (is_application_owner(application_id) OR is_assigned_associate(application_id) OR is_employee_or_admin());

DROP POLICY IF EXISTS "notifications_select" ON public.notifications;
CREATE POLICY "notifications_select" ON public.notifications FOR SELECT USING (user_id = auth.uid() OR is_employee_or_admin());
DROP POLICY IF EXISTS "notifications_update" ON public.notifications;
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE USING (user_id = auth.uid() OR is_employee_or_admin());

DROP POLICY IF EXISTS "messages_select" ON public.messages;
CREATE POLICY "messages_select" ON public.messages FOR SELECT USING (is_application_owner(application_id) OR is_assigned_associate(application_id) OR is_employee_or_admin());
DROP POLICY IF EXISTS "messages_insert" ON public.messages;
CREATE POLICY "messages_insert" ON public.messages FOR INSERT WITH CHECK (is_application_owner(application_id) OR is_assigned_associate(application_id) OR is_employee_or_admin());

DROP POLICY IF EXISTS "reviews_select" ON public.reviews;
CREATE POLICY "reviews_select" ON public.reviews FOR SELECT USING (status = 'Approved' OR is_employee_or_admin());
DROP POLICY IF EXISTS "reviews_insert" ON public.reviews;
CREATE POLICY "reviews_insert" ON public.reviews FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "reviews_admin" ON public.reviews;
CREATE POLICY "reviews_admin" ON public.reviews FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "contacts_insert" ON public.contact_messages;
CREATE POLICY "contacts_insert" ON public.contact_messages FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "contacts_staff" ON public.contact_messages;
CREATE POLICY "contacts_staff" ON public.contact_messages FOR ALL USING (is_employee_or_admin());

DROP POLICY IF EXISTS "callbacks_insert" ON public.callback_requests;
CREATE POLICY "callbacks_insert" ON public.callback_requests FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "callbacks_staff" ON public.callback_requests;
CREATE POLICY "callbacks_staff" ON public.callback_requests FOR ALL USING (is_employee_or_admin());

DROP POLICY IF EXISTS "targets_admin" ON public.associate_targets;
CREATE POLICY "targets_admin" ON public.associate_targets FOR ALL USING (is_admin());
DROP POLICY IF EXISTS "targets_select" ON public.associate_targets;
CREATE POLICY "targets_select" ON public.associate_targets FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.associates WHERE id = associate_targets.associate_id AND user_id = auth.uid()) OR is_admin()
);

DROP POLICY IF EXISTS "audit_admin" ON public.audit_logs;
CREATE POLICY "audit_admin" ON public.audit_logs FOR SELECT USING (is_admin());
DROP POLICY IF EXISTS "audit_insert" ON public.audit_logs;
CREATE POLICY "audit_insert" ON public.audit_logs FOR INSERT WITH CHECK (TRUE);

-- 11. SUPABASE REALTIME CONFIGURATION
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.application_stages;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.application_timeline;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 12. STORAGE BUCKET & STORAGE RLS (CUSTOMER DOCUMENTS)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'loan-documents',
  'loan-documents',
  FALSE,
  26214400, -- 25MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = FALSE,
  file_size_limit = 26214400,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

-- Storage Policies
DROP POLICY IF EXISTS "Authenticated users upload loan documents" ON storage.objects;
CREATE POLICY "Authenticated users upload loan documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'loan-documents');

DROP POLICY IF EXISTS "Authorized access to loan documents" ON storage.objects;
CREATE POLICY "Authorized access to loan documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'loan-documents' AND (
    is_employee_or_admin() OR
    (auth.uid())::text = (storage.foldername(name))[1]
  )
);
