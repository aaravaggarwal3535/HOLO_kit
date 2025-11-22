import { useState, useEffect } from "react";
import { analyzeAPI } from "../services/authApi";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [applications, setApplications] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    requirements: "",
    deadline: "",
  });

  // Fetch company's requests
  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const response = await analyzeAPI.get("/requests/my-requests");
      setRequests(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
      setLoading(false);
    }
  };

  const fetchApplications = async (requestId) => {
    try {
      const response = await analyzeAPI.get(`/requests/applications/${requestId}`);
      setApplications((prev) => ({
        ...prev,
        [requestId]: response.data,
      }));
      setSelectedRequest(requestId);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      await analyzeAPI.post("/requests/create", formData);
      setShowCreateForm(false);
      setFormData({
        title: "",
        description: "",
        budget: "",
        requirements: "",
        deadline: "",
      });
      fetchMyRequests();
    } catch (error) {
      console.error("Failed to create request:", error);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (confirm("Are you sure you want to delete this request?")) {
      try {
        await analyzeAPI.delete(`/requests/${requestId}`);
        fetchMyRequests();
      } catch (error) {
        console.error("Failed to delete request:", error);
      }
    }
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

  const getPlatformColor = (platform) => {
    switch (platform?.toLowerCase()) {
      case "youtube":
        return "#FF0000";
      case "github":
        return "#8B5CF6";
      case "instagram":
        return "#E4405F";
      default:
        return "#22D3EE";
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
            Company Dashboard
          </h1>
          <p className="text-gray-400">Welcome back, {user.username}</p>
        </div>

        {/* Create Request Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-6 py-3 rounded-lg transition-all"
          >
            {showCreateForm ? "Cancel" : "+ Create New Request"}
          </button>
        </div>

        {/* Create Request Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-white/5 backdrop-blur-lg rounded-xl border border-cyan-500/30"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Create Content Request
            </h2>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="E.g. Tech Product Review Video"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 bg-white/10 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Describe what you need..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Budget</label>
                  <input
                    type="text"
                    required
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({ ...formData, budget: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    placeholder="E.g. $500-1000"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">
                    Requirements
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.requirements}
                    onChange={(e) =>
                      setFormData({ ...formData, requirements: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    placeholder="E.g. 10K+ subscribers"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Deadline</label>
                  <input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-6 py-3 rounded-lg transition-all"
              >
                Create Request
              </button>
            </form>
          </motion.div>
        )}

        {/* Requests List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Your Requests</h2>

          {requests.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No requests yet. Create your first request above!
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
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {request.title}
                    </h3>
                    <p className="text-gray-400 mb-2">{request.description}</p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="text-cyan-300">
                        💰 {request.budget}
                      </span>
                      <span className="text-purple-300">
                        📋 {request.requirements}
                      </span>
                      <span className="text-pink-300">
                        📅 {new Date(request.deadline).toLocaleDateString()}
                      </span>
                      <span
                        className={`px-2 py-1 rounded ${
                          request.status === "open"
                            ? "bg-green-500/20 text-green-300"
                            : "bg-gray-500/20 text-gray-300"
                        }`}
                      >
                        {request.status}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteRequest(request._id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    🗑️
                  </button>
                </div>

                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => fetchApplications(request._id)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-all"
                  >
                    View Applications
                  </button>
                </div>

                {/* Applications Panel */}
                {selectedRequest === request._id &&
                  applications[request._id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-6 pt-6 border-t border-cyan-500/30"
                    >
                      <h4 className="text-lg font-bold text-white mb-4">
                        Applications ({applications[request._id].total_applications})
                      </h4>

                      {/* Top 5 Creators */}
                      {applications[request._id].top_5.length > 0 && (
                        <div className="mb-6">
                          <h5 className="text-md font-semibold text-cyan-300 mb-3">
                            🏆 Top 5 Creators
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {applications[request._id].top_5.map((app, index) => (
                              <div
                                key={app._id}
                                onClick={() => window.location.href = `/profile/${app._id}`}
                                className="p-4 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-lg border border-cyan-500/40 cursor-pointer hover:border-cyan-500/70 hover:scale-105 transition-all"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <span className="text-2xl">
                                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🌟"}
                                  </span>
                                  <span
                                    className="text-2xl"
                                    style={{
                                      color: getPlatformColor(
                                        app.profile_data?.platform
                                      ),
                                    }}
                                  >
                                    {getPlatformEmoji(app.profile_data?.platform)}
                                  </span>
                                </div>
                                <h6 className="font-bold text-white mb-1">
                                  {app.profile_data?.channel_name || app.creator_username}
                                </h6>
                                <p className="text-sm text-cyan-300 mb-2">
                                  {app.profile_data?.subscribers || "N/A"}
                                </p>
                                <p className="text-xs text-gray-400 mb-3">
                                  {app.profile_data?.content_descriptor || ""}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded">
                                    {app.status}
                                  </span>
                                  <span className="text-xs text-cyan-400">
                                    Click for details →
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* All Applications */}
                      <div>
                        <h5 className="text-md font-semibold text-gray-300 mb-3">
                          All Applications
                        </h5>
                        <div className="space-y-3">
                          {applications[request._id].all_applications.map((app) => (
                            <div
                              key={app._id}
                              onClick={() => window.location.href = `/profile/${app._id}`}
                              className="p-4 bg-white/5 rounded-lg border border-gray-500/30 hover:border-cyan-500/40 cursor-pointer transition-all"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-white">
                                    {app.creator_username}
                                  </p>
                                  <p className="text-sm text-gray-400">
                                    {app.profile_data?.channel_name} •{" "}
                                    {app.profile_data?.subscribers}
                                  </p>
                                  <p className="text-xs text-cyan-400 mt-1">
                                    Click to view full profile →
                                  </p>
                                </div>
                                <span
                                  className={`px-3 py-1 rounded text-sm ${
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
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
