/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useMentorshipStore } from '../../hooks/useMentorshipStore';
import { Upload, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface RequestCVReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedMentorId?: string;
}

export const RequestCVReviewModal: React.FC<RequestCVReviewModalProps> = ({
  isOpen,
  onClose,
  preselectedMentorId,
}) => {
  const { mentors, requestCVReview } = useMentorshipStore();

  const [selectedMentorId, setSelectedMentorId] = useState<string>(
    preselectedMentorId || mentors[0]?.id || ''
  );
  const [targetRole, setTargetRole] = useState('Junior Software Engineer');
  const [targetSector, setTargetSector] = useState('Private Tech / Multinational');
  const [version, setVersion] = useState<'v1' | 'v2' | 'v3'>('v2');
  const [fileName, setFileName] = useState('Ahmed_Rafid_Resume_2026.pdf');
  const [fileSize, setFileSize] = useState('485 KB');
  const [deadlinePreference, setDeadlinePreference] = useState<
    'Standard (3-5 days)' | 'Urgent (24-48 hours)'
  >('Standard (3-5 days)');
  const [studentNotes, setStudentNotes] = useState(
    'Looking for honest feedback on project impact bullet points, tech stack relevance, and ATS formatting for Dhaka tech firms.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      // TODO: replace with API call: POST /api/cv-reviews
      requestCVReview({
        mentorId: selectedMentorId,
        targetRole,
        targetSector,
        version,
        cvFileName: fileName,
        cvFileSize: fileSize,
        deadlinePreference,
        studentNotes,
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Professional CV / Resume Review"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-left">
        <p className="text-xs text-slate-500">
          Get in-depth scoring, ATS-friendliness evaluation, and actionable bullet-point revisions from BAUST alumni working in your target industry.
        </p>

        {/* Mentor Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Select Alumni Reviewer
          </label>
          <select
            value={selectedMentorId}
            onChange={(e) => setSelectedMentorId(e.target.value)}
            className="w-full text-xs font-medium rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F2A4A]"
            required
          >
            {mentors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.designation} at {m.company} ({m.department}, Batch {m.batch})
              </option>
            ))}
          </select>
        </div>

        {/* Target Role & Sector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <Input
            label="Target Job / Program Title"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Backend Developer, Data Scientist, BCS"
            required
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Target Sector / Category
            </label>
            <select
              value={targetSector}
              onChange={(e) => setTargetSector(e.target.value)}
              className="w-full text-xs font-medium rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F2A4A]"
            >
              <option value="Private Tech / Multinational">Private Tech / Multinational</option>
              <option value="Government / BCS / Bank">Government / BCS / Bank</option>
              <option value="Higher Study Abroad (MSc/PhD)">Higher Study Abroad (MSc/PhD)</option>
              <option value="Research & Academic">Research & Academic</option>
              <option value="Civil / Infrastructure">Civil / Infrastructure</option>
              <option value="Textile & Apparel Management">Textile & Apparel Management</option>
              <option value="Startup / Entrepreneurship">Startup / Entrepreneurship</option>
            </select>
          </div>
        </div>

        {/* Version & Deadline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Resume Version
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['v1', 'v2', 'v3'] as const).map((v) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => setVersion(v)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    version === v
                      ? 'border-[#0F2A4A] bg-[#0F2A4A] text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {v.toUpperCase()} {v === 'v1' ? '(Initial)' : v === 'v2' ? '(Revised)' : '(Final)'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Turnaround Time
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeadlinePreference('Standard (3-5 days)')}
                className={`p-2 text-left rounded-xl border transition-all ${
                  deadlinePreference === 'Standard (3-5 days)'
                    ? 'border-[#2E5E3E] bg-emerald-50/70 text-[#2E5E3E]'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  Standard
                </div>
                <div className="text-[11px] text-slate-500">3-5 business days</div>
              </button>

              <button
                type="button"
                onClick={() => setDeadlinePreference('Urgent (24-48 hours)')}
                className={`p-2 text-left rounded-xl border transition-all ${
                  deadlinePreference === 'Urgent (24-48 hours)'
                    ? 'border-amber-600 bg-amber-50 text-amber-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Fast Track
                </div>
                <div className="text-[11px] text-slate-500">Within 48 hours</div>
              </button>
            </div>
          </div>
        </div>

        {/* Upload Simulation Box */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Attach Document (PDF, DOCX up to 10MB)
          </label>
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  {fileName}
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </p>
                <p className="text-[11px] text-slate-500">Size: {fileSize} • Uploaded via BAUST Student Vault</p>
              </div>
            </div>

            <label className="cursor-pointer px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              Replace File
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    const f = e.target.files[0];
                    setFileName(f.name);
                    setFileSize(`${(f.size / 1024).toFixed(0)} KB`);
                  }
                }}
              />
            </label>
          </div>
        </div>

        {/* Notes for Mentor */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Specific Areas You Want the Mentor to Focus On
          </label>
          <textarea
            value={studentNotes}
            onChange={(e) => setStudentNotes(e.target.value)}
            rows={3}
            placeholder="e.g. Are my GitHub project descriptions strong enough? How can I highlight my BAUST thesis for industry roles?"
            className="w-full text-xs rounded-xl border border-slate-300 p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F2A4A]"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit for Review'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
