import React, { useState } from 'react';
import { X, Briefcase, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { VacancyItem } from '../../types/admindesk';

interface VacancyCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vacancy: Omit<VacancyItem, 'id' | 'publishedAt'> & { id?: string }) => void;
  editingVacancy?: VacancyItem | null;
}

export const VacancyCreateModal: React.FC<VacancyCreateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingVacancy
}) => {
  const [title, setTitle] = useState(editingVacancy?.title || '');
  const [department, setDepartment] = useState(editingVacancy?.department || 'CSE');
  const [type, setType] = useState<VacancyItem['type']>(
    editingVacancy?.type || 'Lecturer'
  );
  const [qualifications, setQualifications] = useState(
    editingVacancy?.qualifications || 'B.Sc. in relevant engineering discipline with minimum CGPA 3.50/4.00'
  );
  const [cgpaRequirement, setCgpaRequirement] = useState<string>(
    editingVacancy?.cgpaRequirement ? String(editingVacancy.cgpaRequirement) : '3.50'
  );
  const [deadline, setDeadline] = useState(editingVacancy?.deadline || '2026-12-15');
  const [numberOfPosts, setNumberOfPosts] = useState<string>(
    editingVacancy?.numberOfPosts ? String(editingVacancy.numberOfPosts) : '2'
  );
  const [salaryRange, setSalaryRange] = useState(
    editingVacancy?.salaryRange || 'National Pay Scale 2015 Grade 9'
  );
  const [description, setDescription] = useState(editingVacancy?.description || '');
  const [howToApply, setHowToApply] = useState(
    editingVacancy?.howToApply || 'Apply online through BAUST Career Bridge with updated CV and credentials.'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !deadline.trim()) return;

    onSave({
      ...(editingVacancy ? { id: editingVacancy.id } : {}),
      title: title.trim(),
      department: department as any,
      type,
      qualifications: qualifications.trim(),
      cgpaRequirement: parseFloat(cgpaRequirement) || 3.0,
      deadline: deadline.trim(),
      numberOfPosts: numberOfPosts ? parseInt(numberOfPosts, 10) : 1,
      salaryRange: salaryRange.trim() || undefined,
      description: description.trim(),
      howToApply: howToApply.trim(),
      status: editingVacancy ? editingVacancy.status : 'Open'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 bg-[#0F2A4A] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-white/10 rounded-xl">
              <Briefcase className="w-5 h-5 text-[#C9A227]" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingVacancy ? 'Edit Career Opening' : 'Post University Vacancy'}
              </h2>
              <p className="text-xs text-white/70">
                Recruit BAUST alumni & qualified talent for faculty and administrative roles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Job Title / Position *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Lecturer in Computer Science & Engineering"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Department *
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] outline-hidden bg-white"
              >
                <option value="CSE">CSE</option>
                <option value="EEE">EEE</option>
                <option value="ME">ME</option>
                <option value="IPE">IPE</option>
                <option value="CE">Civil Engineering</option>
                <option value="BBA">Business Administration</option>
                <option value="English">English</option>
                <option value="Administration">Administration</option>
                <option value="ICT Cell">ICT Cell</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Role Classification
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] outline-hidden bg-white"
              >
                <option value="Lecturer">Lecturer</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Lab Assistant">Lab Assistant</option>
                <option value="Officer">Officer</option>
                <option value="Part-time / Guest Faculty">Part-time / Guest Faculty</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                No. of Posts
              </label>
              <input
                type="number"
                min="1"
                value={numberOfPosts}
                onChange={e => setNumberOfPosts(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Min CGPA Requirement
              </label>
              <input
                type="text"
                value={cgpaRequirement}
                onChange={e => setCgpaRequirement(e.target.value)}
                placeholder="3.50"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Application Deadline *
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Minimum Qualification *
              </label>
              <input
                type="text"
                required
                value={qualifications}
                onChange={e => setQualifications(e.target.value)}
                placeholder="B.Sc. in relevant engineering field"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Salary Scale / Remuneration
              </label>
              <input
                type="text"
                value={salaryRange}
                onChange={e => setSalaryRange(e.target.value)}
                placeholder="National Pay Scale Grade 9"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Role Description *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Outline teaching responsibilities, research expectations, or administrative duties..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-[#0F2A4A] hover:bg-[#1a3d66] rounded-xl flex items-center gap-2 shadow-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              {editingVacancy ? 'Update Vacancy' : 'Publish Job Opening'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
