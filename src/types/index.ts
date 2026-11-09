/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'student' | 'alumni' | 'admin';

export type JobSector = 'Government' | 'Private' | 'Abroad' | 'Research' | 'Business';

export type Department = 'CSE' | 'EEE' | 'CE' | 'ME' | 'IPE' | 'Textile' | 'BBA' | 'English';

export type MentorshipTopic = 
  | 'CV Review' 
  | 'Interview Prep' 
  | 'Higher Studies' 
  | 'Career Guidance' 
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
  isVerified?: boolean;
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
  careerGoal: string;
  cvUrl?: string;
  cvFileName?: string;
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
  alumniCompany: string;
  topic: MentorshipTopic;
  note: string;
  preferredDate: string;
  preferredTime: string;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Completed';
  meetingLink?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  createdAt: string;
  feedback?: string;
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
  documentType: 'Transcript' | 'Provisional Certificate' | 'Original Certificate' | 'Testimonial' | 'Medium of Instruction (MOI)' | 'Character Certificate';
  copies: number;
  purpose: 'Higher Studies Abroad' | 'Government Job' | 'Private Job Application' | 'Immigration' | 'Personal Record';
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
  role: 'student' | 'alumni';
  baustId: string;
  department: Department;
  batch: string;
  passingYear?: number;
  submittedAt: string;
  documentType: string;
  documentPreviewUrl: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  accountStatus?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  attachment?: {
    name: string;
    size: string;
    type: 'pdf' | 'doc' | 'image';
    url: string;
  };
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  participantRole: UserRole;
  participantTitle: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  category: 'Notice' | 'Event' | 'Career Fair' | 'Webinar';
  targetAudience: 'All' | 'Students' | 'Alumni';
  content: string;
  author: string;
  date: string;
  pinned: boolean;
  linkText?: string;
  linkUrl?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'mentorship' | 'service' | 'chat' | 'announcement';
  link?: string;
}

export type Language = 'en' | 'bn';
