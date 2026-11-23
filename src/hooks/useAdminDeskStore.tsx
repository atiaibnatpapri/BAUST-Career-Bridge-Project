/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
import { cleanPayload } from '../services/firestoreUtils';
import { useAuth } from '../context/AuthContext';
import {
  AdminDeskService,
  AdminDeskRequest,
  NoticeItem,
  VacancyItem,
  VacancyApplication,
  StaffMember,
  AdminDeskSettings,
  SupportTicket,
  AdminDeskRequestStatus,
  FinalDeliverableDoc,
  DeliveryMethodType,
  RequestUrgency,
  PaymentMethodType,
  AdminDeskDeliveryInfo,
} from '../types/admindesk';
import { Department, StatusHistoryEntry, UserRole } from '../types';
import {
  buildInitialDocumentStages,
  DOC_STAGES,
  DocumentStageRecord,
  normalizeStageIndexFromStatus,
  stageKeyToDisplayStatus,
} from '../constants/baustDataModel';
import { initialServiceCatalog } from '../data/serviceCatalog';
import {
  initialStaffMembers,
  initialAdminDeskSettings,
} from '../data/vacancies';
import { useApp } from '../context/AppContext';
import { getDocumentRequestLink, notify } from '../services/careerBridgeService';
import { subscribeJobs, subscribeJobApplications } from '../services/firestorePortal';

export interface FirestoreDocumentRequest {
  id: string;
  trackingId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  baustId: string;
  department: string;
  type: string;
  serviceId: string;
  copies: number;
  purpose: string;
  urgency: RequestUrgency;
  deliveryMethod: DeliveryMethodType;
  deliveryAddress?: string;
  paymentMethod?: PaymentMethodType;
  transactionId?: string;
  fee: number;
  status: string;
  createdAt: any;
  createdAtLabel: string;
}

interface AdminDeskContextType {
  services: AdminDeskService[];
  requests: AdminDeskRequest[];
  documentRequests: FirestoreDocumentRequest[];
  documentRequestsLoading: boolean;
  notices: NoticeItem[];
  vacancies: VacancyItem[];
  applications: VacancyApplication[];
  staffMembers: StaffMember[];
  settings: AdminDeskSettings;
  supportTickets: SupportTicket[];

  // Request Actions
  submitRequest: (
    newReqData: Omit<
      AdminDeskRequest,
      'id' | 'submittedAt' | 'timeline' | 'status' | 'auditLog' | 'messages' | 'checklist'
    >
  ) => string;
  submitQuickDocumentRequest: (params: {
    type: string;
    serviceId: string;
    copies: number;
    purpose: string;
    urgency: RequestUrgency;
    deliveryMethod: DeliveryMethodType;
    deliveryAddress?: string;
    paymentMethod?: PaymentMethodType;
    transactionId?: string;
    fee: number;
  }) => Promise<{ success: boolean; trackingId?: string; error?: string }>;
  advanceDocumentStage: (
    requestId: string,
    expectedStageIndex: number,
    note?: string,
    deliveryExtras?: AdminDeskDeliveryInfo
  ) => Promise<{ success: boolean; error?: string }>;
  undoLastDocumentStage: (
    requestId: string,
    reason: string
  ) => Promise<{ success: boolean; error?: string }>;
  rejectDocumentRequest: (
    requestId: string,
    reason: AdminDeskRequest['rejectionReason'],
    message: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateDocumentDeliveryInfo: (
    requestId: string,
    info: AdminDeskDeliveryInfo
  ) => Promise<{ success: boolean; error?: string }>;
  updateRequestStatus: (
    requestId: string,
    status: AdminDeskRequestStatus,
    staffName?: string,
    remarks?: string,
    courierDetails?: { courierName?: string; courierTrackingNumber?: string }
  ) => void;
  verifyPayment: (requestId: string, staffName?: string) => void;
  rejectRequest: (
    requestId: string,
    reason: AdminDeskRequest['rejectionReason'],
    message: string,
    staffName?: string
  ) => void;
  requestMoreInfo: (requestId: string, reason: string, staffName?: string) => void;
  markReady: (
    requestId: string,
    staffName?: string,
    deliverable?: FinalDeliverableDoc,
    deliveryExtras?: { deliveryUrl?: string; pickupInfo?: string }
  ) => void;
  markDelivered: (requestId: string, staffName?: string, courierName?: string, trackingNo?: string) => void;
  cancelRequest: (requestId: string) => Promise<{ success: boolean; error?: string }>;
  rateRequest: (requestId: string, score: number, comment: string) => void;
  raiseRequestIssue: (requestId: string, topic: string, description: string) => void;
  sendMessageOnRequest: (
    requestId: string,
    senderRole: 'alumni' | 'admin',
    senderName: string,
    text: string,
    attachmentUrl?: string
  ) => void;
  updateChecklist: (requestId: string, key: keyof AdminDeskRequest['checklist'], value: boolean) => void;
  assignStaff: (requestId: string, staffId: string, staffName: string) => void;
  reUploadMissingDoc: (requestId: string, doc: AdminDeskRequest['uploadedDocuments'][0]) => void;

  // Catalog Actions
  addService: (service: Omit<AdminDeskService, 'id'>) => void;
  updateService: (id: string, updates: Partial<AdminDeskService>) => void;
  deleteService: (id: string) => void;
  toggleServiceEnabled: (id: string) => void;

  // Notices Actions
  addNotice: (notice: Omit<NoticeItem, 'id' | 'publishedAt' | 'readCount'>) => void;
  updateNotice: (id: string, updates: Partial<NoticeItem>) => void;
  deleteNotice: (id: string) => void;
  toggleNoticePin: (id: string) => void;
  rsvpNotice: (id: string) => void;
  markAllNoticesRead: () => void;

  // Vacancy Actions
  addVacancy: (vac: Omit<VacancyItem, 'id' | 'publishedAt'>) => void;
  updateVacancy: (id: string, updates: Partial<VacancyItem>) => void;
  deleteVacancy: (id: string) => void;
  toggleVacancyStatus: (id: string) => void;
  toggleSaveVacancy: (id: string) => void;
  submitVacancyApplication: (appData: Omit<VacancyApplication, 'id' | 'appliedAt' | 'status'>) => void;
  updateApplicationStatus: (
    appId: string,
    status: VacancyApplication['status'],
    interviewDetails?: VacancyApplication['interviewDetails'],
    adminNotes?: string
  ) => void;

  // Support & Settings
  submitSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>) => void;
  resolveSupportTicket: (id: string, reply: string) => void;
  updateSettings: (newSettings: Partial<AdminDeskSettings>) => void;
  resetToDefaults: () => void;
}

const STORAGE_KEYS = {
  SERVICES: 'baust_admindesk_services_v2',
  REQUESTS: 'baust_admindesk_requests_v2',
  NOTICES: 'baust_admindesk_notices_v2',
  VACANCIES: 'baust_admindesk_vacancies_v2',
  APPLICATIONS: 'baust_admindesk_applications_v2',
  SETTINGS: 'baust_admindesk_settings_v2',
  TICKETS: 'baust_admindesk_tickets_v2',
};

const initialSupportTickets: SupportTicket[] = [];

