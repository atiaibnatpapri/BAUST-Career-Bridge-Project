/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Pin, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  FileText, 
  Users, 
  ArrowRight,
  Eye
} from 'lucide-react';
import { NoticeItem } from '../../types/admindesk';

interface NoticeCardProps {
  notice: NoticeItem;
  onOpenDetail: (notice: NoticeItem) => void;
  onRsvp?: (id: string) => void;
  isAdminView?: boolean;
  onDelete?: (id: string) => void;
  onTogglePin?: (id: string) => void;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({
  notice,
  onOpenDetail,
  onRsvp,
  isAdminView = false,
  onDelete,
  onTogglePin
}) => {
  return (
    <div className={`bg-white rounded-2xl border p-5 transition-all duration-200 hover:shadow-md flex flex-col justify-between relative group ${
      notice.isUrgent
        ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/20'
        : notice.isPinned
        ? 'border-amber-300 bg-amber-50/20'
        : 'border-slate-200/90'
    }`}>
      <div>
        {/* Category & Status Pills */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
              notice.category === 'Urgent' ? 'bg-rose-100 text-rose-800' :
              notice.category === 'Convocation' ? 'bg-purple-100 text-purple-800' :
              notice.category === 'Alumni Event' ? 'bg-emerald-100 text-emerald-800' :
              notice.category === 'Job/Recruitment' ? 'bg-sky-100 text-sky-800' :
              'bg-slate-100 text-slate-700'
            }`}>
              {notice.category}
            </span>

            {notice.isPinned && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                <Pin className="w-3 h-3 fill-amber-700 text-amber-700" />
                Pinned
              </span>
            )}

            {notice.isUrgent && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Urgent Notice
              </span>
            )}
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            {notice.publishedAt}
          </span>
        </div>

        {/* Title */}
        <h3 
          onClick={() => onOpenDetail(notice)}
          className="text-sm font-bold text-slate-900 group-hover:text-navy transition-colors cursor-pointer leading-snug mb-1"
        >
          {notice.title}
        </h3>

        {notice.titleBn && (
          <p className="text-[11px] text-slate-400 font-serif line-clamp-1 mb-2">
            {notice.titleBn}
          </p>
        )}

        {/* Content Preview */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
          {notice.content}
        </p>

        {/* Event Details (if applicable) */}
        {notice.eventDate && (
          <div className="bg-emerald-50/70 rounded-xl p-2.5 border border-emerald-200/60 text-xs text-emerald-950 space-y-1 mb-3">
            <div className="flex items-center gap-1.5 font-bold">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              Event Date: {notice.eventDate}
            </div>
            {notice.eventLocation && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-800">
                <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate">{notice.eventLocation}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-1">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {notice.readCount} views
          </span>
          {notice.attachments && notice.attachments.length > 0 && (
            <span className="flex items-center gap-0.5 text-navy font-semibold">
              <FileText className="w-3 h-3" />
              {notice.attachments.length} file(s)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {notice.eventDate && onRsvp && (
            <button
              onClick={() => onRsvp(notice.id)}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-colors ${
                notice.userRsvpd
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
              }`}
            >
              {notice.userRsvpd ? '✓ Registered' : `RSVP (${notice.rsvpCount || 0})`}
            </button>
          )}

          <button
            onClick={() => onOpenDetail(notice)}
            className="text-xs font-bold text-navy hover:underline flex items-center gap-1"
          >
            Read Notice
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
