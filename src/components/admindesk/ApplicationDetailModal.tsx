/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  X, 
  GraduationCap, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Send 
} from 'lucide-react';
import { VacancyApplication } from '../../types/admindesk';

interface ApplicationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: VacancyApplication | null;
  onUpdateStatus: (
    appId: string, 
    status: VacancyApplication['status'], 
    interviewDetails?: VacancyApplication['interviewDetails'], 
    adminNotes?: string
  ) => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  isOpen,
  onClose,
  application,
  onUpdateStatus
}) => {
  const [selectedStatus, setSelectedStatus] = useState<VacancyApplication['status']>(
    application?.status || 'Applied'
  );
  const [adminNotes, setAdminNotes] = useState(application?.adminNotes || '');
  const [interviewDate, setInterviewDate] = useState('2026-11-22');
  const [interviewTime, setInterviewTime] = useState('11:00 AM');
  const [venueOrLink, setVenueOrLink] = useState('Conference Room, Academic Building 1 (BAUST Saidpur)');
  const [instructions, setInstructions] = useState('Please bring original transcripts and prepare a 15-minute presentation.');

  if (!isOpen || !application) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const interviewData = selectedStatus === 'Interview Scheduled' ? {
      date: interviewDate,
      time: interviewTime,
      venueOrLink,
      instructions
    } : undefined;

    onUpdateStatus(application.id, selectedStatus, interviewData, adminNotes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <img
              src={application.alumniAvatar}
              alt={application.alumniName}
              className="w-10 h-10 rounded-xl object-cover border border-slate-200"
            />
            <div>
              <h3 className="font-bold text-sm text-slate-900">{application.alumniName}</h3>
              <p className="text-xs text-navy font-semibold">{application.vacancyTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* Academic Snapshot */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Department</span>
              <div className="font-bold text-slate-900">{application.department}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Batch</span>
              <div className="font-bold text-slate-900">{application.batch}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Graduation CGPA</span>
              <div className="font-bold text-amber-900">{application.cgpa.toFixed(2)} / 4.00</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Applied On</span>
              <div className="font-mono text-slate-700">{application.appliedAt}</div>
            </div>
          </div>

          {/* Experience & Cover Letter */}
          <div>
            <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Professional Experience Summary
            </span>
            <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed">
              {application.experience}
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Cover Letter / Statement of Interest
            </span>
            <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed italic">
              "{application.coverLetter}"
            </p>
          </div>

          {/* Attached CV */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-navy" />
              <span className="font-bold text-slate-800">{application.cvFileName}</span>
            </div>
            <button
              type="button"
              onClick={() => alert(`Simulating download of ${application.cvFileName}`)}
              className="text-xs text-navy font-bold hover:underline"
            >
              Download CV
            </button>
          </div>

          {/* Evaluation Status Form */}
          <div className="pt-3 border-t border-slate-200 space-y-3">
            <label className="block font-bold text-slate-900 uppercase tracking-wider">
              Recruitment Decision / Stage
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['Applied', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Not Selected'] as VacancyApplication['status'][]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStatus(st)}
                  className={`p-2 rounded-xl border font-bold text-center transition-all ${
                    selectedStatus === st
                      ? 'bg-navy text-white border-navy shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* If Interview Scheduled: Interview Date, Time & Venue */}
            {selectedStatus === 'Interview Scheduled' && (
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2.5 mt-2">
                <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-700" />
                  Interview Schedule Details
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-indigo-900 uppercase">Date</label>
                    <input
                      type="date"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-indigo-900 uppercase">Time</label>
                    <input
                      type="text"
                      value={interviewTime}
                      onChange={(e) => setInterviewTime(e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-indigo-900 uppercase">Venue or Online Link</label>
                  <input
                    type="text"
                    value={venueOrLink}
                    onChange={(e) => setVenueOrLink(e.target.value)}
                    className="w-full p-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>
            )}

            {/* Admin Notes */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Internal Committee Remarks
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Notes private to university recruitment committee..."
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-navy text-white font-bold hover:bg-[#0b1f36] transition-colors shadow-xs"
            >
              Save Decision & Notify Applicant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
