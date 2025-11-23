import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-bold text-white mb-6">About HOLOkit</h1>
          <p className="text-xl text-gray-400 mb-12 max-w-3xl">
            We're revolutionizing influencer marketing with AI-powered analytics and data-driven insights.
          </p>

          <div className="grid md:grid-cols-2 gap-12 mb-20">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-gray-400 leading-relaxed">
                To bridge the gap between brands and creators by providing transparent, 
                accurate, and comprehensive profile analytics. We believe in empowering 
                both sides with the data they need to make informed collaboration decisions.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Our Vision</h2>
              <p className="text-gray-400 leading-relaxed">
                To become the industry standard for creator vetting and performance analysis, 
                enabling authentic partnerships and measurable ROI for brands of all sizes.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-lg p-8 border border-slate-800">
            <h2 className="text-3xl font-bold text-white mb-6">What We Do</h2>
            <div className="space-y-4 text-gray-400">
              <p>
                HOLOkit provides comprehensive analytics for social media creators across 
                multiple platforms including YouTube, Instagram, and GitHub. Our AI-powered 
                system analyzes engagement metrics, audience demographics, content quality, 
                and growth patterns.
              </p>
              <p>
                For brands, we offer a streamlined platform to discover, vet, and collaborate 
                with creators who align with their values and target audience. Our matching 
                algorithm ensures optimal partnerships based on data-driven insights.
              </p>
              <p>
                For creators, we provide a professional showcase of their metrics and 
                achievements, helping them stand out to potential brand partners and 
                demonstrate their value with verified statistics.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
