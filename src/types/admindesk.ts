/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Department } from './index';

export type ServiceCategory = 'Academic Documents' | 'Verification' | 'Letters' | 'Certificates' | 'Others';

export type DeliveryMethodType = 
  | 'Campus Pickup' 
  | 'Courier (Home Delivery)' 
  | 'Email Soft Copy / PDF' 
  | 'Direct to Institution';

export type RequestUrgency = 'Normal' | 'Urgent' | 'Express';

export type AdminDeskRequestStatus = 
  | 'Submitted' 
  | 'Payment Verified' 
  | 'Under Review' 
  | 'Action Required' 
  | 'Approved' 
  | 'Processing' 
  | 'Ready' 
  | 'Delivered' 
  | 'Rejected' 
  | 'Cancelled';

export type PaymentMethodType = 'bKash' | 'Nagad' | 'Bank Deposit' | 'Card';

export interface AdminDeskService {
  id: string;
  name: string;
  nameBn: string;
  category: ServiceCategory;
  description: string;
  descriptionBn: string;
  fee: number; // in BDT
  urgentFeeExtra: number;
  expressFeeExtra: number;
  processingDaysNormal: number;
  processingDaysUrgent: number;
  processingDaysExpress: number;
  requiredDocuments: string[];
  deliveryOptions: DeliveryMethodType[];
  perCopyFee: number;
  maxCopies: number;
  icon: string;
  enabled: boolean;
  suggestedFor?: string[]; // e.g. ['Higher Study', 'Foreign Job', 'Immigration']
}

export interface RequestItemServiceDetail {
  serviceId: string;
  serviceName: string;
  copies: number;
  feePerCopy: number;
  purpose: 'Higher Studies Abroad' | 'Government Job' | 'Private Job Application' | 'Immigration' | 'Personal Record' | 'Other';
  urgency: RequestUrgency;
  programInfo?: string;
  teacherName?: string; // For recommendation letter
  verificationRecipient?: {
    name: string;
    organization: string;
    email: string;
    address?: string;
  };
}

export interface UploadedDocItem {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
  uploadedAt: string;
  category: 'ID Card' | 'Application Letter' | 'Payment Slip' | 'GD Copy' | 'Supporting Doc' | 'Other';
}

export interface RequestTimelineStep {
  step: string;
  timestamp: string;
  completed: boolean;
  handledBy?: string;
  remarks?: string;
  isCurrent?: boolean;
}

