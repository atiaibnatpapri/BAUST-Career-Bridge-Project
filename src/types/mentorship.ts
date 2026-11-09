/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Department, UserRole } from './index';

export type MentorshipSector =
  | 'Government'
  | 'Private'
  | 'Abroad'
  | 'Higher Study'
  | 'Research'
  | 'Business / Entrepreneurship'
  | 'Freelancing';

export type MentorshipTopic =
  | 'CV Review'
  | 'Interview Prep'
  | 'Higher Studies'
  | 'Career Guidance'
  | 'Project/Thesis Help'
  | 'Skill Roadmap'
  | 'Government / BCS'
  | 'Research & Publication';

export type SessionMode = 'Chat' | 'Voice Call' | 'Video Call';

export type MentorshipStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export interface MentorReview {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  studentDept: Department;
  studentBatch: string;
  rating: number; // 1 - 5
  tags: string[]; // e.g. 'Helpful', 'Knowledgeable', 'Patient', 'Practical advice'
  comment: string;
  recommended: boolean;
  date: string;
}

export interface MentorTimeSlot {
  id: string;
  day: string; // e.g. 'Friday, Nov 06'
  time: string; // e.g. '07:30 PM BST'
  isBooked?: boolean;
}

export interface Mentor {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isVerified: boolean;
  department: Department;
  batch: string;
  passingYear: number;
  designation: string;
  company: string; // e.g. 'Brain Station 23' or 'Technical University of Munich'
  sector: MentorshipSector;
  country?: string; // For Abroad / Higher Study (e.g. Germany, USA, Australia)
  program?: string; // For Higher Study (e.g. MSc in Informatics at TU Munich)
  location: string;
  bio: string;
  skills: string[];
  mentoringTopics: MentorshipTopic[];
  availableSlots: MentorTimeSlot[];
  isAvailableNow: boolean;
  rating: number; // e.g. 4.9
  reviewCount: number;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  sessionsCompleted: number;
  studentsMentored: number;
  responseTime: string; // e.g. '< 2 hours', 'Within 24h'
  acceptanceRate: number; // e.g. 94%
  reviews: MentorReview[];
  experienceTimeline: {
    period: string;
    role: string;
    company: string;
    description: string;
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  achievements: string[];
  linkedin?: string;
  github?: string;
}

export interface StatusHistoryLog {
  status: MentorshipStatus;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  note?: string;
}

export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
  addedBy: string;
}

export interface MentorshipSession {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar: string;
  studentDept: Department;
  studentBatch: string;
  mentorId: string;
  mentorName: string;
  mentorAvatar: string;
  mentorDesignation: string;
  mentorCompany: string;
  topic: MentorshipTopic;
  goal: string;
  message: string;
  mode: SessionMode;
  scheduledSlot: MentorTimeSlot;
  attachmentName?: string;
  status: MentorshipStatus;
  statusHistory: StatusHistoryLog[];
  meetingLink?: string;
  sharedNotes: string;
  mentorPrivateNotes?: string;
  actionItems: ActionItem[];
  rejectionReason?: string;
  rejectionSuggestions?: string[];
  studentRating?: number;
  studentReview?: string;
  studentTags?: string[];
  studentRecommended?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CVCategoryScore {
  name: string; // e.g. 'Formatting', 'Content Quality', 'Skills Presentation', 'Projects/Experience', 'Grammar/Language', 'ATS-Friendliness'
  score: number; // 0 - 100 or 1 - 5
  maxScore: number;
  feedback?: string;
}

export interface SectionComment {
  section: 'Summary' | 'Education' | 'Skills' | 'Projects' | 'Experience';
  comment: string;
}

export interface CVReviewItem {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  studentDept: Department;
  studentBatch: string;
  mentorId: string; // or 'any'
  mentorName: string;
  mentorAvatar: string;
  mentorCompany: string;
  targetRole: string;
  targetSector: string;
  version: string; // 'v1', 'v2', etc.
  cvFileName: string;
  cvFileSize: string;
  submittedAt: string;
  deadlinePreference: 'Standard (3-5 days)' | 'Urgent (24-48 hours)';
  status: 'SUBMITTED' | 'IN_REVIEW' | 'REVIEWED';
  overallScore?: number; // 0 - 100
  overallRating?: number; // 1 - 5
  categoryScores?: CVCategoryScore[];
  strengths?: string[];
  areasToImprove?: string[];
  sectionComments?: SectionComment[];
  mentorSummary?: string;
  reviewedAt?: string;
  studentNotes?: string;
  thanksSent?: boolean;
}

export interface MentorshipGoal {
  id: string;
  studentId: string;
  title: string;
  targetDate: string;
  category: string;
  progressPercentage: number;
  linkedSessionIds: string[];
}
