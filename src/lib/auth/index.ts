import { tokenManager } from './tokens';
import { authInterceptor } from './interceptor';
import { dataSource } from '../data';
import type { User } from '../../types';
import {
  AuthError,
  UserNotFoundError,
  InvalidPasswordError,
  UserExistsError,
  TokenError,
  AuthorizationError,
  ValidationError,
} from './errors';
import { validatePassword, validateFullName, validateEmail } from './validation';

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

    // Check if user already exists in local storage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check email
    const existingEmail = users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
    if (existingEmail) {
      throw new UserExistsError('email');
    }

    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      fullName,
      createdAt: new Date().toISOString(),
    };

    // Save user to local storage
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Set as current user
    localStorage.setItem('mockUser', JSON.stringify(newUser));

    return newUser;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('Failed to create account');
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

    // Find user in local storage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new UserNotFoundError();
    }

    // In a real application, we would verify the password here
    // For the mock version, we'll simulate password verification
    const isPasswordValid = passwordErrors.length === 0;
    if (!isPasswordValid) {
      throw new InvalidPasswordError();
    }

    // Set as current user
    localStorage.setItem('mockUser', JSON.stringify(user));

    return user;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('Failed to sign in');
  }
};

export const signOut = async () => {
  try {
    localStorage.removeItem('mockUser');
  } catch (error) {
    throw new AuthError('Failed to sign out');
  }
};

export const getCurrentUser = (): User | null => {
  try {
    const userJson = localStorage.getItem('mockUser');
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const isUserAuthenticated = (): boolean => {
  return !!getCurrentUser();
};

export const getUserDashboards = () => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];

    const data = JSON.parse(localStorage.getItem('app_1.0_data') || '{"dashboards": []}');
    return data.dashboards.filter((dashboard: any) => 
      dashboard.ownerIds.includes(currentUser.id) ||
      dashboard.members.some((member: any) => member.id === currentUser.id)
    );
  } catch (error) {
    console.error('Error getting user dashboards:', error);
    return [];
  }
};