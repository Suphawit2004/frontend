export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://nai-dee.tiwsuphawit1.workers.dev';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token');
  
  const headers: Record<string, string> = {
    ...options.headers as Record<string, string>,
  };

  // 1. จัดการ Content-Type อัตโนมัติ (ยกเว้น FormData สำหรับอัปโหลดรูป)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // 2. แนบ Bearer Token ถ้ามี
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // 💡 3. ตรวจสอบสถานะการตอบกลับ (จุดที่แก้บั๊ก)
    if (!response.ok) {
      // ถ้าสถานะเป็น 401 (Unauthorized) ให้เตะออกหน้า Login
      if (response.status === 401 && endpoint !== '/api/auth/login') {
        localStorage.removeItem('auth_token');
        window.location.href = '/';
        return;
      }

      // พยายามอ่าน Error จาก JSON ถ้าไม่ได้ให้อ่านเป็น Text
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `Request failed with status ${response.status}`);
    }

    // 4. ส่งคืนข้อมูล JSON เมื่อสำเร็จเท่านั้น
    return await response.json();
  } catch (error: any) {
    console.error(`API Fetch Error [${endpoint}]:`, error.message);
    throw error;
  }
}