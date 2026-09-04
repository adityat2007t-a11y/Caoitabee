-- ============================================================================
-- CAPITABEE SECURE PUBLIC INTAKE FUNCTION & ATOMIC LINKING MIGRATION
-- Format: APP-YYYY-XXXXXX & CUST-YYYY-XXXXXX
-- ============================================================================

-- 1. SEQUENCES FOR ATOMIC, COLLISION-SAFE ID GENERATION
CREATE SEQUENCE IF NOT EXISTS public.seq_application_number START WITH 1;
CREATE SEQUENCE IF NOT EXISTS public.seq_customer_number START WITH 1;

-- 2. AUTOMATED 12-STAGE PIPELINE TRIGGER FUNCTION (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.create_default_12_stages()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  stage_names TEXT[] := ARRAY[
    'Inquiry & Eligibility Check',
    'Application Form & File Login',
    'Document Collection & Verification',
    'Multi-Bank Evaluation & Login',
    'Bank Credit & Risk Assessment',
    'In-Principle Sanction Letter',
    'Legal Vetting & Title Search',
    'Technical Valuation & Property Inspection',
    'Final Sanction & Loan Offer',
    'One-Time Condition (OTC) Clearance',
    'Loan Agreement Signing & Disbursement',
    'Post-Disbursement Documentation (PDD)'
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
  IF EXISTS (SELECT 1 FROM public.application_stages WHERE application_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  FOR i IN 1..12 LOOP
    IF i < NEW.current_stage THEN 
      st_status := 'Completed';
    ELSIF i = NEW.current_stage THEN 
      st_status := 'In Progress';
    ELSE 
      st_status := 'Pending'; 
    END IF;

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

-- 3. AUTOMATED CUSTOMER PROVISIONING TRIGGER (SECURITY DEFINER SAFETY NET)
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
  IF NEW.customer_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.customers WHERE customer_id = NEW.customer_id) THEN
    RETURN NEW;
  END IF;

  v_clean_phone := REGEXP_REPLACE(TRIM(NEW.mobile_number), '[^0-9]', '', 'g');
  IF LENGTH(v_clean_phone) > 10 AND LEFT(v_clean_phone, 2) = '91' THEN
    v_clean_phone := SUBSTRING(v_clean_phone FROM 3);
  ELSIF LENGTH(v_clean_phone) = 11 AND LEFT(v_clean_phone, 1) = '0' THEN
    v_clean_phone := SUBSTRING(v_clean_phone FROM 2);
  END IF;

  -- Check existing customer
  SELECT customer_id, id INTO v_cust_id, v_cust_uuid
  FROM public.customers
  WHERE (LENGTH(v_clean_phone) = 10 AND (mobile_number = v_clean_phone OR mobile_number = ('+91' || v_clean_phone) OR REGEXP_REPLACE(mobile_number, '[^0-9]', '', 'g') = v_clean_phone))
     OR (NEW.email IS NOT NULL AND NULLIF(TRIM(NEW.email), '') IS NOT NULL AND LOWER(email) = LOWER(TRIM(NEW.email)))
  ORDER BY created_at ASC
  LIMIT 1;

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

  NEW.customer_id := v_cust_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ensure_customer_for_application ON public.applications;
CREATE TRIGGER trg_ensure_customer_for_application
BEFORE INSERT ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.ensure_customer_for_application();

-- 4. SECURE PUBLIC INTAKE RPC FUNCTION (SECURITY DEFINER)
-- Standard format: APP-YYYY-XXXXXX and CUST-YYYY-XXXXXX
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

  -- 1. Find or create Customer record
  SELECT id, customer_id INTO v_customer_uuid, v_customer_id
  FROM public.customers
  WHERE (LENGTH(v_clean_phone) = 10 AND (mobile_number = v_clean_phone OR mobile_number = ('+91' || v_clean_phone) OR REGEXP_REPLACE(mobile_number, '[^0-9]', '', 'g') = v_clean_phone))
     OR (v_clean_email IS NOT NULL AND LOWER(email) = v_clean_email)
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_customer_id IS NULL THEN
    -- Generate collision-safe Customer ID (CUST-YYYY-XXXXXX)
    LOOP
      v_seq_cust := nextval('public.seq_customer_number');
      v_customer_id := 'CUST-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(v_seq_cust::TEXT, 6, '0');
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.customers WHERE customer_id = v_customer_id);
    END LOOP;

    v_customer_uuid := gen_random_uuid();

    INSERT INTO public.customers (id, customer_id, full_name, mobile_number, email)
    VALUES (v_customer_uuid, v_customer_id, v_clean_name, v_clean_phone, v_clean_email);
  ELSE
    -- Keep customer contact information fresh
    UPDATE public.customers
    SET full_name = COALESCE(NULLIF(v_clean_name, ''), full_name),
        email = COALESCE(v_clean_email, email),
        updated_at = NOW()
    WHERE id = v_customer_uuid;
  END IF;

  -- 2. Generate collision-safe Application ID (APP-YYYY-XXXXXX)
  LOOP
    v_seq_app := nextval('public.seq_application_number');
    v_application_id := 'APP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(v_seq_app::TEXT, 6, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.applications WHERE id = v_application_id);
  END LOOP;

  -- 3. Insert Application (applications.customer_id is set to customers.customer_id)
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

  -- 5. Return sanitized response to public website (No sensitive internal data)
  RETURN jsonb_build_object(
    'success', true,
    'application_id', v_application_id,
    'customer_id', v_customer_id,
    'status', 'Received',
    'current_stage', 1
  );
END;
$$;

-- 5. PERMISSIONS & RLS POLICIES
GRANT USAGE, SELECT ON SEQUENCE public.seq_application_number TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE public.seq_customer_number TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.submit_public_loan_application TO anon, authenticated, service_role;

-- Ensure RLS is active on tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_timeline ENABLE ROW LEVEL SECURITY;

-- Customer RLS: Anon cannot SELECT, UPDATE, or DELETE
DROP POLICY IF EXISTS "customers_select" ON public.customers;
CREATE POLICY "customers_select" ON public.customers FOR SELECT 
USING (user_id = auth.uid() OR is_employee_or_admin());

DROP POLICY IF EXISTS "customers_staff" ON public.customers;
CREATE POLICY "customers_staff" ON public.customers FOR ALL 
USING (is_employee_or_admin());

-- Application RLS: Anon cannot SELECT, UPDATE, or DELETE
DROP POLICY IF EXISTS "apps_select" ON public.applications;
CREATE POLICY "apps_select" ON public.applications FOR SELECT 
USING (is_application_owner(id) OR is_assigned_associate(id) OR is_employee_or_admin());

DROP POLICY IF EXISTS "apps_update" ON public.applications;
CREATE POLICY "apps_update" ON public.applications FOR UPDATE 
USING (is_assigned_associate(id) OR is_employee_or_admin());
