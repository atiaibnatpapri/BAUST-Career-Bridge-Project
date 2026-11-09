/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CVReviewItem } from '../../types/mentorship';
import { useMentorshipStore } from '../../hooks/useMentorshipStore';
import { 
  FileText, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Heart, 
  TrendingUp, 
  Sparkles,
  MessageSquareQuote
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface CVReviewResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: CVReviewItem | null;
}

export const CVReviewResultModal: React.FC<CVReviewResultModalProps> = ({
  isOpen,
  onClose,
  review,
}) => {
  const { sendCVThanks, cvReviews } = useMentorshipStore();
  const [thanking, setThanking] = useState(false);

  if (!review) return null;

  // Comparison data if there are previous versions
  const allStudentReviews = cvReviews
    .filter((r) => r.studentId === review.studentId && r.status === 'REVIEWED')
    .sort((a, b) => (a.version > b.version ? 1 : -1));

  const chartData = allStudentReviews.length > 0
    ? allStudentReviews.map((r) => ({
        version: r.version.toUpperCase(),
        score: r.overallScore || 0,
      }))
    : [{ version: review.version.toUpperCase(), score: review.overallScore || 75 }];

  const handleSendThanks = () => {
    setThanking(true);
    setTimeout(() => {
      sendCVThanks(review.id);
      setThanking(false);
    }, 300);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'text-sky-700 bg-sky-50 border-sky-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Alumni CV Evaluation & Score Report"
      maxWidth="2xl"
    >
      <div className="space-y-6 text-left">
        {/* Top Header Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0F2A4A] to-[#1E3A5F] text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#C9A227] text-slate-900 uppercase">
                {review.version.toUpperCase()} Review
              </span>
              <span className="text-xs text-white/80">Reviewed on {review.reviewedAt || 'Recently'}</span>
            </div>
            <h3 className="text-lg font-bold text-white">{review.targetRole}</h3>
            <p className="text-xs text-white/85">
              Reviewer: <span className="font-semibold">{review.mentorName}</span> • {review.mentorCompany}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20 self-start md:self-auto">
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold text-white/70">Overall Score</p>
              <div className="text-3xl font-black text-[#C9A227]">{review.overallScore ?? 84}<span className="text-sm font-semibold text-white/60">/100</span></div>
            </div>
            <div className="w-[1px] h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold text-white/70">Rating</p>
              <div className="text-2xl font-bold text-white flex items-center justify-center gap-1">
                ⭐ {review.overallRating ?? 4.2}
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 text-slate-600">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Document: <strong className="text-slate-800">{review.cvFileName}</strong> ({review.cvFileSize})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert(`Simulated download of ${review.cvFileName} with mentor markup highlights.`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Download Annotated PDF
            </button>

            <Button
              variant={review.thanksSent ? 'outline' : 'primary'}
              size="sm"
              onClick={handleSendThanks}
              disabled={review.thanksSent || thanking}
            >
              <Heart className={`w-3.5 h-3.5 mr-1 ${review.thanksSent ? 'text-rose-500 fill-rose-500' : ''}`} />
              {review.thanksSent ? 'Appreciation Sent!' : thanking ? 'Sending...' : 'Send Mentor Thank You'}
            </Button>
          </div>
        </div>

        {/* Mentor Executive Summary */}
        {review.mentorSummary && (
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-950 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
              <MessageSquareQuote className="w-4 h-4 text-amber-700" />
              Mentor Executive Assessment
            </div>
            <p className="text-xs leading-relaxed text-amber-900 font-medium">
              "{review.mentorSummary}"
            </p>
          </div>
        )}

        {/* Category Breakdown & Progress Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Category Scores */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#0F2A4A]" />
              Detailed Rubric Breakdown
            </h4>

            <div className="space-y-3">
              {(review.categoryScores || [
                { name: 'Formatting & Layout', score: 88, maxScore: 100, feedback: 'Clean typography, good use of white space.' },
                { name: 'Content & Impact Metrics', score: 76, maxScore: 100, feedback: 'Add quantified results (e.g. % speedup, users).' },
                { name: 'Technical Skills Relevance', score: 85, maxScore: 100, feedback: 'Well grouped, aligned with Dhaka market.' },
                { name: 'Project Quality & Depth', score: 82, maxScore: 100, feedback: 'GitHub links work, mention architecture.' },
                { name: 'Grammar & Clarity', score: 92, maxScore: 100, feedback: 'Error free, strong action verbs.' },
                { name: 'ATS Friendliness', score: 80, maxScore: 100, feedback: 'Single column, readable header hierarchy.' },
              ]).map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>{cat.name}</span>
                    <span className="font-bold text-[#0F2A4A]">{cat.score} / {cat.maxScore}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        cat.score >= 85 ? 'bg-emerald-600' : cat.score >= 70 ? 'bg-[#0F2A4A]' : 'bg-amber-500'
                      }`}
                      style={{ width: `${(cat.score / cat.maxScore) * 100}%` }}
                    />
                  </div>
                  {cat.feedback && (
                    <p className="text-[11px] text-slate-500 italic">{cat.feedback}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Version Score Progression Chart */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#2E5E3E]" />
                Version-over-Version Improvement
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Score trajectory across iterations as evaluated by BAUST alumni.
              </p>
            </div>

            <div className="h-44 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="version" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any) => [`${val} / 100`, 'Score']}
                    contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Bar dataKey="score" fill="#0F2A4A" radius={[6, 6, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C9A227] shrink-0" />
              <span>
                Tip: Implement the revision points below and submit <strong>v{parseInt(review.version.replace('v', '') || '1') + 1}</strong> to target 90+ score!
              </span>
            </div>
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Key Strengths */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
            <h5 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              What Stands Out (Strengths)
            </h5>
            <ul className="space-y-1.5 text-xs text-emerald-950 font-medium">
              {(review.strengths || [
                'Strong academic grounding from BAUST with clear CGPA representation.',
                'Good selection of modern tech stack (React, Node, PostgreSQL, Docker).',
                'Clean single-column structure that parses effortlessly in ATS scanners.',
              ]).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actionable Improvements */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
            <h5 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Priority Revisions Needed
            </h5>
            <ul className="space-y-1.5 text-xs text-amber-950 font-medium">
              {(review.areasToImprove || [
                'Quantify project outcomes: "improved query latency by 40%" instead of "made queries faster".',
                'Move GitHub and live deployment links directly under each project title.',
                'Shorten summary statement to 3 lines max highlighting your core backend strengths.',
              ]).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section-by-Section Comments */}
        {review.sectionComments && review.sectionComments.length > 0 && (
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Section-by-Section Detailed Remarks
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {review.sectionComments.map((sec, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="font-bold text-[#0F2A4A] inline-block mb-1">
                    [{sec.section}]
                  </span>
                  <p className="text-slate-600 leading-snug">{sec.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="primary" onClick={onClose}>
            Done Reviewing
          </Button>
        </div>
      </div>
    </Modal>
  );
};
