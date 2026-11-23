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
  heroOverlay?: boolean;
  isLandingPage?: boolean;
}

const BridgeBrandIcon: React.FC<{ hero?: boolean }> = ({ hero }) => (
  <svg
    viewBox="0 0 40 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-8 h-7 shrink-0 ${hero ? 'text-white' : 'text-[#C9A227]'}`}
    aria-hidden="true"
  >
    <path
      d="M3 25H37"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M7 25V9M33 25V9"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M7 10C12 20 28 20 33 10"
      stroke={hero ? '#2DD4BF' : 'currentColor'}
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M14 16V25M20 17.5V25M26 16V25"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity="0.85"
    />
    <path
      d="M20 4L27 7.5L20 11L13 7.5L20 4Z"
      stroke={hero ? '#2DD4BF' : '#C9A227'}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

export const Navbar: React.FC<NavbarProps> = ({
  showSidebarToggle = false,
  isSidebarOpen = false,
  onToggleSidebar,
  heroOverlay = false,
  isLandingPage = false,
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
    setPublicMenuOpen(false);
    setSwitchMenuOpen(false);
  }, [location.pathname]);

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
  const profileBadgePath =
    activeRole === 'alumni'
      ? '/alumni/my-profile'
      : activeRole === 'admin'
      ? '/admin/profile'
      : activeRole === 'superAdmin'
      ? '/superadmin/profile'
      : '/student/profile';

  const scrollToSection = (sectionId: string) => {
    setPublicMenuOpen(false);
    if (sectionId === 'hero-top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const heroNavItems = [
    { id: 'hero-top', label: language === 'bn' ? t.nav.home : 'Home' },
    { id: 'features', label: language === 'bn' ? 'সুবিধাসমূহ' : 'Features' },
    { id: 'resources', label: language === 'bn' ? 'রিসোর্স' : 'Resources' },
    { id: 'contact', label: language === 'bn' ? 'যোগাযোগ' : 'Contact' },
  ];

  // Transparent public / hero top bar over dark campus photo
  if (heroOverlay) {
    return (
      <header className="absolute top-0 left-0 right-0 z-40 bg-transparent text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3 min-w-0">
            {/* Left Brand */}
            <Link
              to="/"
              className="flex items-center gap-2.5 group min-w-0 shrink-0"
            >
              <BridgeBrandIcon hero />
              <div className="flex flex-col leading-none">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                  BAUST
                </span>
                <span className="text-xs font-medium text-slate-200 tracking-wide">
                  Career Bridge
                </span>
              </div>
            </Link>

            {/* Right / Center Nav Links + Auth Controls */}
            <div className="flex items-center gap-3 sm:gap-6 shrink-0">
              {isLandingPage ? (
                <nav className="hidden md:flex items-center gap-7" aria-label="Landing navigation">
                  {heroNavItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => scrollToSection(item.id)}
                      className="text-sm font-medium text-slate-200 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              ) : (
                <nav className="hidden md:flex items-center gap-6" aria-label="Public navigation">
                  <Link
                    to="/"
                    className="text-sm font-medium text-slate-200 hover:text-white transition-colors whitespace-nowrap"
                  >
                    {t.nav.home}
                  </Link>
                </nav>
              )}

              {/* Language Switcher */}
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-0.5 border border-white/20 shrink-0">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                    language === 'en' ? 'bg-white text-[#0B2A3F] shadow-xs' : 'text-white/85 hover:text-white'
                  }`}
                  aria-label="Switch to English"
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('bn')}
                  className={`px-2 py-1 text-xs font-semibold rounded-md transition-all font-bengali cursor-pointer whitespace-nowrap ${
                    language === 'bn' ? 'bg-white text-[#0B2A3F] shadow-xs' : 'text-white/85 hover:text-white'
                  }`}
                  aria-label="Switch to Bengali"
                >
                  বাংলা
                </button>
              </div>

              {/* Desktop Auth Pills */}
              <div className="hidden md:flex items-center gap-2.5 shrink-0">
                {isApprovedUser ? (
                  <Link
                    to={dashboardPath}
                    className="inline-flex items-center justify-center px-5 min-h-[40px] rounded-full bg-[#14B8A6] hover:bg-[#2DD4BF] text-[#0B2A3F] text-sm font-bold transition-colors shadow-sm whitespace-nowrap"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center px-5 min-h-[40px] rounded-full border border-white/75 text-white hover:bg-white/15 text-sm font-semibold transition-colors whitespace-nowrap"
                    >
                      {t.nav.login}
                    </Link>
                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center px-5 min-h-[40px] rounded-full bg-[#14B8A6] hover:bg-[#2DD4BF] text-[#0B2A3F] text-sm font-bold transition-colors shadow-sm whitespace-nowrap"
                    >
                      {t.nav.register}
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Hamburger */}
              <button
                type="button"
                onClick={() => setPublicMenuOpen((o) => !o)}
                className="md:hidden p-2 rounded-lg text-white hover:bg-white/15 transition-colors cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {publicMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {publicMenuOpen && (
          <div className="md:hidden mx-4 mt-1 rounded-2xl bg-[#0B2A3F]/95 backdrop-blur-md border border-white/15 p-4 space-y-2 shadow-2xl">
            {isLandingPage ? (
              heroNavItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ))
            ) : (
              <Link
                to="/"
                onClick={() => setPublicMenuOpen(false)}
                className="block px-3.5 py-2.5 rounded-lg text-sm font-medium text-white hover:bg-white/10"
              >
                {t.nav.home}
              </Link>
            )}

            <div className="pt-2 border-t border-white/15 flex flex-col gap-2">
              {isApprovedUser ? (
                <Link
                  to={dashboardPath}
                  onClick={() => setPublicMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center px-4 min-h-[44px] rounded-full bg-[#14B8A6] text-[#0B2A3F] text-sm font-bold"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setPublicMenuOpen(false)}
                    className="w-full inline-flex items-center justify-center px-4 min-h-[44px] rounded-full border border-white/75 text-white text-sm font-semibold hover:bg-white/10"
                  >
                    {t.nav.login}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setPublicMenuOpen(false)}
                    className="w-full inline-flex items-center justify-center px-4 min-h-[44px] rounded-full bg-[#14B8A6] text-[#0B2A3F] text-sm font-bold hover:bg-[#2DD4BF]"
                  >
                    {t.nav.register}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-full mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-3 min-w-0">
          {/* Left: Mobile Sidebar Toggle + Brand */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
            {showSidebarToggle && isApprovedUser && onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="lg:hidden p-1.5 sm:p-2 text-slate-600 hover:text-[#0F2A4A] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
                aria-label="Toggle navigation drawer"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            <Link
              to={isApprovedUser ? dashboardPath : '/'}
              className="flex items-center gap-2 group min-w-0 flex-1"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-[#0F2A4A] to-[#2E5E3E] p-0.5 shadow-xs group-hover:shadow transition-all shrink-0">
                <div className="w-full h-full bg-[#0F2A4A] rounded-[6px] flex items-center justify-center border border-[#C9A227]/40">
                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-[#C9A227]" />
                </div>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span
                  className="text-xs sm:text-sm md:text-base font-bold text-[#0F2A4A] tracking-tight leading-tight truncate"
                  title={language === 'bn' ? t.brand : 'BAUST Career Bridge'}
                >
                  {language === 'bn' ? (
                    t.brand
                  ) : (
                    <>
                      BAUST <span className="text-[#0D9488]">Career Bridge</span>
                    </>
                  )}
                </span>
                <span
                  className="text-xs text-slate-500 font-medium hidden xl:block truncate"
                  title="Bangladesh Army University of Science & Technology"
                >
                  Bangladesh Army University of Science &amp; Technology
                </span>
              </div>
            </Link>
          </div>

          {/* Public links only when NOT in an authenticated portal session */}
          {!isApprovedUser && (
            <nav className="hidden md:flex items-center gap-5">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors whitespace-nowrap ${
                  location.pathname === '/'
                    ? 'text-[#0F2A4A] font-bold'
                    : 'text-slate-600 hover:text-[#0F2A4A]'
                }`}
              >
                {t.nav.home}
              </Link>
            </nav>
          )}

          {/* Right Utility Strip */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isApprovedUser && isReconnecting && (
              <span
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold shrink-0"
                title={t.docStages.reconnecting}
              >
                <WifiOff className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden md:inline">{t.docStages.reconnecting}</span>
              </span>
            )}

            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-1.5 sm:px-2 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  language === 'en' ? 'bg-white text-[#0F2A4A] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                aria-label="Switch to English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('bn')}
                className={`px-1.5 sm:px-2 py-1 text-xs font-semibold rounded-md transition-all font-bengali cursor-pointer whitespace-nowrap ${
                  language === 'bn' ? 'bg-white text-[#0F2A4A] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                aria-label="Switch to Bengali"
              >
                বাংলা
              </button>
            </div>

            {isApprovedUser && <NotificationDropdown />}

            {isDemoSession && !isAuthPage && (
              <div className="relative shrink-0" ref={switchRef}>
                <button
                  type="button"
                  disabled={isSwitchingDemo}
                  onClick={() => setSwitchMenuOpen((o) => !o)}
                  className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                  aria-label={t.nav.switchAccount}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span className="lg:hidden">
                    {isSwitchingDemo ? '...' : t.nav.switchLabel}
                  </span>
                  <span className="hidden lg:inline">
                    {isSwitchingDemo ? t.nav.switching : t.nav.switchAccount}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-amber-700 hidden sm:inline shrink-0" />
                </button>

                {switchMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                    <div className="px-3.5 py-1.5 border-b border-slate-100">
                      <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
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
                            <p className="text-xs text-slate-500">{acct.badgeText}</p>
                          </div>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded border ${ROLE_BADGE_COLORS[acct.role]}`}
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
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <Link
                  to="/login"
                  className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold text-[#0F2A4A] hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
                >
                  {t.nav.login}
                </Link>
                <Link
                  to="/register"
                  className="px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-[#0F2A4A] hover:bg-[#1A3E68] rounded-lg transition-all shadow-xs whitespace-nowrap"
                >
                  {t.nav.register}
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-slate-200 min-w-0 shrink-0">
                <Link
                  to={isApprovedUser ? profileBadgePath : '/approval-status'}
                  className="flex items-center gap-1.5 sm:gap-2 hover:opacity-85 transition-opacity min-w-0"
                  title={userProfile.name || 'Member'}
                >
                  <Avatar
                    src={userProfile.photoURL || userProfile.avatar || currentUser?.avatar || ''}
                    name={userProfile.name || 'Member'}
                    size="sm"
                    isVerified={Boolean(userProfile.isVerified)}
                  />
                  <div className="hidden sm:flex flex-col text-left min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[90px] lg:max-w-[130px]">
                        {userProfile.name}
                      </span>
                      {userProfile.isDemo && (
                        <span className="hidden md:inline-flex text-xs font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                          {t.nav.demoMode}
                        </span>
                      )}
                    </div>
                    <span
                      className={`hidden md:inline-flex text-xs font-semibold px-1.5 py-0.2 rounded border w-fit mt-0.5 ${ROLE_BADGE_COLORS[activeRole]}`}
                    >
                      {t.roles[activeRole]}
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="inline-flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-lg border border-rose-200 bg-rose-50/70 text-rose-700 hover:bg-rose-100 hover:text-rose-800 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
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
                className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
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
          <Link
            to="/"
            onClick={() => setPublicMenuOpen(false)}
            className={`block px-3 py-2 text-sm font-semibold rounded-lg ${
              location.pathname === '/'
                ? 'bg-[#0F2A4A]/10 text-[#0F2A4A]'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            {t.nav.home}
          </Link>
        </div>
      )}
    </header>
  );
};
