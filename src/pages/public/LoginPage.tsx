/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { CampusHeroBackdrop } from '../../components/ui/CampusHeroBackdrop';
import { UserRole } from '../../types';
import { ENABLE_DEMO_LOGIN, DEMO_ACCOUNTS } from '../../config/demoConfig';
import { getDashboardPathForRole } from './ApprovalStatusPage';
import {
  GraduationCap,
  ShieldCheck,
  Briefcase,
  Crown,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  KeyRound,
  CheckCircle2,
  Sparkles,
  UserCheck,
} from 'lucide-react';

interface LoginPageProps {
  portalRole?: UserRole;
}

const PORTAL_INFO: Record<
  UserRole,
  { titleEn: string; titleBn: string; subtitleEn: string; subtitleBn: string; badge: string; icon: React.ReactNode }
> = {
  student: {
    titleEn: 'Student Portal Sign In',
    titleBn: 'শিক্ষার্থী পোর্টাল লগইন',
    subtitleEn: 'Access your job board, mentorship hub, CV PDF builder & document desk',
    subtitleBn: 'চাকরি, মেন্টরশিপ হাব, সিভি বিল্ডার এবং নথিপত্র ডেস্কে প্রবেশ করুন',
    badge: 'Student Portal · Blue',
    icon: <GraduationCap className="w-7 h-7 text-blue-300" />,
  },
  alumni: {
    titleEn: 'Alumni Portal Sign In',
    titleBn: 'অ্যালামনাই পোর্টাল লগইন',
    subtitleEn: 'Post jobs & referrals, mentor students, RSVP events & manage transcripts',
    subtitleBn: 'চাকরি পোস্ট করুন, শিক্ষার্থীদের মেন্টর করুন এবং ট্রান্সক্রিপ্ট পরিচালনা করুন',
    badge: 'Alumni Portal · Green',
    icon: <Briefcase className="w-7 h-7 text-emerald-300" />,
  },
  admin: {
    titleEn: 'Admin Desk Sign In',
    titleBn: 'অ্যাডমিন ডেস্ক লগইন',
    subtitleEn: 'Manage job postings, process document requests & publish announcements',
    subtitleBn: 'চাকরি, নথিপত্রের আবেদন এবং অফিসিয়াল ঘোষণা পরিচালনা করুন',
    badge: 'Admin Portal · Orange',
    icon: <ShieldCheck className="w-7 h-7 text-orange-300" />,
  },
  superAdmin: {
    titleEn: 'Super Admin Directorate Sign In',
    titleBn: 'সুপার অ্যাডমিন ডিরেক্টরেট লগইন',
    subtitleEn: 'Central verification queue, role governance, user suspension & audit logs',
    subtitleBn: 'যাচাইকরণ তালিকা, রোল পরিচালনা এবং সিস্টেম অডিট লগ নিয়ন্ত্রণ করুন',
    badge: 'Super Admin · Purple',
    icon: <Crown className="w-7 h-7 text-purple-300" />,
  },
};

