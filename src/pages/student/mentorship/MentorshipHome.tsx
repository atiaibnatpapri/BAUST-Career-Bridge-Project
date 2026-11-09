/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMentorshipStore } from '../../../hooks/useMentorshipStore';
import { useApp } from '../../../context/AppContext';
import { MentorCard } from '../../../components/mentorship/MentorCard';
import { RequestMentorshipModal } from '../../../components/mentorship/RequestMentorshipModal';
import { MockCallModal } from '../../../components/mentorship/MockCallModal';
import { FeedbackModal } from '../../../components/mentorship/FeedbackModal';
import { MentorComparisonModal } from '../../../components/mentorship/MentorComparisonModal';
import { RequestCVReviewModal } from '../../../components/mentorship/RequestCVReviewModal';
import { CVReviewResultModal } from '../../../components/mentorship/CVReviewResultModal';
import { GoalsTrackerCard } from '../../../components/mentorship/GoalsTrackerCard';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { 
  Mentor, 
  MentorshipSector, 
  MentorshipSession, 
  CVReviewItem 
} from '../../../types/mentorship';
import { Department } from '../../../types';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  AlertCircle,
  FileText,
  Star,
  Users,
  Award,
  Layers,
  ArrowRight,
  ExternalLink,
  PhoneCall,
  Sparkles,
  RefreshCw,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';

