import { supabase, supabaseConfig } from '../config/supabase';
import {
  LoanApplication,
  LoanStage,
  ApplicationTimelineItem,
  DocumentRecord,
  ChatMessage,
  AppNotification,
  CustomerUser,
  ReviewRecord,
  CallbackRequest,
  ContactMessage,
} from '../types';

export interface SupabaseCustomerSession {
  user: any;
  profile: any;
  customer?: any;
}

export const supabaseService = {
  isConfigured(): boolean {
    return Boolean(supabase && supabaseConfig.isConfigured);
  },

  /**
   * Universal Login: Supports either direct Email or Customer ID (e.g. CUST-XXXX)
   */
  async login(identifier: string, password: string): Promise<{
    success: boolean;
    user?: any;
    token?: string;
    customer?: CustomerUser;
    error?: string;
  }> {
    if (!supabase) {
      return { success: false, error: 'Supabase client is not initialized.' };
    }

    const cleanIdentifier = identifier.trim();
    const cleanPassword = password.trim();

    if (!cleanIdentifier || !cleanPassword) {
      return { success: false, error: 'Please enter both your Customer ID / Email and Password.' };
    }

    try {
      let emailToAuth = cleanIdentifier;

      // If identifier is not an email, try resolving by customer_id or standard email alias
      if (!cleanIdentifier.includes('@')) {
        // First try to check if there is a profile or customer record with this customer_id
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, customer_id')
          .eq('customer_id', cleanIdentifier.toUpperCase())
          .maybeSingle();

        if (profile?.email) {
          emailToAuth = profile.email;
        } else {
          // Fallback to customer ID email alias format used in Supabase auth setup
          emailToAuth = `${cleanIdentifier.toLowerCase()}@customer.capitabee.com`;
        }
      }

      // Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailToAuth,
        password: cleanPassword,
      });

      if (authError || !authData.user) {
        // If email alias failed, let's also try raw identifier as email
        if (emailToAuth !== cleanIdentifier) {
          const { data: retryAuth, error: retryError } = await supabase.auth.signInWithPassword({
            email: cleanIdentifier,
            password: cleanPassword,
          });
          if (retryError || !retryAuth.user) {
            return {
              success: false,
              error: authError?.message || retryError?.message || 'Invalid login credentials. Please check your Customer ID and Password.',
            };
          }
          return await this.buildCustomerUserFromSession(retryAuth.user, retryAuth.session?.access_token);
        }

        return {
          success: false,
          error: authError?.message || 'Invalid Customer ID or Password. Please contact your loan associate if you need access.',
        };
      }

      return await this.buildCustomerUserFromSession(authData.user, authData.session?.access_token);
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Unable to connect to Supabase authentication.',
      };
    }
  },

  /**
   * Build CustomerUser object from Supabase Auth user & public.profiles / public.applications
   */
  async buildCustomerUserFromSession(user: any, token?: string): Promise<{
    success: boolean;
    user?: any;
    token?: string;
    customer?: CustomerUser;
    error?: string;
  }> {
    if (!supabase) {
      return { success: false, error: 'Supabase client is not initialized.' };
    }

    try {
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      // Fetch customer applications
      let appsQuery = supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (profile?.customer_id) {
        appsQuery = appsQuery.or(`user_id.eq.${user.id},customer_id.eq.${profile.customer_id}`);
      } else {
        appsQuery = appsQuery.eq('user_id', user.id);
      }

      const { data: apps } = await appsQuery;
      const primaryApp = apps && apps.length > 0 ? apps[0] : null;

      const customerObj: CustomerUser = {
        customerId: profile?.customer_id || user.user_metadata?.customer_id || primaryApp?.customer_id || `CUST-${user.id.slice(0, 8).toUpperCase()}`,
        fullName: profile?.full_name || user.user_metadata?.full_name || primaryApp?.full_name || user.email?.split('@')[0] || 'Valued Customer',
        mobileNumber: profile?.mobile_number || user.user_metadata?.mobile_number || primaryApp?.mobile_number || '',
        email: profile?.email || user.email || '',
        applicationId: primaryApp?.id || 'NO-APP-YET',
        loanType: primaryApp?.loan_type || 'Loan Assistance',
        requestedAmount: primaryApp ? Number(primaryApp.required_loan_amount) : 0,
        associateName: primaryApp?.associate_name || undefined,
        associateId: primaryApp?.associate_id || undefined,
        assignedEmployeeId: primaryApp?.assigned_employee_id || undefined,
        assignedEmployeeName: primaryApp?.assigned_employee_name || undefined,
        assignedAt: primaryApp?.assigned_at || undefined,
        assignedLoanOfficer: primaryApp?.assigned_officer || 'Capitabee Loan Processing Desk',
        currentStage: primaryApp?.current_stage || 1,
        applicationStatus: (primaryApp?.status as any) || 'Received',
        createdAt: primaryApp?.created_at || user.created_at || new Date().toISOString(),
      };

      return {
        success: true,
        user,
        token: token || 'supabase-authenticated',
        customer: customerObj,
      };
    } catch (err: any) {
      return {
        success: true,
        user,
        token: token || 'supabase-authenticated',
        customer: {
          customerId: `CUST-${user.id.slice(0, 8).toUpperCase()}`,
          fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Valued Customer',
          mobileNumber: user.user_metadata?.mobile_number || '',
          email: user.email || '',
          applicationId: 'CAP-PENDING',
          loanType: 'Loan Assistance',
          requestedAmount: 0,
          currentStage: 1,
          applicationStatus: 'Received',
          createdAt: new Date().toISOString(),
        },
      };
    }
  },

  /**
   * Get current Supabase session
   */
  async getSession(): Promise<any> {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /**
   * Logout from Supabase
   */
  async logout(): Promise<void> {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Supabase sign out error:', err);
      }
    }
  },

  /**
   * Fetch all applications for current authenticated customer (supports multi-application)
   */
  async getCustomerApplications(userId: string, customerId?: string): Promise<LoanApplication[]> {
    if (!supabase) return [];

    try {
      let query = supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (customerId) {
        query = query.or(`user_id.eq.${userId},customer_id.eq.${customerId}`);
      } else {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error || !data) {
        console.error('Error fetching customer applications:', error);
        return [];
      }

      return data.map((row: any) => ({
        id: row.id,
        customerId: row.customer_id || undefined,
        fullName: row.full_name,
        mobileNumber: row.mobile_number,
        email: row.email || undefined,
        loanType: row.loan_type,
        requiredLoanAmount: Number(row.required_loan_amount),
        employmentType: row.employment_type as any,
        city: row.city,
        state: row.state,
        preferredContactMethod: row.preferred_contact_method as any,
        associateId: row.associate_id || undefined,
        associateName: row.associate_name || undefined,
        assignedEmployeeId: row.assigned_employee_id || undefined,
        assignedEmployeeName: row.assigned_employee_name || undefined,
        assignedAt: row.assigned_at || undefined,
        assignedBy: row.assigned_by || undefined,
        assignedOfficer: row.assigned_officer || 'Capitabee Loan Processing Desk',
        status: row.status as any,
        currentStage: row.current_stage || 1,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        notes: row.notes || undefined,
        stages: [],
      }));
    } catch (err) {
      console.error('Exception fetching applications:', err);
      return [];
    }
  },

  /**
   * Fetch 12 Application Stages for a specific application from public.application_stages
   */
  async getApplicationStages(applicationId: string): Promise<LoanStage[]> {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('application_stages')
        .select('*')
        .eq('application_id', applicationId)
        .order('stage_number', { ascending: true });

      if (error || !data) {
        console.error('Error fetching application stages:', error);
        return [];
      }

      return data.map((row: any) => ({
        stageNumber: row.stage_number,
        name: row.name,
        description: row.description || '',
        status: row.status as any,
        remarks: row.remarks || undefined,
        actionRequiredReason: row.action_required_reason || undefined,
        updatedAt: row.updated_at,
      }));
    } catch (err) {
      console.error('Exception fetching stages:', err);
      return [];
    }
  },

  /**
   * Fetch customer-facing application timeline items from public.application_timeline
   */
  async getApplicationTimeline(applicationId: string): Promise<ApplicationTimelineItem[]> {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('application_timeline')
        .select('id, application_id, stage, stage_name, previous_status, new_status, customer_message, updated_by, created_at')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false });

      if (error || !data) {
        return [];
      }

      return data.map((row: any) => ({
        id: row.id,
        applicationId: row.application_id,
        stage: row.stage,
        stageName: row.stage_name || undefined,
        previousStatus: row.previous_status || undefined,
        newStatus: row.new_status,
        customerMessage: row.customer_message,
        updatedBy: row.updated_by,
        updatedAt: row.created_at,
      }));
    } catch (err) {
      return [];
    }
  },

  /**
   * Fetch documents for an application from public.documents
   */
  async getDocuments(applicationId: string): Promise<DocumentRecord[]> {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false });

      if (error || !data) {
        return [];
      }

      return data.map((row: any) => ({
        id: row.id,
        applicationId: row.application_id,
        documentType: row.document_type,
        category: (row.category as any) || 'Other',
        fileName: row.file_name,
        fileSize: row.file_size || undefined,
        fileUrl: row.file_url || undefined,
        status: (row.status as any) || 'Pending Upload',
        uploadedAt: row.uploaded_at || undefined,
        requestedAt: row.requested_at || undefined,
        verifiedAt: row.verified_at || undefined,
        rejectionReason: row.rejection_reason || undefined,
        isRequested: Boolean(row.is_requested),
        instructions: row.instructions || undefined,
      }));
    } catch (err) {
      return [];
    }
  },

  /**
   * Upload Document: Stores record in public.documents and optionally Supabase Storage
   */
  async uploadDocument(payload: {
    applicationId: string;
    customerId?: string;
    documentType: string;
    category?: 'KYC' | 'Income' | 'Property' | 'Business' | 'Financials' | 'Other';
    file: File;
  }): Promise<{ success: boolean; document?: DocumentRecord; error?: string }> {
    if (!supabase) {
      return { success: false, error: 'Supabase is not initialized.' };
    }

    try {
      const fileExt = payload.file.name.split('.').pop() || 'pdf';
      const storagePath = `${payload.applicationId}/${Date.now()}_${payload.file.name}`;
      let publicFileUrl: string | undefined = undefined;

      // Try uploading to Supabase Storage 'loan-documents' bucket if available
      try {
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('loan-documents')
          .upload(storagePath, payload.file, {
            upsert: true,
          });

        if (!uploadErr && uploadData) {
          const { data: urlData } = supabase.storage
            .from('loan-documents')
            .getPublicUrl(storagePath);
          publicFileUrl = urlData.publicUrl;
        }
      } catch (storageErr) {
        console.warn('Supabase storage upload skipped or failed, proceeding with document metadata:', storageErr);
      }

      const docId = `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const docRecord = {
        id: docId,
        application_id: payload.applicationId,
        customer_id: payload.customerId || null,
        document_type: payload.documentType,
        category: payload.category || 'Income',
        file_name: payload.file.name,
        file_size: `${(payload.file.size / (1024 * 1024)).toFixed(2)} MB`,
        file_url: publicFileUrl || null,
        storage_path: storagePath,
        status: 'Uploaded',
        uploaded_at: new Date().toISOString(),
        is_requested: false,
      };

      const { data, error } = await supabase
        .from('documents')
        .insert(docRecord)
        .select()
        .maybeSingle();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        document: {
          id: data?.id || docId,
          applicationId: payload.applicationId,
          documentType: payload.documentType,
          category: (payload.category as any) || 'Income',
          fileName: payload.file.name,
          fileSize: `${(payload.file.size / (1024 * 1024)).toFixed(2)} MB`,
          fileUrl: publicFileUrl,
          status: 'Uploaded',
          uploadedAt: new Date().toISOString(),
          isRequested: false,
        },
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to upload document.' };
    }
  },

  /**
   * Fetch chat messages from public.messages
   */
  async getMessages(applicationId: string): Promise<ChatMessage[]> {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: true });

      if (error || !data) {
        return [];
      }

      return data.map((row: any) => ({
        id: row.id,
        applicationId: row.application_id,
        sender: row.sender as any,
        senderName: row.sender_name,
        message: row.message,
        read: Boolean(row.read),
        timestamp: row.created_at,
      }));
    } catch (err) {
      return [];
    }
  },

  /**
   * Send chat message into public.messages
   */
  async sendMessage(payload: {
    applicationId: string;
    message: string;
    senderName: string;
    senderUserId?: string;
  }): Promise<{ success: boolean; message?: ChatMessage; error?: string }> {
    if (!supabase) {
      return { success: false, error: 'Supabase client is not initialized.' };
    }

    try {
      const msgId = `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newMsg = {
        id: msgId,
        application_id: payload.applicationId,
        sender: 'customer',
        sender_name: payload.senderName,
        sender_user_id: payload.senderUserId || null,
        message: payload.message.trim(),
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('messages')
        .insert(newMsg)
        .select()
        .maybeSingle();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        message: {
          id: data?.id || msgId,
          applicationId: payload.applicationId,
          sender: 'customer',
          senderName: payload.senderName,
          message: payload.message.trim(),
          timestamp: new Date().toISOString(),
        },
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to send message.' };
    }
  },

  /**
   * Fetch notifications from public.notifications
   */
  async getNotifications(applicationId: string, userId?: string): Promise<AppNotification[]> {
    if (!supabase) return [];

    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.or(`application_id.eq.${applicationId},user_id.eq.${userId}`);
      } else {
        query = query.eq('application_id', applicationId);
      }

      const { data, error } = await query;
      if (error || !data) {
        return [];
      }

      return data.map((row: any) => ({
        id: row.id,
        customerId: row.customer_id || undefined,
        applicationId: row.application_id,
        title: row.title,
        message: row.message,
        createdAt: row.created_at,
        read: Boolean(row.read),
        type: (row.type as any) || 'info',
      }));
    } catch (err) {
      return [];
    }
  },

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId: string): Promise<void> {
    if (!supabase) return;
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  },

  /**
   * Setup Realtime Channel for Live Updates (stages, documents, messages, timeline, notifications)
   */
  subscribeToApplication(
    applicationId: string,
    onUpdate: (eventType: string, payload: any) => void
  ): () => void {
    if (!supabase) return () => {};

    try {
      const channel = supabase
        .channel(`app-portal-${applicationId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'application_stages',
            filter: `application_id=eq.${applicationId}`,
          },
          (payload) => onUpdate('STAGES_UPDATED', payload)
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'applications',
            filter: `id=eq.${applicationId}`,
          },
          (payload) => onUpdate('APPLICATION_UPDATED', payload)
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'documents',
            filter: `application_id=eq.${applicationId}`,
          },
          (payload) => onUpdate('DOCUMENTS_UPDATED', payload)
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `application_id=eq.${applicationId}`,
          },
          (payload) => onUpdate('MESSAGES_UPDATED', payload)
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'application_timeline',
            filter: `application_id=eq.${applicationId}`,
          },
          (payload) => onUpdate('TIMELINE_UPDATED', payload)
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `application_id=eq.${applicationId}`,
          },
          (payload) => onUpdate('NOTIFICATIONS_UPDATED', payload)
        )
        .subscribe();

      return () => {
        supabase?.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Realtime subscription error:', err);
      return () => {};
    }
  },

  /**
   * Fetch approved reviews from public.reviews
   */
  async getApprovedReviews(): Promise<ReviewRecord[]> {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('status', 'Approved')
        .order('created_at', { ascending: false });

      if (error || !data) {
        return [];
      }

      return data.map((r: any) => ({
        id: r.id,
        customerId: r.customer_id || undefined,
        applicationId: r.application_id || undefined,
        customerName: r.customer_name,
        rating: Number(r.rating),
        reviewText: r.review_text,
        loanType: r.loan_type,
        city: r.city || undefined,
        status: r.status as any,
        createdAt: r.created_at,
        photoUrl: r.photo_url || undefined,
      }));
    } catch (err) {
      return [];
    }
  },

  /**
   * Fetch reviews submitted by a specific customer for the Customer Portal
   */
  async getCustomerReviews(customerId?: string, customerName?: string): Promise<ReviewRecord[]> {
    if (!supabase) return [];

    try {
      let query = supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (customerId) {
        query = query.eq('customer_id', customerId);
      } else if (customerName) {
        query = query.eq('customer_name', customerName);
      } else {
        return [];
      }

      const { data, error } = await query;
      if (error || !data) {
        return [];
      }

      return data.map((r: any) => ({
        id: r.id,
        customerId: r.customer_id || undefined,
        applicationId: r.application_id || undefined,
        customerName: r.customer_name,
        rating: Number(r.rating),
        reviewText: r.review_text,
        loanType: r.loan_type,
        city: r.city || undefined,
        status: r.status as any,
        createdAt: r.created_at,
        photoUrl: r.photo_url || undefined,
      }));
    } catch (err) {
      return [];
    }
  },

  /**
   * Subscribe to live review updates (when CRM approves, adds, or changes reviews)
   */
  subscribeToReviews(onUpdate: (payload: any) => void): () => void {
    if (!supabase) return () => {};

    try {
      const channel = supabase
        .channel('public-reviews-channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'reviews',
          },
          (payload) => {
            onUpdate(payload);
          }
        )
        .subscribe();

      return () => {
        supabase?.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Reviews realtime subscription error:', err);
      return () => {};
    }
  },

  /**
   * Submit Review to public.reviews (with status 'Pending')
   */
  async submitReview(payload: {
    customerName: string;
    rating: number;
    reviewText: string;
    loanType: string;
    city?: string;
    photoUrl?: string;
    customerId?: string;
    applicationId?: string;
  }): Promise<{ success: boolean; error?: string; message?: string; review?: ReviewRecord }> {
    if (!supabase) {
      return { success: false, error: 'Supabase client is not initialized.' };
    }

    try {
      const revId = `rev-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newReview = {
        id: revId,
        customer_id: payload.customerId || null,
        application_id: payload.applicationId || null,
        customer_name: payload.customerName.trim(),
        rating: payload.rating,
        review_text: payload.reviewText.trim(),
        loan_type: payload.loanType.trim(),
        city: payload.city?.trim() || null,
        photo_url: payload.photoUrl?.trim() || null,
        status: 'Pending',
      };

      const { data, error } = await supabase
        .from('reviews')
        .insert(newReview)
        .select()
        .maybeSingle();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        message: 'Thank you for your feedback! Your review has been submitted and will appear publicly once verified by our team.',
        review: {
          id: data?.id || revId,
          customerId: payload.customerId,
          applicationId: payload.applicationId,
          customerName: payload.customerName,
          rating: payload.rating,
          reviewText: payload.reviewText,
          loanType: payload.loanType,
          city: payload.city,
          status: 'Pending',
          createdAt: new Date().toISOString(),
        },
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to submit review.' };
    }
  },

  /**
   * Submit Contact Form to public.contact_messages
   */
  async submitContact(payload: {
    fullName: string;
    email: string;
    phone: string;
    subject?: string;
    message: string;
  }): Promise<{ success: boolean; error?: string; message?: string }> {
    if (!supabase) {
      return { success: false, error: 'Supabase client is not initialized.' };
    }

    try {
      const contactId = `contact-${Date.now()}`;
      const { error } = await supabase.from('contact_messages').insert({
        id: contactId,
        full_name: payload.fullName.trim(),
        email: payload.email.trim(),
        phone: payload.phone.trim(),
        subject: payload.subject?.trim() || 'General Inquiry',
        message: payload.message.trim(),
        status: 'New',
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        message: 'Thank you for reaching out to CAPITABEE FINANCIAL SERVICES. Our team will contact you shortly.',
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to submit contact message.' };
    }
  },

  /**
   * Submit Callback Request to public.callback_requests
   */
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
  }): Promise<{ success: boolean; error?: string; message?: string }> {
    if (!supabase) {
      return { success: false, error: 'Supabase client is not initialized.' };
    }

    try {
      const cbId = `cb-${Date.now()}`;
      const { error } = await supabase.from('callback_requests').insert({
        id: cbId,
        full_name: payload.fullName.trim(),
        mobile_number: payload.mobileNumber.trim(),
        email: payload.email?.trim() || null,
        loan_type: payload.loanType.trim(),
        amount: payload.amount?.trim() || null,
        city: payload.city?.trim() || null,
        state: payload.state?.trim() || null,
        associate_name: payload.associateName?.trim() || null,
        message: payload.message?.trim() || null,
        status: 'New',
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        message: 'Callback request registered. A Capitabee loan officer will call you back shortly.',
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to register callback request.' };
    }
  },
};
