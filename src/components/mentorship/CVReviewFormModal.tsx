/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CVReviewItem, CVCategoryScore, SectionComment } from '../../types/mentorship';
import { useMentorshipStore } from '../../hooks/useMentorshipStore';
import { FileText, Sliders, CheckCircle2, AlertTriangle, MessageSquareQuote } from 'lucide-react';

interface CVReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: CVReviewItem | null;
}

export const CVReviewFormModal: React.FC<CVReviewFormModalProps> = ({
  isOpen,
  onClose,
  review,
}) => {
  const { submitCVReview } = useMentorshipStore();

  const [overallScore, setOverallScore] = useState<number>(85);
  const [categories, setCategories] = useState<CVCategoryScore[]>([
    { name: 'Formatting & Layout', score: 88, maxScore: 100, feedback: 'Clean design, font hierarchy is neat.' },
    { name: 'Content & Impact Metrics', score: 80, maxScore: 100, feedback: 'Good start. Add specific percentage improvements.' },
    { name: 'Technical Skills Relevance', score: 85, maxScore: 100, feedback: 'Strong match for current Bangladeshi tech industry.' },
    { name: 'Project Quality & Depth', score: 84, maxScore: 100, feedback: 'Show live URLs and mention backend architecture.' },
    { name: 'Grammar & Clarity', score: 90, maxScore: 100, feedback: 'Pristine language, strong active verbs.' },
    { name: 'ATS Friendliness', score: 82, maxScore: 100, feedback: 'Readable by standard parsers, no tables.' },
  ]);

  const [strength1, setStrength1] = useState('Clear BAUST academic foundation and organized tech skill grouping.');
  const [strength2, setStrength2] = useState('Hands-on project work demonstrates actual full-stack capability.');
  const [strength3, setStrength3] = useState('Consistent formatting and clean typography throughout.');

  const [improve1, setImprove1] = useState('Quantify achievements: mention latency reduction and user counts.');
  const [improve2, setImprove2] = useState('Include active GitHub repo links for thesis and semester projects.');
  const [improve3, setImprove3] = useState('Tailor summary specifically to your primary target role.');

  const [summaryComment, setSummaryComment] = useState('Concise 2-line intro highlighting stack.');
  const [educationComment, setEducationComment] = useState('Mention BAUST relevant coursework: DSA, DBMS, OS.');
  const [skillsComment, setSkillsComment] = useState('Group into Languages, Frameworks, Databases, Tools.');
  const [projectsComment, setProjectsComment] = useState('Use STAR method for 3 core projects.');
  const [experienceComment, setExperienceComment] = useState('Highlight collaborative team achievements.');

  const [mentorSummary, setMentorSummary] = useState(
    'Strong profile with high potential for entry-level tech roles in Dhaka. Following the suggested metric revisions will easily push this into the top tier of candidates.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!review) return null;

  const handleScoreChange = (index: number, newScore: number) => {
    setCategories((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], score: newScore };
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const sectionComments: SectionComment[] = [
      { section: 'Summary', comment: summaryComment },
      { section: 'Education', comment: educationComment },
      { section: 'Skills', comment: skillsComment },
      { section: 'Projects', comment: projectsComment },
      { section: 'Experience', comment: experienceComment },
    ];

    setTimeout(() => {
      submitCVReview({
        reviewId: review.id,
        overallScore,
        categoryScores: categories,
        strengths: [strength1, strength2, strength3].filter(Boolean),
        areasToImprove: [improve1, improve2, improve3].filter(Boolean),
        sectionComments,
        mentorSummary,
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Evaluate CV: ${review.studentName} (${review.version.toUpperCase()})`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-left">
        {/* Student submission brief */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <p className="font-bold text-slate-800">
              {review.studentName} • {review.studentDept} ({review.studentBatch})
            </p>
            <p className="text-slate-500">
              Target: <span className="font-semibold text-[#0F2A4A]">{review.targetRole}</span> ({review.targetSector})
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded bg-slate-200 font-mono text-[11px] text-slate-700">
              {review.cvFileName}
            </span>
            <button
              type="button"
              onClick={() => alert(`Simulated preview of ${review.cvFileName}`)}
              className="text-xs font-semibold text-[#0F2A4A] hover:underline"
            >
              Open File
            </button>
          </div>
        </div>

        {/* Overall Score Slider */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#0F2A4A]/10 to-[#2E5E3E]/10 border border-[#0F2A4A]/20 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Overall Composite Score
            </label>
            <p className="text-[11px] text-slate-500">Benchmark out of 100 against industry standard CVs</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="40"
              max="100"
              value={overallScore}
              onChange={(e) => setOverallScore(Number(e.target.value))}
              className="w-36 accent-[#0F2A4A] cursor-pointer"
            />
            <span className="text-2xl font-black text-[#0F2A4A] w-14 text-right">
              {overallScore}
            </span>
          </div>
        </div>

        {/* Rubric Category Scores */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-[#2E5E3E]" />
            Category Rubric Scoring
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {categories.map((cat, idx) => (
              <div key={cat.name} className="p-3 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>{cat.name}</span>
                  <span className="text-[#0F2A4A]">{cat.score} / 100</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={cat.score}
                  onChange={(e) => handleScoreChange(idx, Number(e.target.value))}
                  className="w-full accent-[#2E5E3E] cursor-pointer"
                />
                <input
                  type="text"
                  value={cat.feedback}
                  onChange={(e) => {
                    const next = [...categories];
                    next[idx].feedback = e.target.value;
                    setCategories(next);
                  }}
                  placeholder="Quick category comment..."
                  className="w-full text-[11px] border border-slate-200 rounded-lg px-2 py-1 text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#0F2A4A]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
            <h5 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Key Strengths (3 Points)
            </h5>
            <input
              type="text"
              value={strength1}
              onChange={(e) => setStrength1(e.target.value)}
              className="w-full text-xs border border-emerald-200 rounded-lg p-2 bg-white text-slate-800"
            />
            <input
              type="text"
              value={strength2}
              onChange={(e) => setStrength2(e.target.value)}
              className="w-full text-xs border border-emerald-200 rounded-lg p-2 bg-white text-slate-800"
            />
            <input
              type="text"
              value={strength3}
              onChange={(e) => setStrength3(e.target.value)}
              className="w-full text-xs border border-emerald-200 rounded-lg p-2 bg-white text-slate-800"
            />
          </div>

          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
            <h5 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Priority Revisions (3 Points)
            </h5>
            <input
              type="text"
              value={improve1}
              onChange={(e) => setImprove1(e.target.value)}
              className="w-full text-xs border border-amber-200 rounded-lg p-2 bg-white text-slate-800"
            />
            <input
              type="text"
              value={improve2}
              onChange={(e) => setImprove2(e.target.value)}
              className="w-full text-xs border border-amber-200 rounded-lg p-2 bg-white text-slate-800"
            />
            <input
              type="text"
              value={improve3}
              onChange={(e) => setImprove3(e.target.value)}
              className="w-full text-xs border border-amber-200 rounded-lg p-2 bg-white text-slate-800"
            />
          </div>
        </div>

        {/* Section Notes */}
        <div className="space-y-2">
          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Section-Specific Quick Comments
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-semibold text-slate-600">[Summary]:</span>
              <input
                type="text"
                value={summaryComment}
                onChange={(e) => setSummaryComment(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-1.5 mt-0.5"
              />
            </div>
            <div>
              <span className="font-semibold text-slate-600">[Education]:</span>
              <input
                type="text"
                value={educationComment}
                onChange={(e) => setEducationComment(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-1.5 mt-0.5"
              />
            </div>
            <div>
              <span className="font-semibold text-slate-600">[Skills]:</span>
              <input
                type="text"
                value={skillsComment}
                onChange={(e) => setSkillsComment(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-1.5 mt-0.5"
              />
            </div>
            <div>
              <span className="font-semibold text-slate-600">[Projects]:</span>
              <input
                type="text"
                value={projectsComment}
                onChange={(e) => setProjectsComment(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-1.5 mt-0.5"
              />
            </div>
          </div>
        </div>

        {/* Executive Feedback */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <MessageSquareQuote className="w-4 h-4 text-[#0F2A4A]" />
            Alumni Executive Note to Student
          </label>
          <textarea
            value={mentorSummary}
            onChange={(e) => setMentorSummary(e.target.value)}
            rows={3}
            className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0F2A4A]"
            required
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Publishing Evaluation...' : 'Publish Evaluation to Student'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
