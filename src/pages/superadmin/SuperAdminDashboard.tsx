/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  seedDemoAccountsAndData,
  subscribeActivityLogs,
  subscribeFirestoreUsers,
  subscribeJobs,
} from '../../services/firestorePortal';
import { subscribeReports } from '../../services/careerBridgeService';
import { computeAlumniStats, ReportEntity } from '../../constants/baustDataModel';
import { ActivityLogItem } from '../../types';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Loader } from '../../components/ui/Loader';
import {
  Crown,
  UserCheck,
  Users,
  UserCog,
  Briefcase,
  Database,
  ArrowRight,
  CheckCircle2,
  Activity,
} from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  const { verifications, addToast } = useApp();
  const { userProfile, loading } = useAuth();

  const [users, setUsers] = useState<Record<string, any>[]>([]);
  const [jobsCount, setJobsCount] = useState(0);
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [reports, setReports] = useState<ReportEntity[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [seedSummary, setSeedSummary] = useState<string | null>(null);

  useEffect(() => {
    if (!userProfile) return;
    const u1 = subscribeFirestoreUsers(setUsers);
    const u2 = subscribeJobs((items) => setJobsCount(items.length));
    const u3 = subscribeActivityLogs(setLogs);
    const u4 = subscribeReports({}, setReports);
    return () => {
      u1();
      u2();
      u3();
      u4();
    };
  }, [userProfile]);

  if (loading || !userProfile) {
    return <Loader label="Loading Super Admin Directorate..." />;
  }

  const pendingCount = verifications.filter((v) => v.status === 'Pending').length;
  const approvedAdmins = users.filter((u) => u.role === 'admin' && u.verificationStatus === 'approved').length;
  const suspendedCount = users.filter((u) => Boolean(u.suspended)).length;
  const alumniStats = computeAlumniStats(users);
  const pendingReportsCount = reports.filter((r) => r.status === 'Pending').length;

  const handleSeedDemo = async () => {
    setSeeding(true);
    setSeedSummary(null);
    try {
      const res = await seedDemoAccountsAndData({
        uid: userProfile.id,
        name: userProfile.name,
        isDemo: Boolean(userProfile.isDemo),
      });
      setSeedSummary(res.summary);
      addToast('success', 'Demo Data Reset', res.summary);
    } catch (err: any) {
      addToast('error', 'Reset Failed', err?.message || 'Could not reset demo accounts.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-purple-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold inline-flex items-center gap-1">
              <Crown className="w-3 h-3" /> Super Admin · Purple Portal
            </span>
            {userProfile?.isDemo && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-black uppercase">
                DEMO MODE
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight mt-1">
            Central Verification & System Governance
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Exclusive authority over registration approvals, Admin roles, account suspensions, and system seeding
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link to="/superadmin/verifications">
            <Button
              variant="primary"
              size="sm"
              className="bg-purple-700 hover:bg-purple-800"
              leftIcon={<UserCheck className="w-4 h-4" />}
            >
              Verification Queue ({pendingCount})
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedDemo}
            isLoading={seeding}
            disabled={seeding}
            className="border-purple-300 text-purple-800 hover:bg-purple-50"
            leftIcon={<Database className="w-4 h-4" />}
          >
            Reset Demo Data
          </Button>
        </div>
      </div>

      {seedSummary && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{seedSummary}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Pending Approvals"
          value={pendingCount}
          subtitle="Student, Alumni & Admin requests"
          icon={<UserCheck className="w-5 h-5" />}
          iconBg="bg-purple-100 text-purple-800"
        />
        <StatCard
          title="Total Users"
          value={users.length}
          subtitle={`${suspendedCount} suspended`}
          icon={<Users className="w-5 h-5" />}
          iconBg="bg-blue-50 text-blue-700"
        />
        <StatCard
          title="Active Admins"
          value={approvedAdmins}
          subtitle="Approved administrative staff"
          icon={<UserCog className="w-5 h-5" />}
          iconBg="bg-orange-50 text-orange-700"
        />
        <StatCard
          title="Verified Alumni"
          value={alumniStats.verifiedApprovedAlumni}
          subtitle={`${alumniStats.featuredAlumniCount} featured · ${alumniStats.pendingAlumni} pending`}
          icon={<UserCheck className="w-5 h-5" />}
          iconBg="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          title="Live Job Listings"
          value={jobsCount}
          subtitle="Across all departments"
          icon={<Briefcase className="w-5 h-5" />}
          iconBg="bg-blue-50 text-blue-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#0F2A4A] flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-700" />
              Recent System Activity
            </h2>
            <Link to="/superadmin/activity" className="text-xs font-bold text-purple-700 hover:underline">
              Full Audit Trail
            </Link>
          </div>

          {logs.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
              No audit events logged yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {logs.slice(0, 6).map((log) => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="navy" size="sm">
                        {log.action}
                      </Badge>
                      <span className="font-bold text-slate-900">{log.actorName}</span>
                    </div>
                    <p className="text-slate-600 mt-1">{log.details}</p>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">{log.createdAtLabel}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 border-slate-200 space-y-3">
          <h2 className="text-base font-bold text-[#0F2A4A]">Governance Shortcuts</h2>
          <Link
            to="/superadmin/verifications"
            className="p-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 flex items-center justify-between text-xs font-bold text-purple-900"
          >
            <span>Verification Queue ({pendingCount} Pending)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/superadmin/users"
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800"
          >
            <span>Manage All Users ({users.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/superadmin/admins"
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800"
          >
            <span>Manage Admin Accounts ({approvedAdmins})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/superadmin/moderation"
            className="p-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center justify-between text-xs font-bold text-rose-900"
          >
            <span>Moderation &amp; Safety Queue ({pendingReportsCount} Pending)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Card>
      </div>
    </div>
  );
};
