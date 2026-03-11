import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchAPI, API_BASE_URL } from '../lib/api'; 

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

  // 1. ตรวจสอบ Session เมื่อเปิดเว็บ (ดึงข้อมูลจาก Cookie อัตโนมัติ)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetchAPI('/api/auth/me');
        // ถ้ามีข้อมูล user ส่งกลับมา แปลว่า Cookie ยังไม่หมดอายุ
        if (response && response.user) {
          setUser(response.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  // 2. ฟังก์ชันเข้าสู่ระบบ
  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetchAPI('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      // ดักจับกรณี Backend ส่ง error กลับมา (เช่น รหัสผิด)
      if (response.error) {
        return { error: new Error(response.error) };
      }

      setUser(response.user);
      return { error: null };
    } catch (error: any) {
      return { error: error instanceof Error ? error : new Error('เข้าสู่ระบบไม่สำเร็จ') };
    }
  };

  // 3. ฟังก์ชันสมัครสมาชิก
  const signUp = async (email: string, password: string) => {
    try {
      const response = await fetchAPI('/api/auth/signup', { // เปลี่ยนเป็น /signup ตามที่เราเขียนใน Backend
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.error) {
        return { error: new Error(response.error) };
      }

      setUser(response.user);
      return { error: null };
    } catch (error: any) {
      return { error: error instanceof Error ? error : new Error('สมัครสมาชิกไม่สำเร็จ') };
    }
  };

  // 4. ฟังก์ชัน Google Login (คงโครงสร้างเดิมของคุณไว้ได้เลยครับ)
  const signInWithGoogle = async () => {
    try {
      const authUrl = `${API_BASE_URL}/api/auth/google?redirect_to=${encodeURIComponent(window.location.origin)}`;
      const popup = window.open(authUrl, 'google-auth', 'width=500,height=600');

      if (!popup) {
        throw new Error('เบราว์เซอร์บล็อกหน้าต่าง Popup กรุณาอนุญาตให้แสดง Popup');
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

  // 5. ฟังก์ชันออกจากระบบ
  const signOut = async () => {
    try {
      // สั่ง Backend ให้ลบ Cookie ทิ้ง
      await fetchAPI('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // ล้างข้อมูลฝั่งหน้าบ้าน
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