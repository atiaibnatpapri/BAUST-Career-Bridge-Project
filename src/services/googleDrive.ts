/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  User,
} from 'firebase/auth';
import { auth } from './firebase';

export const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.activity',
  'https://www.googleapis.com/auth/drive.activity.readonly',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.apps.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.install',
  'https://www.googleapis.com/auth/drive.meet.readonly',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.scripts',
];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));

// Strict in-memory access token cache (never persisted to localStorage/sessionStorage)
let isSigningIn = false;
let cachedAccessToken: string | null = null;
const tokenListeners = new Set<(token: string | null) => void>();

const notifyTokenListeners = () => {
  tokenListeners.forEach((listener) => listener(cachedAccessToken));
};

export const subscribeDriveToken = (listener: (token: string | null) => void) => {
  tokenListeners.add(listener);
  listener(cachedAccessToken);
  return () => {
    tokenListeners.delete(listener);
  };
};

// Clear cached access token when user signs out
onAuthStateChanged(auth, (user: User | null) => {
  if (!user) {
    cachedAccessToken = null;
    notifyTokenListeners();
  } else if (!cachedAccessToken && !isSigningIn) {
    cachedAccessToken = null;
    notifyTokenListeners();
  }
});

export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else if (!isSigningIn) {
      if (!user) {
        cachedAccessToken = null;
      }
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleDriveSignIn = async (
  roleHint?: string
): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get Google Drive access token from sign-in.');
    }

    cachedAccessToken = credential.accessToken;
    notifyTokenListeners();

    // Sync user profile to Cloud SQL via Firebase ID token
    try {
      const idToken = await result.user.getIdToken();
      await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          email: result.user.email,
          name: result.user.displayName,
          role: roleHint || 'student',
        }),
      });
    } catch (syncErr) {
      console.warn('Cloud SQL user sync note:', syncErr);
    }

    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const getDriveAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const clearDriveAccessToken = () => {
  cachedAccessToken = null;
  notifyTokenListeners();
};

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
  parents?: string[];
}

