// src/services/api/apiClient.ts
// Axios client for REST requests with token management

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from '../../types';
import { config } from '../../config';
import { tokenManager } from '../auth/tokenManager';

interface ErrorResponse {
  message?: string;
  code?: string;
}

class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;

  private constructor() {
    const apiConfig = config.getApiConfig();

    this.axiosInstance = axios.create({
      baseURL: apiConfig.baseUrl,
      timeout: apiConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to attach Authorization header if token exists
    this.axiosInstance.interceptors.request.use(
      (requestConfig: InternalAxiosRequestConfig) => {
        const accessToken = tokenManager.getTokens().accessToken;
        if (accessToken) {
          requestConfig.headers.Authorization = `Bearer ${accessToken}`;
        }
        return requestConfig;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => this.handleError(error)
    );
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.get<T>(endpoint, { params });
      return { data: response.data, status: response.status };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post<T>(endpoint, data);
      return { data: response.data, status: response.status };
    } catch (error) {8
      return this.handleError(error as AxiosError);
    }
  }

  async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.put<T>(endpoint, data);
      return { data: response.data, status: response.status };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.delete<T>(endpoint);
      return { data: response.data, status: response.status };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  private handleError(error: AxiosError): ApiResponse<never> {
    let message = 'Произошла непредвиденная ошибка';
    let code = 'UNKNOWN_ERROR';
    const status = error.response?.status || 500;

    if (error.response?.data) {
      const errData = error.response.data as ErrorResponse;
      message = errData.message || message;
      code = errData.code || code;
    } else if (error.code === 'ECONNABORTED') {
      message = 'Таймаут запроса';
      code = 'TIMEOUT';
    } else if (!error.response) {
      message = 'Ошибка сети. Проверьте ваше интернет-соединение.';
      code = 'NETWORK_ERROR';
    }

    console.error(`Ошибка API (${status}):`, message);

    if (status === 401) {
      this.handleUnauthorized();
    }

    return { error: { message, code, status } };
  }

  private handleUnauthorized() {
    tokenManager.removeTokens();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('unauthorized'));
    }
  }

  // Установить токен аутентификации (используется только для начальной настройки)
  setAuthToken(token: string) {
    tokenManager.setTokens(token, tokenManager.getTokens().refreshToken || "");
  }

  clearAuthToken() {
    tokenManager.removeTokens();
  }

  getAuthToken(): string | null {
    return tokenManager.getTokens().accessToken;
  }
}

export default ApiClient.getInstance();