// src/services/auth/tokenManager.ts
// Token manager: stores tokens in localStorage and decodes/validates JWT

import { z } from 'zod';
import { config } from '../../config';
import { jwtDecode } from 'jwt-decode';

// Schema for access token payload matching backend
const tokenPayloadSchema = z.object({
  sub: z.string(),
  email: z.string().email(),
  exp: z.number(),
  iat: z.number(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    fullName: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string().optional(),
  }),
});

export type TokenPayload = z.infer<typeof tokenPayloadSchema>;

class TokenManager {
  private static instance: TokenManager;

  private constructor() {}

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  // Save tokens into localStorage
  public setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(config.getAuthConfig().tokenKey, accessToken);
    localStorage.setItem(config.getAuthConfig().refreshTokenKey, refreshToken);
  }

  // Get tokens from localStorage
  public getTokens(): { accessToken: string | null; refreshToken: string | null } {
    return {
      accessToken: localStorage.getItem(config.getAuthConfig().tokenKey),
      refreshToken: localStorage.getItem(config.getAuthConfig().refreshTokenKey),
    };
  }

  // Remove tokens from localStorage
  public removeTokens(): void {
    localStorage.removeItem(config.getAuthConfig().tokenKey);
    localStorage.removeItem(config.getAuthConfig().refreshTokenKey);
  }

  public decodeToken(token: string): TokenPayload {
    try {
      const decoded = jwtDecode(token);
      const result = tokenPayloadSchema.safeParse(decoded);
      if (!result.success) {
        throw new Error('Неверный формат токена');
      }
      return result.data;
    } catch (error) {
      throw new Error('Не удалось декодировать токен');
    }
  }

  public isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    return Date.now() >= payload.exp * 1000;
  }

  public isTokenValid(): boolean {
    const { accessToken } = this.getTokens();
    if (!accessToken) return false;
    try {
      const decoded = this.decodeToken(accessToken);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }
}

export const tokenManager = TokenManager.getInstance();