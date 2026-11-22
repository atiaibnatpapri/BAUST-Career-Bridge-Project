/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Department, JobSector, UserRole } from '../types';

/**
 * Single Source of Truth for BAUST Career Bridge data domain,
 * validation boundaries, academic standing computation, privacy enforcement,
 * alumni statistics consistency, and percentage rounding (#32, #33, #43, #46, #50).
 */

export const BAUST_DEPARTMENTS: readonly {
  code: Extract<Department, 'CSE' | 'EEE' | 'ME' | 'IPE' | 'DBA' | 'English' | 'CE' | 'AIS'>;
  nameEn: string;
  nameBn: string;
}[] = [
  { code: 'CSE', nameEn: 'Computer Science & Engineering (CSE)', nameBn: 'কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং (CSE)' },
  { code: 'EEE', nameEn: 'Electrical & Electronic Engineering (EEE)', nameBn: 'ইলেকট্রিক্যাল অ্যান্ড ইলেকট্রনিক ইঞ্জিনিয়ারিং (EEE)' },
  { code: 'ME', nameEn: 'Mechanical Engineering (ME)', nameBn: 'মেকানিক্যাল ইঞ্জিনিয়ারিং (ME)' },
  { code: 'IPE', nameEn: 'Industrial & Production Engineering (IPE)', nameBn: 'ইন্ডাস্ট্রিয়াল অ্যান্ড প্রোডাকশন ইঞ্জিনিয়ারিং (IPE)' },
  { code: 'DBA', nameEn: 'Department of Business Administration (DBA)', nameBn: 'ব্যবসায় প্রশাসন বিভাগ (DBA)' },
  { code: 'English', nameEn: 'Department of English', nameBn: 'ইংরেজি বিভাগ (English)' },
  { code: 'CE', nameEn: 'Civil Engineering (CE)', nameBn: 'সিভিল ইঞ্জিনিয়ারিং (CE)' },
  { code: 'AIS', nameEn: 'Accounting & Information Systems (AIS)', nameBn: 'অ্যাকাউন্টিং অ্যান্ড ইনফরমেশন সিস্টেমস (AIS)' },
] as const;

export const ALLOWED_DEPARTMENT_CODES: readonly string[] = BAUST_DEPARTMENTS.map((d) => d.code);

export function normalizeDepartment(dept?: string | null): Department {
  const clean = String(dept || '').trim().toUpperCase();
  if (clean === 'BBA') return 'DBA';
  const match = BAUST_DEPARTMENTS.find((d) => d.code.toUpperCase() === clean);
  if (match) return match.code;
  if (clean === 'TEXTILE') return 'IPE';
  return 'CSE';
}

export const BAUST_SECTORS: readonly JobSector[] = [
  'Government',
  'Private',
  'MNC',
  'Research',
  'Business',
  'Higher Studies / Abroad',
];

export const VERIFICATION_STATUS_VALUES = ['pending', 'approved', 'rejected'] as const;
export const MENTORSHIP_STATUS_VALUES = [
  'Pending',
  'On Hold',
  'Accepted',
  'Declined',
  'Completed',
  'Cancelled',
] as const;
export const JOB_APPLICATION_STATUS_VALUES = [
  'Applied',
  'Under Review',
  'Shortlisted',
  'Interview',
  'Accepted',
  'Rejected',
  'On Hold',
  'Withdrawn',
  'Job Removed',
] as const;
export const DOCUMENT_STATUS_VALUES = [
  'Submitted',
  'Payment Verified',
  'Under Review',
  'Action Required',
  'Approved',
  'Processing',
  'Ready',
  'Delivered',
  'Rejected',
  'Cancelled',
] as const;

export type DocStageKey =
  | 'submitted'
  | 'payment_verified'
  | 'controller_review'
  | 'printing'
  | 'ready'
  | 'delivered';

export type DocStageState = 'done' | 'current' | 'pending' | 'rejected';

export interface DocStageDefinition {
  key: DocStageKey;
  index: number;
  label: string;
  labelBn: string;
  description: string;
  descriptionBn: string;
}

