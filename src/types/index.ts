/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'student' | 'alumni' | 'admin' | 'superAdmin';

export type JobSector =
  | 'Government'
  | 'Private'
  | 'MNC'
  | 'Abroad'
  | 'Higher Studies / Abroad'
  | 'Research'
  | 'Business';

export type Department = 'CSE' | 'EEE' | 'CE' | 'ME' | 'IPE' | 'DBA' | 'AIS' | 'English' | 'Textile' | 'BBA';

export type MentorshipTopic =
  | 'CV Review'
  | 'Interview Prep'
  | 'Higher Studies'
  | 'Career Guidance'
  | 'Project/Thesis Help'
  | 'Skill Roadmap'
  | 'Government / BCS'
  | 'Research & Publication';

export type RequestStatus = 'Pending' | 'Under Review' | 'Approved' | 'Ready' | 'Delivered' | 'Rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: Department;
  batch: string;
  phone?: string;
  bio?: string;
  office?: string;
  employeeId?: string;
  designation?: string;
  isVerified?: boolean;
  verifiedAlumniBadge?: boolean;
  isFeatured?: boolean;
  isDemo?: boolean;
  suspended?: boolean;
  hidePhone?: boolean;
  hideEmail?: boolean;
  profileVisibility?: 'public' | 'students_only' | 'private';
  verificationProofUrl?: string;
  accountStatus?: 'pending' | 'approved' | 'rejected';
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface AlumniProfile extends User {
  role: 'alumni';
  designation: string;
  company: string;
  sector: JobSector;
  location: string;
  passingYear: number;
  linkedin?: string;
  github?: string;
  skills: string[];
  mentoringAvailable: boolean;
  mentorshipTopics: MentorshipTopic[];
  availableSlots: string[];
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
  totalMentees: number;
  rating: number;
}

export interface StudentProfile extends User {
  role: 'student';
  studentId: string;
  currentSemester: string;
  cgpa: number;
  interests: string[];
  skills?: string[];
  passingYear?: number;
  careerGoal: string;
  cvUrl?: string;
  cvFileName?: string;
}

export interface StatusHistoryEntry {
  status: string;
  at: string;
  by: string;
  note?: string;
}

export interface MentorshipRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentDept: Department;
  studentBatch: string;
  studentAvatar: string;
  alumniId: string;
  alumniName: string;
  mentorId?: string;
  mentorName?: string;
  alumniCompany: string;
  topic: MentorshipTopic;
  note: string;
  message?: string;
  preferredDate: string;
  preferredTime: string;
  status: 'Pending' | 'Accepted' | 'Declined' | 'On Hold' | 'Completed' | 'Cancelled';
  meetingLink?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  createdAt: string;
  updatedAt?: string;
  feedback?: string;
  statusHistory?: StatusHistoryEntry[];
}

export interface ServiceRequest {
  id: string;
  alumniId: string;
  alumniName: string;
  alumniEmail: string;
  alumniPhone: string;
  baustId: string;
  department: Department;
  passingYear: number;
  documentType:
    | 'Transcript'
    | 'Provisional Certificate'
    | 'Original Certificate'
    | 'Testimonial'
    | 'Medium of Instruction (MOI)'
    | 'Character Certificate';
  copies: number;
  purpose:
    | 'Higher Studies Abroad'
    | 'Government Job'
    | 'Private Job Application'
    | 'Immigration'
    | 'Personal Record';
  deliveryMethod: 'Courier (Home Delivery)' | 'On-Campus Collection (BAUST Saidpur)';
  deliveryAddress?: string;
  paymentMethod: 'bKash' | 'Nagad' | 'Bank Transfer';
  transactionId: string;
  amount: number;
  status: RequestStatus;
  timeline: {
    step: string;
    timestamp: string;
    completed: boolean;
    remarks?: string;
  }[];
  submittedAt: string;
  estimatedDelivery: string;
  adminRemarks?: string;
  trackingNumber?: string;
}

