/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { Avatar } from '../ui/Avatar';
import { getDashboardPathForRole } from '../../pages/public/ApprovalStatusPage';
import { ENABLE_DEMO_LOGIN, DEMO_ACCOUNTS } from '../../config/demoConfig';
import { UserRole } from '../../types';
import {
  Menu,
  X,
  GraduationCap,
  LogOut,
  ChevronDown,
  ArrowLeftRight,
  WifiOff,
} from 'lucide-react';

const ROLE_BADGE_COLORS: Record<UserRole, string> = {
  student: 'bg-blue-100 text-blue-800 border-blue-200',
  alumni: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  admin: 'bg-orange-100 text-orange-800 border-orange-200',
  superAdmin: 'bg-purple-100 text-purple-800 border-purple-200',
};

interface NavbarProps {
  showSidebarToggle?: boolean;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  showSidebarToggle = false,
  isSidebarOpen = false,
  onToggleSidebar,
}) => {
  const { currentUser, language, setLanguage, t, addToast, isReconnecting } = useApp();
  const { firebaseUser, userProfile, isSwitchingDemo, demoLogin, logout } = useAuth();
  const [publicMenuOpen, setPublicMenuOpen] = useState(false);
  const [switchMenuOpen, setSwitchMenuOpen] = useState(false);
  const switchRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const activeRole: UserRole = userProfile?.role || 'student';
  const isApprovedUser = Boolean(
    firebaseUser && userProfile && userProfile.verificationStatus === 'approved' && !userProfile.suspended
  );
  const isDemoSession = Boolean(isApprovedUser && userProfile?.isDemo && ENABLE_DEMO_LOGIN);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (switchRef.current && !switchRef.current.contains(event.target as Node)) {
        setSwitchMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleLogout = async () => {
    setSwitchMenuOpen(false);
    setPublicMenuOpen(false);
    await logout(() => {
      addToast('info', 'Logged Out', 'Your session has been cleared.');
      navigate('/login', { replace: true });
    });
  };

  const handleSwitchDemo = async (role: UserRole) => {
    setSwitchMenuOpen(false);
    setPublicMenuOpen(false);
    const res = await demoLogin(role);
    if (res.blockedByRealSession) {
      addToast('warning', 'Active Session', 'You are already signed in. Please log out first.');
      return;
    }
    if (res.success && res.role) {
      addToast('success', 'Demo Account Switched', `Now signed in as ${res.profile?.name} (${res.role}).`);
      navigate(getDashboardPathForRole(res.role), { replace: true });
    } else {
      addToast('error', 'Demo Switch Failed', res.error || 'Could not switch demo account.');
    }
  };

  const otherDemoAccounts = DEMO_ACCOUNTS.filter((acct) => acct.role !== activeRole);

  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname.endsWith('/login') ||
    location.pathname === '/register' ||
    location.pathname.startsWith('/register/') ||
    location.pathname.endsWith('/register') ||
    location.pathname === '/approval-status';

  const dashboardPath = getDashboardPathForRole(activeRole);

  const publicLinks = [
    { to: '/', label: t.nav.home },
    { to: '/verify-document', label: t.nav.verifyDoc },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-full mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-3">
          {/* Left: Mobile Sidebar Toggle + Brand */}
          <div className="flex items-center gap-2 min-w-0">
            {showSidebarToggle && isApprovedUser && onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="lg:hidden p-2 text-slate-600 hover:text-[#0F2A4A] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                aria-label="Toggle navigation drawer"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            <Link
              to={isApprovedUser ? dashboardPath : '/'}
              className="flex items-center gap-2.5 shrink-0 group min-w-0"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0F2A4A] to-[#2E5E3E] p-0.5 shadow-sm group-hover:shadow transition-all shrink-0">
                <div className="w-full h-full bg-[#0F2A4A] rounded-[10px] flex items-center justify-center border border-[#C9A227]/40">
                  <GraduationCap className="w-5 h-5 text-[#C9A227]" />
                </div>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm sm:text-base font-bold text-[#0F2A4A] tracking-tight leading-tight truncate">
                  {language === 'bn' ? (
                    t.brand
                  ) : (
                    <>
                      BAUST <span className="text-[#2E5E3E]">Career Bridge</span>
                    </>
                  )}
                </span>
                <span className="text-[10px] text-slate-500 font-medium hidden sm:block truncate">
                  Bangladesh Army University of Science &amp; Technology
                </span>
              </div>
            </Link>
          </div>

          {/* Public links only when NOT in an authenticated portal session */}
          {!isApprovedUser && (
            <nav className="hidden md:flex items-center gap-5">
              {publicLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`text-sm font-medium transition-colors whitespace-nowrap ${
                    location.pathname === item.to
                      ? 'text-[#0F2A4A] font-bold'
                      : 'text-slate-600 hover:text-[#0F2A4A]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right Utility Strip */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {isApprovedUser && isReconnecting && (
              <span
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold"
                title={t.docStages.reconnecting}
              >
                <WifiOff className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden sm:inline">{t.docStages.reconnecting}</span>
              </span>
            )}

            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  language === 'en' ? 'bg-white text-[#0F2A4A] shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                aria-label="Switch to English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('bn')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all font-bengali cursor-pointer ${
                  language === 'bn' ? 'bg-white text-[#0F2A4A] shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                aria-label="Switch to Bengali"
              >
                বাংলা
              </button>
            </div>

            {isApprovedUser && <NotificationDropdown />}

            {isDemoSession && !isAuthPage && (
              <div className="relative" ref={switchRef}>
                <button
                  type="button"
                  disabled={isSwitchingDemo}
                  onClick={() => setSwitchMenuOpen((o) => !o)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-amber-700" />
                  <span className="hidden md:inline">
                    {isSwitchingDemo ? t.nav.switching : t.nav.switchAccount}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-amber-700" />
                </button>

                {switchMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                    <div className="px-3.5 py-1.5 border-b border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                        {t.nav.demoModeSwitch}
                      </p>
                    </div>
                    <div className="py-1">
                      {otherDemoAccounts.map((acct) => (
                        <button
                          key={acct.role}
                          type="button"
                          disabled={isSwitchingDemo}
                          onClick={() => void handleSwitchDemo(acct.role)}
                          className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center justify-between gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-900">{acct.label}</p>
                            <p className="text-[10px] text-slate-500">{acct.badgeText}</p>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${ROLE_BADGE_COLORS[acct.role]}`}
                          >
                            {t.nav.switchLabel}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!firebaseUser || !userProfile || (isAuthPage && location.pathname !== '/approval-status') ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold text-[#0F2A4A] hover:bg-slate-100 rounded-xl transition-colors whitespace-nowrap"
                >
                  {t.nav.login}
                </Link>
                <Link
                  to="/register"
                  className="px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-[#0F2A4A] hover:bg-[#1A3E68] rounded-xl transition-all shadow-xs whitespace-nowrap"
                >
                  {t.nav.register}
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link
                  to={isApprovedUser ? dashboardPath : '/approval-status'}
                  className="hidden sm:flex items-center gap-2 hover:opacity-85 transition-opacity"
                >
                  <Avatar
                    src={userProfile.avatar || currentUser?.avatar || ''}
                    name={userProfile.name || 'Member'}
                    size="sm"
                    isVerified={Boolean(userProfile.isVerified)}
                  />
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                        {userProfile.name}
                      </span>
                      {userProfile.isDemo && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                          {t.nav.demoMode}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded border w-fit mt-0.5 ${ROLE_BADGE_COLORS[activeRole]}`}
                    >
                      {t.roles[activeRole]}
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50/70 text-rose-700 hover:bg-rose-100 hover:text-rose-800 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                  title={t.nav.logout}
                  aria-label={t.nav.logout}
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">{t.nav.logout}</span>
                </button>
              </div>
            )}

            {!isApprovedUser && (
              <button
                type="button"
                onClick={() => setPublicMenuOpen(!publicMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Toggle navigation menu"
              >
                {publicMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {!isApprovedUser && publicMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-2">
          {publicLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setPublicMenuOpen(false)}
              className={`block px-3 py-2 text-sm font-semibold rounded-xl ${
                location.pathname === item.to
                  ? 'bg-[#0F2A4A]/10 text-[#0F2A4A]'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};
