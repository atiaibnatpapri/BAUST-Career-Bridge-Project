/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useAdminDeskStore } from '../../hooks/useAdminDeskStore';
import { subscribeFirestoreUsers, subscribeJobs } from '../../services/firestorePortal';
import { subscribeReports } from '../../services/careerBridgeService';
import { computeAlumniStats, ReportEntity } from '../../constants/baustDataModel';
import { JobPosting } from '../../types';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import {
  Users,
  Briefcase,
  FileText,
  Megaphone,
  BarChart3,
  ArrowRight,
  GraduationCap,
  ShieldAlert,
  Video,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { announcements, mentorshipRequests, t } = useApp();
  const { firebaseUser, userProfile, loading } = useAuth();
  const { requests: deskRequests, applications } = useAdminDeskStore();

  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [users, setUsers] = useState<Record<string, any>[]>([]);
  const [reports, setReports] = useState<ReportEntity[]>([]);

  useEffect(() => {
    const unsubJobs = subscribeJobs(setJobs);
    const unsubUsers = subscribeFirestoreUsers(setUsers);
    const unsubReports = subscribeReports({}, setReports);
    return () => {
      unsubJobs();
      unsubUsers();
      unsubReports();
    };
  }, []);

  if (loading || (firebaseUser && !userProfile)) {
    return <Loader label={t.common.loading} />;
  }

  const studentCount = users.filter((u) => u.role === 'student' && u.verificationStatus === 'approved' && !u.suspended).length;
  const alumniStats = computeAlumniStats(users);
  const alumniCount = alumniStats.verifiedApprovedAlumni;
  const pendingDocs = deskRequests.filter((r) =>
    ['Submitted', 'Payment Verified', 'Under Review', 'Action Required', 'Approved', 'Processing'].includes(
      r.status
    )
  ).length;
  const pendingReports = reports.filter((r) => r.status === 'Pending').length;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-[#7C2D12] via-[#C2410C] to-[#EA580C] rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-white text-xs font-bold backdrop-blur-xs">
              {t.sidebar.adminPortal} · Orange Portal
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-950/35 text-orange-100 text-xs font-semibold">
              {userProfile?.office || 'University Administration'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            BAUST Admin Operations Console
          </h1>
          <p className="text-xs sm:text-sm text-orange-50/90">
            Manage job postings, process document requests, moderate safety reports, publish notices, and view live analytics
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Link to="/admin/jobs">
            <Button variant="accent" size="sm" leftIcon={<Briefcase className="w-4 h-4" />}>
              {t.sidebar.manageJobs} ({jobs.length})
            </Button>
          </Link>
          <Link to="/admin/admin-desk?tab=requests">
            <Button
              variant="outline"
              size="sm"
              className="border-white/90 bg-white text-[#0F2A4A] hover:bg-slate-100 hover:text-[#0F2A4A]"
              leftIcon={<FileText className="w-4 h-4" />}
            >
              {t.sidebar.documentRequests} ({pendingDocs})
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t.dashboard.approvedStudents}
          value={studentCount}
          subtitle="Verified active undergraduate accounts"
          icon={<GraduationCap className="w-5 h-5" />}
          iconBg="bg-orange-50 text-orange-700"
        />
        <StatCard
          title={t.dashboard.approvedAlumni}
          value={alumniCount}
          subtitle={`${alumniStats.pendingAlumni} pending approval`}
          icon={<Users className="w-5 h-5" />}
          iconBg="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          title={t.dashboard.activeJobs}
          value={jobs.filter((j) => j.status === 'Open').length}
          subtitle={`${jobs.length} listings · ${applications.length} applications`}
          icon={<Briefcase className="w-5 h-5" />}
          iconBg="bg-blue-50 text-blue-700"
        />
        <StatCard
          title={t.dashboard.documentRequests}
          value={deskRequests.length}
          subtitle={`${pendingDocs} pending · ${pendingReports} moderation alerts`}
          icon={<FileText className="w-5 h-5" />}
          iconBg="bg-amber-50 text-amber-700"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <Card className="p-6 border-slate-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#0F2A4A]">{t.sidebar.manageJobs}</h3>
          <p className="text-xs text-slate-600">
            Post campus placement drives, close expired jobs, and coordinate with alumni recruiters.
          </p>
          <Link to="/admin/jobs" className="inline-flex items-center gap-1 text-xs font-bold text-orange-700 hover:underline">
            Open Job Manager <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        <Card className="p-6 border-slate-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#0F2A4A]">{t.sidebar.documentRequests}</h3>
          <p className="text-xs text-slate-600">
            Verify fees, approve transcripts/certificates, and dispatch completed academic records.
          </p>
          <Link to="/admin/admin-desk" className="inline-flex items-center gap-1 text-xs font-bold text-orange-700 hover:underline">
            Open Document Desk <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        <Card className="p-6 border-slate-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
            <Megaphone className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#0F2A4A]">{t.sidebar.announcements}</h3>
          <p className="text-xs text-slate-600">
            Publish university notices and career fair updates ({announcements.length} active notices).
          </p>
          <Link to="/admin/announcements" className="inline-flex items-center gap-1 text-xs font-bold text-orange-700 hover:underline">
            Manage Announcements <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        <Card className="p-6 border-slate-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#0F2A4A]">
            {t.sidebar.moderationReports} ({pendingReports})
          </h3>
          <p className="text-xs text-slate-600">
            Review reported profiles, job posts, and safety complaints submitted by members ({reports.length} total).
          </p>
          <Link to="/admin/moderation" className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:underline">
            Open Moderation Queue <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        <Card className="p-6 border-slate-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Video className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#0F2A4A]">{t.sidebar.sessionsWebinars}</h3>
          <p className="text-xs text-slate-600">
            Coordinate official university webinars and alumni knowledge-sharing workshops.
          </p>
          <Link to="/admin/sessions" className="inline-flex items-center gap-1 text-xs font-bold text-orange-700 hover:underline">
            Open Knowledge Sessions <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        <Card className="p-6 border-slate-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#0F2A4A]">{t.sidebar.reportsStats}</h3>
          <p className="text-xs text-slate-600">
            View real-time department breakdown, mentorship sessions ({mentorshipRequests.length}), and placement trends.
          </p>
          <Link to="/admin/reports" className="inline-flex items-center gap-1 text-xs font-bold text-orange-700 hover:underline">
            View Reports <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>
      </div>
    </div>
  );
};
