import React from 'react';
import { Sun, Moon, Bell, Search, User, Menu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Topbar = ({ toggleSidebar }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { admin } = useAuth();

  return (
    <header className="h-20 glass fixed top-0 right-0 left-0 lg:left-64 z-40 px-4 md:px-8 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg mr-2"
        >
          <Menu size={24} />
        </button>

        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl flex-1 border border-slate-200 dark:border-slate-700 max-w-[400px]">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none outline-none text-sm w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6 ml-4">
        <button 
          onClick={toggleTheme}
          className="p-2 md:p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
        >
          {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
        </button>

        <div className="hidden md:block h-8 w-px bg-slate-200 dark:bg-slate-800" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">{admin?.email.split('@')[0]}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Super Admin</p>
          </div>
          <div className="w-9 h-9 md:w-10 md:h-10 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-300 dark:border-slate-700">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;

