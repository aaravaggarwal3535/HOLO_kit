import { useState, useEffect } from "react";
import { analyzeAPI } from "../services/authApi";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const CreatorDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [profileUrl, setProfileUrl] = useState("");
  const [applying, setApplying] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState(null);

  useEffect(() => {
    fetchData();
    fetchPremiumStatus();
  }, []);

  const fetchData = async () => {
    try {
      const [requestsRes, appsRes] = await Promise.all([
        analyzeAPI.get("/requests/all"),
        analyzeAPI.get("/requests/my-applications"),
      ]);
      setRequests(requestsRes.data);
      setMyApplications(appsRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setLoading(false);
    }
  };

  const fetchPremiumStatus = async () => {
    try {
      const response = await analyzeAPI.get("/premium/status");
      setPremiumStatus(response.data);
    } catch (error) {
      console.error("Failed to fetch premium status:", error);
    }
  };

  const handleApply = async (requestId) => {
    if (!profileUrl.trim()) {
      alert("Please enter your profile URL");
      return;
    }

    setApplying(true);
    try {
      await analyzeAPI.post("/requests/apply", {
        request_id: requestId,
        profile_url: profileUrl,
      });
      alert("Application submitted successfully! Your profile is being analyzed.");
      setSelectedRequest(null);
      setProfileUrl("");
      fetchData();
    } catch (error) {
      console.error("Failed to apply:", error);
      alert(error.response?.data?.detail || "Failed to submit application");
    } finally {
      setApplying(false);
    }
  };

  const hasApplied = (requestId) => {
    return myApplications.some((app) => app.request_id === requestId);
  };

  const getPlatformLabel = (platform) => {
    switch (platform?.toLowerCase()) {
      case "youtube":
        return "YT";
      case "github":
        return "GH";
      case "instagram":
        return "IG";
      default:
        return "WEB";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
        <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-lg text-slate-400 mt-6">Loading Your Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 relative overflow-hidden bg-slate-950">

      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Back to Home Navigation */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => window.location.href = '/'}
            className="group flex items-center gap-2 px-5 py-2 rounded-lg transition-all bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Back to Profile Analyzer
          </button>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              {premiumStatus?.is_premium ? (
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Creator Dashboard <span className="text-2xl">⭐</span>
                  </h1>
                  <p className="text-gray-400 text-lg">Welcome back, <span className="text-white font-semibold">{user.username}</span></p>
                </div>
              ) : (
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Creator Dashboard
                  </h1>
                  <p className="text-gray-400 text-lg">Welcome back, <span className="text-white font-semibold">{user.username}</span></p>
                </div>
              )}
            </div>
            
            {/* Premium Status / Upgrade Button */}
            <div>
              {premiumStatus?.is_premium ? (
                <div className="flex items-center gap-4">
                  <div className="px-6 py-3 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⭐</span>
                      <div>
                        <p className="text-white font-bold text-base">Premium Member</p>
                        {premiumStatus.premium_expires && (
                          <p className="text-sm text-gray-400">
                            Active until {new Date(premiumStatus.premium_expires).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => window.location.href = '/premium-upgrade'}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white font-semibold transition-all"
                  >
                    Manage
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => window.location.href = '/premium-upgrade'}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-all flex items-center gap-2"
                >
                  Upgrade to Premium
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* My Applications Section */}
        {myApplications.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-3xl font-bold text-white">
                My Applications ({myApplications.length})
              </h2>
              {premiumStatus?.is_premium && (
                <span className="px-3 py-1 bg-blue-900/30 border border-blue-500 rounded-full text-blue-400 text-xs font-semibold">Premium</span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myApplications.map((app, idx) => (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => window.location.href = `/profile/${app._id}`}
                  className={`p-6 rounded-xl cursor-pointer transition-all relative ${
                    premiumStatus?.is_premium
                      ? 'bg-slate-900 border-2 border-blue-500 shadow-lg'
                      : 'bg-slate-900 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="mb-2">
                    <span
                      className={`px-3 py-1 rounded text-sm font-semibold ${
                        app.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-300"
                          : app.status === "accepted"
                          ? "bg-green-500/20 text-green-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                  <p className="text-white font-semibold mb-2">
                    Request ID: {app.request_id.slice(0, 8)}...
                  </p>
                  {app.profile_data && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <p className="text-sm text-gray-300 mb-1">
                        {getPlatformLabel(app.profile_data.platform)}{" "}
                        {app.profile_data.channel_name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {app.profile_data.subscribers}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {app.profile_data.content_descriptor}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Applied:{" "}
                    {new Date(app.applied_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Click to view details →
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Available Requests */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-3xl font-bold text-white">
              Available Requests
            </h2>
            {premiumStatus?.is_premium && (
              <span className="px-4 py-2 bg-blue-900/30 border border-blue-500 rounded-full text-blue-400 font-semibold">Premium users get priority</span>
            )}
          </div>

          {requests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-slate-900 rounded-xl border border-slate-800"
            >
              <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center text-4xl text-gray-600 mb-6 mx-auto">0</div>
              <h3 className="text-2xl font-bold text-white mb-3">No Open Requests</h3>
              <p className="text-gray-400">
                {premiumStatus?.is_premium ? 'As a Premium member, you\'ll be notified first when new opportunities arrive!' : 'Check back later for new opportunities!'}
              </p>
            </motion.div>
          ) : (
            requests.map((request, idx) => (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-all"
              >
                {premiumStatus?.is_premium && (
                  <div className="absolute top-3 right-3 px-3 py-1 bg-slate-700 rounded-full text-white text-xs font-bold flex items-center gap-1">
                    <span>⭐</span>
                    Premium
                  </div>
                )}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {request.title}
                    </h3>
                    <p className="text-gray-400 mb-3">{request.description}</p>
                    <div className="flex flex-wrap gap-3 text-sm mb-3">
                      <span className="text-slate-300">
                        Budget: {request.budget}
                      </span>
                      <span className="text-slate-300">
                        Requirements: {request.requirements}
                      </span>
                      <span className="text-slate-300">
                        Deadline:{" "}
                        {new Date(request.deadline).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Posted by: {request.company_username}
                    </p>
                  </div>

                  {hasApplied(request._id) ? (
                    <span className="px-4 py-2 rounded-lg font-semibold bg-green-500/20 text-green-400 border border-green-500/40">
                      Applied
                    </span>
                  ) : (
                    <button
                      onClick={() => setSelectedRequest(request._id)}
                      className="px-5 py-2 rounded-lg transition-all font-semibold bg-slate-700 hover:bg-slate-600 text-white border border-slate-600"
                    >
                      Apply Now
                    </button>
                  )}
                </div>

                {/* Application Form */}
                {selectedRequest === request._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 pt-4 border-t border-slate-700"
                  >
                    <h4 className="text-lg font-semibold text-white mb-3">
                      Submit Your Profile
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-gray-300 mb-2 text-sm">
                          Profile URL (YouTube, GitHub, or Instagram)
                        </label>
                        <input
                          type="text"
                          value={profileUrl}
                          onChange={(e) => setProfileUrl(e.target.value)}
                          placeholder="e.g. https://www.youtube.com/@yourchannel"
                          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApply(request._id)}
                          disabled={applying}
                          className="px-8 py-3 rounded-lg transition-colors font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {applying ? "Submitting..." : "Submit Application"}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(null);
                            setProfileUrl("");
                          }}
                          className="px-6 py-3 rounded-lg transition-colors font-semibold bg-slate-700 hover:bg-slate-600 text-white"
                        >
                          Cancel
                        </button>
                      </div>
                      <p className="text-xs text-gray-400">
                        Note: Your profile will be automatically analyzed using AI to
                        verify your reach and content quality.
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Empty State */}
        {requests.length === 0 && myApplications.length === 0 && (
          <div className="text-center py-20">

            <h3 className="text-2xl font-bold text-white mb-2">
              No Requests Yet
            </h3>
            <p className="text-gray-400">
              Companies will post content creation opportunities here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorDashboard;
