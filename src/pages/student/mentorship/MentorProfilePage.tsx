/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMentorshipStore } from '../../../hooks/useMentorshipStore';
import { useApp } from '../../../context/AppContext';
import { RequestMentorshipModal } from '../../../components/mentorship/RequestMentorshipModal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { 
  CheckCircle2, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Calendar, 
  Clock, 
  Star, 
  Bookmark, 
  Share2, 
  MessageSquare, 
  ExternalLink, 
  ArrowLeft,
  Award,
  Globe,
  Sparkles,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { MentorTimeSlot } from '../../../types/mentorship';

export const MentorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mentors, getMentorById, savedMentorIds, toggleSaveMentor, calculateMatchScore } = useMentorshipStore();
  const { addToast } = useApp();

  const mentor = getMentorById(id || '') || mentors[0];
  const isSaved = savedMentorIds.includes(mentor.id);
  const matchScore = calculateMatchScore(mentor);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<MentorTimeSlot | undefined>(mentor.availableSlots[0]);
  const [reviewFilterRating, setReviewFilterRating] = useState<number | null>(null);

  const filteredReviews = reviewFilterRating
    ? mentor.reviews.filter((r) => Math.round(r.rating) === reviewFilterRating)
    : mentor.reviews;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    addToast('info', 'Link Copied', 'Mentor profile link copied to clipboard.');
  };

  const totalReviews = mentor.reviewCount || 1;
  const rating5Pct = Math.round(((mentor.ratingBreakdown[5] || 0) / totalReviews) * 100);
  const rating4Pct = Math.round(((mentor.ratingBreakdown[4] || 0) / totalReviews) * 100);
  const rating3Pct = Math.round(((mentor.ratingBreakdown[3] || 0) / totalReviews) * 100);
  const rating2Pct = Math.round(((mentor.ratingBreakdown[2] || 0) / totalReviews) * 100);
  const rating1Pct = Math.round(((mentor.ratingBreakdown[1] || 0) / totalReviews) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/student/mentorship')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0F2A4A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Mentorship Hub
        </button>
      </div>

      {/* Hero Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Navy/Army Gradient Cover */}
        <div className="h-36 bg-gradient-to-r from-[#0F2A4A] via-[#1E3A5F] to-[#2E5E3E] relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => toggleSaveMentor(mentor.id)}
              className={`p-2.5 rounded-xl backdrop-blur-md transition-all ${
                isSaved ? 'bg-amber-400 text-slate-900 shadow-sm' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title={isSaved ? 'Bookmarked' : 'Bookmark Mentor'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-white/20 text-white hover:bg-white/30 backdrop-blur-md transition-all"
              title="Share Profile"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Details Container */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 sm:-mt-20 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              <div className="relative">
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-white shadow-md bg-slate-100"
                />
                {mentor.isAvailableNow && (
                  <span
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-xs"
                    title="Available for bookings this week"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{mentor.name}</h1>
                  {mentor.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      BAUST Verified Alumnus
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C9A227]/15 text-[#8f7112] border border-[#C9A227]/30">
                    <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                    {matchScore}% Profile Match
                  </span>
                </div>

                <p className="text-base font-semibold text-slate-700">
                  {mentor.designation} at <strong className="text-[#0F2A4A]">{mentor.company}</strong>
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    Dept of {mentor.department} • Batch {mentor.batch} ('{mentor.passingYear})
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {mentor.location} {mentor.country ? `(${mentor.country})` : ''}
                  </span>
                  <span>•</span>
                  <span className="px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-700">
                    {mentor.sector}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                onClick={() => navigate('/chat')}
                className="flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Message
              </Button>

              <Button
                variant="primary"
                onClick={() => setIsRequestModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Request Mentorship
              </Button>
            </div>
          </div>

          {/* Key Mentor Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Rating</p>
              <p className="text-xl font-extrabold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {mentor.rating.toFixed(1)}
                <span className="text-xs font-normal text-slate-500">({mentor.reviewCount} reviews)</span>
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Sessions Held</p>
              <p className="text-xl font-extrabold text-[#0F2A4A] mt-0.5">
                {mentor.sessionsCompleted}+ <span className="text-xs font-normal text-slate-500">completed</span>
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Acceptance Rate</p>
              <p className="text-xl font-extrabold text-[#2E5E3E] mt-0.5">
                {mentor.acceptanceRate}%
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg Response Time</p>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                {mentor.responseTime}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Content (2 Cols), Right Sticky Booking Card (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Biography */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#0F2A4A]" />
              About Mentor & Philosophy
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {mentor.bio}
            </p>
            {mentor.program && (
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-100 text-xs text-sky-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-700 shrink-0" />
                <span>
                  Current Program: <strong>{mentor.program}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Mentoring Topics Offered */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Mentoring Topics Available
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mentor.mentoringTopics.map((topic) => (
                <div
                  key={topic}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                >
                  <span className="text-xs font-bold text-slate-800">{topic}</span>
                  <Badge variant="neutral" className="text-[10px] bg-white">
                    1-on-1 Session
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Skills & Expertise */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Technical & Professional Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {mentor.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200/60"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Career & Experience Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#2E5E3E]" />
              Career Journey & Industry Experience
            </h3>

            <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
              {mentor.experienceTimeline?.map((exp, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#0F2A4A] ring-4 ring-white" />
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase text-[#2E5E3E]">
                      {exp.period}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      {exp.role} • <span className="text-slate-600 font-medium">{exp.company}</span>
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education & BAUST Pedigree */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#0F2A4A]" />
              Academic Credentials
            </h3>
            <div className="space-y-3">
              {mentor.education?.map((edu, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{edu.degree}</h4>
                    <p className="text-[11px] text-slate-600">{edu.institution}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">{edu.year}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Achievements */}
          {mentor.achievements && mentor.achievements.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-[#C9A227]" />
                Key Achievements & Honors
              </h3>
              <ul className="space-y-2">
                {mentor.achievements.map((ach, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{ach}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Student Reviews & Rating Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Student Feedback & Ratings
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified reviews left by BAUST undergraduates after completed mentorship sessions.
                </p>
              </div>

              {/* Review Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-semibold">Filter:</span>
                <button
                  onClick={() => setReviewFilterRating(null)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                    reviewFilterRating === null ? 'bg-[#0F2A4A] text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  All ({mentor.reviews.length})
                </button>
                <button
                  onClick={() => setReviewFilterRating(5)}
                  className={`px-2 py-1 rounded-lg font-bold text-xs ${
                    reviewFilterRating === 5 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  5★
                </button>
              </div>
            </div>

            {/* Rating Breakdown Bar Visual */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-center sm:border-r sm:border-slate-200 pr-4 flex flex-col justify-center">
                <div className="text-4xl font-black text-slate-900">{mentor.rating.toFixed(1)}</div>
                <div className="flex items-center justify-center gap-1 text-amber-400 my-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-500">Based on {mentor.reviewCount} sessions</p>
                <p className="text-[11px] font-bold text-[#2E5E3E] mt-1">98% Recommend this mentor</p>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                {[
                  { star: 5, pct: rating5Pct, count: mentor.ratingBreakdown[5] || 0 },
                  { star: 4, pct: rating4Pct, count: mentor.ratingBreakdown[4] || 0 },
                  { star: 3, pct: rating3Pct, count: mentor.ratingBreakdown[3] || 0 },
                  { star: 2, pct: rating2Pct, count: mentor.ratingBreakdown[2] || 0 },
                  { star: 1, pct: rating1Pct, count: mentor.ratingBreakdown[1] || 0 },
                ].map((row) => (
                  <div key={row.star} className="flex items-center gap-2 text-xs">
                    <span className="w-6 font-bold text-slate-700">{row.star}★</span>
                    <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-slate-500 text-[11px]">{row.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {filteredReviews.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No reviews found for this filter.</p>
              ) : (
                filteredReviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.studentAvatar}
                          alt={rev.studentName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <h5 className="text-xs font-bold text-slate-900">{rev.studentName}</h5>
                          <p className="text-[11px] text-slate-500">
                            Dept of {rev.studentDept} • {rev.studentBatch}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400">{rev.date}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      "{rev.comment}"
                    </p>

                    {rev.tags && rev.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {rev.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100"
                          >
                            ✓ {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Sticky Booking Card (1 col) */}
        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Book 1-on-1 Mentorship
                </span>
                <h3 className="text-lg font-extrabold text-[#0F2A4A] mt-0.5">
                  Available Slots
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Pick an available time window. Sessions are conducted via Google Meet video or voice call.
                </p>
              </div>

              {/* Slot Picker */}
              <div className="space-y-2">
                {mentor.availableSlots.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#0F2A4A] bg-[#0F2A4A]/5 ring-1 ring-[#0F2A4A]'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-800">{slot.day}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {slot.time}
                        </div>
                      </div>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-[#0F2A4A] bg-[#0F2A4A]' : 'border-slate-300'
                      }`}>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Booking CTA Button */}
              <Button
                variant="primary"
                className="w-full py-3 text-sm font-bold shadow-md"
                onClick={() => setIsRequestModalOpen(true)}
              >
                Proceed to Request Form
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>

              <div className="text-[11px] text-slate-500 text-center space-y-1">
                <p>⚡ Free for all registered BAUST students</p>
                <p>🔒 Verified BAUST alumni network only</p>
              </div>
            </div>

            {/* Quick Contact Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#2E5E3E]/10 to-[#0F2A4A]/5 border border-[#2E5E3E]/20 text-xs text-slate-700 space-y-3">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#2E5E3E]" />
                BAUST Alumni Mentorship Guarantee
              </h4>
              <p className="text-slate-600 leading-relaxed">
                If the alumni mentor cannot attend at the selected time, they can propose a reschedule or you will be offered priority matching with another senior alumnus.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <RequestMentorshipModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        mentor={mentor}
        initialSlot={selectedSlot}
      />
    </div>
  );
};
