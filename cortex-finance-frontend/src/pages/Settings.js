import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, Wifi, WifiOff, Database, Trash2, CheckCircle2, RefreshCw } from 'lucide-react';

const Settings = () => {
  const [apiMode, setApiMode] = useState(localStorage.getItem('cortex_api_mode') || 'mock');
  const [backendStatus, setBackendStatus] = useState('checking');
  const [statusMessage, setStatusMessage] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  const checkBackendStatus = async () => {
    setBackendStatus('checking');
    try {
      const res = await fetch('http://localhost:8000/dashboard');
      if (res.ok || res.status === 404 || res.status === 422) {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch (e) {
      setBackendStatus('offline');
    }
  };

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const handleModeChange = (mode) => {
    localStorage.setItem('cortex_api_mode', mode);
    setApiMode(mode);
    setStatusMessage(`Switched to ${mode === 'live' ? 'Live FastAPI Backend' : 'Mock Data Mode'}`);
    setTimeout(() => setStatusMessage(''), 3000);
    window.dispatchEvent(new Event('storage'));
  };

  const handleClearData = async () => {
    setIsClearing(true);
    setTimeout(() => {
      localStorage.removeItem('cortex_dashboard_data');
      setIsClearing(false);
      setStatusMessage('Local data cache cleared successfully!');
      setTimeout(() => setStatusMessage(''), 3000);
    }, 1000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Settings</h1>
          <p className="text-textSecondary mt-1">Configure your API connection and local data preferences</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={checkBackendStatus}
          className="p-3 bg-slate-800/80 hover:bg-slate-700/80 text-textSecondary hover:text-white rounded-xl transition-all border border-slate-700/50 flex items-center gap-2"
        >
          <RefreshCw size={18} className={backendStatus === 'checking' ? 'animate-spin' : ''} />
          <span>Refresh API Status</span>
        </motion.button>
      </div>

      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center gap-3"
        >
          <CheckCircle2 size={20} />
          <span>{statusMessage}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Strategy */}
        <div className="glass-panel p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-accentCyan/15 text-accentCyan">
              <Server size={20} />
            </div>
            <h2 className="text-xl font-semibold text-white">API Connection Strategy</h2>
          </div>

          <p className="text-textSecondary text-sm leading-relaxed">
            Choose whether the application should call your live local FastAPI server running on <code className="bg-slate-950 px-2 py-1 rounded text-accentCyan">http://localhost:8000</code> or use simulated mock data.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => handleModeChange('mock')}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                apiMode === 'mock'
                  ? 'bg-accentCyan/10 border-accentCyan text-white'
                  : 'bg-slate-900/30 border-slate-800 text-textSecondary hover:border-slate-700 hover:text-white'
              }`}
            >
              <div>
                <div className="font-medium">Mock Data (Offline Mode)</div>
                <div className="text-xs text-textSecondary mt-0.5">Use static client-side financial statements</div>
              </div>
              {apiMode === 'mock' && <div className="w-2.5 h-2.5 rounded-full bg-accentCyan"></div>}
            </button>

            <button
              onClick={() => handleModeChange('live')}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                apiMode === 'live'
                  ? 'bg-accentCyan/10 border-accentCyan text-white'
                  : 'bg-slate-900/30 border-slate-800 text-textSecondary hover:border-slate-700 hover:text-white'
              }`}
            >
              <div>
                <div className="font-medium">Live FastAPI Server</div>
                <div className="text-xs text-textSecondary mt-0.5">Query local API endpoints at http://localhost:8000</div>
              </div>
              {apiMode === 'live' && <div className="w-2.5 h-2.5 rounded-full bg-accentCyan"></div>}
            </button>
          </div>
        </div>

        {/* System Health */}
        <div className="glass-panel p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accentCyan/15 text-accentCyan">
                {backendStatus === 'online' ? <Wifi size={20} /> : <WifiOff size={20} />}
              </div>
              <h2 className="text-xl font-semibold text-white">Service Health Status</h2>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
              <span className="text-textSecondary text-sm font-medium">FastAPI Backend Status:</span>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  backendStatus === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' :
                  backendStatus === 'offline' ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' :
                  'bg-amber-500 shadow-[0_0_8px_#f59e0b]'
                }`}></span>
                <span className="text-sm font-semibold capitalize text-white">
                  {backendStatus === 'online' ? 'Connected' :
                   backendStatus === 'offline' ? 'Disconnected' : 'Checking...'}
                </span>
              </div>
            </div>

            <p className="text-textSecondary text-sm leading-relaxed">
              Ensure you have run the backend server using <code className="bg-slate-950 px-2 py-1 rounded text-accentCyan">uvicorn main:app --reload</code> inside the <code className="bg-slate-950 px-2 py-1 rounded text-accentCyan">cortex-finance-backend</code> directory.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-textSecondary text-sm">
                <Database size={16} />
                <span>Reset Application Cache</span>
              </div>
              <button
                onClick={handleClearData}
                disabled={isClearing}
                className="btn btn-secondary px-4 py-2 text-xs flex items-center gap-2 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 transition-all border border-slate-700 bg-transparent text-textSecondary rounded-lg disabled:opacity-50"
              >
                {isClearing ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                <span>{isClearing ? 'Clearing...' : 'Clear Cache'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
