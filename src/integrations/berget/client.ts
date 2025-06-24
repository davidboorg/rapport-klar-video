
// Berget.ai API client configuration
export interface BergetConfig {
  apiUrl: string;
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

export interface BergetAvatar {
  id: string;
  user_id: string;
  name: string;
  status: 'creating' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  progress?: number;
}

export interface BergetProject {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

class BergetClient {
  private config: BergetConfig;
  private websockets: Map<string, WebSocket> = new Map();

  constructor(config: BergetConfig) {
    this.config = config;
  }

  private async makeSecureRequest(endpoint: string, options: RequestInit = {}): Promise<{ data: any; error: any }> {
    try {
      // Use Supabase Edge Function for secure API calls to Berget
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('berget-api-proxy', {
        body: {
          endpoint,
          method: options.method || 'GET',
          body: options.body ? JSON.parse(options.body as string) : undefined,
          headers: options.headers
        }
      });

      if (error) {
        console.error('Berget API proxy error:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Secure request failed:', error);
      return { data: null, error: { message: 'Network error', originalError: error } };
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<{ data: BergetSession | null; error: any }> {
    try {
      console.log('Attempting login to Berget.ai API via secure proxy...');
      
      const result = await this.makeSecureRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (result.error) {
        console.error('Login failed:', result.error);
        
        if (result.error.status === 401) {
          return { data: null, error: { message: 'Invalid email or password' } };
        }
        if (result.error.status === 404) {
          return { data: null, error: { message: 'Service temporarily unavailable' } };
        }
        if (result.error.status >= 500) {
          return { data: null, error: { message: 'Server error. Please try again later.' } };
        }
        
        return { data: null, error: { message: 'Login failed. Please check your credentials.' } };
      }

      const session = result.data;
      localStorage.setItem('berget_session', JSON.stringify(session));
      console.log('Login successful');
      return { data: session, error: null };
    } catch (error) {
      console.error('Network error during login:', error);
      
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
      console.log('Attempting registration to Berget.ai API via secure proxy...');
      
      const result = await this.makeSecureRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          company: userData.company,
        }),
      });

      if (result.error) {
        console.error('Registration failed:', result.error);
        
        if (result.error.status === 409) {
          return { data: null, error: { message: 'An account with this email already exists' } };
        }
        if (result.error.status === 400) {
          return { data: null, error: { message: 'Invalid registration data. Please check your information.' } };
        }
        
        return { data: null, error: { message: 'Registration failed. Please try again.' } };
      }

      const session = result.data;
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
        await this.makeSecureRequest('/auth/logout', {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('berget_session');
      // Close all WebSocket connections
      this.websockets.forEach(ws => ws.close());
      this.websockets.clear();
    }
  }

  async refreshSession(): Promise<{ data: BergetSession | null; error: any }> {
    try {
      const session = this.getStoredSession();
      if (!session?.refreshToken) {
        return { data: null, error: { message: 'No refresh token available' } };
      }

      const result = await this.makeSecureRequest('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      });

      if (result.error) {
        return { data: null, error: result.error };
      }

      const newSession = result.data;
      localStorage.setItem('berget_session', JSON.stringify(newSession));
      return { data: newSession, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Avatar methods
  async getAvatars(): Promise<{ data: BergetAvatar[] | null; error: any }> {
    return this.makeSecureRequest('/avatars');
  }

  async createAvatar(avatarData: Partial<BergetAvatar>): Promise<{ data: BergetAvatar | null; error: any }> {
    return this.makeSecureRequest('/avatars', {
      method: 'POST',
      body: JSON.stringify(avatarData),
    });
  }

  async updateAvatar(avatarId: string, updates: Partial<BergetAvatar>): Promise<{ data: BergetAvatar | null; error: any }> {
    return this.makeSecureRequest(`/avatars/${avatarId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteAvatar(avatarId: string): Promise<{ data: null; error: any }> {
    return this.makeSecureRequest(`/avatars/${avatarId}`, {
      method: 'DELETE',
    });
  }

  async refreshAvatar(avatarId: string): Promise<{ data: any; error: any }> {
    return this.makeSecureRequest(`/avatars/${avatarId}/refresh`, {
      method: 'POST',
    });
  }

  // Project methods
  async getProjects(): Promise<{ data: BergetProject[] | null; error: any }> {
    return this.makeSecureRequest('/projects');
  }

  async createProject(projectData: Partial<BergetProject>): Promise<{ data: BergetProject | null; error: any }> {
    return this.makeSecureRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(projectId: string, updates: Partial<BergetProject>): Promise<{ data: BergetProject | null; error: any }> {
    return this.makeSecureRequest(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProject(projectId: string): Promise<{ data: null; error: any }> {
    return this.makeSecureRequest(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  // Document processing methods
  async processDocument(file: File, documentType: 'quarterly' | 'board'): Promise<{ data: any; error: any }> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Convert file to base64 for transmission
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke('berget-api-proxy', {
        body: {
          endpoint: '/documents/process',
          method: 'POST',
          body: {
            document: fileData,
            type: documentType,
            filename: file.name
          }
        }
      });

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async generateContent(chunks: any[], contentType: 'video' | 'audio' | 'summary'): Promise<{ data: any; error: any }> {
    return this.makeSecureRequest('/content/generate', {
      method: 'POST',
      body: JSON.stringify({
        chunks,
        contentType,
        euCompliant: true,
      }),
    });
  }

  // WebSocket connection for real-time updates
  connectWebSocket(endpoint: string): WebSocket | null {
    try {
      const session = this.getStoredSession();
      const wsUrl = this.config.apiUrl.replace('https://', 'wss://').replace('http://', 'ws://');
      const websocket = new WebSocket(`${wsUrl}${endpoint}?token=${session?.accessToken}`);
      
      this.websockets.set(endpoint, websocket);
      
      return websocket;
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      return null;
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

// Initialize Berget.ai client with production configuration
const BERGET_API_URL = "https://api.berget.ai/v1";

export const bergetClient = new BergetClient({
  apiUrl: BERGET_API_URL,
});
