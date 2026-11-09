/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { UserRole } from '../../types';
import { GraduationCap, ShieldCheck, Briefcase, Lock, Mail, ArrowRight, AlertCircle, Clock, XCircle, UserPlus } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { role, setRole, addToast } = useApp();
  const { login: firebaseLogin } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<UserRole>(role);
  const [identifier, setIdentifier] = useState('tanvir.1802045@baust.edu.bd');
  const [password, setPassword] = useState('baust123456');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRoleSelect = (newRole: UserRole) => {
    setSelectedRole(newRole);
    setErrorMessage(null);
    if (newRole === 'student') {
      setIdentifier('tanvir.1802045@baust.edu.bd');
      setPassword('baust123456');
    } else if (newRole === 'alumni') {
      setIdentifier('farhan.kabir@brainstation-23.com');
      setPassword('baust123456');
    } else {
      setIdentifier('registrar@baust.edu.bd');
      setPassword('admin123456');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    // Call real Firebase Authentication
    const res = await firebaseLogin(identifier, password);
    setIsLoading(false);

    if (res.success) {
      const activeRole = res.role || selectedRole;
      setRole(activeRole);
      addToast('success', 'Logged In Successfully', `Welcome back to BAUST Career Bridge!`);
      if (activeRole === 'student') {
        navigate('/student/dashboard');
      } else if (activeRole === 'alumni') {
        navigate('/alumni/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } else {
      // If the error is pending approval or rejection, NEVER bypass to demo
      const isPending = res.error?.includes('waiting for Admin approval');
      const isRejected = res.error?.includes('rejected');

      if (isPending || isRejected) {
        setErrorMessage(res.error || 'Account not approved.');
        addToast(isPending ? 'warning' : 'error', isPending ? 'Approval Pending' : 'Account Rejected', res.error);
        return;
      }

      // If tester is using built-in mock persona email, allow local demo login
      if (
        identifier === 'tanvir.1802045@baust.edu.bd' ||
        identifier === 'farhan.kabir@brainstation-23.com' ||
        identifier === 'registrar@baust.edu.bd'
      ) {
        setRole(selectedRole);
        addToast('info', 'Demo Profile Active', 'Signed in using local demo persona. Register your own account for full Firebase sync.');
        if (selectedRole === 'student') {
          navigate('/student/dashboard');
        } else if (selectedRole === 'alumni') {
          navigate('/alumni/dashboard');
        } else {
          navigate('/admin/dashboard');
        }
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please check credentials or register.');
        addToast('error', 'Login Failed', res.error || 'Invalid credentials');
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#0F2A4A] border border-[#C9A227] flex items-center justify-center mx-auto shadow-md">
            <GraduationCap className="w-7 h-7 text-[#C9A227]" />
          </div>
          <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight">
            Sign In to BAUST Career Bridge
          </h1>
          <p className="text-xs text-slate-500">
            Access your university career dashboard & administrative services
          </p>
        </div>

        {/* Tab switch between Sign In and Create Account */}
        <div className="grid grid-cols-2 p-1 bg-slate-200/80 rounded-xl text-xs font-bold">
          <div className="py-2 text-center rounded-lg bg-white text-[#0F2A4A] shadow-xs cursor-default">
            Sign In
          </div>
          <Link
            to="/register"
            className="py-2 text-center rounded-lg text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </Link>
        </div>

        {/* Role Segmenter */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 text-center uppercase tracking-wider">
            Select Your Role
          </label>
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-200/70 rounded-xl">
            <button
              type="button"
              onClick={() => handleRoleSelect('student')}
              className={`flex flex-col items-center gap-1 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'student'
                  ? 'bg-white text-[#0F2A4A] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('alumni')}
              className={`flex flex-col items-center gap-1 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'alumni'
                  ? 'bg-white text-[#0F2A4A] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4 text-sky-600" />
              <span>Alumni</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('admin')}
              className={`flex flex-col items-center gap-1 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-white text-[#0F2A4A] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <Card className="p-6 sm:p-8 space-y-5 border-slate-200/90 shadow-md">
          {errorMessage && (
            errorMessage.includes('waiting for Admin approval') ? (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-900 flex items-start gap-3 shadow-xs animate-in fade-in">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-900 text-sm">Account Pending Verification</h4>
                  <p className="leading-relaxed text-amber-800">
                    Your registration is waiting for Admin approval. The BAUST Registrar and Student Affairs Office will review your verification documents.
                  </p>
                </div>
              </div>
            ) : errorMessage.includes('rejected') ? (
              <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-xs text-rose-900 flex items-start gap-3 shadow-xs animate-in fade-in">
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-rose-900 text-sm">Registration Rejected</h4>
                  <p className="leading-relaxed text-rose-800">{errorMessage}</p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Address (Firebase or BAUST ID)"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. 1802045 or user@baust.edu.bd"
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input type="checkbox" defaultChecked className="rounded text-[#0F2A4A]" />
                <span>Remember me</span>
              </label>
              <a href="#" className="font-semibold text-[#0F2A4A] hover:underline">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to {selectedRole.toUpperCase()} Portal
            </Button>
          </form>

          {/* Quick Demo Fill Helper */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Evaluation tip: You can also change personas anytime using the floating pill at bottom-right.
            </p>
          </div>
        </Card>

        {/* Registration CTA */}
        <p className="text-center text-xs text-slate-600">
          Don't have a verified BAUST account?{' '}
          <Link to="/register" className="font-bold text-[#0F2A4A] hover:underline">
            Register here
          </Link>
        </p>

      </div>
    </div>
  );
};
