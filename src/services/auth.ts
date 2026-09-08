import { AuthCredentials, AuthResponse, CustomerUser, CustomerDashboardData, DocumentRecord, ChatMessage, LoanApplication } from '../types';
import { ApiResponse, api } from './api';
import { supabaseService } from './supabaseService';
import { supabase } from '../config/supabase';

// Configurable base URL for external Customer Portal / Auth API
const envBaseUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_AUTH_API_BASE_URL : undefined;
const AUTH_API_BASE_URL = (envBaseUrl || '/api/customer').replace(/\/+$/, '');

const STORAGE_KEYS = {
  TOKEN: 'capitabee_auth_token',
  USER: 'capitabee_auth_user',
  SELECTED_APP: 'capitabee_selected_app_id',
};

class AuthService {
  private token: string | null = null;
  private currentUser: CustomerUser | null = null;

  constructor() {
    // Safely hydrate stored session on client load
    if (typeof window !== 'undefined') {
      try {
        const storedToken = sessionStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedUser = sessionStorage.getItem(STORAGE_KEYS.USER) || localStorage.getItem(STORAGE_KEYS.USER);
        const currentCust = sessionStorage.getItem('current_customer');

        if (storedToken) {
          this.token = storedToken;
        }
        if (storedUser) {
          this.currentUser = JSON.parse(storedUser);
        } else if (currentCust) {
          this.hydrateFromCurrentCustomer(currentCust);
        }
      } catch {
        this.token = null;
        this.currentUser = null;
      }
    }
  }

