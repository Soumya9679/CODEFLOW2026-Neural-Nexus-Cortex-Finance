import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Settings, Activity, LogOut, UploadCloud } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="w-[72px] hover:w-64 group/sidebar h-full bg-[rgba(255,255,255,0.04)] backdrop-blur-[18px] border-r border-[rgba(255,255,255,0.05)] flex flex-col pt-8 pb-6 px-3 shrink-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden">
      <div className="flex items-center gap-3 px-3 mb-10 text-xl font-bold tracking-tight text-white whitespace-nowrap">
        <div className="p-2 bg-[rgba(215,255,63,0.15)] rounded-2xl text-[#D7FF3F] shrink-0 shadow-[0_0_15px_rgba(215,255,63,0.15)]">
          <Activity size={22} />
        </div>
        <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 font-outfit">Cortex</span>
      </div>
      
      <div className="flex-1 flex flex-col gap-1.5">
        <NavLink 
          to="/dashboard" 
          className={({isActive}) => `flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${isActive ? 'bg-[rgba(215,255,63,0.1)] text-[#D7FF3F] border border-[rgba(215,255,63,0.15)] shadow-[0_0_15px_rgba(215,255,63,0.1)]' : 'text-[rgba(255,255,255,0.4)] hover:bg-[rgba(255,255,255,0.05)] hover:text-white'}`}
          end
        >
          <LayoutDashboard size={20} className="shrink-0" />
          <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 text-sm">Overview</span>
        </NavLink>
        
        <NavLink 
          to="/dashboard/chat" 
          className={({isActive}) => `flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${isActive ? 'bg-[rgba(215,255,63,0.1)] text-[#D7FF3F] border border-[rgba(215,255,63,0.15)] shadow-[0_0_15px_rgba(215,255,63,0.1)]' : 'text-[rgba(255,255,255,0.4)] hover:bg-[rgba(255,255,255,0.05)] hover:text-white'}`}
        >
          <MessageSquare size={20} className="shrink-0" />
          <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 text-sm">AI Assistant</span>
        </NavLink>
        
        <NavLink 
          to="/upload" 
          className={({isActive}) => `flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${isActive ? 'bg-[rgba(215,255,63,0.1)] text-[#D7FF3F] border border-[rgba(215,255,63,0.15)] shadow-[0_0_15px_rgba(215,255,63,0.1)]' : 'text-[rgba(255,255,255,0.4)] hover:bg-[rgba(255,255,255,0.05)] hover:text-white'}`}
        >
          <UploadCloud size={20} className="shrink-0" />
          <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 text-sm">Upload New</span>
        </NavLink>
        
        <NavLink 
          to="/dashboard/settings" 
          className={({isActive}) => `flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${isActive ? 'bg-[rgba(215,255,63,0.1)] text-[#D7FF3F] border border-[rgba(215,255,63,0.15)] shadow-[0_0_15px_rgba(215,255,63,0.1)]' : 'text-[rgba(255,255,255,0.4)] hover:bg-[rgba(255,255,255,0.05)] hover:text-white'}`}
        >
          <Settings size={20} className="shrink-0" />
          <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 text-sm">Settings</span>
        </NavLink>
      </div>
      
      <div className="mt-auto pt-4 border-t border-[rgba(255,255,255,0.05)]">
        <NavLink 
          to="/" 
          className="flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-[rgba(255,255,255,0.4)] hover:bg-[rgba(255,92,117,0.08)] hover:text-[#FF5C75] transition-all duration-300 whitespace-nowrap"
        >
          <LogOut size={20} className="shrink-0" />
          <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 text-sm">Exit App</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
