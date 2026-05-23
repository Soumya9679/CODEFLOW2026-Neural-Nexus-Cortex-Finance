import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Settings, Activity, LogOut, UploadCloud } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="w-64 h-full bg-bgSecondary/50 backdrop-blur-xl border-r border-glassBorder flex flex-col pt-8 pb-6 px-4 shrink-0">
      <div className="flex items-center gap-3 px-4 mb-10 text-2xl font-bold tracking-tight text-white">
        <div className="p-2 bg-accentCyan/20 rounded-xl text-accentCyan">
          <Activity size={24} />
        </div>
        <span>Cortex</span>
      </div>
      
      <div className="flex-1 flex flex-col gap-2">
        <NavLink 
          to="/dashboard" 
          className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive ? 'bg-accentCyan/10 text-accentCyan border border-accentCyan/20 shadow-[0_0_10px_rgba(0,240,255,0.1)]' : 'text-textSecondary hover:bg-white/5 hover:text-white'}`}
          end
        >
          <LayoutDashboard size={20} />
          <span>Overview</span>
        </NavLink>
        
        <NavLink 
          to="/dashboard/chat" 
          className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive ? 'bg-accentCyan/10 text-accentCyan border border-accentCyan/20 shadow-[0_0_10px_rgba(0,240,255,0.1)]' : 'text-textSecondary hover:bg-white/5 hover:text-white'}`}
        >
          <MessageSquare size={20} />
          <span>AI Assistant</span>
        </NavLink>
        
        <NavLink 
          to="/upload" 
          className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive ? 'bg-accentCyan/10 text-accentCyan border border-accentCyan/20 shadow-[0_0_10px_rgba(0,240,255,0.1)]' : 'text-textSecondary hover:bg-white/5 hover:text-white'}`}
        >
          <UploadCloud size={20} />
          <span>Upload New</span>
        </NavLink>
        
        <NavLink 
          to="/dashboard/settings" 
          className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive ? 'bg-accentCyan/10 text-accentCyan border border-accentCyan/20 shadow-[0_0_10px_rgba(0,240,255,0.1)]' : 'text-textSecondary hover:bg-white/5 hover:text-white'}`}
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </div>
      
      <div className="mt-auto pt-4 border-t border-glassBorder">
        <NavLink 
          to="/" 
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-textSecondary hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          <span>Exit App</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
