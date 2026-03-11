import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchAPI } from '../lib/api';

export type User = {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name?: string;
  avatar_url?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPI('/api/auth/me')
      .then(data => setUser(data.user || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetchAPI('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      if (res.error) return { user: null, error: new Error(res.error) };
      setUser(res.user);
      return { user: res.user, error: null };
    } catch (err: any) { return { user: null, error: err }; }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const res = await fetchAPI('/api/auth/signup', { method: 'POST', body: JSON.stringify({ email, password }) });
      if (res.error) return { user: null, error: new Error(res.error) };
      setUser(res.user);
      return { user: res.user, error: null };
    } catch (err: any) { return { user: null, error: err }; }
  };

  const signOut = async () => {
    await fetchAPI('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};