'use client'; // Safe for Next.js if ever imported there

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

/* =========================
   Types
========================= */

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'editor' | 'moderator';
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  adminUser: AdminUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

/* =========================
   Context
========================= */

const AuthContext = createContext<AuthContextType | null>(null);

/* =========================
   Provider
========================= */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     Fetch Admin User
  ========================= */

  const fetchAdminUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      setAdminUser(data ?? null);
    } catch (error) {
      console.error('Error fetching admin user:', error);
      setAdminUser(null);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Initial Session Load
  ========================= */

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchAdminUser(session.user.id);
      } else {
        setLoading(false);
      }
    };

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchAdminUser(session.user.id);
      } else {
        setAdminUser(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* =========================
     Sign In
  ========================= */

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await supabase
          .from('admin_users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', data.user.id);
      }

      return { error: null };
    } catch (error) {
      console.error('Sign in failed:', error);
      return { error: error as Error };
    }
  };

  /* =========================
     Sign Out
  ========================= */

  const signOut = async () => {
    await supabase.auth.signOut();
    setAdminUser(null);
  };

  /* =========================
     Derived Permissions
  ========================= */

  const isAdmin = Boolean(adminUser?.is_active);
  const isSuperAdmin = Boolean(
    adminUser?.role === 'super_admin' && adminUser?.is_active
  );

  /* =========================
     Provider Value
  ========================= */

  const value: AuthContextType = {
    user,
    adminUser,
    session,
    loading,
    signIn,
    signOut,
    isAdmin,
    isSuperAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* =========================
   Hook
========================= */

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
