// src/App.tsx
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './components/board/Dashboard';
import { User } from './types';
import authService from './services/auth/authService';

function AuthCallbackHandler() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasProcessed, setHasProcessed] = useState(false); // Флаг для предотвращения дублирования

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(location.search);
      const code = urlParams.get('code');
      if (code && location.pathname === '/auth/github/callback' && !hasProcessed) {
        try {
          setLoading(true);
          setError(null);
          console.log('Handling GitHub callback with code:', code); // Отладочный лог
          const user = await authService.signInWithGithub(code);
          // Перенаправляем на дашборд после успешной авторизации
          window.location.href = '/dashboard'; // Используем window.location.href для полного перенаправления
          setHasProcessed(true); // Устанавливаем флаг, чтобы не обрабатывать повторно
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
  }, [location, hasProcessed]); // Добавляем hasProcessed в зависимости, чтобы избежать повторных вызовов

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
            onClick={() => window.location.href = '/'} // Перенаправляем на главную
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return null; // Если всё прошло успешно, компонент не рендерится
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        setError(null);
        const currentUser = authService.getCurrentUser();
        if (currentUser && authService.isAuthenticated()) {
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        setError('Не удалось проверить авторизацию. Пожалуйста, войдите снова.');
        authService.signOut();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      setError('Не удалось выйти. Пожалуйста, попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

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
            onClick={() => setError(null)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<LandingPage setUser={setUser} />}
        />
        <Route
          path="/dashboard"
          element={
            user ? <Dashboard user={user} onSignOut={handleSignOut} /> : <Navigate to="/" replace />
          }
        />
        <Route path="/auth/github/callback" element={<AuthCallbackHandler />} />
      </Routes>
    </Router>
  );
}

export default App;