export interface VerificationItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'student' | 'alumni' | 'admin';
  baustId: string;
  department: Department;
  batch: string;
  passingYear?: number;
  office?: string;
  company?: string;
  designation?: string;
  details?: Record<string, any>;
  submittedAt: string;
  documentType: string;
  documentPreviewUrl: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  accountStatus?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  reason?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  isDemo?: boolean;
}

export type ConversationSource = 'mentorship' | 'directory' | 'job';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  createdAt?: any;
  type?: 'text';
  readBy?: string[];
  optimistic?: boolean;
  failed?: boolean;
  attachment?: {
    name: string;
    size: string;
    type: 'pdf' | 'doc' | 'image';
    url: string;
  };
}

export interface ConversationParticipantMeta {
  name: string;
  role: UserRole;
  photoURL?: string;
  title?: string;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantIds?: string[];
  participants?: Record<string, ConversationParticipantMeta>;
  participantName: string;
  participantAvatar: string;
  participantRole: UserRole;
  participantTitle: string;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageAt?: any;
  lastSenderId?: string;
  unreadCount: number;
  unreadCountMap?: Record<string, number>;
  source?: ConversationSource;
  createdAt?: any;
  isOnline: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  category: 'Notice' | 'Event' | 'Career Fair' | 'Webinar';
  targetAudience: 'All' | 'Students' | 'Alumni';
  content: string;
  author: string;
  authorId?: string;
  date: string;
  pinned: boolean;
  linkText?: string;
  linkUrl?: string;
  isDemo?: boolean;
}

export interface Notification {
  id: string;
  recipientId?: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'mentorship' | 'service' | 'chat' | 'announcement' | 'verification' | 'job' | 'session' | 'report';
  link?: string;
  itemId?: string;
  refId?: string;
}

export type Language = 'en' | 'bn';

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-Time' | 'Internship' | 'Part-Time' | 'Referral' | 'Research';
  department: string;
  salaryRange: string;
  deadline: string;
  description: string;
  requirements: string[];
  postedById: string;
  postedByName: string;
  postedByRole: UserRole;
  status: 'Open' | 'Closed';
  isDemo?: boolean;
  createdAt?: any;
  createdAtLabel?: string;
}

export type JobApplicationStatus =
  | 'Applied'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview'
  | 'Accepted'
  | 'Rejected'
  | 'On Hold'
  | 'Withdrawn'
  | 'Job Removed';

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  postedBy?: string;
  postedById?: string;
  postedByName?: string;
  postedByRole?: UserRole;
  studentId: string;
  studentName: string;
  studentEmail: string;
  department: string;
  batch: string;
  cgpa: string;
  cvFileName: string;
  coverNote: string;
  status: JobApplicationStatus;
  statusHistory?: StatusHistoryEntry[];
  isDemo?: boolean;
  createdAt?: any;
  updatedAt?: any;
  createdAtLabel?: string;
}

export interface EventItem {
  id: string;
  title: string;
  category: 'Networking' | 'Workshop' | 'Career Fair' | 'Reunion' | 'Seminar';
  date: string;
  time: string;
  venue: string;
  mode: 'On-Campus' | 'Online' | 'Hybrid';
  description: string;
  organizerId: string;
  organizerName: string;
  organizerRole: UserRole;
  attendeeIds: string[];
  maxSeats: number;
  isDemo?: boolean;
  createdAt?: any;
}

export interface ContributionItem {
  id: string;
  alumniId: string;
  alumniName: string;
  department: string;
  batch: string;
  category: 'Scholarship Fund' | 'Lab Equipment' | 'Career Fair Sponsorship' | 'Student Mentorship Hours';
  amountBdt: number;
  pledgeTitle: string;
  note: string;
  status: 'Pledged' | 'Received' | 'Acknowledged';
  isDemo?: boolean;
  createdAt?: any;
  createdAtLabel?: string;
}

export interface ActivityLogItem {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt?: any;
  createdAtLabel?: string;
}
