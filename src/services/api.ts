import { LoanApplication, ReviewRecord, CustomerUser, DocumentRecord, ChatMessage, CallbackRequest, ContactMessage } from '../types';

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
  // Application submission
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
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || 'Application service is not connected yet.' };
      }
      return data;
    } catch (err) {
      return { error: 'Application service is not connected yet.' };
    }
  },

  // Fetch application details
  async getApplication(id: string): Promise<ApiResponse<LoanApplication>> {
    try {
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
