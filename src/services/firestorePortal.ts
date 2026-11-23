/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { initializeApp, deleteApp, FirebaseApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, firebaseConfig } from '../firebase';
import { cleanPayload } from './firestoreUtils';
import { DEMO_ACCOUNTS, DEMO_PASSWORD, ENABLE_DEMO_LOGIN } from '../config/demoConfig';
import { buildDemoUserPayload } from './demoProvisioning';
import {
  ActivityLogItem,
  ContributionItem,
  EventItem,
  JobApplication,
  JobPosting,
  UserRole,
} from '../types';
import { toList } from '../utils/utils';
import { buildInitialDocumentStages } from '../constants/baustDataModel';
import { grantUserFileAccess } from './fileUploadService';

export function tsToMillis(raw: any): number {
  if (!raw) return 0;
  if (typeof raw?.toMillis === 'function') return raw.toMillis();
  if (typeof raw?.seconds === 'number') return raw.seconds * 1000;
  if (typeof raw === 'number') return raw;
  const parsed = Date.parse(String(raw));
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function formatTsLabel(raw: any): string {
  const ms = tsToMillis(raw);
  if (!ms) return 'Just now';
  return new Date(ms).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export async function logPortalActivity(params: {
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  isDemo?: boolean;
}): Promise<void> {
  try {
    await addDoc(
      collection(db, 'activityLogs'),
      cleanPayload({
        ...params,
        ownerId: params.actorId,
        isDemo: Boolean(params.isDemo),
        createdAt: serverTimestamp(),
      })
    );
  } catch (err) {
    console.warn('Activity log note:', err);
  }
}

export function subscribeJobs(
  onData: (items: JobPosting[]) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    collection(db, 'jobs'),
    (snap) => {
      const items: JobPosting[] = snap.docs.map((d) => {
        const data = d.data() as Record<string, any>;
        return {
          id: d.id,
          title: data.title ?? 'Untitled Position',
          company: data.company ?? 'Partner Organization',
          location: data.location ?? 'Bangladesh',
          type: data.type ?? 'Full-Time',
          department: data.department ?? 'All',
          salaryRange: data.salaryRange ?? 'Negotiable',
          deadline: data.deadline ?? 'Open',
          description: data.description ?? '',
          requirements: toList(data.requirements),
          postedById: data.postedById ?? '',
          postedByName: data.postedByName ?? 'BAUST Network',
          postedByRole: (data.postedByRole as UserRole) ?? 'alumni',
          status: data.status === 'Closed' ? 'Closed' : 'Open',
          isDemo: Boolean(data.isDemo),
          createdAt: data.createdAt,
          createdAtLabel: formatTsLabel(data.createdAt),
        };
      });
      items.sort((a, b) => tsToMillis(b.createdAt) - tsToMillis(a.createdAt));
      onData(items);
    },
    (err) => onError?.(err)
  );
}

export async function createJobPosting(
  payload: Omit<JobPosting, 'id' | 'createdAt' | 'createdAtLabel'>
): Promise<string> {
  const ref = await addDoc(
    collection(db, 'jobs'),
    cleanPayload({
      ...payload,
      requirements: toList(payload.requirements),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  );
  return ref.id;
}

export async function updateJobStatus(jobId: string, status: 'Open' | 'Closed'): Promise<void> {
  await updateDoc(doc(db, 'jobs', jobId), { status, updatedAt: serverTimestamp() });
}

export async function deleteJobPosting(jobId: string): Promise<void> {
  await deleteDoc(doc(db, 'jobs', jobId));
}

export async function deleteJobPostingWithApplications(
  job: JobPosting,
  actorName: string,
  knownApplications?: JobApplication[]
): Promise<JobApplication[]> {
  let affected: JobApplication[] = (knownApplications || []).filter(
    (a) => a.jobId === job.id && a.status !== 'Withdrawn' && a.status !== 'Job Removed'
  );

  if (!knownApplications) {
    const q = job.postedById
      ? query(collection(db, 'jobApplications'), where('postedBy', '==', job.postedById))
      : collection(db, 'jobApplications');
    const snap = await getDocs(q).catch(() => null);
    if (snap) {
      affected = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Record<string, any>) } as JobApplication))
        .filter((a) => a.jobId === job.id && a.status !== 'Withdrawn' && a.status !== 'Job Removed');
    }
  }

  const batch = writeBatch(db);
  batch.delete(doc(db, 'jobs', job.id));

  const nowIso = new Date().toISOString();
  affected.forEach((app) => {
    batch.update(doc(db, 'jobApplications', app.id), {
      status: 'Job Removed',
      statusHistory: arrayUnion({
        status: 'Job Removed',
        at: nowIso,
        by: actorName || 'Employer',
        note: `Listing "${job.title}" was removed.`,
      }),
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
  return affected;
}

export function subscribeJobApplications(
  opts: { studentId?: string; postedBy?: string },
  onData: (items: JobApplication[]) => void,
  onError?: (err: Error) => void
): () => void {
  const col = collection(db, 'jobApplications');
  const q = opts.studentId
    ? query(col, where('studentId', '==', opts.studentId))
    : opts.postedBy
    ? query(col, where('postedBy', '==', opts.postedBy))
    : col;

  return onSnapshot(
    q,
    (snap) => {
      const items: JobApplication[] = snap.docs.map((d) => {
        const data = d.data() as Record<string, any>;
        return {
          id: d.id,
          jobId: data.jobId ?? '',
          jobTitle: data.jobTitle ?? 'Position',
          company: data.company ?? 'Organization',
          postedBy: data.postedBy ?? data.postedById ?? '',
          postedById: data.postedById ?? data.postedBy ?? '',
          postedByName: data.postedByName ?? '',
          postedByRole: (data.postedByRole as UserRole) ?? undefined,
          studentId: data.studentId ?? '',
          studentName: data.studentName ?? 'BAUST Student',
          studentEmail: data.studentEmail ?? '',
          applicantRole: (data.applicantRole as UserRole) ?? undefined,
          applicantPhotoURL: data.applicantPhotoURL ?? '',
          department: data.department ?? 'CSE',
          batch: data.batch ?? '',
          cgpa: String(data.cgpa ?? ''),
          cvFileName: data.cvFileName ?? data.cvName ?? '',
          cvName: data.cvName ?? data.cvFileName ?? '',
          cvUrl: data.cvUrl ?? '',
          cvFileDocId: data.cvFileDocId ?? '',
          coverNote: data.coverNote ?? '',
          interviewDate: data.interviewDate ?? '',
          interviewTime: data.interviewTime ?? '',
          interviewMode: data.interviewMode ?? '',
          interviewLink: data.interviewLink ?? '',
          status: data.status ?? 'Applied',
          statusHistory: Array.isArray(data.statusHistory) ? data.statusHistory : [],
          isDemo: Boolean(data.isDemo),
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          createdAtLabel: formatTsLabel(data.createdAt),
        };
      });
      items.sort((a, b) => tsToMillis(b.createdAt) - tsToMillis(a.createdAt));
      onData(items);
    },
    (err) => onError?.(err)
  );
}

export async function applyToJob(
  payload: Omit<JobApplication, 'id' | 'status' | 'createdAt' | 'createdAtLabel'>
): Promise<string> {
  const docId = `${payload.jobId}_${payload.studentId}`;
  const appRef = doc(db, 'jobApplications', docId);
  const existing = await getDoc(appRef).catch(() => null);
  const nowIso = new Date().toISOString();
  const ownerId = payload.postedBy || payload.postedById || '';

  if (existing && existing.exists()) {
    const prevStatus = existing.data()?.status;
    if (prevStatus !== 'Withdrawn' && prevStatus !== 'Job Removed') {
      throw new Error('You have already submitted an active application for this position.');
    }

    await updateDoc(
      appRef,
      cleanPayload({
        jobTitle: payload.jobTitle,
        company: payload.company,
        postedBy: ownerId,
        postedById: ownerId,
        postedByName: payload.postedByName || '',
        postedByRole: payload.postedByRole || 'alumni',
        studentName: payload.studentName,
        studentEmail: payload.studentEmail,
        applicantRole: payload.applicantRole || 'student',
        applicantPhotoURL: payload.applicantPhotoURL || '',
        department: payload.department,
        batch: payload.batch,
        cgpa: payload.cgpa,
        cvFileName: payload.cvFileName,
        cvName: payload.cvName || payload.cvFileName,
        cvUrl: payload.cvUrl || '',
        cvFileDocId: payload.cvFileDocId || '',
        coverNote: payload.coverNote,
        status: 'Applied',
        statusHistory: arrayUnion({
          status: 'Applied',
          at: nowIso,
          by: payload.studentName || 'Applicant',
          note: 'Re-applied to this position.',
        }),
        updatedAt: serverTimestamp(),
      })
    );
  } else {
    await setDoc(
      appRef,
      cleanPayload({
        ...payload,
        postedBy: ownerId,
        postedById: ownerId,
        postedByName: payload.postedByName || '',
        postedByRole: payload.postedByRole || 'alumni',
        applicantRole: payload.applicantRole || 'student',
        applicantPhotoURL: payload.applicantPhotoURL || '',
        cvName: payload.cvName || payload.cvFileName,
        cvUrl: payload.cvUrl || '',
        cvFileDocId: payload.cvFileDocId || '',
        status: 'Applied',
        statusHistory: [
          {
            status: 'Applied',
            at: nowIso,
            by: payload.studentName || 'Applicant',
            note: payload.coverNote ? 'Application submitted with cover note.' : 'Application submitted.',
          },
        ],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
  }

  if (payload.cvFileDocId && ownerId) {
    await grantUserFileAccess(payload.cvFileDocId, ownerId);
  }

  return docId;
}

export async function updateApplicationStatusFirestore(
  appId: string,
  status: JobApplication['status'],
  actorName?: string,
  note?: string,
  interviewMeta?: {
    interviewDate?: string;
    interviewTime?: string;
    interviewMode?: string;
    interviewLink?: string;
  }
): Promise<void> {
  const nowIso = new Date().toISOString();
  const patch: Record<string, any> = {
    status,
    statusHistory: arrayUnion({
      status,
      at: nowIso,
      by: actorName || 'Recruiter',
      note: note || `Status changed to ${status}.`,
    }),
    updatedAt: serverTimestamp(),
  };
  if (interviewMeta) {
    if (interviewMeta.interviewDate !== undefined) patch.interviewDate = interviewMeta.interviewDate;
    if (interviewMeta.interviewTime !== undefined) patch.interviewTime = interviewMeta.interviewTime;
    if (interviewMeta.interviewMode !== undefined) patch.interviewMode = interviewMeta.interviewMode;
    if (interviewMeta.interviewLink !== undefined) patch.interviewLink = interviewMeta.interviewLink;
  }
  await updateDoc(doc(db, 'jobApplications', appId), cleanPayload(patch));
}

export function subscribeEvents(
  onData: (items: EventItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    collection(db, 'events'),
    (snap) => {
      const items: EventItem[] = snap.docs.map((d) => {
        const data = d.data() as Record<string, any>;
        return {
          id: d.id,
          title: data.title ?? 'BAUST Event',
          category: data.category ?? 'Networking',
          date: data.date ?? '',
          time: data.time ?? '',
          venue: data.venue ?? 'BAUST Campus',
          mode: data.mode ?? 'Hybrid',
          description: data.description ?? '',
          organizerId: data.organizerId ?? '',
          organizerName: data.organizerName ?? 'BAUST Alumni',
          organizerRole: (data.organizerRole as UserRole) ?? 'alumni',
          attendeeIds: toList(data.attendeeIds),
          maxSeats: typeof data.maxSeats === 'number' ? data.maxSeats : 100,
          isDemo: Boolean(data.isDemo),
          createdAt: data.createdAt,
        };
      });
      items.sort((a, b) => tsToMillis(b.createdAt) - tsToMillis(a.createdAt));
      onData(items);
    },
    (err) => onError?.(err)
  );
}

export async function createEventItem(
  payload: Omit<EventItem, 'id' | 'attendeeIds' | 'createdAt'>
): Promise<string> {
  const ref = await addDoc(
    collection(db, 'events'),
    cleanPayload({
      ...payload,
      attendeeIds: [payload.organizerId],
      createdAt: serverTimestamp(),
    })
  );
  return ref.id;
}

export async function toggleEventRsvp(eventId: string, uid: string, isGoing: boolean): Promise<void> {
  await updateDoc(doc(db, 'events', eventId), {
    attendeeIds: isGoing ? arrayRemove(uid) : arrayUnion(uid),
  });
}

export function subscribeContributions(
  onData: (items: ContributionItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    collection(db, 'contributions'),
    (snap) => {
      const items: ContributionItem[] = snap.docs.map((d) => {
        const data = d.data() as Record<string, any>;
        return {
          id: d.id,
          alumniId: data.alumniId ?? '',
          alumniName: data.alumniName ?? 'BAUST Alumni',
          department: data.department ?? 'CSE',
          batch: data.batch ?? '',
          category: data.category ?? 'Scholarship Fund',
          amountBdt: typeof data.amountBdt === 'number' ? data.amountBdt : 0,
          pledgeTitle: data.pledgeTitle ?? 'BAUST Support Contribution',
          note: data.note ?? '',
          status: data.status ?? 'Pledged',
          isDemo: Boolean(data.isDemo),
          createdAt: data.createdAt,
          createdAtLabel: formatTsLabel(data.createdAt),
        };
      });
      items.sort((a, b) => tsToMillis(b.createdAt) - tsToMillis(a.createdAt));
      onData(items);
    },
    (err) => onError?.(err)
  );
}

export async function createContribution(
  payload: Omit<ContributionItem, 'id' | 'status' | 'createdAt' | 'createdAtLabel'>
): Promise<string> {
  const ref = await addDoc(
    collection(db, 'contributions'),
    cleanPayload({
      ...payload,
      status: 'Pledged',
      createdAt: serverTimestamp(),
    })
  );
  return ref.id;
}

export function subscribeActivityLogs(
  onData: (items: ActivityLogItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    collection(db, 'activityLogs'),
    (snap) => {
      const items: ActivityLogItem[] = snap.docs.map((d) => {
        const data = d.data() as Record<string, any>;
        return {
          id: d.id,
          actorId: data.actorId ?? '',
          actorName: data.actorName ?? 'System',
          actorRole: (data.actorRole as UserRole) ?? 'superAdmin',
          action: data.action ?? 'EVENT',
          targetType: data.targetType ?? 'system',
          targetId: data.targetId ?? '',
          details: data.details ?? '',
          createdAt: data.createdAt,
          createdAtLabel: formatTsLabel(data.createdAt),
        };
      });
      items.sort((a, b) => tsToMillis(b.createdAt) - tsToMillis(a.createdAt));
      onData(items);
    },
    (err) => onError?.(err)
  );
}

export function subscribeFirestoreUsers(
  onData: (users: Record<string, any>[]) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    collection(db, 'users'),
    (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Record<string, any>),
      }));
      onData(list);
    },
    (err) => onError?.(err)
  );
}

export function subscribeFirestoreMentorships(
  opts: { studentId?: string; alumniId?: string },
  onData: (items: Record<string, any>[]) => void,
  onError?: (err: Error) => void
): () => void {
  const col = collection(db, 'mentorships');
  const q = opts.studentId
    ? query(col, where('studentId', '==', opts.studentId))
    : opts.alumniId
    ? query(col, where('alumniId', '==', opts.alumniId))
    : col;

  return onSnapshot(
    q,
    (snap) => {
      const items: Record<string, any>[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Record<string, any>),
      }));
      items.sort((a, b) => tsToMillis(b.createdAt) - tsToMillis(a.createdAt));
      onData(items);
    },
    (err) => onError?.(err)
  );
}

