/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { DirectoryAlumniProfile } from '../../types/directory';
import { useDirectoryStore } from '../../hooks/useDirectoryStore';

interface ReportProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  alumnus: DirectoryAlumniProfile;
}

export const ReportProfileModal: React.FC<ReportProfileModalProps> = ({
  isOpen,
  onClose,
  alumnus
}) => {
  const { submitProfileReport } = useDirectoryStore();
  const [reason, setReason] = useState<'Impersonation' | 'Fake Degree / BAUST Claim' | 'Misleading Employment' | 'Spam or Inappropriate' | 'Other'>('Impersonation');
  const [details, setDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitProfileReport({
      reportedAlumniId: alumnus.id,
      reportedAlumniName: alumnus.name,
      reporterId: 'stu-current',
      reporterName: 'Tanvir Hossain Fahim',
      reason,
      details
    });
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-2 text-rose-800">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-sm">Report Suspicious or Fake Profile</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600 animate-bounce" />
            <h4 className="font-bold text-slate-800 text-base">Report Submitted to BAUST Admin</h4>
            <p className="text-xs text-slate-500">
              Our university verification committee and registrar office will investigate this profile against the official student archives.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              Reporting: <span className="font-bold text-slate-900">{alumnus.name}</span> ({alumnus.department}, {alumnus.batch})
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Primary Reason for Report
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              >
                <option value="Impersonation">Impersonation / Using someone else's identity</option>
                <option value="Fake Degree / BAUST Claim">Fake Degree / Never graduated from BAUST</option>
                <option value="Misleading Employment">Misleading Employment or Company position</option>
                <option value="Spam or Inappropriate">Spam or Inappropriate communications</option>
                <option value="Other">Other integrity violation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Additional Evidence / Remarks (Optional)
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Please describe why this profile looks fraudulent or contradictory..."
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                BAUST Career Bridge enforces strict academic integrity. False or malicious reports can result in disciplinary action.
              </span>
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
                className="text-xs px-4 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors shadow-xs"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
