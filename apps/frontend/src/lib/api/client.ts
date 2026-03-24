import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      // Required: instructs the browser to send the HTTP-only auth cookie
      // with every cross-origin request to the backend
      withCredentials: true,
    });

    // Request interceptor — logging only; no token injection needed
    // because the browser attaches the cookie automatically
    this.client.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor — handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const isAuthMe = error.config?.url?.includes('/auth/me');

        // Don't log 401 errors for the initial session check as they are normal for guests
        if (!(isAuthMe && error.response?.status === 401)) {
          console.error(
            `[apiClient Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`,
            error.response?.status,
            error.response?.data
          );
        }

        if (error.response?.status === 401) {
          const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

          const isPublicRoute =
            pathname === '/' ||
            pathname === '' ||
            pathname.startsWith('/catalog') ||
            pathname.startsWith('/print-services') ||
            pathname.startsWith('/community') ||
            pathname.startsWith('/u/');

          // Redirect to root only when the user was on a protected page.
          // Skip the redirect on public routes to allow guest browsing.
          if (!isPublicRoute) {
            window.location.href = '/';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  // For file uploads — multipart/form-data with progress tracking
  async upload<T>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