export async function createFirestoreMentorship(payload: {
  studentId: string;
  studentName: string;
  studentDept: string;
  studentBatch: string;
  studentAvatar: string;
  alumniId: string;
  alumniName: string;
  alumniCompany: string;
  topic: string;
  note: string;
  preferredDate: string;
  preferredTime: string;
  isDemo?: boolean;
}): Promise<string> {
  const nowIso = new Date().toISOString();
  const ref = await addDoc(
    collection(db, 'mentorships'),
    cleanPayload({
      ...payload,
      mentorId: payload.alumniId,
      mentorName: payload.alumniName,
      message: payload.note,
      status: 'Pending',
      meetingLink: '',
      feedback: '',
      statusHistory: [
        {
          status: 'Pending',
          at: nowIso,
          by: payload.studentName || 'Student',
          note: payload.note || '',
        },
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  );
  return ref.id;
}

export async function updateFirestoreMentorship(
  id: string,
  action: 'Accepted' | 'Declined' | 'On Hold' | 'Completed' | 'Cancelled',
  feedback?: string,
  meetingLink?: string,
  actorName?: string
): Promise<void> {
  const nowIso = new Date().toISOString();
  const patch: Record<string, any> = {
    status: action,
    feedback: feedback ?? '',
    statusHistory: arrayUnion({
      status: action,
      at: nowIso,
      by: actorName || 'Alumni Mentor',
      note: feedback ?? '',
    }),
    updatedAt: serverTimestamp(),
  };
  if (action === 'Accepted') {
    patch.meetingLink = meetingLink || `https://meet.google.com/baust-${id.slice(0, 6)}`;
  } else if (action === 'Declined' || action === 'Cancelled') {
    patch.meetingLink = '';
  }
  await updateDoc(doc(db, 'mentorships', id), cleanPayload(patch));
}

/**
 * Resets / seeds the 4 Demo Firebase Auth accounts (using an isolated secondary FirebaseApp
 * so the active Super Admin session stays signed in) and restores sample Firestore data
 * without touching any real users or modifying existing protected demo user documents.
 */
export async function seedDemoAccountsAndData(actor: {
  uid: string;
  name: string;
  isDemo?: boolean;
}): Promise<{ accountsSeeded: number; summary: string }> {
  const secondaryName = `baust-seeder-${Date.now()}`;
  const secondaryApp: FirebaseApp = initializeApp(firebaseConfig, secondaryName);
  const secondaryAuth = getAuth(secondaryApp);

  const uidByRole: Record<string, string> = {};

  try {
    for (const spec of DEMO_ACCOUNTS) {
      let uid = '';
      try {
        const cred = await createUserWithEmailAndPassword(secondaryAuth, spec.email, DEMO_PASSWORD);
        uid = cred.user.uid;
      } catch (err: any) {
        if (err?.code === 'auth/email-already-in-use') {
          const existing = await signInWithEmailAndPassword(secondaryAuth, spec.email, DEMO_PASSWORD);
          uid = existing.user.uid;
        } else {
          throw err;
        }
      }
      uidByRole[spec.role] = uid;
      await signOut(secondaryAuth).catch(() => {});
    }
  } finally {
    await deleteApp(secondaryApp).catch(() => {});
  }

  // Only create missing demo user docs (existing demo user docs remain protected)
  const { getDoc } = await import('firebase/firestore');
  const existingChecks = await Promise.all(
    DEMO_ACCOUNTS.map(async (spec) => {
      const uid = uidByRole[spec.role];
      if (!uid) return { spec, uid: '', exists: true };
      const snap = await getDoc(doc(db, 'users', uid)).catch(() => null);
      return { spec, uid, exists: Boolean(snap?.exists()) };
    })
  );

  const batch = writeBatch(db);

  batch.set(
    doc(db, 'config', 'app'),
    { demoEnabled: ENABLE_DEMO_LOGIN, updatedAt: serverTimestamp() },
    { merge: true }
  );

  for (const { spec, uid, exists } of existingChecks) {
    if (!uid || exists) continue;
    batch.set(doc(db, 'users', uid), buildDemoUserPayload(uid, spec));
  }

  const demoAlumniUid = uidByRole['alumni'] || actor.uid;
  const demoStudentUid = uidByRole['student'] || actor.uid;
  const demoAdminUid = uidByRole['admin'] || actor.uid;

  // Reset Sample Jobs
  batch.set(doc(db, 'jobs', 'demo-job-1'), {
    title: 'Junior Software Engineer (React & Node.js)',
    company: 'Brain Station 23',
    location: 'Dhaka / Hybrid',
    type: 'Full-Time',
    department: 'CSE',
    salaryRange: 'BDT 55,000 - 75,000',
    deadline: '2026-12-15',
    description:
      'Referral opportunity opened by BAUST CSE Alumni for final-year undergrads and fresh graduates proficient in TypeScript, React, and REST APIs.',
    requirements: ['TypeScript', 'React', 'Node.js', 'Git'],
    postedById: demoAlumniUid,
    postedByName: 'Demo Alumni',
    postedByRole: 'alumni',
    status: 'Open',
    isDemo: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.set(doc(db, 'jobs', 'demo-job-2'), {
    title: 'Embedded Systems Engineering Intern',
    company: 'Walton Digi-Tech Industries',
    location: 'Gazipur, Bangladesh',
    type: 'Internship',
    department: 'EEE',
    salaryRange: 'BDT 22,000 Stipend',
    deadline: '2026-12-20',
    description:
      '6-month industrial internship track vetted by the BAUST Placement Office for Level-4 EEE and ME students.',
    requirements: ['Embedded C', 'Microcontrollers', 'PCB Design'],
    postedById: demoAdminUid,
    postedByName: 'Demo Admin',
    postedByRole: 'admin',
    status: 'Open',
    isDemo: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Reset Sample Events
  batch.set(doc(db, 'events', 'demo-event-1'), {
    title: 'BAUST Annual Tech & Alumni Career Summit 2026',
    category: 'Career Fair',
    date: '2026-12-12',
    time: '10:00 AM',
    venue: 'BAUST Central Auditorium, Saidpur',
    mode: 'Hybrid',
    description:
      'On-campus engineering interviews, live CV clinics with senior alumni, and industry panel talks.',
    organizerId: demoAlumniUid,
    organizerName: 'Demo Alumni',
    organizerRole: 'alumni',
    attendeeIds: [demoAlumniUid, demoStudentUid],
    maxSeats: 250,
    isDemo: true,
    createdAt: serverTimestamp(),
  });

  // Reset Sample Announcements
  batch.set(doc(db, 'announcements', 'demo-ann-1'), {
    title: 'Winter 2026 Transcript & Degree Clearance Schedule',
    category: 'Notice',
    targetAudience: 'All',
    content:
      'Graduating batches can now submit online Transcript, Provisional Certificate, and Clearance requests via the University Admin Desk for faster processing.',
    author: 'Office of the Registrar & Controller of Examinations',
    authorId: demoAdminUid,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    pinned: true,
    priority: 'Important',
    active: true,
    expiresAt: '',
    isDemo: true,
    createdAt: serverTimestamp(),
  });

  // Reset Sample Mentorship
  batch.set(doc(db, 'mentorships', 'demo-mnt-1'), {
    studentId: demoStudentUid,
    studentName: 'Demo Student',
    studentDept: 'CSE',
    studentBatch: '19th Batch',
    studentAvatar: DEMO_ACCOUNTS[0].avatar,
    alumniId: demoAlumniUid,
    alumniName: 'Demo Alumni',
    alumniCompany: 'Brain Station 23',
    topic: 'CV Review',
    note: 'Looking for feedback on my full-stack capstone projects and internship CV.',
    preferredDate: '2026-11-28',
    preferredTime: '08:00 PM',
    status: 'Pending',
    meetingLink: '',
    feedback: '',
    isDemo: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Reset Sample Contribution
  batch.set(doc(db, 'contributions', 'demo-contrib-1'), {
    alumniId: demoAlumniUid,
    alumniName: 'Demo Alumni',
    department: 'CSE',
    batch: '4th Batch',
    category: 'Scholarship Fund',
    amountBdt: 25000,
    pledgeTitle: 'BAUST CSE Merit & Need-Based Lab Stipend',
    note: 'Supporting two final-year CSE students with cloud hosting and thesis hardware.',
    status: 'Acknowledged',
    isDemo: true,
    createdAt: serverTimestamp(),
  });

  // Reset Sample Document Request (Stage 1 done, Stage 2 current — Payment Verification awaits Admin)
  const demoDocNowIso = new Date().toISOString();
  batch.set(doc(db, 'documentRequests', 'DEMO-DOC-2026'), {
    id: 'DEMO-DOC-2026',
    trackingId: 'DEMO-DOC-2026',
    userId: demoStudentUid,
    userName: 'Demo Student',
    userEmail: 'demo.student@baustdemo.com',
    userRole: 'student',
    baustId: '1902041',
    department: 'CSE',
    type: 'Official Academic Transcript',
    serviceId: 'srv-transcript',
    copies: 1,
    purpose: 'Higher Studies Abroad',
    urgency: 'Normal',
    deliveryMethod: 'Campus Pickup',
    deliveryAddress: '',
    paymentMethod: 'bKash',
    transactionId: 'BKASH-DEMO-901',
    fee: 500,
    status: 'submitted',
    stages: buildInitialDocumentStages('Demo Student', demoDocNowIso),
    currentStageIndex: 1,
    currentStageKey: 'payment_verified',
    payment: {
      method: 'bKash',
      transactionId: 'BKASH-DEMO-901',
      subtotal: 500,
      urgencyFee: 0,
      courierFee: 0,
      totalAmount: 500,
      isVerified: false,
      paidAt: demoDocNowIso,
    },
    isDemo: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Reset Sample Verification Request
  batch.set(doc(db, 'verificationRequests', 'demo-sample-pending-student'), {
    id: 'demo-sample-pending-student',
    userId: 'demo-sample-pending-student',
    name: 'Sample Pending Student',
    email: 'sample.pending.student@baustdemo.com',
    phone: '+880 1711-000222',
    role: 'student',
    baustId: '2002088',
    department: 'CSE',
    batch: '20th Batch',
    passingYear: 2027,
    office: '',
    company: '',
    designation: 'Undergraduate Student',
    details: {
      baustId: '2002088',
      phone: '+880 1711-000222',
      department: 'CSE',
      batch: '20th Batch',
    },
    documentType: 'Demo Student ID Verification',
    documentFileName: 'demo_student_id.png',
    documentPreviewUrl:
      'https://images.unsplash.com/photo-1589330694653-dad6d3240a2b?w=600&auto=format&fit=crop&q=80',
    status: 'pending',
    isDemo: true,
    submittedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Seed Demo idIndex entries so BAUST ID login works seamlessly for Demo accounts too
  for (const spec of DEMO_ACCOUNTS) {
    const uid = uidByRole[spec.role];
    if (uid && /^[a-zA-Z0-9_\-]+$/.test(spec.baustId)) {
      batch.set(
        doc(db, 'idIndex', spec.baustId),
        {
          uid,
          email: spec.email,
          role: spec.role,
          isDemo: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  }

  // Seed Sample Knowledge Session
  batch.set(
    doc(db, 'knowledgeSessions', 'demo-ks-1'),
    {
      title: 'Cracking Full-Stack & Cloud Engineering Interviews in BD',
      topic: 'Technical Interview Prep',
      description:
        'Interactive alumni-led webinar walking through live system design, portfolio projects, and Git workflows for BAUST undergraduates.',
      hostId: demoAlumniUid,
      hostName: 'Demo Alumni',
      hostCompany: 'Brain Station 23',
      hostAvatar: DEMO_ACCOUNTS[1].avatar,
      department: 'CSE',
      date: '2026-12-14',
      time: '08:30 PM',
      durationMinutes: 75,
      mode: 'Online',
      meetingLink: 'https://meet.google.com/baust-demo-webinar',
      venue: 'Google Meet',
      maxSeats: 120,
      registeredIds: [demoAlumniUid, demoStudentUid],
      status: 'Scheduled',
      isDemo: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // Seed Sample Appointment Slot
  batch.set(
    doc(db, 'appointments', 'demo-slot-1'),
    {
      alumniId: demoAlumniUid,
      alumniName: 'Demo Alumni',
      alumniCompany: 'Brain Station 23',
      alumniAvatar: DEMO_ACCOUNTS[1].avatar,
      date: '2026-12-16',
      startTime: '20:00',
      endTime: '20:30',
      timeSlot: '08:00 PM - 08:30 PM',
      mode: 'Google Meet',
      meetingLink: 'https://meet.google.com/baust-slot-demo1',
      topic: 'CV & Portfolio Architecture Review',
      status: 'available',
      bookedByStudentId: '',
      bookedByStudentName: '',
      bookedByStudentEmail: '',
      bookingNote: '',
      isDemo: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // Log Demo Reset Event (always a new doc ID so rule allows create)
  batch.set(doc(db, 'activityLogs', `demo-reset-${Date.now()}`), {
    actorId: actor.uid,
    actorName: actor.name,
    actorRole: 'superAdmin',
    action: 'RESET_DEMO_DATA',
    targetType: 'system',
    targetId: 'demo-suite',
    details: 'Reset and restored sample jobs, events, announcements, mentorship, knowledge sessions, slots, and document request records.',
    isDemo: Boolean(actor.isDemo),
    createdAt: serverTimestamp(),
  });

  await batch.commit();

  return {
    accountsSeeded: Object.keys(uidByRole).length,
    summary: `Reset ${Object.keys(uidByRole).length} demo accounts and restored sample jobs, events, announcements, mentorships, and document requests without modifying real users.`,
  };
}

export const resetDemoData = seedDemoAccountsAndData;
