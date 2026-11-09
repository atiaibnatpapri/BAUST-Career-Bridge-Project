/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { MentorshipTopic } from '../../types';
import { 
  Briefcase, 
  GraduationCap, 
  MapPin, 
  Calendar, 
  MessageSquare, 
  Award, 
  ExternalLink, 
  Linkedin, 
  Github, 
  Mail, 
  Clock, 
  CheckCircle2, 
  ArrowLeft,
  Star
} from 'lucide-react';

export const AlumniProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { alumniList, currentUser, requestMentorship } = useApp();
  const navigate = useNavigate();

  // Find alumni by param or fallback to first
  const alumni = alumniList.find((a) => a.id === id) || alumniList[0];

  // Mentorship Request Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topic, setTopic] = useState<MentorshipTopic>('CV Review');
  const [note, setNote] = useState('');
  const [preferredDate, setPreferredDate] = useState('2026-11-02');
  const [preferredTime, setPreferredTime] = useState('7:00 PM');

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestMentorship({
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentDept: (currentUser as any).department || 'CSE',
      studentBatch: (currentUser as any).batch || '18th Batch',
      studentAvatar: currentUser.avatar,
      alumniId: alumni.id,
      alumniName: alumni.name,
      alumniCompany: alumni.company,
      topic,
      note,
      preferredDate,
      preferredTime,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Back button */}
      <div>
        <Link
          to="/student/directory"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0F2A4A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Alumni Directory
        </Link>
      </div>

      {/* Hero Profile Header Card */}
      <Card className="p-6 sm:p-8 border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Avatar
              src={alumni.avatar}
              name={alumni.name}
              size="xl"
              isVerified={alumni.isVerified}
            />

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#0F2A4A]">{alumni.name}</h1>
                <Badge variant={alumni.sector === 'Government' ? 'army' : 'navy'}>
                  {alumni.sector} Sector
                </Badge>
                {alumni.isVerified && (
                  <span className="text-[11px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    BAUST Verified
                  </span>
                )}
              </div>

              <p className="text-sm font-bold text-[#0F2A4A]">{alumni.designation}</p>
              <p className="text-xs text-slate-600 font-medium">{alumni.company}</p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {alumni.department} · {alumni.batch} (Class of {alumni.passingYear})
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {alumni.location}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {alumni.rating} ({alumni.totalMentees} mentees)
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Button
              variant="primary"
              size="md"
              className="w-full sm:w-auto"
              onClick={() => setIsModalOpen(true)}
              leftIcon={<Calendar className="w-4 h-4" />}
            >
              Request Mentorship
            </Button>
            <Link to={`/chat?user=${alumni.id}`} className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="md"
                className="w-full sm:w-auto"
                leftIcon={<MessageSquare className="w-4 h-4" />}
              >
                Send Message
              </Button>
            </Link>
          </div>
        </div>

        {/* Available Mentorship Slots Bar */}
        {alumni.mentoringAvailable && alumni.availableSlots.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 p-3.5 rounded-xl">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2E5E3E]" />
              <span className="text-xs font-bold text-slate-800">
                Weekly Mentorship Availability:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {alumni.availableSlots.map((slot, sIdx) => (
                <span
                  key={sIdx}
                  className="text-xs font-semibold bg-white border border-slate-200 text-[#0F2A4A] px-2.5 py-1 rounded-lg shadow-2xs"
                >
                  {slot}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Main Grid: Bio, Experience, Education, Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Experience & Education */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* About / Bio */}
          <Card className="p-6 border-slate-200 space-y-3">
            <h3 className="text-base font-bold text-[#0F2A4A]">About</h3>
            <p className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-line">
              {alumni.bio}
            </p>
          </Card>

          {/* Work Experience Timeline */}
          <Card className="p-6 border-slate-200 space-y-5">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#0F2A4A]" />
              <h3 className="text-base font-bold text-[#0F2A4A]">Professional Experience</h3>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {alumni.experienceTimeline.map((exp, idx) => (
                <div key={idx} className="relative space-y-1">
                  <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#0F2A4A] ring-4 ring-white" />
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">{exp.role}</h4>
                    <span className="text-[11px] font-semibold text-slate-500 font-mono">
                      {exp.period}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#2E5E3E]">{exp.company}</p>
                  <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Education */}
          <Card className="p-6 border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#0F2A4A]" />
              <h3 className="text-base font-bold text-[#0F2A4A]">Academic Background</h3>
            </div>

            <div className="space-y-4 divide-y divide-slate-100">
              {alumni.education.map((edu, idx) => (
                <div key={idx} className={`space-y-1 ${idx > 0 ? 'pt-3' : ''}`}>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">{edu.degree}</h4>
                    <span className="text-[11px] text-slate-500">{edu.year}</span>
                  </div>
                  <p className="text-xs text-slate-600">{edu.institution}</p>
                </div>
              ))}
            </div>
          </Card>

        </div>

        {/* Right Col: Skills, Achievements, Socials */}
        <div className="space-y-6">
          
          {/* Mentorship Focus Topics */}
          <Card className="p-6 border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-[#0F2A4A]">Mentorship Specializations</h3>
            <p className="text-xs text-slate-500">Topics open for student 1-on-1 sessions:</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {alumni.mentorshipTopics.map((topicItem, tIdx) => (
                <Badge key={tIdx} variant="navy" size="md">
                  {topicItem}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Technical & Domain Skills */}
          <Card className="p-6 border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-[#0F2A4A]">Skills & Core Competencies</h3>
            <div className="flex flex-wrap gap-1.5">
              {alumni.skills.map((skill, sIdx) => (
                <span
                  key={sIdx}
                  className="text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Card>

          {/* Honors & Achievements */}
          {alumni.achievements.length > 0 && (
            <Card className="p-6 border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#C9A227]" />
                <h3 className="text-sm font-bold text-[#0F2A4A]">Honors & Achievements</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {alumni.achievements.map((ach, aIdx) => (
                  <li key={aIdx} className="flex items-start gap-2">
                    <span className="text-[#C9A227] font-bold">✓</span>
                    <span>{ach}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Connect & Socials */}
          <Card className="p-6 border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-[#0F2A4A]">Professional Links</h3>
            <div className="space-y-2 text-xs">
              {alumni.linkedin && (
                <a
                  href={alumni.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sky-700 hover:underline font-medium"
                >
                  <Linkedin className="w-4 h-4" /> LinkedIn Profile
                </a>
              )}
              {alumni.github && (
                <a
                  href={alumni.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-slate-800 hover:underline font-medium"
                >
                  <Github className="w-4 h-4" /> GitHub Portfolio
                </a>
              )}
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <Mail className="w-4 h-4" /> {alumni.email}
              </div>
            </div>
          </Card>

        </div>

      </div>

      {/* Mentorship Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Request Mentorship with ${alumni.name}`}
        description="Book a dedicated 1-on-1 virtual mentoring session"
      >
        <form onSubmit={handleBookingSubmit} className="space-y-4">
          <Select
            label="Select Mentorship Topic"
            options={[
              { value: 'CV Review', label: 'CV Review & Resume Audit' },
              { value: 'Interview Prep', label: 'Technical / Behavioral Mock Interview' },
              { value: 'Higher Studies', label: 'Higher Studies Abroad (GRE, IELTS, DAAD, SOP)' },
              { value: 'Career Guidance', label: 'General Career & Industry Guidance' },
              { value: 'Government / BCS', label: 'BCS Preliminary & Written Strategy' },
              { value: 'Research & Publication', label: 'Thesis & Research Paper Publishing' },
            ]}
            value={topic}
            onChange={(e) => setTopic(e.target.value as MentorshipTopic)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Preferred Date"
              type="date"
              required
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
            />
            <Input
              label="Preferred Time"
              type="text"
              placeholder="e.g. 7:00 PM BST"
              required
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
            />
          </div>

          <Textarea
            label="What specific topics or questions do you want to cover?"
            placeholder="Introduce yourself, your current semester, and what specific feedback you are hoping to get from this session..."
            rows={4}
            required
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Send Mentorship Request
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
