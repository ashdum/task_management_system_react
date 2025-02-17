import { z } from 'zod';
import { config } from '../../config';
import { jwtDecode } from 'jwt-decode';

// Token validation schemas
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
    updatedAt: z.string().optional()
  })
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

  // Decode and validate JWT token
  public decodeToken(token: string): TokenPayload {
    try {
      const decoded = jwtDecode(token);
      const result = tokenPayloadSchema.safeParse(decoded);
      
      if (!result.success) {
        throw new Error('Invalid token payload');
      }
      
      return result.data;
    } catch (error) {
      throw new Error('Failed to decode token');
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

  // Check if access token is valid and not expired
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