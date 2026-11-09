/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { NotificationDropdown } from './NotificationDropdown';
import { Avatar } from '../ui/Avatar';
import { 
  Menu, 
  X, 
  Globe, 
  GraduationCap, 
  Compass, 
  MessageSquare, 
  FileText, 
  Users, 
  LogOut,
  LayoutDashboard
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { role, currentUser, language, setLanguage, t, addToast } = useApp();
  const { firebaseUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    addToast('info', 'Logged Out', 'You have been signed out.');
    navigate('/login');
  };

  const isPublicPage = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register';

  const getDashboardPath = () => {
    if (role === 'student') return '/student/dashboard';
    if (role === 'alumni') return '/alumni/dashboard';
    return '/admin/dashboard';
  };

  const getMentorshipPath = () => {
    if (role === 'alumni') return '/alumni/mentorship';
    return '/student/mentorship';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F2A4A] to-[#2E5E3E] p-0.5 shadow-sm group-hover:shadow transition-all">
              <div className="w-full h-full bg-[#0F2A4A] rounded-[10px] flex items-center justify-center border border-[#C9A227]/40">
                <GraduationCap className="w-5 h-5 text-[#C9A227]" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-[#0F2A4A] tracking-tight leading-tight">
                BAUST <span className="text-[#2E5E3E]">Career Bridge</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:block">
                Bangladesh Army University of Science & Technology
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/' ? 'text-[#0F2A4A] font-bold' : 'text-slate-600 hover:text-[#0F2A4A]'
              }`}
            >
              {t.nav.home}
            </Link>
            <Link
              to="/student/directory"
              className={`text-sm font-medium transition-colors ${
                location.pathname.includes('/directory') ? 'text-[#0F2A4A] font-bold' : 'text-slate-600 hover:text-[#0F2A4A]'
              }`}
            >
              {t.nav.directory}
            </Link>
            <Link
              to={getMentorshipPath()}
              className={`text-sm font-medium transition-colors ${
                location.pathname.includes('/mentorship') ? 'text-[#0F2A4A] font-bold' : 'text-slate-600 hover:text-[#0F2A4A]'
              }`}
            >
              {t.nav.mentorship}
            </Link>
            <Link
              to="/alumni/services"
              className={`text-sm font-medium transition-colors ${
                location.pathname.includes('/services') ? 'text-[#0F2A4A] font-bold' : 'text-slate-600 hover:text-[#0F2A4A]'
              }`}
            >
              {t.nav.adminDesk}
            </Link>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                  language === 'en'
                    ? 'bg-white text-[#0F2A4A] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                aria-label="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('bn')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all font-bengali ${
                  language === 'bn'
                    ? 'bg-white text-[#0F2A4A] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                aria-label="বাংলা ভাষায় পরিবর্তন করুন"
              >
                বাংলা
              </button>
            </div>

            {/* Notifications */}
            <NotificationDropdown />

            {/* Auth / Profile Area */}
            {isPublicPage ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-[#0F2A4A] hover:bg-slate-100 rounded-xl transition-colors"
                >
                  {t.nav.login}
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-[#0F2A4A] hover:bg-[#1A3E68] rounded-xl transition-all shadow-xs"
                >
                  {t.nav.register}
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <Link
                  to={getDashboardPath()}
                  className="hidden sm:flex items-center gap-2 hover:opacity-85 transition-opacity"
                >
                  <Avatar
                    src={currentUser.avatar}
                    name={currentUser.name}
                    size="sm"
                    isVerified={role === 'alumni'}
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 capitalize">
                      {role}
                    </span>
                  </div>
                </Link>
                <Link
                  to={getDashboardPath()}
                  className="p-2 text-slate-600 hover:text-[#0F2A4A] hover:bg-slate-100 rounded-xl transition-colors sm:hidden"
                  title="My Dashboard"
                >
                  <LayoutDashboard className="w-5 h-5" />
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors hidden sm:block"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-150">
          <div className="flex flex-col gap-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              {t.nav.home}
            </Link>
            <Link
              to={getDashboardPath()}
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-[#0F2A4A] bg-[#0F2A4A]/5 rounded-xl flex items-center justify-between"
            >
              <span>{t.nav.dashboard} ({role})</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#0F2A4A] text-white uppercase text-[10px]">
                Active
              </span>
            </Link>
            <Link
              to="/student/directory"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              {t.nav.directory}
            </Link>
            <Link
              to={getMentorshipPath()}
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              {t.nav.mentorship}
            </Link>
            <Link
              to="/alumni/services"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              {t.nav.adminDesk}
            </Link>
            <Link
              to="/chat"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              {t.nav.chat}
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" />
              <div>
                <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 capitalize">{role}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="text-xs font-medium text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t.nav.logout}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