function timestampToMillis(ts: any): number {
  if (!ts) return 0;
  if (typeof ts?.toMillis === 'function') return ts.toMillis();
  if (typeof ts?.seconds === 'number') return ts.seconds * 1000;
  if (typeof ts === 'number') return ts;
  const parsed = Date.parse(String(ts));
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatDocTimestamp(ts: any): string {
  const ms = timestampToMillis(ts);
  if (!ms) return 'Just now';
  return new Date(ms).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function mapFirestoreStatusToDeskStatus(status: string): AdminDeskRequestStatus {
  const s = (status || '').toLowerCase();
  if (s === 'submitted' || s === 'pending') return 'Submitted';
  if (s === 'payment verified') return 'Payment Verified';
  if (s === 'under review') return 'Under Review';
  if (s === 'action required') return 'Action Required';
  if (s === 'approved') return 'Approved';
  if (s === 'processing') return 'Processing';
  if (s === 'ready') return 'Ready';
  if (s === 'delivered') return 'Delivered';
  if (s === 'rejected') return 'Rejected';
  if (s === 'cancelled') return 'Cancelled';
  return 'Submitted';
}

function stripUndefined<T>(value: T): T {
  return cleanPayload(value);
}

function buildStatusHistoryEntry(
  status: string,
  changedBy?: string,
  note?: string,
  extras?: { stageKey?: string; action?: 'advance' | 'undo' | 'reject' | 'cancel' | 'submit'; byName?: string }
): StatusHistoryEntry & Record<string, any> {
  return stripUndefined({
    status,
    stageKey: extras?.stageKey,
    action: extras?.action,
    at: new Date().toISOString(),
    by: changedBy || 'System',
    byName: extras?.byName || changedBy || 'System',
    note: note || undefined,
  });
}

function hydrateCanonicalStages(
  rawStages: any,
  rawStatus: string,
  rawIndex: any,
  createdLabel: string,
  requesterName: string
): { stages: DocumentStageRecord[]; currentStageIndex: number } {
  if (Array.isArray(rawStages) && rawStages.length === DOC_STAGES.length) {
    const normalized: DocumentStageRecord[] = DOC_STAGES.map((def, idx) => {
      const s = rawStages[idx] || {};
      const state =
        s.status === 'done' || s.status === 'current' || s.status === 'rejected'
          ? s.status
          : 'pending';
      return {
        key: def.key,
        label: def.label,
        status: state,
        ...(s.completedAt ? { completedAt: s.completedAt } : {}),
        ...(s.completedBy ? { completedBy: s.completedBy } : {}),
        ...(s.completedByName ? { completedByName: s.completedByName } : {}),
        ...(s.note ? { note: s.note } : {}),
      };
    });
    const currentIdx = normalized.findIndex((s) => s.status === 'current' || s.status === 'rejected');
    const resolvedIdx =
      currentIdx >= 0
        ? currentIdx
        : normalized.every((s) => s.status === 'done')
        ? DOC_STAGES.length - 1
        : normalizeStageIndexFromStatus(rawStatus, rawIndex);
    return { stages: normalized, currentStageIndex: resolvedIdx };
  }

  const lower = String(rawStatus || '').toLowerCase();
  const stageIdx = normalizeStageIndexFromStatus(rawStatus, rawIndex);
  const stages: DocumentStageRecord[] = DOC_STAGES.map((def, idx) => {
    if (lower === 'delivered') {
      return {
        key: def.key,
        label: def.label,
        status: 'done',
        completedAt: createdLabel,
      };
    }
    if (lower === 'rejected' && idx === stageIdx) {
      return {
        key: def.key,
        label: def.label,
        status: 'rejected',
      };
    }
    if (idx === 0) {
      return {
        key: def.key,
        label: def.label,
        status: 'done',
        completedAt: createdLabel,
        completedByName: requesterName,
      };
    }
    if (idx < stageIdx) {
      return {
        key: def.key,
        label: def.label,
        status: 'done',
        completedAt: createdLabel,
      };
    }
    if (idx === stageIdx) {
      return {
        key: def.key,
        label: def.label,
        status: 'current',
      };
    }
    return {
      key: def.key,
      label: def.label,
      status: 'pending',
    };
  });

  return { stages, currentStageIndex: stageIdx };
}

function stagesToTimeline(stages: DocumentStageRecord[]): AdminDeskRequest['timeline'] {
  return stages.map((s) => ({
    step: s.label,
    timestamp: s.completedAt || (s.status === 'current' ? 'In progress' : s.status === 'rejected' ? 'Rejected' : 'Pending'),
    completed: s.status === 'done',
    handledBy: s.completedByName,
    remarks: s.note,
    isCurrent: s.status === 'current' || s.status === 'rejected',
  }));
}

const AdminDeskContext = createContext<AdminDeskContextType | undefined>(undefined);

export const AdminDeskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addToast, announcements } = useApp();
  const { firebaseUser, userProfile, loading: authLoading, registerSessionCleanup } = useAuth();
  const deskBase = userProfile?.role === 'student' ? '/student' : '/alumni';

  // Helper to dispatch real Firestore notifications via Notification Rule Engine (#45)
  const pushNotificationToBell = (
    title: string,
    message: string,
    link: string,
    type: 'service' | 'announcement' | 'mentorship' = 'service',
    recipientId?: string,
    refId?: string
  ) => {
    const targetRecipient = recipientId || firebaseUser?.uid || '';
    if (!targetRecipient) return;
    void notify(targetRecipient, type, title, message, link, refId);
  };

  // State 1: Services Catalog (University service rules/fee schedule)
  const [services, setServices] = useState<AdminDeskService[]>(initialServiceCatalog);

  // State 2: Live Firestore Service Requests (#63 - no fake initialServiceRequests fallback)
  const [requests, setRequests] = useState<AdminDeskRequest[]>([]);

  // Live Firestore documentRequests state
  const [documentRequests, setDocumentRequests] = useState<FirestoreDocumentRequest[]>([]);
  const [documentRequestsLoading, setDocumentRequestsLoading] = useState<boolean>(false);

  // State 3: Notices synced with live Firestore announcements
  const [notices, setNotices] = useState<NoticeItem[]>([]);

  // State 4 & 5: Vacancies & Applications synced with live Firestore jobs & jobApplications
  const [vacancies, setVacancies] = useState<VacancyItem[]>([]);
  const [applications, setApplications] = useState<VacancyApplication[]>([]);

  // State 6: Staff Members
  const [staffMembers] = useState<StaffMember[]>(initialStaffMembers);

  // State 7: Settings
  const [settings, setSettings] = useState<AdminDeskSettings>(initialAdminDeskSettings);

  // State 8: Support Tickets
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(initialSupportTickets);

  useEffect(() => {
    return registerSessionCleanup(() => {
      setRequests([]);
      setDocumentRequests([]);
      setNotices([]);
      setVacancies([]);
      setApplications([]);
      setSupportTickets([]);
    });
  }, [registerSessionCleanup]);

  // Sync notices from live Firestore announcements
  useEffect(() => {
    setNotices(
      announcements.map((a) => ({
        id: a.id,
        title: a.title,
        category: (a.category as any) || 'Academic',
        audience: (a.targetAudience as any) || 'All',
        content: a.content,
        publishedAt: a.date,
        isPinned: Boolean(a.pinned),
        isUrgent: a.category === 'Event' || Boolean(a.pinned),
        status: 'Published' as const,
        readCount: 0,
        isRead: false,
      }))
    );
  }, [announcements]);

  // Sync vacancies and applications from live Firestore jobs & jobApplications
  useEffect(() => {
    if (authLoading || !firebaseUser || userProfile?.verificationStatus !== 'approved' || userProfile?.suspended) {
      setVacancies([]);
      setApplications([]);
      return;
    }

    const unsubJobs = subscribeJobs(
      (jobsList) => {
        setVacancies(
          jobsList.map((j) => ({
            id: j.id,
            title: j.title,
            department: (j.department as any) || 'CSE',
            type: (j.type as any) || 'Lecturer',
            qualifications: Array.isArray(j.requirements) ? j.requirements.join(', ') : 'B.Sc / Relevant Degree',
            cgpaRequirement: 3.0,
            numberOfPosts: 1,
            salaryRange: j.salaryRange || 'Negotiable',
            deadline: j.deadline || 'Open',
            publishedAt: j.createdAtLabel || 'Recently',
            description: j.description || '',
            howToApply: 'Apply directly via BAUST Career Bridge portal',
            status: j.status === 'Closed' ? 'Closed' : 'Open',
            isSaved: false,
          }))
        );
      },
      () => {}
    );

    const appOpts =
      userProfile.role === 'student'
        ? { studentId: firebaseUser.uid }
        : userProfile.role === 'alumni'
        ? { postedBy: firebaseUser.uid }
        : {};
    const unsubApps = subscribeJobApplications(
      appOpts,
      (appList) => {
        setApplications(
          appList.map((ap) => ({
            id: ap.id,
            vacancyId: ap.jobId,
            vacancyTitle: ap.jobTitle,
            alumniId: ap.studentId,
            alumniName: ap.studentName,
            alumniEmail: ap.studentEmail,
            alumniPhone: '',
            alumniAvatar: '',
            department: (ap.department as any) || 'CSE',
            batch: ap.batch || '',
            cgpa: parseFloat(String(ap.cgpa || '0')) || 0,
            experience: '',
            cvFileName: ap.cvFileName || 'Student_CV.pdf',
            coverLetter: ap.coverNote || '',
            appliedAt: ap.createdAtLabel || 'Recently',
            status: (ap.status as any) || 'Applied',
          }))
        );
      },
      () => {}
    );

    return () => {
      unsubJobs();
      unsubApps();
    };
  }, [authLoading, firebaseUser, userProfile?.role, userProfile?.verificationStatus, userProfile?.suspended]);

  // Real-time Firestore listener for documentRequests (only for approved, non-suspended accounts)
  useEffect(() => {
    if (
      authLoading ||
      !firebaseUser ||
      userProfile?.verificationStatus !== 'approved' ||
      userProfile?.suspended
    ) {
      setDocumentRequests([]);
      setDocumentRequestsLoading(false);
      return;
    }

    setDocumentRequestsLoading(true);
    const colRef = collection(db, 'documentRequests');
    const q =
      userProfile?.role === 'admin' || userProfile?.role === 'superAdmin'
        ? colRef
        : query(colRef, where('userId', '==', firebaseUser.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rawEntries = snapshot.docs.map((d) => ({
          id: d.id,
          data: d.data() as Record<string, any>,
        }));

        const docs: FirestoreDocumentRequest[] = rawEntries.map(({ id, data }) => ({
          id,
          trackingId: data.trackingId || id,
          userId: data.userId || '',
          userName: data.userName || 'BAUST Applicant',
          userEmail: data.userEmail || '',
          userRole: data.userRole || 'student',
          baustId: data.baustId || '',
          department: data.department || 'CSE',
          type: data.type || 'Official Transcript',
          serviceId: data.serviceId || 'srv-transcript',
          copies: typeof data.copies === 'number' ? data.copies : 1,
          purpose: data.purpose || 'Official Academic Use',
          urgency: (data.urgency as RequestUrgency) || 'Normal',
          deliveryMethod: (data.deliveryMethod as DeliveryMethodType) || 'Campus Pickup',
          deliveryAddress: data.deliveryAddress || '',
          paymentMethod: (data.paymentMethod as PaymentMethodType) || 'bKash',
          transactionId: data.transactionId || '',
          fee: typeof data.fee === 'number' ? data.fee : 500,
          status: data.status || 'Submitted',
          createdAt: data.createdAt,
          createdAtLabel: formatDocTimestamp(data.createdAt),
        }));

        docs.sort((a, b) => timestampToMillis(b.createdAt) - timestampToMillis(a.createdAt));
        setDocumentRequests(docs);
        setDocumentRequestsLoading(false);

        const rawById = new Map<string, Record<string, any>>();
        rawEntries.forEach((e) => rawById.set(e.id, e.data));

        const hydratedRequests: AdminDeskRequest[] = docs.map((d) => {
          const data = rawById.get(d.id) || {};
          const mappedStatus = mapFirestoreStatusToDeskStatus(d.status);
          const { stages, currentStageIndex } = hydrateCanonicalStages(
            data.stages,
            d.status,
            data.currentStageIndex,
            d.createdAtLabel,
            d.userName
          );
          const derivedTimeline = stagesToTimeline(stages);

          const storedDelivery = data.delivery && typeof data.delivery === 'object' ? data.delivery : {};
          const storedPayment = data.payment && typeof data.payment === 'object' ? data.payment : {};
          const storedChecklist = data.checklist && typeof data.checklist === 'object' ? data.checklist : {};
          const storedDeliveryInfo: AdminDeskDeliveryInfo | undefined =
            data.deliveryInfo && typeof data.deliveryInfo === 'object' ? data.deliveryInfo : undefined;

          const paymentStageDone = stages[1]?.status === 'done';

          return {
            id: d.trackingId,
            trackingId: d.trackingId,
            alumniId: d.userId,
            applicantRole: (
              ['student', 'alumni', 'admin', 'superAdmin'].includes(d.userRole)
                ? d.userRole
                : 'student'
            ) as UserRole,
            alumniName: d.userName,
            alumniEmail: d.userEmail,
            alumniPhone: data.alumniPhone || data.phone || '',
            alumniAvatar: data.alumniAvatar || '',
            baustId: d.baustId || '',
            department: (d.department as Department) || '',
            batch: data.batch || '',
            passingYear: typeof data.passingYear === 'number' ? data.passingYear : 0,
            cgpa: typeof data.cgpa === 'number' ? data.cgpa : 0,
            services:
              Array.isArray(data.services) && data.services.length > 0
                ? data.services
                : [
                    {
                      serviceId: d.serviceId,
                      serviceName: d.type,
                      copies: d.copies,
                      feePerCopy: d.fee,
                      purpose: (d.purpose as any) || 'Other',
                      urgency: d.urgency,
                    },
                  ],
            uploadedDocuments: Array.isArray(data.uploadedDocuments) ? data.uploadedDocuments : [],
            delivery: {
              method: storedDelivery.method || d.deliveryMethod,
              courierAddress: storedDelivery.courierAddress || d.deliveryAddress || undefined,
              courierName: storedDelivery.courierName,
              courierTrackingNumber: storedDelivery.courierTrackingNumber,
              pickupDate: storedDelivery.pickupDate,
              pickupTimeSlot: storedDelivery.pickupTimeSlot,
              pickupInfo: storedDelivery.pickupInfo || data.pickupInfo || storedDeliveryInfo?.pickupLocation,
              institutionName: storedDelivery.institutionName,
              institutionEmail: storedDelivery.institutionEmail,
              institutionAddress: storedDelivery.institutionAddress,
            },
            payment: {
              method: storedPayment.method || d.paymentMethod || 'bKash',
              transactionId: storedPayment.transactionId || d.transactionId || '',
              subtotal: typeof storedPayment.subtotal === 'number' ? storedPayment.subtotal : d.fee,
              urgencyFee: typeof storedPayment.urgencyFee === 'number' ? storedPayment.urgencyFee : 0,
              courierFee: typeof storedPayment.courierFee === 'number' ? storedPayment.courierFee : 0,
              totalAmount: typeof storedPayment.totalAmount === 'number' ? storedPayment.totalAmount : d.fee,
              isVerified: Boolean(storedPayment.isVerified ?? paymentStageDone),
              verifiedAt: storedPayment.verifiedAt || stages[1]?.completedAt,
              verifiedBy: storedPayment.verifiedBy || stages[1]?.completedByName,
              paidAt: storedPayment.paidAt || d.createdAtLabel,
            },
            status: mappedStatus,
            stages,
            currentStageIndex,
            currentStageKey: DOC_STAGES[currentStageIndex]?.key || 'payment_verified',
            deliveryInfo: storedDeliveryInfo,
            urgency: d.urgency,
            submittedAt: data.submittedAt || d.createdAtLabel,
            estimatedDelivery: data.estimatedDelivery || '5 - 7 business days',
            assignedStaffId: data.assignedStaffId || undefined,
            assignedStaffName: data.assignedStaffName || undefined,
            checklist: {
              baustIdMatches: storedChecklist.baustIdMatches ?? Boolean(d.baustId),
              academicRecordFound: storedChecklist.academicRecordFound ?? currentStageIndex >= 3,
              paymentVerified: Boolean(storedChecklist.paymentVerified ?? storedPayment.isVerified ?? paymentStageDone),
              documentsValid: storedChecklist.documentsValid ?? true,
            },
            timeline: derivedTimeline,
            messages: Array.isArray(data.messages) ? data.messages : [],
            auditLog:
              Array.isArray(data.auditLog) && data.auditLog.length > 0
                ? data.auditLog
                : [
                    {
                      id: `aud-${d.id}`,
                      action: 'REQUEST_SUBMITTED',
                      performedBy: d.userName,
                      timestamp: d.createdAtLabel,
                      details: `Submitted ${d.type} (${d.copies} copy)`,
                    },
                  ],
            adminRemarks: data.adminRemarks || undefined,
            rejectionReason: data.rejectionReason || undefined,
            rejectionMessage: data.rejectionMessage || undefined,
            rejectedAt: data.rejectedAt || undefined,
            rejectedBy: data.rejectedBy || undefined,
            cancelledAt: data.cancelledAt || undefined,
            cancelledBy: data.cancelledBy || undefined,
            actionRequiredReason: data.actionRequiredReason || undefined,
            finalDeliverable: data.finalDeliverable || undefined,
            deliveryUrl: data.deliveryUrl || storedDeliveryInfo?.link || undefined,
            pickupInfo: data.pickupInfo || storedDelivery.pickupInfo || storedDeliveryInfo?.pickupLocation || undefined,
            statusHistory: Array.isArray(data.statusHistory) ? data.statusHistory : undefined,
            rating: data.rating || undefined,
            issueRaised: data.issueRaised || undefined,
          };
        });

        setRequests(hydratedRequests);
      },
      (err) => {
        console.warn('documentRequests listener warning:', err?.message || err);
        setDocumentRequestsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [
    authLoading,
    firebaseUser?.uid,
    userProfile?.role,
    userProfile?.verificationStatus,
    userProfile?.suspended,
  ]);

  const persistRequestPatch = (requestId: string, patch: Record<string, any>) => {
    if (!firebaseUser) return;
    updateDoc(doc(db, 'documentRequests', requestId), {
      ...stripUndefined(patch),
      updatedAt: serverTimestamp(),
    }).catch((err) => {
      console.warn('documentRequests updateDoc warning:', err?.message || err);
    });
  };

  // Request Handlers
  const submitRequest = (
    newReqData: Omit<AdminDeskRequest, 'id' | 'submittedAt' | 'timeline' | 'status' | 'auditLog' | 'messages' | 'checklist'>
  ): string => {
    const trackingId = `BCB-2026-${Math.floor(100000 + Math.random() * 900000).toString().substring(0, 6)}`;
    const nowIso = new Date().toISOString();
    const nowLabel = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const applicantRole = newReqData.applicantRole || userProfile?.role || 'student';
    const applicantName = userProfile?.name || newReqData.alumniName || 'Applicant';
    const initialStages = buildInitialDocumentStages(applicantName, nowIso);
    const initialHistory = [
      buildStatusHistoryEntry(
        'Submitted',
        firebaseUser?.uid || applicantName,
        `Submitted ${newReqData.services.map((s) => s.serviceName).join(', ')}`,
        { stageKey: 'submitted', action: 'submit', byName: applicantName }
      ),
    ];

    const cleanPayment = {
      ...newReqData.payment,
      isVerified: false, // Never auto-complete payment verification on submission
    };

    const newRequest: AdminDeskRequest = {
      ...newReqData,
      id: trackingId,
      trackingId,
      applicantRole,
      payment: cleanPayment,
      status: 'Submitted',
      stages: initialStages,
      currentStageIndex: 1,
      currentStageKey: 'payment_verified',
      submittedAt: nowLabel,
      checklist: {
        baustIdMatches: Boolean(userProfile?.baustId || newReqData.baustId),
        academicRecordFound: false,
        paymentVerified: false,
        documentsValid: newReqData.uploadedDocuments.length > 0,
      },
      timeline: stagesToTimeline(initialStages),
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderRole: 'admin',
          senderName: 'BAUST Admin Desk',
          text: `Request #${trackingId} submitted. Stage 2 (Payment Verification) is now queued for Admin verification.`,
          timestamp: nowLabel,
        },
      ],
      auditLog: [
        {
          id: `aud-${Date.now()}`,
          action: 'REQUEST_SUBMITTED',
          performedBy: applicantName,
          timestamp: nowLabel,
          details: `Order created for ${newReqData.services.map((s) => s.serviceName).join(', ')} - Total: BDT ${cleanPayment.totalAmount}`,
        },
      ],
      statusHistory: initialHistory,
    };

    if (firebaseUser) {
      const firstSrv = newReqData.services[0];
      setDoc(
        doc(db, 'documentRequests', trackingId),
        stripUndefined({
          id: trackingId,
          trackingId,
          userId: firebaseUser.uid,
          userName: applicantName,
          userEmail: userProfile?.email || newReqData.alumniEmail || '',
          userRole: applicantRole,
          baustId: userProfile?.baustId || newReqData.baustId || '',
          department: userProfile?.department || newReqData.department || '',
          batch: userProfile?.batch || newReqData.batch || '',
          passingYear: userProfile?.passingYear || newReqData.passingYear || 0,
          cgpa: userProfile?.cgpa || newReqData.cgpa || 0,
          alumniPhone: userProfile?.phone || newReqData.alumniPhone || '',
          alumniAvatar: userProfile?.avatar || newReqData.alumniAvatar || '',
          type: firstSrv?.serviceName || 'Academic Document',
          serviceId: firstSrv?.serviceId || 'srv-transcript',
          copies: firstSrv?.copies || 1,
          purpose: firstSrv?.purpose || 'Official Academic Use',
          urgency: newReqData.urgency || 'Normal',
          deliveryMethod: newReqData.delivery?.method || 'Campus Pickup',
          deliveryAddress:
            newReqData.delivery?.courierAddress || newReqData.delivery?.institutionAddress || '',
          paymentMethod: cleanPayment.method || 'bKash',
          transactionId: cleanPayment.transactionId || '',
          fee: cleanPayment.totalAmount ?? 500,
          status: 'submitted',
          stages: initialStages,
          currentStageIndex: 1,
          currentStageKey: 'payment_verified',
          submittedAt: nowLabel,
          estimatedDelivery: newRequest.estimatedDelivery,
          services: newRequest.services,
          uploadedDocuments: newRequest.uploadedDocuments,
          delivery: newRequest.delivery,
          payment: cleanPayment,
          checklist: newRequest.checklist,
          timeline: newRequest.timeline,
          messages: newRequest.messages,
          auditLog: newRequest.auditLog,
          statusHistory: initialHistory,
          isDemo: Boolean(userProfile?.isDemo),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      ).catch((err) => {
        console.warn('Firestore documentRequests write note:', err?.message || err);
      });
    }

    setRequests((prev) => [newRequest, ...prev]);

    pushNotificationToBell(
      'Document Request Submitted',
      `New request (${trackingId}) for ${newReqData.services[0]?.serviceName} submitted by ${applicantName}.`,
      `/admin/admin-desk/requests/${trackingId}`,
      'service',
      'ALL_ADMINS',
      trackingId
    );

    addToast('success', 'Order Submitted Successfully', `Tracking ID: ${trackingId}`);
    return trackingId;
  };

  const submitQuickDocumentRequest = async (params: {
    type: string;
    serviceId: string;
    copies: number;
    purpose: string;
    urgency: RequestUrgency;
    deliveryMethod: DeliveryMethodType;
    deliveryAddress?: string;
    paymentMethod?: PaymentMethodType;
    transactionId?: string;
    fee: number;
  }): Promise<{ success: boolean; trackingId?: string; error?: string }> => {
    const trackingId = `BCB-2026-${Math.floor(100000 + Math.random() * 900000).toString().substring(0, 6)}`;
    const applicantName = userProfile?.name || firebaseUser?.displayName || 'BAUST Member';
    const applicantEmail = userProfile?.email || firebaseUser?.email || '';
    const applicantId = firebaseUser?.uid || '';
    const applicantRole = (userProfile?.role || 'student') as UserRole;
    const nowIso = new Date().toISOString();
    const nowLabel = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const initialStages = buildInitialDocumentStages(applicantName, nowIso);
    const initialHistory = [
      buildStatusHistoryEntry(
        'Submitted',
        applicantId || applicantName,
        `Submitted ${params.type} (${params.copies} copy)`,
        { stageKey: 'submitted', action: 'submit', byName: applicantName }
      ),
    ];

    const localEntry: AdminDeskRequest = {
      id: trackingId,
      trackingId,
      alumniId: applicantId,
      applicantRole,
      alumniName: applicantName,
      alumniEmail: applicantEmail,
      alumniPhone: userProfile?.phone || '',
      alumniAvatar: userProfile?.avatar || '',
      baustId: userProfile?.baustId || userProfile?.studentId || '',
      department: (userProfile?.department as Department) || '',
      batch: userProfile?.batch || '',
      passingYear: typeof userProfile?.passingYear === 'number' ? userProfile.passingYear : 0,
      cgpa: typeof userProfile?.cgpa === 'number' ? userProfile.cgpa : 0,
      services: [
        {
          serviceId: params.serviceId,
          serviceName: params.type,
          copies: params.copies,
          feePerCopy: params.fee,
          purpose: (params.purpose as any) || 'Other',
          urgency: params.urgency,
        },
      ],
      uploadedDocuments: [],
      delivery: {
        method: params.deliveryMethod,
        courierAddress: params.deliveryAddress,
      },
      payment: {
        method: params.paymentMethod || 'bKash',
        transactionId: params.transactionId || `TXN-${trackingId.slice(-6)}`,
        subtotal: params.fee,
        urgencyFee: 0,
        courierFee: 0,
        totalAmount: params.fee,
        isVerified: false,
        paidAt: nowLabel,
      },
      status: 'Submitted',
      stages: initialStages,
      currentStageIndex: 1,
      currentStageKey: 'payment_verified',
      urgency: params.urgency,
      submittedAt: nowLabel,
      estimatedDelivery: '5 - 7 business days',
      checklist: {
        baustIdMatches: Boolean(userProfile?.baustId || userProfile?.studentId),
        academicRecordFound: false,
        paymentVerified: false,
        documentsValid: true,
      },
      timeline: stagesToTimeline(initialStages),
      messages: [],
      auditLog: [
        {
          id: `aud-${Date.now()}`,
          action: 'REQUEST_SUBMITTED',
          performedBy: applicantName,
          timestamp: nowLabel,
          details: `Submitted ${params.type} (${params.copies} copy) - Fee BDT ${params.fee}`,
        },
      ],
      statusHistory: initialHistory,
    };

    try {
      if (firebaseUser) {
        await setDoc(
          doc(db, 'documentRequests', trackingId),
          stripUndefined({
            id: trackingId,
            trackingId,
            userId: firebaseUser.uid,
            userName: applicantName,
            userEmail: applicantEmail,
            userRole: applicantRole,
            baustId: userProfile?.baustId || userProfile?.studentId || '',
            department: userProfile?.department || '',
            batch: userProfile?.batch || '',
            passingYear: userProfile?.passingYear || 0,
            cgpa: userProfile?.cgpa || 0,
            alumniPhone: userProfile?.phone || '',
            alumniAvatar: userProfile?.avatar || '',
            type: params.type,
            serviceId: params.serviceId,
            copies: params.copies,
            purpose: params.purpose,
            urgency: params.urgency,
            deliveryMethod: params.deliveryMethod,
            deliveryAddress: params.deliveryAddress || '',
            paymentMethod: params.paymentMethod || 'bKash',
            transactionId: params.transactionId || `TXN-${trackingId.slice(-6)}`,
            fee: params.fee,
            status: 'submitted',
            stages: initialStages,
            currentStageIndex: 1,
            currentStageKey: 'payment_verified',
            submittedAt: nowLabel,
            estimatedDelivery: localEntry.estimatedDelivery,
            services: localEntry.services,
            uploadedDocuments: localEntry.uploadedDocuments,
            delivery: localEntry.delivery,
            payment: localEntry.payment,
            checklist: localEntry.checklist,
            timeline: localEntry.timeline,
            messages: localEntry.messages,
            auditLog: localEntry.auditLog,
            statusHistory: initialHistory,
            isDemo: Boolean(userProfile?.isDemo),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        );
      }

      setRequests((prev) => [localEntry, ...prev.filter((r) => r.id !== trackingId)]);
      pushNotificationToBell(
        'Document Request Submitted',
        `New request (${trackingId}) for ${params.type} submitted by ${applicantName}.`,
        `/admin/admin-desk/requests/${trackingId}`,
        'service',
        'ALL_ADMINS',
        trackingId
      );
      addToast('success', 'Document Request Submitted', `Tracking ID: ${trackingId}`);
      return { success: true, trackingId };
    } catch (err: any) {
      const msg = err?.message || 'Failed to save document request.';
      addToast('error', 'Submission Failed', msg);
      return { success: false, error: msg };
    }
  };

  // Transaction-guarded Admin stage progression (Part 1)
  const advanceDocumentStage = async (
    requestId: string,
    expectedStageIndex: number,
    note?: string,
    deliveryExtras?: AdminDeskDeliveryInfo
  ): Promise<{ success: boolean; error?: string }> => {
    if (!firebaseUser || (userProfile?.role !== 'admin' && userProfile?.role !== 'superAdmin')) {
      return { success: false, error: 'Only Admin staff can advance document stages.' };
    }
    const actorUid = firebaseUser.uid;
    const actorName = userProfile?.name || 'BAUST Admin';
    const nowIso = new Date().toISOString();
    const docRef = doc(db, 'documentRequests', requestId);

    try {
      const txResult = await runTransaction(db, async (tx) => {
        const snap = await tx.get(docRef);
        if (!snap.exists()) {
          throw new Error('Document request record was not found.');
        }
        const data = snap.data() as Record<string, any>;
        const rawStatus = String(data.status || '').toLowerCase();
        if (rawStatus === 'rejected' || rawStatus === 'cancelled') {
          throw new Error(`Cannot advance a ${rawStatus} request.`);
        }

        const { stages, currentStageIndex } = hydrateCanonicalStages(
          data.stages,
          rawStatus,
          data.currentStageIndex,
          data.submittedAt || 'Recently',
          data.userName || 'Applicant'
        );

        if (currentStageIndex !== expectedStageIndex) {
          throw new Error('This stage was already updated. Refreshing latest state.');
        }
        if (stages[expectedStageIndex]?.status === 'done') {
          throw new Error('This stage is already marked done.');
        }

        const completedStage = DOC_STAGES[expectedStageIndex];
        const nextIndex = expectedStageIndex + 1;
        const isFinal = nextIndex >= DOC_STAGES.length;

        const updatedStages: DocumentStageRecord[] = stages.map((st, idx) => {
          if (idx === expectedStageIndex) {
            return stripUndefined({
              ...st,
              status: 'done',
              completedAt: nowIso,
              completedBy: actorUid,
              completedByName: actorName,
              note: note?.trim() || undefined,
            });
          }
          if (!isFinal && idx === nextIndex) {
            return { ...st, status: 'current' };
          }
          return st;
        });

        const nextStageIndex = isFinal ? DOC_STAGES.length - 1 : nextIndex;
        const nextStageKey = DOC_STAGES[nextStageIndex].key;
        const nextStatusDisplay = isFinal
          ? 'Delivered'
          : stageKeyToDisplayStatus(completedStage.key);

        const prevPayment = data.payment && typeof data.payment === 'object' ? data.payment : {};
        const updatedPayment =
          completedStage.key === 'payment_verified'
            ? {
                ...prevPayment,
                isVerified: true,
                verifiedAt: nowIso,
                verifiedBy: actorName,
              }
            : prevPayment;

        const prevChecklist = data.checklist && typeof data.checklist === 'object' ? data.checklist : {};
        const updatedChecklist = {
          ...prevChecklist,
          ...(completedStage.key === 'payment_verified' ? { paymentVerified: true } : {}),
          ...(completedStage.key === 'controller_review' ? { academicRecordFound: true } : {}),
        };

        const mergedDeliveryInfo: AdminDeskDeliveryInfo | undefined =
          deliveryExtras || data.deliveryInfo
            ? stripUndefined({
                ...(data.deliveryInfo || {}),
                ...(deliveryExtras || {}),
                updatedAt: nowIso,
                updatedBy: actorName,
              })
            : undefined;

        const historyEntry = buildStatusHistoryEntry(
          completedStage.label,
          actorUid,
          note?.trim() || `Marked "${completedStage.label}" as done`,
          { stageKey: completedStage.key, action: 'advance', byName: actorName }
        );

        const nextTimeline = stagesToTimeline(updatedStages);

        const patch: Record<string, any> = {
          status: nextStatusDisplay.toLowerCase(),
          stages: updatedStages,
          currentStageIndex: nextStageIndex,
          currentStageKey: nextStageKey,
          payment: updatedPayment,
          checklist: updatedChecklist,
          timeline: nextTimeline,
          statusHistory: [...(Array.isArray(data.statusHistory) ? data.statusHistory : []), historyEntry],
          updatedAt: serverTimestamp(),
        };

        if (note?.trim()) {
          patch.adminRemarks = note.trim();
        }
        if (mergedDeliveryInfo) {
          patch.deliveryInfo = mergedDeliveryInfo;
          if (mergedDeliveryInfo.link) patch.deliveryUrl = mergedDeliveryInfo.link;
          if (mergedDeliveryInfo.pickupLocation) patch.pickupInfo = mergedDeliveryInfo.pickupLocation;
        }

        tx.update(docRef, stripUndefined(patch));

        return {
          requesterUid: data.userId as string,
          requesterRole: (data.userRole || 'student') as string,
          completedLabel: completedStage.label,
          isFinal,
        };
      });

      if (txResult.requesterUid) {
        void notify(
          txResult.requesterUid,
          'service',
          txResult.isFinal ? 'Document Delivered' : `Stage Completed: ${txResult.completedLabel}`,
          `Your document request (${requestId}) completed "${txResult.completedLabel}"${note?.trim() ? ` — ${note.trim()}` : '.'}`,
          getDocumentRequestLink(txResult.requesterRole, requestId),
          requestId
        );
      }

      addToast('success', 'Stage Updated', `Marked "${txResult.completedLabel}" as Done.`);
      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Unable to advance stage.';
      addToast('error', 'Stage Update Failed', msg);
      return { success: false, error: msg };
    }
  };

  const undoLastDocumentStage = async (
    requestId: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanReason = reason.trim();
    if (!cleanReason) {
      return { success: false, error: 'A reason is required to undo the last step.' };
    }
    if (!firebaseUser || (userProfile?.role !== 'admin' && userProfile?.role !== 'superAdmin')) {
      return { success: false, error: 'Only Admin staff can undo document stages.' };
    }
    const actorUid = firebaseUser.uid;
    const actorName = userProfile?.name || 'BAUST Admin';
    const nowIso = new Date().toISOString();
    const docRef = doc(db, 'documentRequests', requestId);

    try {
      const txResult = await runTransaction(db, async (tx) => {
        const snap = await tx.get(docRef);
        if (!snap.exists()) {
          throw new Error('Document request not found.');
        }
        const data = snap.data() as Record<string, any>;
        const rawStatus = String(data.status || '').toLowerCase();
        const { stages } = hydrateCanonicalStages(
          data.stages,
          rawStatus,
          data.currentStageIndex,
          data.submittedAt || 'Recently',
          data.userName || 'Applicant'
        );

        let lastDoneIdx = -1;
        for (let i = stages.length - 1; i >= 1; i--) {
          if (stages[i]?.status === 'done') {
            lastDoneIdx = i;
            break;
          }
        }
        if (lastDoneIdx < 1) {
          throw new Error('No completed Admin stage is available to undo.');
        }

        const undoneStage = DOC_STAGES[lastDoneIdx];
        const updatedStages: DocumentStageRecord[] = DOC_STAGES.map((def, idx) => {
          if (idx < lastDoneIdx) {
            return stages[idx];
          }
          if (idx === lastDoneIdx) {
            return {
              key: def.key,
              label: def.label,
              status: 'current',
            };
          }
          return {
            key: def.key,
            label: def.label,
            status: 'pending',
          };
        });

        const prevStageKey = DOC_STAGES[lastDoneIdx - 1].key;
        const nextStatus =
          lastDoneIdx === 1 ? 'submitted' : stageKeyToDisplayStatus(prevStageKey).toLowerCase();

        const prevPayment = data.payment && typeof data.payment === 'object' ? data.payment : {};
        const updatedPayment =
          undoneStage.key === 'payment_verified'
            ? { ...prevPayment, isVerified: false }
            : prevPayment;

        const prevChecklist = data.checklist && typeof data.checklist === 'object' ? data.checklist : {};
        const updatedChecklist = {
          ...prevChecklist,
          ...(undoneStage.key === 'payment_verified' ? { paymentVerified: false } : {}),
          ...(undoneStage.key === 'controller_review' ? { academicRecordFound: false } : {}),
        };

        const historyEntry = buildStatusHistoryEntry(
          `Undo: ${undoneStage.label}`,
          actorUid,
          cleanReason,
          { stageKey: undoneStage.key, action: 'undo', byName: actorName }
        );

        tx.update(
          docRef,
          stripUndefined({
            status: nextStatus,
            stages: updatedStages,
            currentStageIndex: lastDoneIdx,
            currentStageKey: undoneStage.key,
            payment: updatedPayment,
            checklist: updatedChecklist,
            timeline: stagesToTimeline(updatedStages),
            statusHistory: [...(Array.isArray(data.statusHistory) ? data.statusHistory : []), historyEntry],
            adminRemarks: `Step reverted (${undoneStage.label}): ${cleanReason}`,
            updatedAt: serverTimestamp(),
          })
        );

        return {
          requesterUid: data.userId as string,
          requesterRole: (data.userRole || 'student') as string,
          undoneLabel: undoneStage.label,
        };
      });

      if (txResult.requesterUid) {
        void notify(
          txResult.requesterUid,
          'service',
          `Stage Reverted: ${txResult.undoneLabel}`,
          `Request #${requestId} returned to "${txResult.undoneLabel}". Reason: ${cleanReason}`,
          getDocumentRequestLink(txResult.requesterRole, requestId),
          requestId
        );
      }

      addToast('info', 'Stage Reverted', `Returned request #${requestId} to "${txResult.undoneLabel}".`);
      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Unable to revert stage.';
      addToast('error', 'Undo Failed', msg);
      return { success: false, error: msg };
    }
  };

  const rejectDocumentRequest = async (
    requestId: string,
    reason: AdminDeskRequest['rejectionReason'],
    message: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanMessage = message.trim();
    if (!cleanMessage) {
      return { success: false, error: 'Rejection remarks are required.' };
    }
    if (!firebaseUser || (userProfile?.role !== 'admin' && userProfile?.role !== 'superAdmin')) {
      return { success: false, error: 'Only Admin staff can reject requests.' };
    }

    const actorUid = firebaseUser.uid;
    const actorName = userProfile?.name || 'BAUST Admin';
    const nowIso = new Date().toISOString();
    const docRef = doc(db, 'documentRequests', requestId);

    try {
      const txResult = await runTransaction(db, async (tx) => {
        const snap = await tx.get(docRef);
        if (!snap.exists()) throw new Error('Request not found.');
        const data = snap.data() as Record<string, any>;
        const { stages, currentStageIndex } = hydrateCanonicalStages(
          data.stages,
          data.status || 'submitted',
          data.currentStageIndex,
          data.submittedAt || 'Recently',
          data.userName || 'Applicant'
        );

        const updatedStages: DocumentStageRecord[] = stages.map((st, idx) =>
          idx === currentStageIndex
            ? {
                ...st,
                status: 'rejected',
                completedAt: nowIso,
                completedBy: actorUid,
                completedByName: actorName,
                note: cleanMessage,
              }
            : st
        );

        const historyEntry = buildStatusHistoryEntry(
          'Rejected',
          actorUid,
          `${reason || 'Rejected'}: ${cleanMessage}`,
          { stageKey: stages[currentStageIndex]?.key, action: 'reject', byName: actorName }
        );

        tx.update(
          docRef,
          stripUndefined({
            status: 'rejected',
            stages: updatedStages,
            currentStageIndex,
            currentStageKey: stages[currentStageIndex]?.key || 'payment_verified',
            rejectionReason: reason || 'Other',
            rejectionMessage: cleanMessage,
            adminRemarks: cleanMessage,
            rejectedAt: nowIso,
            rejectedBy: actorName,
            timeline: stagesToTimeline(updatedStages),
            statusHistory: [...(Array.isArray(data.statusHistory) ? data.statusHistory : []), historyEntry],
            updatedAt: serverTimestamp(),
          })
        );

        return {
          requesterUid: data.userId as string,
          requesterRole: (data.userRole || 'student') as string,
        };
      });

      if (txResult.requesterUid) {
        void notify(
          txResult.requesterUid,
          'service',
          'Document Request Rejected',
          `Request #${requestId} was rejected (${reason || 'Other'}): ${cleanMessage}`,
          getDocumentRequestLink(txResult.requesterRole, requestId),
          requestId
        );
      }
      addToast('error', 'Request Rejected', `Request #${requestId} marked as Rejected.`);
      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Unable to reject request.';
      addToast('error', 'Rejection Failed', msg);
      return { success: false, error: msg };
    }
  };

  const updateDocumentDeliveryInfo = async (
    requestId: string,
    info: AdminDeskDeliveryInfo
  ): Promise<{ success: boolean; error?: string }> => {
    if (!firebaseUser || (userProfile?.role !== 'admin' && userProfile?.role !== 'superAdmin')) {
      return { success: false, error: 'Only Admin staff can update delivery details.' };
    }
    const nowIso = new Date().toISOString();
    const actorName = userProfile?.name || 'BAUST Admin';
    const cleanInfo: AdminDeskDeliveryInfo = stripUndefined({
      note: info.note?.trim() || undefined,
      link: info.link?.trim() || undefined,
      pickupLocation: info.pickupLocation?.trim() || undefined,
      updatedAt: nowIso,
      updatedBy: actorName,
    });

    try {
      await updateDoc(
        doc(db, 'documentRequests', requestId),
        stripUndefined({
          deliveryInfo: cleanInfo,
          deliveryUrl: cleanInfo.link || '',
          pickupInfo: cleanInfo.pickupLocation || '',
          updatedAt: serverTimestamp(),
        })
      );
      const req = requests.find((r) => r.id === requestId);
      if (req?.alumniId) {
        void notify(
          req.alumniId,
          'service',
          'Delivery Details Updated',
          `Delivery or pickup details have been updated for request #${requestId}.`,
          getDocumentRequestLink(req.applicantRole, requestId),
          requestId
        );
      }
      addToast('success', 'Delivery Details Saved', `Updated delivery instructions for #${requestId}.`);
      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Unable to save delivery details.';
      addToast('error', 'Save Failed', msg);
      return { success: false, error: msg };
    }
  };

  const updateRequestStatus = (
    requestId: string,
    status: AdminDeskRequestStatus,
    staffName: string = 'Registrar Office Staff',
    remarks?: string,
    courierDetails?: { courierName?: string; courierTrackingNumber?: string; deliveryUrl?: string; pickupInfo?: string }
  ) => {
    const now = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    const updatedTimeline = req.timeline.map((item) => {
      if (status === 'Payment Verified' && item.step.includes('Payment Verified')) {
        return { ...item, completed: true, timestamp: now, handledBy: staffName, isCurrent: true };
      }
      if (status === 'Under Review' && item.step.includes('Academic Verification')) {
        return { ...item, completed: true, timestamp: now, handledBy: staffName, isCurrent: true };
      }
      if (status === 'Approved' && item.step.includes('Academic Verification')) {
        return { ...item, completed: true, timestamp: now, handledBy: staffName, remarks: remarks || 'Approved by Controller', isCurrent: true };
      }
      if (status === 'Processing' && item.step.includes('Printing & Hologram')) {
        return { ...item, completed: true, timestamp: now, handledBy: staffName, isCurrent: true };
      }
      if (status === 'Ready' && item.step.includes('Ready for Dispatch')) {
        return { ...item, completed: true, timestamp: now, handledBy: staffName, isCurrent: true };
      }
      if (status === 'Delivered' && item.step.includes('Delivered')) {
        return { ...item, completed: true, timestamp: now, handledBy: staffName, isCurrent: true };
      }
      return { ...item, isCurrent: false };
    });

    let finalDeliverable = req.finalDeliverable;
    if (status === 'Ready' && !finalDeliverable) {
      finalDeliverable = {
        documentNumber: `BAUST/EXAM/${(req.services[0]?.serviceId || 'DOC').toUpperCase()}/2026/${req.id.slice(-4)}`,
        title: `${req.services[0]?.serviceName || 'Academic Document'} (Digital Certified Copy)`,
        issuedDate: new Date().toISOString().split('T')[0],
        qrCodeUrl: `#/verify-document?id=${req.id}`,
        fileUrl: courierDetails?.deliveryUrl || `#document-${req.id}`,
        watermark: 'DIGITAL OFFICIAL COPY - BAUST EXAM CONTROLLER SEAL',
        digitalSignature: `${staffName.toUpperCase()}, BAUST`,
        signatoryTitle: 'Authorized Exam Controller Signatory',
      };
    } else if (finalDeliverable && courierDetails?.deliveryUrl) {
      finalDeliverable = { ...finalDeliverable, fileUrl: courierDetails.deliveryUrl };
    }

    const updatedDelivery = stripUndefined({
      ...req.delivery,
      courierName: courierDetails?.courierName || req.delivery.courierName,
      courierTrackingNumber: courierDetails?.courierTrackingNumber || req.delivery.courierTrackingNumber,
      pickupInfo: courierDetails?.pickupInfo || req.delivery.pickupInfo,
    });

    const newAuditEntry = {
      id: `aud-${Date.now()}`,
      action: `STATUS_CHANGE_TO_${status.toUpperCase()}`,
      performedBy: staffName,
      timestamp: now,
      details: remarks || `Status updated to ${status}`,
    };

    const historyEntry = buildStatusHistoryEntry(status, staffName, remarks || `Status updated to ${status}`);
    const updatedAuditLog = [newAuditEntry, ...req.auditLog];
    const updatedHistory = [...(req.statusHistory || []), historyEntry];

    const updatedReq: AdminDeskRequest = {
      ...req,
      status,
      adminRemarks: remarks !== undefined ? remarks : req.adminRemarks,
      finalDeliverable,
      deliveryUrl: courierDetails?.deliveryUrl || req.deliveryUrl,
      pickupInfo: courierDetails?.pickupInfo || req.pickupInfo,
      delivery: updatedDelivery,
      timeline: updatedTimeline,
      auditLog: updatedAuditLog,
      statusHistory: updatedHistory,
    };

    setRequests((prev) => prev.map((r) => (r.id === requestId ? updatedReq : r)));

    persistRequestPatch(requestId, {
      status: status.toLowerCase(),
      adminRemarks: updatedReq.adminRemarks || '',
      finalDeliverable: updatedReq.finalDeliverable || null,
      deliveryUrl: updatedReq.deliveryUrl || '',
      pickupInfo: updatedReq.pickupInfo || '',
      delivery: updatedDelivery,
      timeline: updatedTimeline,
      auditLog: updatedAuditLog,
      statusHistory: arrayUnion(historyEntry),
    });

    if (req.alumniId) {
      pushNotificationToBell(
        `Request Status: ${status}`,
        `Your document request (${req.id}) has been updated to "${status}".`,
        getDocumentRequestLink(req.applicantRole, req.id),
        'service',
        req.alumniId,
        req.id
      );
    }

    addToast('success', 'Status Updated', `Request #${requestId} is now ${status}`);
  };

  const verifyPayment = (requestId: string, staffName: string = 'Accounts Office') => {
    const now = new Date().toLocaleString();
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    const updatedPayment = { ...req.payment, isVerified: true };
    const updatedChecklist = { ...req.checklist, paymentVerified: true };
    const updatedTimeline = req.timeline.map((item) =>
      item.step.includes('Payment Verified')
        ? { ...item, completed: true, timestamp: now, handledBy: staffName, isCurrent: true }
        : { ...item, isCurrent: false }
    );
    const updatedAuditLog = [
      {
        id: `aud-${Date.now()}`,
        action: 'PAYMENT_VERIFIED',
        performedBy: staffName,
        timestamp: now,
        details: `Payment of BDT ${req.payment.totalAmount} manually reconciled`,
      },
      ...req.auditLog,
    ];
    const historyEntry = buildStatusHistoryEntry(
      'Payment Verified',
      staffName,
      `Payment of BDT ${req.payment.totalAmount} verified`
    );

    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'Payment Verified',
              payment: updatedPayment,
              checklist: updatedChecklist,
              timeline: updatedTimeline,
              auditLog: updatedAuditLog,
              statusHistory: [...(r.statusHistory || []), historyEntry],
            }
          : r
      )
    );

    persistRequestPatch(requestId, {
      status: 'payment verified',
      payment: updatedPayment,
      checklist: updatedChecklist,
      timeline: updatedTimeline,
      auditLog: updatedAuditLog,
      statusHistory: arrayUnion(historyEntry),
    });

    if (req.alumniId) {
      pushNotificationToBell(
        'Payment Confirmed',
        `Your payment for request #${requestId} was verified by the Accounts Office.`,
        getDocumentRequestLink(req.applicantRole, requestId),
        'service',
        req.alumniId,
        requestId
      );
    }
    addToast('success', 'Payment Verified', `Request #${requestId} marked as Payment Verified`);
  };

  const rejectRequest = (
    requestId: string,
    reason: AdminDeskRequest['rejectionReason'],
    message: string,
    staffName: string = 'Exam Controller'
  ) => {
    const now = new Date().toLocaleString();
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      senderRole: 'admin' as const,
      senderName: staffName,
      text: `[REQUEST REJECTED - Reason: ${reason}]: ${message}`,
      timestamp: now,
    };
    const updatedMessages = [...req.messages, newMsg];
    const updatedTimeline = [
      ...req.timeline.map((t) => ({ ...t, isCurrent: false })),
      { step: `Request Rejected (${reason})`, timestamp: now, completed: false, isCurrent: true, remarks: message },
    ];
    const updatedAuditLog = [
      {
        id: `aud-${Date.now()}`,
        action: 'REQUEST_REJECTED',
        performedBy: staffName,
        timestamp: now,
        details: `Rejected due to: ${reason} - ${message}`,
      },
      ...req.auditLog,
    ];
    const historyEntry = buildStatusHistoryEntry('Rejected', staffName, `${reason}: ${message}`);

    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'Rejected',
              rejectionReason: reason,
              rejectionMessage: message,
              adminRemarks: message,
              messages: updatedMessages,
              timeline: updatedTimeline,
              auditLog: updatedAuditLog,
              statusHistory: [...(r.statusHistory || []), historyEntry],
            }
          : r
      )
    );

    persistRequestPatch(requestId, {
      status: 'rejected',
      rejectionReason: reason || 'Other',
      rejectionMessage: message,
      adminRemarks: message,
      messages: updatedMessages,
      timeline: updatedTimeline,
      auditLog: updatedAuditLog,
      statusHistory: arrayUnion(historyEntry),
    });

    if (req.alumniId) {
      pushNotificationToBell(
        'Document Request Rejected',
        `Request #${requestId} was rejected: ${reason}. Click to view details.`,
        getDocumentRequestLink(req.applicantRole, requestId),
        'service',
        req.alumniId,
        requestId
      );
    }
    addToast('error', 'Request Rejected', 'Rejection notice sent to applicant with re-apply option.');
  };

  const requestMoreInfo = (requestId: string, reason: string, staffName: string = 'Admin Staff') => {
    const now = new Date().toLocaleString();
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      senderRole: 'admin' as const,
      senderName: staffName,
      text: `[ACTION REQUIRED]: ${reason}. Please use the upload button to supply the requested file.`,
      timestamp: now,
    };
    const updatedMessages = [...req.messages, newMsg];
    const updatedTimeline = [
      ...req.timeline.map((t) => ({ ...t, isCurrent: false })),
      { step: `Action Required: ${reason}`, timestamp: now, completed: false, isCurrent: true, remarks: reason },
    ];
    const updatedAuditLog = [
      {
        id: `aud-${Date.now()}`,
        action: 'ACTION_REQUIRED',
        performedBy: staffName,
        timestamp: now,
        details: `Requested missing info: ${reason}`,
      },
      ...req.auditLog,
    ];
    const historyEntry = buildStatusHistoryEntry('Action Required', staffName, reason);

    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'Action Required',
              actionRequiredReason: reason,
              adminRemarks: reason,
              messages: updatedMessages,
              timeline: updatedTimeline,
              auditLog: updatedAuditLog,
              statusHistory: [...(r.statusHistory || []), historyEntry],
            }
          : r
      )
    );

    persistRequestPatch(requestId, {
      status: 'action required',
      actionRequiredReason: reason,
      adminRemarks: reason,
      messages: updatedMessages,
      timeline: updatedTimeline,
      auditLog: updatedAuditLog,
      statusHistory: arrayUnion(historyEntry),
    });

    if (req.alumniId) {
      pushNotificationToBell(
        'Action Required on Document Request',
        `Your request #${requestId} requires additional information: ${reason}`,
        getDocumentRequestLink(req.applicantRole, requestId),
        'service',
        req.alumniId,
        requestId
      );
    }
    addToast('warning', 'Action Required Flagged', 'Applicant notified to upload missing details.');
  };

  const markReady = (
    requestId: string,
    staffName: string = 'Controller Office',
    _deliverable?: FinalDeliverableDoc,
    deliveryExtras?: { deliveryUrl?: string; pickupInfo?: string }
  ) => {
    const infoParts = ['Document printed and ready for pickup / digital download.'];
    if (deliveryExtras?.pickupInfo) infoParts.push(`Pickup: ${deliveryExtras.pickupInfo}`);
    if (deliveryExtras?.deliveryUrl) infoParts.push(`Download link attached.`);
    updateRequestStatus(requestId, 'Ready', staffName, infoParts.join(' '), {
      deliveryUrl: deliveryExtras?.deliveryUrl,
      pickupInfo: deliveryExtras?.pickupInfo,
    });
  };

  const markDelivered = (
    requestId: string,
    staffName: string = 'Dispatch Counter',
    courierName?: string,
    trackingNo?: string
  ) => {
    updateRequestStatus(
      requestId,
      'Delivered',
      staffName,
      `Handed over / dispatched via ${courierName || 'SA Paribahan'}${trackingNo ? ` (Tracking: ${trackingNo})` : ''}`,
      {
        courierName,
        courierTrackingNumber: trackingNo,
      }
    );
  };

  const cancelRequest = async (requestId: string): Promise<{ success: boolean; error?: string }> => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) {
      return { success: false, error: 'Request not found.' };
    }
    const stageIdx = req.currentStageIndex ?? 1;
    if (stageIdx > 1 || req.status === 'Rejected' || req.status === 'Cancelled' || req.status === 'Delivered') {
      const msg = 'Requests can only be cancelled before Payment Verification is completed.';
      addToast('warning', 'Cancellation Blocked', msg);
      return { success: false, error: msg };
    }

    const nowIso = new Date().toISOString();
    const nowLabel = new Date().toLocaleString();
    const actorUid = firebaseUser?.uid || req.alumniId;
    const historyEntry = buildStatusHistoryEntry('Cancelled', actorUid, 'Cancelled by requester', {
      stageKey: 'payment_verified',
      action: 'cancel',
      byName: req.alumniName,
    });

    try {
      await updateDoc(doc(db, 'documentRequests', requestId), {
        status: 'cancelled',
        cancelledAt: nowIso,
        cancelledBy: req.alumniName,
        updatedAt: serverTimestamp(),
      });

      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: 'Cancelled',
                cancelledAt: nowIso,
                cancelledBy: req.alumniName,
                statusHistory: [...(r.statusHistory || []), historyEntry],
              }
            : r
        )
      );

      pushNotificationToBell(
        'Document Request Cancelled',
        `Request #${requestId} was cancelled by ${req.alumniName}.`,
        `/admin/admin-desk/requests/${requestId}`,
        'service',
        'ALL_ADMINS',
        requestId
      );
      addToast('info', 'Request Cancelled', `Request #${requestId} has been cancelled.`);
      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Could not cancel request.';
      addToast('error', 'Cancel Failed', msg);
      return { success: false, error: msg };
    }
  };

  const rateRequest = (requestId: string, score: number, comment: string) => {
    const ratingObj = { score, comment, ratedAt: new Date().toISOString() };
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, rating: ratingObj } : r))
    );
    persistRequestPatch(requestId, { rating: ratingObj });
    addToast('success', 'Feedback Submitted', 'Thank you for rating the Admin Desk service!');
  };

  const raiseRequestIssue = (requestId: string, topic: string, description: string) => {
    const issueObj = { topic, description, raisedAt: new Date().toISOString(), resolved: false };
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, issueRaised: issueObj } : r))
    );
    persistRequestPatch(requestId, { issueRaised: issueObj });
    pushNotificationToBell(
      'Issue Raised on Document Request',
      `Applicant reported "${topic}" on #${requestId}.`,
      `/admin/admin-desk/requests/${requestId}`,
      'service',
      'ALL_ADMINS',
      requestId
    );
    addToast('info', 'Complaint Registered', 'University admin desk has logged your ticket.');
  };

  const sendMessageOnRequest = (
    requestId: string,
    senderRole: 'alumni' | 'admin',
    senderName: string,
    text: string,
    attachmentUrl?: string
  ) => {
    const now = new Date().toLocaleString();
    const req = requests.find((r) => r.id === requestId);
    const newMsg = stripUndefined({
      id: `msg-${Date.now()}`,
      senderRole,
      senderName,
      text,
      timestamp: now,
      attachmentUrl,
    });
    const updatedMessages = [...(req?.messages || []), newMsg];

    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, messages: [...r.messages, newMsg] } : r))
    );

    persistRequestPatch(requestId, { messages: updatedMessages });

    if (senderRole === 'admin' && req?.alumniId) {
      pushNotificationToBell(
        `New message on #${requestId}`,
        `${senderName}: ${text}`,
        getDocumentRequestLink(req.applicantRole, requestId),
        'service',
        req.alumniId,
        requestId
      );
    } else if (senderRole === 'alumni') {
      pushNotificationToBell(
        `Applicant reply on #${requestId}`,
        `${senderName}: ${text}`,
        `/admin/admin-desk/requests/${requestId}`,
        'service',
        'ALL_ADMINS',
        requestId
      );
    }
  };

  const updateChecklist = (requestId: string, key: keyof AdminDeskRequest['checklist'], value: boolean) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;
    const updatedChecklist = { ...req.checklist, [key]: value };
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, checklist: updatedChecklist } : r))
    );
    persistRequestPatch(requestId, { checklist: updatedChecklist });
  };

  const assignStaff = (requestId: string, staffId: string, staffName: string) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;
    const updatedAuditLog = [
      {
        id: `aud-${Date.now()}`,
        action: 'ASSIGNED',
        performedBy: 'Admin Desk Coordinator',
        timestamp: new Date().toLocaleString(),
        details: `Assigned to ${staffName}`,
      },
      ...req.auditLog,
    ];
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              assignedStaffId: staffId,
              assignedStaffName: staffName,
              auditLog: updatedAuditLog,
            }
          : r
      )
    );
    persistRequestPatch(requestId, {
      assignedStaffId: staffId,
      assignedStaffName: staffName,
      auditLog: updatedAuditLog,
    });
    addToast('info', 'Staff Assigned', `Request #${requestId} assigned to ${staffName}`);
  };

  const reUploadMissingDoc = (requestId: string, uploadedDoc: AdminDeskRequest['uploadedDocuments'][0]) => {
    const now = new Date().toLocaleString();
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    const updatedDocs = [...req.uploadedDocuments, uploadedDoc];
    const updatedChecklist = { ...req.checklist, documentsValid: true };
    const updatedMessages = [
      ...req.messages,
      {
        id: `msg-${Date.now()}`,
        senderRole: 'alumni' as const,
        senderName: req.alumniName,
        text: `I have re-uploaded the requested document: ${uploadedDoc.name}. Kindly resume review.`,
        timestamp: now,
      },
    ];
    const updatedAuditLog = [
      {
        id: `aud-${Date.now()}`,
        action: 'DOCUMENT_RE_UPLOADED',
        performedBy: req.alumniName,
        timestamp: now,
        details: `Uploaded ${uploadedDoc.name} (${uploadedDoc.size})`,
      },
      ...req.auditLog,
    ];
    const historyEntry = buildStatusHistoryEntry(
      'Under Review',
      req.alumniName,
      `Re-uploaded ${uploadedDoc.name}`
    );

    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'Under Review',
              uploadedDocuments: updatedDocs,
              checklist: updatedChecklist,
              messages: updatedMessages,
              auditLog: updatedAuditLog,
              statusHistory: [...(r.statusHistory || []), historyEntry],
            }
          : r
      )
    );

    persistRequestPatch(requestId, {
      status: 'under review',
      uploadedDocuments: updatedDocs,
      checklist: updatedChecklist,
      messages: updatedMessages,
      auditLog: updatedAuditLog,
      statusHistory: arrayUnion(historyEntry),
    });

    pushNotificationToBell(
      'Applicant Re-Uploaded Document',
      `${req.alumniName} uploaded ${uploadedDoc.name} for request #${requestId}.`,
      `/admin/admin-desk/requests/${requestId}`,
      'service',
      'ALL_ADMINS',
      requestId
    );
    addToast('success', 'Document Uploaded', 'Document received. Status returned to Under Review.');
  };

  // Catalog Handlers
  const addService = (srv: Omit<AdminDeskService, 'id'>) => {
    const id = `srv-${Date.now()}`;
    setServices((prev) => [...prev, { ...srv, id }]);
    addToast('success', 'Service Added', `${srv.name} is now available in the catalog.`);
  };

  const updateService = (id: string, updates: Partial<AdminDeskService>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    addToast('success', 'Catalog Updated', 'Service configuration saved.');
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    addToast('info', 'Service Deleted', 'The service has been removed from the catalog.');
  };

  const toggleServiceEnabled = (id: string) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  // Notices Handlers
  const addNotice = (notice: Omit<NoticeItem, 'id' | 'publishedAt' | 'readCount'>) => {
    const id = `not-${Date.now()}`;
    const newNotice: NoticeItem = {
      ...notice,
      id,
      publishedAt: new Date().toISOString().split('T')[0],
      readCount: 0,
      isRead: false
    };
    setNotices((prev) => [newNotice, ...prev]);
    pushNotificationToBell('New University Notice', notice.title, `${deskBase}/admin-desk`, 'announcement');
    addToast('success', 'Notice Published', notice.title);
  };

  const updateNotice = (id: string, updates: Partial<NoticeItem>) => {
    setNotices((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));
    addToast('success', 'Notice Updated', 'Changes saved.');
  };

  const deleteNotice = (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
    addToast('info', 'Notice Removed', 'The notice has been removed.');
  };

  const toggleNoticePin = (id: string) => {
    setNotices((prev) => prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n)));
  };

  const rsvpNotice = (id: string) => {
    setNotices((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
        const userRsvpd = !n.userRsvpd;
        const rsvpCount = (n.rsvpCount || 0) + (userRsvpd ? 1 : -1);
        return { ...n, userRsvpd, rsvpCount: Math.max(0, rsvpCount) };
      })
    );
    addToast('success', 'Event RSVP Recorded', 'Your participation interest has been noted!');
  };

  const markAllNoticesRead = () => {
    setNotices((prev) => prev.map((n) => ({ ...n, isRead: true })));
    addToast('info', 'Notices Marked as Read');
  };

  // Vacancy Handlers
  const addVacancy = (vac: Omit<VacancyItem, 'id' | 'publishedAt'>) => {
    const id = `vac-${Date.now()}`;
    const newVac: VacancyItem = {
      ...vac,
      id,
      publishedAt: new Date().toISOString().split('T')[0]
    };
    setVacancies((prev) => [newVac, ...prev]);
    pushNotificationToBell('New University Job Circular', `${vac.title} (${vac.department})`, `${deskBase}/admin-desk`, 'announcement');
    addToast('success', 'Vacancy Posted', vac.title);
  };

  const updateVacancy = (id: string, updates: Partial<VacancyItem>) => {
    setVacancies((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
    addToast('success', 'Vacancy Updated');
  };

  const deleteVacancy = (id: string) => {
    setVacancies((prev) => prev.filter((v) => v.id !== id));
    addToast('info', 'Vacancy Deleted');
  };

  const toggleVacancyStatus = (id: string) => {
    setVacancies((prev) => prev.map((v) => (v.id === id ? { ...v, status: v.status === 'Open' ? 'Closed' : 'Open' } : v)));
  };

  const toggleSaveVacancy = (id: string) => {
    setVacancies((prev) => prev.map((v) => (v.id === id ? { ...v, isSaved: !v.isSaved } : v)));
  };

  const submitVacancyApplication = (appData: Omit<VacancyApplication, 'id' | 'appliedAt' | 'status'>) => {
    const id = `app-${Date.now()}`;
    const newApp: VacancyApplication = {
      ...appData,
      id,
      status: 'Applied',
      appliedAt: new Date().toISOString().split('T')[0]
    };
    setApplications((prev) => [newApp, ...prev]);
    pushNotificationToBell(
      'Job Application Submitted',
      `Your application for ${appData.vacancyTitle} has been received by the University Recruitment Board.`,
      `${deskBase}/admin-desk`
    );
    addToast('success', 'Application Submitted', `Applied for ${appData.vacancyTitle}`);
  };

  const updateApplicationStatus = (
    appId: string, 
    status: VacancyApplication['status'], 
    interviewDetails?: VacancyApplication['interviewDetails'], 
    adminNotes?: string
  ) => {
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id !== appId) return a;
        return {
          ...a,
          status,
          interviewDetails: interviewDetails || a.interviewDetails,
          adminNotes: adminNotes || a.adminNotes
        };
      })
    );

    const app = applications.find((a) => a.id === appId);
    if (app) {
      pushNotificationToBell(
        `Application Update: ${status}`,
        `Your application for ${app.vacancyTitle} status changed to ${status}.`,
        `${deskBase}/admin-desk`
      );
    }
    addToast('success', 'Applicant Status Updated', `Status changed to ${status}`);
  };

  // Support & Settings
  const submitSupportTicket = (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>) => {
    const id = `TCK-${Math.floor(100 + Math.random() * 900)}`;
    const newTicket: SupportTicket = {
      ...ticket,
      id,
      status: 'Open',
      createdAt: new Date().toLocaleString()
    };
    setSupportTickets((prev) => [newTicket, ...prev]);
    addToast('success', 'Ticket Submitted', `Ticket #${id} created. Registrar office will reply within 24 hours.`);
  };

  const resolveSupportTicket = (id: string, reply: string) => {
    setSupportTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'Resolved', reply } : t)));
    addToast('success', 'Ticket Resolved', `Reply dispatched to alumni.`);
  };

  const updateSettings = (newSettings: Partial<AdminDeskSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addToast('success', 'Settings Saved', 'Office hours and service charges updated.');
  };

  const resetToDefaults = () => {
    setServices(initialServiceCatalog);
    setSettings(initialAdminDeskSettings);
    addToast('info', 'Reset Admin Desk Configuration');
  };

  return (
    <AdminDeskContext.Provider
      value={{
        services,
        requests,
        documentRequests,
        documentRequestsLoading,
        notices,
        vacancies,
        applications,
        staffMembers,
        settings,
        supportTickets,
        submitRequest,
        submitQuickDocumentRequest,
        advanceDocumentStage,
        undoLastDocumentStage,
        rejectDocumentRequest,
        updateDocumentDeliveryInfo,
        updateRequestStatus,
        verifyPayment,
        rejectRequest,
        requestMoreInfo,
        markReady,
        markDelivered,
        cancelRequest,
        rateRequest,
        raiseRequestIssue,
        sendMessageOnRequest,
        updateChecklist,
        assignStaff,
        reUploadMissingDoc,
        addService,
        updateService,
        deleteService,
        toggleServiceEnabled,
        addNotice,
        updateNotice,
        deleteNotice,
        toggleNoticePin,
        rsvpNotice,
        markAllNoticesRead,
        addVacancy,
        updateVacancy,
        deleteVacancy,
        toggleVacancyStatus,
        toggleSaveVacancy,
        submitVacancyApplication,
        updateApplicationStatus,
        submitSupportTicket,
        resolveSupportTicket,
        updateSettings,
        resetToDefaults
      }}
    >
      {children}
    </AdminDeskContext.Provider>
  );
};

export const useAdminDeskStore = (): AdminDeskContextType => {
  const context = useContext(AdminDeskContext);
  if (!context) {
    throw new Error('useAdminDeskStore must be used within an AdminDeskProvider');
  }
  return context;
};
