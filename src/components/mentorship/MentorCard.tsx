/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Mentor, MentorshipSession } from '../../types/mentorship';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { 
  Star, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Calendar, 
  Heart, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Video,
  Layers,
  ArrowRight
} from 'lucide-react';

import { useMentorshipStore } from '../../hooks/useMentorshipStore';

export interface MentorCardProps {
  mentor: Mentor;
  onRequestMentorship: (mentor: Mentor) => void;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  matchScore?: number;
  existingSession?: MentorshipSession;
  isComparing?: boolean;
  isCompared?: boolean;
  onToggleCompare?: ((mentor: Mentor) => void) | ((mentorId: string) => void);
  canCompare?: boolean;
}

export const MentorCard: React.FC<MentorCardProps> = ({
  mentor,
  onRequestMentorship,
  isSaved: propIsSaved,
  onToggleSave: propOnToggleSave,
  matchScore: propMatchScore,
  existingSession,
  isComparing,
  isCompared,
  onToggleCompare,
  canCompare = true,
}) => {
  const store = useMentorshipStore();
  const isSaved = propIsSaved !== undefined ? propIsSaved : store.savedMentorIds.includes(mentor.id);
  const onToggleSave = propOnToggleSave || store.toggleSaveMentor;
  const matchScore = propMatchScore !== undefined ? propMatchScore : store.calculateMatchScore(mentor);
  const activeCompared = isCompared !== undefined ? isCompared : !!isComparing;
  const getSectorBadge = (sector: Mentor['sector']) => {
    switch (sector) {
      case 'Government':
        return <Badge variant="army">{sector}</Badge>;
      case 'Higher Study':
        return <Badge variant="gold">Higher Study</Badge>;
      case 'Abroad':
        return <Badge variant="gold">Abroad</Badge>;
      case 'Research':
        return <Badge variant="in-progress">Research</Badge>;
      case 'Freelancing':
        return <Badge variant="ready">Freelancing</Badge>;
      case 'Business / Entrepreneurship':
        return <Badge variant="navy">Business</Badge>;
      default:
        return <Badge variant="neutral">{sector}</Badge>;
    }
  };

  const getStatusBadgeVariant = (status: MentorshipSession['status']) => {
    switch (status) {
      case 'PENDING':
        return 'pending';
      case 'ACCEPTED':
        return 'approved';
      case 'IN_PROGRESS':
        return 'in-progress';
      case 'COMPLETED':
        return 'navy';
      case 'REJECTED':
        return 'rejected';
      case 'CANCELLED':
        return 'neutral';
    }
  };

  return (
    <Card hoverable className="p-5 flex flex-col justify-between space-y-4 border-slate-200 relative group">
      
      {/* Top Bar: Match % + Sector Badge + Heart Save */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            {matchScore}% Match
          </span>
          {getSectorBadge(mentor.sector)}
        </div>

        <div className="flex items-center gap-1">
          {onToggleCompare && (
            <button
              onClick={() => (onToggleCompare as any)(mentor.id)}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeCompared
                  ? 'bg-[#0F2A4A] text-white'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
              title="Compare with another mentor"
              disabled={!activeCompared && !canCompare}
            >
              <Layers className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onToggleSave(mentor.id)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isSaved
                ? 'text-rose-500 bg-rose-50'
                : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100'
            }`}
            title={isSaved ? 'Remove Bookmark' : 'Bookmark Mentor'}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Info */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Avatar
            src={mentor.avatar}
            name={mentor.name}
            size="lg"
            isVerified={mentor.isVerified}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {mentor.name}
              </h3>
            </div>
            <p className="text-xs font-semibold text-[#0F2A4A] truncate">{mentor.designation}</p>
            <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
              <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{mentor.company}</span>
              {mentor.country && <span className="text-slate-400">({mentor.country})</span>}
            </p>
          </div>
        </div>

        {/* Academic program info if Higher Study */}
        {mentor.program && (
          <p className="text-[11px] text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded-md border border-amber-200 font-medium truncate">
            🎓 {mentor.program}
          </p>
        )}

        {/* Dept, Batch, Location, Rating */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <span className="font-semibold text-slate-700">{mentor.department}</span>
          <span>·</span>
          <span>{mentor.batch}</span>
          <span>·</span>
          <span className="flex items-center gap-1 text-amber-600 font-bold ml-auto">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            {mentor.rating.toFixed(1)} ({mentor.reviewCount})
          </span>
        </div>

        {/* Top 3 Skills */}
        <div className="flex flex-wrap gap-1 pt-1">
          {mentor.skills.slice(0, 3).map((skill, sIdx) => (
            <span
              key={sIdx}
              className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
            >
              {skill}
            </span>
          ))}
          {mentor.skills.length > 3 && (
            <span className="text-[10px] text-slate-400 px-1 py-0.5">
              +{mentor.skills.length - 3}
            </span>
          )}
        </div>

        {/* Availability & Turnaround Info */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span className="flex items-center gap-1 text-slate-500">
            <Clock className="w-3 h-3" />
            <span>Replies {mentor.responseTime}</span>
          </span>
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{mentor.sessionsCompleted} sessions held</span>
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
        <Link to={`/student/mentorship/mentor/${mentor.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full text-xs">
            View Profile
          </Button>
        </Link>

        {existingSession && existingSession.status !== 'CANCELLED' && existingSession.status !== 'REJECTED' ? (
          <div className="flex-1">
            <Badge variant={getStatusBadgeVariant(existingSession.status)} size="md" className="w-full justify-center py-2">
              {existingSession.status === 'PENDING' ? 'Request Pending' : existingSession.status}
            </Badge>
          </div>
        ) : (
          <Button
            variant="primary"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onRequestMentorship(mentor)}
          >
            Request Mentorship
          </Button>
        )}
      </div>

    </Card>
  );
};