export const DOC_STAGES: readonly DocStageDefinition[] = [
  {
    key: 'submitted',
    index: 0,
    label: 'Submitted',
    labelBn: 'আবেদন জমা',
    description: 'Request received by BAUST Admin Desk',
    descriptionBn: 'বাউস্ট অ্যাডমিন ডেস্কে আবেদন জমা হয়েছে',
  },
  {
    key: 'payment_verified',
    index: 1,
    label: 'Payment Verification',
    labelBn: 'পেমেন্ট যাচাই',
    description: 'Admin verifies transaction receipt and fee payment',
    descriptionBn: 'প্রশাসন পেমেন্ট ও লেনদেন আইডি যাচাই করছে',
  },
  {
    key: 'controller_review',
    index: 2,
    label: 'Controller of Exam Review',
    labelBn: 'পরীক্ষা নিয়ন্ত্রক পর্যালোচনা',
    description: 'Academic transcript/record and departmental clearance check',
    descriptionBn: 'একাডেমিক রেকর্ড ও ক্লিয়ারেন্স পর্যালোচনা',
  },
  {
    key: 'printing',
    index: 3,
    label: 'Printing & Signing',
    labelBn: 'মুদ্রণ ও স্বাক্ষর',
    description: 'Official printing, university seal, and authorized signature',
    descriptionBn: 'নথি মুদ্রণ, সিল ও অনুমোদিত স্বাক্ষর',
  },
  {
    key: 'ready',
    index: 4,
    label: 'Ready for Pickup / Dispatch',
    labelBn: 'সংগ্রহ / প্রেরণের জন্য প্রস্তুত',
    description: 'Prepared for campus counter pickup, courier, or soft copy',
    descriptionBn: 'ক্যাম্পাস সংগ্রহ, কুরিয়ার বা সফট কপির জন্য প্রস্তুত',
  },
  {
    key: 'delivered',
    index: 5,
    label: 'Delivered',
    labelBn: 'সরবরাহ সম্পন্ন',
    description: 'Completed and delivered to requester',
    descriptionBn: 'নথি আবেদনকারীর নিকট সরবরাহ সম্পন্ন হয়েছে',
  },
] as const;

export interface DocumentStageRecord {
  key: DocStageKey;
  label: string;
  status: DocStageState;
  completedAt?: string;
  completedBy?: string;
  completedByName?: string;
  note?: string;
}

export function buildInitialDocumentStages(requesterName: string, nowIso = new Date().toISOString()): DocumentStageRecord[] {
  return DOC_STAGES.map((stage, idx) => {
    if (idx === 0) {
      return {
        key: stage.key,
        label: stage.label,
        status: 'done',
        completedAt: nowIso,
        completedByName: requesterName || 'Requester',
      };
    }
    if (idx === 1) {
      return {
        key: stage.key,
        label: stage.label,
        status: 'current',
      };
    }
    return {
      key: stage.key,
      label: stage.label,
      status: 'pending',
    };
  });
}

export function stageKeyToDisplayStatus(key: DocStageKey | string):
  | 'Submitted'
  | 'Payment Verified'
  | 'Under Review'
  | 'Processing'
  | 'Ready'
  | 'Delivered' {
  switch (key) {
    case 'submitted':
      return 'Submitted';
    case 'payment_verified':
      return 'Payment Verified';
    case 'controller_review':
      return 'Under Review';
    case 'printing':
      return 'Processing';
    case 'ready':
      return 'Ready';
    case 'delivered':
      return 'Delivered';
    default:
      return 'Submitted';
  }
}

export function normalizeStageIndexFromStatus(status?: string, rawIndex?: number): number {
  if (typeof rawIndex === 'number' && rawIndex >= 0 && rawIndex < DOC_STAGES.length) {
    return rawIndex;
  }
  const s = String(status || '').trim().toLowerCase();
  if (s === 'delivered') return 5;
  if (s === 'ready') return 4;
  if (s === 'processing' || s === 'approved' || s === 'printing') return 3;
  if (s === 'under review' || s === 'controller_review' || s === 'action required') return 2;
  // On initial submission ('submitted' / 'pending'), current active step waiting for admin is stage 1 (Payment Verification)
  return 1;
}

export function buildConversationDocId(uidA: string, uidB: string): string {
  const cleanA = String(uidA || '').trim();
  const cleanB = String(uidB || '').trim();
  if (!cleanA || !cleanB) return cleanA || cleanB;
  return [cleanA, cleanB].sort((a, b) => a.localeCompare(b)).join('_');
}

export function buildChatLink(role?: UserRole | string | null, conversationId?: string | null): string {
  const base = role === 'alumni' ? '/alumni/messages' : '/student/messages';
  const cleanId = String(conversationId || '').trim();
  return cleanId ? `${base}/${encodeURIComponent(cleanId)}` : base;
}

/**
 * Validation Constants & Patterns (#32)
 * Keep BAUST ID format in ONE constant so Registration, Login ID lookup,
 * Admin Desk, and Firestore Rules stay 100% consistent.
 */
