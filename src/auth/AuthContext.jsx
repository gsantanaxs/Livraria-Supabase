import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    let mounted = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      function (_event, nextSession) {
        if (mounted) {
          setSession(nextSession);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(function ({ data, error }) {
      if (mounted) {
        if (error) {
          console.error("Não foi possível recuperar a sessão:", error.message);
        }
        setSession(data.session);
        setLoading(false);
      }
    });

    return function () {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signUp(email, password) {
    return supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin }
    });
  }

  async function signIn(email, password) {
    return supabase.auth.signInWithPassword({ email, password });
  }

  async function signInWithGoogle() {
    return supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });
  }

  async function signOut() {
    return supabase.auth.signOut();
  }

  const user = session ? session.user : null;

  return (
    <AuthContext.Provider value={{ session, user, loading, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }
  return context;
}