/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import {
  arrayUnion,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, storage } from '../firebase';

export type UploadFileKind = 'photo' | 'cv';

export const MAX_PHOTO_INPUT_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_CV_INPUT_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_FIRESTORE_CV_BYTES = 700 * 1024; // 700 KB binary (~933 KB base64 < 1 MiB doc limit)
export const MAX_FIRESTORE_PHOTO_BYTES = 150 * 1024; // 150 KB compressed JPEG data URL

const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_PHOTO_EXT = /\.(jpe?g|png|webp)$/i;
const ALLOWED_CV_EXT = /\.pdf$/i;

export interface UploadFileResult {
  url: string;
  storageMode: 'storage' | 'firestore';
  fileDocId?: string;
  fileName: string;
  sizeBytes: number;
}

export interface UploadFileOptions {
  file: File;
  kind: UploadFileKind;
  uid: string;
  docId?: string;
  sharedWith?: string[];
  onProgress?: (percent: number) => void;
}

export function validatePhotoFile(file: File): string | null {
  const mime = (file.type || '').toLowerCase();
  const validType = ALLOWED_PHOTO_TYPES.includes(mime) || ALLOWED_PHOTO_EXT.test(file.name);
  if (!validType) {
    return 'Please choose a JPG, JPEG, PNG, or WEBP image file.';
  }
  if (file.size > MAX_PHOTO_INPUT_BYTES) {
    return `Photo size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the 5 MB limit.`;
  }
  return null;
}

export function validateCvFile(file: File): string | null {
  const mime = (file.type || '').toLowerCase();
  const validPdf = mime === 'application/pdf' || ALLOWED_CV_EXT.test(file.name);
  if (!validPdf) {
    return 'Only PDF (.pdf) CV documents are supported.';
  }
  if (file.size > MAX_CV_INPUT_BYTES) {
    return `CV file size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the 5 MB limit.`;
  }
  return null;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Could not read file as data URL.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

export function compressPhotoToDataUrl(file: File, maxDimension = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const tryExport = (dim: number, quality: number): string => {
          const scale = Math.min(1, dim / Math.max(img.width || dim, img.height || dim));
          const w = Math.max(1, Math.round((img.width || dim) * scale));
          const h = Math.max(1, Math.round((img.height || dim) * scale));
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Canvas context unavailable for image compression.');
          }
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          return canvas.toDataURL('image/jpeg', quality);
        };

        const qualities = [0.8, 0.7, 0.58, 0.45];
        const dims = [maxDimension, 320, 240];
        let best = '';
        for (const dim of dims) {
          for (const q of qualities) {
            const candidate = tryExport(dim, q);
            best = candidate;
            if (candidate.length <= MAX_FIRESTORE_PHOTO_BYTES) {
              URL.revokeObjectURL(objectUrl);
              resolve(candidate);
              return;
            }
          }
        }
        URL.revokeObjectURL(objectUrl);
        resolve(best);
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Selected file is not a valid readable image.'));
    };
    img.src = objectUrl;
  });
}

async function tryFirebaseStorageUpload(
  path: string,
  file: File,
  onProgress?: (percent: number) => void,
  timeoutMs = 5500
): Promise<string> {
  return new Promise((resolve, reject) => {
    let settled = false;
    let task: ReturnType<typeof uploadBytesResumable> | null = null;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        try {
          task?.cancel();
        } catch {
          // ignore
        }
        reject(new Error('Storage upload timed out'));
      }
    }, timeoutMs);

    try {
      const targetRef = storageRef(storage, path);
      task = uploadBytesResumable(targetRef, file, {
        contentType: file.type || (path.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
      });
      task.on(
        'state_changed',
        (snap) => {
          if (snap.totalBytes > 0) {
            const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 85);
            onProgress?.(pct);
          }
        },
        (err) => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            reject(err);
          }
        },
        async () => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            try {
              const downloadUrl = await getDownloadURL(task!.snapshot.ref);
              onProgress?.(100);
              resolve(downloadUrl);
            } catch (urlErr) {
              reject(urlErr);
            }
          }
        }
      );
    } catch (initErr) {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        reject(initErr);
      }
    }
  });
}