export const BAUST_ID_PATTERN = /^[A-Za-z0-9\-_]{4,24}$/;
export const BAUST_ID_EXAMPLE = '0802420105101028';
export const ADMIN_STAFF_ID_PATTERN = /^[A-Za-z0-9\-_]{3,24}$/;
export const NAME_PATTERN = /^.{2,80}$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const BD_PHONE_PATTERN = /^(?:\+?880|0)1[3-9]\d{8}$/;
export const FLEX_PHONE_PATTERN = /^\+?\d{7,16}$/;
export const STRONG_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
export const URL_PATTERN = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

export const BATCH_MIN = 1;
export const BATCH_MAX = 40;
export const GRAD_YEAR_MIN = 2015;
export const GRAD_YEAR_MAX = 2035;
export const CGPA_MIN = 0;
export const CGPA_MAX = 4.0;

export function normalizePhoneDigits(phone: string): string {
  return (phone || '').replace(/[\s\-()]/g, '').trim();
}

export function isValidBdPhone(phone: string): boolean {
  const clean = normalizePhoneDigits(phone);
  return BD_PHONE_PATTERN.test(clean) || FLEX_PHONE_PATTERN.test(clean);
}

export function isValidLinkedinUrl(url: string): boolean {
  const clean = (url || '').trim();
  if (!clean) return false;
  if (!URL_PATTERN.test(clean)) return false;
  return clean.toLowerCase().includes('linkedin.com');
}

export function isValidHttpUrl(url: string): boolean {
  return URL_PATTERN.test((url || '').trim());
}

/**
 * Parse batch string ("19th Batch", "Batch 19", "19") into numeric batch number.
 */