export const LoginPage: React.FC<LoginPageProps> = ({ portalRole }) => {
  const { addToast, t, language } = useApp();
  const { login: firebaseLogin, demoLogin, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<UserRole>(portalRole || 'student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [demoLoadingRole, setDemoLoadingRole] = useState<UserRole | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    if (portalRole) {
      setSelectedRole(portalRole);
      setErrorMessage(null);
    }
  }, [portalRole]);

  const handleRoleSelect = (newRole: UserRole) => {
    setSelectedRole(newRole);
    setErrorMessage(null);
    if (portalRole && portalRole !== newRole) {
      navigate(newRole === 'superAdmin' ? '/superadmin/login' : `/${newRole}/login`);
    }
  };

  const executeLogin = async (identifierToUse: string, passToUse: string, persist: boolean) => {
    setErrorMessage(null);
    const res = await firebaseLogin(identifierToUse, passToUse, persist);

    if (res.status === 'suspended') {
      addToast('error', 'Account Suspended', 'Please contact the BAUST Super Admin directorate.');
      navigate('/approval-status', {
        replace: true,
        state: {
          blockedStatus: 'suspended',
          name: res.profile?.name || 'BAUST Member',
          role: res.profile?.role || 'student',
          email: res.profile?.email || identifierToUse,
          baustId: res.profile?.baustId || '',
        },
      });
      return res;
    }

    if (res.success) {
      if (res.status === 'pending' || res.status === 'rejected') {
        addToast(
          res.status === 'pending' ? 'warning' : 'error',
          res.status === 'pending' ? 'Approval Pending' : 'Registration Rejected',
          res.status === 'pending'
            ? 'Your account is awaiting Super Admin approval.'
            : res.rejectionReason || 'Your registration was rejected.'
        );
        navigate('/approval-status', {
          replace: true,
          state: {
            blockedStatus: res.status,
            name: res.profile?.name || 'BAUST Member',
            role: res.profile?.role || 'student',
            email: res.profile?.email || identifierToUse,
            baustId: res.profile?.baustId || '',
            rejectionReason: res.rejectionReason || res.profile?.rejectionReason || '',
          },
        });
        return res;
      }

      addToast('success', 'Signed In', `Welcome to BAUST Career Bridge (${res.role})!`);
      navigate(getDashboardPathForRole(res.role), { replace: true });
      return res;
    }

    setErrorMessage(res.error || 'Authentication failed.');
    addToast('error', 'Login Failed', res.error || 'Invalid credentials');
    return res;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage(
        language === 'bn'
          ? 'অনুগ্রহ করে আপনার ইমেইল অথবা বাউস্ট আইডি লিখুন।'
          : 'Please enter your Email address or BAUST ID.'
      );
      return;
    }
    if (!password) {
      setErrorMessage(
        language === 'bn' ? 'অনুগ্রহ করে আপনার পাসওয়ার্ড লিখুন।' : 'Please enter your password.'
      );
      return;
    }

    setIsLoading(true);
    await executeLogin(identifier, password, rememberMe);
    setIsLoading(false);
  };

  const handleQuickDemoLogin = async (role: UserRole) => {
    if (!ENABLE_DEMO_LOGIN || demoLoadingRole || isLoading) return;
    setErrorMessage(null);
    setResetMessage(null);
    setDemoLoadingRole(role);

    try {
      const res = await demoLogin(role);
      if (res.blockedByRealSession) {
        addToast('warning', 'Active Session', 'You are already signed in. Please log out first.');
        return;
      }
      if (res.success) {
        addToast(
          'success',
          'Demo Mode Active',
          `Signed in as ${res.profile?.name || 'Demo User'} (${res.role || role}).`
        );
        navigate(getDashboardPathForRole(res.role || role), { replace: true });
        return;
      }
      const msg = res.error || 'Demo login failed.';
      setErrorMessage(msg);
      addToast('error', 'Demo Login Failed', msg);
    } finally {
      setDemoLoadingRole(null);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage(null);
    setErrorMessage(null);
    const targetEmail = (resetEmail || (identifier.includes('@') ? identifier : '')).trim();
    if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
      setErrorMessage(
        language === 'bn'
          ? 'পাসওয়ার্ড রিসেট লিংক পেতে একটি সঠিক ইমেইল ঠিকানা লিখুন।'
          : 'Please enter a valid email address to receive reset instructions.'
      );
      return;
    }
    setResetLoading(true);
    const res = await resetPassword(targetEmail);
    setResetLoading(false);
    if (res.success) {
      setResetMessage(
        language === 'bn'
          ? `যদি ${targetEmail} ঠিকানায় কোনো অ্যাকাউন্ট থাকে, তবে পাসওয়ার্ড রিসেট নির্দেশনা পাঠানো হয়েছে।`
          : `If an account exists for ${targetEmail}, password reset instructions have been sent to that inbox.`
      );
      addToast('info', 'Password Reset Requested', 'Check your inbox if that email is registered.');
    } else {
      setErrorMessage(res.error || 'Could not process password reset request.');
    }
  };

  const headerInfo = portalRole
    ? {
        title: language === 'bn' ? PORTAL_INFO[portalRole].titleBn : PORTAL_INFO[portalRole].titleEn,
        subtitle:
          language === 'bn' ? PORTAL_INFO[portalRole].subtitleBn : PORTAL_INFO[portalRole].subtitleEn,
        badge: PORTAL_INFO[portalRole].badge,
        icon: PORTAL_INFO[portalRole].icon,
      }
    : {
        title: t.auth.signInTitle,
        subtitle: t.auth.signInSubtitle,
        badge: null,
        icon: <GraduationCap className="w-7 h-7 text-[#C9A227]" />,
      };

  return (
    <div className="relative min-h-screen flex items-center justify-center pt-24 pb-12 px-4 overflow-hidden">
      <CampusHeroBackdrop />

      <div className="relative z-10 w-full max-w-md space-y-5">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#0F2A4A]/90 border border-[#5EEAD4]/50 flex items-center justify-center mx-auto shadow-lg">
            {headerInfo.icon}
          </div>
          {headerInfo.badge && (
            <span className="inline-block px-3 py-0.5 rounded-full bg-white/15 text-[#5EEAD4] border border-white/20 text-xs font-bold uppercase tracking-wider">
              {headerInfo.badge}
            </span>
          )}
          <h1 className="text-2xl font-bold text-white tracking-tight">{headerInfo.title}</h1>
          <p className="text-xs text-slate-200 leading-relaxed">{headerInfo.subtitle}</p>
        </div>

        {/* Sign In / Create Account switch */}
        <div className="grid grid-cols-2 p-1 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl text-xs font-bold">
          <div className="py-2 text-center rounded-lg bg-white text-[#0F2A4A] shadow-xs cursor-default">
            {t.auth.signInBtn}
          </div>
          <Link
            to="/register"
            className="py-2 text-center rounded-lg text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t.auth.createAccountTab}</span>
          </Link>
        </div>

        {/* 4-Role Portal Hint Selector */}
        <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl">
          <button
            type="button"
            onClick={() => handleRoleSelect('student')}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedRole === 'student'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-100 hover:bg-white/10'
            }`}
          >
            <GraduationCap className={`w-4 h-4 ${selectedRole === 'student' ? 'text-blue-600' : 'text-blue-300'}`} />
            <span className="truncate max-w-full">{t.roles.student}</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('alumni')}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedRole === 'alumni'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-100 hover:bg-white/10'
            }`}
          >
            <Briefcase className={`w-4 h-4 ${selectedRole === 'alumni' ? 'text-emerald-700' : 'text-emerald-300'}`} />
            <span className="truncate max-w-full">{t.roles.alumni}</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('admin')}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedRole === 'admin'
                ? 'bg-white text-orange-700 shadow-xs'
                : 'text-slate-100 hover:bg-white/10'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${selectedRole === 'admin' ? 'text-orange-600' : 'text-orange-300'}`} />
            <span className="truncate max-w-full">{t.nav.admins}</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('superAdmin')}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedRole === 'superAdmin'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-100 hover:bg-white/10'
            }`}
          >
            <Crown className={`w-4 h-4 ${selectedRole === 'superAdmin' ? 'text-purple-700' : 'text-purple-300'}`} />
            <span className="truncate max-w-full">{t.roles.superAdmin}</span>
          </button>
        </div>

        <Card className="p-6 sm:p-7 space-y-5 border-white/20 shadow-2xl">
          <div aria-live="polite" className="space-y-2 empty:hidden">
            {errorMessage && (
              <div
                role="alert"
                className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {resetMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{resetMessage}</span>
              </div>
            )}
          </div>

          {!showForgotPassword ? (
            <form onSubmit={handleLogin} noValidate className="space-y-4">
              <Input
                id="login-email"
                label={t.auth.emailOrIdLabel}
                type="text"
                autoFocus
                autoComplete="username"
                required
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={t.auth.emailOrIdPlaceholder}
                leftIcon={<UserCheck className="w-4 h-4" />}
              />

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="login-password"
                    label={t.auth.passwordLabel}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder={t.auth.passwordPlaceholder}
                    leftIcon={<Lock className="w-4 h-4" />}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                  <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#0F2A4A] focus:ring-[#14B8A6]"
                    />
                    <span>{t.auth.rememberMe}</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setResetEmail(identifier.includes('@') ? identifier : '');
                      setErrorMessage(null);
                      setResetMessage(null);
                    }}
                    className="text-xs font-semibold text-[#0F2A4A] hover:underline cursor-pointer"
                  >
                    {t.auth.forgotPassword}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading || Boolean(demoLoadingRole)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {t.auth.signInBtn}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0F2A4A]">
                <KeyRound className="w-4 h-4 text-[#C9A227]" />
                <span>{t.auth.resetTitle}</span>
              </div>
              <Input
                id="reset-email"
                label="Account Email"
                type="email"
                autoFocus
                autoComplete="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter your registered email"
                leftIcon={<Mail className="w-4 h-4" />}
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetMessage(null);
                    setErrorMessage(null);
                  }}
                >
                  {t.auth.backToLogin}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  isLoading={resetLoading}
                  disabled={resetLoading}
                >
                  {t.auth.sendResetLink}
                </Button>
              </div>
            </form>
          )}

          {/* Quick Demo Access (uses exact same Firebase Auth + ProtectedRoute flow) */}
          {ENABLE_DEMO_LOGIN && (
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                  {t.auth.quickDemoTitle}
                </span>
                <span className="text-xs font-medium text-slate-500">{t.auth.quickDemoSub}</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {DEMO_ACCOUNTS.map((acct) => (
                  <button
                    key={acct.role}
                    type="button"
                    disabled={isLoading || Boolean(demoLoadingRole)}
                    onClick={() => void handleQuickDemoLogin(acct.role)}
                    className={`p-3 rounded-lg border text-left transition-all min-h-[44px] cursor-pointer disabled:opacity-50 ${acct.accentClass}`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold truncate">{acct.label}</span>
                      {demoLoadingRole === acct.role && (
                        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
                      )}
                    </div>
                    <p className="text-xs opacity-85 truncate mt-0.5">{acct.badgeText}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>

        <p className="text-center text-xs text-slate-200">
          {t.auth.needAccount}{' '}
          <Link to="/register" className="font-bold text-[#5EEAD4] hover:underline">
            {t.auth.registerCta}
          </Link>
        </p>
      </div>
    </div>
  );
};

