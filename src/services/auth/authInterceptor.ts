// src/services/auth/authInterceptor.ts
// Interceptor for handling token refresh on failed requests

import { tokenManager } from './tokenManager';
import { config } from '../../config';
import type { ApiResponse } from '../../types';

class AuthInterceptor {
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

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  private async refreshToken(): Promise<string | null> {
    const { refreshToken } = tokenManager.getTokens();
    if (!refreshToken) return null;

    try {
      const response = await fetch(config.getAuthConfig().refreshUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  public async interceptRequest(request: Request): Promise<Request> {
    const { accessToken, refreshToken } = tokenManager.getTokens();
    if (!accessToken || !refreshToken) return request;

    if (tokenManager.isTokenExpired(accessToken)) {
      if (this.isRefreshing) {
        const newToken = await new Promise<string>(resolve => {
          this.addRefreshSubscriber(resolve);
        });
        const newHeaders = new Headers(request.headers);
        newHeaders.set('Authorization', `Bearer ${newToken}`);
        return new Request(request.url, { ...request, headers: newHeaders });
      }
      this.isRefreshing = true;
      try {
        const newToken = await this.refreshToken();
        this.isRefreshing = false;
        if (!newToken) throw new Error('Failed to refresh token');
        this.onRefreshed(newToken);
        const newHeaders = new Headers(request.headers);
        newHeaders.set('Authorization', `Bearer ${newToken}`);
        return new Request(request.url, { ...request, headers: newHeaders });
      } catch (error) {
        this.isRefreshing = false;
        throw error;
      }
    }
    const newHeaders = new Headers(request.headers);
    newHeaders.set('Authorization', `Bearer ${accessToken}`);
    return new Request(request.url, { ...request, headers: newHeaders });
  }

  public async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (response.status === 401) {
      const newToken = await this.refreshToken();
      if (!newToken) {
        return { error: { message: 'Authentication failed', code: 'AUTH_ERROR', status: 401 } };
      }
      const newResponse = await fetch(response.url, {
        ...response,
        headers: { ...response.headers, Authorization: `Bearer ${newToken}` },
      });
      if (!newResponse.ok) {
        return { error: { message: 'Request failed after token refresh', code: 'API_ERROR', status: 401 } };
      }
      const data = await newResponse.json();
      return { data };
    }
    if (!response.ok) {
      return { error: { message: 'Request failed', code: 'API_ERROR', status: response.status } };
    }
    const data = await response.json();
    return { data };
  }
}

export const authInterceptor = AuthInterceptor.getInstance();