export async function uploadFile(options: UploadFileOptions): Promise<UploadFileResult> {
  const { file, kind, uid, docId, sharedWith = [], onProgress } = options;

  if (!uid) {
    throw new Error('You must be signed in to upload files.');
  }

  const validationError = kind === 'photo' ? validatePhotoFile(file) : validateCvFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const safeCleanName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '_');
  const storagePath =
    kind === 'photo'
      ? `profile-photos/${uid}/${Date.now()}_${safeCleanName}`
      : `student-cvs/${uid}/${Date.now()}_${safeCleanName}`;

  onProgress?.(10);

  // 1. Primary: Firebase Cloud Storage
  try {
    const url = await tryFirebaseStorageUpload(storagePath, file, onProgress);
    onProgress?.(100);
    return {
      url,
      storageMode: 'storage',
      fileName: file.name,
      sizeBytes: file.size,
    };
  } catch {
    // Fallback below when Storage CORS / rules / billing is unavailable in preview
  }

  // 2. Fallback: Compressed JPEG data URL for photos, userFiles/{docId} for PDFs <= 700 KB
  if (kind === 'photo') {
    onProgress?.(55);
    const dataUrl = await compressPhotoToDataUrl(file, 400);
    onProgress?.(100);
    return {
      url: dataUrl,
      storageMode: 'firestore',
      fileName: file.name,
      sizeBytes: dataUrl.length,
    };
  }

  if (file.size > MAX_FIRESTORE_CV_BYTES) {
    throw new Error(
      `PDF is ${(file.size / 1024).toFixed(0)} KB, which exceeds the 700 KB Firestore fallback limit while Cloud Storage is unavailable. Please upload a PDF under 700 KB.`
    );
  }

  onProgress?.(50);
  const dataUrl = await fileToDataUrl(file);
  const safeId = (docId || `cv_${uid}_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  const cleanSharedWith = Array.from(new Set(sharedWith.filter((id) => Boolean(id) && id !== uid))).slice(0, 50);

  await setDoc(doc(db, 'userFiles', safeId), {
    id: safeId,
    ownerId: uid,
    kind: 'cv',
    fileName: file.name,
    mimeType: 'application/pdf',
    sizeBytes: file.size,
    base64DataUrl: dataUrl,
    sharedWith: cleanSharedWith,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  onProgress?.(100);
  return {
    url: `firestore://userFiles/${safeId}`,
    storageMode: 'firestore',
    fileDocId: safeId,
    fileName: file.name,
    sizeBytes: file.size,
  };
}

export async function grantUserFileAccess(
  fileDocId?: string | null,
  targetUid?: string | null
): Promise<void> {
  if (!fileDocId || !targetUid) return;
  try {
    await updateDoc(doc(db, 'userFiles', fileDocId), {
      sharedWith: arrayUnion(targetUid),
      updatedAt: serverTimestamp(),
    });
  } catch {
    // Best effort: Admin/SuperAdmin already have read access, or file may use direct URL
  }
}

export async function deleteUserFile(fileDocId?: string | null): Promise<void> {
  if (!fileDocId) return;
  try {
    await deleteDoc(doc(db, 'userFiles', fileDocId));
  } catch {
    // Best effort cleanup
  }
}

export function dataUrlToBlobUrl(dataUrl: string): string {
  const commaIdx = dataUrl.indexOf(',');
  if (commaIdx === -1) return dataUrl;
  const header = dataUrl.slice(0, commaIdx);
  const base64 = dataUrl.slice(commaIdx + 1);
  const mimeMatch = header.match(/data:([^;]+);base64/i);
  const mimeType = mimeMatch?.[1] || 'application/pdf';
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  return URL.createObjectURL(blob);
}

export async function resolveFilePreviewUrl(params: {
  url?: string;
  fileDocId?: string;
  fileName?: string;
}): Promise<{
  previewUrl: string;
  downloadUrl: string;
  fileName: string;
  revokeAfterUse: boolean;
}> {
  const { url = '', fileDocId, fileName = 'document.pdf' } = params;

  const extractedDocId =
    fileDocId ||
    (url.startsWith('firestore://userFiles/') ? url.replace('firestore://userFiles/', '').trim() : '');

  if (extractedDocId) {
    const snap = await getDoc(doc(db, 'userFiles', extractedDocId));
    if (!snap.exists()) {
      throw new Error('Stored CV document could not be found.');
    }
    const data = snap.data() as Record<string, any>;
    const rawDataUrl = String(data.base64DataUrl || '');
    if (!rawDataUrl) {
      throw new Error('Stored CV document is empty.');
    }
    const blobUrl = dataUrlToBlobUrl(rawDataUrl);
    return {
      previewUrl: blobUrl,
      downloadUrl: blobUrl,
      fileName: String(data.fileName || fileName),
      revokeAfterUse: true,
    };
  }

  if (url.startsWith('data:')) {
    const blobUrl = url.startsWith('data:application/pdf') ? dataUrlToBlobUrl(url) : url;
    return {
      previewUrl: blobUrl,
      downloadUrl: blobUrl,
      fileName,
      revokeAfterUse: blobUrl !== url,
    };
  }

  return {
    previewUrl: url,
    downloadUrl: url,
    fileName,
    revokeAfterUse: false,
  };
}

export function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
