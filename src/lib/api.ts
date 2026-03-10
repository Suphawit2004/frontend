// ดึง Base URL จาก Environment Variable
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5173';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const baseURL = API_BASE_URL.replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseURL}${cleanEndpoint}`;

  const response = await fetch(url, {
    ...options,
    credentials: 'include', // สำคัญ: เพื่อให้ส่ง Cookie สำหรับตรวจสอบสิทธิ์
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  // ป้องกัน Error จากการ parse HTML (กรณี 404/500)
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}