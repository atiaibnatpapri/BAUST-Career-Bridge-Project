/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  UserRole,
  Language,
  AlumniProfile,
  StudentProfile,
  ServiceRequest,
  MentorshipRequest,
  VerificationItem,
  ChatMessage,
  Conversation,
  ConversationSource,
  Announcement,
  Notification,
  Department,
} from '../types';
import { translations } from '../data/translations';
import { useAuth, normalizeProfile, UserProfileData } from './AuthContext';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  onSnapshot,
  query,
  QueryDocumentSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, db, isTransientFirestoreError, subscribeFirestoreSyncState } from '../firebase';
import { toList, safeArray } from '../utils/utils';
import { isDemoAccountEmail } from '../config/demoConfig';
import {
  createFirestoreMentorship,
  logPortalActivity,
  subscribeFirestoreMentorships,
  subscribeFirestoreUsers,
  tsToMillis,
  updateFirestoreMentorship,
} from '../services/firestorePortal';
import {
  clearConversationUnread,
  fetchEarlierConversationMessages,
  getDocumentRequestLink,
  markNotificationReadFirestore,
  openOrCreateFirestoreConversation,
  sendFirestoreMessage,
  subscribeConversationMessages,
  subscribeConversations,
  subscribeNotifications,
  triggerNotification,
} from '../services/careerBridgeService';
import {
  buildConversationDocId,
  buildInitialDocumentStages,
  DOC_STAGES,
  isVerifiedVisibleAlumni,
  normalizeDepartment,
  normalizeStageIndexFromStatus,
  sanitizeUserForViewer,
} from '../constants/baustDataModel';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface StaffUserShape {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'superAdmin';
  avatar: string;
  department: string;
  batch: string;
  office?: string;
  isVerified?: boolean;
  isDemo?: boolean;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
}

