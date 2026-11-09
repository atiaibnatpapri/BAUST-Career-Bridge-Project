/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { 
  Users, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Video, 
  Clock, 
  Award, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

export const AlumniDashboard: React.FC = () => {
  const { currentUser, mentorshipRequests, serviceRequests, respondMentorship, role } = useApp();

  // Requests received by this alumni
  const receivedRequests = mentorshipRequests.filter(
    (m) => m.alumniId === currentUser.id || m.alumniId === 'alm-1'
  );

  const pendingRequests = receivedRequests.filter((r) => r.status === 'Pending');
  const upcomingSessions = receivedRequests.filter((r) => r.status === 'Accepted');

  // Service requests submitted by this alumni
  const myServices = serviceRequests.filter(
    (s) => s.alumniId === currentUser.id || s.alumniId === 'alm-1'
  );

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0F2A4A] via-[#1A3E68] to-[#2E5E3E] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified Alumni Mentor ({currentUser.name})</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
            Empowering the Next Generation of BAUST Engineers & Leaders
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Your mentorship directly shapes juniors preparing for software engineering, telecom, and higher studies abroad. Review your pending session requests below.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/alumni/services">
              <Button size="sm" variant="accent" rightIcon={<FileText className="w-3.5 h-3.5" />}>
                University Document Desk
              </Button>
            </Link>
            <Link to="/alumni/mentor-settings">
              <Button size="sm" variant="outline" className="text-white border-white/30 hover:bg-white/10">
                Manage Weekly Time Slots
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
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Profile Completion
            </span>
            <span className="text-xs font-bold text-emerald-600">92%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-emerald-500 h-2 rounded-full w-[92%]" />
          </div>
          <p className="text-[10px] text-slate-500 pt-0.5">
            Add portfolio link to reach 100%
          </p>
        </Card>

        <Card className="p-5 border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Students Mentored</p>
            <p className="text-2xl font-black text-[#0F2A4A] tabular-nums mt-0.5">24</p>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> +4 this month
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#0F2A4A]/10 text-[#0F2A4A]">
            <Users className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-5 border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Requests</p>
            <p className="text-2xl font-black text-amber-700 tabular-nums mt-0.5">
              {pendingRequests.length}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Requires your review</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
            <Clock className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-5 border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mentor Rating</p>
            <p className="text-2xl font-black text-emerald-700 tabular-nums mt-0.5">4.9 / 5.0</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Based on 19 student reviews</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
            <Award className="w-5 h-5" />
          </div>
        </Card>
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
                <p className="text-xs text-slate-500">Junior students requesting 1-on-1 career assistance</p>
              </div>
            </div>

            {pendingRequests.length === 0 ? (
              <Card className="p-8 text-center space-y-2 border-dashed border-slate-300">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">All caught up!</p>
                <p className="text-xs text-slate-500">You have no pending student mentorship inquiries.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((req) => (
                  <Card key={req.id} className="p-5 border-slate-200 space-y-3.5 shadow-xs">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <Avatar
                          src={req.studentAvatar}
                          name={req.studentName}
                          size="md"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{req.studentName}</h4>
                          <p className="text-[11px] text-slate-500">
                            {req.studentDept} · {req.studentBatch}
                          </p>
                          <Badge variant="navy" size="sm" className="mt-1">
                            Topic: {req.topic}
                          </Badge>
                        </div>
                      </div>

                      <div className="text-right text-xs text-slate-500">
                        <span className="block font-semibold text-slate-800">
                          {req.preferredDate}
                        </span>
                        <span>{req.preferredTime}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 italic">
                      "{req.note}"
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
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
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Mentoring Sessions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0F2A4A]">Confirmed Mentorship Sessions</h3>
              <span className="text-xs text-slate-500">{upcomingSessions.length} sessions</span>
            </div>

            <div className="space-y-3">
              {upcomingSessions.map((session) => (
                <Card key={session.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-slate-200">
                  <div className="flex items-start gap-3">
                    <Avatar src={session.studentAvatar} name={session.studentName} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{session.studentName}</h4>
                        <Badge variant="approved" size="sm">Confirmed</Badge>
                      </div>
                      <p className="text-xs font-semibold text-[#0F2A4A]">
                        {session.topic}
                      </p>
                      <p className="text-xs text-slate-500">
                        {session.scheduledDate || session.preferredDate} at {session.scheduledTime || session.preferredTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link to={`/chat?user=${session.studentId}`}>
                      <Button variant="outline" size="sm" className="text-xs" leftIcon={<MessageSquare className="w-3.5 h-3.5" />}>
                        Chat
                      </Button>
                    </Link>
                    {session.meetingLink && (
                      <a href={session.meetingLink} target="_blank" rel="noreferrer">
                        <Button variant="secondary" size="sm" className="text-xs" leftIcon={<Video className="w-3.5 h-3.5" />}>
                          Join Meet
                        </Button>
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
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
                <p className="text-xs text-slate-600">No active document applications.</p>
                <Link to="/alumni/services">
                  <Button variant="outline" size="sm">Request Transcripts</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-3">
                {myServices.slice(0, 3).map((req) => (
                  <Card key={req.id} className="p-4 space-y-2.5 border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900">{req.id}</span>
                      <Badge
                        variant={
                          req.status === 'Ready' || req.status === 'Delivered'
                            ? 'ready'
                            : req.status === 'Approved'
                            ? 'approved'
                            : 'pending'
                        }
                        size="sm"
                      >
                        {req.status}
                      </Badge>
                    </div>

                    <p className="text-xs font-bold text-[#0F2A4A]">{req.documentType}</p>
                    <p className="text-[11px] text-slate-500">
                      Method: {req.deliveryMethod.split(' ')[0]} · Submitted {req.submittedAt}
                    </p>

                    {req.trackingNumber && (
                      <p className="text-[10px] text-slate-600 bg-slate-100 p-1.5 rounded font-mono">
                        Tracking: {req.trackingNumber}
                      </p>
                    )}

                    <div className="pt-1">
                      <Link
                        to="/alumni/services"
                        className="text-xs font-bold text-[#0F2A4A] hover:underline inline-flex items-center gap-1"
                      >
                        View Timeline <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Quick Notice */}
          <Card className="p-4 bg-gradient-to-br from-[#0F2A4A]/5 to-[#2E5E3E]/5 border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-[#0F2A4A]">Controller Office Notice</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Official transcripts for 2016-2022 batches are dispatched via Sundarban Courier Express on Mondays & Thursdays.
            </p>
          </Card>
        </div>

      </div>

    </div>
  );
};
