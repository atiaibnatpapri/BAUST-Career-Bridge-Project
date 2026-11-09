/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MentorshipSession } from '../../types/mentorship';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { Star, CheckCircle2, ThumbsUp, ThumbsDown } from 'lucide-react';

import { useMentorshipStore } from '../../hooks/useMentorshipStore';

export interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: MentorshipSession | null;
  onSubmitFeedback?: (
    rating: number,
    review: string,
    tags: string[],
    recommended: boolean
  ) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  session,
  onSubmitFeedback,
}) => {
  const store = useMentorshipStore();
  if (!session) return null;

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Helpful', 'Practical advice']);
  const [recommended, setRecommended] = useState<boolean>(true);

  const availableTags = [
    'Helpful',
    'Knowledgeable',
    'Patient',
    'Practical advice',
    'Great listener',
    'Inspiring',
    'Well prepared',
  ];

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmitFeedback) {
      onSubmitFeedback(rating, review, selectedTags, recommended);
    } else {
      store.completeSession(session.id, rating, review, selectedTags, recommended);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rate & Review Mentorship Session"
      description={`Share your feedback for ${session.mentorName} (${session.mentorCompany})`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Mentor identity */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <Avatar src={session.mentorAvatar} name={session.mentorName} size="md" isVerified />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900">{session.mentorName}</h4>
            <p className="text-[11px] text-slate-500">Topic: {session.topic}</p>
          </div>
        </div>

        {/* 1-5 Star Selection */}
        <div className="text-center space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
            How was your session experience?
          </label>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 text-slate-300 transition-transform hover:scale-110 cursor-pointer"
              >
                <Star
                  className={`w-8 h-8 ${
                    (hoverRating || rating) >= star
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-xs font-bold text-amber-700">
            {rating === 5 ? 'Exceptional Guidance' : rating === 4 ? 'Very Good' : rating === 3 ? 'Helpful' : 'Needs Improvement'}
          </p>
        </div>

        {/* Feedback tags */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">
            What went particularly well? (Select tags)
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0F2A4A] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isSelected && '✓ '}
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Written Review */}
        <Textarea
          label="Written Review & Key Takeaways"
          placeholder="What specific insights or action items did you learn from your mentor? This helps other students find the right guidance..."
          rows={3}
          required
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />

        {/* Would you recommend toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <p className="text-xs font-bold text-slate-900">Would you recommend this mentor to other BAUSTians?</p>
            <p className="text-[11px] text-slate-500">Helps highlight top alumni on the directory</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRecommended(true)}
              className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                recommended ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" /> Yes
            </button>
            <button
              type="button"
              onClick={() => setRecommended(false)}
              className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                !recommended ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" /> No
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
            Submit Feedback & Complete
          </Button>
        </div>

      </form>
    </Modal>
  );
};