export interface RequestMessage {
  id: string;
  senderRole: 'alumni' | 'admin';
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface FinalDeliverableDoc {
  documentNumber: string;
  title: string;
  issuedDate: string;
  validUntil?: string;
  qrCodeUrl: string;
  fileUrl: string;
  watermark: string;
  digitalSignature: string;
  signatoryTitle: string;
}

export interface AdminDeskRequest {
  id: string; // Tracking ID e.g., BCB-2026-000123
  alumniId: string;
  alumniName: string;
  alumniEmail: string;
  alumniPhone: string;
  alumniAvatar: string;
  baustId: string;
  department: Department;
  batch: string;
  passingYear: number;
  cgpa: number;
  services: RequestItemServiceDetail[];
  uploadedDocuments: UploadedDocItem[];
  delivery: {
    method: DeliveryMethodType;
    pickupDate?: string;
    pickupTimeSlot?: string;
    courierAddress?: string;
    courierFee?: number;
    recipientEmail?: string;
    institutionAddress?: string;
    courierName?: string;
    courierTrackingNumber?: string;
    expectedDeliveryDate?: string;
  };
  payment: {
    method: PaymentMethodType;
    transactionId: string;
    subtotal: number;
    urgencyFee: number;
    courierFee: number;
    totalAmount: number;
    isVerified: boolean;
    slipUrl?: string;
    paidAt: string;
  };
  status: AdminDeskRequestStatus;
  urgency: RequestUrgency;
  submittedAt: string;
  estimatedDelivery: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  rejectionReason?: 'Invalid documents' | 'Payment not verified' | 'Record mismatch' | 'Duplicate request' | 'Other';
  rejectionMessage?: string;
  actionRequiredReason?: string;
  adminRemarks?: string;
  internalStaffNotes?: string[];
  checklist: {
    baustIdMatches: boolean;
    academicRecordFound: boolean;
    paymentVerified: boolean;
    documentsValid: boolean;
  };
  timeline: RequestTimelineStep[];
  messages: RequestMessage[];
  finalDeliverable?: FinalDeliverableDoc;
  rating?: {
    score: number; // 1-5
    comment: string;
    ratedAt: string;
  };
  issueRaised?: {
    topic: string;
    description: string;
    raisedAt: string;
    resolved: boolean;
    resolutionRemarks?: string;
  };
  auditLog: {
    id: string;
    action: string;
    performedBy: string;
    timestamp: string;
    details: string;
  }[];
}

export interface NoticeItem {
  id: string;
  title: string;
  titleBn?: string;
  content: string;
  category: 'Academic' | 'Alumni Event' | 'Convocation' | 'Job/Recruitment' | 'Policy' | 'Urgent';
  audience: 'All' | 'Alumni' | 'Students' | 'Specific Batch';
  isPinned: boolean;
  isUrgent: boolean;
  publishedAt: string;
  expiryDate?: string;
  eventDate?: string;
  eventLocation?: string;
  rsvpCount?: number;
  userRsvpd?: boolean;
  status: 'Draft' | 'Published' | 'Archived';
  attachments?: { name: string; size: string; url: string }[];
  readCount: number;
  isRead?: boolean;
}

export interface VacancyItem {
  id: string;
  title: string;
  department: Department | 'Administration' | 'ICT Cell';
  type: 'Lecturer' | 'Assistant Professor' | 'Lab Assistant' | 'Officer' | 'Part-time / Guest Faculty';
  qualifications: string;
  cgpaRequirement: number;
  numberOfPosts: number;
  deadline: string;
  salaryRange?: string;
  description: string;
  howToApply: string;
  status: 'Open' | 'Closed';
  publishedAt: string;
  isSaved?: boolean;
}

export interface VacancyApplication {
  id: string;
  vacancyId: string;
  vacancyTitle: string;
  alumniId: string;
  alumniName: string;
  alumniEmail: string;
  alumniPhone: string;
  alumniAvatar: string;
  department: Department;
  batch: string;
  cgpa: number;
  experience: string;
  cvFileName: string;
  coverLetter: string;
  status: 'Applied' | 'Shortlisted' | 'Interview Scheduled' | 'Selected' | 'Not Selected';
  appliedAt: string;
  interviewDetails?: {
    date: string;
    time: string;
    venueOrLink: string;
    instructions: string;
  };
  adminNotes?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Registrar' | 'Exam Controller' | 'Deputy Registrar' | 'Assistant Controller' | 'Administrative Officer' | 'Senior Clerk';
  email: string;
  phone: string;
  avatar: string;
  permissions: {
    canApprove: boolean;
    canReject: boolean;
    canSign: boolean;
    canVerifyPayment: boolean;
    canManageCatalog: boolean;
    canPostNotices: boolean;
  };
}

export interface SupportTicket {
  id: string;
  alumniId: string;
  alumniName: string;
  alumniEmail: string;
  subject: string;
  message: string;
  category: 'Service Request Delay' | 'Payment Issue' | 'Document Correction' | 'Lost Certificate Inquiry' | 'Other';
  priority: 'Normal' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
  reply?: string;
}

export interface AdminDeskSettings {
  officeHours: string;
  workingDays: string;
  supportPhone: string;
  supportEmail: string;
  holidayDates: string[];
  courierFeeInsideDhaka: number;
  courierFeeOutsideDhaka: number;
  internationalCourierFee: number;
  urgentFee: number;
  expressFee: number;
  templates: {
    approved: string;
    rejected: string;
    ready: string;
    actionRequired: string;
  };
}
