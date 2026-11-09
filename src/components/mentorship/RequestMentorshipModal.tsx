/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mentor, MentorshipTopic, SessionMode, MentorTimeSlot } from '../../types/mentorship';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { 
  Calendar, 
  Clock, 
  Video, 
  MessageSquare, 
  Phone, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Paperclip
} from 'lucide-react';

import { useMentorshipStore } from '../../hooks/useMentorshipStore';

export interface RequestMentorshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: Mentor | null;
  initialSlot?: MentorTimeSlot;
  onSubmit?: (data: {
    topic: MentorshipTopic;
    goal: string;
    message: string;
    mode: SessionMode;
    slot: MentorTimeSlot;
    attachmentName?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export const RequestMentorshipModal: React.FC<RequestMentorshipModalProps> = ({
  isOpen,
  onClose,
  mentor,
  initialSlot,
  onSubmit,
}) => {
  const store = useMentorshipStore();
  if (!mentor) return null;

  const [step, setStep] = useState<number>(1);
  const [topic, setTopic] = useState<MentorshipTopic>(mentor.mentoringTopics[0] || 'Career Guidance');
  const [goal, setGoal] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [mode, setMode] = useState<SessionMode>('Video Call');
  const [selectedSlotId, setSelectedSlotId] = useState<string>(
    initialSlot?.id || mentor.availableSlots[0]?.id || ''
  );
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const templates: { label: string; text: string; goal: string }[] = [
    {
      label: 'CV & Resume Review',
      goal: 'Audit resume for tech/fintech applications in Bangladesh.',
      text: `Assalamu Alaikum ${mentor.name} bhaiya/apu. I have prepared my updated CV and would like constructive feedback on project impact and ATS optimization before applying.`,
    },
    {
      label: 'Mock Coding / Technical Interview',
      goal: 'Practice live problem solving and technical questions asked at leading companies.',
      text: `Hello ${mentor.name}. I am preparing for software engineering interview rounds and would appreciate practicing DSA and system design questions with you.`,
    },
    {
      label: 'Higher Studies & Scholarships',
      goal: 'Guidance on German/US graduate school admissions and finding university professors.',
      text: `Assalamu Alaikum. I am an undergrad student at BAUST aspiring for graduate research abroad. I would appreciate your advice on GRE/IELTS prep and drafting an SOP.`,
    },
  ];

  const handleApplyTemplate = (tmpl: typeof templates[0]) => {
    setGoal(tmpl.goal);
    setMessage(tmpl.text);
  };

  const selectedSlot = mentor.availableSlots.find((s) => s.id === selectedSlotId) || mentor.availableSlots[0] || {
    id: 'slot-custom',
    day: 'Next Available Weekend',
    time: '08:00 PM BST',
  };

  const handleNext = () => {
    if (step === 1 && (!goal.trim() || !message.trim())) {
      alert('Please provide your session goal and message to the mentor.');
      return;
    }
    setStep(step + 1);
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    let res: { success: boolean; error?: string };
    if (onSubmit) {
      res = await onSubmit({
        topic,
        goal,
        message,
        mode,
        slot: selectedSlot,
        attachmentName: attachmentName || undefined,
      });
    } else {
      res = await store.requestSession({
        mentorId: mentor.id,
        topic,
        goal,
        message,
        mode,
        slot: selectedSlot,
        attachmentName: attachmentName || undefined,
      });
    }
    setIsSubmitting(false);

    if (res.success) {
      setStep(1);
      setGoal('');
      setMessage('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Mentorship Session"
      description={`Connect 1-on-1 with ${mentor.name} (${mentor.designation} at ${mentor.company})`}
      maxWidth="xl"
    >
      <div className="space-y-6">
        
        {/* Mentor summary strip */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <Avatar src={mentor.avatar} name={mentor.name} size="md" isVerified={mentor.isVerified} />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900">{mentor.name}</h4>
            <p className="text-[11px] text-slate-600 truncate">{mentor.designation} at {mentor.company}</p>
            <p className="text-[10px] text-slate-400">{mentor.department} · {mentor.batch} · Replies {mentor.responseTime}</p>
          </div>
          <Badge variant="navy" size="sm">{mentor.sector}</Badge>
        </div>

        {/* Stepper indicator */}
        <div className="flex items-center justify-center gap-3 text-xs font-bold text-slate-600 border-b border-slate-100 pb-3">
          <span className={`px-2.5 py-1 rounded-lg ${step === 1 ? 'bg-[#0F2A4A] text-white' : 'text-slate-400'}`}>
            1. Topic & Goals
          </span>
          <span className="text-slate-300">→</span>
          <span className={`px-2.5 py-1 rounded-lg ${step === 2 ? 'bg-[#0F2A4A] text-white' : 'text-slate-400'}`}>
            2. Mode & Time Slot
          </span>
          <span className="text-slate-300">→</span>
          <span className={`px-2.5 py-1 rounded-lg ${step === 3 ? 'bg-[#0F2A4A] text-white' : 'text-slate-400'}`}>
            3. Review & Submit
          </span>
        </div>

        {/* STEP 1: Topic & Goals */}
        {step === 1 && (
          <div className="space-y-4">
            <Select
              label="Select Mentorship Topic"
              options={[
                { value: 'CV Review', label: 'CV Review & Resume Audit' },
                { value: 'Interview Prep', label: 'Technical & Coding Mock Interview' },
                { value: 'Higher Studies', label: 'Higher Studies (GRE, DAAD, SOP)' },
                { value: 'Career Guidance', label: 'Career Guidance & Industry Roadmap' },
                { value: 'Project/Thesis Help', label: 'Project / Thesis Architecture Advice' },
                { value: 'Skill Roadmap', label: 'Technology Stack & Skill Learning Path' },
                { value: 'Government / BCS', label: 'BCS Preliminary & Written Strategy' },
              ]}
              value={topic}
              onChange={(e) => setTopic(e.target.value as MentorshipTopic)}
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Quick Template Suggestions</label>
                <span className="text-[10px] text-slate-400">Click to autofill</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {templates.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    + {tmpl.label}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Primary Goal in One Line"
              placeholder="e.g. Audit resume for junior software engineer roles..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Message to Mentor</label>
                <span className="text-[10px] text-slate-400">{message.length}/350 chars</span>
              </div>
              <Textarea
                placeholder="Introduce yourself, your current semester, and what specific challenges you are facing..."
                rows={4}
                maxLength={350}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" onClick={handleNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Next: Select Mode & Slot
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Mode & Time Slot */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">Preferred Session Mode</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'Video Call', label: 'Video Call', icon: <Video className="w-4 h-4" />, sub: 'Google Meet' },
                  { id: 'Voice Call', label: 'Voice Call', icon: <Phone className="w-4 h-4" />, sub: 'Direct Audio' },
                  { id: 'Chat', label: 'Chat Only', icon: <MessageSquare className="w-4 h-4" />, sub: 'Async Q&A' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id as SessionMode)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      mode === item.id
                        ? 'border-[#0F2A4A] bg-[#0F2A4A]/5 font-bold text-[#0F2A4A]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.icon}
                    <span className="text-xs">{item.label}</span>
                    <span className="text-[10px] text-slate-400">{item.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Select Mentor's Available Slot
              </label>
              <div className="space-y-2">
                {mentor.availableSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      selectedSlotId === slot.id
                        ? 'border-[#2E5E3E] bg-[#2E5E3E]/5 font-bold text-[#2E5E3E]'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-semibold">{slot.day} at {slot.time}</span>
                    </div>
                    {selectedSlotId === slot.id && <CheckCircle2 className="w-4 h-4 text-[#2E5E3E]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional attachment */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Optional Attachment (CV / Paper / Portfolio)
              </label>
              {attachmentName ? (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>{attachmentName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachmentName('')}
                    className="text-rose-600 hover:underline font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAttachmentName('Tanvir_Ahmed_CSE_CV_v2.pdf')}
                  className="w-full py-2.5 border border-dashed border-slate-300 rounded-xl text-xs text-slate-600 hover:border-slate-400 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Paperclip className="w-4 h-4 text-slate-400" />
                  Attach Existing CV (Tanvir_Ahmed_CSE_CV_v2.pdf)
                </button>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" onClick={handlePrev} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button variant="primary" onClick={handleNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Next: Review Request
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Review & Submit */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Mentor:</span>
                <span className="font-bold text-slate-900">{mentor.name} ({mentor.company})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Topic:</span>
                <span className="font-bold text-[#0F2A4A]">{topic}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Session Mode:</span>
                <span className="font-bold text-slate-900">{mode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Scheduled Slot:</span>
                <span className="font-bold text-[#2E5E3E]">{selectedSlot.day} ({selectedSlot.time})</span>
              </div>
              {attachmentName && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Attachment:</span>
                  <span className="font-mono text-slate-700">{attachmentName}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2">
                <span className="text-slate-500 block mb-1">Your Message:</span>
                <p className="text-slate-800 italic bg-white p-2.5 rounded-lg border border-slate-100">
                  "{message}"
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              * The mentor will receive a notification and can accept or suggest an alternate time slot.
            </p>

            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" onClick={handlePrev} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Confirm & Send Request
              </Button>
            </div>
          </div>
        )}

      </div>
    </Modal>
  );
};
