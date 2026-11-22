/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserPlus, X, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { DirectoryAlumniProfile } from '../../types/directory';
import { useApp } from '../../context/AppContext';
import { MentorshipTopic } from '../../types';
import { normalizeDepartment } from '../../constants/baustDataModel';

interface ConnectRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  alumnus: DirectoryAlumniProfile;
}

const PURPOSE_TOPIC_MAP: Record<
  'Career Advice' | 'Referral Inquiry' | 'Higher Study Guidance' | 'Networking',
  MentorshipTopic
> = {
  'Career Advice': 'Career Guidance',
  'Referral Inquiry': 'Interview Prep',
  'Higher Study Guidance': 'Higher Studies',
  Networking: 'Skill Roadmap',
};

export const ConnectRequestModal: React.FC<ConnectRequestModalProps> = ({
  isOpen,
  onClose,
  alumnus,
}) => {
  const { currentUser, requestMentorship } = useApp();
  const [purpose, setPurpose] = useState<
    'Career Advice' | 'Referral Inquiry' | 'Higher Study Guidance' | 'Networking'
  >('Career Advice');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id || submitting) return;
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const res = await requestMentorship({
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentDept: normalizeDepartment((currentUser as any).department),
        studentBatch: (currentUser as any).batch || '',
        studentAvatar: currentUser.avatar || '',
        alumniId: alumnus.id,
        alumniName: alumnus.name,
        alumniCompany: alumnus.company || 'BAUST Network',
        topic: PURPOSE_TOPIC_MAP[purpose],
        note: `[${purpose}] ${
          note.trim() ||
          `Assalamu Alaikum, I would like to connect with you regarding ${purpose.toLowerCase()}.`
        }`,
        preferredDate: 'Flexible',
        preferredTime: 'To be scheduled',
      });
      if (!res.success) {
        setErrorMsg(res.error || 'Could not send mentorship/connection request.');
        return;
      }
      setIsSuccess(true);
      setNote('');
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/60">
          <div className="flex items-center gap-2 text-emerald-900">
            <UserPlus className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-sm">Send Connection / Mentorship Request</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600 animate-bounce" />
            <h4 className="font-bold text-slate-800 text-base">Request Sent!</h4>
            <p className="text-xs text-slate-500">
              Your request has been saved and sent to {alumnus.name}. They will receive an instant notification in their alumni portal.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <img
                src={alumnus.avatar}
                alt={alumnus.name}
                className="w-10 h-10 rounded-xl object-cover border border-slate-200"
              />
              <div className="text-xs">
                <div className="font-bold text-slate-900">{alumnus.name}</div>
                <div className="text-slate-500">
                  {alumnus.designation} at {alumnus.company}
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Purpose of Connection
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as any)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-navy"
              >
                <option value="Career Advice">Career Advice & Guidance</option>
                <option value="Referral Inquiry">Internal Referral Inquiry</option>
                <option value="Higher Study Guidance">Higher Study & Scholarship Prep</option>
                <option value="Networking">General Professional Networking</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Personalized Note
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Briefly introduce yourself (Batch, Dept) and mention why you want to connect..."
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-hidden focus:ring-2 focus:ring-navy"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="text-xs px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="text-xs px-4 py-2 rounded-xl bg-[#2E5E3E] text-white font-bold hover:bg-[#234930] transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-60"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
