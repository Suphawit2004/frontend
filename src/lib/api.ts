export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://nai-dee.tiwsuphawit1.workers.dev';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token');
  
  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

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
    
    // 💡 1. พยายามอ่านข้อมูล JSON จาก Response ก่อน เพื่อดูว่ามีข้อความ Error ไหม
    const data = await response.json();

    // 💡 2. ถ้าเซิร์ฟเวอร์ตอบกลับว่าไม่สำเร็จ (Status ไม่ใช่ 2xx)
    if (!response.ok) {
      // ถ้าเป็นเลข 401 และไม่ใช่หน้า Login ให้ถือว่า Session หมดอายุ
      if (response.status === 401 && endpoint !== '/api/auth/login') {
        throw new Error('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
      }
      
      // ถ้ามีข้อความ Error จากหลังบ้าน (เช่น "อีเมลหรือรหัสผ่านไม่ถูกต้อง") ให้ใช้ข้อความนั้น
      throw new Error(data.error || `เกิดข้อผิดพลาด: ${response.status}`);
    }

    return data;
  } catch (error: any) {
    console.error(`API Fetch Error [${endpoint}]:`, error);
    throw error;
  }
}