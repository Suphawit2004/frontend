// src/lib/api.ts

// เติมคำว่า export ไว้ข้างหน้าบรรทัดนี้ครับ 👇
export const API_BASE_URL = 'http://localhost:8787'; 

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
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