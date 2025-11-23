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
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPremium, setFilterPremium] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [stats, setStats] = useState({
    totalRequests: 0,
    openRequests: 0,
    totalApplications: 0,
    premiumApplicants: 0
  });
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
      
      // Calculate stats
      const totalApps = response.data.reduce((sum, req) => sum + (req.application_count || 0), 0);
      const premiumApps = Object.values(applications).reduce((sum, apps) => {
        if (apps?.all_applications) {
          return sum + apps.all_applications.filter(app => app.is_premium).length;
        }
        return sum;
      }, 0);
      
      setStats({
        totalRequests: response.data.length,
        openRequests: response.data.filter(r => r.status === "open").length,
        totalApplications: totalApps,
        premiumApplicants: premiumApps
      });
      
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

  const getFilteredApplications = (apps) => {
    if (!apps) return [];
    
    let filtered = apps.all_applications || [];
    
    // Filter by premium status
    if (filterPremium === "premium") {
      filtered = filtered.filter(app => app.is_premium);
    } else if (filterPremium === "free") {
      filtered = filtered.filter(app => !app.is_premium);
    }
    
    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(app => app.status === filterStatus);
    }
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.creator_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.profile_data?.channel_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort premium first
    return filtered.sort((a, b) => (b.is_premium ? 1 : 0) - (a.is_premium ? 1 : 0));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1s'}}></div>
        </div>
        <p className="text-2xl text-cyan-300 mt-6 animate-pulse">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 py-8 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Back to Home Navigation */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => window.location.href = '/'}
            className="group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-lg border border-cyan-500/30 hover:border-cyan-500/60 rounded-lg transition-all text-cyan-400 hover:text-cyan-300"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Back to Profile Analyzer
          </button>
        </motion.div>
        
        {/* Header with Stats */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Company Dashboard
              </h1>
              <p className="text-gray-400 text-lg">Welcome back, <span className="text-white font-semibold">{user.username}</span></p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="p-5 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 font-bold">R</div>
                <span className="text-2xl font-bold text-white">{stats.totalRequests}</span>
              </div>
              <p className="text-gray-400 font-semibold">Total Requests</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="p-5 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 font-bold">O</div>
                <span className="text-2xl font-bold text-white">{stats.openRequests}</span>
              </div>
              <p className="text-gray-400 font-semibold">Open Requests</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="p-5 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 font-bold">A</div>
                <span className="text-2xl font-bold text-white">{stats.totalApplications}</span>
              </div>
              <p className="text-gray-400 font-semibold">Total Applications</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="p-5 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center text-yellow-400 font-bold">P</div>
                <span className="text-2xl font-bold text-white">{stats.premiumApplicants}</span>
              </div>
              <p className="text-gray-400 font-semibold">Premium Creators</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Create Request Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-all flex items-center gap-2"
          >
            <span className="text-xl">{showCreateForm ? "×" : "+"}</span>
            {showCreateForm ? "Cancel" : "Create New Request"}
          </button>
        </motion.div>

        {/* Create Request Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="mb-8 p-6 bg-slate-800 rounded-lg border border-slate-700"
          >
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-white">
                Create Content Request
              </h2>
            </div>
            <form onSubmit={handleCreateRequest} className="space-y-5">
              <div>
                <label className="block text-gray-400 mb-2 font-semibold text-sm">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-slate-500 transition-all"
                  placeholder="E.g. Tech Product Review Video"
                />
              </div>

              <div className="group">
                <label className="block text-gray-300 mb-2 font-semibold text-sm uppercase tracking-wide">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all group-hover:border-cyan-500/50 resize-none"
                  placeholder="Describe what you need..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group">
                  <label className="block text-gray-400 mb-2 font-semibold text-sm">Budget</label>
                  <input
                    type="text"
                    required
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({ ...formData, budget: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all group-hover:border-cyan-500/50"
                    placeholder="E.g. $500-1000"
                  />
                </div>

                <div className="group">
                  <label className="block text-gray-400 mb-2 font-semibold text-sm">Requirements</label>
                  <input
                    type="text"
                    required
                    value={formData.requirements}
                    onChange={(e) =>
                      setFormData({ ...formData, requirements: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all group-hover:border-cyan-500/50"
                    placeholder="E.g. 10K+ subscribers"
                  />
                </div>

                <div className="group">
                  <label className="block text-gray-400 mb-2 font-semibold text-sm">Deadline</label>
                  <input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all group-hover:border-cyan-500/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-8 py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-purple-500/50 text-lg"
              >
                Create Request
              </button>
            </form>
          </motion.div>
        )}

        {/* Requests List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black text-white flex items-center gap-3">

              Your Requests
            </h2>
          </div>

          {requests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 backdrop-blur-lg bg-white/5 rounded-2xl border border-gray-500/30"
            >
              <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center text-4xl text-gray-600 mb-6">0</div>
              <h3 className="text-2xl font-bold text-white mb-3">No Requests Yet</h3>
              <p className="text-gray-400 mb-6">Create your first request above to get started!</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold rounded-lg transition-all"
              >
                + Create First Request
              </button>
            </motion.div>
          ) : (
            requests.map((request, idx) => (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-cyan-500/30 hover:border-cyan-500/60 transition-all hover:shadow-xl hover:shadow-cyan-500/20"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold text-white">
                        {request.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          request.status === "open"
                            ? "bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-300 border border-green-500/50"
                            : "bg-gray-500/20 text-gray-300"
                        }`}
                      >
                        {request.status}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-4 text-lg">{request.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 rounded-lg font-semibold border border-cyan-500/30">
                        Budget: {request.budget}
                      </span>
                      <span className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-lg font-semibold border border-purple-500/30">
                        Requirements: {request.requirements}
                      </span>
                      <span className="px-4 py-2 bg-gradient-to-r from-pink-500/20 to-red-500/20 text-pink-300 rounded-lg font-semibold border border-pink-500/30">
                        Deadline: {new Date(request.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteRequest(request._id)}
                    className="ml-4 p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/30"
                    title="Delete Request"
                  >
                    Delete
                  </button>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => fetchApplications(request._id)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30 flex items-center gap-2"
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
                      className="mt-8 pt-8 border-t border-cyan-500/30"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-2xl font-bold text-white">
                          Applications ({applications[request._id].total_applications})
                        </h4>
                        
                        {/* Filters and Search */}
                        <div className="flex gap-3">
                          <select
                            value={filterPremium}
                            onChange={(e) => setFilterPremium(e.target.value)}
                            className="px-4 py-2 bg-white/10 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          >
                            <option value="all">All Types</option>
                            <option value="premium">Premium Only</option>
                            <option value="free">Free Only</option>
                          </select>
                          
                          <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 bg-white/10 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          
                          <input
                            type="text"
                            placeholder="Search creators..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-4 py-2 bg-white/10 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-500 placeholder-gray-400"
                          />
                          
                          <button
                            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                            className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-500/30 transition-all"
                            title={`Switch to ${viewMode === "grid" ? "list" : "grid"} view`}
                          >
                            {viewMode === "grid" ? "List" : "Grid"}
                          </button>
                        </div>
                      </div>

                      {/* Top 5 Creators */}
                      {applications[request._id].top_5.length > 0 && (
                        <div className="mb-8">
                          <div className="flex items-center gap-3 mb-4">
                            <h5 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                              Top 5 Creators
                            </h5>
                            <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/50 to-transparent"></div>
                          </div>
                          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                            {applications[request._id].top_5.map((app, index) => (
                              <div
                                key={app._id}
                                onClick={() => window.location.href = `/profile/${app._id}`}
                                className={`p-5 rounded-xl border cursor-pointer transition-all duration-500 ${
                                  app.is_premium
                                    ? "bg-gradient-to-br from-yellow-500/30 via-orange-500/25 to-pink-500/30 border-2 border-yellow-400 shadow-2xl shadow-yellow-500/40 hover:shadow-yellow-500/60 hover:scale-110 hover:-rotate-1 relative overflow-hidden animate-pulse"
                                    : "bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/40 hover:border-cyan-500/70 hover:scale-105"
                                }`}
                              >
                                
                                {/* Premium Badge */}
                                {app.is_premium && (
                                  <div className="absolute top-2 right-2 px-2 py-1 bg-slate-700 rounded text-xs font-bold text-white">
                                    Premium
                                  </div>
                                )}
                                
                                <div className="flex items-start justify-between mb-2">
                                  <span className="text-2xl font-bold text-white">
                                    #{index + 1}
                                  </span>
                                  <span
                                    className="text-2xl"
                                    style={{
                                      color: getPlatformColor(
                                        app.profile_data?.platform
                                      ),
                                    }}
                                  >
                                    {getPlatformLabel(app.profile_data?.platform)}
                                  </span>
                                </div>
                                <h6 className="font-semibold mb-2 text-white">
                                  {app.profile_data?.channel_name || app.creator_username}
                                </h6>
                                <div className="mb-2">
                                  <p className="text-sm text-gray-400">
                                    {app.profile_data?.subscribers || "N/A"}
                                  </p>
                                </div>
                                <p className={`text-xs mb-3 ${app.is_premium ? 'text-gray-200' : 'text-gray-400'}`}>
                                  {app.profile_data?.content_descriptor || ""}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs px-2 py-1 bg-slate-700 text-gray-300 rounded">
                                    {app.status}
                                  </span>
                                  <span className="text-xs text-gray-400">
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
                        <div className="flex items-center gap-3 mb-4">
                          <h5 className="text-xl font-bold text-gray-200">
                            All Applications
                          </h5>
                          <div className="h-px flex-1 bg-gradient-to-r from-gray-500/50 to-transparent"></div>
                          <span className="text-sm text-gray-400">
                            {getFilteredApplications(applications[request._id]).length} results
                          </span>
                        </div>
                        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-3"}>
                          {getFilteredApplications(applications[request._id]).map((app) => (
                            <div
                              key={app._id}
                              onClick={() => window.location.href = `/profile/${app._id}`}
                              className="p-4 rounded-lg border cursor-pointer transition-all relative bg-slate-800 border-slate-700 hover:border-slate-600"
                            >
                              
                              {/* Premium Badge for All Applications */}
                              {app.is_premium && (
                                <div className="absolute top-2 right-2 px-3 py-1 bg-slate-700 rounded text-xs font-bold text-white flex items-center gap-1">
                                  <span>⭐</span>
                                  Premium
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between relative">
                                <div className="flex-1 pr-4">
                                  <p className="font-semibold text-white">
                                    {app.creator_username}
                                  </p>
                                  <p className="text-sm text-gray-400 mt-1">
                                    {app.profile_data?.channel_name} • {app.profile_data?.subscribers}
                                  </p>
                                  <p className="text-sm mt-2 text-gray-500">
                                    Click to view profile →
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
