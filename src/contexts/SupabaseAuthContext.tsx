
// Replacement for SupabaseAuthContext using Berget.ai
import React, { createContext, useContext } from "react";
import { useAuth as useBergetAuth } from "@/contexts/BergetAuthContext";

// Re-export the Berget auth context as Supabase auth for compatibility
const SupabaseAuthContext = createContext<any>(undefined);

export const useAuth = () => {
  // Use Berget auth instead of Supabase
  return useBergetAuth();
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // This is just a pass-through since we're using BergetAuthContext
  return <>{children}</>;
};
