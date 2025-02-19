// src/services/auth/authService.ts
// Centralized auth service wrapping signIn, signUp, signOut and user retrieval

import { ApiResponse, User, AuthResponse, Dashboard } from '../../types';
import { tokenManager } from './tokenManager';
import {
  AuthError,
  UserNotFoundError,
  InvalidPasswordError,
  UserExistsError,
  ValidationError,
  AuthorizationError,
} from '../../lib/authErrors';
import { validateEmail, validateFullName, validatePassword } from './validation';
import { dataSource } from '../data/dataSource';

class AuthService {
  async signUp(email: string, fullName: string, password: string): Promise<User> {
    // Validate input
    const emailErrors = validateEmail(email);
    if (emailErrors.length > 0) {
      throw new ValidationError(emailErrors[0]);
    }
    const fullNameErrors = validateFullName(fullName);
    if (fullNameErrors.length > 0) {
      throw new ValidationError(fullNameErrors[0]);
    }
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      throw new ValidationError(passwordErrors[0]);
    }

    const response: ApiResponse<AuthResponse> = await dataSource.register(email, password, fullName);
    if (response.error) {
      if (response.error.code === 'USER_EXISTS') {
        throw new UserExistsError('email');
      }
      throw new AuthError(response.error.message);
    }
    if (!response.data) {
      throw new AuthError('Failed to create user account');
    }
    // Store tokens
    tokenManager.setTokens(response.data.token, response.data.refreshToken || response.data.token);
    // Remove tokens from returned user data using rest operator
    const {...userData } = response.data;
    return userData;
  }

  async signIn(email: string, password: string): Promise<User> {
    const emailErrors = validateEmail(email);
    if (emailErrors.length > 0) {
      throw new ValidationError(emailErrors[0]);
    }
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      throw new ValidationError(passwordErrors[0]);
    }

    const response: ApiResponse<AuthResponse> = await dataSource.login(email, password);
    if (response.error) {
      if (response.error.code === 'USER_NOT_FOUND') {
        throw new UserNotFoundError();
      }
      if (response.error.code === 'INVALID_PASSWORD') {
        throw new InvalidPasswordError();
      }
      throw new AuthError(response.error.message);
    }
    if (!response.data) {
      throw new AuthError('Failed to authenticate user');
    }
    tokenManager.setTokens(response.data.token, response.data.refreshToken || response.data.token);
    const {...userData } = response.data;
    return userData;
  }

  async signOut(): Promise<void> {
    try {
      await dataSource.logout();
      tokenManager.removeTokens();
    } catch (error) {
      console.error('Error during sign out:', error);
      tokenManager.removeTokens();
    }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      throw new ValidationError(passwordErrors[0]);
    }

    const response = await dataSource.changePassword(userId, oldPassword, newPassword);
    if (response.error) {
      if (response.error.code === 'INVALID_PASSWORD') {
        throw new InvalidPasswordError();
      }
      throw new AuthError(response.error.message);
    }
  }

  getCurrentUser(): User | null {
    const { accessToken } = tokenManager.getTokens();
    if (!accessToken) return null;
    try {
      const payload = tokenManager.decodeToken(accessToken);
      if (!payload || !payload.user) return null;
      return payload.user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return tokenManager.isTokenValid();
  }

  async getUserDashboards(): Promise<Dashboard[]> {
    const response = await dataSource.getDashboards();
    if (response.error) {
      throw new AuthorizationError('Failed to fetch user dashboards');
    }
    return response.data || [];
  }
}

export default new AuthService();