export function parseBatchNumber(batch?: string | number | null): number {
  if (typeof batch === 'number' && !Number.isNaN(batch)) {
    return batch;
  }
  const match = String(batch || '').match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

/**
 * Dynamically derives academic semester (Level & Term) and alumni eligibility
 * from registration batch + current date (#46).
 */
export function deriveAcademicStanding(
  batch?: string | number | null,
  passingYear?: number | string | null,
  referenceDate: Date = new Date()
): {
  batchNumber: number;
  levelTerm: string;
  alumniEligible: boolean;
  progressPercent: number;
} {
  const batchNum = parseBatchNumber(batch);
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth() + 1; // 1-12
  const numericPassing = typeof passingYear === 'number'
    ? passingYear
    : parseInt(String(passingYear || ''), 10);

  // If passingYear is available, compute remaining terms backward from expected graduation
  if (!Number.isNaN(numericPassing) && numericPassing >= GRAD_YEAR_MIN) {
    const yearsToGrad = numericPassing - currentYear;
    if (yearsToGrad < 0 || (yearsToGrad === 0 && currentMonth >= 11)) {
      return {
        batchNumber: batchNum,
        levelTerm: 'Graduated / Alumni-Eligible',
        alumniEligible: true,
        progressPercent: 100,
      };
    }
    const yearOfStudy = Math.max(1, Math.min(4, 4 - yearsToGrad));
    const term = currentMonth >= 7 ? 'II' : 'I';
    const progressPercent = Math.min(95, Math.max(12, Math.round(((yearOfStudy - 1) * 2 + (term === 'II' ? 2 : 1)) * 12.5)));
    return {
      batchNumber: batchNum,
      levelTerm: `Level-${yearOfStudy}, Term-${term}`,
      alumniEligible: yearOfStudy === 4 && term === 'II',
      progressPercent,
    };
  }

  // Fallback estimate using BAUST inaugural intake (Batch 1 ≈ 2015, ~2 batches/year)
  if (batchNum > 0) {
    const intakeYear = 2015 + Math.floor((batchNum - 1) / 2);
    const yearsElapsed = Math.max(0, currentYear - intakeYear);
    if (yearsElapsed >= 4) {
      return {
        batchNumber: batchNum,
        levelTerm: 'Graduated / Alumni-Eligible',
        alumniEligible: true,
        progressPercent: 100,
      };
    }
    const level = Math.min(4, Math.max(1, yearsElapsed + 1));
    const term = currentMonth >= 7 ? 'II' : 'I';
    return {
      batchNumber: batchNum,
      levelTerm: `Level-${level}, Term-${term}`,
      alumniEligible: level === 4 && term === 'II',
      progressPercent: Math.min(95, level * 24),
    };
  }

  return {
    batchNumber: 0,
    levelTerm: 'Level-1, Term-I',
    alumniEligible: false,
    progressPercent: 15,
  };
}

/**
 * Largest-Remainder Method for Donut / Pie percentages (#43).
 * Guarantees integer percentages always sum to exact 100% and handles zero-total cleanly.
 */
export interface ChartSliceInput {
  name: string;
  value: number;
  color?: string;
}

export interface ChartSliceWithPct extends ChartSliceInput {
  percentage: number;
}

export function computeLargestRemainderPercentages(items: ChartSliceInput[]): ChartSliceWithPct[] {
  const safeItems = (items || []).filter((i) => Number.isFinite(i.value) && i.value > 0);
  const total = safeItems.reduce((sum, i) => sum + i.value, 0);
  if (total <= 0 || safeItems.length === 0) {
    return [];
  }

  const raw = safeItems.map((item, idx) => {
    const exact = (item.value / total) * 100;
    const floored = Math.floor(exact);
    return {
      idx,
      item,
      floored,
      remainder: exact - floored,
    };
  });

  let remaining = 100 - raw.reduce((s, r) => s + r.floored, 0);
  const sortedByRemainder = [...raw].sort((a, b) => b.remainder - a.remainder);

  for (let i = 0; i < sortedByRemainder.length && remaining > 0; i++) {
    sortedByRemainder[i].floored += 1;
    remaining -= 1;
  }

  return raw
    .sort((a, b) => a.idx - b.idx)
    .map((r) => ({
      ...r.item,
      percentage: r.floored,
    }));
}

/**
 * Single Shared Alumni Consistency & Analytics Helper (#42, #50).
 * Ensures Dashboard KPIs, Directory counts, Featured Alumni, and Admin Reports
 * always use exact matching filters over live Firestore users.
 */
export interface AlumniAggregateStats {
  totalRegisteredAlumni: number;
  verifiedApprovedAlumni: number;
  pendingAlumni: number;
  rejectedAlumni: number;
  suspendedAlumni: number;
  featuredAlumniCount: number;
  availableMentorsCount: number;
  byDepartment: Record<string, number>;
  bySector: Record<string, number>;
  byBatch: Record<string, number>;
}

export function isVerifiedVisibleAlumni(user: Record<string, any> | null | undefined): boolean {
  if (!user) return false;
  return (
    user.role === 'alumni' &&
    user.verificationStatus === 'approved' &&
    user.suspended !== true
  );
}

export function computeAlumniStats(users: Record<string, any>[]): AlumniAggregateStats {
  const safeUsers = Array.isArray(users) ? users : [];
  const allAlumni = safeUsers.filter((u) => u?.role === 'alumni');
  const verifiedApproved = allAlumni.filter((u) => isVerifiedVisibleAlumni(u));

  const byDepartment: Record<string, number> = {};
  const bySector: Record<string, number> = {};
  const byBatch: Record<string, number> = {};

  verifiedApproved.forEach((u) => {
    const dept = normalizeDepartment(u.department);
    byDepartment[dept] = (byDepartment[dept] || 0) + 1;

    const sector = String(u.sector || 'Private').trim() || 'Private';
    bySector[sector] = (bySector[sector] || 0) + 1;

    const batchLabel = String(u.batch || 'Alumni').trim() || 'Alumni';
    byBatch[batchLabel] = (byBatch[batchLabel] || 0) + 1;
  });

  return {
    totalRegisteredAlumni: allAlumni.length,
    verifiedApprovedAlumni: verifiedApproved.length,
    pendingAlumni: allAlumni.filter((u) => (u.verificationStatus || 'pending') === 'pending').length,
    rejectedAlumni: allAlumni.filter((u) => u.verificationStatus === 'rejected').length,
    suspendedAlumni: allAlumni.filter((u) => u.suspended === true).length,
    featuredAlumniCount: verifiedApproved.filter((u) => Boolean(u.isFeatured)).length,
    availableMentorsCount: verifiedApproved.filter((u) => Boolean(u.mentoringAvailable)).length,
    byDepartment,
    bySector,
    byBatch,
  };
}

/**
 * Privacy Projection Helper (FR-07):
 * Enforces `hideEmail`, `hidePhone`, `profileVisibility`, and `privacy.cgpa`
 * whenever a viewer views another user's profile. Admins / Super Admins & the owner
 * still see the full profile; private profiles hide non-essential fields from peers.
 */
export function sanitizeUserForViewer<T extends Record<string, any>>(
  targetUser: T | null | undefined,
  viewerUid?: string | null,
  viewerRole?: UserRole | null
): (T & { _privacyRestricted?: boolean; _hiddenEmail?: boolean; _hiddenPhone?: boolean }) | null {
  if (!targetUser) return null;
  const isOwner = Boolean(viewerUid && (targetUser.uid === viewerUid || targetUser.id === viewerUid));
  const isStaff = viewerRole === 'admin' || viewerRole === 'superAdmin';
  if (isOwner || isStaff) {
    return { ...targetUser, _privacyRestricted: false, _hiddenEmail: false, _hiddenPhone: false };
  }

  const hideEmail = Boolean(targetUser.hideEmail || targetUser.privacy?.email === 'hidden');
  const hidePhone = Boolean(targetUser.hidePhone || targetUser.privacy?.phone === 'hidden');
  const visibility = targetUser.profileVisibility || 'public';
  const hideCgpa = targetUser.privacy?.cgpa === 'hidden';

  if (visibility === 'private') {
    return {
      ...targetUser,
      email: 'Private Profile',
      phone: 'Private',
      bio: 'This user has limited profile visibility to essential academic details.',
      cgpa: 0,
      linkedin: '',
      github: '',
      _privacyRestricted: true,
      _hiddenEmail: true,
      _hiddenPhone: true,
    };
  }

  return {
    ...targetUser,
    email: hideEmail ? 'Hidden by privacy preference' : targetUser.email,
    phone: hidePhone ? 'Hidden by privacy preference' : targetUser.phone,
    cgpa: hideCgpa ? 0 : targetUser.cgpa,
    _privacyRestricted: false,
    _hiddenEmail: hideEmail,
    _hiddenPhone: hidePhone,
  };
}

/**
 * Class Diagram Entities (PART B alignment)
 */
export interface KnowledgeSessionEntity {
  id: string;
  title: string;
  topic: string;
  description: string;
  hostId: string;
  hostName: string;
  hostCompany?: string;
  hostAvatar?: string;
  department?: string;
  date: string;
  time: string;
  durationMinutes: number;
  mode: 'Online' | 'On-Campus' | 'Hybrid';
  meetingLink?: string;
  venue?: string;
  maxSeats: number;
  registeredIds: string[];
  status: 'Scheduled' | 'Live' | 'Completed' | 'Cancelled';
  isDemo?: boolean;
  createdAt?: any;
}

export interface AppointmentSlotEntity {
  id: string;
  alumniId: string;
  alumniName: string;
  alumniCompany?: string;
  alumniAvatar?: string;
  date: string;
  timeSlot: string;
  mode: 'Google Meet' | 'On-Campus' | 'Phone';
  meetingLink?: string;
  topic?: string;
  status: 'available' | 'booked' | 'cancelled' | 'completed';
  bookedByStudentId?: string;
  bookedByStudentName?: string;
  bookedByStudentEmail?: string;
  bookingNote?: string;
  isDemo?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface CVReviewEntity {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentDept?: string;
  studentBatch?: string;
  studentAvatar?: string;
  mentorId: string;
  mentorName: string;
  mentorCompany?: string;
  mentorAvatar?: string;
  targetRole: string;
  targetSector: string;
  cvFileName: string;
  cvUrl?: string;
  studentNotes?: string;
  deadlinePreference?: string;
  status: 'Submitted' | 'In Review' | 'Reviewed';
  score?: number; // 0-100
  rating?: number; // 1-5
  strengths?: string[];
  areasToImprove?: string[];
  mentorFeedback?: string;
  thanksSent?: boolean;
  isDemo?: boolean;
  createdAt?: any;
  reviewedAt?: any;
}

export interface EvaluationEntity {
  id: string;
  studentId: string;
  studentName: string;
  alumniId: string;
  alumniName: string;
  sessionId?: string;
  cvReviewId?: string;
  rating: number; // 1-5
  comment: string;
  tags: string[];
  recommended: boolean;
  createdAt?: any;
}

export interface ReportEntity {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterRole: UserRole;
  targetId: string;
  targetType: 'user' | 'job' | 'session' | 'message';
  targetName: string;
  reason: string;
  details: string;
  status: 'Pending' | 'Reviewed' | 'Action Taken' | 'Dismissed';
  reviewedBy?: string;
  resolutionNote?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface AppNotificationEntity {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: 'mentorship' | 'service' | 'chat' | 'announcement' | 'verification' | 'job' | 'session' | 'report';
  link: string;
  itemId?: string;
  refId?: string;
  read: boolean;
  createdAt?: any;
  timestamp?: string;
}
