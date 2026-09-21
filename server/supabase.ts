import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://fvpnergqltezjbgbtwtv.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabaseClient: SupabaseClient<any, 'public', any> | null = null;

export function getSupabaseServer(): SupabaseClient<any, 'public', any> | null {
  if (!supabaseClient && SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabaseClient = createClient<any>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabaseClient;
}

/**
 * Customer login with strict customer access validation and Supabase Auth identity matching.
 */
export async function customerLogin(cleanId: string, cleanPass: string) {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return {
      status: 503,
      data: {
        success: false,
        error: 'Capitabee Customer Authentication Service is temporarily unavailable. Please retry or contact support at +91 8010886625.',
      },
    };
  }

  // 1. Secure lookup of customer by customer_id in customers table
  const { data: customerRecord, error: custErr } = await supabase
    .from('customers')
    .select('*')
    .ilike('customer_id', cleanId)
    .maybeSingle();

  if (custErr || !customerRecord) {
    return {
      status: 401,
      data: {
        success: false,
        error: 'Invalid Customer ID or Password. Credentials must be issued by an authorized Capitabee Loan Associate.',
      },
    };
  }

  // 2. Customer Access Validation (Requirement 3)
  // Verify: customers.auth_user_id IS NOT NULL AND customers.portal_access_enabled = true
  if (!customerRecord.auth_user_id || customerRecord.portal_access_enabled !== true) {
    return {
      status: 403,
      data: {
        success: false,
        error: 'Customer Portal access is currently inactive. Please contact Capitabee Financial Services.',
      },
    };
  }

  // 3. Resolve linked Supabase Auth identity candidates
  const candidateEmails: string[] = [];
  if (customerRecord.email && customerRecord.email.includes('@')) {
    candidateEmails.push(customerRecord.email.trim().toLowerCase());
  }
  candidateEmails.push(`${customerRecord.customer_id.toLowerCase()}@customer.capitabee.com`);
  candidateEmails.push(`${customerRecord.customer_id.toLowerCase()}@capitabee.com`);
  if (customerRecord.mobile_number) {
    const cleanPhone = customerRecord.mobile_number.replace(/[^0-9]/g, '');
    if (cleanPhone) {
      candidateEmails.push(`${cleanPhone}@customer.capitabee.com`);
    }
  }

  let authData: any = null;
  for (const email of candidateEmails) {
    const authRes = await supabase.auth.signInWithPassword({
      email,
      password: cleanPass,
    });

    if (authRes.data?.session && authRes.data?.user) {
      if (customerRecord.auth_user_id && authRes.data.user.id !== customerRecord.auth_user_id) {
        continue;
      }
      authData = authRes.data;
      break;
    }
  }

  if (!authData?.session || !authData?.user) {
    return {
      status: 401,
      data: {
        success: false,
        error: 'Invalid Customer ID or Password. Credentials must be issued by an authorized Capitabee Loan Associate.',
      },
    };
  }

  // Update portal_last_login_at
  try {
    await supabase
      .from('customers')
      .update({ portal_last_login_at: new Date().toISOString() })
      .eq('id', customerRecord.id);
  } catch {
    // non-blocking
  }

  // 4. Customer Data Isolation:
  // applications.customer_id = customers.customer_id
  // (Do NOT join: applications.customer_id = customers.id)
  const { data: appRows } = await supabase
    .from('applications')
    .select('*')
    .eq('customer_id', customerRecord.customer_id)
    .order('created_at', { ascending: false });

  const apps = appRows || [];
  const primaryApp = apps.length > 0 ? apps[0] : null;

  let stages: any[] = [];
  let documents: any[] = [];
  let timeline: any[] = [];
  let messages: any[] = [];
  let notifications: any[] = [];

  if (primaryApp) {
    const [stagesRes, docsRes, timeRes, msgsRes, notifsRes] = await Promise.all([
      supabase
        .from('application_stages')
        .select('*')
        .eq('application_id', primaryApp.id)
        .order('stage_number', { ascending: true }),
      supabase
        .from('documents')
        .select('*')
        .eq('application_id', primaryApp.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('application_timeline')
        .select('id, application_id, stage, stage_name, previous_status, new_status, customer_message, updated_by, created_at')
        .eq('application_id', primaryApp.id)
        .order('stage', { ascending: true }),
      supabase
        .from('messages')
        .select('*')
        .eq('application_id', primaryApp.id)
        .order('created_at', { ascending: true }),
      supabase
        .from('notifications')
        .select('*')
        .or(`customer_id.eq.${customerRecord.customer_id},application_id.eq.${primaryApp.id}`)
        .order('created_at', { ascending: false }),
    ]);

    stages = stagesRes.data || [];
    documents = docsRes.data || [];
    timeline = timeRes.data || [];
    messages = msgsRes.data || [];
    notifications = notifsRes.data || [];
  }

  const customerPayload = {
    customerId: customerRecord.customer_id,
    fullName: customerRecord.full_name,
    mobileNumber: customerRecord.mobile_number,
    email: customerRecord.email || '',
    applicationId: primaryApp?.id || '',
    loanType: primaryApp?.loan_type || 'Loan Assistance',
    requestedAmount: primaryApp ? Number(primaryApp.required_loan_amount) : 0,
    associateName: primaryApp?.associate_name,
    associateId: primaryApp?.associate_id,
    assignedLoanOfficer: primaryApp?.assigned_officer || 'Capitabee Loan Processing Desk',
    currentStage: primaryApp?.current_stage || 1,
    applicationStatus: primaryApp?.status || 'Received',
    createdAt: customerRecord.created_at || primaryApp?.created_at || new Date().toISOString(),
  };

  return {
    status: 200,
    data: {
      success: true,
      token: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      customer: customerPayload,
      applications: apps.map((a: any) => ({
        id: a.id,
        customerId: a.customer_id,
        fullName: a.full_name,
        mobileNumber: a.mobile_number,
        email: a.email,
        loanType: a.loan_type,
        requiredLoanAmount: Number(a.required_loan_amount),
        employmentType: a.employment_type,
        city: a.city,
        state: a.state,
        preferredContactMethod: a.preferred_contact_method,
        associateName: a.associate_name,
        assignedOfficer: a.assigned_officer,
        status: a.status,
        currentStage: a.current_stage,
        createdAt: a.created_at,
      })),
      data: {
        customer: customerPayload,
        application: primaryApp
          ? {
              id: primaryApp.id,
              customerId: primaryApp.customer_id,
              fullName: primaryApp.full_name,
              mobileNumber: primaryApp.mobile_number,
              email: primaryApp.email,
              loanType: primaryApp.loan_type,
              requiredLoanAmount: Number(primaryApp.required_loan_amount),
              employmentType: primaryApp.employment_type,
              city: primaryApp.city,
              state: primaryApp.state,
              preferredContactMethod: primaryApp.preferred_contact_method,
              associateName: primaryApp.associate_name,
              assignedOfficer: primaryApp.assigned_officer,
              status: primaryApp.status,
              currentStage: primaryApp.current_stage,
              createdAt: primaryApp.created_at,
              stages,
            }
          : null,
        stages,
        documents,
        messages,
        notifications,
        timeline,
      },
    },
  };
}

/**
 * Authenticate customer token and return linked customer record
 */
export async function getAuthenticatedCustomer(token: string) {
  if (!token) return null;
  const supabase = getSupabaseServer();
  if (!supabase) return null;

  try {
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) return null;

    const { data: customer, error: custErr } = await supabase
      .from('customers')
      .select('*')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (custErr || !customer || !customer.auth_user_id || customer.portal_access_enabled !== true) {
      return null;
    }

    return { user, customer };
  } catch {
    return null;
  }
}

