import { tokenManager } from './tokens';
import { config } from '../../config';
import type { ApiResponse } from '../../types';

export class AuthInterceptor {
  private static instance: AuthInterceptor;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  private constructor() {}

  public static getInstance(): AuthInterceptor {
    if (!AuthInterceptor.instance) {
      AuthInterceptor.instance = new AuthInterceptor();
    }
    return AuthInterceptor.instance;
  }

  // Subscribe to token refresh
  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  // Add request to refresh subscribers
  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  // Refresh access token using refresh token
  private async refreshToken(): Promise<string | null> {
    const { refreshToken } = tokenManager.getTokens();
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${config.getApiConfig().baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) throw new Error('Failed to refresh token');

      const data = await response.json();
      tokenManager.setTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      tokenManager.removeTokens();
      return null;
    }
  }

  // Intercept requests and handle token refresh
  public async interceptRequest(request: Request): Promise<Request> {
    const { accessToken, refreshToken } = tokenManager.getTokens();

    // If no tokens exist, proceed with the request as is
    if (!accessToken || !refreshToken) {
      return request;
    }

    // Check if access token is expired
    if (tokenManager.isTokenExpired(accessToken)) {
      if (this.isRefreshing) {
        // Wait for the token to be refreshed
        const newToken = await new Promise<string>(resolve => {
          this.addRefreshSubscriber(resolve);
        });
        
        const newHeaders = new Headers(request.headers);
        newHeaders.set('Authorization', `Bearer ${newToken}`);
        return new Request(request.url, {
          ...request,
          headers: newHeaders,
        });
      }

      this.isRefreshing = true;

      try {
        const newToken = await this.refreshToken();
        this.isRefreshing = false;

        if (!newToken) {
          throw new Error('Failed to refresh token');
        }

        this.onRefreshed(newToken);

        const newHeaders = new Headers(request.headers);
        newHeaders.set('Authorization', `Bearer ${newToken}`);
        return new Request(request.url, {
          ...request,
          headers: newHeaders,
        });
      } catch (error) {
        this.isRefreshing = false;
        throw error;
      }
    }

    // Add access token to request
    const newHeaders = new Headers(request.headers);
    newHeaders.set('Authorization', `Bearer ${accessToken}`);
    return new Request(request.url, {
      ...request,
      headers: newHeaders,
    });
  }

  // Handle response and check for authentication errors
  public async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (response.status === 401) {
      // Try to refresh token
      const newToken = await this.refreshToken();
      if (!newToken) {
        return {
          error: {
            message: 'Authentication failed',
            code: 'AUTH_ERROR',
            status: 401,
          },
        };
      }

      // Retry the original request with the new token
      const newResponse = await fetch(response.url, {
        ...response,
        headers: {
          ...response.headers,
          Authorization: `Bearer ${newToken}`,
        },
      });

      if (!newResponse.ok) {
        return {
          error: {
            message: 'Request failed after token refresh',
            code: 'API_ERROR',
            status: 401,
          },
        };
      }

      const data = await newResponse.json();
      return { data };
    }

    if (!response.ok) {
      return {
        error: {
          message: 'Request failed',
          code: 'API_ERROR',
          status: 401,
        },
      };
    }

    const data = await response.json();
    return { data };
  }
}

export const authInterceptor = AuthInterceptor.getInstance();