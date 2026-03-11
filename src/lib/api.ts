// เปลี่ยน URL นี้ให้ตรงกับเซิร์ฟเวอร์จริงของคุณเมื่อ Deploy
export const API_BASE_URL = 'https://nai-dee.tiwsuphawit1.workers.dev'; 

export const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  // รองรับทั้งการเรียกแบบใส่ / นำหน้าและไม่ใส่
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // 💡 3. สำคัญที่สุด: สั่งให้แนบ Cookie ไปกับทุก Request
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error(`API Fetch Error [${endpoint}]:`, error);
    return { error: error.message || 'Network error' };
  }
};