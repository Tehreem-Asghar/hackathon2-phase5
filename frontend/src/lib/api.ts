export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:30001').replace(/\/$/, '');

type FetchOptions = RequestInit & {
  headers?: Record<string, string>;
};

export const api = {
  async fetch(endpoint: string, options: FetchOptions = {}) {
    const token = localStorage.getItem('token');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
       // Optional: Dispatch logout event or handle globally
       // For now, we just return the response and let the caller/context handle it
    }

    return response;
  }
};