export interface LinkedDriveDocument {
  id: number;
  userId: number;
  driveFileId: string;
  fileName: string;
  mimeType: string;
  webViewLink: string | null;
  fileSize: string | null;
  category: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

function requireToken(): string {
  if (!cachedAccessToken) {
    throw new Error('AUTH_REQUIRED');
  }
  return cachedAccessToken;
}

async function handleDriveResponse(res: Response) {
  if (res.status === 401) {
    clearDriveAccessToken();
    throw new Error('AUTH_REQUIRED');
  }
  if (!res.ok) {
    const errText = await res.text();
    let msg = `Google Drive API error (${res.status})`;
    try {
      const parsed = JSON.parse(errText);
      if (parsed?.error?.message) {
        msg = parsed.error.message;
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function listDriveFiles(params?: {
  query?: string;
  mimeFilter?: string;
  pageToken?: string;
}): Promise<{ files: DriveFileItem[]; nextPageToken?: string }> {
  const token = requireToken();
  const qParts = ['trashed = false'];

  if (params?.query?.trim()) {
    const escaped = params.query.trim().replace(/'/g, "\\'");
    qParts.push(`name contains '${escaped}'`);
  }
  if (params?.mimeFilter && params.mimeFilter !== 'ALL') {
    if (params.mimeFilter === 'FOLDER') {
      qParts.push("mimeType = 'application/vnd.google-apps.folder'");
    } else if (params.mimeFilter === 'PDF') {
      qParts.push("mimeType = 'application/pdf'");
    } else if (params.mimeFilter === 'DOCS') {
      qParts.push(
        "(mimeType = 'application/vnd.google-apps.document' or mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')"
      );
    }
  }

  const search = new URLSearchParams({
    pageSize: '24',
    orderBy: 'modifiedTime desc',
    fields:
      'nextPageToken, files(id, name, mimeType, size, modifiedTime, webViewLink, iconLink, parents)',
    q: qParts.join(' and '),
  });
  if (params?.pageToken) {
    search.set('pageToken', params.pageToken);
  }

  const res = await fetch(`${DRIVE_API_BASE}/files?${search.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleDriveResponse(res);
}

export async function uploadFileToDrive(
  file: File,
  options?: { name?: string; description?: string; parentId?: string }
): Promise<DriveFileItem> {
  const token = requireToken();
  const metadata: Record<string, unknown> = {
    name: options?.name || file.name,
    mimeType: file.type || 'application/octet-stream',
  };
  if (options?.description) {
    metadata.description = options.description;
  }
  if (options?.parentId) {
    metadata.parents = [options.parentId];
  }

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', file);

  const res = await fetch(
    `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink,iconLink`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }
  );
  return handleDriveResponse(res);
}

export async function createDriveFolder(name: string): Promise<DriveFileItem> {
  const token = requireToken();
  const res = await fetch(
    `${DRIVE_API_BASE}/files?fields=id,name,mimeType,modifiedTime,webViewLink`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    }
  );
  return handleDriveResponse(res);
}

export async function renameDriveFile(
  fileId: string,
  newName: string
): Promise<DriveFileItem> {
  const token = requireToken();
  const res = await fetch(
    `${DRIVE_API_BASE}/files/${encodeURIComponent(fileId)}?fields=id,name,mimeType,size,modifiedTime,webViewLink`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newName }),
    }
  );
  return handleDriveResponse(res);
}

export async function deleteDriveFile(fileId: string): Promise<void> {
  const token = requireToken();
  const res = await fetch(`${DRIVE_API_BASE}/files/${encodeURIComponent(fileId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleDriveResponse(res);
}

export async function downloadDriveFile(file: DriveFileItem): Promise<void> {
  const token = requireToken();
  const isGoogleWorkspaceDoc = file.mimeType.startsWith('application/vnd.google-apps.');
  const url = isGoogleWorkspaceDoc
    ? `${DRIVE_API_BASE}/files/${encodeURIComponent(file.id)}/export?mimeType=application/pdf`
    : `${DRIVE_API_BASE}/files/${encodeURIComponent(file.id)}?alt=media`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    clearDriveAccessToken();
    throw new Error('AUTH_REQUIRED');
  }
  if (!res.ok) {
    throw new Error(`Unable to download "${file.name}" (${res.status})`);
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = isGoogleWorkspaceDoc && !file.name.endsWith('.pdf')
    ? `${file.name}.pdf`
    : file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

// Cloud SQL Persistence API calls (secured by Firebase ID Token)
async function getFirebaseAuthHeaders(): Promise<Record<string, string> | null> {
  const user = auth.currentUser;
  if (!user) return null;
  const idToken = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${idToken}`,
  };
}

export async function fetchLinkedDriveDocuments(): Promise<LinkedDriveDocument[]> {
  const headers = await getFirebaseAuthHeaders();
  if (!headers) return [];

  const res = await fetch('/api/drive-documents', { headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load linked documents');
  }
  const data = await res.json();
  return data.documents || [];
}

export async function linkDriveDocumentToVault(payload: {
  driveFileId: string;
  fileName: string;
  mimeType: string;
  webViewLink?: string;
  fileSize?: string;
  category: string;
  notes?: string;
  userName?: string;
  userRole?: string;
}): Promise<LinkedDriveDocument> {
  const headers = await getFirebaseAuthHeaders();
  if (!headers) {
    throw new Error('Please sign in with Google to save linked documents.');
  }

  const res = await fetch('/api/drive-documents', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      driveFileId: payload.driveFileId,
      fileName: payload.fileName,
      mimeType: payload.mimeType,
      webViewLink: payload.webViewLink,
      fileSize: payload.fileSize,
      category: payload.category,
      notes: payload.notes,
      name: payload.userName,
      role: payload.userRole,
    }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to link document');
  }
  const data = await res.json();
  return data.document;
}

export async function updateLinkedDriveDocumentName(
  driveFileId: string,
  fileName: string
): Promise<void> {
  const headers = await getFirebaseAuthHeaders();
  if (!headers) return;

  await fetch(`/api/drive-documents/${encodeURIComponent(driveFileId)}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ fileName }),
  });
}

export async function unlinkDriveDocumentFromVault(docId: number): Promise<void> {
  const headers = await getFirebaseAuthHeaders();
  if (!headers) {
    throw new Error('Please sign in with Google first.');
  }

  const res = await fetch(`/api/drive-documents/${docId}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to remove linked document');
  }
}

export function formatBytes(bytesStr?: string | null): string {
  if (!bytesStr) return 'Cloud File';
  const bytes = Number(bytesStr);
  if (Number.isNaN(bytes) || bytes <= 0) return 'Cloud File';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
