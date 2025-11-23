import { motion } from 'framer-motion';

export default function Features() {
  const features = [
    {
      title: 'Profile Analytics',
      description: 'Comprehensive analysis of creator profiles including follower count, engagement rates, and content performance.'
    },
    {
      title: 'AI-Powered Insights',
      description: 'Machine learning algorithms detect patterns, predict trends, and identify authentic engagement.'
    },
    {
      title: 'Multi-Platform Support',
      description: 'Analyze creators across YouTube, Instagram, and GitHub with unified metrics and reporting.'
    },
    {
      title: 'Request Management',
      description: 'Streamlined workflow for brands to create collaboration requests and manage creator applications.'
    },
    {
      title: 'Application Tracking',
      description: 'Creators can easily apply to opportunities and track their application status in real-time.'
    },
    {
      title: 'Premium Verification',
      description: 'Verified premium creators get enhanced visibility and priority placement in search results.'
    },
    {
      title: 'Detailed Reports',
      description: 'Generate comprehensive PDF reports with visualizations and insights for stakeholder presentations.'
    },
    {
      title: 'Real-Time Data',
      description: 'Live metrics and updates ensure you always have the most current information available.'
    },
    {
      title: 'Secure Platform',
      description: 'Enterprise-grade security with JWT authentication and encrypted data storage.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-bold text-white mb-6 text-center">Features</h1>
          <p className="text-xl text-gray-400 mb-16 text-center max-w-3xl mx-auto">
            Everything you need to make data-driven decisions for influencer marketing campaigns.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 bg-slate-900 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