interface AppContextType {
  role: UserRole;
  currentUser: StudentProfile | AlumniProfile | StaffUserShape;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];

  // Live Firestore Data States (#63: single source of truth)
  allUsers: UserProfileData[];
  usersLoading: boolean;
  alumniList: AlumniProfile[];
  studentList: StudentProfile[];
  serviceRequests: ServiceRequest[];
  mentorshipRequests: MentorshipRequest[];
  verifications: VerificationItem[];
  verificationsLoading: boolean;
  conversations: Conversation[];
  conversationsLoading: boolean;
  isReconnecting: boolean;
  messages: Record<string, ChatMessage[]>;
  hasMoreMessages: Record<string, boolean>;
  loadingEarlierMessages: Record<string, boolean>;
  announcements: Announcement[];
  notifications: Notification[];

  // Actions
  addServiceRequest: (
    newReq: Omit<ServiceRequest, 'id' | 'submittedAt' | 'timeline' | 'status' | 'estimatedDelivery'>
  ) => void;
  updateServiceRequestStatus: (
    id: string,
    status: ServiceRequest['status'],
    remarks?: string,
    trackingNumber?: string
  ) => void;

  requestMentorship: (
    req: Omit<MentorshipRequest, 'id' | 'createdAt' | 'status'>
  ) => Promise<{ success: boolean; error?: string }>;
  respondMentorship: (
    id: string,
    action: 'Accepted' | 'Declined' | 'On Hold' | 'Cancelled',
    feedback?: string,
    meetingLink?: string
  ) => Promise<void>;

  watchConversationMessages: (conversationId: string | null) => void;
  loadEarlierMessages: (conversationId: string) => Promise<void>;
  markThreadRead: (conversationId: string) => void;
  sendMessage: (
    conversationId: string,
    text: string,
    attachment?: ChatMessage['attachment'],
    recipientIdOverride?: string
  ) => Promise<void>;
  openOrCreateConversation: (participantId: string, source?: ConversationSource) => Promise<string | null>;

  approveVerification: (userId: string) => Promise<boolean>;
  rejectVerification: (userId: string, reason: string) => Promise<boolean>;

  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'date'>) => void;
  deleteAnnouncement: (id: string) => void;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message?: string) => void;
  removeToast: (id: string) => void;

  updateAlumniMentorSettings: (available: boolean, slots: string[], topics: any[]) => void;
  updateStudentProfile: (updatedData: Partial<StudentProfile>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const FALLBACK_GUEST_USER: StaffUserShape = {
  id: '',
  name: '',
  email: '',
  role: 'student' as any,
  avatar: '',
  department: '',
  batch: '',
  isVerified: false,
  verificationStatus: 'pending',
};

function formatSubmittedTimestamp(raw: any): { text: string; millis: number } {
  if (!raw) {
    return { text: 'Just now', millis: Date.now() };
  }
  if (typeof raw?.toDate === 'function') {
    const d = raw.toDate() as Date;
    return {
      text: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      millis: d.getTime(),
    };
  }
  if (typeof raw === 'string') {
    const parsed = Date.parse(raw);
    return {
      text: raw,
      millis: Number.isNaN(parsed) ? Date.now() : parsed,
    };
  }
  return { text: 'Just now', millis: Date.now() };
}

function normalizeVerificationStatus(raw: any): VerificationItem['status'] {
  const s = String(raw || 'pending').toLowerCase().trim();
  if (s === 'approved') return 'Approved';
  if (s === 'rejected') return 'Rejected';
  return 'Pending';
}

function toAlumniProfile(u: UserProfileData, viewerUid?: string, viewerRole?: UserRole): AlumniProfile {
  const safe = sanitizeUserForViewer(u, viewerUid, viewerRole) || u;
  return {
    id: safe.id || safe.uid || '',
    name: safe.name || 'BAUST Alumni',
    email: safe.email || '',
    role: 'alumni',
    avatar: safe.avatar || '',
    department: normalizeDepartment(safe.department),
    batch: safe.batch || '',
    phone: safe.phone || '',
    bio: safe.bio || '',
    designation: safe.designation || 'BAUST Alumni',
    company: safe.company || 'Partner Organization',
    sector: (safe.sector as any) || 'Private',
    location: safe.location || 'Bangladesh',
    passingYear: typeof safe.passingYear === 'number' ? safe.passingYear : 2020,
    linkedin: safe.linkedin || '',
    github: safe.github || '',
    skills: toList(safe.skills),
    mentoringAvailable: Boolean(safe.mentoringAvailable),
    mentorshipTopics: toList(safe.mentorshipTopics) as any,
    availableSlots: toList(safe.availableSlots),
    experienceTimeline: safeArray(safe.experienceTimeline),
    education: safeArray(safe.education),
    achievements: toList(safe.achievements),
    totalMentees: typeof safe.totalMentees === 'number' ? safe.totalMentees : 0,
    rating: typeof safe.rating === 'number' ? safe.rating : 0,
    verifiedAlumniBadge: Boolean(safe.verifiedAlumniBadge),
    isFeatured: Boolean(safe.isFeatured),
    isVerified: Boolean(safe.isVerified),
    verificationStatus: safe.verificationStatus,
    hideEmail: Boolean(safe.hideEmail),
    hidePhone: Boolean(safe.hidePhone),
    profileVisibility: safe.profileVisibility === 'private' ? 'private' : 'public',
  };
}

function toStudentProfile(u: UserProfileData, viewerUid?: string, viewerRole?: UserRole): StudentProfile {
  const safe = sanitizeUserForViewer(u, viewerUid, viewerRole) || u;
  return {
    id: safe.id || safe.uid || '',
    name: safe.name || 'BAUST Student',
    email: safe.email || '',
    role: 'student',
    avatar: safe.avatar || '',
    department: normalizeDepartment(safe.department),
    batch: safe.batch || '',
    phone: safe.phone || '',
    bio: safe.bio || '',
    studentId: safe.studentId || safe.baustId || '',
    currentSemester: safe.currentSemester || 'Level-1, Term-I',
    cgpa: typeof safe.cgpa === 'number' ? safe.cgpa : 0,
    interests: toList(safe.interests),
    careerGoal: safe.careerGoal || '',
    cvFileName: safe.cvFileName || '',
    skills: toList(safe.skills),
    isVerified: Boolean(safe.isVerified),
    verificationStatus: safe.verificationStatus,
    hideEmail: Boolean(safe.hideEmail),
    hidePhone: Boolean(safe.hidePhone),
    profileVisibility: safe.profileVisibility === 'private' ? 'private' : 'public',
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    firebaseUser,
    userProfile,
    loading: authLoading,
    updateUserProfile: updateFirebaseUserProfile,
    registerSessionCleanup,
  } = useAuth();

  const role: UserRole = userProfile?.role ?? 'student';

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('baust_lang');
    return saved === 'bn' ? 'bn' : 'en';
  });

  const [allUsers, setAllUsers] = useState<UserProfileData[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(false);
  const [alumniList, setAlumniList] = useState<AlumniProfile[]>([]);
  const [studentList, setStudentList] = useState<StudentProfile[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([]);
  const [verifications, setVerifications] = useState<VerificationItem[]>([]);
  const [verificationsLoading, setVerificationsLoading] = useState<boolean>(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState<boolean>(false);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [hasMoreMessages, setHasMoreMessages] = useState<Record<string, boolean>>({});
  const [loadingEarlierMessages, setLoadingEarlierMessages] = useState<Record<string, boolean>>({});
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [localReadNotifIds, setLocalReadNotifIds] = useState<Record<string, boolean>>({});
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const msgUnsubRef = useRef<(() => void) | null>(null);
  const activeConvIdRef = useRef<string | null>(null);
  const oldestSnapRef = useRef<Record<string, QueryDocumentSnapshot<DocumentData> | null>>({});
  const olderMessagesRef = useRef<Record<string, ChatMessage[]>>({});

  const isApprovedSession =
    !authLoading &&
    Boolean(firebaseUser) &&
    userProfile?.verificationStatus === 'approved' &&
    !userProfile?.suspended;

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastMessage['type'], title: string, message?: string) => {
      const id = 'toast-' + Date.now() + Math.random().toString(36).substring(2, 5);
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  // Live Firestore / Network sync state
  useEffect(() => {
    return subscribeFirestoreSyncState((reconnecting) => {
      setIsReconnecting(reconnecting);
    });
  }, []);

  // Global Unhandled Promise Rejection Handler (#34) — ignores transient offline/WebSocket blips
  useEffect(() => {
    const onUnhandled = (event: PromiseRejectionEvent) => {
      if (isTransientFirestoreError(event.reason)) {
        return;
      }
      console.error('Unhandled async promise rejection:', event.reason);
      const msg =
        event.reason?.message ||
        (typeof event.reason === 'string' ? event.reason : 'Unexpected background operation error.');
      addToast('error', language === 'bn' ? 'অপ্রত্যাশিত ত্রুটি' : 'Unexpected Error', String(msg).slice(0, 140));
    };
    window.addEventListener('unhandledrejection', onUnhandled);
    return () => window.removeEventListener('unhandledrejection', onUnhandled);
  }, [addToast, language]);

  // Reset transient state on logout
  useEffect(() => {
    return registerSessionCleanup(() => {
      if (msgUnsubRef.current) {
        msgUnsubRef.current();
        msgUnsubRef.current = null;
      }
      activeConvIdRef.current = null;
      oldestSnapRef.current = {};
      olderMessagesRef.current = {};
      setAllUsers([]);
      setUsersLoading(false);
      setAlumniList([]);
      setStudentList([]);
      setServiceRequests([]);
      setMentorshipRequests([]);
      setVerifications([]);
      setVerificationsLoading(false);
      setConversations([]);
      setConversationsLoading(false);
      setMessages({});
      setHasMoreMessages({});
      setLoadingEarlierMessages({});
      setAnnouncements([]);
      setNotifications([]);
      setLocalReadNotifIds({});
      setToasts([]);
    });
  }, [registerSessionCleanup]);

  useEffect(() => {
    localStorage.setItem('baust_lang', language);
  }, [language]);

  // 1. Real-time Firestore Users listener (for approved signed-in users) -> Single Source of Truth (#42, #50, #63)
  useEffect(() => {
    if (!isApprovedSession || !firebaseUser) {
      setAllUsers([]);
      setAlumniList([]);
      setStudentList([]);
      setUsersLoading(false);
      return;
    }

    setUsersLoading(true);
    return subscribeFirestoreUsers(
      (rawUsers) => {
        const normalized = rawUsers.map((raw) =>
          normalizeProfile(raw.id || raw.uid, raw, raw.email)
        );
        setAllUsers(normalized);

        const visibleAlumni = normalized
          .filter((u) => isVerifiedVisibleAlumni(u))
          .map((u) => toAlumniProfile(u, firebaseUser.uid, userProfile?.role));
        setAlumniList(visibleAlumni);

        const visibleStudents = normalized
          .filter((u) => u.role === 'student' && u.verificationStatus === 'approved' && !u.suspended)
          .map((u) => toStudentProfile(u, firebaseUser.uid, userProfile?.role));
        setStudentList(visibleStudents);
        setUsersLoading(false);
      },
      (err) => {
        console.warn('Firestore users listener warning:', err.message);
        setUsersLoading(false);
      }
    );
  }, [isApprovedSession, firebaseUser, userProfile?.role]);

  // 2. Real-time Firestore Notifications Rule Engine (#45)
  useEffect(() => {
    if (!isApprovedSession || !firebaseUser || !userProfile) {
      setNotifications([]);
      return;
    }

    return subscribeNotifications(
      firebaseUser.uid,
      userProfile.role,
      (items) => {
        setNotifications(
          items.map((n) => (localReadNotifIds[n.id] ? { ...n, read: true } : n))
        );
      },
      (err) => {
        console.warn('Notifications listener warning:', err.message);
      }
    );
  }, [isApprovedSession, firebaseUser, userProfile?.role, localReadNotifIds]);

  // 3. Real-time Firestore Conversations listener (FR-11, Part 3)
  useEffect(() => {
    if (!isApprovedSession || !firebaseUser) {
      setConversations([]);
      setConversationsLoading(false);
      setMessages({});
      return;
    }

    setConversationsLoading(true);
    return subscribeConversations(
      firebaseUser.uid,
      (items) => {
        setConversations(items);
        setConversationsLoading(false);
      },
      (err) => {
        setConversationsLoading(false);
        console.warn('Conversations listener warning:', err.message);
      }
    );
  }, [isApprovedSession, firebaseUser]);

  // 4. Real-time Firestore Document Requests for current scope
  useEffect(() => {
    if (!isApprovedSession || !firebaseUser || !userProfile) {
      setServiceRequests([]);
      return;
    }

    const colRef = collection(db, 'documentRequests');
    const q =
      userProfile.role === 'admin' || userProfile.role === 'superAdmin'
        ? colRef
        : query(colRef, where('userId', '==', firebaseUser.uid));

    return onSnapshot(
      q,
      (snap) => {
        const docs: ServiceRequest[] = snap.docs.map((d) => {
          const data = d.data() as Record<string, any>;
          const created = formatSubmittedTimestamp(data.createdAt);
          const rawStatus = String(data.status || 'submitted').toLowerCase();
          const stageIdx = normalizeStageIndexFromStatus(rawStatus, data.currentStageIndex);
          const mappedStatus: ServiceRequest['status'] =
            rawStatus === 'ready'
              ? 'Ready'
              : rawStatus === 'delivered'
              ? 'Delivered'
              : rawStatus === 'approved'
              ? 'Approved'
              : rawStatus === 'rejected'
              ? 'Rejected'
              : rawStatus === 'under review' || rawStatus === 'processing'
              ? 'Under Review'
              : 'Pending';

          const canonicalStages =
            Array.isArray(data.stages) && data.stages.length === DOC_STAGES.length
              ? data.stages
              : DOC_STAGES.map((st, idx) => ({
                  key: st.key,
                  label: st.label,
                  status:
                    rawStatus === 'delivered'
                      ? 'done'
                      : idx < stageIdx
                      ? 'done'
                      : idx === stageIdx
                      ? 'current'
                      : 'pending',
                }));

          return {
            id: data.trackingId || d.id,
            alumniId: data.userId || '',
            alumniName: data.userName || 'BAUST Member',
            alumniEmail: data.userEmail || '',
            alumniPhone: data.phone || data.alumniPhone || '',
            baustId: data.baustId || '',
            department: normalizeDepartment(data.department),
            passingYear: typeof data.passingYear === 'number' ? data.passingYear : 0,
            documentType: (data.type as any) || 'Transcript',
            copies: typeof data.copies === 'number' ? data.copies : 1,
            purpose: (data.purpose as any) || 'Personal Record',
            deliveryMethod:
              data.deliveryMethod === 'Courier (Home Delivery)'
                ? 'Courier (Home Delivery)'
                : 'On-Campus Collection (BAUST Saidpur)',
            deliveryAddress: data.deliveryAddress || '',
            paymentMethod: (data.paymentMethod as any) || 'bKash',
            transactionId: data.transactionId || '',
            amount: typeof data.fee === 'number' ? data.fee : 500,
            status: mappedStatus,
            submittedAt: created.text,
            estimatedDelivery: data.estimatedDelivery || '5 - 7 business days',
            adminRemarks: data.adminRemarks || data.remarks || '',
            timeline: canonicalStages.map((s: any) => ({
              step: s.label,
              timestamp: s.completedAt || (s.status === 'current' ? 'In progress' : 'Pending'),
              completed: s.status === 'done',
              remarks: s.note,
            })),
          };
        });
        setServiceRequests(docs);
      },
      (err) => {
        if (!isTransientFirestoreError(err)) {
          console.warn('Service requests listener warning:', err.message);
        }
      }
    );
  }, [isApprovedSession, firebaseUser, userProfile?.role]);

  // 5. Real-time Firestore `verificationRequests` EXCLUSIVELY for approved Super Admin
  useEffect(() => {
    const isApprovedSuperAdmin = isApprovedSession && userProfile?.role === 'superAdmin';

    if (!isApprovedSuperAdmin) {
      setVerifications([]);
      setVerificationsLoading(false);
      return;
    }

    setVerificationsLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, 'verificationRequests'),
      (snapshot) => {
        const items: Array<VerificationItem & { _sortMillis: number }> = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const status = normalizeVerificationStatus(data.status ?? data.accountStatus);
          const { text, millis } = formatSubmittedTimestamp(data.submittedAt);
          const itemRole: 'student' | 'alumni' | 'admin' =
            data.role === 'admin' ? 'admin' : data.role === 'alumni' ? 'alumni' : 'student';

          items.push({
            id: docSnap.id,
            userId: data.userId || docSnap.id,
            name: data.name || 'Applicant',
            email: data.email || '',
            role: itemRole,
            baustId: data.baustId || data.details?.baustId || data.studentId || 'Pending ID',
            department: normalizeDepartment(data.department || data.details?.department),
            batch: data.batch || data.details?.batch || '',
            passingYear: data.passingYear ?? data.details?.passingYear ?? undefined,
            office: data.office || data.details?.office || '',
            company: data.company || data.details?.company || '',
            designation: data.designation || data.details?.designation || '',
            details: {
              ...(data.details || {}),
              linkedin: data.linkedin || data.details?.linkedin || '',
              verificationProofUrl: data.verificationProofUrl || data.details?.verificationProofUrl || '',
            },
            submittedAt: text,
            documentType:
              data.documentType ||
              (itemRole === 'admin'
                ? 'BAUST Staff Authorization'
                : itemRole === 'alumni'
                ? 'Degree Certificate / Alumni Proof'
                : 'Student ID Card Verification'),
            documentPreviewUrl:
              data.verificationProofUrl ||
              data.documentPreviewUrl ||
              data.linkedin ||
              '',
            status,
            accountStatus: status.toLowerCase() as 'pending' | 'approved' | 'rejected',
            rejectionReason: data.rejectionReason || data.reason || '',
            reason: data.reason || data.rejectionReason || '',
            reviewedAt: data.reviewedAt,
            reviewedBy: data.reviewedBy,
            isDemo: Boolean(data.isDemo) || isDemoAccountEmail(data.email),
            _sortMillis: millis,
          });
        });

        items.sort((a, b) => b._sortMillis - a._sortMillis);
        setVerifications(items.map(({ _sortMillis, ...rest }) => rest));
        setVerificationsLoading(false);
      },
      (error) => {
        console.warn('Firestore verificationRequests listener error:', error.message);
        setVerificationsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isApprovedSession, userProfile?.role]);

  // 6. Real-time Firestore listener for Announcements
  useEffect(() => {
    if (!isApprovedSession) {
      setAnnouncements([]);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, 'announcements'),
      (snap) => {
        const docs: Announcement[] = snap.docs.map((d) => {
          const data = d.data() as Record<string, any>;
          return {
            id: d.id,
            title: data.title ?? 'Announcement',
            category: data.category ?? 'Notice',
            targetAudience: data.targetAudience ?? 'All',
            content: data.content ?? '',
            author: data.author ?? 'BAUST Administration',
            authorId: data.authorId ?? '',
            date: data.date ?? formatSubmittedTimestamp(data.createdAt).text,
            pinned: Boolean(data.pinned),
            linkText: data.linkText,
            linkUrl: data.linkUrl,
            isDemo: Boolean(data.isDemo),
          };
        });
        setAnnouncements(docs);
      },
      (err) => {
        console.warn('Firestore announcements listener warning:', err.message);
      }
    );

    return () => unsubscribe();
  }, [isApprovedSession]);

  // 7. Real-time Firestore listener for Mentorships (scoped by role)
  useEffect(() => {
    if (!isApprovedSession || !firebaseUser || !userProfile) {
      setMentorshipRequests([]);
      return;
    }

    const opts =
      userProfile.role === 'student'
        ? { studentId: firebaseUser.uid }
        : userProfile.role === 'alumni'
        ? { alumniId: firebaseUser.uid }
        : {};

    return subscribeFirestoreMentorships(
      opts,
      (docs) => {
        const mapped: MentorshipRequest[] = docs.map((data) => {
          const rawStatus = String(data.status || 'Pending').trim();
          const normalizedStatus: MentorshipRequest['status'] =
            rawStatus === 'Accepted' ||
            rawStatus === 'Declined' ||
            rawStatus === 'On Hold' ||
            rawStatus === 'Completed' ||
            rawStatus === 'Cancelled'
              ? rawStatus
              : 'Pending';

          return {
            id: data.id,
            studentId: data.studentId ?? '',
            studentName: data.studentName ?? 'BAUST Student',
            studentDept: normalizeDepartment(data.studentDept),
            studentBatch: data.studentBatch ?? '',
            studentAvatar: data.studentAvatar ?? '',
            alumniId: data.alumniId ?? data.mentorId ?? '',
            alumniName: data.alumniName ?? data.mentorName ?? 'BAUST Alumni',
            mentorId: data.mentorId ?? data.alumniId ?? '',
            mentorName: data.mentorName ?? data.alumniName ?? 'BAUST Alumni',
            alumniCompany: data.alumniCompany ?? '',
            topic: data.topic ?? 'Career Guidance',
            note: data.note ?? data.message ?? '',
            message: data.message ?? data.note ?? '',
            preferredDate: data.preferredDate ?? '',
            preferredTime: data.preferredTime ?? '',
            status: normalizedStatus,
            meetingLink: data.meetingLink ?? '',
            scheduledDate: data.preferredDate ?? '',
            scheduledTime: data.preferredTime ?? '',
            createdAt: tsToMillis(data.createdAt)
              ? new Date(tsToMillis(data.createdAt)).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recently',
            updatedAt: tsToMillis(data.updatedAt)
              ? new Date(tsToMillis(data.updatedAt)).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : undefined,
            feedback: data.feedback ?? '',
            statusHistory: Array.isArray(data.statusHistory) ? data.statusHistory : [],
          };
        });
        setMentorshipRequests(mapped);
      },
      (err) => {
        console.warn('Mentorships listener warning:', err.message);
      }
    );
  }, [isApprovedSession, firebaseUser, userProfile?.role]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const currentUser = React.useMemo(() => {
    if (!userProfile) {
      return FALLBACK_GUEST_USER;
    }

    if (userProfile.role === 'student') {
      return toStudentProfile(userProfile, firebaseUser?.uid, userProfile.role);
    }

    if (userProfile.role === 'alumni') {
      return toAlumniProfile(userProfile, firebaseUser?.uid, userProfile.role);
    }

    return {
      id: userProfile.id || firebaseUser?.uid || '',
      name: userProfile.name || (userProfile.role === 'superAdmin' ? 'Super Admin' : 'BAUST Admin'),
      email: userProfile.email || '',
      role: userProfile.role,
      avatar: userProfile.avatar || '',
      department: normalizeDepartment(userProfile.department),
      batch: userProfile.batch || '',
      office: userProfile.office || '',
      isVerified: Boolean(userProfile.isVerified),
      isDemo: Boolean(userProfile.isDemo),
      verificationStatus: userProfile.verificationStatus ?? 'pending',
    } as StaffUserShape;
  }, [userProfile, firebaseUser?.uid]);

  const addServiceRequest = (
    newReq: Omit<ServiceRequest, 'id' | 'submittedAt' | 'timeline' | 'status' | 'estimatedDelivery'>
  ) => {
    if (!firebaseUser) return;
    const trackingId = `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();
    const applicantName = userProfile?.name || newReq.alumniName || 'BAUST Member';
    const stages = buildInitialDocumentStages(applicantName, nowIso);
    void setDoc(doc(db, 'documentRequests', trackingId), {
      id: trackingId,
      trackingId,
      userId: firebaseUser.uid,
      userName: applicantName,
      userEmail: userProfile?.email || newReq.alumniEmail,
      userRole: userProfile?.role || 'student',
      baustId: userProfile?.baustId || newReq.baustId || '',
      department: newReq.department || userProfile?.department || '',
      batch: userProfile?.batch || '',
      passingYear: userProfile?.passingYear || 0,
      alumniPhone: userProfile?.phone || '',
      type: newReq.documentType,
      copies: newReq.copies,
      purpose: newReq.purpose,
      deliveryMethod: newReq.deliveryMethod,
      deliveryAddress: newReq.deliveryAddress || '',
      paymentMethod: newReq.paymentMethod,
      transactionId: newReq.transactionId,
      fee: newReq.amount,
      status: 'submitted',
      stages,
      currentStageIndex: 1,
      currentStageKey: 'payment_verified',
      payment: {
        method: newReq.paymentMethod,
        transactionId: newReq.transactionId,
        subtotal: newReq.amount,
        urgencyFee: 0,
        courierFee: 0,
        totalAmount: newReq.amount,
        isVerified: false,
        paidAt: nowIso,
      },
      statusHistory: [
        {
          status: 'Submitted',
          stageKey: 'submitted',
          action: 'submit',
          at: nowIso,
          by: firebaseUser.uid,
          byName: applicantName,
          note: `Submitted ${newReq.documentType} (${newReq.copies} copy)`,
        },
      ],
      isDemo: Boolean(userProfile?.isDemo),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
      .then(() => {
        void triggerNotification({
          recipientId: 'ALL_ADMINS',
          title: 'New Document Request Submitted',
          message: `${applicantName} requested ${newReq.documentType} (${trackingId}).`,
          type: 'service',
          link: `/admin/admin-desk/requests/${trackingId}`,
          itemId: trackingId,
          refId: trackingId,
        });
        addToast('success', 'Document Request Submitted', `Application ID: ${trackingId}`);
      })
      .catch((err) => {
        addToast('error', 'Request Failed', err?.message || 'Unable to save request.');
      });
  };

  const updateServiceRequestStatus = (
    id: string,
    status: ServiceRequest['status'],
    remarks?: string,
    trackingNumber?: string
  ) => {
    const target = serviceRequests.find((r) => r.id === id);
    const nowIso = new Date().toISOString();
    const actorName = userProfile?.name || 'Admin Staff';
    void getDoc(doc(db, 'documentRequests', id))
      .then(async (snap) => {
        const snapData = snap.exists() ? (snap.data() as Record<string, any>) : {};
        const prevHistory = Array.isArray(snapData.statusHistory) ? snapData.statusHistory : [];
        await updateDoc(doc(db, 'documentRequests', id), {
          status: status.toLowerCase(),
          remarks: remarks || '',
          adminRemarks: remarks || '',
          trackingNumber: trackingNumber || '',
          statusHistory: [
            ...prevHistory,
            { status, at: nowIso, by: actorName, note: remarks || `Updated to ${status}` },
          ],
          updatedAt: serverTimestamp(),
        });

        const recipientUid = target?.alumniId || snapData.userId;
        const applicantRole = snapData.userRole || 'student';
        if (recipientUid) {
          void triggerNotification({
            recipientId: recipientUid,
            title: `Document Status: ${status}`,
            message: `Your request ${id} is now ${status}.`,
            type: 'service',
            link: getDocumentRequestLink(applicantRole, id),
            itemId: id,
            refId: id,
          });
        }
        addToast('success', 'Request Updated', `Status changed to ${status}`);
      })
      .catch((err) => {
        addToast('error', 'Update Failed', err?.message || 'Permission denied.');
      });
  };

  // Strict mentorship validation & duplicate blocking (#51)
  const requestMentorship = async (
    req: Omit<MentorshipRequest, 'id' | 'createdAt' | 'status'>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!firebaseUser) {
      addToast('error', 'Sign In Required', 'Please log in to request mentorship.');
      return { success: false, error: 'Sign in required' };
    }
    if (!req.alumniId) {
      addToast('error', 'Select Alumni Mentor', 'Please select a specific alumni mentor before submitting.');
      return { success: false, error: 'Specific mentor selection required' };
    }

    const duplicate = mentorshipRequests.some(
      (m) =>
        m.studentId === firebaseUser.uid &&
        m.alumniId === req.alumniId &&
        (m.status === 'Pending' || m.status === 'Accepted' || m.status === 'On Hold')
    );
    if (duplicate) {
      addToast(
        'warning',
        'Duplicate Request Blocked',
        `You already have an active or pending mentorship request with ${req.alumniName}.`
      );
      return { success: false, error: 'Duplicate active mentorship request' };
    }

    const pendingCount = mentorshipRequests.filter(
      (m) => m.studentId === firebaseUser.uid && (m.status === 'Pending' || m.status === 'On Hold')
    ).length;
    if (pendingCount >= 3) {
      addToast(
        'warning',
        'Pending Request Limit',
        'You may have at most 3 pending mentorship requests at a time.'
      );
      return { success: false, error: 'Max 3 pending mentorship requests reached' };
    }

    try {
      const createdId = await createFirestoreMentorship({
        studentId: firebaseUser.uid,
        studentName: userProfile?.name || req.studentName,
        studentDept: normalizeDepartment(userProfile?.department || req.studentDept),
        studentBatch: userProfile?.batch || req.studentBatch || '',
        studentAvatar: userProfile?.avatar || req.studentAvatar || '',
        alumniId: req.alumniId,
        alumniName: req.alumniName,
        alumniCompany: req.alumniCompany,
        topic: req.topic,
        note: req.note,
        preferredDate: req.preferredDate,
        preferredTime: req.preferredTime,
        isDemo: Boolean(userProfile?.isDemo),
      });

      void triggerNotification({
        recipientId: req.alumniId,
        title: 'New Mentorship Request',
        message: `${userProfile?.name || 'A student'} requested mentorship on "${req.topic}".`,
        type: 'mentorship',
        link: `/alumni/mentorship?req=${createdId}`,
        itemId: createdId,
        refId: createdId,
      });

      addToast('success', 'Mentorship Requested', `Request sent to ${req.alumniName}`);
      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Unable to send mentorship request.';
      addToast('error', 'Request Failed', msg);
      return { success: false, error: msg };
    }
  };

  const respondMentorship = async (
    id: string,
    action: 'Accepted' | 'Declined' | 'On Hold' | 'Cancelled',
    feedback?: string,
    meetingLink?: string
  ): Promise<void> => {
    const existing = mentorshipRequests.find((m) => m.id === id);
    const actorName = userProfile?.name || existing?.alumniName || 'Alumni Mentor';
    try {
      await updateFirestoreMentorship(id, action, feedback, meetingLink, actorName);

      // Auto-create/open a direct conversation thread when an alumni accepts a mentorship request
      if (action === 'Accepted' && existing?.studentId && firebaseUser && userProfile) {
        const studentUser = allUsers.find((u) => (u.id || u.uid) === existing.studentId);
        void openOrCreateFirestoreConversation({
          currentUid: firebaseUser.uid,
          currentName: userProfile.name,
          currentAvatar: userProfile.avatar,
          currentRole: userProfile.role,
          currentTitle: `${userProfile.designation || 'Alumni'} · ${userProfile.company || 'BAUST'}`,
          participantUid: existing.studentId,
          participantName: existing.studentName || studentUser?.name || 'BAUST Student',
          participantAvatar: existing.studentAvatar || studentUser?.avatar || '',
          participantRole: 'student',
          participantTitle: `${existing.studentDept || 'CSE'} · ${existing.studentBatch || 'BAUST Student'}`,
          source: 'mentorship',
        }).catch(() => {});
      }

      if (action === 'Cancelled' && existing?.alumniId) {
        void triggerNotification({
          recipientId: existing.alumniId,
          title: 'Mentorship Request Cancelled',
          message: `${userProfile?.name || existing.studentName} cancelled the mentorship request (${existing.topic}).`,
          type: 'mentorship',
          link: `/alumni/mentorship?req=${id}`,
          itemId: id,
          refId: id,
        });
      } else if (existing?.studentId) {
        const statusPhrase =
          action === 'On Hold' ? 'placed your mentorship request on hold' : `${action.toLowerCase()} your mentorship request`;
        void triggerNotification({
          recipientId: existing.studentId,
          title: `Mentorship ${action}`,
          message: `${actorName} ${statusPhrase} (${existing.topic}).`,
          type: 'mentorship',
          link: `/student/mentorship?req=${id}`,
          itemId: id,
          refId: id,
        });
      }
      addToast(
        action === 'Accepted' ? 'success' : action === 'On Hold' ? 'warning' : 'info',
        `Mentorship ${action}`,
        `Updated request ${id}`
      );
    } catch (err: any) {
      addToast('error', 'Update Failed', err?.message || 'Could not update mentorship status.');
    }
  };

  // EXCLUSIVELY for Super Admin (both real & Demo Super Admin)
  const approveVerification = async (idOrUid: string): Promise<boolean> => {
    if (!auth.currentUser || userProfile?.role !== 'superAdmin') {
      addToast(
        'error',
        'Super Admin Authorization Required',
        'Only an approved Super Admin can approve registration requests.'
      );
      return false;
    }

    try {
      const existingItem = verifications.find((v) => v.id === idOrUid || v.userId === idOrUid);
      let userId = existingItem?.userId || idOrUid;
      let targetEmail = existingItem?.email || '';
      let isDemoSampleOnly = false;

      const reqSnap = await getDoc(doc(db, 'verificationRequests', existingItem?.id || idOrUid));
      if (reqSnap.exists()) {
        const reqData = reqSnap.data();
        userId = reqData.userId || reqSnap.id;
        targetEmail = reqData.email || targetEmail;
        isDemoSampleOnly = reqSnap.id.startsWith('demo-sample-');
      }

      const reviewerUid = auth.currentUser.uid;
      const targetUserSnap = !isDemoSampleOnly
        ? await getDoc(doc(db, 'users', userId)).catch(() => null)
        : null;
      const targetUserData = targetUserSnap?.exists() ? targetUserSnap.data() : null;
      const targetIsProtectedDemoUser =
        Boolean(targetUserData?.isDemo) || isDemoAccountEmail(targetUserData?.email || targetEmail);

      const batch = writeBatch(db);

      batch.set(
        doc(db, 'verificationRequests', existingItem?.id || userId),
        {
          status: 'approved',
          reviewedBy: reviewerUid,
          reviewedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          reason: '',
        },
        { merge: true }
      );

      if (!isDemoSampleOnly && !targetIsProtectedDemoUser) {
        const resolvedRole = targetUserData?.role || existingItem?.role;
        batch.set(
          doc(db, 'users', userId),
          {
            id: userId,
            uid: userId,
            verificationStatus: 'approved',
            accountStatus: 'approved',
            isVerified: true,
            verifiedAlumniBadge: resolvedRole === 'alumni',
            isDemo: false,
            rejectionReason: '',
            approvedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }

      await batch.commit();

      if (!isDemoSampleOnly) {
        void triggerNotification({
          recipientId: userId,
          title: 'Account Verified & Approved',
          message: 'Your BAUST Career Bridge account has been verified by Super Admin.',
          type: 'verification',
          link: `/${existingItem?.role || 'student'}/dashboard`,
          itemId: userId,
        });
      }

      void logPortalActivity({
        actorId: reviewerUid,
        actorName: userProfile?.name || 'Super Admin',
        actorRole: 'superAdmin',
        action: 'APPROVE_REGISTRATION',
        targetType: 'user',
        targetId: userId,
        details: `Approved ${existingItem?.role || 'member'} registration for ${existingItem?.name || userId}`,
        isDemo: Boolean(userProfile?.isDemo),
      });

      addToast(
        'success',
        'Account Approved',
        `${existingItem?.name || 'Applicant'} has been verified and granted portal access.`
      );
      return true;
    } catch (err: any) {
      console.error('Approval failed:', err);
      addToast(
        'error',
        'Approval Failed',
        `Could not update Firestore user document: ${err.message || 'Permission denied'}`
      );
      return false;
    }
  };

  // EXCLUSIVELY for Super Admin (both real & Demo Super Admin)
  const rejectVerification = async (idOrUid: string, reason: string): Promise<boolean> => {
    if (!auth.currentUser || userProfile?.role !== 'superAdmin') {
      addToast(
        'error',
        'Super Admin Authorization Required',
        'Only an approved Super Admin can reject registration requests.'
      );
      return false;
    }

    try {
      const existingItem = verifications.find((v) => v.id === idOrUid || v.userId === idOrUid);
      let userId = existingItem?.userId || idOrUid;
      let targetEmail = existingItem?.email || '';
      let isDemoSampleOnly = false;

      const reqSnap = await getDoc(doc(db, 'verificationRequests', existingItem?.id || idOrUid));
      if (reqSnap.exists()) {
        const reqData = reqSnap.data();
        userId = reqData.userId || reqSnap.id;
        targetEmail = reqData.email || targetEmail;
        isDemoSampleOnly = reqSnap.id.startsWith('demo-sample-');
      }

      const cleanReason = reason.trim() || 'Credentials could not be matched with BAUST records.';
      const reviewerUid = auth.currentUser.uid;
      const targetUserSnap = !isDemoSampleOnly
        ? await getDoc(doc(db, 'users', userId)).catch(() => null)
        : null;
      const targetUserData = targetUserSnap?.exists() ? targetUserSnap.data() : null;
      const targetIsProtectedDemoUser =
        Boolean(targetUserData?.isDemo) || isDemoAccountEmail(targetUserData?.email || targetEmail);

      const batch = writeBatch(db);

      batch.set(
        doc(db, 'verificationRequests', existingItem?.id || userId),
        {
          status: 'rejected',
          reason: cleanReason,
          rejectionReason: cleanReason,
          reviewedBy: reviewerUid,
          reviewedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      if (!isDemoSampleOnly && !targetIsProtectedDemoUser) {
        batch.set(
          doc(db, 'users', userId),
          {
            id: userId,
            uid: userId,
            verificationStatus: 'rejected',
            accountStatus: 'rejected',
            isVerified: false,
            verifiedAlumniBadge: false,
            isDemo: false,
            rejectionReason: cleanReason,
            rejectedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }

      await batch.commit();

      void logPortalActivity({
        actorId: reviewerUid,
        actorName: userProfile?.name || 'Super Admin',
        actorRole: 'superAdmin',
        action: 'REJECT_REGISTRATION',
        targetType: 'user',
        targetId: userId,
        details: `Rejected ${existingItem?.name || userId}: ${cleanReason}`,
        isDemo: Boolean(userProfile?.isDemo),
      });

      addToast('warning', 'Registration Rejected', `${existingItem?.name || 'Applicant'} request rejected.`);
      return true;
    } catch (err: any) {
      console.error('Rejection failed:', err);
      addToast(
        'error',
        'Rejection Failed',
        `Could not update Firestore user document: ${err.message || 'Permission denied'}`
      );
      return false;
    }
  };

  // Real-Time Firestore Chat Watching & Sending (FR-11, Part 3)
  const markThreadRead = useCallback(
    (conversationId: string) => {
      if (!firebaseUser || !conversationId) return;
      const currentMsgs = messages[conversationId] || [];
      void clearConversationUnread(conversationId, firebaseUser.uid, currentMsgs);
    },
    [firebaseUser, messages]
  );

  const watchConversationMessages = useCallback(
    (conversationId: string | null) => {
      if (activeConvIdRef.current === conversationId) return;
      if (msgUnsubRef.current) {
        msgUnsubRef.current();
        msgUnsubRef.current = null;
      }
      activeConvIdRef.current = conversationId;
      if (!conversationId || !isApprovedSession || !firebaseUser) return;

      msgUnsubRef.current = subscribeConversationMessages(
        conversationId,
        50,
        ({ messages: liveMsgs, hasMore, oldestSnap }) => {
          if (!olderMessagesRef.current[conversationId]?.length) {
            oldestSnapRef.current[conversationId] = oldestSnap;
            setHasMoreMessages((prev) => ({ ...prev, [conversationId]: hasMore }));
          }

          const older = olderMessagesRef.current[conversationId] || [];
          const mergedMap = new Map<string, ChatMessage>();
          older.forEach((m) => mergedMap.set(m.id, m));
          liveMsgs.forEach((m) => mergedMap.set(m.id, m));
          const merged = Array.from(mergedMap.values()).sort(
            (a, b) => tsToMillis(a.createdAt) - tsToMillis(b.createdAt)
          );

          setMessages((prev) => ({
            ...prev,
            [conversationId]: merged,
          }));

          // Mark unread messages as read while thread is active
          const hasUnreadForMe = liveMsgs.some(
            (m) => m.senderId !== firebaseUser.uid && !(m.readBy || []).includes(firebaseUser.uid)
          );
          if (hasUnreadForMe) {
            void clearConversationUnread(conversationId, firebaseUser.uid, liveMsgs);
          } else {
            void clearConversationUnread(conversationId, firebaseUser.uid, []);
          }
        },
        (err) => {
          console.warn('Conversation messages listener warning:', err.message);
        }
      );
    },
    [isApprovedSession, firebaseUser]
  );

  const loadEarlierMessages = useCallback(
    async (conversationId: string): Promise<void> => {
      const cursor = oldestSnapRef.current[conversationId];
      if (!cursor || loadingEarlierMessages[conversationId]) return;
      setLoadingEarlierMessages((prev) => ({ ...prev, [conversationId]: true }));
      try {
        const res = await fetchEarlierConversationMessages(conversationId, cursor, 50);
        oldestSnapRef.current[conversationId] = res.oldestSnap;
        setHasMoreMessages((prev) => ({ ...prev, [conversationId]: res.hasMore }));

        const existingOlder = olderMessagesRef.current[conversationId] || [];
        const olderMap = new Map<string, ChatMessage>();
        res.messages.forEach((m) => olderMap.set(m.id, m));
        existingOlder.forEach((m) => olderMap.set(m.id, m));
        const nextOlder = Array.from(olderMap.values()).sort(
          (a, b) => tsToMillis(a.createdAt) - tsToMillis(b.createdAt)
        );
        olderMessagesRef.current[conversationId] = nextOlder;

        setMessages((prev) => {
          const current = prev[conversationId] || [];
          const mergedMap = new Map<string, ChatMessage>();
          nextOlder.forEach((m) => mergedMap.set(m.id, m));
          current.forEach((m) => mergedMap.set(m.id, m));
          const merged = Array.from(mergedMap.values()).sort(
            (a, b) => tsToMillis(a.createdAt) - tsToMillis(b.createdAt)
          );
          return { ...prev, [conversationId]: merged };
        });
      } catch (err: any) {
        if (!isTransientFirestoreError(err)) {
          addToast('error', 'Load Earlier Failed', err?.message || 'Could not load earlier messages.');
        }
      } finally {
        setLoadingEarlierMessages((prev) => ({ ...prev, [conversationId]: false }));
      }
    },
    [addToast, loadingEarlierMessages]
  );

  const sendMessage = async (
    conversationId: string,
    text: string,
    attachment?: ChatMessage['attachment'],
    recipientIdOverride?: string
  ): Promise<void> => {
    if (!firebaseUser || !userProfile) return;
    const conv = conversations.find((c) => c.id === conversationId);
    const derivedOther =
      recipientIdOverride ||
      conv?.participantId ||
      conversationId.split('_').find((p) => p && p !== firebaseUser.uid) ||
      '';
    const matchedRecipient = allUsers.find((u) => (u.id || u.uid) === derivedOther);
    const recipientRole: UserRole =
      conv?.participantRole || (matchedRecipient?.role as UserRole) || 'alumni';

    try {
      await sendFirestoreMessage({
        conversationId,
        senderId: firebaseUser.uid,
        senderName: userProfile.name,
        senderAvatar: userProfile.avatar,
        recipientId: derivedOther,
        recipientRole,
        text,
        attachment,
      });
    } catch (err: any) {
      if (!isTransientFirestoreError(err)) {
        addToast('error', 'Message Failed', err?.message || 'Could not send message.');
      }
      throw err;
    }
  };

  const openOrCreateConversation = async (
    participantId: string,
    source: ConversationSource = 'directory'
  ): Promise<string | null> => {
    if (!firebaseUser || !userProfile || !participantId || participantId === firebaseUser.uid) {
      return null;
    }

    const expectedId = buildConversationDocId(firebaseUser.uid, participantId);
    const existing = conversations.find((c) => c.id === expectedId || c.participantId === participantId);
    if (existing) return existing.id;

    const match = allUsers.find((u) => (u.id || u.uid) === participantId);
    const alumniMatch = alumniList.find((a) => a.id === participantId);
    const studentMatch = studentList.find((s) => s.id === participantId);
    let target: any = match || alumniMatch || studentMatch;

    if (!target) {
      const snap = await getDoc(doc(db, 'users', participantId)).catch(() => null);
      if (snap?.exists()) {
        target = { id: snap.id, ...(snap.data() as Record<string, any>) };
      }
    }

    if (!target) return null;

    const targetRole: UserRole = (target.role as UserRole) || 'alumni';
    const targetTitle =
      targetRole === 'alumni'
        ? `${target.designation || 'Alumni'}${target.company ? ` · ${target.company}` : ''}`
        : `${target.department || 'CSE'}${target.batch ? ` · ${target.batch}` : ''}`;

    const myTitle =
      userProfile.role === 'alumni'
        ? `${userProfile.designation || 'Alumni'}${userProfile.company ? ` · ${userProfile.company}` : ''}`
        : `${userProfile.department || 'CSE'}${userProfile.batch ? ` · ${userProfile.batch}` : ''}`;

    try {
      const convId = await openOrCreateFirestoreConversation({
        currentUid: firebaseUser.uid,
        currentName: userProfile.name,
        currentAvatar: userProfile.avatar,
        currentRole: userProfile.role,
        currentTitle: myTitle,
        participantUid: participantId,
        participantName: target.name || 'BAUST Member',
        participantAvatar: target.avatar || '',
        participantRole: targetRole,
        participantTitle: targetTitle,
        source,
      });
      return convId;
    } catch (err: any) {
      if (!isTransientFirestoreError(err)) {
        addToast('error', 'Chat Unavailable', err?.message || 'Unable to start conversation.');
      }
      return null;
    }
  };

  const addAnnouncement = (item: Omit<Announcement, 'id' | 'date'>) => {
    const dateLabel = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    if (firebaseUser && (userProfile?.role === 'admin' || userProfile?.role === 'superAdmin')) {
      void addDoc(collection(db, 'announcements'), {
        ...item,
        authorId: firebaseUser.uid,
        date: dateLabel,
        isDemo: Boolean(userProfile?.isDemo),
        createdAt: serverTimestamp(),
      })
        .then((ref) => {
          const recipientTarget =
            item.targetAudience === 'Students'
              ? 'ALL_STUDENTS'
              : item.targetAudience === 'Alumni'
              ? 'ALL_ALUMNI'
              : 'ALL_USERS';
          void triggerNotification({
            recipientId: recipientTarget,
            title: `University Notice: ${item.title}`,
            message: item.content.slice(0, 120),
            type: 'announcement',
            link: recipientTarget === 'ALL_ALUMNI' ? '/alumni/admin-desk' : '/student/dashboard',
            itemId: ref.id,
          });
          addToast('success', 'Announcement Published', item.title);
        })
        .catch((err) => {
          addToast('error', 'Publish Failed', err?.message || 'Permission denied.');
        });
    }
  };

  const deleteAnnouncement = (id: string) => {
    if (firebaseUser && (userProfile?.role === 'admin' || userProfile?.role === 'superAdmin')) {
      void deleteDoc(doc(db, 'announcements', id))
        .then(() => {
          addToast('info', 'Announcement Deleted');
        })
        .catch((err) => {
          addToast('error', 'Delete Failed', err?.message || 'Permission denied.');
        });
    }
  };

  const markNotificationRead = (id: string) => {
    const target = notifications.find((n) => n.id === id);
    setLocalReadNotifIds((prev) => ({ ...prev, [id]: true }));
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (target) {
      void markNotificationReadFirestore(target, firebaseUser?.uid);
    }
  };

  const markAllNotificationsRead = () => {
    const mapUpdate: Record<string, boolean> = {};
    notifications.forEach((n) => {
      mapUpdate[n.id] = true;
      if (!n.read) {
        void markNotificationReadFirestore(n, firebaseUser?.uid);
      }
    });
    setLocalReadNotifIds((prev) => ({ ...prev, ...mapUpdate }));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast('info', language === 'bn' ? 'সব বিজ্ঞপ্তি পঠিত হিসেবে চিহ্নিত হয়েছে' : 'All notifications marked as read');
  };

  const updateAlumniMentorSettings = (available: boolean, slots: string[], topics: any[]) => {
    if (userProfile?.role === 'alumni') {
      void updateFirebaseUserProfile({
        mentoringAvailable: available,
        availableSlots: slots,
        mentorshipTopics: topics,
      }).then((res) => {
        if (res.success) {
          addToast('success', 'Mentor Settings Saved', 'Your mentorship profile has been updated.');
        } else {
          addToast('error', 'Update Failed', res.error || 'Could not update settings.');
        }
      });
    }
  };

  const updateStudentProfile = (updatedData: Partial<StudentProfile>) => {
    if (userProfile) {
      updateFirebaseUserProfile(updatedData)
        .then((res) => {
          if (res.success) {
            addToast('success', 'Profile Updated', 'Student profile information saved successfully.');
          } else {
            addToast('error', 'Update Failed', res.error || 'Could not update profile.');
          }
        })
        .catch((err) => {
          console.error('Failed to update Firestore profile:', err);
          addToast('error', 'Update Failed', err?.message || 'Unexpected error');
        });
    }
  };

  return (
    <AppContext.Provider
      value={{
        role,
        currentUser,
        language,
        setLanguage,
        t: translations[language],
        allUsers,
        usersLoading,
        alumniList,
        studentList,
        serviceRequests,
        mentorshipRequests,
        verifications,
        verificationsLoading,
        conversations,
        conversationsLoading,
        isReconnecting,
        messages,
        hasMoreMessages,
        loadingEarlierMessages,
        announcements,
        notifications,
        addServiceRequest,
        updateServiceRequestStatus,
        requestMentorship,
        respondMentorship,
        approveVerification,
        rejectVerification,
        watchConversationMessages,
        loadEarlierMessages,
        markThreadRead,
        sendMessage,
        openOrCreateConversation,
        addAnnouncement,
        deleteAnnouncement,
        markNotificationRead,
        markAllNotificationsRead,
        toasts,
        addToast,
        removeToast,
        updateAlumniMentorSettings,
        updateStudentProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
