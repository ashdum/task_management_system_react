import { tokenManager } from './auth/tokens';
import { dataSource } from './data';
import type { User, AuthResponse, ApiResponse } from '../types';
import {
  AuthError,
  UserNotFoundError,
  InvalidPasswordError,
  UserExistsError,
  TokenError,
  AuthorizationError,
  ValidationError,
} from './auth/errors';
import { validatePassword, validateFullName, validateEmail } from './auth/validation';

export {
  AuthError,
  UserNotFoundError,
  InvalidPasswordError,
  UserExistsError,
  TokenError,
  AuthorizationError,
  ValidationError,
};

export const signUp = async (email: string, fullName: string, password: string): Promise<User> => {
  try {
    // Validate email
    const emailErrors = validateEmail(email);
    if (emailErrors.length > 0) {
      throw new ValidationError(emailErrors[0]);
    }

    // Validate full name
    const fullNameErrors = validateFullName(fullName);
    if (fullNameErrors.length > 0) {
      throw new ValidationError(fullNameErrors[0]);
    }

    // Validate password
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      throw new ValidationError(passwordErrors[0]);
    }

    const response: ApiResponse<AuthResponse> = await dataSource.register(email, password);
    
    if (response.error) {
      if (response.error.code === 'USER_EXISTS') {
        throw new UserExistsError('email');
      }
      throw new AuthError(response.error.message);
    }

    if (!response.data) {
      throw new AuthError('Failed to create user account');
    }

    // Store the auth tokens
    const { token, refreshToken } = response.data;
    tokenManager.setTokens(token, refreshToken || token);

    // Return user data without tokens
    const { token: _, refreshToken: __, ...userData } = response.data;
    return userData;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('An unexpected error occurred during sign up');
  }
};

export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    // Validate email
    const emailErrors = validateEmail(email);
    if (emailErrors.length > 0) {
      throw new ValidationError(emailErrors[0]);
    }

    // Validate password
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

    // Store the auth tokens
    const { token, refreshToken } = response.data;
    tokenManager.setTokens(token, refreshToken || token);

    // Return user data without tokens
    const { token: _, refreshToken: __, ...userData } = response.data;
    return userData;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('An unexpected error occurred during sign in');
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await dataSource.logout();
    tokenManager.removeTokens();
  } catch (error) {
    console.error('Error during sign out:', error);
    // Still remove the tokens even if the API call fails
    tokenManager.removeTokens();
  }
};

export const getCurrentUser = (): User | null => {
  const { accessToken } = tokenManager.getTokens();
  if (!accessToken) {
    return null;
  }

  try {
    // Decode the token to get user info
    const payload = tokenManager.decodeToken(accessToken);
    if (!payload || !payload.user) {
      return null;
    }
    return payload.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const isUserAuthenticated = (): boolean => {
  return tokenManager.isTokenValid();
};

export const getUserDashboards = async () => {
  const response = await dataSource.getDashboards();
  
  if (response.error) {
    throw new AuthorizationError('Failed to fetch user dashboards');
  }

  return response.data || [];
};