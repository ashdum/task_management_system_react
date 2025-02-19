// src/components/auth/AuthModal.tsx
// Auth modal component using centralized authService
// Updated onSuccess to accept a User object instead of email string

import React, { useState, useRef, useEffect } from 'react';
import { X, Mail, User as UserIcon, Eye, EyeOff, Github, Chrome } from 'lucide-react';
import FormField from '../common/FormField';
import { 
  AuthError, 
  InvalidPasswordError, 
  UserExistsError, 
  UserNotFoundError, 
  ValidationError 
} from '../../lib/authErrors';
import AuthService from '../../services/auth/authService';
import type { User } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'login' | 'register';
  onSuccess: (user: User) => void; // Changed parameter type to User
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, type, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for focus management
  const modalRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const fullNameInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      emailInputRef.current?.focus();
    }
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
      onSuccess(user); // Pass the full user object
      onClose();
    } catch (err) {
      if (
        err instanceof UserNotFoundError ||
        err instanceof InvalidPasswordError ||
        err instanceof UserExistsError ||
        err instanceof ValidationError ||
        err instanceof AuthError
      ) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred');
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      // Implement Google OAuth login
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Google authentication failed');
      }

      const data = await response.json();
      // Assuming OAuth returns a complete User object
      onSuccess(data as User);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to authenticate with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      // Implement GitHub OAuth login
      const response = await fetch('/api/auth/github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('GitHub authentication failed');
      }

      const data = await response.json();
      onSuccess(data as User);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to authenticate with GitHub');
    } finally {
      setLoading(false);
    }
  };

  const passwordTooltip = (
    <div className="space-y-1">
      <p className="font-medium mb-2">Password must contain:</p>
      <ul className="list-disc list-inside space-y-1">
        <li>At least 8 characters</li>
        <li>One uppercase letter</li>
        <li>One lowercase letter</li>
        <li>One number</li>
        <li>One special character</li>
      </ul>
    </div>
  );

  const emailTooltip = (
    <div>
      <p>Enter a valid email address that you have access to. This will be used for account recovery and notifications.</p>
    </div>
  );

  const fullNameTooltip = (
    <div>
      <p>Enter your real name for better collaboration. Only letters, spaces, hyphens, and apostrophes are allowed.</p>
    </div>
  );

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow letters, spaces, hyphens, and apostrophes; capitalize each word
    const value = e.target.value.replace(/[^a-zA-Z\s'-]/g, '');
    const formattedValue = value
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    setFullName(formattedValue);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-lg p-8 max-w-lg w-full relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          tabIndex={-1}
        >
          <X size={24} />
          <span className="sr-only">Close</span>
        </button>
        
        <h2 id="modal-title" className="text-3xl font-bold mb-8 text-center text-gray-900">
          {type === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            label="Email"
            required
            tooltip={emailTooltip}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Mail size={20} />
              </div>
              <input
                ref={emailInputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your email"
                required
                disabled={loading}
                tabIndex={1}
              />
            </div>
          </FormField>

          {type === 'register' && (
            <FormField
              label="Full Name"
              required
              tooltip={fullNameTooltip}
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <UserIcon size={20} />
                </div>
                <input
                  ref={fullNameInputRef}
                  type="text"
                  value={fullName}
                  onChange={handleFullNameChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your full name"
                  required
                  disabled={loading}
                  tabIndex={2}
                />
              </div>
            </FormField>
          )}

          <FormField
            label="Password"
            required
            tooltip={passwordTooltip}
          >
            <div className="relative">
              <input
                ref={passwordInputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your password"
                required
                disabled={loading}
                tabIndex={type === 'register' ? 3 : 2}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                <span className="sr-only">
                  {showPassword ? 'Hide password' : 'Show password'}
                </span>
              </button>
            </div>
          </FormField>

          {type === 'register' && (
            <FormField
              label="Confirm Password"
              required
            >
              <div className="relative">
                <input
                  ref={confirmPasswordInputRef}
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Confirm your password"
                  required
                  disabled={loading}
                  tabIndex={4}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  <span className="sr-only">
                    {showConfirmPassword ? 'Hide password' : 'Show password'}
                  </span>
                </button>
              </div>
            </FormField>
          )}

          <button
            ref={submitButtonRef}
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
            tabIndex={type === 'register' ? 5 : 3}
          >
            <Mail size={20} />
            {loading 
              ? (type === 'login' ? 'Signing In...' : 'Creating Account...') 
              : (type === 'login' ? 'Sign In with Email' : 'Create Account')}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              tabIndex={type === 'register' ? 6 : 4}
            >
              <Chrome size={20} />
              Google
            </button>

            <button
              onClick={handleGithubLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white py-3 px-4 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              tabIndex={type === 'register' ? 7 : 5}
            >
              <Github size={20} />
              GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
