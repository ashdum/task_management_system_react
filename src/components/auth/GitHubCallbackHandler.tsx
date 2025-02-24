// src/components/auth/GitHubCallbackHandler.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authService from '../../services/auth/authService';

let codeVal = "";

const GitHubCallbackHandler: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            const urlParams = new URLSearchParams(location.search);
            const code = urlParams.get('code');
            if (code && location.pathname === '/auth/github/callback' && code !== codeVal ) {
                try {
                    codeVal = code;
                    setLoading(true);
                    setError(null);
                    await authService.signInWithGithub(code); 
                    
                    window.location.href = '/dashboard';
                } catch (err) {
                    if (err instanceof Error) {
                        setError(err.message);
                    } else {
                        setError('Failed to authenticate with GitHub');
                    }
                } finally {
                    setLoading(false);
                }
            }
        };

        handleCallback();
    }, [location, navigate]); 

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Загрузка...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/')} // Перенаправляем на главную
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Вернуться на главную
                    </button>
                </div>
            </div>
        );
    }

    return null; 
};

export default GitHubCallbackHandler;