// src/App.tsx
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './components/board/Dashboard';
import { User } from './services/data/interface/dataTypes';
import authService from './services/auth/authService';
import GitHubCallbackHandler from './components/auth/GitHubCallbackHandler'; // Импортируем новый компонент

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
        <Route
          path="/dashboard/:dashboardId"
          element={
            user ? <Dashboard user={user} onSignOut={handleSignOut} /> : <Navigate to="/" replace />
          }
        />
        <Route path="/auth/github/callback" element={<GitHubCallbackHandler />} />
      </Routes>
    </Router>
  );
}

export default App;