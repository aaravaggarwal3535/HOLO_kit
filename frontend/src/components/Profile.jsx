import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyzeAPI } from '../services/authApi';
import { motion } from 'framer-motion';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [premiumStatus, setPremiumStatus] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Fetch complete user details
      const userResponse = await analyzeAPI.get('/auth/me');
      setUserDetails(userResponse.data);

      // Fetch premium status
      const premiumResponse = await analyzeAPI.get('/premium/status');
      setPremiumStatus(premiumResponse.data);

      // Fetch user stats based on user type
      if (user.userType === 'company') {
        const statsResponse = await analyzeAPI.get('/requests/my-requests');
        setStats({
          totalRequests: statsResponse.data.length,
          activeRequests: statsResponse.data.filter(r => r.status === 'active').length,
          totalApplications: statsResponse.data.reduce((sum, r) => sum + (r.applications_count || 0), 0)
        });
      } else {
        const applicationsResponse = await analyzeAPI.get('/requests/my-applications');
        setStats({
          totalApplications: applicationsResponse.data.length,
          pendingApplications: applicationsResponse.data.filter(a => a.status === 'pending').length,
          acceptedApplications: applicationsResponse.data.filter(a => a.status === 'accepted').length
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const displayUser = userDetails || user;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-slate-400 hover:text-white transition-colors"
        >
          ← Back
        </button>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 rounded-xl border border-slate-800 p-8 mb-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-4xl">
                {displayUser.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              
              {/* User Info */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{displayUser.username}</h1>
                  {premiumStatus?.is_premium && (
                    <span className="px-3 py-1 bg-yellow-500 text-slate-900 text-xs font-bold rounded-full">
                      PREMIUM
                    </span>
                  )}
                </div>
                <p className="text-slate-400 mb-1">{displayUser.email || 'Email not available'}</p>
                <p className="text-slate-500 text-sm mb-3 font-mono">ID: {displayUser.user_id || displayUser._id || 'N/A'}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className={`px-3 py-1 rounded-full ${
                    (displayUser.userType === 'company' || displayUser.user_type === 'company')
                      ? 'bg-purple-500/20 text-purple-400' 
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {(displayUser.userType === 'company' || displayUser.user_type === 'company') ? 'Company Account' : 'Creator Account'}
                  </span>
                  <span className="text-slate-400">
                    Joined {new Date(displayUser.created_at || Date.now()).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                Go to Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {user.userType === 'company' ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-900 rounded-xl border border-slate-800 p-6"
              >
                <h3 className="text-slate-400 text-sm mb-2">Total Requests</h3>
                <p className="text-3xl font-bold text-white">{stats?.totalRequests || 0}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-900 rounded-xl border border-slate-800 p-6"
              >
                <h3 className="text-slate-400 text-sm mb-2">Active Requests</h3>
                <p className="text-3xl font-bold text-green-400">{stats?.activeRequests || 0}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-900 rounded-xl border border-slate-800 p-6"
              >
                <h3 className="text-slate-400 text-sm mb-2">Total Applications</h3>
                <p className="text-3xl font-bold text-blue-400">{stats?.totalApplications || 0}</p>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-900 rounded-xl border border-slate-800 p-6"
              >
                <h3 className="text-slate-400 text-sm mb-2">Total Applications</h3>
                <p className="text-3xl font-bold text-white">{stats?.totalApplications || 0}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-900 rounded-xl border border-slate-800 p-6"
              >
                <h3 className="text-slate-400 text-sm mb-2">Pending</h3>
                <p className="text-3xl font-bold text-yellow-400">{stats?.pendingApplications || 0}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-900 rounded-xl border border-slate-800 p-6"
              >
                <h3 className="text-slate-400 text-sm mb-2">Accepted</h3>
                <p className="text-3xl font-bold text-green-400">{stats?.acceptedApplications || 0}</p>
              </motion.div>
            </>
          )}
        </div>

        {/* Account Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">Account Details</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-800">
              <span className="text-slate-400">Username</span>
              <span className="text-white font-semibold">{displayUser.username}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-800">
              <span className="text-slate-400">Email</span>
              <span className="text-white font-semibold">{displayUser.email || 'Not available'}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-800">
              <span className="text-slate-400">Account Type</span>
              <span className="text-white font-semibold capitalize">{displayUser.userType || displayUser.user_type}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-slate-400">User ID</span>
              <span className="text-white font-mono text-sm">{displayUser.user_id || displayUser._id || 'N/A'}</span>
            </div>
          </div>
        </motion.div>

        {/* Premium Status */}
        {premiumStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`rounded-xl border p-6 ${
              premiumStatus.is_premium 
                ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30' 
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            <h2 className="text-xl font-bold text-white mb-4">Premium Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Status</span>
                <span className={`px-3 py-1 rounded-full font-semibold ${
                  premiumStatus.is_premium 
                    ? 'bg-yellow-500 text-slate-900' 
                    : 'bg-slate-700 text-slate-300'
                }`}>
                  {premiumStatus.is_premium ? 'PREMIUM ACTIVE' : 'FREE ACCOUNT'}
                </span>
              </div>
              {premiumStatus.is_premium && premiumStatus.premium_expires && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Expires On</span>
                  <span className="text-white font-semibold">
                    {new Date(premiumStatus.premium_expires).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}
              {!premiumStatus.is_premium && (
                <button
                  onClick={() => navigate('/premium-upgrade')}
                  className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold rounded-lg transition-all"
                >
                  Upgrade to Premium
                </button>
              )}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
