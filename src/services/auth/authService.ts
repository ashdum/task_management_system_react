// src/services/auth/authService.ts
import { ApiResponse, User, AuthResponse, Dashboard } from '../../types';
import { tokenManager } from './tokenManager';
import {
  AuthError,
  UserNotFoundError,
  InvalidPasswordError,
  ValidationError,
  AuthorizationError,
} from '../../lib/authErrors';
import { validateEmail, validateFullName, validatePassword } from './validation';
import { dataSource } from '../data/dataSource';
import { DataSourceType, config } from '../../config';

class AuthService {
  async signUp(email: string, fullName: string, password: string): Promise<User> {
    if (config.getDataSource() === DataSourceType.LOCAL) {
      // Валидация для локального режима (если нужно)
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
    }

    const response: ApiResponse<AuthResponse> = await dataSource.register(email, password, fullName);
    if (response.error) {
      if (response.error.status === 401) {
        throw new AuthError('Пользователь с таким email уже существует');
      }
      throw new AuthError(response.error.message || 'Не удалось зарегистрировать пользователя');
    }
    if (!response.data) {
      throw new AuthError('Не удалось создать пользователя');
    }

    tokenManager.setTokens(response.data.accessToken, response.data.refreshToken);
    const decoded = tokenManager.decodeToken(response.data.accessToken);
    if (!decoded || !decoded.user) {
      throw new AuthError('Некорректный токен после регистрации');
    }
    return decoded.user;
  }

  async signIn(email: string, password: string): Promise<User> {
    if (config.getDataSource() === DataSourceType.LOCAL) {
      // Валидация для локального режима (если нужно)
      const emailErrors = validateEmail(email);
      if (emailErrors.length > 0) {
        throw new ValidationError(emailErrors[0]);
      }
      const passwordErrors = validatePassword(password);
      if (passwordErrors.length > 0) {
        throw new ValidationError(passwordErrors[0]);
      }
    }

    const response: ApiResponse<AuthResponse> = await dataSource.login(email, password);
    if (response.error) {
      if (response.error.status === 401) {
        throw new UserNotFoundError();
      }
      throw new AuthError(response.error.message || 'Не удалось войти');
    }
    if (!response.data) {
      throw new AuthError('Не удалось аутентифицировать пользователя');
    }

    tokenManager.setTokens(response.data.accessToken, response.data.refreshToken);
    const decoded = tokenManager.decodeToken(response.data.accessToken);
    if (!decoded || !decoded.user) {
      throw new AuthError('Некорректный токен после входа');
    }
    return decoded.user;
  }

  async signOut(): Promise<void> {
    try {
      await dataSource.logout();
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
    tokenManager.removeTokens();
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<User> {
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      throw new ValidationError(passwordErrors[0]);
    }

    const response = await dataSource.changePassword(userId, oldPassword, newPassword);
    if (response.error) {
      if (response.error.status === 401) {
        throw new InvalidPasswordError();
      }
      throw new AuthError(response.error.message || 'Не удалось сменить пароль');
    }

    let decoded: { user: User };
    if (config.getDataSource() === DataSourceType.LOCAL) {
      if (!response.data) {
        throw new AuthError('Не удалось обновить пароль');
      }
      const user = this.getCurrentUser();
      if (!user) {
        throw new AuthError('Пользователь не найден');
      }
      const { accessToken } = tokenManager.getTokens();
      if (!accessToken) {
        throw new AuthError('Токен отсутствует после смены пароля');
      }
      decoded = tokenManager.decodeToken(accessToken);
    } else {
      const authResponse = response.data as AuthResponse;
      if (!authResponse || !authResponse.accessToken) {
        throw new AuthError('Не удалось обновить пароль');
      }
      tokenManager.setTokens(authResponse.accessToken, authResponse.refreshToken);
      decoded = tokenManager.decodeToken(authResponse.accessToken);
    }

    if (!decoded || !decoded.user) {
      throw new AuthError('Некорректный токен после смены пароля');
    }
    return decoded.user;
  }

  getCurrentUser(): User | null {
    const { accessToken } = tokenManager.getTokens();
    if (!accessToken) return null;
    try {
      const payload = tokenManager.decodeToken(accessToken);
      return payload.user || null;
    } catch (error) {
      console.error('Ошибка получения текущего пользователя:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return tokenManager.isTokenValid();
  }

  async getUserDashboards(): Promise<Dashboard[]> {
    const response = await dataSource.getDashboards();
    if (response.error) {
      throw new AuthorizationError('Не удалось получить дашборды пользователя');
    }
    return response.data || [];
  }

  // Метод для Google OAuth
  async signInWithGoogle(credential: string): Promise<User> {
    const response: ApiResponse<AuthResponse> = await dataSource.googleLogin(credential);
    if (response.error) {
      if (response.error.status === 401) {
        throw new UserNotFoundError();
      }
      throw new AuthError(response.error.message || 'Не удалось войти через Google');
    }
    if (!response.data) {
      throw new AuthError('Не удалось аутентифицировать пользователя через Google');
    }

    tokenManager.setTokens(response.data.accessToken, response.data.refreshToken);
    const decoded = tokenManager.decodeToken(response.data.accessToken);
    if (!decoded || !decoded.user) {
      throw new AuthError('Некорректный токен после входа через Google');
    }
    return decoded.user;
  }

  // Метод для GitHub OAuth
  async signInWithGithub(code: string): Promise<User> {
    const response: ApiResponse<AuthResponse> = await dataSource.githubCallback(code);
    if (response.error) {
      if (response.error.status === 401) {
        throw new UserNotFoundError();
      }
      throw new AuthError(response.error.message || 'Не удалось войти через GitHub');
    }
    if (!response.data) {
      throw new AuthError('Не удалось аутентифицировать пользователя через GitHub');
    }

    tokenManager.setTokens(response.data.accessToken, response.data.refreshToken);
    const decoded = tokenManager.decodeToken(response.data.accessToken);
    if (!decoded || !decoded.user) {
      throw new AuthError('Некорректный токен после входа через GitHub');
    }
    return decoded.user;
  }
}

export default new AuthService();