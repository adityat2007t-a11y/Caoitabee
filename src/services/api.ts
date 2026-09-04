import { LoanApplication, ReviewRecord, CustomerUser, DocumentRecord, ChatMessage, CallbackRequest, ContactMessage } from '../types';
import { supabase } from '../config/supabase';
import { supabaseService } from './supabaseService';

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
  applicationId?: string;
  notifications?: {
    whatsapp: string;
    sms: string;
  };
}

export const api = {
  // Direct Supabase Application submission without requiring SELECT permissions
  async submitApplication(payload: {
    fullName: string;
    mobileNumber: string;
    email?: string;
    loanType: string;
    requiredLoanAmount: number;
    employmentType?: string;
    city?: string;
    state?: string;
    preferredContactMethod?: string;
    associateName?: string;
  }): Promise<ApiResponse<LoanApplication>> {
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase client is not initialized.',
      };
    }

    const cleanPhone = payload.mobileNumber.trim();
    const cleanName = payload.fullName.trim();
    const cleanEmail = payload.email?.trim() || null;
    const cleanLoanType = payload.loanType.trim();
    const cleanAmount = Number(payload.requiredLoanAmount);
    const cleanEmp = payload.employmentType?.trim() || 'Salaried';
    const cleanCity = payload.city?.trim() || 'Thane';
    const cleanState = payload.state?.trim() || 'Maharashtra';
    const cleanContactMethod = payload.preferredContactMethod || 'Phone Call';
    const cleanAssocName = payload.associateName?.trim() || null;

    if (!cleanName || !cleanPhone) {
      return {
        success: false,
        error: 'Full name and mobile number are required.',
      };
    }

    try {
      // Authoritative intake path: call SECURITY DEFINER RPC
      const { data: rpcData, error: rpcError } = await supabase.rpc('submit_public_loan_application', {
        p_full_name: cleanName,
        p_mobile_number: cleanPhone,
        p_email: cleanEmail,
        p_loan_type: cleanLoanType,
        p_required_loan_amount: cleanAmount,
        p_employment_type: cleanEmp,
        p_city: cleanCity,
        p_state: cleanState,
        p_preferred_contact_method: cleanContactMethod,
        p_associate_name: cleanAssocName,
        p_associate_id: null,
        p_notes: 'Submitted via Capitabee public website intake modal',
      });

      if (rpcError) {
        console.error('Supabase submit_public_loan_application RPC error:', rpcError);
        return {
          success: false,
          error: `Intake error [${rpcError.code}]: ${rpcError.message}`,
        };
      }

      if (!rpcData || !rpcData.success) {
        return {
          success: false,
          error: rpcData?.error || 'Unable to register loan application at this time.',
        };
      }

      const appId = rpcData.application_id;
      const custId = rpcData.customer_id;

      return {
        success: true,
        applicationId: appId,
        message: 'Your loan application has been received successfully.',
        data: {
          id: appId,
          customerId: custId,
          fullName: cleanName,
          mobileNumber: cleanPhone,
          email: cleanEmail || undefined,
          loanType: cleanLoanType,
          requiredLoanAmount: cleanAmount,
          employmentType: cleanEmp as any,
          city: cleanCity,
          state: cleanState,
          preferredContactMethod: cleanContactMethod as any,
          associateName: cleanAssocName || undefined,
          status: (rpcData.status as any) || 'Received',
          currentStage: rpcData.current_stage || 1,
          createdAt: new Date().toISOString(),
          stages: [],
        },
      };
    } catch (err: any) {
      console.error('Exception during public loan application submission:', err);
      return {
        success: false,
        error: err.message || 'Network exception while connecting to Capitabee database.',
      };
    }
  },

  // Fetch application details
  async getApplication(id: string): Promise<ApiResponse<LoanApplication>> {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          const stages = await supabaseService.getApplicationStages(id);
          return {
            success: true,
            data: {
              id: data.id,
              customerId: data.customer_id,
              fullName: data.full_name,
              mobileNumber: data.mobile_number,
              email: data.email,
              loanType: data.loan_type,
              requiredLoanAmount: Number(data.required_loan_amount),
              employmentType: data.employment_type,
              city: data.city,
              state: data.state,
              preferredContactMethod: data.preferred_contact_method,
              associateName: data.associate_name,
              assignedOfficer: data.assigned_officer,
              status: data.status,
              currentStage: data.current_stage,
              createdAt: data.created_at,
              stages,
            },
          };
        }
      }

      const res = await fetch(`/api/applications/${encodeURIComponent(id)}`);
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || 'Application record not found.' };
      }
      return data;
    } catch (err) {
      return { error: 'Application tracking service is temporarily unavailable.' };
    }
  },

  // Submit Review
  async submitReview(payload: {
    customerName: string;
    rating: number;
    reviewText: string;
    loanType: string;
    city?: string;
    photoUrl?: string;
  }): Promise<ApiResponse<ReviewRecord>> {
    if (supabase) {
      const res = await supabaseService.submitReview(payload);
      if (res.success) {
        return {
          success: true,
          message: res.message || 'Review submitted successfully.',
        };
      }
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || 'Review service is not connected yet.' };
      }
      return data;
    } catch (err) {
      return { error: 'Review service is not connected yet.' };
    }
  },

  // Fetch Approved Reviews
  async getApprovedReviews(): Promise<ReviewRecord[]> {
    if (supabase) {
      const list = await supabaseService.getApprovedReviews();
      if (list && list.length > 0) {
        return list;
      }
    }

    try {
      const res = await fetch('/api/reviews/approved');
      if (!res.ok) return [];
      const data = await res.json();
      return data.reviews || [];
    } catch {
      return [];
    }
  },

  // Contact Form
  async submitContact(payload: {
    fullName: string;
    email: string;
    phone: string;
    subject?: string;
    message: string;
  }): Promise<ApiResponse<ContactMessage>> {
    if (supabase) {
      const res = await supabaseService.submitContact(payload);
      if (res.success) {
        return {
          success: true,
          message: res.message,
        };
      }
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Contact service is not connected yet.' };
      return data;
    } catch {
      return { error: 'Contact service is not connected yet.' };
    }
  },

  // Callback Form
  async submitCallback(payload: {
    fullName: string;
    mobileNumber: string;
    email?: string;
    loanType: string;
    amount?: string;
    city?: string;
    state?: string;
    associateName?: string;
    message?: string;
  }): Promise<ApiResponse<CallbackRequest>> {
    if (supabase) {
      const res = await supabaseService.submitCallback(payload);
      if (res.success) {
        return {
          success: true,
          message: res.message,
        };
      }
    }

    try {
      const res = await fetch('/api/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Callback service is not connected yet.' };
      return data;
    } catch {
      return { error: 'Callback service is not connected yet.' };
    }
  },

  // Customer Login
  async customerLogin(customerId: string, password: string): Promise<ApiResponse<{ token: string; customer: CustomerUser }>> {
    try {
      const res = await fetch('/api/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, password }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Customer authentication service is not connected yet.' };
      return data;
    } catch {
      return { error: 'Customer authentication service is not connected yet.' };
    }
  },

  // Customer Dashboard
  async getCustomerDashboard(customerId: string): Promise<ApiResponse<{
    customer: CustomerUser;
    application: LoanApplication;
    documents: DocumentRecord[];
    messages: ChatMessage[];
  }>> {
    try {
      const res = await fetch(`/api/customer/dashboard/${encodeURIComponent(customerId)}`);
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Customer record not found.' };
      return data;
    } catch {
      return { error: 'Service temporarily unavailable.' };
    }
  },

  // Document Upload
  async uploadDocument(payload: {
    applicationId: string;
    documentType: string;
    fileName: string;
    category?: string;
  }): Promise<ApiResponse<DocumentRecord>> {
    try {
      const res = await fetch('/api/customer/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Document storage is not connected yet.' };
      return data;
    } catch {
      return { error: 'Document storage is not connected yet.' };
    }
  },

  // Chat Messages
  async getMessages(applicationId: string): Promise<ChatMessage[]> {
    if (supabase) {
      const msgs = await supabaseService.getMessages(applicationId);
      if (msgs && msgs.length > 0) return msgs;
    }

    try {
      const res = await fetch(`/api/applications/${encodeURIComponent(applicationId)}/messages`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.messages || [];
    } catch {
      return [];
    }
  },

  async sendMessage(applicationId: string, message: string, senderName: string): Promise<ApiResponse<ChatMessage>> {
    if (supabase) {
      const res = await supabaseService.sendMessage({
        applicationId,
        message,
        senderName,
      });
      if (res.success && res.message) {
        return { success: true, data: res.message };
      }
    }

    try {
      const res = await fetch(`/api/applications/${encodeURIComponent(applicationId)}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sender: 'customer', senderName }),
      });
      const data = await res.json();
      return data;
    } catch {
      return { error: 'Messaging service is not connected yet.' };
    }
  },

  // AI Advisor
  async askAIAdvisor(message: string): Promise<{ reply: string; error?: string }> {
    try {
      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (!res.ok) return { reply: '', error: data.error || 'AI Advisor service is temporarily unavailable.' };
      return { reply: data.reply };
    } catch {
      return {
        reply:
          'Capitabee Financial Services offers Pan-India Loan Assistance for Working Capital (starting from 8%), Home Loans (from 7.20%), LAP (from 8.50%), and Business Loans. Please connect with our team at +91 8010886625 or on WhatsApp for direct assistance.',
      };
    }
  },
};

