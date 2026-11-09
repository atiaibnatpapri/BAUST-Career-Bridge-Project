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
  MessageSquare, 
  FileText, 
  ArrowRight, 
  Video, 
  Clock, 
  Briefcase, 
  ExternalLink,
  BookOpen,
  Award,
  Sparkles,
  Download
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { currentUser, alumniList, mentorshipRequests, conversations, announcements } = useApp();

  // Student specific filtering
  const student = currentUser.role === 'student' ? currentUser : null;

  // Active mentorship sessions for this student
  const studentSessions = mentorshipRequests.filter(
    (m) => m.studentId === (student?.id || 'std-1')
  );

  const upcomingSessions = studentSessions.filter(
    (s) => s.status === 'Accepted' && s.meetingLink
  );

  // Recommended alumni from the same department
  const recommendedAlumni = alumniList
    .filter((a) => a.department === (student?.department || 'CSE'))
    .slice(0, 3);

  const careerResources = [
    {
      title: 'BAUST Standard Tech CV Template',
      desc: 'ATS-optimized LaTeX & Word formats crafted for software & hardware engineering.',
      category: 'Resume Kit',
      downloads: '1.2k',
      url: '#',
    },
    {
      title: '47th BCS Preliminary Strategy & Booklist',
      desc: 'Comprehensive syllabus breakdown curated by BAUST Cadre alumni officers.',
      category: 'Govt Cadre',
      downloads: '850',
      url: '#',
    },
    {
      title: 'DAAD & US Graduate Admissions Guide',
      desc: 'Step-by-step SOP guides, professor cold email templates, and scholarship timelines.',
      category: 'Higher Studies',
      downloads: '940',
      url: '#',
    },
    {
      title: 'Full-Stack & Mobile System Mock Interview Bank',
      desc: '120+ real interview questions asked at Brain Station 23, Samsung R&D, and bKash.',
      category: 'Interview Prep',
      downloads: '2.1k',
      url: '#',
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0F2A4A] via-[#1A3E68] to-[#2E5E3E] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Welcome, {currentUser.name} ({student?.department || 'CSE'} {student?.batch || '18th Batch'})</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
            Your Career Highway to Industry & Higher Studies
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Connect with 1,450+ verified BAUST graduates. Book 1-on-1 CV audits, practice mock interviews, and stay on top of upcoming campus recruitment drives.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/student/directory">
              <Button size="sm" variant="accent" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Find an Alumni Mentor
              </Button>
            </Link>
            <Link to="/student/mentorship">
              <Button size="sm" variant="outline" className="text-white border-white/30 hover:bg-white/10">
                View My Mentorship Schedule
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Available Mentors</p>
              <p className="text-2xl font-black text-[#0F2A4A] tabular-nums mt-0.5">
                {alumniList.filter((a) => a.mentoringAvailable).length}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0F2A4A]/10 text-[#0F2A4A]">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Requests</p>
              <p className="text-2xl font-black text-amber-700 tabular-nums mt-0.5">
                {studentSessions.filter((s) => s.status === 'Pending').length}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Upcoming Sessions</p>
              <p className="text-2xl font-black text-emerald-700 tabular-nums mt-0.5">
                {upcomingSessions.length}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Direct Messages</p>
              <p className="text-2xl font-black text-sky-700 tabular-nums mt-0.5">
                {conversations.length}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
        </Card>
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
                <p className="text-xs font-medium text-slate-600">No scheduled sessions for this week.</p>
                <Link to="/student/directory">
                  <Button size="sm" variant="outline">
                    Browse Alumni to Request a Slot
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <Card key={session.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-slate-200">
                    <div className="flex items-start gap-3.5">
                      <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 font-bold shrink-0">
                        <Video className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{session.alumniName}</span>
                          <span className="text-[11px] text-slate-500">({session.alumniCompany})</span>
                          <Badge variant="approved" size="sm">Confirmed</Badge>
                        </div>
                        <p className="text-xs font-semibold text-[#0F2A4A]">
                          Topic: {session.topic}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {session.scheduledDate || session.preferredDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {session.scheduledTime || session.preferredTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto"
                    >
                      <Button size="sm" variant="secondary" className="w-full sm:w-auto" leftIcon={<Video className="w-3.5 h-3.5" />}>
                        Join Google Meet
                      </Button>
                    </a>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Curated Career Resources */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0F2A4A]">Curated Career Resources & Kits</h3>
                <p className="text-xs text-slate-500">Handcrafted templates and syllabus guides from alumni</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {careerResources.map((res, idx) => (
                <Card key={idx} hoverable className="p-4 space-y-2.5 border-slate-200">
                  <div className="flex items-center justify-between">
                    <Badge variant="navy" size="sm">{res.category}</Badge>
                    <span className="text-[11px] text-slate-400 font-mono">{res.downloads} downloads</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{res.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{res.desc}</p>
                  <div className="pt-1">
                    <button
                      onClick={() => alert(`Downloading "${res.title}"...`)}
                      className="text-xs font-bold text-[#0F2A4A] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-[#C9A227]" /> Download Resource
                    </button>
                  </div>
                </Card>
              ))}
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

            <div className="space-y-3">
              {recommendedAlumni.map((alumni) => (
                <Card key={alumni.id} hoverable className="p-4 space-y-3 border-slate-200">
                  <div className="flex items-start gap-3">
                    <Avatar
                      src={alumni.avatar}
                      name={alumni.name}
                      size="md"
                      isVerified={alumni.isVerified}
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{alumni.name}</h4>
                      <p className="text-[11px] font-semibold text-[#0F2A4A] truncate">{alumni.designation}</p>
                      <p className="text-[11px] text-slate-500 truncate">{alumni.company}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span>{alumni.batch}</span>
                    <Badge variant={alumni.sector === 'Government' ? 'army' : 'navy'} size="sm">
                      {alumni.sector}
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
              ))}
            </div>
          </div>

          {/* Announcements Widget */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#0F2A4A]">University Career Notices</h3>
            <div className="space-y-3">
              {announcements.slice(0, 2).map((notice) => (
                <Card key={notice.id} className="p-4 space-y-2 border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <Badge variant="army" size="sm">{notice.category}</Badge>
                    <span className="text-[10px] text-slate-400">{notice.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{notice.title}</h4>
                  <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">
                    {notice.content}
                  </p>
                </Card>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
