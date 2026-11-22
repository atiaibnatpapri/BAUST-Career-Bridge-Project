/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, Auth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  onSnapshotsInSync,
  doc,
  getDocFromServer,
  Firestore,
} from 'firebase/firestore';
import firebaseAppletConfig from '../firebase-applet-config.json';

const envConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env?.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: import.meta.env?.VITE_FIREBASE_DATABASE_ID,
};

export const firebaseConfig = {
  projectId: envConfig.projectId || firebaseAppletConfig.projectId,
  appId: envConfig.appId || firebaseAppletConfig.appId,
  apiKey: envConfig.apiKey || firebaseAppletConfig.apiKey,
  authDomain: envConfig.authDomain || firebaseAppletConfig.authDomain,
  firestoreDatabaseId: envConfig.firestoreDatabaseId || firebaseAppletConfig.firestoreDatabaseId,
  storageBucket: envConfig.storageBucket || firebaseAppletConfig.storageBucket,
  messagingSenderId: envConfig.messagingSenderId || firebaseAppletConfig.messagingSenderId,
  measurementId: firebaseAppletConfig.measurementId || '',
};

export const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

function createFirestoreInstance(): Firestore {
  const settings = {
    experimentalAutoDetectLongPolling: true,
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  };
  try {
    return firebaseConfig.firestoreDatabaseId
      ? initializeFirestore(app, settings, firebaseConfig.firestoreDatabaseId)
      : initializeFirestore(app, settings);
  } catch {
    return firebaseConfig.firestoreDatabaseId
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
  }
}

export const db: Firestore = createFirestoreInstance();

export const auth: Auth = getAuth(app);

if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('Auth persistence fallback:', err);
  });
}

// Non-fatal connection check so empty/offline Firestore never crashes UI
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline check: Please verify network connection.');
    }
  }
}

if (typeof window !== 'undefined') {
  void testFirestoreConnection();
}

export function isTransientFirestoreError(error: unknown): boolean {
  const code = String((error as { code?: string })?.code || '').toLowerCase();
  const message = String((error as { message?: string })?.message || error || '').toLowerCase();
  return (
    code === 'unavailable' ||
    code === 'aborted' ||
    code === 'cancelled' ||
    code === 'deadline-exceeded' ||
    message.includes('offline') ||
    message.includes('network') ||
    message.includes('websocket') ||
    message.includes('failed to fetch') ||
    message.includes('transport errored')
  );
}

export function subscribeFirestoreSyncState(onChange: (reconnecting: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  let browserOffline = !window.navigator.onLine;
  let pendingSync = false;

  const emit = () => {
    onChange(browserOffline || pendingSync);
  };

  const handleOnline = () => {
    browserOffline = false;
    emit();
  };
  const handleOffline = () => {
    browserOffline = true;
    emit();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  let unsubSync = () => {};
  try {
    unsubSync = onSnapshotsInSync(db, () => {
      pendingSync = false;
      emit();
    });
  } catch {
    // Ignore if onSnapshotsInSync is unavailable
  }

  emit();

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    unsubSync();
  };
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
