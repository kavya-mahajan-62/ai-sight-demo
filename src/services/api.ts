import type { ApiError, ApiResponse } from '@/types/entities';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
    try {
      const authData = localStorage.getItem('surveillance-auth');
      if (!authData) return null;
      const parsed = JSON.parse(authData);
      return parsed?.state?.token || null;
    } catch {
      return null;
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      // Token expired or invalid - clear auth and redirect
      localStorage.removeItem('surveillance-auth');
      window.location.href = '/login';
      throw new Error('Unauthorized - Please login again');
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If response is not JSON, use default error message
      }
      
      const error: ApiError = {
        message: errorMessage,
        status: response.status,
      };
      throw error;
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers,
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }
}

// Export singleton instance
export const api = new ApiClient();

// Convenience exports for common patterns
export const apiGet = <T>(endpoint: string) => api.get<T>(endpoint);
export const apiPost = <T>(endpoint: string, data?: unknown) => api.post<T>(endpoint, data);
export const apiPut = <T>(endpoint: string, data?: unknown) => api.put<T>(endpoint, data);
export const apiDelete = <T>(endpoint: string) => api.delete<T>(endpoint);
export const apiPatch = <T>(endpoint: string, data?: unknown) => api.patch<T>(endpoint, data);
