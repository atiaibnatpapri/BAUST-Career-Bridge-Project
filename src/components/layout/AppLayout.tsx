/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { DemoRoleSwitcher } from './DemoRoleSwitcher';
import { ToastContainer } from '../ui/ToastContainer';

export const AppLayout: React.FC = () => {
  const location = useLocation();

  const isPublicPage = 
    location.pathname === '/' || 
    location.pathname === '/login' || 
    location.pathname === '/register' ||
    location.pathname === '/404';

  const isChatPage = location.pathname === '/chat';

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA] text-[#0F2A4A]">
      <Navbar />

      <div className="flex-1 flex w-full">
        {!isPublicPage && <Sidebar />}

        <main className={`flex-1 flex flex-col min-w-0 ${isChatPage ? 'p-0' : 'p-4 sm:p-6 lg:p-8'}`}>
          <div className={`w-full mx-auto flex-1 flex flex-col ${isChatPage ? 'max-w-none' : 'max-w-7xl'}`}>
            <Outlet />
          </div>
        </main>
      </div>

      {!isChatPage && <Footer />}

      {/* Floating Demo Persona Switcher */}
      <DemoRoleSwitcher />

      {/* Floating Toast Notifications */}
      <ToastContainer />
    </div>
  );
};
