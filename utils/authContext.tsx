// utils/authContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { getSupabase } from "./supabaseClient";

type AuthContextType = {
  user: any | null;
  initialized: boolean;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType>({ user: null, initialized: false, signOut: () => {} });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setInitialized(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setInitialized(true);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  return <AuthContext.Provider value={{ user, initialized, signOut }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
