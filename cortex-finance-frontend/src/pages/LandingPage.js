import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, Zap, ArrowRight, Activity } from 'lucide-react';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col bg-[#0F0F11]">
      {/* Background Orbs */}
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>

      <nav className="flex justify-between items-center px-8 md:px-12 py-4 mx-4 md:mx-12 mt-6 mb-16 rounded-full z-10 glass-panel">
        <div className="flex items-center gap-3 text-2xl font-bold tracking-tight font-outfit">
          <Activity className="text-[#D7FF3F]" size={26} />
          <span>Cortex</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-[rgba(255,255,255,0.5)] font-medium hover:text-white transition-colors duration-300 text-sm">Log In</Link>
          <Link to="/signup" className="btn btn-primary px-6 py-2 rounded-full text-sm">Sign Up</Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col lg:flex-row items-center justify-between px-6 md:px-20 z-10 w-full max-w-7xl mx-auto">
        
        <motion.div 
          className="flex-1 w-full lg:pr-12 text-center lg:text-left pt-10 lg:pt-0"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(215,255,63,0.06)] border border-[rgba(215,255,63,0.12)] text-[#D7FF3F] text-xs font-semibold mb-8">
            <Zap size={12} className="animate-pulse" />
            <span>AI-Powered Financial Intelligence</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl leading-tight font-extrabold mb-6 font-outfit">
            Analyze your finances with <br/>
            <span className="text-gradient">Cortex AI</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-[rgba(255,255,255,0.5)] mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Upload your bank statements. Let our advanced AI categorize expenses, detect anomalies, and optimize your financial health instantly. No manual entry required.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link to="/signup" className="btn btn-primary btn-large w-full sm:w-auto group rounded-2xl">
              Start Free Trial 
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-large w-full sm:w-auto rounded-2xl">
              View Demo
            </Link>
          </motion.div>
        </motion.div>

        <motion.div 
          className="flex-1 w-full relative mt-20 lg:mt-0 h-[500px]"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full max-w-md">
              <motion.div 
                className="glass-panel p-6 mb-6 ai-glow relative group"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-[rgba(255,184,77,0.12)] text-[#FFB84D]">
                    <TrendingUp size={22} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-semibold mb-1 text-white font-outfit">Expense Analysis</h4>
                    <div className="w-full bg-[rgba(255,255,255,0.06)] rounded-full h-2 mb-2 mt-3 overflow-hidden">
                      <div className="bg-[#FFB84D] h-2 rounded-full w-[35%] shadow-[0_0_8px_rgba(255,184,77,0.4)]"></div>
                    </div>
                    <p className="text-xs text-[rgba(255,255,255,0.4)] flex justify-between">
                      <span>Food & Dining</span>
                      <span className="text-white font-medium">35%</span>
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="glass-panel p-6 mb-6 relative group"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-[rgba(166,255,77,0.1)] text-[#A6FF4D]">
                    <Shield size={22} />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold mb-1 text-white font-outfit">Fraud Detection</h4>
                    <p className="text-xs text-[rgba(255,255,255,0.4)] flex items-center gap-2 mt-2">
                      <span className="w-2 h-2 rounded-full bg-[#A6FF4D] animate-pulse shadow-[0_0_6px_rgba(166,255,77,0.5)]"></span>
                      No unusual activity detected
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="glass-panel p-6 relative group border-[rgba(215,255,63,0.1)]"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-[rgba(215,255,63,0.1)] text-[#D7FF3F]">
                    <Zap size={22} />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold mb-1 text-white font-outfit">AI Recommendations</h4>
                    <p className="text-xs text-[rgba(255,255,255,0.4)] mt-2">
                      Cancel 2 inactive subscriptions to save <span className="text-[#D7FF3F] font-semibold">₹2,500/mo</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default LandingPage;
