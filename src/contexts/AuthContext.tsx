import { createContext, useContext, useEffect, useState } from 'react';
import { fetchAPI, API_BASE_URL } from '../lib/api'; // <--- เพิ่มการ import API_BASE_URL

export type User = {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetchAPI('/api/auth/me');
        setUser(response.user || null);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetchAPI('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setUser(response.user);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const response = await fetchAPI('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setUser(response.user);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      // แก้ไขการต่อ URL ให้ใช้ API_BASE_URL ที่ import มา
      // และเพิ่ม /api ให้ตรงกับโครงสร้าง endpoint อื่นๆ ของคุณ
      const authUrl = `${API_BASE_URL}/api/auth/google?redirect_to=${encodeURIComponent(window.location.origin)}`;
      
      const popup = window.open(authUrl, 'google-auth', 'width=500,height=600');

      if (!popup) {
        throw new Error('Popup blocked');
      }

      return new Promise<{ error: Error | null }>((resolve) => {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            fetchAPI('/api/auth/me')
              .then((response) => {
                setUser(response.user || null);
                resolve({ error: null });
              })
              .catch((error) => {
                resolve({ error });
              });
          }
        }, 1000);
      });
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await fetchAPI('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}