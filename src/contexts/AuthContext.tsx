import { createContext, useContext, useEffect, useState } from 'react';
// ลบ import { User } from '@supabase/supabase-js'; ออก
// ลบ import { supabase } from '../lib/supabase'; ออก
import { fetchAPI, API_BASE_URL } from '../lib/api'; 

// สร้าง Type User ของเราเองขึ้นมาแทน
export type User = {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
};

// เพิ่ม signInWithGoogle เข้าไปใน Context
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

  // เปลี่ยนวิธีตรวจสอบ Session ตอนโหลดหน้าเว็บ
  useEffect(() => {
    const checkSession = async () => {
      try {
        // ยิง API ไปหา Cloudflare Worker เพื่อเช็คว่ามี Cookie/Token ที่ยังไม่หมดอายุไหม
        const response = await fetchAPI('/api/auth/me');
        setUser(response.user || null);
      } catch (error) {
        // ถ้า error (เช่น Token หมดอายุ หรือยังไม่ได้ล็อกอิน) ให้เซ็ต user เป็น null
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []); // Custom API จะไม่มี onAuthStateChange แบบ Supabase เราจึงเช็คแค่ตอนโหลดแอพ

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

  // ฟังก์ชันใหม่สำหรับจัดการ Google Login ที่เรียกใช้จาก AuthModal
  const signInWithGoogle = async () => {
    try {
      const redirectUri = window.location.origin;
      // ให้เบราว์เซอร์ Redirect ไปหา Worker ของเรา แล้ว Worker จะพาไปหน้า Google ต่อ
      window.location.href = `${API_BASE_URL}/auth/google?redirect_to=${encodeURIComponent(redirectUri)}`;
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // เรียก API ไปลบ Cookie ที่ฝั่ง Backend ก่อน
      await fetchAPI('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // เคลียร์ State ฝั่ง Frontend 
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