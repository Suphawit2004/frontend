import React, { createContext, useContext, useState, useEffect } from 'react';

// กำหนด Type ตามที่คุณใช้งานจริง
type AuthContextType = {
  user: any | null;
  signIn: (email: string, pass: string) => Promise<{ error: any }>;
  signUp: (email: string, pass: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthModal({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);

  // สมมติว่านี่คือ URL ของ Cloudflare Worker ของคุณ
  const API_BASE_URL = 'https://your-api.your-domain.workers.dev';

  // ตรวจสอบสถานะ User เมื่อโหลดหน้าเว็บ (เช่น ดึงจาก Token ใน LocalStorage หรือ Cookie)
  useEffect(() => {
    // โค้ดตรวจสอบ session ของคุณ
  }, []);

  // ฟังก์ชัน Login ปกติ
  const signIn = async (email: string, pass: string) => {
    // โค้ดยิง API ไปที่ Cloudflare Worker ของคุณ
    return { error: null }; 
  };

  const signUp = async (email: string, pass: string) => {
    // โค้ดยิง API ไปที่ Cloudflare Worker ของคุณ
    return { error: null };
  };

  // ฟังก์ชันเข้าสู่ระบบด้วย Google
  const signInWithGoogle = async () => {
    try {
      // หน้าเว็บที่คุณต้องการให้ระบบตีกลับมาหลังจาก Login Google เสร็จ
      const redirectUri = window.location.origin; 

      // ทำการ Redirect ผู้ใช้ไปยัง Endpoint ของ Cloudflare Worker
      // จากนั้น Worker จะรับช่วงต่อในการพาผู้ใช้ไปหน้า Login ของ Google
      window.location.href = `${API_BASE_URL}/auth/google?redirect_to=${encodeURIComponent(redirectUri)}`;

      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อระบบ Login' };
    }
  };

  const logout = () => {
    setUser(null);
    // โค้ดลบ Token
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook สำหรับดึงไปใช้ใน Component
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};