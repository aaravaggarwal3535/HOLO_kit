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

  useEffect(() => {
    fetchData();
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

  const getPlatformEmoji = (platform) => {
    switch (platform?.toLowerCase()) {
      case "youtube":
        return "🎥";
      case "github":
        return "💻";
      case "instagram":
        return "📸";
      default:
        return "🌐";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-cyan-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back to Home Navigation */}
        <div className="mb-6">
          <button
            onClick={() => window.location.href = '/'}
            className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2"
          >
            ← Back to Profile Analyzer
          </button>
        </div>
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Creator Dashboard
          </h1>
          <p className="text-gray-400">Welcome back, {user.username}</p>
        </div>

        {/* My Applications Section */}
        {myApplications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              My Applications ({myApplications.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myApplications.map((app) => (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => window.location.href = `/profile/${app._id}`}
                  className="p-4 bg-white/5 backdrop-blur-lg rounded-xl border border-cyan-500/30 cursor-pointer hover:border-cyan-500/60 hover:scale-105 transition-all"
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
                        {getPlatformEmoji(app.profile_data.platform)}{" "}
                        {app.profile_data.channel_name}
                      </p>
                      <p className="text-xs text-cyan-300">
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
                  <p className="text-xs text-cyan-400 mt-2">
                    Click to view details →
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Available Requests */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Available Requests</h2>

          {requests.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No open requests available at the moment. Check back later!
            </div>
          ) : (
            requests.map((request) => (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-white/5 backdrop-blur-lg rounded-xl border border-cyan-500/30"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {request.title}
                    </h3>
                    <p className="text-gray-400 mb-3">{request.description}</p>
                    <div className="flex flex-wrap gap-3 text-sm mb-3">
                      <span className="text-cyan-300">
                        💰 {request.budget}
                      </span>
                      <span className="text-purple-300">
                        📋 {request.requirements}
                      </span>
                      <span className="text-pink-300">
                        📅 Deadline:{" "}
                        {new Date(request.deadline).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Posted by: {request.company_username}
                    </p>
                  </div>

                  {hasApplied(request._id) ? (
                    <span className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg font-semibold">
                      ✓ Applied
                    </span>
                  ) : (
                    <button
                      onClick={() => setSelectedRequest(request._id)}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-all font-semibold"
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
                    className="mt-4 pt-4 border-t border-cyan-500/30"
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
                          className="w-full px-4 py-2 bg-white/10 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApply(request._id)}
                          disabled={applying}
                          className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 text-white px-6 py-2 rounded-lg transition-all font-semibold"
                        >
                          {applying ? "Analyzing..." : "Submit Application"}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(null);
                            setProfileUrl("");
                          }}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                      <p className="text-xs text-gray-400">
                        💡 Your profile will be automatically analyzed using AI to
                        verify your reach and content quality.
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Empty State */}
        {requests.length === 0 && myApplications.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🚀</div>
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
