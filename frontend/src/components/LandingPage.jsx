import { motion } from 'framer-motion';
import { useState } from 'react';

export default function LandingPage({ onAnalyze, loading }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }
    
    // Basic validation
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    const isGitHub = url.includes('github.com');
    const isInstagram = url.includes('instagram.com') || url.includes('instagr.am');
    
    if (!isYouTube && !isGitHub && !isInstagram) {
      setError('Please enter a valid YouTube, GitHub, or Instagram URL');
      return;
    }
    
    onAnalyze(url);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
        {/* Floating orbs */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-neon-pink/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,10,15,0.8)_100%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Logo/Brand */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute top-8 left-8 flex items-center gap-2"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg flex items-center justify-center">
            <span className="text-2xl">🔮</span>
          </div>
          <span className="text-xl font-bold gradient-text">Holo-Kit</span>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 max-w-5xl"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 glass rounded-full text-sm border border-neon-cyan/30"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-cyan"></span>
            </span>
            <span className="text-neon-cyan font-medium">Live API Verification • AI Powered</span>
          </motion.div>
          
          <h1 className="text-7xl md:text-9xl font-black mb-8 leading-[0.9] tracking-tight">
            <span className="block text-white drop-shadow-2xl">Stop Sending</span>
            <span className="block mt-2">
              <span className="gradient-text animate-fade-in">Dead</span>
              <span className="text-white"> </span>
              <span className="gradient-text animate-fade-in" style={{ animationDelay: '0.1s' }}>PDFs</span>
              <span className="text-white">.</span>
            </span>
          </h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-2xl md:text-3xl text-gray-300 max-w-4xl mx-auto font-light leading-relaxed"
          >
            Create a <span className="text-neon-blue font-semibold">Verified</span>, 
            <span className="text-neon-purple font-semibold"> 3D Holographic</span> Media Kit 
            <br className="hidden md:block" />
            in <span className="text-neon-pink font-semibold">10 Seconds</span>.
          </motion.p>
        </motion.div>

        {/* Enhanced Search Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="w-full max-w-4xl mb-16"
        >
          <form onSubmit={handleSubmit} className="relative">
            <div className={`glass-strong rounded-3xl p-2 shadow-2xl transition-all duration-500 ${
              isFocused 
                ? 'border-2 border-neon-blue shadow-[0_0_50px_rgba(0,212,255,0.3)]' 
                : 'border-2 border-neon-blue/20'
            }`}>
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="ml-4 text-3xl">
                  {loading ? '⚡' : '🔗'}
                </div>
                
                <div className="flex-1">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Paste your YouTube, GitHub, or Instagram URL here..."
                    className="w-full bg-transparent px-2 py-6 text-xl text-white placeholder-gray-500 focus:outline-none"
                    disabled={loading}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="px-10 py-6 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink rounded-2xl text-white font-bold text-xl hover:scale-105 hover:shadow-[0_0_30px_rgba(176,38,255,0.6)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap relative overflow-hidden group"
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <Spinner />
                      Analyzing
                    </span>
                  ) : (
                    <>
                      <span className="relative z-10">Generate Holo-Kit</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-neon-pink via-neon-purple to-neon-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute left-6 -bottom-10 flex items-center gap-2 text-red-400"
              >
                <span>⚠️</span>
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}
          </form>

          {/* Example URLs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-6 flex items-center justify-center gap-3 flex-wrap"
          >
            <span className="text-gray-500 text-sm">Try:</span>
            {[
              { label: '@MKBHD', url: 'https://youtube.com/@mkbhd' },
              { label: '@vercel', url: 'https://github.com/vercel' },
              { label: '@mkbhd (IG)', url: 'https://www.instagram.com/mkbhd/' }
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => setUrl(example.url)}
                className="px-4 py-2 glass rounded-full text-sm text-gray-400 hover:text-white hover:border-neon-blue/50 border border-white/10 transition-all duration-300"
              >
                {example.label}
              </button>
            ))}
          </motion.div>
        </motion.div>

        {/* Enhanced Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl w-full"
        >
          <FeatureCard
            icon="🎥"
            title="YouTube Verified"
            description="Live subscriber counts, video analytics, and AI-analyzed transcripts"
            gradient="from-red-500/10 to-pink-500/10"
            delay={0}
          />
          <FeatureCard
            icon="💻"
            title="GitHub Stats"
            description="Real-time repo metrics, star counts, and code contribution analysis"
            gradient="from-purple-500/10 to-blue-500/10"
            delay={0.1}
          />
          <FeatureCard
            icon="📸"
            title="Instagram Insights"
            description="Follower metrics, top posts, and engagement analysis"
            gradient="from-pink-500/10 to-purple-500/10"
            delay={0.15}
          />
          <FeatureCard
            icon="🧠"
            title="AI Personality"
            description="Gemini 2.0 generates creator vibe and content style analysis"
            gradient="from-cyan-500/10 to-teal-500/10"
            delay={0.2}
          />
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="mt-20 text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-8 text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm">Real-time API</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm">3D Rendered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              <span className="text-sm">AI Powered</span>
            </div>
          </div>
          
          <p className="text-gray-700 text-sm">
            Built for creators, developers, and influencers who want to stand out.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, gradient, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2 + delay, duration: 0.6 }}
      whileHover={{ scale: 1.05, y: -8 }}
      className={`glass rounded-3xl p-8 text-left hover:glass-strong transition-all duration-300 relative overflow-hidden group cursor-pointer border border-white/5 hover:border-white/20`}
    >
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <div className="relative z-10">
        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </div>
      
      {/* Shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
    </motion.div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
