/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Star, 
  Bookmark, 
  BookmarkCheck, 
  MessageSquare, 
  Calendar, 
  Lock, 
  ExternalLink,
  Award,
  Users2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { DirectoryAlumniProfile } from '../../types/directory';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface AlumniDirectoryCardProps {
  profile: DirectoryAlumniProfile;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onCompareToggle?: (id: string) => void;
  isCompared?: boolean;
  viewMode?: 'grid' | 'list';
}

const SECTOR_TAG_STYLES: Record<string, string> = {
  Private: 'bg-slate-100 text-slate-800 border-slate-300',
  Government: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  Abroad: 'bg-sky-50 text-sky-800 border-sky-300',
  Research: 'bg-purple-50 text-purple-800 border-purple-300',
  Business: 'bg-amber-50 text-amber-800 border-amber-300',
  Freelancing: 'bg-teal-50 text-teal-800 border-teal-300',
  'Higher Study': 'bg-rose-50 text-rose-800 border-rose-300'
};

export const AlumniDirectoryCard: React.FC<AlumniDirectoryCardProps> = ({
  profile,
  isSaved,
  onToggleSave,
  onCompareToggle,
  isCompared = false,
  viewMode = 'grid'
}) => {
  const navigate = useNavigate();

  // Match score calculation heuristic for demo
  const matchScore = React.useMemo(() => {
    let score = 75;
    if (profile.isVerified) score += 10;
    if (profile.mentoringAvailable) score += 8;
    if (profile.openToReferrals) score += 5;
    if (profile.cgpa >= 3.8) score += 2;
    return Math.min(score, 99);
  }, [profile]);

  // Privacy checks
  const canSeeCgpa = profile.privacy?.cgpa !== 'hidden';
  const isCgpaStudentsOnly = profile.privacy?.cgpa === 'students_only';

  if (viewMode === 'list') {
    return (
      <div className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all duration-200 hover:shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        isCompared ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200'
      }`}>
        <div className="flex items-start gap-4">
          {/* Compare Checkbox */}
          {onCompareToggle && (
            <div className="pt-2">
              <input
                type="checkbox"
                checked={isCompared}
                onChange={() => onCompareToggle(profile.id)}
                className="w-4 h-4 rounded text-navy focus:ring-navy border-slate-300 cursor-pointer"
                title="Select to compare"
              />
            </div>
          )}

          {/* Avatar */}
          <div className="relative shrink-0">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-slate-200 shadow-sm"
            />
            {profile.isVerified && (
              <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs" title="Verified BAUST Alumni">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
              </span>
            )}
          </div>

          {/* Core Info */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/student/directory/${profile.id}`}
                className="text-base font-bold text-slate-900 hover:text-navy transition-colors"
              >
                {profile.name}
              </Link>
              {profile.nameBn && (
                <span className="text-xs text-slate-400 font-serif">({profile.nameBn})</span>
              )}
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${SECTOR_TAG_STYLES[profile.sector] || 'bg-slate-100'}`}>
                {profile.sector}
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                {matchScore}% Match
              </span>
            </div>

            <p className="text-xs font-medium text-slate-700 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{profile.designation}</span>
              <span className="text-slate-300">•</span>
              <span className="font-semibold text-navy">{profile.company}</span>
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                BAUST {profile.department} ({profile.batch}, {profile.passingYear})
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {profile.location}
              </span>
              {canSeeCgpa ? (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.2 rounded">
                    CGPA {profile.cgpa.toFixed(2)}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                    <Lock className="w-3 h-3" /> CGPA Private
                  </span>
                </>
              )}
            </div>

            {/* Top Expertise Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(profile.topExpertise || profile.skills.slice(0, 3)).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[11px] bg-amber-50 text-amber-900 border border-amber-200 font-medium px-2 py-0.5 rounded-md"
                >
                  ✦ {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            onClick={() => onToggleSave(profile.id)}
            className={`p-2 rounded-xl border transition-colors ${
              isSaved
                ? 'bg-amber-50 border-amber-300 text-amber-600'
                : 'border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
            title={isSaved ? 'Remove Bookmark' : 'Save Alumni'}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-600" /> : <Bookmark className="w-4 h-4" />}
          </button>

          {profile.mentoringAvailable ? (
            <Link
              to={`/student/mentorship/mentor/${profile.id}`}
              className="text-xs font-semibold px-3 py-2 rounded-xl bg-[#2E5E3E] text-white hover:bg-[#234930] transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              Request Mentorship
            </Link>
          ) : (
            <Link
              to={`/chat?user=${profile.id}`}
              className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Message
            </Link>
          )}

          <Link
            to={`/student/directory/${profile.id}`}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-navy text-white hover:bg-[#091e36] transition-colors"
          >
            View Profile
          </Link>
        </div>
      </div>
    );
  }

  // Grid Card View (Default)
  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-lg flex flex-col justify-between overflow-hidden group ${
      isCompared ? 'border-primary ring-2 ring-primary/30' : 'border-slate-200/90'
    }`}>
      {/* Card Header & Cover Strip */}
      <div className="relative h-20 bg-linear-to-r from-[#0F2A4A] via-[#1a406c] to-[#2E5E3E] p-3">
        {profile.coverImage && (
          <img
            src={profile.coverImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay"
          />
        )}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          {onCompareToggle && (
            <label className="flex items-center gap-1 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-semibold text-slate-700 cursor-pointer shadow-xs border border-white/50">
              <input
                type="checkbox"
                checked={isCompared}
                onChange={() => onCompareToggle(profile.id)}
                className="w-3.5 h-3.5 rounded text-navy focus:ring-navy border-slate-300 cursor-pointer"
              />
              Compare
            </label>
          )}

          <button
            onClick={() => onToggleSave(profile.id)}
            className={`p-1.5 rounded-lg backdrop-blur-xs transition-colors shadow-xs ${
              isSaved
                ? 'bg-amber-400 text-slate-900'
                : 'bg-white/80 hover:bg-white text-slate-600'
            }`}
            title={isSaved ? 'Bookmarked' : 'Save profile'}
          >
            {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Sector tag pinned on cover */}
        <span className={`absolute bottom-2.5 left-3 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md shadow-xs ${
          profile.sector === 'Government' ? 'bg-emerald-600 text-white' :
          profile.sector === 'Abroad' ? 'bg-sky-600 text-white' :
          profile.sector === 'Research' ? 'bg-purple-600 text-white' :
          profile.sector === 'Business' ? 'bg-amber-600 text-white' :
          profile.sector === 'Freelancing' ? 'bg-teal-600 text-white' :
          'bg-slate-800 text-white'
        }`}>
          {profile.sector}
        </span>
      </div>

      {/* Main Body */}
      <div className="p-4 pt-0 -mt-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Avatar and Match Score */}
          <div className="flex items-end justify-between mb-2.5">
            <div className="relative">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-md bg-white"
              />
              {profile.isVerified && (
                <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs" title="Official BAUST Verified">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                </span>
              )}
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" />
                {matchScore}% Match
              </div>
            </div>
          </div>

          {/* Name & Headline */}
          <div className="mb-2">
            <Link
              to={`/student/directory/${profile.id}`}
              className="text-base font-bold text-slate-900 hover:text-navy transition-colors line-clamp-1"
            >
              {profile.name}
            </Link>
            <p className="text-xs font-semibold text-slate-700 line-clamp-1 mt-0.5">
              {profile.designation}
            </p>
            <p className="text-xs font-bold text-navy line-clamp-1">
              {profile.company}
            </p>
          </div>

          {/* BAUST Academic Credentials */}
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-xs text-slate-600 space-y-1 mb-3">
            <div className="flex items-center justify-between font-medium">
              <span className="flex items-center gap-1.5 text-slate-700">
                <GraduationCap className="w-3.5 h-3.5 text-navy shrink-0" />
                BAUST {profile.department} ({profile.batch})
              </span>
              <span className="text-[11px] text-slate-400">Class of {profile.passingYear}</span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-3 h-3 text-slate-400" />
                {profile.location.split(',')[0]}
              </span>
              {canSeeCgpa ? (
                <span className="font-semibold text-amber-900 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                  CGPA {profile.cgpa.toFixed(2)}
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> CGPA Hidden
                </span>
              )}
            </div>
          </div>

          {/* Gold Expertise Chips */}
          <div className="mb-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Key Expertise
            </div>
            <div className="flex flex-wrap gap-1">
              {(profile.topExpertise || profile.skills.slice(0, 3)).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[11px] bg-amber-50 text-amber-900 border border-amber-200/80 font-medium px-2 py-0.5 rounded-md"
                >
                  ✦ {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Mentoring & Referral Status Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
            {profile.mentoringAvailable && (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <Calendar className="w-3 h-3 text-emerald-600" />
                Open to Mentor ({profile.studentsConsulted || 40}+ consulted)
              </span>
            )}
            {profile.openToReferrals && (
              <span className="inline-flex items-center gap-1 text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 font-medium">
                Open to Referrals
              </span>
            )}
            {profile.openToHiring && (
              <span className="inline-flex items-center gap-1 text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 font-medium">
                Hiring
              </span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2 mt-3">
          <Link
            to={`/student/directory/${profile.id}`}
            className="flex-1 py-2 px-3 text-center text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Full Profile
          </Link>

          {profile.mentoringAvailable ? (
            <Link
              to={`/student/mentorship/mentor/${profile.id}`}
              className="flex-1 py-2 px-3 text-center text-xs font-bold rounded-xl bg-[#2E5E3E] text-white hover:bg-[#234930] transition-colors shadow-xs"
            >
              Mentorship
            </Link>
          ) : (
            <Link
              to={`/chat?user=${profile.id}`}
              className="flex-1 py-2 px-3 text-center text-xs font-bold rounded-xl bg-navy text-white hover:bg-[#0b1f36] transition-colors shadow-xs"
            >
              Message
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
