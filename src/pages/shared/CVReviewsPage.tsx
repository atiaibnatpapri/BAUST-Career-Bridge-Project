/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useMentorshipStore } from '../../hooks/useMentorshipStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, TextArea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { FileCheck2, Send, Star, CheckCircle2, ThumbsUp, FileText } from 'lucide-react';
import { submitStudentEvaluation } from '../../services/careerBridgeService';

export const CVReviewsPage: React.FC = () => {
  const { addToast, language } = useApp();
  const { firebaseUser, userProfile } = useAuth();
  const { mentors, cvReviews, requestCVReview, submitCVReview, sendCVThanks } = useMentorshipStore();
  const isBn = language === 'bn';
  const isAlumni = userProfile?.role === 'alumni';

  const [requestOpen, setRequestOpen] = useState(false);
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetSector, setTargetSector] = useState('Private');
  const [cvFileName, setCvFileName] = useState('My_BAUST_CV_2026.pdf');
  const [deadlinePreference, setDeadlinePreference] = useState<'Standard (3-5 days)' | 'Urgent (24-48 hours)'>('Standard (3-5 days)');
  const [studentNotes, setStudentNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Alumni Feedback Modal
  const [reviewTargetId, setReviewTargetId] = useState<string | null>(null);
  const [score, setScore] = useState('84');
  const [strengthsText, setStrengthsText] = useState('Clear project metrics, concise layout');
  const [improveText, setImproveText] = useState('Add measurable impact numbers to internship section');
  const [mentorSummary, setMentorSummary] = useState('');

  // Student Evaluation Modal (#41)
  const [evalTarget, setEvalTarget] = useState<{ reviewId: string; alumniId: string; alumniName: string } | null>(null);
  const [evalRating, setEvalRating] = useState(5);
  const [evalComment, setEvalComment] = useState('');

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentorId || !targetRole.trim()) {
      addToast('warning', isBn ? 'তথ্য অসম্পূর্ণ' : 'Required Fields', isBn ? 'অনুগ্রহ করে অ্যালামনাই মেন্টর ও লক্ষ্য পদ নির্বাচন করুন।' : 'Please select an alumni mentor and target role.');
      return;
    }
    setSubmitting(true);
    const ok = await requestCVReview({
      mentorId: selectedMentorId,
      targetRole: targetRole.trim(),
      targetSector,
      version: 'v1',
      cvFileName: cvFileName.trim() || 'Student_CV.pdf',
      cvFileSize: 'PDF',
      deadlinePreference,
      studentNotes: studentNotes.trim(),
    });
    setSubmitting(false);
    if (ok) {
      setRequestOpen(false);
      setTargetRole('');
      setStudentNotes('');
    }
  };

  const handlePublishReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTargetId || !mentorSummary.trim()) return;
    setSubmitting(true);
    await submitCVReview({
      reviewId: reviewTargetId,
      overallScore: Math.min(100, Math.max(0, parseInt(score, 10) || 80)),
      categoryScores: [],
      strengths: strengthsText.split(',').map((s) => s.trim()).filter(Boolean),
      areasToImprove: improveText.split(',').map((s) => s.trim()).filter(Boolean),
      sectionComments: [],
      mentorSummary: mentorSummary.trim(),
    });
    setSubmitting(false);
    setReviewTargetId(null);
    setMentorSummary('');
  };

  const handleSubmitEval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalTarget || !firebaseUser || !userProfile) return;
    setSubmitting(true);
    try {
      await submitStudentEvaluation({
        studentId: firebaseUser.uid,
        studentName: userProfile.name,
        alumniId: evalTarget.alumniId,
        alumniName: evalTarget.alumniName,
        cvReviewId: evalTarget.reviewId,
        rating: evalRating,
        comment: evalComment.trim(),
        tags: ['CV Feedback'],
        recommended: evalRating >= 4,
      });
      sendCVThanks(evalTarget.reviewId);
      addToast('success', isBn ? 'মূল্যায়ন সংরক্ষিত' : 'Evaluation Saved', `${evalRating}/5 rating recorded.`);
      setEvalTarget(null);
      setEvalComment('');
    } catch (err: any) {
      addToast('error', isBn ? 'ত্রুটি' : 'Error', err?.message || 'Unable to submit rating.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
            <FileCheck2 className="w-3.5 h-3.5" />
            {isBn ? 'সিভি পর্যালোচনা ও মূল্যায়ন' : 'FR-16 · CV Reviews & Ratings'}
          </span>
          <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight mt-1">
            {isAlumni
              ? isBn
                ? 'শিক্ষার্থীদের সিভি পর্যালোচনা'
                : 'Student CV Review Inbox'
              : isBn
              ? 'সিভি পর্যালোচনা ও মেন্টর ফিডব্যাক'
              : 'CV Reviews & Mentor Evaluation'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {isBn
              ? 'অভিজ্ঞ অ্যালামনাই মেন্টরদের কাছ থেকে গঠনমূলক সিভি ফিডব্যাক ও স্কোর পান।'
              : 'Request targeted CV feedback from verified BAUST alumni and rate completed reviews.'}
          </p>
        </div>

        {!isAlumni && (
          <Button variant="primary" leftIcon={<Send className="w-4 h-4" />} onClick={() => setRequestOpen(true)}>
            {isBn ? 'সিভি পর্যালোচনার অনুরোধ' : 'Request CV Review'}
          </Button>
        )}
      </div>

      {cvReviews.length === 0 ? (
        <Card className="p-10 text-center space-y-2 border-dashed">
          <FileText className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">
            {isBn ? 'কোনো সিভি পর্যালোচনা অনুরোধ নেই' : 'No CV review requests yet'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cvReviews.map((rev) => (
            <Card key={rev.id} className="p-5 space-y-3 border-slate-200">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900">{rev.targetRole}</h3>
                  <p className="text-xs text-slate-500">
                    {isAlumni ? `${isBn ? 'শিক্ষার্থী:' : 'Student:'} ${rev.studentName}` : `${isBn ? 'মেন্টর:' : 'Mentor:'} ${rev.mentorName}`} · {rev.targetSector}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    rev.status === 'REVIEWED'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {rev.status}
                </span>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <p className="font-semibold text-slate-800">{rev.cvFileName}</p>
                {rev.studentNotes && <p className="text-[11px] text-slate-500 mt-1">{rev.studentNotes}</p>}
              </div>

              {rev.status === 'REVIEWED' && (
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-emerald-900">
                    <span>{isBn ? 'সামগ্রিক স্কোর' : 'Overall CV Score'}</span>
                    <span className="text-sm">{rev.overallScore ?? 85} / 100</span>
                  </div>
                  <p className="text-slate-700">{rev.mentorSummary}</p>
                  {rev.strengths && rev.strengths.length > 0 && (
                    <p className="text-[11px] text-emerald-800">
                      <strong>Strengths:</strong> {rev.strengths.join(', ')}
                    </p>
                  )}
                  {rev.areasToImprove && rev.areasToImprove.length > 0 && (
                    <p className="text-[11px] text-amber-800">
                      <strong>Improve:</strong> {rev.areasToImprove.join(', ')}
                    </p>
                  )}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                {isAlumni && rev.status !== 'REVIEWED' && (
                  <Button size="sm" variant="primary" onClick={() => setReviewTargetId(rev.id)}>
                    {isBn ? 'ফিডব্যাক ও স্কোর দিন' : 'Submit Review Feedback'}
                  </Button>
                )}

                {!isAlumni && rev.status === 'REVIEWED' && !rev.thanksSent && (
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Star className="w-3.5 h-3.5 text-amber-500" />}
                    onClick={() =>
                      setEvalTarget({
                        reviewId: rev.id,
                        alumniId: rev.mentorId,
                        alumniName: rev.mentorName,
                      })
                    }
                  >
                    {isBn ? 'মেন্টরকে রেটিং দিন' : 'Rate & Thank Mentor'}
                  </Button>
                )}

                {rev.thanksSent && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {isBn ? 'ধন্যবাদ পাঠানো হয়েছে' : 'Evaluated & Thanked'}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Request CV Review Modal */}
      <Modal
        isOpen={requestOpen}
        onClose={() => setRequestOpen(false)}
        title={isBn ? 'সিভি পর্যালোচনার অনুরোধ করুন' : 'Request Alumni CV Review'}
      >
        <form onSubmit={handleRequestSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {isBn ? 'অ্যালামনাই মেন্টর নির্বাচন করুন' : 'Select Specific Alumni Mentor'}
            </label>
            <select
              required
              value={selectedMentorId}
              onChange={(e) => setSelectedMentorId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
            >
              <option value="">{isBn ? '-- মেন্টর বাছাই করুন --' : '-- Choose Verified Alumni Mentor --'}</option>
              {mentors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.department} · {m.company})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={isBn ? 'লক্ষ্য পদবি' : 'Target Role'}
              required
              placeholder="e.g. Junior Software Engineer"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />
            <Input
              label={isBn ? 'সেক্টর' : 'Target Sector'}
              value={targetSector}
              onChange={(e) => setTargetSector(e.target.value)}
            />
          </div>
          <Input
            label={isBn ? 'সিভি ফাইলের নাম / ড্রাইভ লিংক' : 'CV File Name or Google Drive Link'}
            required
            value={cvFileName}
            onChange={(e) => setCvFileName(e.target.value)}
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {isBn ? 'সময়ের অগ্রাধিকার' : 'Turnaround Preference'}
            </label>
            <select
              value={deadlinePreference}
              onChange={(e) => setDeadlinePreference(e.target.value as any)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
            >
              <option value="Standard (3-5 days)">Standard (3-5 days)</option>
              <option value="Urgent (24-48 hours)">Urgent (24-48 hours)</option>
            </select>
          </div>
          <TextArea
            label={isBn ? 'অতিরিক্ত নোট' : 'Notes for Mentor'}
            rows={2}
            value={studentNotes}
            onChange={(e) => setStudentNotes(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setRequestOpen(false)}>
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              {isBn ? 'পাঠান' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Alumni Submit Feedback Modal */}
      <Modal
        isOpen={Boolean(reviewTargetId)}
        onClose={() => setReviewTargetId(null)}
        title={isBn ? 'সিভি ফিডব্যাক জমা দিন' : 'Submit CV Evaluation'}
      >
        <form onSubmit={handlePublishReview} className="space-y-4">
          <Input
            label={isBn ? 'স্কোর (০-১০০)' : 'Score (0 - 100)'}
            type="number"
            min={0}
            max={100}
            required
            value={score}
            onChange={(e) => setScore(e.target.value)}
          />
          <Input
            label={isBn ? 'শক্তিশালী দিক (কমা দিয়ে আলাদা)' : 'Key Strengths (comma separated)'}
            value={strengthsText}
            onChange={(e) => setStrengthsText(e.target.value)}
          />
          <Input
            label={isBn ? 'উন্নতির ক্ষেত্র (কমা দিয়ে আলাদা)' : 'Areas to Improve (comma separated)'}
            value={improveText}
            onChange={(e) => setImproveText(e.target.value)}
          />
          <TextArea
            label={isBn ? 'বিস্তারিত মন্তব্য' : 'Mentor Summary & Suggestions'}
            required
            rows={3}
            value={mentorSummary}
            onChange={(e) => setMentorSummary(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setReviewTargetId(null)}>
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
              {isBn ? 'প্রকাশ করুন' : 'Publish Review'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Student 1-5 Rating Modal */}
      <Modal
        isOpen={Boolean(evalTarget)}
        onClose={() => setEvalTarget(null)}
        title={isBn ? 'মেন্টরকে রেটিং দিন' : 'Rate Alumni Mentor Feedback'}
      >
        <form onSubmit={handleSubmitEval} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              {isBn ? 'রেটিং (১ - ৫ স্টার)' : 'Rating (1 - 5 Stars)'}
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setEvalRating(star)}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-amber-50 cursor-pointer"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= evalRating ? 'text-amber-500 fill-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <TextArea
            label={isBn ? 'মন্তব্য' : 'Evaluation Comment'}
            required
            rows={3}
            value={evalComment}
            onChange={(e) => setEvalComment(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setEvalTarget(null)}>
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              {isBn ? 'জমা দিন' : 'Submit Rating'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
