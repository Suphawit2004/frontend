export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5173'; // Adjust base URL as needed
  const url = `${baseURL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Include cookies for authentication
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}