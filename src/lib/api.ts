// src/lib/api.ts

// ✅ แบบที่ถูกต้อง: ไม่ต้องมี / ปิดท้าย
export const API_BASE_URL = 'https://nai-dee.tiwsuphawit1.workers.dev'; 

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  // ถ้า endpoint ที่ส่งมาคือ '/api/auth/signup' 
  // การเขียนแบบด้านล่างจะทำให้ได้ ...workers.dev//api/... (มี / สองอัน)
  // const url = `${API_BASE_URL}${endpoint}`; 

  // ✨ วิธีแก้ที่ปลอดภัยที่สุด: เช็คและลบ / ที่ซ้ำซ้อน
  const cleanBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  const url = `${cleanBaseUrl}${cleanEndpoint}`;
  
  console.log("Calling API:", url); // ใส่ไว้ดูเพื่อความมั่นใจครับ

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูล');
  }

  return response.json();
}