import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Activity, 
  BookOpen, 
  ClipboardList, 
  Heart, 
  PieChart, 
  FileText, 
  User, 
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { authService } from '../../services/authService';
import Logo from '../common/Logo';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const navItems = [
    { name: 'Dashboard',         path: '/dashboard',             icon: LayoutDashboard },
    { name: 'AI Chat',           path: '/dashboard/chat',        icon: MessageSquare },
    { name: 'Mood Tracker',      path: '/dashboard/mood',        icon: Activity },
    { name: 'Journal',           path: '/dashboard/journal',     icon: BookOpen },
    { name: 'Assessments',       path: '/dashboard/assessments', icon: ClipboardList },
    { name: 'Wellness Exercises',path: '/dashboard/wellness',    icon: Heart },
    { name: 'Analytics',         path: '/dashboard/analytics',   icon: PieChart },
    { name: 'Reports',           path: '/dashboard/reports',     icon: FileText },
  ];

  const bottomItems = [
    { name: 'Profile',  path: '/dashboard/profile',  icon: User },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  const NavItem = ({ item }) => (
    <NavLink
      to={item.path}
      end={item.path === '/dashboard'}
      onClick={() => setIsMobileOpen(false)}
      className={({ isActive }) => cn(
        "group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 relative",
        isActive
          ? "bg-gradient-to-r from-blue-500/10 to-violet-500/10 text-indigo-600 dark:text-indigo-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:shadow-none"
          : "text-slate-500 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-slate-200"
      )}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-gradient-to-b from-blue-500 to-violet-600" />
          )}
          <item.icon className={cn(
            "w-[18px] h-[18px] flex-shrink-0 transition-all duration-200",
            isActive
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:scale-110"
          )} />
          <span className="flex-1 truncate">{item.name}</span>
          {isActive && (
            <ChevronRight className="w-3.5 h-3.5 text-indigo-400 dark:text-indigo-500 opacity-60" />
          )}
        </>
      )}
    </NavLink>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container — Floating Glass */}
      <aside className={cn(
        "fixed top-3 left-3 bottom-3 z-50 w-64 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
        "rounded-2xl glass-panel border border-white/20 dark:border-white/6",
        isMobileOpen ? "translate-x-0" : "-translate-x-[calc(100%+12px)]"
      )}>

        {/* Logo Area */}
        <div className="px-5 py-6 border-b border-white/15 dark:border-white/5 flex items-center">
          <Logo size="md" />
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5 scrollbar-hide">
          <p className="px-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
            Navigation
          </p>
          {navItems.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-200/60 dark:via-white/8 to-transparent" />

        {/* Bottom Navigation */}
        <div className="p-3 space-y-0.5">
          <p className="px-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
            Account
          </p>
          {bottomItems.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
          <button
            onClick={() => {
              authService.logout();
              window.location.href = '/auth/login';
            }}
            className="w-full group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-rose-500 dark:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-500/10 transition-all duration-200"
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
