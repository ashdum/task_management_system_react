import { z } from 'zod';
import { config } from '../../config';

// Token validation schemas
const tokenPayloadSchema = z.object({
  sub: z.string(),
  email: z.string().email(),
  exp: z.number(),
  iat: z.number(),
});

const refreshTokenPayloadSchema = z.object({
  sub: z.string(),
  jti: z.string(),
  exp: z.number(),
  iat: z.number(),
});

export type TokenPayload = z.infer<typeof tokenPayloadSchema>;
export type RefreshTokenPayload = z.infer<typeof refreshTokenPayloadSchema>;

export class TokenManager {
  private static instance: TokenManager;

  private constructor() {}

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  // Save tokens to httpOnly cookies
  public setTokens(accessToken: string, refreshToken: string): void {
    document.cookie = `${config.getAuthConfig().tokenKey}=${accessToken}; path=/; secure; samesite=strict; max-age=3600`;
    document.cookie = `${config.getAuthConfig().refreshTokenKey}=${refreshToken}; path=/; secure; samesite=strict; max-age=604800`;
  }

  // Get tokens from cookies
  public getTokens(): { accessToken: string | null; refreshToken: string | null } {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    return {
      accessToken: cookies[config.getAuthConfig().tokenKey] || null,
      refreshToken: cookies[config.getAuthConfig().refreshTokenKey] || null,
    };
  }

  // Remove tokens from cookies
  public removeTokens(): void {
    document.cookie = `${config.getAuthConfig().tokenKey}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `${config.getAuthConfig().refreshTokenKey}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }

  // Parse and validate JWT token
  public parseToken(token: string): TokenPayload | null {
    try {
      const [, payload] = token.split('.');
      const decodedPayload = JSON.parse(atob(payload));
      return tokenPayloadSchema.parse(decodedPayload);
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }

  // Parse and validate refresh token
  public parseRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      const [, payload] = token.split('.');
      const decodedPayload = JSON.parse(atob(payload));
      return refreshTokenPayloadSchema.parse(decodedPayload);
    } catch (error) {
      console.error('Error parsing refresh token:', error);
      return null;
    }
  }

  // Check if access token is expired
  public isTokenExpired(token: string): boolean {
    const payload = this.parseToken(token);
    if (!payload) return true;
    return Date.now() >= payload.exp * 1000;
  }

  // Check if refresh token is expired
  public isRefreshTokenExpired(token: string): boolean {
    const payload = this.parseRefreshToken(token);
    if (!payload) return true;
    return Date.now() >= payload.exp * 1000;
  }
}

export const tokenManager = TokenManager.getInstance();