  private hydrateFromCurrentCustomer(raw: string | null) {
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      this.token = this.token || 'supabase-direct-authenticated';
      this.currentUser = {
        customerId: parsed.customer_id || parsed.customerId || parsed.id || '',
        fullName: parsed.full_name || parsed.fullName || parsed.name || 'Valued Customer',
        email: parsed.email || '',
        mobileNumber: parsed.mobile_number || parsed.phone || parsed.mobile || '',
        loanType: parsed.loan_type || parsed.loanType || 'Loan Assistance',
        applicationId: parsed.application_id || (typeof parsed.id === 'string' && parsed.id.startsWith('APP-') ? parsed.id : ''),
        currentStage: parsed.current_stage || parsed.currentStage || 1,
        applicationStatus: parsed.status || 'Received',
        requestedAmount: Number(parsed.required_loan_amount || parsed.loan_amount || parsed.requiredLoanAmount || 0),
        createdAt: parsed.created_at || new Date().toISOString(),
      };
    } catch {
      // ignore JSON parse error
    }
  }

  /**
   * Returns current authenticated user or null.
   */
  getCurrentUser(): CustomerUser | null {
    if (!this.currentUser && typeof window !== 'undefined') {
      const currentCust = sessionStorage.getItem('current_customer');
      if (currentCust) {
        this.hydrateFromCurrentCustomer(currentCust);
      }
    }
    return this.currentUser;
  }

  /**
   * Returns active authentication token or null.
   */
  getAuthToken(): string | null {
    return this.token;
  }

  /**
   * Checks if user has an active session token.
   */
  isAuthenticated(): boolean {
    if (typeof window !== 'undefined' && sessionStorage.getItem('current_customer')) {
      return true;
    }
    return Boolean(this.token || this.currentUser);
  }

  /**
   * Authenticates against the REAL Supabase Database & CRM Backend.
   * Never accepts fake credentials or creates mock sessions.
   */
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    const cleanId = credentials.customerId.trim();
    const cleanPassword = credentials.password.trim();

    if (!cleanId || !cleanPassword) {
      return {
        success: false,
        error: 'Please enter both your Customer ID / Email and Password.',
      };
    }

    // 1. Try Direct Supabase Auth
    if (supabaseService.isConfigured()) {
      const supaRes = await supabaseService.login(cleanId, cleanPassword);
      if (supaRes.success && supaRes.customer) {
        this.token = supaRes.token || 'supabase-authenticated';
        this.currentUser = supaRes.customer;

        if (typeof window !== 'undefined') {
          sessionStorage.setItem(STORAGE_KEYS.TOKEN, this.token);
          sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(supaRes.customer));
          if (supaRes.customer.applicationId) {
            sessionStorage.setItem(STORAGE_KEYS.SELECTED_APP, supaRes.customer.applicationId);
          }
        }

        return {
          success: true,
          token: this.token,
          customer: supaRes.customer,
        };
      }

      // Return Supabase auth / customer error directly without fallback to in-memory store
      return {
        success: false,
        error: supaRes.error || 'Invalid Customer ID or Password. Credentials must be issued by an authorized Capitabee Loan Associate (+91 8010886625).',
      };
    }

    return {
      success: false,
      error: 'Capitabee Customer Authentication is temporarily unavailable. Please retry or contact support at +91 8010886625.',
    };
  }

  /**
   * Refreshes the session using the Bearer token or Supabase Auth.
   */
  async refreshSession(): Promise<AuthResponse | null> {
    if (supabase) {
      const session = await supabaseService.getSession();
      if (session?.user) {
        const userRes = await supabaseService.buildCustomerUserFromSession(session.user, session.access_token);
        if (userRes.customer) {
          this.currentUser = userRes.customer;
          this.token = session.access_token;
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userRes.customer));
          }
          return {
            success: true,
            token: this.token,
            customer: userRes.customer,
          };
        }
      }
    }

    if (!this.token) return null;

    try {
      const res = await fetch(`${AUTH_API_BASE_URL}/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/json',
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data || !data.success) {
        this.logout();
        return null;
      }

      this.currentUser = data.customer;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.customer));
      }

      return {
        success: true,
        token: this.token,
        customer: data.customer,
      };
    } catch {
      return null;
    }
  }

  /**
   * Fetches customer's applications list (for multi-application switching)
   */
  async getCustomerApplications(): Promise<LoanApplication[]> {
    if (supabase) {
      const session = await supabaseService.getSession();
      const userId = session?.user?.id;
      if (userId) {
        return await supabaseService.getCustomerApplications(userId, this.currentUser?.customerId);
      }
    }
    return [];
  }

  /**
   * Fetches the authenticated customer's real dashboard record directly from Supabase.
   */
  async getDashboardData(selectedAppId?: string): Promise<{
    success: boolean;
    data?: CustomerDashboardData;
    error?: string;
    isNotConnected?: boolean;
    applications?: LoanApplication[];
  }> {
    if (!this.isAuthenticated()) {
      return {
        success: false,
        error: 'Not authenticated. Please log in.',
      };
    }

    // 1. Direct Supabase Query Flow
    if (supabase) {
      try {
        const session = await supabaseService.getSession();
        const userId = session?.user?.id;
        const customer = this.getCurrentUser();

        if (userId || customer) {
          // Fetch all customer applications
          const applications = (userId || customer?.customerId)
            ? await supabaseService.getCustomerApplications(userId || '', customer?.customerId)
            : [];

          // Determine active application
          const activeAppId =
            selectedAppId ||
            (typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEYS.SELECTED_APP) : null) ||
            customer?.applicationId ||
            (applications.length > 0 ? applications[0].id : null);

          let activeApp: LoanApplication | null = null;
          if (activeAppId) {
            activeApp = applications.find((a) => a.id === activeAppId) || null;
            if (!activeApp) {
              const appRes = await api.getApplication(activeAppId);
              if (appRes.data) activeApp = appRes.data;
            }
          }

          // Fallback: If current_customer stored in sessionStorage is an application record
          if (!activeApp && typeof window !== 'undefined') {
            try {
              const rawCust = sessionStorage.getItem('current_customer');
              if (rawCust) {
                const parsed = JSON.parse(rawCust);
                if (parsed.id && (parsed.required_loan_amount !== undefined || parsed.loan_type !== undefined || String(parsed.id).startsWith('APP-'))) {
                  activeApp = {
                    id: parsed.id,
                    customerId: parsed.customer_id || customer?.customerId || '',
                    fullName: parsed.full_name || customer?.fullName || 'Customer',
                    mobileNumber: parsed.mobile_number || customer?.mobileNumber || '',
                    email: parsed.email || customer?.email || '',
                    loanType: parsed.loan_type || customer?.loanType || 'Loan Assistance',
                    requiredLoanAmount: Number(parsed.required_loan_amount || parsed.loan_amount || 0),
                    employmentType: parsed.employment_type || 'Salaried',
                    city: parsed.city || '',
                    state: parsed.state || '',
                    preferredContactMethod: parsed.preferred_contact_method || 'Phone',
                    associateId: parsed.associate_id,
                    associateName: parsed.associate_name,
                    assignedOfficer: parsed.assigned_officer || parsed.assigned_employee_name,
                    status: parsed.status || 'Received',
                    currentStage: parsed.current_stage || 1,
                    createdAt: parsed.created_at || new Date().toISOString(),
                    updatedAt: parsed.updated_at,
                    notes: parsed.notes,
                    stages: [],
                  };
                }
              }
            } catch {}
          }

          if (activeAppId && typeof window !== 'undefined') {
            sessionStorage.setItem(STORAGE_KEYS.SELECTED_APP, activeAppId);
          }

          const appIdToQuery = activeAppId || '';

          // Concurrently fetch stages, documents, messages, timeline, notifications
          const [stages, documents, messages, timeline, notifications] = await Promise.all([
            appIdToQuery ? supabaseService.getApplicationStages(appIdToQuery) : Promise.resolve([]),
            appIdToQuery ? supabaseService.getDocuments(appIdToQuery) : Promise.resolve([]),
            appIdToQuery ? supabaseService.getMessages(appIdToQuery) : Promise.resolve([]),
            appIdToQuery ? supabaseService.getApplicationTimeline(appIdToQuery) : Promise.resolve([]),
            supabaseService.getNotifications(appIdToQuery || undefined, userId),
          ]);

          const finalApp: LoanApplication = activeApp || {
            id: '',
            customerId: customer?.customerId || '',
            fullName: customer?.fullName || 'Valued Customer',
            mobileNumber: customer?.mobileNumber || '',
            loanType: customer?.loanType || 'Loan Assistance',
            requiredLoanAmount: customer?.requestedAmount || 0,
            status: 'Received',
            currentStage: 1,
            createdAt: customer?.createdAt || new Date().toISOString(),
            stages: stages,
          };

          finalApp.stages = stages;

          const activeCustomerUser: CustomerUser = customer || {
            customerId: `CUST-${userId ? userId.slice(0, 8).toUpperCase() : 'USER'}`,
            fullName: finalApp.fullName,
            mobileNumber: finalApp.mobileNumber,
            email: finalApp.email,
            applicationId: finalApp.id,
            loanType: finalApp.loanType,
            requestedAmount: finalApp.requiredLoanAmount,
            associateName: finalApp.associateName,
            assignedLoanOfficer: finalApp.assignedOfficer || 'Capitabee Loan Processing Desk',
            currentStage: finalApp.currentStage,
            applicationStatus: finalApp.status,
            createdAt: finalApp.createdAt,
          };

          return {
            success: true,
            applications,
            data: {
              customer: activeCustomerUser,
              application: finalApp,
              documents,
              messages,
              notifications,
              timeline,
            },
          };
        }
      } catch (err: any) {
        console.error('Database error fetching customer dashboard:', err);
        return {
          success: false,
          error: err?.message || 'Unable to retrieve customer records from Capitabee database.',
        };
      }
    }

    return {
      success: false,
      isNotConnected: true,
      error: 'Customer database service is temporarily unavailable. Please retry or contact your loan associate at +91 8010886625.',
    };
  }

  /**
   * Request password recovery.
   */
  async requestPasswordReset(customerId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const cleanId = customerId.trim();
    if (!cleanId) {
      return {
        success: false,
        error: 'Please enter your Customer ID to request password recovery.',
      };
    }

    try {
      const res = await fetch(`${AUTH_API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: cleanId }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        return {
          success: false,
          error: data?.error || 'Password recovery service is not connected yet. Please contact your Capitabee loan associate directly at +91 8010886625.',
        };
      }

      return {
        success: true,
        message: data.message || 'Password reset instructions have been dispatched by your loan associate.',
      };
    } catch {
      return {
        success: false,
        error: 'Password recovery service is not connected yet.',
      };
    }
  }

  /**
   * Uploads a document to the customer's real record in Supabase.
   */
  async uploadDocument(payload: {
    applicationId: string;
    documentType: string;
    fileName: string;
    category?: 'KYC' | 'Income' | 'Property' | 'Business' | 'Financials' | 'Other';
    file?: File;
  }): Promise<ApiResponse<DocumentRecord>> {
    if (supabase && payload.file) {
      const res = await supabaseService.uploadDocument({
        applicationId: payload.applicationId,
        customerId: this.currentUser?.customerId,
        documentType: payload.documentType,
        category: payload.category || 'Income',
        file: payload.file,
      });

      if (res.success && res.document) {
        return { success: true, data: res.document };
      }
      if (res.error) {
        return { error: res.error };
      }
    }

    try {
      const res = await fetch(`${AUTH_API_BASE_URL}/documents/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        return { error: data?.error || 'Document storage is not connected yet.' };
      }
      return data;
    } catch {
      return { error: 'Document storage is not connected yet.' };
    }
  }

  /**
   * Sends a message to the loan desk from authenticated customer.
   */
  async sendMessage(message: string, applicationId?: string): Promise<ApiResponse<ChatMessage>> {
    const targetAppId = applicationId || this.currentUser?.applicationId;
    if (!targetAppId) {
      return { error: 'Application ID is required to send message.' };
    }

    if (supabase) {
      const session = await supabaseService.getSession();
      const res = await supabaseService.sendMessage({
        applicationId: targetAppId,
        message,
        senderName: this.currentUser?.fullName || 'Customer',
        senderUserId: session?.user?.id,
      });

      if (res.success && res.message) {
        return { success: true, data: res.message };
      }
      if (res.error) {
        return { error: res.error };
      }
    }

    try {
      const res = await fetch(`${AUTH_API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        return { error: data?.error || 'Messaging service is not connected yet.' };
      }
      return data;
    } catch {
      return { error: 'Messaging service is not connected yet.' };
    }
  }

  /**
   * Terminates active session.
   */
  async logout(): Promise<void> {
    await supabaseService.logout();

    if (this.token) {
      try {
        await fetch(`${AUTH_API_BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }).catch(() => {});
      } catch {
        // Ignore network errors on logout
      }
    }

    this.token = null;
    this.currentUser = null;

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('current_customer');
      sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
      sessionStorage.removeItem(STORAGE_KEYS.USER);
      sessionStorage.removeItem(STORAGE_KEYS.SELECTED_APP);
      localStorage.removeItem('current_customer');
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.SELECTED_APP);
    }
  }
}

export const authService = new AuthService();
