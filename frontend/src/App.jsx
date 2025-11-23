import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Features from './components/Features';
import Contact from './components/Contact';
import Login from './components/Login';
import Signup from './components/Signup';
import CompanyDashboard from './components/CompanyDashboard';
import CreatorDashboard from './components/CreatorDashboard';
import ProfileDetail from './components/ProfileDetail';
import PremiumUpgrade from './components/PremiumUpgrade';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-white">Loading...</div>
    </div>;
  }
  
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
      <Route path="/about" element={<PublicRoute><About /></PublicRoute>} />
      <Route path="/features" element={<PublicRoute><Features /></PublicRoute>} />
      <Route path="/pricing" element={<PublicRoute><PremiumUpgrade /></PublicRoute>} />
      <Route path="/contact" element={<PublicRoute><Contact /></PublicRoute>} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {useAuth().user?.userType === 'company' ? (
              <CompanyDashboard />
            ) : (
              <CreatorDashboard />
            )}
          </ProtectedRoute>
        }
      />
      <Route
        path="/premium-upgrade"
        element={
          <ProtectedRoute>
            <PremiumUpgrade />
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
    </Routes>
  );
}

export default App;
