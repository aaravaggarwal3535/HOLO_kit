import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { analyzeAPI } from "../services/authApi";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float, MeshTransmissionMaterial, Text, Sphere, OrbitControls } from "@react-three/drei";
import { useRef } from "react";

// 3D Floating Glass Sphere
function FloatingGlassSphere({ position, scale }) {
  const meshRef = useRef();
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.2;
      meshRef.current.rotation.y = Math.cos(clock.getElapsedTime() * 0.2) * 0.3;
      meshRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.5) * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 64, 64]} position={position} scale={scale}>
        <MeshTransmissionMaterial
          backside
          samples={16}
          resolution={512}
          transmission={0.95}
          roughness={0.1}
          thickness={1.5}
          ior={1.5}
          chromaticAberration={0.5}
          anisotropy={0.3}
          distortion={0.2}
          distortionScale={0.5}
          temporalDistortion={0.1}
          color="#22D3EE"
        />
      </Sphere>
    </Float>
  );
}

// 3D Scene Component
function Scene() {
  return (
    <>
      <Stars radius={100} depth={50} count={7000} factor={6} saturation={0} fade speed={1} />
      <FloatingGlassSphere position={[-4, 2, -5]} scale={1.5} />
      <FloatingGlassSphere position={[4, -2, -8]} scale={2} />
      <FloatingGlassSphere position={[0, 3, -6]} scale={1.2} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </>
  );
}

