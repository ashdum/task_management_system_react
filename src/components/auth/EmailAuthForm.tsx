// src/components/auth/EmailAuthForm.tsx
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import FormField from '../common/FormField'; // Предполагается, что этот компонент существует

interface EmailAuthFormProps {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  fullName: string;
  setFullName: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  confirmPassword: string;
  setConfirmPassword: React.Dispatch<React.SetStateAction<string>>;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  showConfirmPassword: boolean;
  setShowConfirmPassword: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit: (e: React.FormEvent) => void;
  disabled: boolean;
  type: 'login' | 'register';
}

// Определим подсказки (tooltips) как константы
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

const EmailAuthForm: React.FC<EmailAuthFormProps> = ({
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
  onSubmit,
  disabled,
  type,
}) => (
  <form onSubmit={onSubmit} className="space-y-6" aria-label={type === 'login' ? 'Login Form' : 'Register Form'}>
    <FormField
      label="Email"
      required
      tooltip={emailTooltip}
    >
      <div className="relative">
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          disabled={disabled}
          required
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
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={disabled}
            required
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
          type={showPassword ? 'text' : 'password'}
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          disabled={disabled}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed"
          disabled={disabled}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={disabled}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed"
            disabled={disabled}
            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </FormField>
    )}

    <button
      type="submit"
      disabled={disabled}
      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {type === 'login' ? 'Sign In with Email' : 'Create Account'} <span className="ml-2">📧</span>
    </button>
  </form>
);

export default EmailAuthForm;