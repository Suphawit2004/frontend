// ไฟล์: src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireAdmin?: boolean; // ถ้าหน้านี้ต้องการสิทธิ์ Admin เท่านั้น
};

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // ⏳ ถ้ากำลังรีเฟรชและโหลดข้อมูลอยู่ ให้ขึ้นหน้าจอกำลังโหลด (เพื่อกันหน้าจอเด้งหลุด)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-500 font-medium">กำลังตรวจสอบสิทธิ์เข้าใช้งาน...</div>
        </div>
      </div>
    );
  }

  // ❌ ถ้าโหลดเสร็จแล้วพบว่าไม่มี User (ไม่ได้ล็อกอิน) ให้เด้งกลับไปหน้าแรก
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // ❌ ถ้าหน้านั้นบังคับว่าเป็น Admin แต่ User ทั่วไปเข้า ให้เด้งกลับหน้าแรก
  if (requireAdmin && user.role !== 'admin') {
    alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ครับ');
    return <Navigate to="/" replace />;
  }

  // ✅ ถ้าผ่านเงื่อนไขทั้งหมด อนุญาตให้แสดงผลหน้านั้นได้
  return <>{children}</>;
}