const ProfileDetail = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coverImage, setCoverImage] = useState(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  
  // Mouse movement tracking for 3D tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), {
    stiffness: 100,
    damping: 30
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), {
    stiffness: 100,
    damping: 30
  });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  useEffect(() => {
    fetchApplicationDetail();
  }, [applicationId]);

  const fetchApplicationDetail = async () => {
    try {
      const response = await analyzeAPI.get(`/requests/application/${applicationId}`);
      setApplication(response.data);
      
      // Generate cover image after fetching profile
      if (response.data.profile_data) {
        generateCoverImage(response.data.profile_data);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch application:", error);
      setLoading(false);
    }
  };

  const generateCoverImage = async (profileData) => {
    setGeneratingImage(true);
    try {
      const response = await analyzeAPI.post("/image/generate-profile-cover", {
        platform: profileData.platform || "youtube",
        channel_name: profileData.channel_name || "Creator",
        subscribers: profileData.subscribers || "0",
        category: profileData.content_descriptor || "Content"
      });
      
      if (response.data.image_url) {
        setCoverImage(response.data.image_url);
      }
    } catch (error) {
      console.error("Failed to generate cover image:", error);
      // Create a gradient fallback
      const colors = {
        youtube: "from-red-600 to-pink-600",
        github: "from-purple-600 to-indigo-600",
        instagram: "from-pink-600 to-orange-600"
      };
      const gradient = colors[profileData.platform?.toLowerCase()] || "from-cyan-600 to-purple-600";
      setCoverImage(gradient);
    } finally {
      setGeneratingImage(false);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <div className="text-2xl text-cyan-300">Loading profile...</div>
      </div>
    );
  }

  if (!application || !application.profile_data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <div className="text-center">
          <div className="text-2xl text-red-400 mb-4">Profile not found</div>
          <button
            onClick={() => navigate(-1)}
            className="text-cyan-400 hover:text-cyan-300"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const profile = application.profile_data;
  const platformColor = getPlatformColor(profile.platform);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Enhanced 3D Background */}
      <div className="fixed inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
          <Scene />
        </Canvas>
      </div>

      <div className="relative z-10 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="mb-8 text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2 text-lg font-semibold"
          >
            ← Back to Dashboard
          </motion.button>

          {/* Dynamic Cover Image */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative mb-12 rounded-3xl overflow-hidden"
            style={{ height: "400px" }}
          >
            {generatingImage ? (
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 backdrop-blur-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-4 animate-spin">🎨</div>
                  <p className="text-white text-lg font-semibold">Generating cover image...</p>
                </div>
              </div>
            ) : coverImage && coverImage.startsWith("http") ? (
              <div className="relative w-full h-full">
                <img
                  src={coverImage}
                  alt="Profile Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent"></div>
              </div>
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-r ${coverImage || "from-cyan-600 to-purple-600"}`}>
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
              </div>
            )}
            
            {/* Overlay Content */}
            <div className="absolute bottom-8 left-8 right-8 z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="text-7xl"
                    style={{ filter: `drop-shadow(0 0 20px ${platformColor})` }}
                  >
                    {getPlatformEmoji(profile.platform)}
                  </div>
                  <div>
                    <h1 className="text-5xl font-black text-white mb-2 drop-shadow-2xl">
                      {profile.channel_name || application.creator_username}
                    </h1>
                    <p 
                      className="text-3xl font-bold"
                      style={{ 
                        color: platformColor,
                        textShadow: `0 0 20px ${platformColor}80`,
                      }}
                    >
                      {profile.subscribers}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="px-4 py-2 rounded-full text-sm font-bold backdrop-blur-xl"
                    style={{
                      backgroundColor: platformColor + "40",
                      color: "white",
                      border: `2px solid ${platformColor}`,
                    }}
                  >
                    {profile.platform?.toUpperCase()}
                  </span>
                  <a
                    href={application.profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-xl text-white hover:bg-white/30 transition-all text-sm font-semibold flex items-center gap-2 border border-white/30"
                  >
                    Visit Profile 🔗
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* 3D Glass Cards for Reach & Category */}
          <div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Reach Card */}
            <motion.div
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div 
                className="relative p-8 rounded-3xl backdrop-blur-2xl border-2 border-cyan-500/40 overflow-hidden"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
                  transform: "translateZ(50px)",
                }}
              >
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 animate-pulse"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/50">
                      📊
                    </div>
                    <h3 className="text-3xl font-bold text-white">Reach</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Total Audience</p>
                      <p 
                        className="text-5xl font-black mb-2"
                        style={{ 
                          color: platformColor,
                          textShadow: `0 0 20px ${platformColor}80`,
                        }}
                      >
                        {profile.subscribers}
                      </p>
                    </div>
                    
                    <div className="pt-4 border-t border-cyan-500/30">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                        <p className="text-sm text-gray-300">
                          Active & Verified Audience
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3D effect decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full blur-2xl"></div>
              </div>
            </motion.div>

            {/* Category Card */}
            <motion.div
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div 
                className="relative p-8 rounded-3xl backdrop-blur-2xl border-2 border-purple-500/40 overflow-hidden"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
                  transform: "translateZ(50px)",
                }}
              >
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 animate-pulse"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-3xl shadow-lg shadow-purple-500/50">
                      🎯
                    </div>
                    <h3 className="text-3xl font-bold text-white">Category</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400 uppercase tracking-wider mb-3">Content Type</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-4 py-2 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full text-white font-semibold text-lg border border-purple-400/50">
                          {profile.content_descriptor || "Content Creator"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-purple-500/30">
                      <p className="text-sm text-gray-400 mb-2">Platform Focus</p>
                      <div className="flex items-center gap-3">
                        <span 
                          className="text-3xl"
                          style={{ filter: `drop-shadow(0 0 10px ${platformColor})` }}
                        >
                          {getPlatformEmoji(profile.platform)}
                        </span>
                        <span className="text-white font-semibold">
                          {profile.platform?.charAt(0).toUpperCase() + profile.platform?.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3D effect decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-500/20 to-transparent rounded-full blur-2xl"></div>
              </div>
            </motion.div>
          </div>

          {/* About Section */}
          {profile.about && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mb-8 relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative p-8 backdrop-blur-xl bg-white/5 rounded-2xl border border-cyan-500/30">
                <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="text-4xl">📝</span>
                  About
                </h2>
                <p className="text-gray-200 leading-relaxed text-lg">{profile.about}</p>
              </div>
            </motion.div>
          )}

          {/* Content Summary */}
          {profile.content_summary && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mb-8 relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative p-8 backdrop-blur-xl bg-white/5 rounded-2xl border border-purple-500/30">
                <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="text-4xl">🎯</span>
                  AI Content Analysis
                </h2>
                <p className="text-gray-200 leading-relaxed text-lg">
                  {profile.content_summary}
                </p>
              </div>
            </motion.div>
          )}

          {/* Top Content */}
          {profile.top_content && profile.top_content.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-4xl">🔥</span>
                Top Content
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.top_content.map((content, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all"></div>
                    <div className="relative p-6 backdrop-blur-xl bg-white/5 rounded-xl border border-orange-500/30 hover:border-orange-500/60 transition-all">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-2xl">{index + 1}.</span>
                        <h3 className="font-bold text-white text-lg flex-1">
                          {content.title}
                        </h3>
                      </div>
                      {content.views && (
                        <p className="text-sm text-orange-300 mb-3 flex items-center gap-2">
                          <span className="text-xl">👁️</span>
                          {content.views} views
                        </p>
                      )}
                      {content.url && (
                        <a
                          href={content.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-semibold"
                        >
                          Watch Now →
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Content Summaries/Transcripts */}
          {profile.summaries && profile.summaries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-4xl">📜</span>
                Content Deep Dive
              </h2>
              <div className="space-y-4">
                {profile.summaries.map((summary, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl blur-lg group-hover:blur-xl transition-all"></div>
                    <div className="relative p-6 backdrop-blur-xl bg-white/5 rounded-xl border border-indigo-500/30 hover:border-indigo-500/60 transition-all">
                      {summary.video_title && (
                        <h3 className="font-bold text-white mb-3 text-lg">
                          {summary.video_title}
                        </h3>
                      )}
                      <p className="text-gray-200 leading-relaxed">
                        {summary.summary || summary}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Application Status */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-12 relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
            <div className="relative p-8 backdrop-blur-xl bg-white/5 rounded-2xl border border-green-500/30">
              <div className="flex items-center justify-between flex-wrap gap-6">
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Application Status</p>
                  <span
                    className={`px-6 py-3 rounded-xl text-lg font-bold inline-block ${
                      application.status === "pending"
                        ? "bg-yellow-500/30 text-yellow-300 border-2 border-yellow-500/50"
                        : application.status === "accepted"
                        ? "bg-green-500/30 text-green-300 border-2 border-green-500/50"
                        : "bg-red-500/30 text-red-300 border-2 border-red-500/50"
                    }`}
                  >
                    {application.status === "pending" && "⏳ "}
                    {application.status === "accepted" && "✅ "}
                    {application.status === "rejected" && "❌ "}
                    {application.status?.toUpperCase()}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Applied On</p>
                  <p className="text-white font-bold text-2xl">
                    {new Date(application.applied_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetail;
