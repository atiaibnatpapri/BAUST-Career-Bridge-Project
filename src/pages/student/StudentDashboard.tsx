/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useAdminDeskStore } from '../../hooks/useAdminDeskStore';
import { downloadTextDocument } from '../../utils/download';
import { safeArray, safeFirstWord } from '../../utils/utils';
import { deriveAcademicStanding } from '../../constants/baustDataModel';
import { formatLocalizedNumber } from '../../data/translations';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Loader } from '../../components/ui/Loader';
import {
  Users,
  Calendar,
  MessageSquare,
  FileText,
  ArrowRight,
  Video,
  Clock,
  Download,
  CheckCircle2,
  XCircle,
  Briefcase,
  ClipboardList,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { currentUser, alumniList, mentorshipRequests, conversations, announcements, addToast, t, language } = useApp();
  const { firebaseUser, userProfile, loading } = useAuth();
  const { applications, requests: docRequests } = useAdminDeskStore();

  if (loading || (firebaseUser && !userProfile)) {
    return <Loader label={t.common.loading} />;
  }

  // Student specific filtering
  const student = currentUser?.role === 'student' ? currentUser : null;
  const studentName = (userProfile?.name ?? currentUser?.name ?? 'BAUST Student').trim() || 'BAUST Student';
  const studentFirstName = safeFirstWord(studentName, 'Student');
  const activeStudentId = userProfile?.id || student?.id || '';
  const academicStanding = deriveAcademicStanding(
    student?.batch || userProfile?.batch,
    userProfile?.passingYear
  );

  // Live Verification status from Firestore profile listener
  const verificationStatus =
    userProfile?.verificationStatus || (userProfile?.isVerified ? 'approved' : 'pending');

  const safeMentorships = safeArray(mentorshipRequests);
  const safeAlumni = safeArray(alumniList);
  const safeConversations = safeArray(conversations);
  const safeAnnouncements = safeArray(announcements);

  // Active mentorship sessions for this student
  const studentSessions = activeStudentId
    ? safeMentorships.filter((m) => m.studentId === activeStudentId)
    : [];

  const activeMentorshipCount = studentSessions.filter(
    (s) => s?.status === 'Pending' || s?.status === 'On Hold' || s?.status === 'Accepted'
  ).length;
  const upcomingSessions = studentSessions.filter(
    (s) => s?.status === 'Accepted' && Boolean(s?.meetingLink)
  );
  const unreadMessagesCount = safeConversations.reduce((sum, c) => sum + (c?.unreadCount || 0), 0);
  const activeDocRequestsCount = docRequests.filter(
    (r) => !['Delivered', 'Rejected', 'Cancelled'].includes(r.status)
  ).length;

  // Recommended alumni from the same department
  const studentDept = student?.department || userProfile?.department || 'CSE';
  const recommendedAlumni = safeAlumni
    .filter((a) => (a?.department ?? 'CSE') === studentDept)
    .slice(0, 3);

  const careerResources = [
    {
      title: 'BAUST Standard Tech CV Template',
      desc: 'ATS-optimized LaTeX & Word formats crafted for software & hardware engineering.',
      category: 'Resume Kit',
      format: 'LaTeX / Word',
      url: '#',
    },
    {
      title: '47th BCS Preliminary Strategy & Booklist',
      desc: 'Comprehensive syllabus breakdown curated by BAUST Cadre alumni officers.',
      category: 'Govt Cadre',
      format: 'PDF Guide',
      url: '#',
    },
    {
      title: 'DAAD & US Graduate Admissions Guide',
      desc: 'Step-by-step SOP guides, professor cold email templates, and scholarship timelines.',
      category: 'Higher Studies',
      format: 'SOP Templates',
      url: '#',
    },
    {
      title: 'Full-Stack & Mobile System Mock Interview Bank',
      desc: '120+ real interview questions asked at Brain Station 23, Samsung R&D, and bKash.',
      category: 'Interview Prep',
      format: '120+ Q&A',
      url: '#',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Live Verification Status Banner */}
      {userProfile &&
        (verificationStatus === 'approved' ? (
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <p className="font-bold text-blue-950">Verified BAUST Student Account · Student Portal</p>
                <p className="text-blue-700">
                  Your BAUST ID ({userProfile.baustId || 'Verified'}) is approved with full student access.
                </p>
              </div>
            </div>
            <Link
              to="/student/profile"
              className="text-xs font-bold text-blue-800 hover:underline shrink-0"
            >
              View Profile &amp; CV Builder
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
                  This status updates live as soon as the Super Admin approves your ID.
                </p>
              </div>
            </div>
          </div>
        ))}

      {/* Welcome Banner (Student Blue Accent) */}
      <div className="bg-gradient-to-r from-[#0F2A4A] via-[#1D4ED8] to-[#1E40AF] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-blue-300" />
            <span>
              {t.sidebar.studentPortal} · {studentName} ({studentDept}{' '}
              {student?.batch || userProfile?.batch || 'BAUST'})
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold">
              {academicStanding.levelTerm}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
            {studentFirstName}, Your Career Highway to Industry & Higher Studies
          </h1>

          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Browse verified jobs &amp; internships, connect with BAUST alumni mentors, track your applications, and build your official academic CV.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <Link to="/student/jobs">
              <Button size="sm" variant="accent" leftIcon={<Briefcase className="w-3.5 h-3.5" />}>
                {t.sidebar.jobsInternships}
              </Button>
            </Link>
            <Link to="/student/applications">
              <Button
                size="sm"
                variant="outline"
                className="border-white/90 bg-white text-[#0F2A4A] hover:bg-slate-100 hover:text-[#0F2A4A] focus:bg-slate-100 focus:text-[#0F2A4A] active:bg-slate-200 active:text-[#0F2A4A] visited:text-[#0F2A4A] [&_svg]:text-[#0F2A4A] shadow-xs"
                leftIcon={<ClipboardList className="w-3.5 h-3.5" />}
              >
                {t.sidebar.applicationTracker}
              </Button>
            </Link>
            <Link to="/student/sessions">
              <Button
                size="sm"
                variant="outline"
                className="border-white/90 bg-white text-[#0F2A4A] hover:bg-slate-100 hover:text-[#0F2A4A] focus:bg-slate-100 focus:text-[#0F2A4A] active:bg-slate-200 active:text-[#0F2A4A] visited:text-[#0F2A4A] [&_svg]:text-[#0F2A4A] shadow-xs"
                leftIcon={<Video className="w-3.5 h-3.5" />}
              >
                {t.sidebar.sessionsWebinars}
              </Button>
            </Link>
            <Link to="/student/appointments">
              <Button
                size="sm"
                variant="outline"
                className="border-white/90 bg-white text-[#0F2A4A] hover:bg-slate-100 hover:text-[#0F2A4A] focus:bg-slate-100 focus:text-[#0F2A4A] active:bg-slate-200 active:text-[#0F2A4A] visited:text-[#0F2A4A] [&_svg]:text-[#0F2A4A] shadow-xs"
                leftIcon={<Calendar className="w-3.5 h-3.5" />}
              >
                {t.sidebar.appointments}
              </Button>
            </Link>
            <Link to="/student/cv-reviews">
              <Button
                size="sm"
                variant="outline"
                className="border-white/90 bg-white text-[#0F2A4A] hover:bg-slate-100 hover:text-[#0F2A4A] focus:bg-slate-100 focus:text-[#0F2A4A] active:bg-slate-200 active:text-[#0F2A4A] visited:text-[#0F2A4A] [&_svg]:text-[#0F2A4A] shadow-xs"
                leftIcon={<FileText className="w-3.5 h-3.5" />}
              >
                {t.sidebar.cvReview}
              </Button>
            </Link>
            <Link to="/student/directory">
              <Button
                size="sm"
                variant="outline"
                className="border-white/90 bg-white text-[#0F2A4A] hover:bg-slate-100 hover:text-[#0F2A4A] focus:bg-slate-100 focus:text-[#0F2A4A] active:bg-slate-200 active:text-[#0F2A4A] visited:text-[#0F2A4A] [&_svg]:text-[#0F2A4A] shadow-xs"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                {t.sidebar.directory}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/student/mentorship" className="block">
          <Card className="p-4 border-slate-200 hover:border-[#0F2A4A]/40 transition-colors h-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t.dashboard.activeRequests}
                </p>
                <p className="text-2xl font-black text-amber-700 tabular-nums mt-0.5">
                  {formatLocalizedNumber(activeMentorshipCount, language)}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                  {formatLocalizedNumber(upcomingSessions.length, language)} scheduled
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/student/applications" className="block">
          <Card className="p-4 border-slate-200 hover:border-[#0F2A4A]/40 transition-colors h-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t.dashboard.jobApplications}
                </p>
                <p className="text-2xl font-black text-[#0F2A4A] tabular-nums mt-0.5">
                  {formatLocalizedNumber(applications.length, language)}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                  {formatLocalizedNumber(
                    applications.filter((a) => !['Rejected', 'Withdrawn', 'Job Removed'].includes(a.status)).length,
                    language
                  )}{' '}
                  active
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0F2A4A]/10 text-[#0F2A4A]">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/student/document-requests/history" className="block">
          <Card className="p-4 border-slate-200 hover:border-[#0F2A4A]/40 transition-colors h-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t.dashboard.documentRequests}
                </p>
                <p className="text-2xl font-black text-emerald-700 tabular-nums mt-0.5">
                  {formatLocalizedNumber(docRequests.length, language)}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                  {formatLocalizedNumber(activeDocRequestsCount, language)} in progress
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/student/messages" className="block">
          <Card className="p-4 border-slate-200 hover:border-[#0F2A4A]/40 transition-colors h-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t.dashboard.unreadMessages}
                </p>
                <p className="text-2xl font-black text-sky-700 tabular-nums mt-0.5">
                  {formatLocalizedNumber(unreadMessagesCount, language)}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                  {formatLocalizedNumber(safeConversations.length, language)} active threads
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Main Grid: Upcoming Sessions & Recommended Alumni */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Upcoming Sessions + Career Resources */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Mentorship Sessions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0F2A4A]">Upcoming Mentorship Sessions</h3>
                <p className="text-xs text-slate-500">Confirmed 1-on-1 calls with alumni seniors</p>
              </div>
              <Link to="/student/mentorship" className="text-xs font-bold text-[#0F2A4A] hover:underline">
                View all ({studentSessions.length})
              </Link>
            </div>

            {upcomingSessions.length === 0 ? (
              <Card className="p-8 text-center space-y-3 border-dashed border-slate-300">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">No data yet</p>
                <p className="text-xs font-medium text-slate-600">
                  No scheduled sessions for this week.
                </p>
                <Link to="/student/directory">
                  <Button size="sm" variant="outline">
                    Browse Alumni to Request a Slot
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-3">
                {(upcomingSessions ?? []).map((session) => {
                  if (!session) return null;
                  return (
                    <Card
                      key={session.id}
                      className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-slate-200"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 font-bold shrink-0">
                          <Video className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {session.alumniName ?? 'BAUST Mentor'}
                            </span>
                            <span className="text-xs text-slate-500">
                              ({session.alumniCompany ?? 'BAUST Alumni'})
                            </span>
                            <Badge variant="approved" size="sm">
                              Confirmed
                            </Badge>
                          </div>
                          <p className="text-xs font-semibold text-[#0F2A4A]">
                            Topic: {session.topic ?? 'Mentorship'}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {session.scheduledDate || session.preferredDate || 'TBD'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {session.scheduledTime || session.preferredTime || 'TBD'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {session.meetingLink && (
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full sm:w-auto"
                        >
                          <Button
                            size="sm"
                            variant="secondary"
                            className="w-full sm:w-auto"
                            leftIcon={<Video className="w-3.5 h-3.5" />}
                          >
                            Join Google Meet
                          </Button>
                        </a>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Curated Career Resources */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0F2A4A]">
                  Curated Career Resources & Kits
                </h3>
                <p className="text-xs text-slate-500">
                  Handcrafted templates and syllabus guides from alumni
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(careerResources ?? []).map((res, idx) => {
                if (!res) return null;
                return (
                  <Card key={idx} hoverable className="p-4 space-y-2.5 border-slate-200">
                    <div className="flex items-center justify-between">
                      <Badge variant="navy" size="sm">
                        {res.category ?? 'Resource'}
                      </Badge>
                      <span className="text-xs text-slate-500 font-mono">
                        {res.format ?? 'Guide'}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{res.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{res.desc}</p>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const slug = (res.title ?? 'resource')
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/^-|-$/g, '');
                          downloadTextDocument(
                            `${slug || 'resource'}.txt`,
                            `BAUST Career Bridge — Curated Career Resource\n` +
                              `================================================\n` +
                              `Title: ${res.title ?? ''}\n` +
                              `Category: ${res.category ?? ''}\n\n` +
                              `Summary:\n${res.desc ?? ''}\n\n` +
                              `Prepared by BAUST Alumni Mentorship Network.\n`
                          );
                          addToast('success', 'Resource Downloaded', `${res.title} has been saved.`);
                        }}
                        className="text-xs font-bold text-[#0F2A4A] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3 text-[#C9A227]" /> Download Resource
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Recommended Alumni Mentors & Notices */}
        <div className="space-y-8">
          {/* Recommended Alumni */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0F2A4A]">Recommended For You</h3>
              <Link to="/student/directory" className="text-xs font-bold text-[#0F2A4A] hover:underline">
                Explore all
              </Link>
            </div>

            {recommendedAlumni.length === 0 ? (
              <Card className="p-6 text-center space-y-2 border-dashed border-slate-300">
                <Users className="w-7 h-7 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">No data yet</p>
                <p className="text-xs text-slate-500">
                  No department alumni recommendations available right now.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {(recommendedAlumni ?? []).map((alumni) => {
                  if (!alumni) return null;
                  return (
                    <Card key={alumni.id} hoverable className="p-4 space-y-3 border-slate-200">
                      <div className="flex items-start gap-3">
                        <Avatar
                          src={alumni.avatar}
                          name={alumni.name ?? 'Alumni'}
                          size="md"
                          isVerified={alumni.isVerified}
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-slate-900 truncate" title={alumni.name ?? 'BAUST Alumni'}>
                            {alumni.name ?? 'BAUST Alumni'}
                          </h4>
                          <p className="text-xs font-semibold text-[#0F2A4A] truncate" title={alumni.designation || 'Alumni Mentor'}>
                            {alumni.designation || 'Alumni Mentor'}
                          </p>
                          <p className="text-xs text-slate-500 truncate" title={alumni.company || 'BAUST Network'}>
                            {alumni.company || 'BAUST Network'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                        <span>{alumni.batch || 'Alumni'}</span>
                        <Badge variant={alumni.sector === 'Government' ? 'army' : 'navy'} size="sm">
                          {alumni.sector || 'Private'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <Link to={`/student/alumni/${alumni.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full text-xs py-1.5">
                            Profile
                          </Button>
                        </Link>
                        <Link to={`/student/mentorship?mentor=${alumni.id}`}>
                          <Button variant="primary" size="sm" className="text-xs py-1.5">
                            Request
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Announcements Widget */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0F2A4A]">University Career Notices</h3>
              <Link to="/student/notices" className="text-xs font-bold text-[#0F2A4A] hover:underline">
                View all
              </Link>
            </div>
            {(() => {
              const todayIso = new Date().toISOString().split('T')[0];
              const visibleNotices = safeAnnouncements.filter(
                (n) =>
                  Boolean(n) &&
                  n.active !== false &&
                  (!n.expiresAt || n.expiresAt >= todayIso) &&
                  (n.targetAudience === 'All' || n.targetAudience === 'Students')
              );
              if (visibleNotices.length === 0) {
                return (
                  <Card className="p-6 text-center space-y-1 border-dashed border-slate-300">
                    <p className="text-xs font-semibold text-slate-700">No active notices</p>
                    <p className="text-xs text-slate-500">No active university career notices right now.</p>
                  </Card>
                );
              }
              return (
                <div className="space-y-3">
                  {visibleNotices.slice(0, 3).map((notice) => (
                    <Link key={notice.id} to={`/student/notices/${notice.id}`} className="block">
                      <Card hoverable className="p-4 space-y-2 border-slate-200 bg-slate-50/50">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <Badge variant="army" size="sm">
                              {notice.category ?? 'Notice'}
                            </Badge>
                            {(notice.priority === 'Important' || notice.pinned) && (
                              <Badge variant="pending" size="sm">
                                Important
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 tabular-nums">{notice.date ?? ''}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{notice.title ?? 'Announcement'}</h4>
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {notice.content ?? ''}
                        </p>
                      </Card>
                    </Link>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};