/**
 * Customer dashboard data loader with strict data isolation
 */
export async function getCustomerDashboard(customer: any, requestedAppId?: string) {
  const supabase = getSupabaseServer();
  if (!supabase) return null;

  // Load only applications belonging to this customer
  const { data: apps } = await supabase
    .from('applications')
    .select('*')
    .eq('customer_id', customer.customer_id)
    .order('created_at', { ascending: false });

  const applications = apps || [];
  const selectedAppId = requestedAppId || (applications.length > 0 ? applications[0].id : null);
  const activeApp = applications.find((a) => a.id === selectedAppId) || applications[0] || null;

  let stages: any[] = [];
  let documents: any[] = [];
  let timeline: any[] = [];
  let messages: any[] = [];
  let notifications: any[] = [];

  if (activeApp) {
    const [stagesRes, docsRes, timeRes, msgsRes, notifsRes] = await Promise.all([
      supabase
        .from('application_stages')
        .select('*')
        .eq('application_id', activeApp.id)
        .order('stage_number', { ascending: true }),
      supabase
        .from('documents')
        .select('*')
        .eq('application_id', activeApp.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('application_timeline')
        .select('id, application_id, stage, stage_name, previous_status, new_status, customer_message, updated_by, created_at')
        .eq('application_id', activeApp.id)
        .order('stage', { ascending: true }),
      supabase
        .from('messages')
        .select('*')
        .eq('application_id', activeApp.id)
        .order('created_at', { ascending: true }),
      supabase
        .from('notifications')
        .select('*')
        .or(`customer_id.eq.${customer.customer_id},application_id.eq.${activeApp.id}`)
        .order('created_at', { ascending: false }),
    ]);

    stages = stagesRes.data || [];
    documents = docsRes.data || [];
    timeline = timeRes.data || [];
    messages = msgsRes.data || [];
    notifications = notifsRes.data || [];
  }

  const customerPayload = {
    customerId: customer.customer_id,
    fullName: customer.full_name,
    mobileNumber: customer.mobile_number,
    email: customer.email || '',
    applicationId: activeApp?.id || '',
    loanType: activeApp?.loan_type || 'Loan Assistance',
    requestedAmount: activeApp ? Number(activeApp.required_loan_amount) : 0,
    associateName: activeApp?.associate_name,
    assignedLoanOfficer: activeApp?.assigned_officer || 'Capitabee Loan Processing Desk',
    currentStage: activeApp?.current_stage || 1,
    applicationStatus: activeApp?.status || 'Received',
    createdAt: customer.created_at || new Date().toISOString(),
  };

  return {
    customer: customerPayload,
    applications,
    application: activeApp ? { ...activeApp, stages } : null,
    documents,
    messages,
    notifications,
    timeline,
  };
}
