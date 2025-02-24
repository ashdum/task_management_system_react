// src/components/auth/useAuthModal.ts
import { useState } from 'react';
import AuthService from '../../services/auth/authService';
import {
  AuthError,
  InvalidPasswordError,
  UserExistsError,
  UserNotFoundError,
  ValidationError,
} from '../../lib/authErrors';
import { User } from '../../services/data/interface/dataTypes';
import { useNavigate } from 'react-router-dom';
import { config } from '../../config';

interface UseAuthModalProps {
  onClose: () => void;
  onSuccess: (user: User) => void;
  type: 'login' | 'register';
}

const useAuthModal = ({ onClose, onSuccess, type }: UseAuthModalProps) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let user: User;
      if (type === 'register') {
        if (password !== confirmPassword) {
          throw new ValidationError('Passwords do not match');
        }
        user = await AuthService.signUp(email, fullName, password);
      } else {
        user = await AuthService.signIn(email, password);
      }
      onSuccess(user);
      onClose();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (
        err instanceof UserNotFoundError ||
        err instanceof InvalidPasswordError ||
        err instanceof UserExistsError ||
        err instanceof ValidationError ||
        err instanceof AuthError
      ) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse: { credential?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const user = await AuthService.signInWithGoogle(credentialResponse.credential!); // Используем AuthService для Google
      onSuccess(user);
      onClose();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err instanceof UserNotFoundError) {
        setError('Пользователь не найден');
      } else if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError('Failed to authenticate with Google');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginFailure = () => {
    setError('Google login failed');
    setLoading(false);
  };

  const handleGithubLogin = () => {
    try {
      setLoading(true);
      setError(null);
      if (AuthService.isAuthenticated()) {
        const user = AuthService.getCurrentUser();
        if (user) {
          onSuccess(user);
          onClose();
          navigate('/dashboard', { replace: true });
          setLoading(false);
          return;
        }
      }
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${config.getAuthConfig().githubClientId}&redirect_uri=${window.location.origin}/auth/github/callback&scope=user:email`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate GitHub login');
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    fullName,
    setFullName,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loading,
    error,
    handleSubmit,
    handleGoogleLoginSuccess,
    handleGoogleLoginFailure,
    handleGithubLogin,
    type,
  };
};

export default useAuthModal;