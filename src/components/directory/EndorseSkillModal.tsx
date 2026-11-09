/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Award, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { DirectoryAlumniProfile } from '../../types/directory';
import { useDirectoryStore } from '../../hooks/useDirectoryStore';

interface EndorseSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  alumnus: DirectoryAlumniProfile;
}

export const EndorseSkillModal: React.FC<EndorseSkillModalProps> = ({
  isOpen,
  onClose,
  alumnus
}) => {
  const { endorseSkill } = useDirectoryStore();
  const [selectedSkill, setSelectedSkill] = useState(
    alumnus.skillsWithLevels?.[0]?.name || alumnus.skills[0] || 'React'
  );
  const [comment, setComment] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleEndorse = (e: React.FormEvent) => {
    e.preventDefault();
    endorseSkill(alumnus.id, selectedSkill, {
      studentId: 'stu-current',
      studentName: 'Tanvir Hossain Fahim',
      studentDept: 'CSE',
      comment: comment.trim() || undefined
    });
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/60">
          <div className="flex items-center gap-2 text-amber-900">
            <Award className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-sm">Endorse Alumni Skill</h3>
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
            <h4 className="font-bold text-slate-800 text-base">Endorsement Recorded!</h4>
            <p className="text-xs text-slate-500">
              Thank you for validating {alumnus.name}'s expertise in {selectedSkill}. Your endorsement is now visible on their public profile.
            </p>
          </div>
        ) : (
          <form onSubmit={handleEndorse} className="p-5 space-y-4">
            <p className="text-xs text-slate-600">
              As a BAUST student, you can endorse verified alumni for skills you have witnessed through mentoring, seminars, or projects.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Skill to Endorse
              </label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-navy"
              >
                {alumnus.skillsWithLevels?.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.level})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Recommendation / Context Note (Optional)
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g. Brother Farhan helped review my backend microservice design during our mock interview session..."
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
                className="text-xs px-4 py-2 rounded-xl bg-navy text-white font-bold hover:bg-[#0b1f36] transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Submit Endorsement
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
