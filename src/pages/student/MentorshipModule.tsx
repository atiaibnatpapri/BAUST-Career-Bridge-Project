/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { MentorshipTopic, MentorshipRequest } from '../../types';
import { 
  Calendar, 
  Video, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  User, 
  MessageSquare, 
  Plus, 
  Search,
  BookOpen
} from 'lucide-react';

export const MentorshipModule: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedMentorId = searchParams.get('mentor');

  const { mentorshipRequests, alumniList, currentUser, requestMentorship, role } = useApp();

  const [activeTab, setActiveTab] = useState<string>('upcoming');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(!!preselectedMentorId);

  // New Request Form State
  const [selectedAlumniId, setSelectedAlumniId] = useState<string>(
    preselectedMentorId || alumniList[0]?.id || ''
  );
  const [topic, setTopic] = useState<MentorshipTopic>('CV Review');
  const [preferredDate, setPreferredDate] = useState('2026-11-04');
  const [preferredTime, setPreferredTime] = useState('8:00 PM');
  const [note, setNote] = useState('');

  // Slices of mentorship requests
  const myRequests = mentorshipRequests.filter(
    (m) => role === 'student' ? m.studentId === currentUser.id : m.alumniId === currentUser.id
  );

  const pendingRequests = myRequests.filter((m) => m.status === 'Pending');
  const upcomingSessions = myRequests.filter((m) => m.status === 'Accepted');
  const pastSessions = myRequests.filter((m) => m.status === 'Completed' || m.status === 'Declined');

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mentor = alumniList.find((a) => a.id === selectedAlumniId) || alumniList[0];

    requestMentorship({
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentDept: (currentUser as any).department || 'CSE',
      studentBatch: (currentUser as any).batch || '18th Batch',
      studentAvatar: currentUser.avatar,
      alumniId: mentor.id,
      alumniName: mentor.name,
      alumniCompany: mentor.company,
      topic,
      note,
      preferredDate,
      preferredTime,
    });

    setIsModalOpen(false);
    setActiveTab('requests');
  };

  const tabs = [
    { id: 'upcoming', label: 'Upcoming Sessions', badge: upcomingSessions.length },
    { id: 'requests', label: 'My Requests', badge: pendingRequests.length },
    { id: 'past', label: 'Past / Completed', badge: pastSessions.length },
    { id: 'browse', label: 'Find a Mentor' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight">
            1-on-1 Mentorship Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Book virtual guidance sessions for CV audits, mock interviews, and grad school prep
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Book New Session
        </Button>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: UPCOMING SESSIONS */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {upcomingSessions.length === 0 ? (
            <Card className="p-12 text-center space-y-3 border-dashed border-slate-300">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">No Upcoming Sessions</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You have no scheduled mentorship sessions coming up. Browse available alumni mentors to book your next slot!
              </p>
              <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
                Book a Session Now
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {upcomingSessions.map((session) => (
                <Card key={session.id} className="p-5 border-slate-200 space-y-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={session.studentAvatar}
                        name={session.alumniName}
                        size="md"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {session.alumniName}
                        </h4>
                        <p className="text-[11px] text-slate-500">{session.alumniCompany}</p>
                      </div>
                    </div>
                    <Badge variant="approved">Confirmed</Badge>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold text-[#0F2A4A]">Topic:</span>
                      <span className="font-bold">{session.topic}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Date & Time:</span>
                      <span className="font-semibold text-slate-900">
                        {session.scheduledDate || session.preferredDate} at {session.scheduledTime || session.preferredTime}
                      </span>
                    </div>
                  </div>

                  {session.note && (
                    <p className="text-xs text-slate-600 line-clamp-2 italic bg-sky-50/50 p-2.5 rounded-lg border border-sky-100">
                      "{session.note}"
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                    <Link to={`/chat?user=${session.alumniId}`} className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" /> Message Mentor
                    </Link>

                    {session.meetingLink && (
                      <a
                        href={session.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button variant="secondary" size="sm" leftIcon={<Video className="w-3.5 h-3.5" />}>
                          Join Meeting
                        </Button>
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY REQUESTS (Pending or Under Review) */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card className="p-12 text-center space-y-3 border-dashed border-slate-300">
              <Clock className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">No Pending Requests</h3>
              <p className="text-xs text-slate-500">
                All your mentorship inquiries have either been scheduled or completed.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <Card key={req.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-slate-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{req.alumniName}</h4>
                      <span className="text-[11px] text-slate-500">({req.alumniCompany})</span>
                      <Badge variant="pending">Awaiting Acceptance</Badge>
                    </div>
                    <p className="text-xs font-semibold text-[#0F2A4A]">Topic: {req.topic}</p>
                    <p className="text-xs text-slate-500">
                      Requested for: {req.preferredDate} at {req.preferredTime}
                    </p>
                    <p className="text-xs text-slate-600 italic pt-1">"{req.note}"</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-slate-400 block mb-2">Sent {req.createdAt}</span>
                    <Button variant="outline" size="sm" disabled>
                      Pending Mentor Review
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PAST SESSIONS */}
      {activeTab === 'past' && (
        <div className="space-y-4">
          {pastSessions.length === 0 ? (
            <Card className="p-12 text-center space-y-3 border-dashed border-slate-300">
              <CheckCircle2 className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">No Past Sessions Recorded</h3>
              <p className="text-xs text-slate-500">Completed mentorship records will appear here.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {pastSessions.map((session) => (
                <Card key={session.id} className="p-5 border-slate-200 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{session.alumniName}</h4>
                      <p className="text-[11px] text-slate-500">{session.alumniCompany}</p>
                    </div>
                    <Badge variant={session.status === 'Completed' ? 'approved' : 'rejected'}>
                      {session.status}
                    </Badge>
                  </div>

                  <p className="text-xs font-semibold text-[#0F2A4A]">Topic: {session.topic}</p>
                  
                  {session.feedback && (
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                      <span className="font-bold block mb-0.5">Mentor Advice & Key Notes:</span>
                      {session.feedback}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: FIND A MENTOR (Quick Browse Strip) */}
      {activeTab === 'browse' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {alumniList.filter((a) => a.mentoringAvailable).map((alumni) => (
              <Card key={alumni.id} hoverable className="p-5 space-y-3 border-slate-200">
                <div className="flex items-start justify-between">
                  <Avatar src={alumni.avatar} name={alumni.name} size="md" isVerified={alumni.isVerified} />
                  <Badge variant="navy" size="sm">{alumni.department}</Badge>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{alumni.name}</h4>
                  <p className="text-[11px] font-semibold text-[#0F2A4A]">{alumni.designation}</p>
                  <p className="text-[11px] text-slate-500">{alumni.company}</p>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {alumni.mentorshipTopics.slice(0, 2).map((top, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {top}
                    </span>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <Link to={`/student/alumni/${alumni.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Profile
                    </Button>
                  </Link>
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setSelectedAlumniId(alumni.id);
                      setIsModalOpen(true);
                    }}
                  >
                    Request
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule 1-on-1 Mentorship Session"
        description="Connect with a verified BAUST graduate"
      >
        <form onSubmit={handleBookingSubmit} className="space-y-4">
          <Select
            label="Select Alumni Mentor"
            options={alumniList.map((a) => ({
              value: a.id,
              label: `${a.name} (${a.designation} @ ${a.company})`,
            }))}
            value={selectedAlumniId}
            onChange={(e) => setSelectedAlumniId(e.target.value)}
          />

          <Select
            label="Mentorship Topic"
            options={[
              { value: 'CV Review', label: 'CV Review & Resume Audit' },
              { value: 'Interview Prep', label: 'Technical & Coding Mock Interview' },
              { value: 'Higher Studies', label: 'Higher Studies (GRE / DAAD / Scholarships)' },
              { value: 'Career Guidance', label: 'Industry & Sector Career Navigation' },
              { value: 'Government / BCS', label: 'BCS Strategy & Civil Service Guidance' },
              { value: 'Research & Publication', label: 'Academic Research & Journal Publication' },
            ]}
            value={topic}
            onChange={(e) => setTopic(e.target.value as MentorshipTopic)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Preferred Date"
              type="date"
              required
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
            />
            <Input
              label="Preferred Time Slot"
              type="text"
              placeholder="e.g. 7:00 PM BST"
              required
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
            />
          </div>

          <Textarea
            label="Questions or Context for the Mentor"
            placeholder="Share your goals for this session, your department, and what you would like to review..."
            rows={3}
            required
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit Mentorship Request
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
