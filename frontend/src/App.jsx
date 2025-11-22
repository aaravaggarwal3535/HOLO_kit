import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';
import GlassCard from './components/GlassCard';
import Login from './components/Login';
import Signup from './components/Signup';
import CompanyDashboard from './components/CompanyDashboard';
import CreatorDashboard from './components/CreatorDashboard';
import ProfileDetail from './components/ProfileDetail';
import { analyzeAPI } from './services/authApi';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-dark-900">
      <div className="text-white">Loading...</div>
    </div>;
  }
  
  return user ? children : <Navigate to="/login" />;
}

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();

  const handleAnalyze = async (url) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await analyzeAPI.post('/analyze', { url });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError('');
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {user?.userType === 'company' ? (
              <CompanyDashboard />
            ) : (
              <CreatorDashboard />
            )}
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:applicationId"
        element={
          <ProtectedRoute>
            <ProfileDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <div className="relative">
              {/* Navigation buttons - always visible */}
              {user && (
                <div className="absolute top-4 right-4 z-50 flex gap-3">
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="px-4 py-2 glass-strong rounded-full text-white hover:bg-white/20 transition-all font-semibold"
                  >
                    📋 Dashboard
                  </button>
                  <button
                    onClick={logout}
                    className="px-4 py-2 glass-strong rounded-full text-white hover:bg-white/20 transition-all flex items-center gap-2"
                  >
                    <span>{user.username}</span>
                    <span className="text-xs opacity-60">({user.userType})</span>
                    <span>→</span>
                  </button>
                </div>
              )}
              
              <AnimatePresence mode="wait">
                {!result ? (
                  <LandingPage
                    key="landing"
                    onAnalyze={handleAnalyze}
                    loading={loading}
                    error={error}
                  />
                ) : (
                  <GlassCard
                    key="result"
                    data={result}
                    visible={true}
                    onReset={handleReset}
                  />
                )}
              </AnimatePresence>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
