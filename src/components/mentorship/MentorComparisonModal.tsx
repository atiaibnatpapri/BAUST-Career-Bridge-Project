/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mentor } from '../../types/mentorship';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Star, CheckCircle2, Clock, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MentorComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentors: Mentor[];
  onRemoveMentor: (id: string) => void;
  onRequestMentorship: (mentor: Mentor) => void;
}

export const MentorComparisonModal: React.FC<MentorComparisonModalProps> = ({
  isOpen,
  onClose,
  mentors,
  onRemoveMentor,
  onRequestMentorship,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Side-by-Side Mentor Comparison"
      description={`Comparing ${mentors.length} selected alumni mentors`}
      maxWidth="3xl"
    >
      <div className="space-y-6 overflow-x-auto">
        
        {mentors.length === 0 ? (
          <p className="text-center py-8 text-xs text-slate-500">
            No mentors selected for comparison. Use the layer icon on mentor cards to add up to 3 mentors.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 min-w-[580px]">
            {mentors.map((mentor) => (
              <div
                key={mentor.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 relative"
              >
                <button
                  onClick={() => onRemoveMentor(mentor.id)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
                  title="Remove from comparison"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="space-y-3 pt-2">
                  <div className="flex flex-col items-center text-center">
                    <Avatar src={mentor.avatar} name={mentor.name} size="lg" isVerified />
                    <h4 className="text-xs font-bold text-slate-900 mt-2">{mentor.name}</h4>
                    <p className="text-[11px] text-[#0F2A4A] font-semibold">{mentor.designation}</p>
                    <p className="text-[11px] text-slate-500">{mentor.company}</p>
                    <Badge variant="navy" size="sm" className="mt-1.5">{mentor.sector}</Badge>
                  </div>

                  {/* Attributes comparison table */}
                  <div className="space-y-2 border-t border-slate-100 pt-3 text-[11px]">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-400">Department</span>
                      <span className="font-bold text-slate-800">{mentor.department}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-400">Batch</span>
                      <span className="font-bold text-slate-800">{mentor.batch}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-400">Rating</span>
                      <span className="font-bold text-amber-600 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {mentor.rating.toFixed(1)} ({mentor.reviewCount})
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-400">Sessions</span>
                      <span className="font-bold text-slate-800">{mentor.sessionsCompleted} sessions</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-400">Response</span>
                      <span className="font-bold text-slate-800">{mentor.responseTime}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-400">Acceptance</span>
                      <span className="font-bold text-emerald-700">{mentor.acceptanceRate}%</span>
                    </div>
                  </div>

                  {/* Topics offered */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Topics</span>
                    <div className="flex flex-wrap gap-1">
                      {mentor.mentoringTopics.map((top, idx) => (
                        <span key={idx} className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                          {top}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs py-1.5"
                    onClick={() => {
                      onClose();
                      onRequestMentorship(mentor);
                    }}
                  >
                    Request
                  </Button>
                  <Link to={`/student/mentorship/mentor/${mentor.id}`} onClick={onClose} className="block text-center text-xs font-bold text-[#0F2A4A] hover:underline">
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </Modal>
  );
};
