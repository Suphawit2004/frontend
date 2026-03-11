// src/lib/api.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://nai-dee.tiwsuphawit1.workers.dev';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token');
  
  const headers: any = {
    ...options.headers,
  };

  // 💡 1. ถ้าไม่ใช่การอัปโหลดรูป (FormData) ให้ตั้งเป็น JSON อัตโนมัติ
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // 💡 2. แนบตั๋ว Token ไปใน Header ทุกครั้งที่มีในเครื่อง
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const defaultOptions: RequestInit = {
    credentials: 'include', 
    headers,
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, defaultOptions);
    
    // 💡 3. ถ้าเซิร์ฟเวอร์บอกว่าตั๋วหมดอายุ (401)
    if (response.status === 401 && endpoint !== '/api/auth/login') {
      localStorage.removeItem('auth_token'); // ลบตั๋วเสียทิ้ง
      throw new Error('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Error: ${response.status}`);
    }

    return data;
  } catch (error: any) {
    console.error(`API Fetch Error [${endpoint}]:`, error);
    throw error;
  }
}