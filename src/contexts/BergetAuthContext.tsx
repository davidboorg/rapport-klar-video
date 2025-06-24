
import React, { createContext, useContext, useState, useEffect } from "react";
import { bergetClient, BergetUser, BergetSession } from "@/integrations/berget/client";

interface AuthContextType {
  user: BergetUser | null;
  session: BergetSession | null;
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (email: string, password: string, userData: { firstName: string; lastName: string; company: string }) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  loading: boolean;
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

  useEffect(() => {
    // Check for existing session on startup
    const initializeAuth = async () => {
      const storedSession = bergetClient.getStoredSession();
      
      if (storedSession) {
        if (bergetClient.isSessionValid(storedSession)) {
          setSession(storedSession);
          setUser(storedSession.user);
        } else {
          // Try to refresh the session
          const { data: newSession, error } = await bergetClient.refreshSession();
          if (newSession && !error) {
            setSession(newSession);
            setUser(newSession.user);
          } else {
            // Clear invalid session
            await bergetClient.logout();
          }
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data: session, error } = await bergetClient.login(email, password);
      
      if (error) {
        return { error };
      }

      if (session) {
        setSession(session);
        setUser(session.user);
      }
      
      return { error: null };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, userData: { firstName: string; lastName: string; company: string }) => {
    setLoading(true);
    try {
      const { data: session, error } = await bergetClient.register(email, password, userData);
      
      if (error) {
        return { error };
      }

      if (session) {
        setSession(session);
        setUser(session.user);
      }
      
      return { error: null };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await bergetClient.logout();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
