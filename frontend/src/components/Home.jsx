import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Creator Profile Analytics
              <br />
              <span className="text-blue-500">Made Simple</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Connect brands with creators. Analyze social media profiles with AI-powered insights.
              Make data-driven decisions for your influencer marketing campaigns.
            </p>
            <div className="flex gap-4 justify-center">
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white text-center mb-12">
              Why Choose HOLOkit?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-2">Deep Analytics</h3>
                <p className="text-gray-400">
                  Get comprehensive insights into creator profiles, engagement rates, and audience demographics.
                </p>
              </div>
              <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-2">AI-Powered</h3>
                <p className="text-gray-400">
                  Advanced algorithms analyze content quality, authenticity, and audience engagement patterns.
                </p>
              </div>
              <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-2">Real-Time Data</h3>
                <p className="text-gray-400">
                  Access up-to-date metrics and performance indicators for informed decision-making.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join thousands of brands and creators using HOLOkit for smarter collaborations.
            </p>
            {!user && (
              <Link
                to="/signup"
                className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Create Free Account
              </Link>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
