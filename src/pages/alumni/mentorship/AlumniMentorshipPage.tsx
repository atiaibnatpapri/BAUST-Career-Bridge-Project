/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMentorshipStore } from '../../../hooks/useMentorshipStore';
import { useApp } from '../../../context/AppContext';
import { MockCallModal } from '../../../components/mentorship/MockCallModal';
import { CVReviewFormModal } from '../../../components/mentorship/CVReviewFormModal';
import { CVReviewResultModal } from '../../../components/mentorship/CVReviewResultModal';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Mentor, MentorshipSession, CVReviewItem } from '../../../types/mentorship';
import { normalizeDepartment } from '../../../constants/baustDataModel';
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  XCircle,
  FileText,
  Star,
  Users,
  Sliders,
  Sparkles,
  UserCheck,
  PauseCircle,
  Eye,
  History
} from 'lucide-react';

export const AlumniMentorshipPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    mentors,
    sessions,
    cvReviews,
    acceptSession,
    holdSession,
    declineSession,
    startSession
  } = useMentorshipStore();
  const { currentUser, language } = useApp();

  // Active alumni profile without falling back to another user (prevents data leaks)
  const alumniProfile = useMemo<Mentor>(() => {
    const matched = mentors.find(
      (m) => m.id === currentUser.id || (currentUser.email && m.email === currentUser.email)
    );
    if (matched) return matched;
    return {
      id: currentUser.id,
      name: currentUser.name || 'BAUST Alumni',
      email: currentUser.email || '',
      avatar: currentUser.avatar || '',
      isVerified: Boolean(currentUser.isVerified),
      department: normalizeDepartment(currentUser.department),
      batch: currentUser.batch || '',
      passingYear: (currentUser as any).passingYear || 2020,
      designation: (currentUser as any).designation || 'BAUST Alumni',
      company: (currentUser as any).company || 'Partner Organization',
      sector: ((currentUser as any).sector as any) || 'Private',
      location: (currentUser as any).location || 'Bangladesh',
      bio: (currentUser as any).bio || '',
      skills: [],
      mentoringTopics: [],
      availableSlots: [],
      isAvailableNow: Boolean((currentUser as any).mentoringAvailable),
      rating: (currentUser as any).rating || 0,
      reviewCount: 0,
      ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      sessionsCompleted: 0,
      studentsMentored: (currentUser as any).totalMentees || 0,
      responseTime: '< 24 hours',
      acceptanceRate: 95,
      reviews: [],
      experienceTimeline: [],
      education: [],
      achievements: [],
    };
  }, [mentors, currentUser]);

  const [activeTab, setActiveTab] = useState<'requests' | 'upcoming' | 'cv-queue' | 'completed' | 'history'>('requests');

  // Interactive Modals
  const [activeCallSession, setActiveCallSession] = useState<MentorshipSession | null>(null);
  const [evaluatingCV, setEvaluatingCV] = useState<CVReviewItem | null>(null);
  const [viewingCVResult, setViewingCVResult] = useState<CVReviewItem | null>(null);
  const [detailsSession, setDetailsSession] = useState<MentorshipSession | null>(null);

  // Put On Hold Dialog
  const [holdSessionTarget, setHoldSessionTarget] = useState<MentorshipSession | null>(null);
  const [holdReason, setHoldReason] = useState('Reviewing weekly schedule — will confirm an exact time slot shortly.');

  // Decline Dialog
  const [declineSessionTarget, setDeclineSessionTarget] = useState<MentorshipSession | null>(null);
  const [declineReason, setDeclineReason] = useState('Schedule conflict with office commitments');
  const [declineNote, setDeclineNote] = useState('Please check my open slots next weekend or connect with senior alumni in CSE.');

  // Strictly filter sessions belonging to current alumnus UID
  const alumniSessions = useMemo(() => {
    if (!currentUser.id) return [];
    return sessions.filter((s) => s.mentorId === currentUser.id);
  }, [sessions, currentUser.id]);

  // Deep-link ?req=<id>
  useEffect(() => {
    const reqId = searchParams.get('req');
    if (!reqId || alumniSessions.length === 0) return;
    const matched = alumniSessions.find((s) => s.id === reqId);
    if (!matched) return;
    if (matched.status === 'PENDING') setActiveTab('requests');
    else if (matched.status === 'ACCEPTED' || matched.status === 'IN_PROGRESS') setActiveTab('upcoming');
    else if (matched.status === 'COMPLETED') setActiveTab('completed');
    else setActiveTab('history');
    setDetailsSession(matched);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('req');
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, alumniSessions, setSearchParams]);

  const pendingRequests = alumniSessions.filter((s) => s.status === 'PENDING');
  const upcomingSessions = alumniSessions.filter(
    (s) => s.status === 'ACCEPTED' || s.status === 'IN_PROGRESS'
  );
  const completedSessions = alumniSessions.filter((s) => s.status === 'COMPLETED');
  const archivedSessions = alumniSessions.filter(
    (s) => s.status === 'ON_HOLD' || s.status === 'REJECTED' || s.status === 'CANCELLED'
  );

  // CV reviews strictly for this alumnus
  const pendingCVReviews = cvReviews.filter(
    (c) => c.mentorId === currentUser.id && c.status !== 'REVIEWED'
  );
  const completedCVReviews = cvReviews.filter(
    (c) => c.mentorId === currentUser.id && c.status === 'REVIEWED'
  );

  const handleConfirmHold = () => {
    if (holdSessionTarget) {
      holdSession(holdSessionTarget.id, holdReason);
      setHoldSessionTarget(null);
      setDetailsSession(null);
    }
  };

  const handleConfirmDecline = () => {
    if (declineSessionTarget) {
      declineSession(declineSessionTarget.id, declineReason, declineNote);
      setDeclineSessionTarget(null);
      setDetailsSession(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header & Alumni Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold bg-[#2E5E3E]/10 text-[#2E5E3E]">
            <UserCheck className="w-3.5 h-3.5" />
            BAUST Alumni Mentorship Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {language === 'en' ? `Mentorship Console • ${alumniProfile.name}` : `মেন্টরশিপ কনসোল • ${alumniProfile.name}`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Review incoming undergraduate session requests, host 1-on-1 career discussions, and evaluate CVs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/alumni/mentor-settings')}
            className="flex items-center gap-2"
          >
            <Sliders className="w-4 h-4 text-slate-500" />
            Manage Available Slots
          </Button>

          <Button
            variant="primary"
            onClick={() => navigate('/alumni/my-profile')}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#C9A227]" />
            View My Profile
          </Button>
        </div>
      </div>

      {/* Alumni KPI Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Action Required</p>
            <p className="text-xl font-extrabold text-amber-900">
              {pendingRequests.length + pendingCVReviews.length} Pending
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#0F2A4A]/10 text-[#0F2A4A] flex items-center justify-center shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Upcoming Calls</p>
            <p className="text-xl font-extrabold text-[#0F2A4A]">{upcomingSessions.length} Scheduled</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#2E5E3E]/10 text-[#2E5E3E] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Students Mentored</p>
            <p className="text-xl font-extrabold text-[#2E5E3E]">{alumniProfile.studentsMentored}+ BAUSTians</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-yellow-100 text-yellow-800 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average Rating</p>
            <p className="text-xl font-extrabold text-slate-900 flex items-center gap-1">
              {alumniProfile.rating.toFixed(1)} ⭐
              <span className="text-xs font-normal text-slate-500">({alumniProfile.reviewCount})</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="border-b border-slate-200">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'requests'
                ? 'bg-[#0F2A4A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            Pending Requests
            {pendingRequests.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-bold">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'upcoming'
                ? 'bg-[#0F2A4A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Video className="w-4 h-4" />
            Scheduled Sessions
            {upcomingSessions.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-600 text-white font-bold">
                {upcomingSessions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('cv-queue')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'cv-queue'
                ? 'bg-[#0F2A4A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            CV Evaluation Queue
            {pendingCVReviews.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-sky-600 text-white font-bold">
                {pendingCVReviews.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'completed'
                ? 'bg-[#0F2A4A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Completed History ({completedSessions.length})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-[#0F2A4A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            On Hold & Declined
            {archivedSessions.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-800 font-bold">
                {archivedSessions.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: PENDING REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Undergraduate Applications Awaiting Confirmation ({pendingRequests.length})
            </h3>
            <span className="text-xs text-slate-500">
              Accepting automatically creates a Google Meet video conference link for both parties.
            </span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">All Caught Up!</h4>
              <p className="text-xs text-slate-500">
                You have no pending mentorship applications awaiting your response.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((session) => (
                <div
                  key={session.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={session.studentAvatar}
                      alt={session.studentName}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-100"
                    />
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{session.studentName}</h4>
                        <Badge variant="neutral" className="text-xs">
                          {session.studentDept} • {session.studentBatch}
                        </Badge>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#0F2A4A]/10 text-[#0F2A4A]">
                          Topic: {session.topic}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-[#2E5E3E]" />
                        <span>
                          Requested Slot: <strong>{session.scheduledSlot.day}</strong> at <strong>{session.scheduledSlot.time}</strong>
                        </span>
                        <span>•</span>
                        <span>Mode: {session.mode}</span>
                      </div>

                      {session.message && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 max-w-xl">
                          <p className="font-semibold text-slate-800 mb-0.5">Student Goal / Question:</p>
                          <p className="italic leading-relaxed">"{session.message}"</p>
                        </div>
                      )}

                      {session.attachmentName && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>Attached: {session.attachmentName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Accept / On Hold / Decline / Details CTA Buttons */}
                  <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDetailsSession(session)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Details
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHoldSessionTarget(session)}
                      className="text-amber-700 hover:text-amber-900 hover:bg-amber-50"
                    >
                      <PauseCircle className="w-3.5 h-3.5 mr-1" />
                      Put On Hold
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeclineSessionTarget(session)}
                      className="text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Decline
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => acceptSession(session.id)}
                      className="bg-[#2E5E3E] hover:bg-[#254b32]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Confirm & Generate Meet
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SCHEDULED UPCOMING SESSIONS */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Confirmed Mentorship Meetings ({upcomingSessions.length})
            </h3>
            <span className="text-xs text-slate-500">
              Enter call room at the scheduled time to conduct the interactive session.
            </span>
          </div>

          {upcomingSessions.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <p className="text-xs text-slate-500">No upcoming meetings scheduled right now.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={session.studentAvatar}
                      alt={session.studentName}
                      className="w-14 h-14 rounded-2xl object-cover bg-slate-100 border border-slate-200"
                    />
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900">{session.studentName}</h4>
                        <Badge variant="approved">Confirmed Slot</Badge>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#0F2A4A]/10 text-[#0F2A4A]">
                          {session.topic}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600">
                        Dept of {session.studentDept} • {session.studentBatch} ({session.studentEmail || 'Verified Student'})
                      </p>

                      <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-950 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1 font-bold text-emerald-900">
                          <Calendar className="w-3.5 h-3.5" />
                          {session.scheduledSlot.day}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {session.scheduledSlot.time}
                        </span>
                        <span>•</span>
                        <span>Mode: {session.mode}</span>
                      </div>

                      {session.meetingLink && (
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                          <span>Meet link:</span>
                          <a
                            href={session.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[#0F2A4A] underline font-medium"
                          >
                            {session.meetingLink}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDetailsSession(session)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Timeline
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        startSession(session.id);
                        setActiveCallSession(session);
                      }}
                      className="flex items-center gap-2 bg-[#2E5E3E] hover:bg-[#254b32]"
                    >
                      <Video className="w-4 h-4" />
                      Open Call Room
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CV EVALUATION QUEUE */}
      {activeTab === 'cv-queue' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Student CV Evaluation Queue ({pendingCVReviews.length} Pending)
              </h3>
              <p className="text-xs text-slate-500">
                Score undergraduate resumes against current industry standards and highlight priority improvements.
              </p>
            </div>
          </div>

          {pendingCVReviews.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <p className="text-xs text-slate-500">No student resumes waiting in your review queue.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingCVReviews.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0F2A4A] text-white uppercase">
                        {item.version.toUpperCase()}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{item.studentName}</h4>
                      <span className="text-xs text-slate-500">({item.studentDept}, {item.studentBatch})</span>
                    </div>

                    <p className="text-xs text-slate-700">
                      Target Role: <strong className="text-[#0F2A4A]">{item.targetRole}</strong> • {item.targetSector}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-mono">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        {item.cvFileName} ({item.cvFileSize})
                      </span>
                      <span>•</span>
                      <span>Turnaround: {item.deadlinePreference}</span>
                    </div>

                    {item.studentNotes && (
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 max-w-xl">
                        "{item.studentNotes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setEvaluatingCV(item)}
                    >
                      Evaluate & Score CV
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Completed reviews section */}
          {completedCVReviews.length > 0 && (
            <div className="pt-6 space-y-3 border-t border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Recently Evaluated Resumes ({completedCVReviews.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {completedCVReviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{rev.studentName} • {rev.version.toUpperCase()}</p>
                      <p className="text-[11px] text-slate-500">Target: {rev.targetRole}</p>
                      <p className="text-xs font-semibold text-emerald-700 mt-1">Score: {rev.overallScore}/100</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingCVResult(rev)}
                    >
                      View Report
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: COMPLETED HISTORY */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Completed Mentorship Records ({completedSessions.length})
            </h3>
          </div>

          {completedSessions.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <p className="text-xs text-slate-500">No completed sessions on record yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{session.studentName}</h4>
                      <p className="text-[11px] text-slate-500">
                        {session.studentDept} • {session.studentBatch}
                      </p>
                      <p className="text-xs font-semibold text-[#0F2A4A] mt-1">
                        Topic: {session.topic}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: session.studentRating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400">{session.updatedAt}</span>
                    </div>
                  </div>

                  {session.studentReview && (
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      "{session.studentReview}"
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex flex-wrap gap-1">
                      {(session.studentTags || []).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-800"
                        >
                          ✓ {tag}
                        </span>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setDetailsSession(session)}>
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Timeline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: ON HOLD & DECLINED / CANCELLED */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              On Hold, Declined & Cancelled Requests ({archivedSessions.length})
            </h3>
            <span className="text-xs text-slate-500">
              You can accept or decline requests currently placed On Hold.
            </span>
          </div>

          {archivedSessions.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <p className="text-xs text-slate-500">No requests on hold, declined, or cancelled.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {archivedSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{session.studentName}</h4>
                      <Badge
                        variant={
                          session.status === 'ON_HOLD'
                            ? 'gold'
                            : session.status === 'REJECTED'
                            ? 'rejected'
                            : 'neutral'
                        }
                      >
                        {session.status === 'ON_HOLD'
                          ? 'On Hold'
                          : session.status === 'REJECTED'
                          ? 'Declined'
                          : 'Cancelled'}
                      </Badge>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {session.topic}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Slot: {session.scheduledSlot.day} ({session.scheduledSlot.time}) · {session.studentDept}
                    </p>
                    {session.rejectionReason && (
                      <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                        <strong>Note:</strong> {session.rejectionReason}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => setDetailsSession(session)}>
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Timeline
                    </Button>
                    {session.status === 'ON_HOLD' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeclineSessionTarget(session)}
                          className="text-rose-600 hover:bg-rose-50"
                        >
                          Decline
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => acceptSession(session.id)}
                          className="bg-[#2E5E3E] hover:bg-[#254b32]"
                        >
                          Accept & Schedule
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Put On Hold Modal */}
      {holdSessionTarget && (
        <Modal
          isOpen={!!holdSessionTarget}
          onClose={() => setHoldSessionTarget(null)}
          title={`Put Request On Hold · ${holdSessionTarget.studentName}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-left">
            <p className="text-xs text-slate-600">
              Add an optional note letting the student know when you expect to confirm or reschedule:
            </p>
            <textarea
              value={holdReason}
              onChange={(e) => setHoldReason(e.target.value)}
              rows={3}
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" onClick={() => setHoldSessionTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmHold}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Place On Hold
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Decline Reason Modal */}
      {declineSessionTarget && (
        <Modal
          isOpen={!!declineSessionTarget}
          onClose={() => setDeclineSessionTarget(null)}
          title={`Decline Request from ${declineSessionTarget.studentName}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-left">
            <p className="text-xs text-slate-600">
              Please choose a reason so the student understands and can request an alternative time or mentor:
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Reason
              </label>
              <select
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
              >
                <option value="Schedule conflict with office commitments">
                  Schedule conflict with office commitments
                </option>
                <option value="Topic outside my immediate industry domain">
                  Topic outside my immediate industry domain
                </option>
                <option value="Reached weekly mentorship capacity (3 sessions)">
                  Reached weekly mentorship capacity (3 sessions)
                </option>
                <option value="Travelling / temporarily unavailable">
                  Travelling / temporarily unavailable
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Friendly Note / Suggestion for Student (Optional)
              </label>
              <textarea
                value={declineNote}
                onChange={(e) => setDeclineNote(e.target.value)}
                rows={3}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" onClick={() => setDeclineSessionTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmDecline}
                className="bg-rose-600 hover:bg-rose-700"
              >
                Confirm Decline
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Request Details & Status History Modal */}
      {detailsSession && (
        <Modal
          isOpen={!!detailsSession}
          onClose={() => setDetailsSession(null)}
          title={`Mentorship Request • ${detailsSession.studentName}`}
          description={`${detailsSession.topic} • ${detailsSession.scheduledSlot.day} (${detailsSession.scheduledSlot.time})`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-left">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Status</span>
                <Badge
                  variant={
                    detailsSession.status === 'ACCEPTED' || detailsSession.status === 'COMPLETED'
                      ? 'approved'
                      : detailsSession.status === 'ON_HOLD'
                      ? 'gold'
                      : detailsSession.status === 'REJECTED'
                      ? 'rejected'
                      : detailsSession.status === 'CANCELLED'
                      ? 'neutral'
                      : 'pending'
                  }
                >
                  {detailsSession.status.replace('_', ' ')}
                </Badge>
              </div>
              {detailsSession.message && (
                <div>
                  <span className="font-semibold text-slate-600 block mb-1">Student Message:</span>
                  <p className="text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-200">
                    "{detailsSession.message}"
                  </p>
                </div>
              )}
              {detailsSession.meetingLink && (
                <div>
                  <span className="font-semibold text-slate-600">Meeting Link: </span>
                  <a
                    href={detailsSession.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0F2A4A] underline font-mono"
                  >
                    {detailsSession.meetingLink}
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Status History</h4>
              <div className="space-y-2 border-l-2 border-slate-200 pl-3">
                {detailsSession.statusHistory.map((h, idx) => (
                  <div key={idx} className="text-xs space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">{h.status.replace('_', ' ')}</span>
                      <span className="text-[11px] text-slate-400">{h.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-600">By {h.actorName}</p>
                    {h.note && <p className="text-[11px] text-slate-500 italic">"{h.note}"</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-slate-100">
              {(detailsSession.status === 'PENDING' || detailsSession.status === 'ON_HOLD') && (
                <>
                  {detailsSession.status === 'PENDING' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHoldSessionTarget(detailsSession)}
                    >
                      Put On Hold
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeclineSessionTarget(detailsSession)}
                    className="text-rose-600"
                  >
                    Decline
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      acceptSession(detailsSession.id);
                      setDetailsSession(null);
                    }}
                    className="bg-[#2E5E3E] hover:bg-[#254b32]"
                  >
                    Confirm & Generate Meet
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={() => setDetailsSession(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Call Arena Modal */}
      {activeCallSession && (
        <MockCallModal
          isOpen={!!activeCallSession}
          onClose={() => setActiveCallSession(null)}
          session={activeCallSession}
        />
      )}

      {/* CV Evaluation Form Modal */}
      {evaluatingCV && (
        <CVReviewFormModal
          isOpen={!!evaluatingCV}
          onClose={() => setEvaluatingCV(null)}
          review={evaluatingCV}
        />
      )}

      {/* CV Review Report Modal */}
      {viewingCVResult && (
        <CVReviewResultModal
          isOpen={!!viewingCVResult}
          onClose={() => setViewingCVResult(null)}
          review={viewingCVResult}
        />
      )}
    </div>
  );
};
