// src/components/auth/OAuthButtons.tsx
import React from 'react';
import { Github, Chrome } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { config } from '../../config';

interface OAuthButtonsProps {
  type: 'login' | 'register';
  disabled: boolean;
  onGoogleSuccess: (credentialResponse: { credential?: string }) => void;
  onGoogleFailure: () => void;
  onGithubLogin: () => void;
}

const OAuthButtons: React.FC<OAuthButtonsProps> = ({ type, disabled, onGoogleSuccess, onGoogleFailure, onGithubLogin }) => {
  const { googleClientId } = config.getAuthConfig();

  if (!googleClientId) {
    console.error('Google Client ID is not configured. Please check your .env file.');
    return null;
  }

  return (
    <div className="mt-8">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4"> {/* Вертикальное расположение */}
        <GoogleOAuthProvider clientId={googleClientId}>
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={onGoogleFailure}
            type="standard"
            theme="filled_black"
            shape="rectangular"
            width="200"
            text={type === 'login' ? 'signin_with' : 'signup_with'}
            size="large"
            logo_alignment="left"
            containerProps={{
              className: 'w-full flex items-center justify-center gap-2 bg-gray-800 text-white py-3 px-4 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium',
            }}
          />
        </GoogleOAuthProvider>

        <button
          onClick={onGithubLogin}
          disabled={disabled}
          className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white py-3 px-4 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          tabIndex={type === 'register' ? 7 : 5}
        >
          <Github size={20} />
          GitHub
        </button>
      </div>
    </div>
  );
};

export default OAuthButtons;