export const MentorshipHome: React.FC = () => {
  const navigate = useNavigate();
  const { 
    mentors, 
    sessions, 
    cvReviews, 
    cancelSession, 
    startSession 
  } = useMentorshipStore();
  const { currentUser, language } = useApp();

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'find' | 'requests' | 'active' | 'completed' | 'rejected' | 'cv-review'
  >('find');

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<MentorshipSector | 'ALL'>('ALL');
  const [selectedSkill, setSelectedSkill] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | 'ALL'>('ALL');
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'match' | 'rating' | 'sessions' | 'batch'>('match');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals state
  const [bookingMentor, setBookingMentor] = useState<Mentor | null>(null);
  const [activeCallSession, setActiveCallSession] = useState<MentorshipSession | null>(null);
  const [feedbackSession, setFeedbackSession] = useState<MentorshipSession | null>(null);
  const [isCVRequestOpen, setIsCVRequestOpen] = useState(false);
  const [viewingCVResult, setViewingCVResult] = useState<CVReviewItem | null>(null);

  // Comparison tray state
  const [comparedMentorIds, setComparedMentorIds] = useState<string[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  // Sessions by student
  const studentSessions = useMemo(() => {
    return sessions.filter((s) => s.studentId === currentUser.id);
  }, [sessions, currentUser.id]);

  const pendingSessions = studentSessions.filter((s) => s.status === 'PENDING');
  const activeSessions = studentSessions.filter(
    (s) => s.status === 'ACCEPTED' || s.status === 'IN_PROGRESS'
  );
  const completedSessions = studentSessions.filter((s) => s.status === 'COMPLETED');
  const rejectedSessions = studentSessions.filter(
    (s) => s.status === 'REJECTED' || s.status === 'CANCELLED'
  );
  const studentCVReviews = cvReviews.filter((c) => c.studentId === currentUser.id);

  // Toggle compare
  const toggleCompare = (mentorId: string) => {
    setComparedMentorIds((prev) => {
      if (prev.includes(mentorId)) {
        return prev.filter((id) => id !== mentorId);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 mentors at a time.');
        return prev;
      }
      return [...prev, mentorId];
    });
  };

  const comparedMentors = mentors.filter((m) => comparedMentorIds.includes(m.id));

  // Skills master list
  const skillOptions = [
    'AI & Machine Learning',
    'Data Science',
    'Web Development',
    'Mobile App Development',
    'Cybersecurity',
    'Networking & Cloud',
    'Embedded Systems/IoT',
    'Power & Energy',
    'Civil/Structural',
    'Textile Engineering',
    'Business & Marketing',
    'Research & Academic Writing',
    'Competitive Exams (BCS, Bank)',
    'IELTS/GRE/Scholarship Prep',
  ];

  // Filtering & Sorting
  const filteredMentors = useMemo(() => {
    return mentors
      .filter((m) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = m.name.toLowerCase().includes(q);
          const matchCompany = m.company.toLowerCase().includes(q);
          const matchDesignation = m.designation.toLowerCase().includes(q);
          const matchSkills = m.skills.some((s) => s.toLowerCase().includes(q));
          const matchSector = m.sector.toLowerCase().includes(q);
          if (!matchName && !matchCompany && !matchDesignation && !matchSkills && !matchSector) {
            return false;
          }
        }

        // Sector filter
        if (selectedSector !== 'ALL' && m.sector !== selectedSector) {
          return false;
        }

        // Skill filter
        if (selectedSkill !== 'ALL') {
          const hasSkill = m.skills.some((s) =>
            s.toLowerCase().includes(selectedSkill.toLowerCase())
          );
          if (!hasSkill) return false;
        }

        // Department filter
        if (selectedDepartment !== 'ALL' && m.department !== selectedDepartment) {
          return false;
        }

        // Topic filter
        if (selectedTopic !== 'ALL' && !m.mentoringTopics.includes(selectedTopic as any)) {
          return false;
        }

        // Available now filter
        if (availableOnly && !m.isAvailableNow) {
          return false;
        }

        // Min rating
        if (minRating > 0 && m.rating < minRating) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'sessions') return b.sessionsCompleted - a.sessionsCompleted;
        if (sortBy === 'batch') return b.passingYear - a.passingYear;
        // default match sort (CSE gets boost if user is CSE, etc.)
        return b.rating * 10 + (b.isAvailableNow ? 5 : 0) - (a.rating * 10 + (a.isAvailableNow ? 5 : 0));
      });
  }, [
    mentors,
    searchQuery,
    selectedSector,
    selectedSkill,
    selectedDepartment,
    selectedTopic,
    availableOnly,
    minRating,
    sortBy,
  ]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedSector('ALL');
    setSelectedSkill('ALL');
    setSelectedDepartment('ALL');
    setSelectedTopic('ALL');
    setAvailableOnly(false);
    setMinRating(0);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedSector !== 'ALL' ||
    selectedSkill !== 'ALL' ||
    selectedDepartment !== 'ALL' ||
    selectedTopic !== 'ALL' ||
    availableOnly ||
    minRating > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* 1. Header & Summary Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold bg-[#0F2A4A]/10 text-[#0F2A4A]">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
            BAUST Career Bridge • Mentorship Network
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {language === 'en' ? 'Alumni Mentorship & Career Guidance' : 'অ্যালামনাই মেন্টরশিপ ও ক্যারিয়ার গাইডেন্স'}
          </h1>
          <p className="text-sm text-slate-600">
            Connect with verified BAUST alumni across Government, Tech, Research, and Foreign Higher Studies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsCVRequestOpen(true)}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            Request CV Review
          </Button>

          <Button
            variant="primary"
            onClick={() => setActiveTab('find')}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Explore Mentors
          </Button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#0F2A4A]/10 text-[#0F2A4A] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Verified Mentors</p>
            <p className="text-xl font-extrabold text-slate-900">{mentors.length} Alumni</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">My Active Sessions</p>
            <p className="text-xl font-extrabold text-[#0F2A4A]">{activeSessions.length} Scheduled</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#2E5E3E]/10 text-[#2E5E3E] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Completed Sessions</p>
            <p className="text-xl font-extrabold text-[#2E5E3E]">{completedSessions.length} Held</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">CV Reviews Received</p>
            <p className="text-xl font-extrabold text-amber-900">
              {studentCVReviews.filter((c) => c.status === 'REVIEWED').length} Reports
            </p>
          </div>
        </div>
      </div>

      {/* 2. Interactive Navigation Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('find')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'find'
                ? 'bg-[#0F2A4A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Search className="w-4 h-4" />
            Find Mentor
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-semibold">
              {filteredMentors.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'requests'
                ? 'bg-[#0F2A4A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            My Requests
            {pendingSessions.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-bold">
                {pendingSessions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'active'
                ? 'bg-[#0F2A4A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Video className="w-4 h-4" />
            Active Sessions
            {activeSessions.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-600 text-white font-bold">
                {activeSessions.length}
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
            Completed
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-semibold">
              {completedSessions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'rejected'
                ? 'bg-[#0F2A4A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Declined
            {rejectedSessions.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-100 text-red-700 font-bold">
                {rejectedSessions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('cv-review')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'cv-review'
                ? 'bg-[#0F2A4A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            CV Reviews
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-semibold">
              {studentCVReviews.length}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: FIND MENTOR */}
      {activeTab === 'find' && (
        <div className="space-y-6">
          {/* Search Bar + Controls */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by mentor name, company (e.g. Brain Station, Google, Govt), skill, or designation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs font-medium pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F2A4A] text-slate-800 placeholder-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs font-semibold rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0F2A4A]"
                >
                  <option value="match">Sort: Best Match %</option>
                  <option value="rating">Sort: Highest Rated</option>
                  <option value="sessions">Sort: Most Sessions</option>
                  <option value="batch">Sort: Senior Batch</option>
                </select>

                {/* Grid / List toggle */}
                <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-white shadow-xs text-[#0F2A4A]' : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-white shadow-xs text-[#0F2A4A]' : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title="List View"
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Sector Filter Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Job Sector Filter:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    'ALL',
                    'Government',
                    'Private',
                    'Abroad',
                    'Higher Study',
                    'Research',
                    'Business / Entrepreneurship',
                    'Freelancing',
                  ] as const
                ).map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setSelectedSector(sec)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedSector === sec
                        ? 'bg-[#0F2A4A] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                    }`}
                  >
                    {sec === 'ALL' ? 'All Sectors' : sec}
                  </button>
                ))}
              </div>
            </div>

            {/* Skill Filter Chips */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Skills & Specializations:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setSelectedSkill('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedSkill === 'ALL'
                      ? 'bg-[#2E5E3E] text-white'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  All Skills
                </button>
                {skillOptions.map((sk) => (
                  <button
                    key={sk}
                    onClick={() => setSelectedSkill(sk)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      selectedSkill === sk
                        ? 'bg-[#2E5E3E] text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {sk}
                  </button>
                ))}
              </div>
            </div>

            {/* Extra Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
              {/* Department */}
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value as any)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700"
              >
                <option value="ALL">All Departments</option>
                <option value="CSE">CSE</option>
                <option value="EEE">EEE</option>
                <option value="ME">ME</option>
                <option value="IPE">IPE</option>
                <option value="CE">Civil (CE)</option>
                <option value="TE">Textile (TE)</option>
                <option value="BBA">BBA</option>
                <option value="English">English</option>
              </select>

              {/* Topic */}
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700"
              >
                <option value="ALL">All Mentoring Topics</option>
                <option value="CV Review">CV Review</option>
                <option value="Interview Prep">Interview Prep</option>
                <option value="Higher Studies">Higher Studies</option>
                <option value="Career Guidance">Career Guidance</option>
                <option value="Project/Thesis Help">Project/Thesis Help</option>
                <option value="Skill Roadmap">Skill Roadmap</option>
                <option value="Government / BCS">Government / BCS</option>
              </select>

              {/* Min Rating */}
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700"
              >
                <option value="0">Any Rating</option>
                <option value="4.5">★ 4.5 & Above</option>
                <option value="4.8">★ 4.8 & Above</option>
              </select>

              {/* Available Now Toggle */}
              <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="rounded border-slate-300 text-[#0F2A4A] focus:ring-[#0F2A4A]"
                />
                Available this week only
              </label>

              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="ml-auto text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Result Count Banner */}
          <div className="flex items-center justify-between text-xs text-slate-600 px-1">
            <p>
              Showing <strong className="text-slate-900">{filteredMentors.length}</strong> verified alumni mentors
            </p>
            {comparedMentorIds.length > 0 && (
              <span className="text-xs font-bold text-[#0F2A4A]">
                {comparedMentorIds.length} of 3 selected for comparison
              </span>
            )}
          </div>

          {/* Mentors Grid / List */}
          {filteredMentors.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No mentors match your current filters</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try loosening your search keywords, switching to "All Sectors", or resetting skill filters.
              </p>
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {filteredMentors.map((mentor) => (
                <MentorCard
                  key={mentor.id}
                  mentor={mentor}
                  onRequestMentorship={(m) => setBookingMentor(m)}
                  onToggleCompare={(item: any) => toggleCompare(typeof item === 'string' ? item : item.id)}
                  isCompared={comparedMentorIds.includes(mentor.id)}
                />
              ))}
            </div>
          )}

          {/* Student Career Goals Section */}
          <div className="pt-6">
            <GoalsTrackerCard />
          </div>
        </div>
      )}

      {/* TAB 2: MY REQUESTS (PENDING) */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Pending Mentorship Applications ({pendingSessions.length})
            </h3>
            <p className="text-xs text-slate-500">
              Alumni typically respond within 24-48 hours.
            </p>
          </div>

          {pendingSessions.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No Pending Requests</h4>
              <p className="text-xs text-slate-500">
                You do not have any mentorship requests waiting for alumni approval.
              </p>
              <Button variant="primary" size="sm" onClick={() => setActiveTab('find')}>
                Browse Alumni Mentors
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={session.mentorAvatar}
                      alt={session.mentorName}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-100"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{session.mentorName}</h4>
                        <Badge variant="pending">Awaiting Response</Badge>
                      </div>
                      <p className="text-xs text-slate-600">
                        {session.mentorDesignation} at <strong>{session.mentorCompany}</strong>
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                        <span className="font-semibold text-[#0F2A4A]">Topic: {session.topic}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Requested slot: {session.scheduledSlot.day} ({session.scheduledSlot.time})
                        </span>
                        <span>•</span>
                        <span>Mode: {session.mode}</span>
                      </div>
                      {session.message && (
                        <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2">
                          "{session.message}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelSession(session.id, 'Cancelled by student')}
                      className="text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                    >
                      Withdraw Request
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ACTIVE SESSIONS (ACCEPTED / IN_PROGRESS) */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Upcoming & Active Mentorship Sessions ({activeSessions.length})
            </h3>
            <p className="text-xs text-slate-500">
              Approved by alumni. Join video call at scheduled time.
            </p>
          </div>

          {activeSessions.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <Video className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No Active Sessions Right Now</h4>
              <p className="text-xs text-slate-500">
                When an alumnus accepts your request, the meeting link and interactive call room will appear here.
              </p>
              <Button variant="primary" size="sm" onClick={() => setActiveTab('find')}>
                Find a Mentor
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={session.mentorAvatar}
                      alt={session.mentorName}
                      className="w-14 h-14 rounded-2xl object-cover bg-slate-100 border border-slate-200"
                    />
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900">{session.mentorName}</h4>
                        <Badge variant="approved">Confirmed Slot</Badge>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#0F2A4A]/10 text-[#0F2A4A]">
                          {session.topic}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600">
                        {session.mentorDesignation} at <strong>{session.mentorCompany}</strong>
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
                        <span className="font-semibold">{session.mode}</span>
                      </div>

                      {/* Action items preview */}
                      {session.actionItems && session.actionItems.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[11px] font-bold uppercase text-slate-500">
                            Session Action Items:
                          </span>
                          <div className="space-y-1 mt-1">
                            {session.actionItems.slice(0, 2).map((a) => (
                              <div key={a.id} className="text-xs text-slate-600 flex items-center gap-1.5">
                                <span className={a.completed ? 'text-emerald-600' : 'text-slate-400'}>
                                  {a.completed ? '☑' : '☐'}
                                </span>
                                <span className={a.completed ? 'line-through text-slate-400' : ''}>
                                  {a.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap md:flex-col items-end gap-2.5 shrink-0">
                    <Button
                      variant="primary"
                      onClick={() => {
                        startSession(session.id);
                        setActiveCallSession(session);
                      }}
                      className="flex items-center gap-2 bg-[#2E5E3E] hover:bg-[#254b32]"
                    >
                      <Video className="w-4 h-4" />
                      Join 1-on-1 Call Room
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFeedbackSession(session)}
                      className="text-xs font-semibold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                      Mark Done & Rate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: COMPLETED SESSIONS */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Completed Mentorship Records ({completedSessions.length})
            </h3>
            <p className="text-xs text-slate-500">
              Archived meeting notes, student ratings, and takeaways.
            </p>
          </div>

          {completedSessions.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No completed sessions on record yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={session.mentorAvatar}
                        alt={session.mentorName}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{session.mentorName}</h4>
                        <p className="text-[11px] text-slate-500">
                          {session.mentorDesignation} • {session.mentorCompany}
                        </p>
                      </div>
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

                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <p className="font-semibold text-slate-800 mb-0.5">Topic: {session.topic}</p>
                    {session.studentReview && <p className="italic">"{session.studentReview}"</p>}
                  </div>

                  {session.studentTags && session.studentTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {session.studentTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-800"
                        >
                          ✓ {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: DECLINED SESSIONS */}
      {activeTab === 'rejected' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Declined Requests ({rejectedSessions.length})
            </h3>
            <p className="text-xs text-slate-500">
              Reasons provided by alumni with alternative recommendations.
            </p>
          </div>

          {rejectedSessions.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <p className="text-xs text-slate-500">No declined sessions.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rejectedSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{session.mentorName}</h4>
                      <p className="text-[11px] text-slate-500">Topic: {session.topic}</p>
                    </div>
                    <Badge variant="rejected">Request Declined</Badge>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100 text-xs text-rose-950">
                    <strong>Reason:</strong> {session.rejectionReason || 'Alumni schedule conflict for requested slot.'}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">
                      Recommendation: You can book an alternate slot or choose another mentor.
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('find')}
                      className="text-xs"
                    >
                      Find Similar Mentors
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: CV REVIEW */}
      {activeTab === 'cv-review' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Alumni CV & Resume Review Tracking
              </h3>
              <p className="text-xs text-slate-500">
                Submit draft versions of your CV to get scored rubric evaluations and ATS tips.
              </p>
            </div>

            <Button
              variant="primary"
              onClick={() => setIsCVRequestOpen(true)}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Submit CV for Review
            </Button>
          </div>

          {studentCVReviews.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No CV Reviews on File</h4>
              <p className="text-xs text-slate-500">
                Submit your CV to get in-depth feedback from BAUST alumni working in top companies.
              </p>
              <Button variant="primary" size="sm" onClick={() => setIsCVRequestOpen(true)}>
                Submit CV Now
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentCVReviews.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0F2A4A] text-white uppercase">
                            {item.version.toUpperCase()}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{item.targetRole}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Reviewer: <strong>{item.mentorName}</strong> ({item.mentorCompany})
                        </p>
                      </div>

                      {item.status === 'REVIEWED' ? (
                        <Badge variant="approved">Report Ready</Badge>
                      ) : (
                        <Badge variant="pending">In Evaluation</Badge>
                      )}
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700">{item.cvFileName}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{item.cvFileSize}</span>
                    </div>

                    {item.overallScore && (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 font-bold">
                        <span>Composite Score:</span>
                        <span className="text-base font-black text-[#0F2A4A]">{item.overallScore}/100</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">
                      Submitted: {item.submittedAt}
                    </span>

                    {item.status === 'REVIEWED' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setViewingCVResult(item)}
                      >
                        View Full Report
                      </Button>
                    ) : (
                      <span className="text-xs font-semibold text-amber-600">
                        Estimated: {item.deadlinePreference}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating Mentor Comparison Tray */}
      {comparedMentorIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#0F2A4A] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-4 border border-white/20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse" />
            <span className="text-xs font-bold">
              {comparedMentorIds.length} / 3 Mentors Selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            {comparedMentors.map((m) => (
              <img
                key={m.id}
                src={m.avatar}
                alt={m.name}
                className="w-7 h-7 rounded-full border border-white/40 object-cover"
                title={m.name}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 border-l border-white/20 pl-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsComparisonOpen(true)}
              className="bg-[#C9A227] text-slate-900 hover:bg-[#b08d20] font-bold text-xs"
            >
              Compare Side-by-Side
            </Button>
            <button
              onClick={() => setComparedMentorIds([])}
              className="text-xs text-white/70 hover:text-white"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {bookingMentor && (
        <RequestMentorshipModal
          isOpen={!!bookingMentor}
          onClose={() => setBookingMentor(null)}
          mentor={bookingMentor}
        />
      )}

      {activeCallSession && (
        <MockCallModal
          isOpen={!!activeCallSession}
          onClose={() => setActiveCallSession(null)}
          session={activeCallSession}
        />
      )}

      {feedbackSession && (
        <FeedbackModal
          isOpen={!!feedbackSession}
          onClose={() => setFeedbackSession(null)}
          session={feedbackSession}
        />
      )}

      <MentorComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        mentors={comparedMentors}
        onRemoveMentor={(id) => toggleCompare(id)}
        onRequestMentorship={(m) => {
          setIsComparisonOpen(false);
          setBookingMentor(m);
        }}
      />

      <RequestCVReviewModal
        isOpen={isCVRequestOpen}
        onClose={() => setIsCVRequestOpen(false)}
      />

      <CVReviewResultModal
        isOpen={!!viewingCVResult}
        onClose={() => setViewingCVResult(null)}
        review={viewingCVResult}
      />
    </div>
  );
};
