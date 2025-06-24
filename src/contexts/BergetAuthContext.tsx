
import React, { createContext, useContext, useState, useEffect } from "react";
import { bergetClient, BergetUser, BergetSession } from "@/integrations/berget/client";

interface AuthContextType {
  user: BergetUser | null;
  session: BergetSession | null;
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (email: string, password: string, userData: { firstName: string; lastName: string; company: string }) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  loading: boolean;
  isOnline: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<BergetUser | null>(null);
  const [session, setSession] = useState<BergetSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Check for existing session on startup
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const storedSession = bergetClient.getStoredSession();
        
        if (storedSession) {
          console.log('Found stored session, validating...');
          if (bergetClient.isSessionValid(storedSession)) {
            console.log('Session is valid');
            setSession(storedSession);
            setUser(storedSession.user);
          } else {
            console.log('Session expired, attempting refresh...');
            // Try to refresh the session
            const { data: newSession, error } = await bergetClient.refreshSession();
            if (newSession && !error) {
              console.log('Session refreshed successfully');
              setSession(newSession);
              setUser(newSession.user);
            } else {
              console.log('Session refresh failed, clearing stored session');
              // Clear invalid session
              await bergetClient.logout();
            }
          }
        } else {
          console.log('No stored session found');
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // Clear any corrupted session data
        await bergetClient.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    if (!isOnline) {
      return { error: { message: 'No internet connection. Please check your network and try again.' } };
    }

    setLoading(true);
    try {
      console.log('Starting login process...');
      const { data: session, error } = await bergetClient.login(email, password);
      
      if (error) {
        console.error('Login failed:', error);
        return { error };
      }

      if (session) {
        console.log('Login successful, setting session...');
        setSession(session);
        setUser(session.user);
      }
      
      return { error: null };
    } catch (error) {
      console.error('Unexpected login error:', error);
      return { error: { message: 'An unexpected error occurred. Please try again.' } };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, userData: { firstName: string; lastName: string; company: string }) => {
    if (!isOnline) {
      return { error: { message: 'No internet connection. Please check your network and try again.' } };
    }

    setLoading(true);
    try {
      console.log('Starting registration process...');
      const { data: session, error } = await bergetClient.register(email, password, userData);
      
      if (error) {
        console.error('Registration failed:', error);
        return { error };
      }

      if (session) {
        console.log('Registration successful, setting session...');
        setSession(session);
        setUser(session.user);
      }
      
      return { error: null };
    } catch (error) {
      console.error('Unexpected registration error:', error);
      return { error: { message: 'An unexpected error occurred. Please try again.' } };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out...');
      await bergetClient.logout();
      setUser(null);
      setSession(null);
      console.log('Logout complete');
    } catch (error) {
      console.error('Logout error:', error);
      // Force local logout even if API call fails
      setUser(null);
      setSession(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, login, register, logout, loading, isOnline }}>
      {children}
    </AuthContext.Provider>
  );
};
