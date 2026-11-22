/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, db, isTransientFirestoreError } from '../firebase';
import {
  AppNotificationEntity,
  AppointmentSlotEntity,
  buildChatLink,
  buildConversationDocId,
  CVReviewEntity,
  EvaluationEntity,
  KnowledgeSessionEntity,
  ReportEntity,
} from '../constants/baustDataModel';
import { ChatMessage, Conversation, ConversationSource, Notification, UserRole } from '../types';
import { isDemoAccountEmail } from '../config/demoConfig';
import { logPortalActivity, tsToMillis } from './firestorePortal';

function formatClock(raw: any): string {
  const ms = tsToMillis(raw);
  if (!ms) return 'Just now';
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatShortDate(raw: any): string {
  const ms = tsToMillis(raw);
  if (!ms) return 'Just now';
  return new Date(ms).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ============================================================================
// 1. NOTIFICATION RULE ENGINE (#45)
// ============================================================================

export async function triggerNotification(params: {
  recipientId: string;
  title: string;
  message: string;
  type: AppNotificationEntity['type'];
  link: string;
  itemId?: string;
  refId?: string;
}): Promise<string | null> {
  if (!auth.currentUser || !params.recipientId) return null;
  const resolvedRef = params.refId || params.itemId || '';
  try {
    const ref = await addDoc(collection(db, 'notifications'), {
      recipientId: params.recipientId,
      senderId: auth.currentUser.uid,
      title: params.title,
      message: params.message,
      type: params.type,
      link: params.link,
      itemId: resolvedRef,
      refId: resolvedRef,
      read: false,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch (err) {
    console.warn('Notification dispatch note:', err);
    return null;
  }
}

export async function upsertChatNotification(params: {
  recipientId: string;
  recipientRole: UserRole;
  senderId: string;
  senderName: string;
  conversationId: string;
  preview: string;
}): Promise<void> {
  if (!auth.currentUser || !params.recipientId || params.recipientId === params.senderId) return;
  const notifDocId = `chat_${params.conversationId}_${params.recipientId}`;
  try {
    await setDoc(
      doc(db, 'notifications', notifDocId),
      {
        recipientId: params.recipientId,
        senderId: params.senderId,
        type: 'chat',
        title: `New message from ${params.senderName}`,
        message: params.preview.slice(0, 110),
        link: buildChatLink(params.recipientRole, params.conversationId),
        itemId: params.conversationId,
        refId: params.conversationId,
        read: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Chat notification upsert note:', err);
  }
}

export async function notify(
  recipientId: string,
  type: AppNotificationEntity['type'],
  title: string,
  message: string,
  link: string,
  refId?: string
): Promise<string | null> {
  return triggerNotification({ recipientId, type, title, message, link, itemId: refId, refId });
}

export function getDocumentRequestLink(role?: string, id?: string): string {
  const base =
    role === 'admin' || role === 'superAdmin'
      ? '/admin'
      : role === 'alumni'
      ? '/alumni'
      : '/student';
  return id ? `${base}/admin-desk/requests/${id}` : `${base}/admin-desk`;
}

export function subscribeNotifications(
  uid: string,
  role: UserRole,
  onData: (items: Notification[]) => void,
  onError?: (err: Error) => void
): () => void {
  const targets = [uid, 'ALL_USERS'];
  if (role === 'student') targets.push('ALL_STUDENTS');
  if (role === 'alumni') targets.push('ALL_ALUMNI');
  if (role === 'admin' || role === 'superAdmin') targets.push('ALL_ADMINS');
  if (role === 'superAdmin') targets.push('ALL_SUPERADMINS');

  const buckets = new Map<string, Notification[]>();
  const unsubs: Array<() => void> = [];

  const emitMerged = () => {
    const map = new Map<string, { item: Notification; ms: number }>();
    buckets.forEach((arr) => {
      arr.forEach((n) => {
        const ms = Number((n as any)._ms || 0);
        map.set(n.id, { item: n, ms });
      });
    });
    const merged = Array.from(map.values())
      .sort((a, b) => b.ms - a.ms)
      .map((entry) => entry.item);
    onData(merged);
  };

  targets.forEach((target) => {
    const q = query(collection(db, 'notifications'), where('recipientId', '==', target));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: Notification[] = snap.docs.map((d) => {
          const data = d.data() as Record<string, any>;
          const item: Notification & { _ms?: number } = {
            id: d.id,
            recipientId: data.recipientId || target,
            title: data.title || 'Notification',
            message: data.message || '',
            timestamp: formatShortDate(data.createdAt),
            read: Boolean(data.read),
            type: data.type || 'announcement',
            link: data.link || '/',
            itemId: data.itemId || data.refId || '',
            refId: data.refId || data.itemId || '',
            _ms: tsToMillis(data.createdAt) || Date.now(),
          };
          return item;
        });
        buckets.set(target, list);
        emitMerged();
      },
      (err) => onError?.(err)
    );
    unsubs.push(unsub);
  });

  return () => {
    unsubs.forEach((u) => u());
  };
}

export async function markNotificationReadFirestore(notif: Notification, viewerUid?: string): Promise<void> {
  if (!auth.currentUser) return;
  const isDirectlyEditable =
    notif.recipientId === viewerUid ||
    notif.recipientId === 'ALL_ADMINS' ||
    notif.recipientId === 'ALL_SUPERADMINS';
  if (!isDirectlyEditable) return;
  try {
    await updateDoc(doc(db, 'notifications', notif.id), {
      read: true,
      readAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Mark notification read note:', err);
  }
}

// ============================================================================
// 2. REAL-TIME 1-TO-1 MESSAGING (FR-11, Part 3)
// ============================================================================

export { buildConversationDocId };

export async function openOrCreateFirestoreConversation(params: {
  currentUid: string;
  currentName: string;
  currentAvatar: string;
  currentRole: UserRole;
  currentTitle: string;
  participantUid: string;
  participantName: string;
  participantAvatar: string;
  participantRole: UserRole;
  participantTitle: string;
  source?: ConversationSource;
}): Promise<string> {
  const convId = buildConversationDocId(params.currentUid, params.participantUid);
  const convRef = doc(db, 'conversations', convId);
  const existing = await getDoc(convRef).catch(() => null);

  if (existing && existing.exists()) {
    return convId;
  }

  const sortedIds = [params.currentUid, params.participantUid].sort((a, b) => a.localeCompare(b));
  await setDoc(convRef, {
    id: convId,
    participantIds: sortedIds,
    participants: {
      [params.currentUid]: {
        name: params.currentName || 'BAUST Member',
        role: params.currentRole,
        photoURL: params.currentAvatar || '',
        title: params.currentTitle || '',
      },
      [params.participantUid]: {
        name: params.participantName || 'BAUST Member',
        role: params.participantRole,
        photoURL: params.participantAvatar || '',
        title: params.participantTitle || '',
      },
    },
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
    lastSenderId: '',
    unreadCount: {
      [params.currentUid]: 0,
      [params.participantUid]: 0,
    },
    source: params.source || 'directory',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return convId;
}

function mapConversationSnap(uid: string, dId: string, data: Record<string, any>): { conv: Conversation; ms: number } {
  const ids: string[] = Array.isArray(data.participantIds)
    ? data.participantIds
    : Array.isArray(data.participants)
    ? data.participants
    : [];
  const otherId =
    ids.find((p) => p !== uid) ||
    dId.split('_').find((p) => p && p !== uid) ||
    ids[0] ||
    '';

  const participantsMap =
    data.participants && !Array.isArray(data.participants) && typeof data.participants === 'object'
      ? data.participants
      : data.participantProfiles || {};
  const otherMeta = participantsMap[otherId] || {};
  const unreadObj =
    data.unreadCount && typeof data.unreadCount === 'object'
      ? data.unreadCount
      : data.unreadBy || {};

  const resolvedRole: UserRole =
    otherMeta.role === 'alumni' || otherMeta.role === 'student' || otherMeta.role === 'admin' || otherMeta.role === 'superAdmin'
      ? otherMeta.role
      : 'alumni';

  const ms = tsToMillis(data.lastMessageAt || data.updatedAt || data.createdAt);
  const conv: Conversation = {
    id: dId,
    participantId: otherId,
    participantIds: ids,
    participants: participantsMap,
    participantName: otherMeta.name || data.participantName || 'BAUST Member',
    participantAvatar: otherMeta.photoURL || otherMeta.avatar || '',
    participantRole: resolvedRole,
    participantTitle: otherMeta.title || (resolvedRole === 'alumni' ? 'BAUST Alumni' : 'BAUST Student'),
    lastMessage: typeof data.lastMessage === 'string' ? data.lastMessage : '',
    lastMessageTime: ms ? formatClock(data.lastMessageAt || data.updatedAt || data.createdAt) : '',
    lastMessageAt: data.lastMessageAt || data.updatedAt || data.createdAt,
    lastSenderId: data.lastSenderId || '',
    unreadCount: typeof unreadObj[uid] === 'number' ? Math.max(0, unreadObj[uid]) : 0,
    unreadCountMap: unreadObj,
    source: data.source || 'directory',
    createdAt: data.createdAt,
    isOnline: Boolean(data.isOnline ?? true),
  };
  return { conv, ms };
}

export function subscribeConversations(
  uid: string,
  onData: (items: Conversation[]) => void,
  onError?: (err: Error) => void
): () => void {
  const qCanonical = query(
    collection(db, 'conversations'),
    where('participantIds', 'array-contains', uid),
    orderBy('lastMessageAt', 'desc')
  );

  let fallbackUnsub: (() => void) | null = null;
  let unsubCanonical = () => {};

  const attachFallback = () => {
    const qFallback = query(collection(db, 'conversations'), where('participantIds', 'array-contains', uid));
    fallbackUnsub = onSnapshot(
      qFallback,
      (snap) => {
        const mapped = snap.docs.map((d) => mapConversationSnap(uid, d.id, d.data() as Record<string, any>));
        mapped.sort((a, b) => b.ms - a.ms);
        onData(mapped.map((x) => x.conv));
      },
      (err) => {
        if (!isTransientFirestoreError(err)) onError?.(err);
      }
    );
  };

  unsubCanonical = onSnapshot(
    qCanonical,
    (snap) => {
      const mapped = snap.docs.map((d) => mapConversationSnap(uid, d.id, d.data() as Record<string, any>));
      mapped.sort((a, b) => b.ms - a.ms);
      onData(mapped.map((x) => x.conv));
    },
    (err) => {
      // Fallback to un-ordered array-contains query if composite index is still building
      if (String(err?.message || '').toLowerCase().includes('index')) {
        attachFallback();
        return;
      }
      if (!isTransientFirestoreError(err)) {
        onError?.(err);
      }
    }
  );

  return () => {
    unsubCanonical();
    fallbackUnsub?.();
  };
}

function mapMessageDoc(
  conversationId: string,
  d: QueryDocumentSnapshot<DocumentData>
): { msg: ChatMessage; ms: number } {
  const data = d.data() as Record<string, any>;
  const ms = tsToMillis(data.createdAt) || Date.now();
  return {
    msg: {
      id: d.id,
      conversationId,
      senderId: data.senderId || '',
      senderName: data.senderName || 'Member',
      senderAvatar: data.senderAvatar || '',
      text: data.text || '',
      timestamp: formatClock(data.createdAt),
      createdAt: data.createdAt,
      type: 'text',
      readBy: Array.isArray(data.readBy) ? data.readBy : [],
      attachment: data.attachment || undefined,
    },
    ms,
  };
}

export function subscribeConversationMessages(
  conversationId: string,
  pageSize: number,
  onData: (payload: {
    messages: ChatMessage[];
    hasMore: boolean;
    oldestSnap: QueryDocumentSnapshot<DocumentData> | null;
  }) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  return onSnapshot(
    q,
    (snap) => {
      const oldestSnap = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
      const items = snap.docs.map((d) => mapMessageDoc(conversationId, d));
      items.sort((a, b) => a.ms - b.ms);
      onData({
        messages: items.map((x) => x.msg),
        hasMore: snap.docs.length >= pageSize,
        oldestSnap,
      });
    },
    (err) => {
      if (!isTransientFirestoreError(err)) {
        onError?.(err);
      }
    }
  );
}

export async function fetchEarlierConversationMessages(
  conversationId: string,
  beforeSnap: QueryDocumentSnapshot<DocumentData>,
  pageSize = 50
): Promise<{
  messages: ChatMessage[];
  hasMore: boolean;
  oldestSnap: QueryDocumentSnapshot<DocumentData> | null;
}> {
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'desc'),
    startAfter(beforeSnap),
    limit(pageSize)
  );
  const snap = await getDocs(q);
  const oldestSnap = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
  const items = snap.docs.map((d) => mapMessageDoc(conversationId, d));
  items.sort((a, b) => a.ms - b.ms);
  return {
    messages: items.map((x) => x.msg),
    hasMore: snap.docs.length >= pageSize,
    oldestSnap,
  };
}

export async function sendFirestoreMessage(params: {
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId: string;
  recipientRole?: UserRole;
  text: string;
  attachment?: ChatMessage['attachment'];
}): Promise<string | void> {
  const cleanText = (params.text || '').trim();
  if (!cleanText && !params.attachment) return;
  if (cleanText.length > 2000) {
    throw new Error('Messages cannot exceed 2000 characters.');
  }

  const summaryText = (cleanText || `Sent attachment: ${params.attachment?.name || 'File'}`).slice(0, 100);
  const convRef = doc(db, 'conversations', params.conversationId);
  const msgRef = doc(collection(db, 'conversations', params.conversationId, 'messages'));

  const batch = writeBatch(db);
  batch.set(msgRef, {
    senderId: params.senderId,
    senderName: params.senderName,
    senderAvatar: params.senderAvatar || '',
    text: cleanText,
    type: 'text',
    readBy: [params.senderId],
    ...(params.attachment ? { attachment: params.attachment } : {}),
    createdAt: serverTimestamp(),
  });

  const convUpdate: Record<string, any> = {
    lastMessage: summaryText,
    lastSenderId: params.senderId,
    lastMessageAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    [`unreadCount.${params.senderId}`]: 0,
  };
  if (params.recipientId) {
    convUpdate[`unreadCount.${params.recipientId}`] = increment(1);
  }
  batch.update(convRef, convUpdate);

  await batch.commit();

  if (params.recipientId && params.recipientId !== params.senderId) {
    void upsertChatNotification({
      recipientId: params.recipientId,
      recipientRole: params.recipientRole || 'alumni',
      senderId: params.senderId,
      senderName: params.senderName,
      conversationId: params.conversationId,
      preview: summaryText,
    });
  }

  return msgRef.id;
}

export async function clearConversationUnread(
  conversationId: string,
  uid: string,
  messagesToMarkRead: ChatMessage[] = []
): Promise<void> {
  if (!uid || !conversationId) return;
  try {
    const batch = writeBatch(db);
    batch.update(doc(db, 'conversations', conversationId), {
      [`unreadCount.${uid}`]: 0,
    });

    const unreadMsgs = messagesToMarkRead
      .filter((m) => m.id && !m.optimistic && m.senderId !== uid && !(m.readBy || []).includes(uid))
      .slice(0, 400);

    unreadMsgs.forEach((m) => {
      batch.update(doc(db, 'conversations', conversationId, 'messages', m.id), {
        readBy: arrayUnion(uid),
      });
    });

    await batch.commit();

    // Mark the deterministic chat notification read if present
    const notifRef = doc(db, 'notifications', `chat_${conversationId}_${uid}`);
    const notifSnap = await getDoc(notifRef).catch(() => null);
    if (notifSnap?.exists() && notifSnap.data()?.read === false) {
      await updateDoc(notifRef, { read: true, readAt: serverTimestamp() }).catch(() => {});
    }
  } catch (err) {
    if (!isTransientFirestoreError(err)) {
      console.warn('Mark conversation read note:', err);
    }
  }
}

// ============================================================================
// 3. KNOWLEDGE-SHARING SESSIONS / WEBINARS (FR-13)
// ============================================================================

export function subscribeKnowledgeSessions(
  onData: (items: KnowledgeSessionEntity[]) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    collection(db, 'knowledgeSessions'),
    (snap) => {
      const items: KnowledgeSessionEntity[] = snap.docs.map((d) => {
        const data = d.data() as Record<string, any>;
        return {
          id: d.id,
          title: data.title || 'Knowledge Sharing Session',
          topic: data.topic || 'Career Guidance',
          description: data.description || '',
          hostId: data.hostId || '',
          hostName: data.hostName || 'BAUST Alumni',
          hostCompany: data.hostCompany || '',
          hostAvatar: data.hostAvatar || '',
          department: data.department || 'All',
          date: data.date || '',
          time: data.time || '',
          durationMinutes: typeof data.durationMinutes === 'number' ? data.durationMinutes : 60,
          mode: data.mode === 'On-Campus' || data.mode === 'Hybrid' ? data.mode : 'Online',
          meetingLink: data.meetingLink || '',
          venue: data.venue || '',
          maxSeats: typeof data.maxSeats === 'number' ? data.maxSeats : 100,
          registeredIds: Array.isArray(data.registeredIds) ? data.registeredIds : [],
          status:
            data.status === 'Live' || data.status === 'Completed' || data.status === 'Cancelled'
              ? data.status
              : 'Scheduled',
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

export async function createKnowledgeSession(
  payload: Omit<KnowledgeSessionEntity, 'id' | 'registeredIds' | 'status' | 'createdAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'knowledgeSessions'), {
    ...payload,
    registeredIds: [payload.hostId],
    status: 'Scheduled',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  void triggerNotification({
    recipientId: 'ALL_STUDENTS',
    title: `New Knowledge Session: ${payload.title}`,
    message: `${payload.hostName} scheduled a ${payload.mode} session on ${payload.date} at ${payload.time}.`,
    type: 'session',
    link: '/student/sessions',
    itemId: ref.id,
  });

  return ref.id;
}

export async function toggleKnowledgeSessionRegistration(
  session: KnowledgeSessionEntity,
  uid: string,
  userName: string
): Promise<{ registered: boolean }> {
  const sessionRef = doc(db, 'knowledgeSessions', session.id);
  const result = await runTransaction(db, async (tx) => {
    const snap = await tx.get(sessionRef);
    if (!snap.exists()) {
      throw new Error('Session no longer exists.');
    }
    const data = snap.data();
    const list: string[] = Array.isArray(data.registeredIds) ? data.registeredIds : [];
    const maxSeats = typeof data.maxSeats === 'number' ? data.maxSeats : 100;
    const isAlreadyRegistered = list.includes(uid);

    if (!isAlreadyRegistered && list.length >= maxSeats) {
      throw new Error('All seats for this knowledge session are currently full.');
    }

    tx.update(sessionRef, {
      registeredIds: isAlreadyRegistered ? arrayRemove(uid) : arrayUnion(uid),
      updatedAt: serverTimestamp(),
    });
    return { registered: !isAlreadyRegistered };
  });

  if (result.registered && session.hostId && session.hostId !== uid) {
    void triggerNotification({
      recipientId: session.hostId,
      title: 'New Session Participant',
      message: `${userName} registered for "${session.title}".`,
      type: 'session',
      link: '/alumni/sessions',
      itemId: session.id,
    });
  }

  return result;
}

export async function updateKnowledgeSessionStatus(
  sessionId: string,
  status: KnowledgeSessionEntity['status']
): Promise<void> {
  await updateDoc(doc(db, 'knowledgeSessions', sessionId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

// ============================================================================
// 4. ATOMIC APPOINTMENT SLOT BOOKING (FR-14)
// ============================================================================

export function subscribeAppointmentSlots(
  opts: { alumniId?: string },
  onData: (items: AppointmentSlotEntity[]) => void,
  onError?: (err: Error) => void
): () => void {
  const col = collection(db, 'appointments');
  const q = opts.alumniId ? query(col, where('alumniId', '==', opts.alumniId)) : col;

  return onSnapshot(
    q,
    (snap) => {
      const items: AppointmentSlotEntity[] = snap.docs.map((d) => {
        const data = d.data() as Record<string, any>;
        return {
          id: d.id,
          alumniId: data.alumniId || '',
          alumniName: data.alumniName || 'BAUST Alumni',
          alumniCompany: data.alumniCompany || '',
          alumniAvatar: data.alumniAvatar || '',
          date: data.date || '',
          timeSlot: data.timeSlot || '',
          mode:
            data.mode === 'On-Campus' || data.mode === 'Phone' ? data.mode : 'Google Meet',
          meetingLink: data.meetingLink || '',
          topic: data.topic || '1-on-1 Career Mentoring',
          status:
            data.status === 'booked' || data.status === 'cancelled' || data.status === 'completed'
              ? data.status
              : 'available',
          bookedByStudentId: data.bookedByStudentId || '',
          bookedByStudentName: data.bookedByStudentName || '',
          bookedByStudentEmail: data.bookedByStudentEmail || '',
          bookingNote: data.bookingNote || '',
          isDemo: Boolean(data.isDemo),
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      });
      items.sort((a, b) => (a.date + a.timeSlot).localeCompare(b.date + b.timeSlot));
      onData(items);
    },
    (err) => onError?.(err)
  );
}

export async function publishAppointmentSlot(
  payload: Omit<AppointmentSlotEntity, 'id' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'appointments'), {
    ...payload,
    meetingLink: payload.meetingLink || `https://meet.google.com/baust-${Math.random().toString(36).slice(2, 6)}`,
    status: 'available',
    bookedByStudentId: '',
    bookedByStudentName: '',
    bookedByStudentEmail: '',
    bookingNote: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function bookAppointmentSlotTransaction(params: {
  slotId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  note: string;
}): Promise<AppointmentSlotEntity> {
  const slotRef = doc(db, 'appointments', params.slotId);
  const bookedSlot = await runTransaction(db, async (tx) => {
    const snap = await tx.get(slotRef);
    if (!snap.exists()) {
      throw new Error('This appointment slot no longer exists.');
    }
    const data = snap.data() as Record<string, any>;
    if (data.status !== 'available' || data.bookedByStudentId) {
      throw new Error('This time slot was already booked by another student.');
    }
    if (data.alumniId === params.studentId) {
      throw new Error('You cannot book your own slot.');
    }

    tx.update(slotRef, {
      status: 'booked',
      bookedByStudentId: params.studentId,
      bookedByStudentName: params.studentName,
      bookedByStudentEmail: params.studentEmail,
      bookingNote: params.note.trim(),
      updatedAt: serverTimestamp(),
    });

    return {
      id: snap.id,
      ...(data as any),
      status: 'booked' as const,
      bookedByStudentId: params.studentId,
      bookedByStudentName: params.studentName,
    } as AppointmentSlotEntity;
  });

  if (bookedSlot.alumniId) {
    void triggerNotification({
      recipientId: bookedSlot.alumniId,
      title: '1-on-1 Slot Booked',
      message: `${params.studentName} booked your ${bookedSlot.date} (${bookedSlot.timeSlot}) mentorship slot.`,
      type: 'mentorship',
      link: '/alumni/appointments',
      itemId: bookedSlot.id,
    });
  }

  return bookedSlot;
}

export async function cancelAppointmentBooking(
  slot: AppointmentSlotEntity,
  actorUid: string,
  isAlumniOwner: boolean
): Promise<void> {
  const slotRef = doc(db, 'appointments', slot.id);
  if (isAlumniOwner) {
    await updateDoc(slotRef, {
      status: 'cancelled',
      updatedAt: serverTimestamp(),
    });
    if (slot.bookedByStudentId) {
      void triggerNotification({
        recipientId: slot.bookedByStudentId,
        title: 'Appointment Slot Cancelled',
        message: `${slot.alumniName} cancelled the ${slot.date} (${slot.timeSlot}) appointment slot.`,
        type: 'mentorship',
        link: '/student/appointments',
        itemId: slot.id,
      });
    }
    return;
  }

  // Student releasing their own booking
  await updateDoc(slotRef, {
    status: 'available',
    bookedByStudentId: '',
    bookedByStudentName: '',
    bookedByStudentEmail: '',
    bookingNote: '',
    updatedAt: serverTimestamp(),
  });
  if (slot.alumniId && slot.alumniId !== actorUid) {
    void triggerNotification({
      recipientId: slot.alumniId,
      title: 'Booking Released by Student',
      message: `Your ${slot.date} (${slot.timeSlot}) appointment slot is available again.`,
      type: 'mentorship',
      link: '/alumni/appointments',
      itemId: slot.id,
    });
  }
}

export async function completeAppointmentSlot(slot: AppointmentSlotEntity): Promise<void> {
  await updateDoc(doc(db, 'appointments', slot.id), {
    status: 'completed',
    updatedAt: serverTimestamp(),
  });
  if (slot.bookedByStudentId) {
    void triggerNotification({
      recipientId: slot.bookedByStudentId,
      title: 'Appointment Completed',
      message: `Your session with ${slot.alumniName} has been marked completed. You may leave an evaluation rating.`,
      type: 'mentorship',
      link: '/student/appointments',
      itemId: slot.id,
    });
  }
}

// ============================================================================
// 5. CV REVIEWS & STUDENT EVALUATIONS (FR-16, #41)
// ============================================================================

export function subscribeCVReviews(
  opts: { studentId?: string; mentorId?: string },
  onData: (items: CVReviewEntity[]) => void,
  onError?: (err: Error) => void
): () => void {
  const col = collection(db, 'cvReviews');
  const q = opts.studentId
    ? query(col, where('studentId', '==', opts.studentId))
    : opts.mentorId
    ? query(col, where('mentorId', '==', opts.mentorId))
    : col;

  return onSnapshot(
    q,
    (snap) => {
      const items: CVReviewEntity[] = snap.docs.map((d) => {
        const data = d.data() as Record<string, any>;
        return {
          id: d.id,
          studentId: data.studentId || '',
          studentName: data.studentName || 'BAUST Student',
          studentEmail: data.studentEmail || '',
          studentDept: data.studentDept || 'CSE',
          studentBatch: data.studentBatch || '',
          studentAvatar: data.studentAvatar || '',
          mentorId: data.mentorId || '',
          mentorName: data.mentorName || 'BAUST Alumni',
          mentorCompany: data.mentorCompany || '',
          mentorAvatar: data.mentorAvatar || '',
          targetRole: data.targetRole || 'Software Engineer',
          targetSector: data.targetSector || 'Private',
          cvFileName: data.cvFileName || 'Student_CV.pdf',
          cvUrl: data.cvUrl || '',
          studentNotes: data.studentNotes || '',
          deadlinePreference: data.deadlinePreference || 'Standard (3-5 days)',
          status:
            data.status === 'Reviewed' || data.status === 'In Review' ? data.status : 'Submitted',
          score: typeof data.score === 'number' ? data.score : undefined,
          rating: typeof data.rating === 'number' ? data.rating : undefined,
          strengths: Array.isArray(data.strengths) ? data.strengths : [],
          areasToImprove: Array.isArray(data.areasToImprove) ? data.areasToImprove : [],
          mentorFeedback: data.mentorFeedback || '',
          thanksSent: Boolean(data.thanksSent),
          isDemo: Boolean(data.isDemo),
          createdAt: data.createdAt,
          reviewedAt: data.reviewedAt,
        };
      });
      items.sort((a, b) => tsToMillis(b.createdAt) - tsToMillis(a.createdAt));
      onData(items);
    },
    (err) => onError?.(err)
  );
}

export async function createCVReviewRequest(
  payload: Omit<CVReviewEntity, 'id' | 'status' | 'createdAt' | 'reviewedAt'>
): Promise<string> {
  if (!payload.mentorId) {
    throw new Error('Please choose a specific alumni mentor to review your CV.');
  }
  const ref = await addDoc(collection(db, 'cvReviews'), {
    ...payload,
    status: 'Submitted',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  void triggerNotification({
    recipientId: payload.mentorId,
    title: 'New CV Review Request',
    message: `${payload.studentName} requested CV feedback for "${payload.targetRole}".`,
    type: 'mentorship',
    link: '/alumni/cv-reviews',
    itemId: ref.id,
  });

  return ref.id;
}

export async function submitCVReviewFeedback(params: {
  review: CVReviewEntity;
  score: number;
  strengths: string[];
  areasToImprove: string[];
  mentorFeedback: string;
}): Promise<void> {
  const ratingOutOf5 = Number(((Math.min(100, Math.max(0, params.score)) / 100) * 5).toFixed(1));
  await updateDoc(doc(db, 'cvReviews', params.review.id), {
    status: 'Reviewed',
    score: params.score,
    rating: ratingOutOf5,
    strengths: params.strengths,
    areasToImprove: params.areasToImprove,
    mentorFeedback: params.mentorFeedback,
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  void triggerNotification({
    recipientId: params.review.studentId,
    title: 'Your CV Review is Ready',
    message: `${params.review.mentorName} scored your CV (${params.score}/100) and added detailed feedback.`,
    type: 'mentorship',
    link: '/student/cv-reviews',
    itemId: params.review.id,
  });
}

export function subscribeEvaluations(
  opts: { alumniId?: string; studentId?: string },
  onData: (items: EvaluationEntity[]) => void,
  onError?: (err: Error) => void
): () => void {
  const col = collection(db, 'evaluations');
  const q = opts.alumniId
    ? query(col, where('alumniId', '==', opts.alumniId))
    : opts.studentId
    ? query(col, where('studentId', '==', opts.studentId))
    : col;

  return onSnapshot(
    q,
    (snap) => {
      const items: EvaluationEntity[] = snap.docs.map((d) => {
        const data = d.data() as Record<string, any>;
        return {
          id: d.id,
          studentId: data.studentId || '',
          studentName: data.studentName || 'BAUST Student',
          alumniId: data.alumniId || '',
          alumniName: data.alumniName || 'BAUST Alumni',
          sessionId: data.sessionId || '',
          cvReviewId: data.cvReviewId || '',
          rating: typeof data.rating === 'number' ? data.rating : 5,
          comment: data.comment || '',
          tags: Array.isArray(data.tags) ? data.tags : [],
          recommended: Boolean(data.recommended ?? true),
          createdAt: data.createdAt,
        };
      });
      items.sort((a, b) => tsToMillis(b.createdAt) - tsToMillis(a.createdAt));
      onData(items);
    },
    (err) => onError?.(err)
  );
}

export async function submitStudentEvaluation(
  payload: Omit<EvaluationEntity, 'id' | 'createdAt'>
): Promise<string> {
  const clamped = Math.min(5, Math.max(1, Math.round(payload.rating)));
  const ref = await addDoc(collection(db, 'evaluations'), {
    ...payload,
    rating: clamped,
    createdAt: serverTimestamp(),
  });

  if (payload.alumniId) {
    void triggerNotification({
      recipientId: payload.alumniId,
      title: `Received ${clamped}/5 Mentorship Rating`,
      message: `${payload.studentName} rated your guidance (${clamped} stars).`,
      type: 'mentorship',
      link: '/alumni/mentorship',
      itemId: ref.id,
    });
  }
  return ref.id;
}

// ============================================================================
// 6. USER REPORTS, MODERATION, VERIFIED BADGE & CASCADE CLEANUP (#33, #42, #57, FR-19)
// ============================================================================

export function subscribeReports(
  opts: { reporterId?: string },
  onData: (items: ReportEntity[]) => void,
  onError?: (err: Error) => void
): () => void {
  const col = collection(db, 'reports');
  const q = opts.reporterId ? query(col, where('reporterId', '==', opts.reporterId)) : col;

  return onSnapshot(
    q,
    (snap) => {
      const items: ReportEntity[] = snap.docs.map((d) => {
        const data = d.data() as Record<string, any>;
        return {
          id: d.id,
          reporterId: data.reporterId || '',
          reporterName: data.reporterName || 'BAUST Member',
          reporterRole: (data.reporterRole as UserRole) || 'student',
          targetId: data.targetId || '',
          targetType: data.targetType || 'user',
          targetName: data.targetName || 'Reported Item',
          reason: data.reason || 'Policy Violation',
          details: data.details || '',
          status: data.status || 'Pending',
          reviewedBy: data.reviewedBy || '',
          resolutionNote: data.resolutionNote || '',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      });
      items.sort((a, b) => tsToMillis(b.createdAt) - tsToMillis(a.createdAt));
      onData(items);
    },
    (err) => onError?.(err)
  );
}

export async function submitModerationReport(
  payload: Omit<ReportEntity, 'id' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'reports'), {
    ...payload,
    status: 'Pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  void triggerNotification({
    recipientId: 'ALL_ADMINS',
    title: 'New Safety / Content Report',
    message: `${payload.reporterName} reported "${payload.targetName}" (${payload.reason}).`,
    type: 'report',
    link: '/admin/moderation',
    itemId: ref.id,
  });

  return ref.id;
}

export async function resolveModerationReport(params: {
  report: ReportEntity;
  status: 'Reviewed' | 'Action Taken' | 'Dismissed';
  reviewerId: string;
  reviewerName: string;
  resolutionNote: string;
}): Promise<void> {
  await updateDoc(doc(db, 'reports', params.report.id), {
    status: params.status,
    reviewedBy: params.reviewerName,
    resolutionNote: params.resolutionNote,
    updatedAt: serverTimestamp(),
  });

  void triggerNotification({
    recipientId: params.report.reporterId,
    title: `Report ${params.status}`,
    message: `Your report regarding "${params.report.targetName}" was marked ${params.status}.`,
    type: 'report',
    link: params.report.reporterRole === 'alumni' ? '/alumni/directory' : '/student/directory',
    itemId: params.report.id,
  });

  void logPortalActivity({
    actorId: params.reviewerId,
    actorName: params.reviewerName,
    actorRole: 'admin',
    action: `REPORT_${params.status.toUpperCase().replace(/\s+/g, '_')}`,
    targetType: 'report',
    targetId: params.report.id,
    details: `${params.status} report on ${params.report.targetName}: ${params.resolutionNote}`,
  });
}

export async function toggleUserFeaturedStatus(params: {
  targetUid: string;
  targetName: string;
  targetEmail?: string;
  nextFeatured: boolean;
  actorUid: string;
  actorName: string;
  actorRole: UserRole;
}): Promise<void> {
  if (isDemoAccountEmail(params.targetEmail)) {
    throw new Error('Protected Demo accounts cannot be modified.');
  }
  await updateDoc(doc(db, 'users', params.targetUid), {
    isFeatured: params.nextFeatured,
    updatedAt: serverTimestamp(),
  });

  void triggerNotification({
    recipientId: params.targetUid,
    title: params.nextFeatured ? 'Featured on Landing Showcase!' : 'Featured Highlight Removed',
    message: params.nextFeatured
      ? 'Your BAUST Alumni profile is now featured on the BAUST Career Bridge homepage.'
      : 'Your profile was removed from the featured alumni spotlight.',
    type: 'verification',
    link: '/alumni/my-profile',
    itemId: params.targetUid,
    refId: params.targetUid,
  });

  void logPortalActivity({
    actorId: params.actorUid,
    actorName: params.actorName,
    actorRole: params.actorRole,
    action: params.nextFeatured ? 'FEATURE_ALUMNI' : 'UNFEATURE_ALUMNI',
    targetType: 'user',
    targetId: params.targetUid,
    details: `${params.nextFeatured ? 'Featured' : 'Unfeatured'} ${params.targetName}`,
  });
}

export async function toggleVerifiedAlumniBadge(params: {
  targetUid: string;
  targetName: string;
  targetEmail?: string;
  nextBadge: boolean;
  actorUid: string;
  actorName: string;
}): Promise<void> {
  if (isDemoAccountEmail(params.targetEmail)) {
    throw new Error('Protected Demo accounts cannot be modified.');
  }
  await updateDoc(doc(db, 'users', params.targetUid), {
    verifiedAlumniBadge: params.nextBadge,
    updatedAt: serverTimestamp(),
  });

  void triggerNotification({
    recipientId: params.targetUid,
    title: params.nextBadge ? 'Verified Alumni Badge Granted' : 'Verified Alumni Badge Revoked',
    message: params.nextBadge
      ? 'Congratulations! Super Admin awarded you the official Verified BAUST Alumni trust badge.'
      : 'Your Verified Alumni trust badge was revoked by governance.',
    type: 'verification',
    link: '/alumni/my-profile',
    itemId: params.targetUid,
    refId: params.targetUid,
  });

  void logPortalActivity({
    actorId: params.actorUid,
    actorName: params.actorName,
    actorRole: 'superAdmin',
    action: params.nextBadge ? 'GRANT_VERIFIED_BADGE' : 'REVOKE_VERIFIED_BADGE',
    targetType: 'user',
    targetId: params.targetUid,
    details: `${params.nextBadge ? 'Granted' : 'Revoked'} Verified Alumni badge for ${params.targetName}`,
  });
}

/**
 * Cascading User Deletion / Suspension Cleanup (#33):
 * Removes or closes dependent jobs, appointment slots, verification queue item, and idIndex
 * when a Super Admin deletes or suspends a real user so stale references do not linger.
 */
export async function cascadeDeleteUserResources(params: {
  targetUid: string;
  targetEmail?: string;
  baustId?: string;
  mode: 'suspend' | 'delete';
}): Promise<void> {
  if (isDemoAccountEmail(params.targetEmail)) {
    throw new Error('Protected Demo accounts cannot be suspended or deleted.');
  }

  const batch = writeBatch(db);

  // Close open jobs authored by this user
  const jobsSnap = await getDocs(query(collection(db, 'jobs'), where('postedById', '==', params.targetUid))).catch(
    () => null
  );
  jobsSnap?.forEach((d) => {
    if (params.mode === 'delete') {
      batch.delete(d.ref);
    } else {
      batch.update(d.ref, { status: 'Closed', updatedAt: serverTimestamp() });
    }
  });

  // Cancel open appointment slots owned by this alumni
  const slotsSnap = await getDocs(
    query(collection(db, 'appointments'), where('alumniId', '==', params.targetUid))
  ).catch(() => null);
  slotsSnap?.forEach((d) => {
    if (d.data()?.status === 'available' || params.mode === 'delete') {
      batch.update(d.ref, { status: 'cancelled', updatedAt: serverTimestamp() });
    }
  });

  if (params.mode === 'delete') {
    batch.delete(doc(db, 'users', params.targetUid));
    batch.delete(doc(db, 'verificationRequests', params.targetUid));
    if (params.baustId && /^[a-zA-Z0-9_\-]+$/.test(params.baustId)) {
      batch.delete(doc(db, 'idIndex', params.baustId));
    }
  } else {
    batch.update(doc(db, 'users', params.targetUid), {
      suspended: true,
      isFeatured: false,
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
}
