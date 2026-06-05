import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, Wifi, WifiOff, Database, Trash2, CheckCircle2, RefreshCw } from 'lucide-react';
import api from '../api/mockService';

const Settings = () => {
  const [apiMode, setApiMode] = useState(localStorage.getItem('cortex_api_mode') || 'live');
  const [backendStatus, setBackendStatus] = useState('checking');
  const [statusMessage, setStatusMessage] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  const checkBackendStatus = async () => {
    setBackendStatus('checking');
    try {
      const res = await api.get('/dashboard');
      if (res.status === 200 || res.status === 404 || res.status === 422) {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch (e) {
      if (e.response) {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
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
          <h1 className="text-3xl font-bold text-white tracking-tight font-outfit">System Settings</h1>
          <p className="text-[rgba(255,255,255,0.4)] mt-1 text-sm">Configure your API connection and local data preferences</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={checkBackendStatus}
          className="p-3 bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.5)] hover:text-white rounded-xl transition-all border border-[rgba(255,255,255,0.05)] flex items-center gap-2 text-sm"
        >
          <RefreshCw size={16} className={backendStatus === 'checking' ? 'animate-spin' : ''} />
          <span>Refresh API Status</span>
        </motion.button>
      </div>

      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-4 bg-[rgba(166,255,77,0.08)] border border-[rgba(166,255,77,0.15)] text-[#A6FF4D] rounded-xl flex items-center gap-3 text-sm"
        >
          <CheckCircle2 size={18} />
          <span>{statusMessage}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Strategy */}
        <div className="glass-panel p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-[rgba(215,255,63,0.1)] text-[#D7FF3F]">
              <Server size={18} />
            </div>
            <h2 className="text-lg font-semibold text-white font-outfit">API Connection Strategy</h2>
          </div>

          <p className="text-[rgba(255,255,255,0.45)] text-sm leading-relaxed">
            Choose whether the application should call your live FastAPI server running on <code className="bg-[rgba(255,255,255,0.06)] px-2 py-1 rounded-lg text-[#D7FF3F] text-xs border border-[rgba(255,255,255,0.05)]">{api.defaults.baseURL || 'http://localhost:8000'}</code> or use simulated mock data.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => handleModeChange('mock')}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                apiMode === 'mock'
                  ? 'bg-[rgba(215,255,63,0.06)] border-[rgba(215,255,63,0.2)] text-white'
                  : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.5)] hover:border-[rgba(255,255,255,0.1)] hover:text-white'
              }`}
            >
              <div>
                <div className="font-medium text-sm">Mock Data (Offline Mode)</div>
                <div className="text-[10px] text-[rgba(255,255,255,0.35)] mt-0.5">Use static client-side financial statements</div>
              </div>
              {apiMode === 'mock' && <div className="w-2.5 h-2.5 rounded-full bg-[#D7FF3F] shadow-[0_0_8px_rgba(215,255,63,0.5)]"></div>}
            </button>

            <button
              onClick={() => handleModeChange('live')}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                apiMode === 'live'
                  ? 'bg-[rgba(215,255,63,0.06)] border-[rgba(215,255,63,0.2)] text-white'
                  : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.5)] hover:border-[rgba(255,255,255,0.1)] hover:text-white'
              }`}
            >
              <div>
                <div className="font-medium text-sm">Live FastAPI Server</div>
                <div className="text-[10px] text-[rgba(255,255,255,0.35)] mt-0.5">Query API endpoints at {api.defaults.baseURL || 'http://localhost:8000'}</div>
              </div>
              {apiMode === 'live' && <div className="w-2.5 h-2.5 rounded-full bg-[#D7FF3F] shadow-[0_0_8px_rgba(215,255,63,0.5)]"></div>}
            </button>
          </div>
        </div>

        {/* System Health */}
        <div className="glass-panel p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[rgba(215,255,63,0.1)] text-[#D7FF3F]">
                {backendStatus === 'online' ? <Wifi size={18} /> : <WifiOff size={18} />}
              </div>
              <h2 className="text-lg font-semibold text-white font-outfit">Service Health Status</h2>
            </div>

            <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex items-center justify-between">
              <span className="text-[rgba(255,255,255,0.45)] text-sm font-medium">FastAPI Backend Status:</span>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  backendStatus === 'online' ? 'bg-[#A6FF4D] shadow-[0_0_8px_rgba(166,255,77,0.5)]' :
                  backendStatus === 'offline' ? 'bg-[#FF5C75] shadow-[0_0_8px_rgba(255,92,117,0.5)]' :
                  'bg-[#FFB84D] shadow-[0_0_8px_rgba(255,184,77,0.5)]'
                }`}></span>
                <span className="text-sm font-semibold capitalize text-white">
                  {backendStatus === 'online' ? 'Connected' :
                   backendStatus === 'offline' ? 'Disconnected' : 'Checking...'}
                </span>
              </div>
            </div>

            <p className="text-[rgba(255,255,255,0.4)] text-sm leading-relaxed">
              Ensure the backend server is running and accessible at the active URL endpoint configured in your environment or Settings.
            </p>
          </div>

          <div className="pt-4 border-t border-[rgba(255,255,255,0.05)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[rgba(255,255,255,0.4)] text-sm">
                <Database size={14} />
                <span>Reset Application Cache</span>
              </div>
              <button
                onClick={handleClearData}
                disabled={isClearing}
                className="px-4 py-2 text-xs flex items-center gap-2 bg-transparent hover:bg-[rgba(255,92,117,0.08)] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,92,117,0.2)] text-[rgba(255,255,255,0.5)] hover:text-[#FF5C75] rounded-lg transition-all disabled:opacity-50"
              >
                {isClearing ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
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
