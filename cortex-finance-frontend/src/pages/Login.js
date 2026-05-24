import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/upload');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0F11] relative overflow-hidden p-4">
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>
      
      <motion.div 
        className="glass-panel w-full max-w-md p-10 z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-[rgba(215,255,63,0.1)] text-[#D7FF3F] mb-4 shadow-[0_0_20px_rgba(215,255,63,0.1)]">
            <Activity size={36} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 font-outfit">Welcome Back</h2>
          <p className="text-[rgba(255,255,255,0.5)]">Sign in to resume your financial analysis</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.3)]" />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] focus:border-[rgba(215,255,63,0.3)] focus:bg-[rgba(255,255,255,0.06)] text-white rounded-xl py-3.5 pl-12 pr-4 transition-all outline-none focus:shadow-[0_0_15px_rgba(215,255,63,0.08)]"
              required 
            />
          </div>
          
          <div className="relative">
            <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.3)]" />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] focus:border-[rgba(215,255,63,0.3)] focus:bg-[rgba(255,255,255,0.06)] text-white rounded-xl py-3.5 pl-12 pr-4 transition-all outline-none focus:shadow-[0_0_15px_rgba(215,255,63,0.08)]"
              required 
            />
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn btn-primary w-full py-4 mt-6 rounded-xl text-base font-bold" 
            type="submit"
          >
            Sign In <ArrowRight size={20} />
          </motion.button>
        </form>
        
        <div className="mt-8 text-center text-sm text-[rgba(255,255,255,0.4)]">
          Don't have an account? <Link to="/signup" className="text-[#D7FF3F] font-semibold ml-1 hover:underline">Create one</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;