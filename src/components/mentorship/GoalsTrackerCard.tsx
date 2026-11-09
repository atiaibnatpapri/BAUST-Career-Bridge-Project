/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MentorshipGoal } from '../../types/mentorship';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { Target, Award, Plus, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

import { useMentorshipStore } from '../../hooks/useMentorshipStore';

export interface GoalsTrackerCardProps {
  goals?: MentorshipGoal[];
  onCreateGoal?: (goal: Omit<MentorshipGoal, 'id' | 'linkedSessionIds'>) => void;
  onUpdateProgress?: (goalId: string, progress: number) => void;
  completedSessionsCount?: number;
  reviewedCVCount?: number;
}

export const GoalsTrackerCard: React.FC<GoalsTrackerCardProps> = ({
  goals: propGoals,
  onCreateGoal: propCreateGoal,
  onUpdateProgress: propUpdateProgress,
  completedSessionsCount: propCompletedSessionsCount,
  reviewedCVCount: propReviewedCVCount,
}) => {
  const store = useMentorshipStore();
  const goals = propGoals || store.goals;
  const onCreateGoal = propCreateGoal || store.createGoal;
  const onUpdateProgress = propUpdateProgress || store.updateGoalProgress;
  const completedSessionsCount =
    propCompletedSessionsCount !== undefined
      ? propCompletedSessionsCount
      : store.sessions.filter((s) => s.status === 'COMPLETED').length;
  const reviewedCVCount =
    propReviewedCVCount !== undefined
      ? propReviewedCVCount
      : store.cvReviews.filter((c) => c.status === 'REVIEWED').length;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState('Dec 2026');
  const [category, setCategory] = useState('Tech Job Prep');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreateGoal({
      studentId: 'std-1',
      title,
      targetDate,
      category,
      progressPercentage: 15,
    });
    setIsModalOpen(false);
    setTitle('');
  };

  const badges = [
    {
      title: 'First Session',
      desc: 'Completed 1st mentor call',
      achieved: completedSessionsCount >= 1,
      icon: '🌱',
    },
    {
      title: '5 Sessions Club',
      desc: 'Consistent guidance',
      achieved: completedSessionsCount >= 5,
      icon: '🚀',
    },
    {
      title: 'CV Perfected',
      desc: 'CV score above 85%',
      achieved: reviewedCVCount >= 1,
      icon: '🎯',
    },
  ];

  return (
    <Card className="p-5 border-slate-200 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-50 text-[#2E5E3E]">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F2A4A]">My Mentorship Milestones</h3>
            <p className="text-[11px] text-slate-500">Track progress toward your dream career outcome</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Goal
        </Button>
      </div>

      {/* Goal list */}
      <div className="space-y-3">
        {goals.map((goal) => (
          <div key={goal.id} className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 leading-snug">{goal.title}</span>
              <span className="text-[10px] text-slate-500 font-mono">Target: {goal.targetDate}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#2E5E3E] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${goal.progressPercentage}%` }}
                />
              </div>
              <span className="text-xs font-extrabold text-[#0F2A4A] tabular-nums">
                {goal.progressPercentage}%
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
              <span>Category: <strong>{goal.category}</strong></span>
              <button
                onClick={() => onUpdateProgress(goal.id, Math.min(100, goal.progressPercentage + 15))}
                className="text-[#0F2A4A] hover:underline font-bold cursor-pointer"
              >
                + Update Progress
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Student Achievement Badges strip */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          Earned University Milestones
        </span>
        <div className="grid grid-cols-3 gap-2">
          {badges.map((b, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                b.achieved
                  ? 'bg-amber-50/60 border-amber-200 text-slate-800'
                  : 'bg-slate-50 border-slate-200/60 opacity-50'
              }`}
            >
              <span className="text-xl mb-1">{b.icon}</span>
              <span className="text-[11px] font-bold leading-tight">{b.title}</span>
              <span className="text-[9px] text-slate-500 mt-0.5">{b.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Goal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Set New Mentorship Career Goal"
        description="Link future sessions to a measurable career milestone"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Goal Objective"
            placeholder="e.g. Pass 47th BCS Preliminary Exam or Secure AWS Cloud Architect Job"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Category"
              options={[
                { value: 'Tech Job Prep', label: 'Tech & Software Engineering' },
                { value: 'Higher Studies', label: 'Graduate Studies & Scholarships' },
                { value: 'Government / BCS', label: 'BCS / Government Exam' },
                { value: 'Banking / Corporate', label: 'Banking & FMCG Management' },
                { value: 'Freelance & Startup', label: 'Freelancing & Entrepreneurship' },
              ]}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />

            <Input
              label="Target Completion Date"
              placeholder="e.g. Dec 2026"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Career Goal
            </Button>
          </div>
        </form>
      </Modal>

    </Card>
  );
};
