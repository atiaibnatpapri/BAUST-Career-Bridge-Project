/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { Clock, XCircle, RefreshCw, LogOut, ShieldAlert, ArrowLeft } from 'lucide-react';

export const getDashboardPathForRole = (role?: string): string => {
  if (role === 'superAdmin') return '/superadmin/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'alumni') return '/alumni/dashboard';
  return '/student/dashboard';
};

interface BlockedLocationState {
  blockedStatus?: 'suspended' | 'pending' | 'rejected';
  name?: string;
  role?: string;
  email?: string;
  baustId?: string;
  rejectionReason?: string;
}

export const ApprovalStatusPage: React.FC = () => {
  const { firebaseUser, userProfile, loading, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [refreshing, setRefreshing] = useState(false);

  const blockedState = (location.state as BlockedLocationState | null) || null;
  const blockedStatusFromState = blockedState?.blockedStatus;

  useEffect(() => {
    if (!loading && userProfile?.verificationStatus === 'approved' && !userProfile?.suspended) {
      navigate(getDashboardPathForRole(userProfile.role), { replace: true });
    }
  }, [loading, userProfile, navigate]);

  if (loading) {
    return <Loader fullScreen label="Checking your account verification status..." />;
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    await logout(() => navigate('/login', { replace: true }));
  };

  if (blockedStatusFromState && (!firebaseUser || !userProfile)) {
    const isSusp = blockedStatusFromState === 'suspended';
    const isRej = blockedStatusFromState === 'rejected';
    const isPend = blockedStatusFromState === 'pending';

    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <Card
          className={`max-w-lg w-full p-8 space-y-6 shadow-md text-center ${
            isPend ? 'border-amber-200' : 'border-rose-200'
          }`}
        >
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border-2 ${
              isPend
                ? 'bg-amber-50 text-amber-600 border-amber-200'
                : 'bg-rose-50 text-rose-600 border-rose-200'
            }`}
          >
            {isSusp ? (
              <ShieldAlert className="w-8 h-8" />
            ) : isRej ? (
              <XCircle className="w-8 h-8" />
            ) : (
              <Clock className="w-8 h-8" />
            )}
          </div>

          <div className="space-y-2">
            <span
              className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                isPend ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {isSusp ? 'Account Suspended' : isRej ? 'Registration Rejected' : 'Awaiting Approval'}
            </span>
            <h1 className="text-2xl font-black text-[#0F2A4A]">
              {isSusp
                ? 'Your account has been suspended'
                : isRej
                ? 'Registration rejected'
                : 'Awaiting approval'}
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              {isSusp
                ? `Access for ${blockedState?.name || blockedState?.email} has been temporarily suspended by the BAUST Super Admin directorate. For security, your session has been signed out.`
                : isRej
                ? blockedState?.rejectionReason ||
                  'Your registration request was rejected by the Super Admin. Please review the reason or contact the registrar.'
                : `Thank you, ${blockedState?.name || blockedState?.email || 'applicant'}. Your account is awaiting Super Admin approval before you can sign in.`}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5">
            {blockedState?.name && (
              <div className="flex justify-between">
                <span className="text-slate-500">Name</span>
                <span className="font-bold text-slate-900">{blockedState.name}</span>
              </div>
            )}
            {blockedState?.email && (
              <div className="flex justify-between">
                <span className="text-slate-500">Email</span>
                <span className="font-mono font-semibold text-slate-800">{blockedState.email}</span>
              </div>
            )}
            {blockedState?.role && (
              <div className="flex justify-between">
                <span className="text-slate-500">Role</span>
                <span className="font-bold text-slate-900 uppercase">{blockedState.role}</span>
              </div>
            )}
            {blockedState?.baustId && (
              <div className="flex justify-between">
                <span className="text-slate-500">BAUST / Staff ID</span>
                <span className="font-mono font-bold text-[#0F2A4A]">{blockedState.baustId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Standing</span>
              <span className={`font-bold ${isPend ? 'text-amber-700' : 'text-rose-700'}`}>
                {isSusp ? 'Suspended' : isRej ? 'Rejected' : 'Pending Approval'}
              </span>
            </div>
            {isRej && blockedState?.rejectionReason && (
              <div className="pt-2 mt-2 border-t border-slate-200">
                <span className="text-slate-500 block mb-0.5">Rejection Reason:</span>
                <span className="font-semibold text-rose-700">{blockedState.rejectionReason}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/login">
              <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Return to Sign In
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (!firebaseUser || !userProfile) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <Card className="max-w-md w-full p-8 text-center space-y-4 border-slate-200 shadow-md">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Clock className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-[#0F2A4A]">Account Approval Required</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            New BAUST Student, Alumni, and Admin registrations must be approved by the Super Admin before accessing any portal dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
            <Link to="/login">
              <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Sign In to Check Status
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline">Register New Account</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const isRejected = userProfile.verificationStatus === 'rejected';
  const isSuspended = Boolean(userProfile.suspended);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <Card className="max-w-lg w-full p-8 space-y-6 border-slate-200 shadow-md text-center">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border-2 ${
            isSuspended || isRejected
              ? 'bg-rose-50 text-rose-600 border-rose-200'
              : 'bg-amber-50 text-amber-600 border-amber-200'
          }`}
        >
          {isSuspended ? (
            <ShieldAlert className="w-8 h-8" />
          ) : isRejected ? (
            <XCircle className="w-8 h-8" />
          ) : (
            <Clock className="w-8 h-8" />
          )}
        </div>

        <div className="space-y-2">
          <span
            className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
              isSuspended || isRejected
                ? 'bg-rose-100 text-rose-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {isSuspended
              ? 'Account Suspended'
              : isRejected
              ? 'Registration Rejected'
              : 'Awaiting Super Admin Approval'}
          </span>

          <h1 className="text-2xl font-black text-[#0F2A4A]">
            {isSuspended
              ? 'Your account has been suspended'
              : isRejected
              ? 'Your registration was rejected'
              : 'Your account is awaiting Super Admin approval'}
          </h1>

          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            {isSuspended
              ? 'Please contact the BAUST Super Admin directorate to review your account standing.'
              : isRejected
              ? userProfile.rejectionReason ||
                'Your submitted registration details could not be verified against university archives.'
              : `Thank you, ${userProfile.name}. Your ${userProfile.role} account (${userProfile.email}) is queued for Super Admin verification. Access to dashboards is locked until approved.`}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Registered Name</span>
            <span className="font-bold text-slate-900">{userProfile.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Requested Role</span>
            <span className="font-bold text-slate-900 uppercase">{userProfile.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">BAUST / Staff ID</span>
            <span className="font-mono font-bold text-[#0F2A4A]">{userProfile.baustId || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Current Status</span>
            <span
              className={`font-bold capitalize ${
                isRejected || isSuspended ? 'text-rose-700' : 'text-amber-700'
              }`}
            >
              {isSuspended ? 'Suspended' : userProfile.verificationStatus}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {!isRejected && !isSuspended && (
            <Button
              variant="primary"
              onClick={handleRefresh}
              isLoading={refreshing}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Check Approval Status
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleSignOut}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Sign Out &amp; Return to Login
          </Button>
        </div>
      </Card>
    </div>
  );
};
