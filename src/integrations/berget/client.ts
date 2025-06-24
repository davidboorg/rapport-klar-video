// Berget.ai API client configuration
export interface BergetConfig {
  apiUrl: string;
  apiKey: string;
}

export interface BergetUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  subscription: 'free' | 'pro' | 'enterprise';
  euCompliant: boolean;
}

export interface BergetSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: BergetUser;
}

class BergetClient {
  private config: BergetConfig;

  constructor(config: BergetConfig) {
    this.config = config;
  }

  async login(email: string, password: string): Promise<{ data: BergetSession | null; error: any }> {
    try {
      console.log('Attempting login to Berget.ai API...');
      
      const response = await fetch(`${this.config.apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login failed with response:', errorText);
        
        // Handle specific error cases
        if (response.status === 401) {
          return { data: null, error: { message: 'Invalid email or password' } };
        }
        if (response.status === 404) {
          return { data: null, error: { message: 'Service temporarily unavailable' } };
        }
        if (response.status >= 500) {
          return { data: null, error: { message: 'Server error. Please try again later.' } };
        }
        
        return { data: null, error: { message: 'Login failed. Please check your credentials.' } };
      }

      const session = await response.json();
      localStorage.setItem('berget_session', JSON.stringify(session));
      console.log('Login successful');
      return { data: session, error: null };
    } catch (error) {
      console.error('Network error during login:', error);
      
      // Handle network errors specifically
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return { 
          data: null, 
          error: { 
            message: 'Unable to connect to authentication service. Please check your internet connection.' 
          } 
        };
      }
      
      return { 
        data: null, 
        error: { 
          message: 'Login failed due to network error. Please try again.' 
        } 
      };
    }
  }

  async register(email: string, password: string, userData: { firstName: string; lastName: string; company: string }): Promise<{ data: BergetSession | null; error: any }> {
    try {
      console.log('Attempting registration to Berget.ai API...');
      
      const response = await fetch(`${this.config.apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          email,
          password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          company: userData.company,
        }),
      });

      console.log('Registration response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Registration failed with response:', errorText);
        
        if (response.status === 409) {
          return { data: null, error: { message: 'An account with this email already exists' } };
        }
        if (response.status === 400) {
          return { data: null, error: { message: 'Invalid registration data. Please check your information.' } };
        }
        
        return { data: null, error: { message: 'Registration failed. Please try again.' } };
      }

      const session = await response.json();
      localStorage.setItem('berget_session', JSON.stringify(session));
      console.log('Registration successful');
      return { data: session, error: null };
    } catch (error) {
      console.error('Network error during registration:', error);
      return { 
        data: null, 
        error: { 
          message: 'Registration failed due to network error. Please try again.' 
        } 
      };
    }
  }

  async logout(): Promise<void> {
    try {
      const session = this.getStoredSession();
      if (session) {
        await fetch(`${this.config.apiUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('berget_session');
    }
  }

  async refreshSession(): Promise<{ data: BergetSession | null; error: any }> {
    try {
      const session = this.getStoredSession();
      if (!session?.refreshToken) {
        return { data: null, error: { message: 'No refresh token available' } };
      }

      const response = await fetch(`${this.config.apiUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { data: null, error };
      }

      const newSession = await response.json();
      localStorage.setItem('berget_session', JSON.stringify(newSession));
      return { data: newSession, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Document processing methods for Phase 2
  async processDocument(file: File, documentType: 'quarterly' | 'board'): Promise<{ data: any; error: any }> {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', documentType);

      const session = this.getStoredSession();
      const response = await fetch(`${this.config.apiUrl}/documents/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.accessToken || this.config.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        return { data: null, error };
      }

      const result = await response.json();
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async generateContent(chunks: any[], contentType: 'video' | 'audio' | 'summary'): Promise<{ data: any; error: any }> {
    try {
      const session = this.getStoredSession();
      const response = await fetch(`${this.config.apiUrl}/content/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken || this.config.apiKey}`,
        },
        body: JSON.stringify({
          chunks,
          contentType,
          euCompliant: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { data: null, error };
      }

      const result = await response.json();
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  getStoredSession(): BergetSession | null {
    try {
      const stored = localStorage.getItem('berget_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  isSessionValid(session: BergetSession): boolean {
    return session.expiresAt > Date.now();
  }
}

// Initialize Berget.ai client with real API key
const BERGET_API_URL = "https://api.berget.ai/v1";
const BERGET_API_KEY = "sk_ber_3jnGf3YG1X4MHcpoY4ZRBuvDTZfHWmqz7EIeR_2eddbe6f6174d835";

export const bergetClient = new BergetClient({
  apiUrl: BERGET_API_URL,
  apiKey: BERGET_API_KEY,
});
