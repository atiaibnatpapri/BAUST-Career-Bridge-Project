/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useAdminDeskStore } from '../../hooks/useAdminDeskStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Loader } from '../../components/ui/Loader';
import { buildChatLink } from '../../constants/baustDataModel';
import { safeArray, safeFirstWord, toList } from '../../utils/utils';
import { formatLocalizedNumber } from '../../data/translations';
import {
  Users,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  Video,
  Clock,
  Award,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Briefcase,
  Megaphone,
  HeartHandshake,
} from 'lucide-react';

export const AlumniDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    mentorshipRequests,
    conversations,
    announcements,
    respondMentorship,
    openOrCreateConversation,
    t,
    language,
  } = useApp();
  const { firebaseUser, userProfile, loading } = useAuth();
  const { requests: docRequests, applications: myPostedApplicants } = useAdminDeskStore();

  if (loading || (firebaseUser && !userProfile)) {
    return <Loader label={t.common.loading} />;
  }

  const verificationStatus =
    userProfile?.verificationStatus || (userProfile?.isVerified ? 'approved' : 'pending');
  const activeId = userProfile?.id || currentUser?.id || '';
  const alumniName = (userProfile?.name ?? currentUser?.name ?? 'BAUST Alumni').trim() || 'BAUST Alumni';
  const alumniFirstName = safeFirstWord(alumniName, 'Alumni');

  const alumniSkills = toList(userProfile?.skills ?? (currentUser as any)?.skills);
  const alumniSlots = toList(userProfile?.availableSlots ?? (currentUser as any)?.availableSlots);
  const completionItems = [
    Boolean((userProfile?.name ?? currentUser?.name ?? '').trim()),
    Boolean((userProfile?.designation ?? (currentUser as any)?.designation ?? '').trim()),
    Boolean((userProfile?.company ?? (currentUser as any)?.company ?? '').trim()),
    Boolean((userProfile?.bio ?? (currentUser as any)?.bio ?? '').trim()),
    alumniSkills.length > 0,
    alumniSlots.length > 0,
  ];
  const completionPct = Math.round(
    (completionItems.filter(Boolean).length / completionItems.length) * 100
  );

  // Requests received by this alumni (strictly scoped for authenticated users)
  const safeMentorships = safeArray(mentorshipRequests);
  const receivedRequests = activeId
    ? safeMentorships.filter((m) => m.alumniId === activeId || m.mentorId === activeId)
    : [];

  const pendingRequests = receivedRequests.filter((r) => r?.status === 'Pending');
  const onHoldRequests = receivedRequests.filter((r) => r?.status === 'On Hold');
  const upcomingSessions = receivedRequests.filter((r) => r?.status === 'Accepted');
  const unreadMessagesCount = safeArray(conversations).reduce((sum, c) => sum + (c?.unreadCount || 0), 0);

  const myServices = docRequests;

  const totalMenteesCount =
    typeof userProfile?.totalMentees === 'number'
      ? userProfile.totalMentees
      : upcomingSessions.length;
  const ratingScore =
    typeof userProfile?.rating === 'number' && userProfile.rating > 0
      ? userProfile.rating.toFixed(1)
      : '—';

  return (
    <div className="space-y-8">
      {/* Live Verification Status Banner */}
      {userProfile &&
        (verificationStatus === 'approved' ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-emerald-900">Verified BAUST Alumni Account · Alumni Portal</p>
                <p className="text-emerald-700">
                  Your graduation record ({userProfile.baustId || 'Verified'}) is approved.
                </p>
              </div>
            </div>
            <Link
              to="/alumni/my-profile"
              className="text-xs font-bold text-emerald-800 hover:underline shrink-0"
            >
              Manage Profile
            </Link>
          </div>
        ) : verificationStatus === 'rejected' ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="font-bold text-rose-900">Verification Rejected</p>
                <p className="text-rose-700">
                  {userProfile.rejectionReason || 'Please contact BAUST Super Admin.'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold text-amber-900">Verification Status: Pending Super Admin Review</p>
                <p className="text-amber-800">
                  This status updates live as soon as the Super Admin approves your account.
                </p>
              </div>
            </div>
          </div>
        ))}

      {/* Welcome Banner (Alumni Green Accent) */}
      <div className="bg-gradient-to-r from-[#064E3B] via-[#1E4D3B] to-[#2E5E3E] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>
              {t.sidebar.alumniPortal} · {alumniName}
            </span>
            {Boolean(userProfile?.verifiedAlumniBadge) && (
              <span className="px-2 py-0.5 rounded-full bg-amber-300/20 text-amber-100 text-xs font-bold">
                {t.common.verifiedAlumni}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
            Welcome, {alumniFirstName} — Empowering BAUST Engineers & Leaders
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
            Post referral jobs, mentor BAUST students, host knowledge sessions, manage booking slots, review CVs, and submit document requests.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <Link to="/alumni/jobs">
              <Button size="sm" variant="accent" leftIcon={<Briefcase className="w-3.5 h-3.5" />}>
                {t.sidebar.postJobs}
              </Button>
            </Link>
            <Link to="/alumni/sessions">
              <Button
                size="sm"
                variant="outline"
                className="border-white/90 bg-white text-[#0F2A4A] hover:bg-slate-100 hover:text-[#0F2A4A] focus:bg-slate-100 focus:text-[#0F2A4A] active:bg-slate-200 active:text-[#0F2A4A] visited:text-[#0F2A4A] [&_svg]:text-[#0F2A4A] shadow-xs"
                leftIcon={<Video className="w-3.5 h-3.5" />}
              >
                {t.sidebar.sessionsWebinars}
              </Button>
            </Link>
            <Link to="/alumni/appointments">
              <Button
                size="sm"
                variant="outline"
                className="border-white/90 bg-white text-[#0F2A4A] hover:bg-slate-100 hover:text-[#0F2A4A] focus:bg-slate-100 focus:text-[#0F2A4A] active:bg-slate-200 active:text-[#0F2A4A] visited:text-[#0F2A4A] [&_svg]:text-[#0F2A4A] shadow-xs"
                leftIcon={<Calendar className="w-3.5 h-3.5" />}
              >
                {t.sidebar.appointments}
              </Button>
            </Link>
            <Link to="/alumni/cv-reviews">
              <Button
                size="sm"
                variant="outline"
                className="border-white/90 bg-white text-[#0F2A4A] hover:bg-slate-100 hover:text-[#0F2A4A] focus:bg-slate-100 focus:text-[#0F2A4A] active:bg-slate-200 active:text-[#0F2A4A] visited:text-[#0F2A4A] [&_svg]:text-[#0F2A4A] shadow-xs"
                leftIcon={<Award className="w-3.5 h-3.5" />}
              >
                {t.sidebar.cvReview}
              </Button>
            </Link>
            <Link to="/alumni/events">
              <Button
                size="sm"
                variant="outline"
                className="border-white/90 bg-white text-[#0F2A4A] hover:bg-slate-100 hover:text-[#0F2A4A] focus:bg-slate-100 focus:text-[#0F2A4A] active:bg-slate-200 active:text-[#0F2A4A] visited:text-[#0F2A4A] [&_svg]:text-[#0F2A4A] shadow-xs"
                leftIcon={<Megaphone className="w-3.5 h-3.5" />}
              >
                {t.sidebar.eventsSummits}
              </Button>
            </Link>
            <Link to="/alumni/giving-back">
              <Button
                size="sm"
                variant="outline"
                className="border-white/90 bg-white text-[#0F2A4A] hover:bg-slate-100 hover:text-[#0F2A4A] focus:bg-slate-100 focus:text-[#0F2A4A] active:bg-slate-200 active:text-[#0F2A4A] visited:text-[#0F2A4A] [&_svg]:text-[#0F2A4A] shadow-xs"
                leftIcon={<HeartHandshake className="w-3.5 h-3.5" />}
              >
                {t.sidebar.givingBack}
              </Button>
            </Link>
            <Link to="/alumni/services">
              <Button
                size="sm"
                variant="outline"
                className="border-white/90 bg-white text-[#0F2A4A] hover:bg-slate-100 hover:text-[#0F2A4A] focus:bg-slate-100 focus:text-[#0F2A4A] active:bg-slate-200 active:text-[#0F2A4A] visited:text-[#0F2A4A] [&_svg]:text-[#0F2A4A] shadow-xs"
                leftIcon={<FileText className="w-3.5 h-3.5" />}
              >
                {t.sidebar.documentServices}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Completion & Impact Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Profile Completion Bar */}
        <Card className="p-5 border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t.dashboard.profileCompletion}
            </span>
            <span className="text-xs font-bold text-emerald-700 tabular-nums">{formatLocalizedNumber(completionPct, language)}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 pt-0.5">
            {completionPct < 100 ? (
              <Link to="/alumni/my-profile" className="text-[#0F2A4A] font-semibold hover:underline">
                Complete your profile to reach 100%
              </Link>
            ) : (
              'Your alumni profile is complete'
            )}
          </p>
        </Card>

        <Card className="p-5 border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t.dashboard.studentsMentored}
            </p>
            <p className="text-2xl font-black text-[#0F2A4A] tabular-nums mt-0.5">
              {formatLocalizedNumber(totalMenteesCount, language)}
            </p>
            <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> Active mentorship impact
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#0F2A4A]/10 text-[#0F2A4A]">
            <Users className="w-5 h-5" />
          </div>
        </Card>

        <Link to="/alumni/mentorship" className="block">
          <Card className="p-5 border-slate-200 hover:border-emerald-300 transition-colors flex items-center justify-between h-full">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t.dashboard.pendingRequests}
              </p>
              <p className="text-2xl font-black text-amber-700 tabular-nums mt-0.5">
                {formatLocalizedNumber(pendingRequests.length + onHoldRequests.length, language)}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                {formatLocalizedNumber(pendingRequests.length, language)} pending ·{' '}
                {formatLocalizedNumber(onHoldRequests.length, language)} on hold
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
          </Card>
        </Link>

        <Link to="/alumni/jobs" className="block">
          <Card className="p-5 border-slate-200 hover:border-emerald-300 transition-colors flex items-center justify-between h-full">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t.dashboard.postedJobApplicants}
              </p>
              <p className="text-2xl font-black text-emerald-700 tabular-nums mt-0.5">
                {formatLocalizedNumber(myPostedApplicants.length, language)}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                Rating: {ratingScore === '—' ? 'New' : `${ratingScore}/5.0`} · {unreadMessagesCount} unread msgs
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
              <Briefcase className="w-5 h-5" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Main Grid: Mentorship Requests + Upcoming Sessions + Service Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Incoming Requests & Upcoming Sessions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Mentorship Requests Received (Accept / Decline) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0F2A4A]">
                  Mentorship Inquiries Received ({pendingRequests.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Junior students requesting 1-on-1 career assistance
                </p>
              </div>
            </div>

            {pendingRequests.length === 0 ? (
              <Card className="p-8 text-center space-y-2 border-dashed border-slate-300">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">No data yet</p>
                <p className="text-xs text-slate-500">
                  You have no pending student mentorship inquiries.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {(pendingRequests ?? []).map((req) => {
                  if (!req) return null;
                  return (
                    <Card key={req.id} className="p-5 border-slate-200 space-y-3.5 shadow-xs">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <Avatar
                            src={req.studentAvatar}
                            name={req.studentName ?? 'Student'}
                            size="md"
                          />
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">
                              {req.studentName ?? 'BAUST Student'}
                            </h4>
                            <p className="text-xs text-slate-500">
                              {req.studentDept ?? 'BAUST'} · {req.studentBatch ?? ''}
                            </p>
                            <Badge variant="navy" size="sm" className="mt-1">
                              Topic: {req.topic ?? 'Career Guidance'}
                            </Badge>
                          </div>
                        </div>

                        <div className="text-right text-xs text-slate-500">
                          <span className="block font-semibold text-slate-800">
                            {req.preferredDate ?? 'TBD'}
                          </span>
                          <span>{req.preferredTime ?? ''}</span>
                        </div>
                      </div>

                      {req.note && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 italic">
                          "{req.note}"
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-slate-100">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => respondMentorship(req.id, 'On Hold')}
                          leftIcon={<Clock className="w-4 h-4 text-amber-600" />}
                        >
                          Put On Hold
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => respondMentorship(req.id, 'Declined')}
                          leftIcon={<XCircle className="w-4 h-4 text-rose-500" />}
                        >
                          Decline
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => respondMentorship(req.id, 'Accepted')}
                          leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-300" />}
                        >
                          Accept & Schedule Meet
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Mentoring Sessions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0F2A4A]">
                Confirmed Mentorship Sessions
              </h3>
              <span className="text-xs text-slate-500">{upcomingSessions.length} sessions</span>
            </div>

            {upcomingSessions.length === 0 ? (
              <Card className="p-8 text-center space-y-2 border-dashed border-slate-300">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">No data yet</p>
                <p className="text-xs text-slate-500">
                  Confirmed 1-on-1 mentorship sessions will appear here once accepted.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {(upcomingSessions ?? []).map((session) => {
                  if (!session) return null;
                  return (
                    <Card
                      key={session.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-slate-200"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar
                          src={session.studentAvatar}
                          name={session.studentName ?? 'Student'}
                          size="md"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900">
                              {session.studentName ?? 'BAUST Student'}
                            </h4>
                            <Badge variant="approved" size="sm">
                              Confirmed
                            </Badge>
                          </div>
                          <p className="text-xs font-semibold text-[#0F2A4A]">
                            {session.topic ?? 'Mentorship Session'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {session.scheduledDate || session.preferredDate || 'TBD'} at{' '}
                            {session.scheduledTime || session.preferredTime || 'TBD'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                          onClick={async () => {
                            if (!session.studentId) return;
                            const convId = await openOrCreateConversation(session.studentId, 'mentorship');
                            navigate(buildChatLink('alumni', convId));
                          }}
                        >
                          Chat
                        </Button>
                        {session.meetingLink && (
                          <a href={session.meetingLink} target="_blank" rel="noreferrer">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-xs"
                              leftIcon={<Video className="w-3.5 h-3.5" />}
                            >
                              Join Meet
                            </Button>
                          </a>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Recent Service Requests & Admin Desk Quick Summary */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0F2A4A]">My Document Requests</h3>
              <Link to="/alumni/services" className="text-xs font-bold text-[#0F2A4A] hover:underline">
                New Request
              </Link>
            </div>

            {myServices.length === 0 ? (
              <Card className="p-6 text-center space-y-2 border-dashed border-slate-300">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">No data yet</p>
                <p className="text-xs text-slate-600">No active document applications.</p>
                <Link to="/alumni/services">
                  <Button variant="outline" size="sm">
                    Request Transcripts
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-3">
                {(myServices ?? []).slice(0, 3).map((req) => {
                  if (!req) return null;
                  const deliveryLabel = safeFirstWord(req.delivery?.method, 'Standard');
                  return (
                    <Card key={req.id} className="p-4 space-y-2.5 border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-900">{req.id}</span>
                        <Badge
                          variant={
                            req.status === 'Ready' || req.status === 'Delivered'
                              ? 'ready'
                              : req.status === 'Approved'
                              ? 'approved'
                              : req.status === 'Rejected'
                              ? 'rejected'
                              : 'pending'
                          }
                          size="sm"
                        >
                          {req.status ?? 'Submitted'}
                        </Badge>
                      </div>

                      <p className="text-xs font-bold text-[#0F2A4A]">
                        {req.services?.[0]?.serviceName ?? 'Academic Document'}
                      </p>
                      <p className="text-xs text-slate-500">
                        Method: {deliveryLabel} · Submitted {req.submittedAt ?? 'Recently'}
                      </p>

                      {req.delivery?.courierTrackingNumber && (
                        <p className="text-xs text-slate-700 bg-slate-100 p-2 rounded-lg font-mono">
                          Tracking: {req.delivery.courierTrackingNumber}
                        </p>
                      )}

                      <div className="pt-1">
                        <Link
                          to={`/alumni/admin-desk/requests/${req.id}`}
                          className="text-xs font-bold text-[#0F2A4A] hover:underline inline-flex items-center gap-1"
                        >
                          View Timeline <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Live University Notices */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0F2A4A]">University Career Notices</h3>
              <Link to="/alumni/notices" className="text-xs font-bold text-[#0F2A4A] hover:underline">
                View all
              </Link>
            </div>
            {(() => {
              const todayIso = new Date().toISOString().split('T')[0];
              const visibleNotices = safeArray(announcements).filter(
                (n) =>
                  Boolean(n) &&
                  n.active !== false &&
                  (!n.expiresAt || n.expiresAt >= todayIso) &&
                  (n.targetAudience === 'All' || n.targetAudience === 'Alumni')
              );
              if (visibleNotices.length === 0) {
                return (
                  <Card className="p-4 border border-slate-200 text-center text-xs text-slate-500">
                    No active university notices right now.
                  </Card>
                );
              }
              return visibleNotices.slice(0, 2).map((notice) => (
                <Link key={notice.id} to={`/alumni/notices/${notice.id}`} className="block">
                  <Card hoverable className="p-4 bg-gradient-to-br from-[#0F2A4A]/5 to-[#2E5E3E]/5 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="army" size="sm">
                        {notice.category}
                      </Badge>
                      {(notice.priority === 'Important' || notice.pinned) && (
                        <Badge variant="pending" size="sm">
                          Important
                        </Badge>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-[#0F2A4A]">{notice.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {notice.content}
                    </p>
                  </Card>
                </Link>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};
