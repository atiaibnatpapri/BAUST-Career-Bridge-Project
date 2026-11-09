/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Briefcase, X, Upload, CheckCircle2, FileText, Send } from 'lucide-react';
import { VacancyItem } from '../../types/admindesk';
import { useAdminDeskStore } from '../../hooks/useAdminDeskStore';
import { useApp } from '../../context/AppContext';

interface VacancyApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacancy: VacancyItem | null;
  onSuccess?: () => void;
}

export const VacancyApplyModal: React.FC<VacancyApplyModalProps> = ({
  isOpen,
  onClose,
  vacancy,
  onSuccess
}) => {
  const { submitVacancyApplication } = useAdminDeskStore();
  const { currentUser } = useApp();

  const [experience, setExperience] = useState('5+ years full-stack and systems engineering at Brain Station 23 and BJIT.');
  const [coverLetter, setCoverLetter] = useState('I am honored to apply for this academic faculty position at my alma mater BAUST. I aim to contribute modern engineering practices and mentor undergraduate scholars.');
  const [cvFileName, setCvFileName] = useState('Farhan_Kabir_Academic_CV_2026.pdf');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !vacancy) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitVacancyApplication({
      vacancyId: vacancy.id,
      vacancyTitle: vacancy.title,
      alumniId: currentUser.id,
      alumniName: currentUser.name,
      alumniEmail: currentUser.email,
      alumniPhone: (currentUser as any).phone || '+880 1712-345678',
      alumniAvatar: currentUser.avatar,
      department: (currentUser as any).department || 'CSE',
      batch: (currentUser as any).batch || '4th Batch',
      cgpa: (currentUser as any).cgpa || 3.88,
      experience,
      cvFileName,
      coverLetter
    });
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      if (onSuccess) onSuccess();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-navy" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">Apply for University Vacancy</h3>
              <p className="text-[11px] text-slate-500 truncate max-w-xs">{vacancy.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600 animate-bounce" />
            <h4 className="font-bold text-slate-800 text-base">Application Submitted!</h4>
            <p className="text-xs text-slate-500">
              Your application has been received by the University Recruitment Board. You can track status under the "My Applications" tab.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            {/* Auto-filled Profile Card */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-slate-600 grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Applicant</span>
                <div className="font-bold text-slate-900">{currentUser.name}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Department & Batch</span>
                <div className="font-bold text-slate-900">{(currentUser as any).department || 'CSE'} ({(currentUser as any).batch || '4th Batch'})</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Graduation CGPA</span>
                <div className="font-bold text-amber-900">{(currentUser as any).cgpa?.toFixed(2) || '3.88'} / 4.00</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Required CGPA</span>
                <div className="font-semibold text-slate-700">Min. {vacancy.cgpaRequirement.toFixed(2)}</div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Relevant Professional & Teaching Experience
              </label>
              <textarea
                rows={2}
                required
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Mention industry work, publications, teaching or mentorship..."
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-navy"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Statement of Interest / Cover Note
              </label>
              <textarea
                rows={3}
                required
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Why do you wish to join BAUST as faculty/staff?"
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-navy"
              />
            </div>

            {/* Attached CV */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Curriculum Vitae (CV / Resume)
              </label>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-navy" />
                  <span className="font-bold text-slate-800">{cvFileName}</span>
                </div>
                <label className="text-[11px] font-bold text-navy hover:underline cursor-pointer">
                  Change File
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setCvFileName(e.target.files[0].name);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-navy text-white font-bold hover:bg-[#0b1f36] transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Application
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
