import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchAPI } from '../lib/api';

export type User = { id: string; email: string; name?: string; role?: string; avatar_url?: string; };

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (userData: User, token: string) => void; // 💡 รับพารามิเตอร์ token เพิ่ม
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkLoginStatus(); }, []);

  const checkLoginStatus = async () => {
    try {
      const res = await fetchAPI('/api/auth/me'); // api.ts จะแนบ header ให้เราอัตโนมัติแล้ว
      if (res && res.user) setUser(res.user);
      else setUser(null);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false); 
    }
  };

  const login = (userData: User, token: string) => {
    localStorage.setItem('auth_token', token); // 💡 บันทึกตั๋วลงเครื่องแบบถาวร (กันรีเฟรชหาย)
    setUser(userData);
  };

  const logout = async () => {
    localStorage.removeItem('auth_token'); // 💡 ลบตั๋วทิ้ง
    try {
      await fetchAPI('/api/auth/logout', { method: 'POST' });
    } catch (error) {} 
    setUser(null);
    window.location.href = '/'; 
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-gray-500 animate-pulse font-medium">กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</div></div>;

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}