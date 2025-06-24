
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
      const response = await fetch(`${this.config.apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { data: null, error };
      }

      const session = await response.json();
      localStorage.setItem('berget_session', JSON.stringify(session));
      return { data: session, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async register(email: string, password: string, userData: { firstName: string; lastName: string; company: string }): Promise<{ data: BergetSession | null; error: any }> {
    try {
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

      if (!response.ok) {
        const error = await response.json();
        return { data: null, error };
      }

      const session = await response.json();
      localStorage.setItem('berget_session', JSON.stringify(session));
      return { data: session, error: null };
    } catch (error) {
      return { data: null, error };
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

// Initialize Berget.ai client
const BERGET_API_URL = "https://api.berget.ai/v1";
const BERGET_API_KEY = "demo-key"; // This should be replaced with actual API key

export const bergetClient = new BergetClient({
  apiUrl: BERGET_API_URL,
  apiKey: BERGET_API_KEY,
});
