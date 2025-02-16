import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Layout, Users, Clock } from 'lucide-react';
import AuthModal from '../components/AuthModal';
import Footer from '../components/Footer';
import { User } from '../types';

interface Props {
  setUser: (user: User) => void;
}

const LandingPage: React.FC<Props> = ({ setUser }) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const navigate = useNavigate();

  const handleAuthSuccess = (email: string) => {
    const mockUser = {
      id: Math.random().toString(),
      email,
    };
    localStorage.setItem('mockUser', JSON.stringify(mockUser));
    setUser(mockUser);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Task Management System</h1>
          <div className="space-x-4">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Login
            </button>
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Register
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section className="bg-gradient-to-br from-blue-500 to-purple-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center">
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Streamline Your Workflow
              </h2>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Manage tasks, collaborate with teams, and boost productivity with our powerful task management system.
              </p>
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="px-8 py-4 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Get Started for Free
              </button>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12">Why Choose Our Platform?</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <Layout className="w-12 h-12 text-blue-600 mb-4" />
                <h4 className="text-xl font-semibold mb-2">Intuitive Interface</h4>
                <p className="text-gray-600">
                  Drag-and-drop functionality and clean design make task management a breeze.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <Users className="w-12 h-12 text-blue-600 mb-4" />
                <h4 className="text-xl font-semibold mb-2">Team Collaboration</h4>
                <p className="text-gray-600">
                  Work together seamlessly with your team members in real-time.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <Clock className="w-12 h-12 text-blue-600 mb-4" />
                <h4 className="text-xl font-semibold mb-2">Time Tracking</h4>
                <p className="text-gray-600">
                  Monitor progress and stay on schedule with built-in time tracking.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <AuthModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        type="login"
        onSuccess={handleAuthSuccess}
      />
      <AuthModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        type="register"
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default LandingPage;