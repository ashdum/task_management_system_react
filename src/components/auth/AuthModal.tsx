// src/components/auth/AuthModal.tsx
import React from 'react';
import { X } from 'lucide-react';
import { User } from '../../services/data/interface/dataTypes';
import EmailAuthForm from './EmailAuthForm';
import OAuthButtons from './OAuthButtons';
import useAuthModal from './useAuthModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'login' | 'register';
  onSuccess: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, type, onSuccess }) => {
  // Используем useAuthModal для получения состояния и функций
  const {
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
  } = useAuthModal({ onClose, onSuccess, type });

  if (!isOpen) return null;

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
          <span className="sr-only">Закрыть</span>
        </button>

        <h2 id="modal-title" className="text-3xl font-bold mb-8 text-center text-gray-900">
          {type === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <EmailAuthForm
          email={email}
          setEmail={setEmail}
          fullName={fullName}
          setFullName={setFullName}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showConfirmPassword={showConfirmPassword}
          setShowConfirmPassword={setShowConfirmPassword}
          onSubmit={handleSubmit}
          disabled={loading}
          type={type}
        />
        <OAuthButtons
          type={type}
          disabled={loading}
          onGoogleSuccess={handleGoogleLoginSuccess}
          onGoogleFailure={handleGoogleLoginFailure}
          onGithubLogin={handleGithubLogin}
        />
      </div>
    </div>
  );
};

export default AuthModal;