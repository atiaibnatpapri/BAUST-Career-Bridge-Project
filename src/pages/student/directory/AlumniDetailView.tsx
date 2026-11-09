/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  UserPlus, 
  Award, 
  ShieldAlert, 
  Star, 
  Lock, 
  ExternalLink, 
  Sparkles,
  Building2,
  FileText,
  Clock,
  Compass,
  Check
} from 'lucide-react';
import { useDirectoryStore } from '../../../hooks/useDirectoryStore';
import { EndorseSkillModal } from '../../../components/directory/EndorseSkillModal';
import { ConnectRequestModal } from '../../../components/directory/ConnectRequestModal';
import { ReportProfileModal } from '../../../components/directory/ReportProfileModal';
import { AlumniQrCardModal } from '../../../components/directory/AlumniQrCardModal';

export const AlumniDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { alumniProfiles, isAlumniSaved, toggleSaveAlumni } = useDirectoryStore();

  const alumnus = alumniProfiles.find((p) => p.id === id) || alumniProfiles[0];
  const isSaved = isAlumniSaved(alumnus?.id || '');

  // Modals
  const [isEndorseOpen, setIsEndorseOpen] = useState(false);
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);

  if (!alumnus) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-lg font-bold text-slate-800">Alumni Profile Not Found</h2>
        <Link to="/student/directory" className="text-navy text-sm font-semibold underline mt-2 inline-block">
          Return to Directory
        </Link>
      </div>
    );
  }

  // Privacy constraints
  const canSeeCgpa = alumnus.privacy?.cgpa !== 'hidden';
  const isEmailStudentsOnly = alumnus.privacy?.email === 'students_only';

  return (
    <div className="space-y-6 pb-24">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-bold text-slate-600 hover:text-navy flex items-center gap-1.5 p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsQrOpen(true)}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-navy hover:bg-slate-50 transition-colors shadow-xs"
            title="Share Profile & QR Code"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => toggleSaveAlumni(alumnus.id)}
            className={`p-2 rounded-xl border transition-colors shadow-xs ${
              isSaved
                ? 'bg-amber-50 border-amber-300 text-amber-600'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50'
            }`}
            title={isSaved ? 'Bookmarked' : 'Save Profile'}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-600" /> : <Bookmark className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsReportOpen(true)}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shadow-xs"
            title="Report Fake Profile"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Cover image strip */}
        <div className="relative h-44 sm:h-56 bg-linear-to-r from-[#0F2A4A] via-[#1a436e] to-[#2E5E3E]">
          {alumnus.coverImage && (
            <img
              src={alumnus.coverImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay"
            />
          )}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md shadow-xs">
              {alumnus.sector} Sector
            </span>
            {alumnus.isVerified && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                BAUST Verified
              </span>
            )}
          </div>
        </div>

        {/* Profile Info Row */}
        <div className="p-6 sm:p-8 pt-0 -mt-16 sm:-mt-20">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
            {/* Avatar & Core Identity */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              <div className="relative">
                <img
                  src={alumnus.avatar}
                  alt={alumnus.name}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white shadow-xl bg-white"
                />
                {alumnus.isVerified && (
                  <span className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                  </span>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {alumnus.name}
                  </h1>
                  {alumnus.nameBn && (
                    <span className="text-base text-slate-500 font-serif">
                      ({alumnus.nameBn})
                    </span>
                  )}
                </div>

                <p className="text-sm font-semibold text-slate-700 mt-1 flex items-center gap-1.5 flex-wrap">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span>{alumnus.designation}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-navy font-bold">{alumnus.company}</span>
                </p>

                <p className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {alumnus.location}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-navy" />
                    BAUST {alumnus.department} ({alumnus.batch}, Class of {alumnus.passingYear})
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Action Button Group */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <button
                onClick={() => setIsConnectOpen(true)}
                className="flex-1 md:flex-initial text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <UserPlus className="w-4 h-4 text-emerald-700" />
                Connect
              </button>

              <button
                onClick={() => setIsEndorseOpen(true)}
                className="flex-1 md:flex-initial text-xs font-bold px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100/80 text-amber-900 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Award className="w-4 h-4 text-amber-600" />
                Endorse Skill
              </button>

              <Link
                to={`/chat?user=${alumnus.id}`}
                className="flex-1 md:flex-initial text-xs font-bold px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4 text-navy" />
                Message
              </Link>

              {alumnus.mentoringAvailable && (
                <Link
                  to={`/student/mentorship/mentor/${alumnus.id}`}
                  className="flex-1 md:flex-initial text-xs font-bold px-5 py-2.5 rounded-xl bg-[#2E5E3E] text-white hover:bg-[#234930] transition-colors flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Calendar className="w-4 h-4" />
                  Request Mentorship
                </Link>
              )}
            </div>
          </div>

          {/* Bio & Headline */}
          <div className="pt-5 space-y-3">
            <p className="text-sm font-semibold text-slate-800 leading-snug">
              {alumnus.headline}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl">
              {alumnus.bio}
            </p>
            {alumnus.bioBn && (
              <p className="text-xs text-slate-500 font-serif leading-relaxed italic border-l-2 border-emerald-600 pl-3">
                {alumnus.bioBn}
              </p>
            )}

            {/* Availability Badges */}
            <div className="flex flex-wrap gap-2 pt-2 text-xs">
              {alumnus.mentoringAvailable && (
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Open to Mentorship ({alumnus.studentsConsulted || 40}+ students consulted)
                </span>
              )}
              {alumnus.openToReferrals && (
                <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-sky-600" />
                  Open to Internal Referrals at {alumnus.company}
                </span>
              )}
              {alumnus.openToHiring && (
                <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-semibold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-purple-600" />
                  Hiring for Team
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2/3): Experience, Skills with Endorsements, Publications */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Official BAUST Academic Credentials Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-[#0F2A4A] text-white flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Official BAUST Academic Credentials
                </h2>
                <p className="text-xs text-slate-500">
                  Verified against Bangladesh Army University of Science and Technology Registrar Archives
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-5 border-b border-slate-100">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Department</div>
                <div className="text-sm font-bold text-slate-800 mt-0.5">{alumnus.department}</div>
                <div className="text-[11px] text-slate-500">{alumnus.batch}</div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Graduation CGPA</div>
                {canSeeCgpa ? (
                  <div className="text-sm font-bold text-amber-900 mt-0.5 flex items-center gap-1">
                    <span>{alumnus.cgpa.toFixed(2)}</span>
                    <span className="text-xs font-normal text-slate-400">/ 4.00</span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    Private to Alumni
                  </div>
                )}
                <div className="text-[11px] text-slate-500">Passing Year: {alumnus.passingYear}</div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Student ID (Masked)</div>
                <div className="text-sm font-mono font-bold text-slate-800 mt-0.5">{alumnus.studentIdMasked}</div>
                <div className="text-[11px] text-emerald-600 font-semibold">Verified Active Record</div>
              </div>
            </div>

            {/* Undergrad Thesis Details */}
            <div className="py-4 border-b border-slate-100 space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-navy" />
                Undergraduate Capstone / Thesis
              </div>
              <p className="text-sm font-bold text-slate-900 italic">
                "{alumnus.thesisTitle}"
              </p>
              <div className="text-xs text-slate-600 flex items-center gap-2">
                <span className="font-semibold text-navy">Supervisor:</span>
                <span>{alumnus.thesisSupervisor}</span>
              </div>
            </div>

            {/* Honors & Clubs */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Honors & Awards
                </div>
                <div className="space-y-1.5">
                  {alumnus.honors?.map((h, i) => (
                    <div key={i} className="text-xs text-slate-700 font-medium flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Campus Clubs & Activities
                </div>
                <div className="space-y-1.5">
                  {alumnus.clubs?.map((c, i) => (
                    <div key={i} className="text-xs text-slate-700 font-medium flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Professional Experience Timeline */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Career Experience Timeline</h2>
                <p className="text-xs text-slate-500">Employment history, promotions, and milestone projects</p>
              </div>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {alumnus.experienceTimeline.map((exp, idx) => (
                <div key={idx} className="relative group">
                  <div className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-white ring-2 ${
                    exp.isCurrent ? 'bg-emerald-600 ring-emerald-200' : 'bg-slate-300 ring-slate-100'
                  }`} />
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <h3 className="text-sm font-bold text-slate-900">{exp.role}</h3>
                      <span className="text-xs text-slate-400 font-medium">{exp.period}</span>
                    </div>
                    <div className="text-xs font-semibold text-navy mt-0.5">
                      {exp.company} • <span className="text-slate-500 font-normal">{exp.location}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Technical Skills with Peer Endorsements */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Skills & Verified Endorsements ({alumnus.stats?.endorsementsReceived || 20}+)
                  </h2>
                  <p className="text-xs text-slate-500">Peer validated by BAUST students and fellow graduates</p>
                </div>
              </div>

              <button
                onClick={() => setIsEndorseOpen(true)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-navy text-white hover:bg-[#0b1f36] transition-colors"
              >
                + Endorse Skill
              </button>
            </div>

            <div className="space-y-4">
              {alumnus.skillsWithLevels?.map((skill) => (
                <div key={skill.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{skill.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                        {skill.level}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full">
                      ✦ {skill.endorsements?.length || 0} Endorsement{skill.endorsements?.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  {/* Endorsement list if available */}
                  {skill.endorsements && skill.endorsements.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                      {skill.endorsements.map((end, eIdx) => (
                        <div key={eIdx} className="text-xs text-slate-600 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-slate-800">{end.studentName}</span>{' '}
                            <span className="text-slate-400">({end.studentDept})</span>
                            {end.comment && (
                              <span className="italic text-slate-500 ml-1">"{end.comment}"</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 4. Publications & Research (if available) */}
          {alumnus.publications && alumnus.publications.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-800 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Publications & Research Papers</h2>
                  <p className="text-xs text-slate-500">Peer-reviewed conference proceedings and journal articles</p>
                </div>
              </div>

              <div className="space-y-3">
                {alumnus.publications.map((pub) => (
                  <div key={pub.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{pub.title}</h3>
                    <div className="text-xs text-slate-600 mt-1">
                      <span className="font-semibold text-navy">{pub.conferenceOrJournal}</span> ({pub.year}) • {pub.field}
                    </div>
                    {pub.doiOrUrl && (
                      <a
                        href={pub.doiOrUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:underline mt-2"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Publication / DOI
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1/3): Mentorship Status, Available Slots, Other Education */}
        <div className="space-y-6">
          {/* Mentorship Hub Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              Mentorship Status
            </h3>

            {alumnus.mentoringAvailable ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900">Active Mentor</span>
                    <span className="flex items-center gap-1 text-amber-700 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {alumnus.rating.toFixed(2)} ({alumnus.reviewCount} reviews)
                    </span>
                  </div>
                  <div className="text-emerald-800">
                    Consulted <span className="font-bold">{alumnus.studentsConsulted || 50}+ BAUST students</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Offered Topics
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {alumnus.mentorshipTopics?.map((t, idx) => (
                      <span key={idx} className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Typical Available Slots
                  </div>
                  <div className="space-y-1 text-xs text-slate-600">
                    {alumnus.availableSlots?.map((slot, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{slot}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  to={`/student/mentorship/mentor/${alumnus.id}`}
                  className="w-full py-3 px-4 rounded-xl bg-[#2E5E3E] text-white text-xs font-bold hover:bg-[#234930] transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <Calendar className="w-4 h-4" />
                  Schedule 1:1 Mentorship Session
                </Link>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 text-xs text-slate-500 space-y-3">
                <p>Currently not taking new 1:1 mentorship sessions. You can still reach out via Direct Message.</p>
                <Link
                  to={`/chat?user=${alumnus.id}`}
                  className="w-full py-2.5 px-3 rounded-xl bg-navy text-white text-xs font-bold text-center block"
                >
                  Send Direct Message
                </Link>
              </div>
            )}
          </div>

          {/* Education Degrees Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-navy" />
              Degrees & Higher Education
            </h3>

            <div className="space-y-4">
              {alumnus.education.map((edu) => (
                <div key={edu.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="font-bold text-slate-900 text-xs">{edu.degree}</div>
                  <div className="text-xs font-semibold text-navy mt-0.5">{edu.institution}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{edu.period}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact & Privacy Info */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 text-xs space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider mb-1">
              Contact & Social Channels
            </h3>
            {alumnus.linkedin && (
              <a
                href={alumnus.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
              >
                <span>LinkedIn Profile</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            )}
            {alumnus.github && (
              <a
                href={alumnus.github}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
              >
                <span>GitHub Repository</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            )}
            {alumnus.googleScholar && (
              <a
                href={alumnus.googleScholar}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
              >
                <span>Google Scholar</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Modals */}
      <EndorseSkillModal
        isOpen={isEndorseOpen}
        onClose={() => setIsEndorseOpen(false)}
        alumnus={alumnus}
      />

      <ConnectRequestModal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
        alumnus={alumnus}
      />

      <ReportProfileModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        alumnus={alumnus}
      />

      <AlumniQrCardModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        alumnus={alumnus}
      />
    </div>
  );
};
