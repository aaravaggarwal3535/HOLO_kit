import { useState, useEffect } from "react";
import { analyzeAPI } from "../services/authApi";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const PremiumUpgrade = () => {
  const { user } = useAuth();
  const [premiumStatus, setPremiumStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      duration: 1,
      price: 9.99,
      name: "Monthly",
      popular: false,
      features: [
        "Premium Badge",
        "Enhanced Profile Display",
        "Priority in Applications",
        "Advanced Analytics",
      ],
    },
    {
      duration: 3,
      price: 24.99,
      name: "Quarterly",
      popular: true,
      features: [
        "Premium Badge",
        "Enhanced Profile Display",
        "Priority in Applications",
        "Advanced Analytics",
        "Save $5",
      ],
    },
    {
      duration: 6,
      price: 44.99,
      name: "Half-Yearly",
      popular: false,
      features: [
        "Premium Badge",
        "Enhanced Profile Display",
        "Priority in Applications",
        "Advanced Analytics",
        "Save $15",
      ],
    },
    {
      duration: 12,
      price: 79.99,
      name: "Yearly",
      popular: false,
      features: [
        "Premium Badge",
        "Enhanced Profile Display",
        "Priority in Applications",
        "Advanced Analytics",
        "Save $40",
        "Best Value",
      ],
    },
  ];

  useEffect(() => {
    fetchPremiumStatus();
  }, []);

  const fetchPremiumStatus = async () => {
    try {
      const response = await analyzeAPI.get("/premium/status");
      setPremiumStatus(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch premium status:", error);
      setLoading(false);
    }
  };

  const handleUpgrade = async (duration) => {
    setUpgrading(true);
    setSelectedPlan(duration);
    try {
      const response = await analyzeAPI.post(
        `/premium/upgrade?duration_months=${duration}`
      );
      alert(response.data.message);
      fetchPremiumStatus();
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Failed to upgrade:", error);
      alert(error.response?.data?.detail || "Failed to upgrade to premium");
    } finally {
      setUpgrading(false);
      setSelectedPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <div className="text-2xl text-cyan-300">Loading...</div>
      </div>
    );
  }

  if (premiumStatus?.is_premium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2"
            >
              ← Back to Dashboard
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="text-8xl mb-4 font-black text-yellow-400">PREMIUM</div>
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 mb-4">
              You're Premium!
            </h1>
            <p className="text-gray-300 text-xl">
              Your profile stands out from the crowd
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 backdrop-blur-xl bg-white/5 rounded-2xl border border-yellow-500/30"
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              Premium Status
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Status</span>
                <span className="px-4 py-2 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-full text-yellow-300 font-bold border border-yellow-500/50">
                  PREMIUM ACTIVE
                </span>
              </div>
              {premiumStatus.premium_expires && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Expires On</span>
                  <span className="text-white font-semibold">
                    {new Date(
                      premiumStatus.premium_expires
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
              <div className="pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-4">
                  Your profile now displays with enhanced visuals and gets
                  priority placement in company applications.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 mb-4">
            Upgrade to Premium
          </h1>
          <p className="text-gray-300 text-xl">
            Stand out from the crowd and get noticed by companies
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.duration}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="px-4 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}
              <div
                className={`relative h-full p-6 backdrop-blur-xl rounded-2xl ${
                  plan.popular
                    ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50"
                    : "bg-white/5 border border-gray-500/30"
                } hover:scale-105 transition-all`}
              >
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                      ${plan.price}
                    </span>
                    <span className="text-gray-400">
                      / {plan.duration}mo
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="text-gray-300 text-sm">
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.duration)}
                  disabled={upgrading && selectedPlan === plan.duration}
                  className={`w-full py-3 rounded-lg font-bold transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600"
                      : "bg-cyan-500 text-white hover:bg-cyan-600"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {upgrading && selectedPlan === plan.duration
                    ? "Processing..."
                    : "Upgrade Now"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-8 backdrop-blur-xl bg-white/5 rounded-2xl border border-cyan-500/30"
        >
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            What You Get with Premium
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Premium Badge
                </h3>
                <p className="text-gray-300">
                  Display a golden premium badge on your profile to show
                  companies you're serious
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Enhanced Display
                </h3>
                <p className="text-gray-300">
                  Your profile shows with premium styling, animations, and
                  better visibility
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Priority Placement
                </h3>
                <p className="text-gray-300">
                  Get listed first in application lists and stand out from other
                  creators
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Advanced Analytics
                </h3>
                <p className="text-gray-300">
                  See who viewed your profile and track your application success
                  rate
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PremiumUpgrade;
