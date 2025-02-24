// src/services/api/apiClient.ts
import ky, { KyInstance, Options } from 'ky';
import { ApiResponse } from '../data/interface/dataTypes';
import { tokenManager } from '../auth/tokenManager';
import { config } from '../../config';

// Define ErrorResponse type to handle any JSON response
interface ErrorResponse {
  message?: string;
  code?: string;
  [key: string]: unknown; // Allow any additional properties from the server
}

class ApiClient {
  private static instance: ApiClient;
  private kyInstance: KyInstance;

  private constructor() {
    const apiConfig = config.getApiConfig();

    // Initialize Ky with base URL and timeout from config
    this.kyInstance = ky.create({
      prefixUrl: apiConfig.baseUrl,
      timeout: apiConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
      hooks: {
        beforeRequest: [
          (request) => {
            const accessToken = tokenManager.getTokens().accessToken;
            if (accessToken) {
              request.headers.set('Authorization', `Bearer ${accessToken}`);
            }
            return request;
          },
        ],
        beforeError: [
          async (error) => {
            const { response } = error;
            if (response) {
              try {
                const errorData: ErrorResponse = await response.json();
                error.message = errorData.message || `HTTP error! status: ${response.status}`;
                error.name = errorData.code || 'API_ERROR';
              } catch {
                error.message = `HTTP error! status: ${response.status}`;
                error.name = 'API_ERROR';
              }
            } else if (error.name === 'TimeoutError') {
              error.message = 'Таймаут запроса';
              error.name = 'TIMEOUT';
            } else if (!response) {
              error.message = 'Ошибка сети. Проверьте ваше интернет-соединение.';
              error.name = 'NETWORK_ERROR';
            }
            return error;
          },
        ],
      },
    });
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private async handleRequest<T>(endpoint: string, options: Partial<Options> = {}): Promise<T> {
    try {
      return await this.kyInstance(endpoint, options).json();
    } catch (error) {
      throw this.handleError(error as any);
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>> {
    const response = await this.handleRequest<T>(endpoint, {
      method: 'get',
      searchParams: params,
    });
    return { data: response, status: 200 };
  }

  async post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    const response = await this.handleRequest<T>(endpoint, {
      method: 'post',
      json: data,
    });
    return { data: response, status: 201 };
  }

  async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    const response = await this.handleRequest<T>(endpoint, {
      method: 'put',
      json: data,
    });
    return { data: response, status: 200 };
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await this.handleRequest<T>(endpoint, {
      method: 'delete',
    });
    return { data: response, status: 200 };
  }

  private handleError(error: any): ApiResponse<never> {
    let message = error.message || 'Произошла непредвиденная ошибка';
    let code = 'UNKNOWN_ERROR';
    const status = error.response?.status || 500;

    if (error.response) {
      const errData = error.response as unknown as ErrorResponse;
      message = errData.message || message;
      code = errData.code || code;
    } else if (error.name === 'TimeoutError') {
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
    tokenManager.setTokens(token, tokenManager.getTokens().refreshToken || '');
  }

  clearAuthToken() {
    tokenManager.removeTokens();
  }

  getAuthToken(): string | null {
    return tokenManager.getTokens().accessToken;
  }
}

export const apiClientInstance = ApiClient.getInstance();
export default apiClientInstance;