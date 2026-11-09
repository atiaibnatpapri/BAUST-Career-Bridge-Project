/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Briefcase, 
  GraduationCap, 
  Clock, 
  MapPin, 
  Building2, 
  Bookmark, 
  BookmarkCheck, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { VacancyItem } from '../../types/admindesk';

interface VacancyCardProps {
  vacancy: VacancyItem;
  onApply: (vacancy: VacancyItem) => void;
  onToggleSave?: (id: string) => void;
  hasApplied?: boolean;
}

export const VacancyCard: React.FC<VacancyCardProps> = ({
  vacancy,
  onApply,
  onToggleSave,
  hasApplied = false
}) => {
  const isClosed = vacancy.status === 'Closed' || new Date(vacancy.deadline) < new Date();

  // Days left calculation
  const daysLeft = Math.ceil((new Date(vacancy.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24));

  return (
    <div className={`bg-white rounded-2xl border p-5 transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
      isClosed ? 'border-slate-200 opacity-75 bg-slate-50' : 'border-slate-200/90 hover:border-navy/30'
    }`}>
      <div>
        {/* Header Tags */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-navy/10 text-navy">
              {vacancy.department}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              {vacancy.type}
            </span>
            {hasApplied && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Applied
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {onToggleSave && (
              <button
                onClick={() => onToggleSave(vacancy.id)}
                className="text-slate-400 hover:text-amber-500 p-1"
                title="Bookmark vacancy"
              >
                {vacancy.isSaved ? (
                  <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-500" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 leading-snug mb-1">
          {vacancy.title}
        </h3>

        {/* Salary & Posts */}
        <div className="flex items-center gap-3 text-xs text-slate-600 mb-2.5 flex-wrap">
          {vacancy.salaryRange && (
            <span className="font-semibold text-emerald-700">
              {vacancy.salaryRange}
            </span>
          )}
          <span className="text-slate-300">•</span>
          <span>{vacancy.numberOfPosts} post{vacancy.numberOfPosts > 1 ? 's' : ''} available</span>
          <span className="text-slate-300">•</span>
          <span className="font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
            Min. CGPA {vacancy.cgpaRequirement.toFixed(2)}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-3">
          {vacancy.description}
        </p>

        {/* Qualifications Requirement */}
        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-[11px] text-slate-600 space-y-1 mb-3">
          <strong className="text-slate-800 block">Required Qualifications:</strong>
          <p className="line-clamp-2">{vacancy.qualifications}</p>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-1">
        <div className="flex items-center gap-1.5 text-xs">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {isClosed ? (
            <span className="text-rose-600 font-bold">Applications Closed</span>
          ) : (
            <span className={`font-semibold ${daysLeft <= 7 ? 'text-amber-600' : 'text-slate-500'}`}>
              Deadline: {vacancy.deadline} ({daysLeft} days left)
            </span>
          )}
        </div>

        <button
          onClick={() => onApply(vacancy)}
          disabled={isClosed || hasApplied}
          className={`text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs ${
            hasApplied
              ? 'bg-slate-100 text-slate-500 cursor-default'
              : isClosed
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-navy text-white hover:bg-[#0b1f36]'
          }`}
        >
          <span>{hasApplied ? 'Applied' : isClosed ? 'Closed' : 'Apply Now'}</span>
          {!hasApplied && !isClosed && <ArrowRight className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
