-- ==============================================================================
-- FIX FOR 42501 ERROR ON APPLICATION SUBMISSION (public.application_stages)
-- Execute this in the Supabase SQL Editor for project fvpnergqltezjbgbtwtv
-- ==============================================================================

-- 1. Create or replace the stage initialization trigger function as SECURITY DEFINER
-- with an explicitly locked search_path. This allows the trigger to generate the
-- 12 workflow stages during an anonymous loan application INSERT without needing
-- to grant broad public INSERT privileges on public.application_stages.

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
  -- Idempotency check: Skip if stages already exist for this application ID
  IF EXISTS (SELECT 1 FROM public.application_stages WHERE application_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- Create all 12 stages with stage-appropriate initial status
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

-- 2. Re-attach the trigger to public.applications
DROP TRIGGER IF EXISTS trg_create_application_stages ON public.applications;
CREATE TRIGGER trg_create_application_stages
AFTER INSERT ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.create_default_12_stages();
