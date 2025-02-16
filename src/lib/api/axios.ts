import axios, { AxiosError, AxiosInstance } from 'axios';
import { ApiResponse } from '../../types';

export class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Get token from localStorage or state management
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.get<T>(endpoint);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post<T>(endpoint, data);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.put<T>(endpoint, data);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.delete<T>(endpoint);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): ApiResponse<never> {
    // Create a safe error object that can be cloned
    const safeError = {
      message: error.response?.data?.message || error.message || 'An error occurred',
      code: error.response?.data?.code || error.code || 'API_ERROR',
      status: error.response?.status,
      details: error.response?.data
    };

    // Log the error safely
    console.error('API Error:', JSON.stringify(safeError, null, 2));

    return {
      error: {
        message: safeError.message,
        code: safeError.code,
      },
    };
  }

  // Helper method to update auth token
  setAuthToken(token: string) {
    localStorage.setItem('authToken', token);
  }

  // Helper method to clear auth token
  clearAuthToken() {
    localStorage.removeItem('authToken');
  }
}