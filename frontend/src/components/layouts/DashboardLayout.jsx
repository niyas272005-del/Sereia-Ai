import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

const DashboardLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-500"
      style={{ background: 'var(--q-bg)' }}
    >
      {/* Ambient Background Gradient Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-30 dark:opacity-15 animate-blob"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)' }}
        />
        <div className="absolute top-20 -right-60 w-[700px] h-[700px] rounded-full opacity-20 dark:opacity-10 animate-blob animation-delay-2000"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)' }}
        />
        <div className="absolute -bottom-60 left-1/3 w-[600px] h-[600px] rounded-full opacity-20 dark:opacity-10 animate-blob-slow animation-delay-4000"
          style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.18) 0%, transparent 70%)' }}
        />
      </div>

      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Content Wrapper — offset for floating sidebar */}
      <div className="lg:pl-[268px] flex flex-col min-h-screen relative z-10 transition-all duration-300">
        <TopNav setMobileOpen={setIsMobileOpen} />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 w-full max-w-[1400px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
