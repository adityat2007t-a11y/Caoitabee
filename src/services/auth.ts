import { AuthCredentials, AuthResponse, CustomerUser, CustomerDashboardData, DocumentRecord, ChatMessage } from '../types';
import { ApiResponse } from './api';

// Configurable base URL for external Customer Portal / Auth API
const envBaseUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_AUTH_API_BASE_URL : undefined;
const AUTH_API_BASE_URL = (envBaseUrl || '/api/customer').replace(/\/+$/, '');

const STORAGE_KEYS = {
  TOKEN: 'capitabee_auth_token',
  USER: 'capitabee_auth_user',
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
        if (storedToken) {
          this.token = storedToken;
        }
        if (storedUser) {
          this.currentUser = JSON.parse(storedUser);
        }
      } catch {
        this.token = null;
        this.currentUser = null;
      }
    }
  }

  /**
   * Returns current authenticated user or null.
   */
  getCurrentUser(): CustomerUser | null {
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
    return Boolean(this.token);
  }

  /**
   * Authenticates against the REAL backend / Customer Portal API.
   * Never accepts fake credentials or creates mock sessions.
   */
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    const cleanId = credentials.customerId.trim();
    const cleanPassword = credentials.password.trim();

    if (!cleanId || !cleanPassword) {
      return {
        success: false,
        error: 'Please enter both your Customer ID and Password.',
      };
    }

    try {
      const res = await fetch(`${AUTH_API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          customerId: cleanId,
          password: cleanPassword,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data || !data.success) {
        // Honest error reporting
        if (res.status === 404 || res.status === 502 || res.status === 503) {
          return {
            success: false,
            error: 'Customer authentication service is not connected yet. Please try again later or contact your loan associate.',
          };
        }
        return {
          success: false,
          error: data?.error || 'Invalid Customer ID or Password. Credentials must be issued by an authorized Capitabee Loan Associate.',
        };
      }

      // Store REAL session credentials
      this.token = data.token;
      this.currentUser = data.customer;

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
        sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.customer));
      }

      return {
        success: true,
        token: data.token,
        customer: data.customer,
      };
    } catch {
      return {
        success: false,
        error: 'Customer authentication service is not connected yet. Please try again later.',
      };
    }
  }

  /**
   * Refreshes the session using the Bearer token.
   */
  async refreshSession(): Promise<AuthResponse | null> {
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
      // In case of connection failure, retain token but do not fabricate data
      return null;
    }
  }

  /**
   * Fetches the authenticated customer's real dashboard record.
   * Relies strictly on the Bearer token; never accepts browser-injected Customer IDs.
   */
  async getDashboardData(): Promise<{
    success: boolean;
    data?: CustomerDashboardData;
    error?: string;
    isNotConnected?: boolean;
  }> {
    if (!this.token) {
      return {
        success: false,
        error: 'Not authenticated. Please log in.',
      };
    }

    try {
      const res = await fetch(`${AUTH_API_BASE_URL}/dashboard`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/json',
        },
      });

      const json = await res.json().catch(() => null);

      if (res.status === 401 || res.status === 403) {
        this.logout();
        return {
          success: false,
          error: 'Your session has expired. Please log in again.',
        };
      }

      if (res.status === 502 || res.status === 503 || res.status === 404 || !res.ok) {
        return {
          success: false,
          isNotConnected: true,
          error: 'Customer authentication service is not connected yet.',
        };
      }

      if (!json || !json.success) {
        return {
          success: false,
          error: json?.error || 'Unable to retrieve customer application record.',
        };
      }

      return {
        success: true,
        data: {
          customer: json.customer,
          application: json.application,
          documents: json.documents || [],
          messages: json.messages || [],
          notifications: json.notifications || [],
        },
      };
    } catch {
      return {
        success: false,
        isNotConnected: true,
        error: 'Customer authentication service is not connected yet.',
      };
    }
  }

  /**
   * Request password recovery.
   * Does NOT simulate OTP or generate fake reset tokens.
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
          error: data?.error || 'Password recovery service is not connected yet.',
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
   * Uploads a document to the customer's real record.
   */
  async uploadDocument(payload: {
    applicationId: string;
    documentType: string;
    fileName: string;
    category?: string;
  }): Promise<ApiResponse<DocumentRecord>> {
    if (!this.token) {
      return { error: 'Authentication required. Please log in.' };
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
  async sendMessage(message: string): Promise<ApiResponse<ChatMessage>> {
    if (!this.token) {
      return { error: 'Authentication required. Please log in.' };
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
      sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
      sessionStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }
}

export const authService = new AuthService();
