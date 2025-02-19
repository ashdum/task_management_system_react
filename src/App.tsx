import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './components/board/Dashboard';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        setError(null);
        const savedUser = localStorage.getItem('mockUser');
        
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          // Validate user data structure
          if (parsedUser && parsedUser.id && parsedUser.email) {
            setUser(parsedUser);
          } else {
            throw new Error('Invalid user data');
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setError('Failed to authenticate. Please try logging in again.');
        localStorage.removeItem('mockUser'); // Clear invalid data
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Cleanup function
    return () => {
      setLoading(false);
      setError(null);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      localStorage.removeItem('mockUser');
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
            Dismiss
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
          element={user ? <Navigate to="/dashboard" /> : <LandingPage setUser={setUser} />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard user={user} onSignOut={handleSignOut} /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;