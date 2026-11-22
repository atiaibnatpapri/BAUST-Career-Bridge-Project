/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { ToastContainer } from '../ui/ToastContainer';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const { firebaseUser, userProfile } = useAuth();
  const { language } = useApp();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  const isPublicPage =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname.endsWith('/login') ||
    location.pathname === '/register' ||
    location.pathname.startsWith('/register/') ||
    location.pathname.endsWith('/register') ||
    location.pathname === '/approval-status' ||
    location.pathname === '/404';

  const isApprovedSession = Boolean(
    firebaseUser && userProfile && userProfile.verificationStatus === 'approved' && !userProfile.suspended
  );

  const isChatPage =
    location.pathname === '/chat' ||
    location.pathname.startsWith('/student/messages') ||
    location.pathname.startsWith('/alumni/messages');

  const showSidebar = !isPublicPage && isApprovedSession;

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#F5F7FA] text-[#0F2A4A] overflow-x-hidden ${
        language === 'bn' ? 'font-bengali leading-relaxed' : ''
      }`}
    >
      <Navbar
        showSidebarToggle={showSidebar}
        isSidebarOpen={mobileDrawerOpen}
        onToggleSidebar={() => setMobileDrawerOpen((o) => !o)}
      />

      <div className="flex-1 flex w-full min-w-0">
        {showSidebar && (
          <Sidebar
            mobileOpen={mobileDrawerOpen}
            onCloseMobile={() => setMobileDrawerOpen(false)}
          />
        )}

        <main className={`flex-1 flex flex-col min-w-0 ${isChatPage ? 'p-0' : 'p-4 sm:p-6 lg:p-8'}`}>
          <div className={`w-full mx-auto flex-1 flex flex-col min-w-0 ${isChatPage ? 'max-w-none' : 'max-w-7xl'}`}>
            <Outlet />
          </div>
        </main>
      </div>

      {!isChatPage && <Footer />}

      <ToastContainer />
    </div>
  );
};
