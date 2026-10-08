import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Bell, Moon, Sun, Plus, User, Settings, LogOut, Sparkles, Zap } from 'lucide-react';
import { useTheme } from '../common/ThemeProvider';
import { useProfile } from '../common/ProfileContext';
import { useNavigate } from 'react-router-dom';

const TopNav = ({ setMobileOpen }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const initials = `${profile?.firstName?.[0] ?? ''}${profile?.lastName?.[0] ?? ''}`.toUpperCase();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-3 z-30 mx-3 mb-2 flex h-16 items-center justify-between px-4 sm:px-5
      rounded-2xl glass-panel border border-white/20 dark:border-white/6 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">

      {/* Left side */}
      <div className="flex items-center gap-3 flex-1">
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 text-slate-500 hover:bg-white/60 dark:hover:bg-white/8 rounded-xl transition-colors"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        {/* Search Bar */}
        <div className="hidden md:flex relative w-full max-w-xs">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={15} className="text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-4 py-2 text-sm rounded-xl transition-all duration-200
              bg-white/50 dark:bg-white/4 border border-white/40 dark:border-white/8
              text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500
              focus:outline-none focus:bg-white/80 dark:focus:bg-white/8 focus:border-indigo-300/50 dark:focus:border-indigo-500/30
              focus:ring-2 focus:ring-indigo-500/10 backdrop-blur-sm"
            placeholder="Search..."
            aria-label="Search"
          />
        </div>

        {/* AI Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl
          bg-gradient-to-r from-emerald-500/10 to-cyan-500/10
          border border-emerald-200/40 dark:border-emerald-500/15">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 tracking-tight">AI Online</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 relative">

        {/* Quick Action: Log Mood */}
        <button
          onClick={() => navigate('/dashboard/mood')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
            bg-gradient-to-r from-blue-500 to-violet-600 text-white
            shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30
            hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          <Plus size={14} />
          <span>Log Mood</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400
            hover:bg-white/60 dark:hover:bg-white/8 transition-all duration-200
            hover:text-slate-700 dark:hover:text-slate-200"
          aria-label="Toggle theme"
        >
          {isDarkMode
            ? <Sun size={18} className="text-amber-400" />
            : <Moon size={18} />
          }
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileOpen(false);
            }}
            className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400
              hover:bg-white/60 dark:hover:bg-white/8 transition-all duration-200"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950/80" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 animate-scale-in origin-top-right
              glass-panel rounded-2xl border border-white/20 dark:border-white/8 overflow-hidden shadow-quantum-lg z-50">
              <div className="flex justify-between items-center px-4 py-3 border-b border-white/15 dark:border-white/6">
                <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">Notifications</h3>
                <span className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 cursor-pointer hover:text-indigo-600 transition-colors">
                  Mark all read
                </span>
              </div>
              <div className="p-2 max-h-72 overflow-y-auto scrollbar-thin">
                {[
                  { emoji: '📝', title: "Time for your daily mood check-in!", time: "10 mins ago", dot: "bg-blue-400" },
                  { emoji: '🎉', title: "Great job completing your breathing exercise!", time: "2 hours ago", dot: "bg-emerald-400" },
                ].map((n, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 cursor-pointer transition-colors mb-0.5">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${n.dot}`} />
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{n.emoji} {n.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200/60 dark:bg-white/8 mx-0.5 hidden sm:block" />

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
            }}
            className="flex items-center gap-2 focus:outline-none hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            aria-label="User menu"
          >
            {profile?.avatar ? (
              <img
                className="h-8 w-8 rounded-xl object-cover ring-2 ring-indigo-500/20"
                src={profile.avatar}
                alt="User avatar"
              />
            ) : (
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600
                flex items-center justify-center text-white text-xs font-bold
                ring-2 ring-indigo-500/20 shadow-md shadow-indigo-500/20">
                {initials || <User size={14} />}
              </div>
            )}
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 animate-scale-in origin-top-right
              glass-panel rounded-2xl border border-white/20 dark:border-white/8 overflow-hidden shadow-quantum-lg z-50">
              {/* User info */}
              <div className="px-4 py-3 border-b border-white/15 dark:border-white/6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600
                    flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {initials || <User size={12} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {profile?.firstName} {profile?.lastName}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{profile?.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="p-2">
                {[
                  { icon: User, label: 'Profile', action: () => { setIsProfileOpen(false); navigate('/dashboard/profile'); } },
                  { icon: Settings, label: 'Settings', action: () => { setIsProfileOpen(false); navigate('/dashboard/settings'); } },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium
                      text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/8
                      rounded-xl transition-colors"
                  >
                    <item.icon size={16} className="text-slate-400" />
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="p-2 border-t border-white/15 dark:border-white/6">
                <button
                  onClick={() => { setIsProfileOpen(false); navigate('/auth/login'); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold
                    text-rose-500 dark:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-500/10
                    rounded-xl transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;
