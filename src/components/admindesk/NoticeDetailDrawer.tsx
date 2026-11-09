/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  X, 
  Calendar, 
  MapPin, 
  Download, 
  FileText, 
  Users, 
  Share2, 
  Pin, 
  AlertCircle 
} from 'lucide-react';
import { NoticeItem } from '../../types/admindesk';

interface NoticeDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notice: NoticeItem | null;
  onRsvp?: (id: string) => void;
}

export const NoticeDetailDrawer: React.FC<NoticeDetailDrawerProps> = ({
  isOpen,
  onClose,
  notice,
  onRsvp
}) => {
  if (!isOpen || !notice) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
              notice.category === 'Urgent' ? 'bg-rose-100 text-rose-800' :
              notice.category === 'Convocation' ? 'bg-purple-100 text-purple-800' :
              notice.category === 'Alumni Event' ? 'bg-emerald-100 text-emerald-800' :
              'bg-slate-100 text-slate-700'
            }`}>
              {notice.category}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Published: {notice.publishedAt}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-slate-800">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 leading-snug">
              {notice.title}
            </h2>
            {notice.titleBn && (
              <p className="text-sm text-slate-500 font-serif mt-1">
                {notice.titleBn}
              </p>
            )}
          </div>

          {/* Event Card if applicable */}
          {notice.eventDate && (
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  {notice.eventDate}
                </span>
                {onRsvp && (
                  <button
                    onClick={() => onRsvp(notice.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      notice.userRsvpd
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-emerald-200 text-emerald-900 hover:bg-emerald-300'
                    }`}
                  >
                    {notice.userRsvpd ? '✓ Registered' : 'I am Interested (RSVP)'}
                  </button>
                )}
              </div>
              {notice.eventLocation && (
                <div className="flex items-center gap-2 text-emerald-800">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{notice.eventLocation}</span>
                </div>
              )}
              <div className="text-[11px] text-emerald-700 font-medium pt-1 border-t border-emerald-200/60">
                {notice.rsvpCount || 0} Alumni registered for this event
              </div>
            </div>
          )}

          {/* Body Content */}
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 whitespace-pre-line">
            {notice.content}
          </div>

          {/* Attachments Section */}
          {notice.attachments && notice.attachments.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Official Document Attachments
              </h4>
              <div className="space-y-2">
                {notice.attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-navy shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900">{att.name}</div>
                        <div className="text-[10px] text-slate-400">{att.size}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Downloading attachment: ${att.name}`)}
                      className="p-2 rounded-lg bg-white border border-slate-200 text-navy hover:bg-slate-100 font-bold flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Target Audience: <strong>{notice.audience}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-navy text-white text-xs font-bold hover:bg-[#0b1f36]"
          >
            Close Notice
          </button>
        </div>
      </div>
    </div>
  );
};
