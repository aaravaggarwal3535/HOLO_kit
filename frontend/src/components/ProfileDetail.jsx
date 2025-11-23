import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { analyzeAPI } from "../services/authApi";
import { motion } from "framer-motion";

const ProfileDetail = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicationDetail();
  }, [applicationId]);

  const fetchApplicationDetail = async () => {
    try {
      const response = await analyzeAPI.get(`/requests/application/${applicationId}`);
      setApplication(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch application:", error);
      setLoading(false);
    }
  };

  const getPlatformLabel = (platform) => {
    switch (platform?.toLowerCase()) {
      case "youtube":
        return "YouTube";
      case "github":
        return "GitHub";
      case "instagram":
        return "Instagram";
      default:
        return "Web";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-xl text-white">Loading profile...</div>
      </div>
    );
  }

  if (!application || !application.profile_data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="text-xl text-red-400 mb-4">Profile not found</div>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-400 hover:text-blue-300"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const profile = application.profile_data;
  const isPremium = application?.is_premium || false;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-slate-400 hover:text-white transition-colors"
        >
          ← Back to Dashboard
        </button>

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-slate-900 rounded-xl border p-8 mb-6 ${
            isPremium ? 'border-yellow-500' : 'border-slate-800'
          }`}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">
                  {profile.channel_name || application.creator_username}
                </h1>
                {isPremium && (
                  <span className="px-3 py-1 bg-yellow-500 text-slate-900 text-xs font-bold rounded-full">
                    PREMIUM
                  </span>
                )}
              </div>
              <p className="text-slate-400 mb-4">{profile.content_descriptor || "Content Creator"}</p>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-slate-400">Platform: </span>
                  <span className="text-white font-semibold">{getPlatformLabel(profile.platform)}</span>
                </div>
                <div>
                  <span className="text-slate-400">Followers: </span>
                  <span className="text-white font-semibold">{profile.subscribers}</span>
                </div>
              </div>
            </div>
            {application.profile_url && (
              <a
                href={application.profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Visit Profile
              </a>
            )}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900 rounded-xl border border-slate-800 p-6"
          >
            <h3 className="text-slate-400 text-sm mb-2">Estimated Reach</h3>
            <p className="text-2xl font-bold text-white">{profile.subscribers}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900 rounded-xl border border-slate-800 p-6"
          >
            <h3 className="text-slate-400 text-sm mb-2">Content Category</h3>
            <p className="text-2xl font-bold text-white">{profile.content_descriptor || "N/A"}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900 rounded-xl border border-slate-800 p-6"
          >
            <h3 className="text-slate-400 text-sm mb-2">Application Status</h3>
            <p className={`text-2xl font-bold capitalize ${
              application.status === 'accepted' ? 'text-green-400' :
              application.status === 'rejected' ? 'text-red-400' :
              'text-yellow-400'
            }`}>
              {application.status}
            </p>
          </motion.div>
        </div>

        {/* About Section */}
        {profile.about && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-white mb-3">About</h2>
            <p className="text-slate-300 leading-relaxed">{profile.about}</p>
          </motion.div>
        )}

        {/* AI Content Summary */}
        {profile.content_summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-white mb-3">AI Content Analysis</h2>
            <p className="text-slate-300 leading-relaxed">{profile.content_summary}</p>
          </motion.div>
        )}

        {/* Top Content */}
        {profile.top_content && profile.top_content.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">Top Content</h2>
            <div className="space-y-3">
              {profile.top_content.map((content, index) => (
                <div key={index} className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{content.title}</h3>
                      {content.views && (
                        <p className="text-sm text-slate-400">{content.views} views</p>
                      )}
                    </div>
                    {content.url && (
                      <a
                        href={content.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Watch →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Content Summaries */}
        {profile.summaries && profile.summaries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">Content Deep Dive</h2>
            <div className="space-y-4">
              {profile.summaries.map((summary, index) => (
                <div key={index} className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  {summary.video_title && (
                    <h3 className="font-semibold text-white mb-2">{summary.video_title}</h3>
                  )}
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {summary.summary || summary}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Request Information */}
        {application.request_id && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-slate-900 rounded-xl border border-slate-800 p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">Request Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {application.request_id.requirements && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-2">Requirements</h3>
                  <p className="text-white">{application.request_id.requirements}</p>
                </div>
              )}
              {application.request_id.budget && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-2">Budget</h3>
                  <p className="text-white">{application.request_id.budget}</p>
                </div>
              )}
              {application.request_id.deadline && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-2">Deadline</h3>
                  <p className="text-white">
                    {new Date(application.request_id.deadline).toLocaleDateString()}
                  </p>
                </div>
              )}
              {application.request_id.description && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-semibold text-slate-400 mb-2">Description</h3>
                  <p className="text-white">{application.request_id.description}</p>
                </div>
              )}
            </div>

            {/* Application Date */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-1">Applied On</h3>
                  <p className="text-white">
                    {new Date(application.applied_at).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default ProfileDetail;
