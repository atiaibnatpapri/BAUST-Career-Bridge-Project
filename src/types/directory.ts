/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Department, JobSector, MentorshipTopic, UserRole } from './index';

export type ExtendedJobSector = JobSector | 'Freelancing' | 'Higher Study';

export type PrivacySetting = 'public' | 'students_only' | 'connections_only' | 'hidden';

export type SkillProficiency = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface SkillItem {
  id: string;
  name: string;
  level: SkillProficiency;
  endorsements: {
    studentId: string;
    studentName: string;
    studentDept: Department;
    date: string;
    comment?: string;
  }[];
}

export interface WorkExperience {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string; // e.g. "2021 - Present"
  isCurrent: boolean;
  description: string;
  technologies?: string[];
}

export interface AcademicRecord {
  id: string;
  degree: string;
  institution: string;
  department: string;
  period: string;
  cgpa?: number;
  thesisTitle?: string;
  thesisSupervisor?: string;
  honors?: string[];
  clubs?: string[];
  scholarships?: string[];
}

export interface PublicationItem {
  id: string;
  title: string;
  conferenceOrJournal: string;
  year: number;
  doiOrUrl?: string;
  field: string;
}

export interface DirectoryAlumniProfile {
  id: string;
  name: string;
  nameBn?: string;
  email: string;
  role: 'alumni';
  avatar: string;
  coverImage?: string;
  department: Department;
  batch: string; // e.g. "4th Batch"
  batchNumber: number; // e.g. 4
  admissionYear: number;
  passingYear: number;
  studentIdMasked: string; // e.g. "160201***"
  phone?: string;
  bio: string;
  bioBn?: string;
  headline: string; // e.g. "Staff Software Engineer at Optimizely | Ex-Grab | BAUST CSE 4th"
  isVerified: boolean;
  verificationBadgeLevel?: 'Gold' | 'Official BAUST' | 'Top Mentor';
  isReverificationPending?: boolean;
  reverificationNotice?: string;
  
  // Employment & Sector
  designation: string;
  company: string;
  sector: ExtendedJobSector;
  location: string;
  country: string;
  city: string;
  
  // Academic & Achievements
  cgpa: number;
  thesisTitle: string;
  thesisSupervisor: string;
  honors: string[];
  clubs: string[];
  scholarships: string[];
  education: AcademicRecord[];
  publications: PublicationItem[];
  
  // Career & Skills
  skillsWithLevels: SkillItem[];
  skills: string[]; // flat list for backwards compatibility
  topExpertise: string[]; // top 3 highlight chips
  experienceTimeline: WorkExperience[];
  certifications: string[];
  interestedFields: string[];
  
  // Mentorship & Availability
  mentoringAvailable: boolean;
  openToReferrals: boolean;
  openToHiring: boolean;
  mentorshipTopics: MentorshipTopic[];
  availableSlots: string[];
  totalMentees: number;
  studentsConsulted: number;
  rating: number;
  reviewCount: number;
  
  // Social & Web Links
  linkedin?: string;
  github?: string;
  portfolio?: string;
  googleScholar?: string;
  
  // Privacy Preferences
  privacy: {
    cgpa: PrivacySetting;
    email: PrivacySetting;
    phone: PrivacySetting;
    location: PrivacySetting;
  };

  // Activity & Directory Stats
  stats: {
    profileViewsThisMonth: number;
    searchAppearances: number;
    bookmarksCount: number;
    endorsementsReceived: number;
    monthlyViewHistory: { month: string; views: number }[];
  };

  // Audit trail
  lastUpdated: string;
  editHistory?: {
    field: string;
    changedAt: string;
    oldValue?: string;
    newValue?: string;
  }[];
}

export interface AlumniConnectionRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentDept: Department;
  studentBatch: string;
  studentAvatar: string;
  alumniId: string;
  note: string;
  purpose: 'Career Advice' | 'Referral Inquiry' | 'Higher Study Guidance' | 'Networking';
  status: 'Pending' | 'Accepted' | 'Declined';
  sentAt: string;
  respondedAt?: string;
}

export interface SavedSearchSet {
  id: string;
  title: string;
  searchTerm: string;
  department: string;
  sector: string;
  batchMin: number;
  batchMax: number;
  cgpaMin: number;
  mentoringOnly: boolean;
  referralsOnly: boolean;
  hiringOnly: boolean;
  createdAt: string;
}

export interface ProfileReportSubmission {
  id: string;
  reportedAlumniId: string;
  reportedAlumniName: string;
  reporterId: string;
  reporterName: string;
  reason: 'Impersonation' | 'Fake Degree / BAUST Claim' | 'Misleading Employment' | 'Spam or Inappropriate' | 'Other';
  details: string;
  submittedAt: string;
  status: 'Pending' | 'Investigated' | 'Resolved';
}
