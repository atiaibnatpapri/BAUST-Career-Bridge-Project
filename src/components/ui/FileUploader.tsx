/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  uploadFile,
  UploadFileKind,
  UploadFileResult,
  validateCvFile,
  validatePhotoFile,
  formatBytes,
} from '../../services/fileUploadService';
import { Button } from './Button';
import { UploadCloud, FileText, Image as ImageIcon, RefreshCw, Trash2, AlertCircle, Eye } from 'lucide-react';

interface FileUploaderProps {
  kind: UploadFileKind;
  uid: string;
  docId?: string;
  sharedWith?: string[];
  currentUrl?: string;
  currentFileName?: string;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  onUploaded: (result: UploadFileResult) => void;
  onRemove?: () => void;
  onPreview?: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  kind,
  uid,
  docId,
  sharedWith,
  currentUrl,
  currentFileName,
  label,
  helperText,
  disabled = false,
  onUploaded,
  onRemove,
  onPreview,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadedMeta, setUploadedMeta] = useState<{ name: string; size?: number } | null>(null);

  const accept = kind === 'photo' ? '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp' : '.pdf,application/pdf';
  const defaultHelper =
    kind === 'photo'
      ? 'JPG, JPEG, PNG or WEBP · Max 5 MB (auto-optimized to 400×400)'
      : 'PDF only · Max 5 MB (Cloud Storage or <= 700 KB verified PDF vault)';

  const processFile = async (file: File) => {
    setErrorMsg(null);
    const validationErr = kind === 'photo' ? validatePhotoFile(file) : validateCvFile(file);
    if (validationErr) {
      setErrorMsg(validationErr);
      return;
    }

    let tempPreview: string | null = null;
    if (kind === 'photo') {
      tempPreview = URL.createObjectURL(file);
      setLocalPreview(tempPreview);
    }

    setUploading(true);
    setProgress(8);

    try {
      const result = await uploadFile({
        file,
        kind,
        uid,
        docId,
        sharedWith,
        onProgress: (pct) => setProgress(pct),
      });
      setUploadedMeta({ name: result.fileName, size: result.sizeBytes });
      if (kind === 'photo') {
        setLocalPreview(result.url);
      }
      onUploaded(result);
    } catch (err: any) {
      setErrorMsg(err?.message || 'File upload failed. Please try again.');
      if (kind === 'photo' && tempPreview) {
        setLocalPreview(null);
      }
    } finally {
      setUploading(false);
      if (tempPreview && tempPreview.startsWith('blob:')) {
        URL.revokeObjectURL(tempPreview);
      }
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void processFile(file);
    }
  };

  const displayName = uploadedMeta?.name || currentFileName;
  const displayPhotoUrl = localPreview || (kind === 'photo' ? currentUrl : undefined);
  const hasExistingFile = Boolean(displayName || currentUrl || localPreview);

  return (
    <div className="space-y-2.5 w-full">
      {label && <p className="text-xs font-semibold text-slate-700">{label}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      {hasExistingFile && !uploading && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {kind === 'photo' && displayPhotoUrl ? (
              <img
                src={displayPhotoUrl}
                alt={displayName || 'Profile preview'}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600 shrink-0">
                {kind === 'photo' ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {displayName || (kind === 'photo' ? 'Uploaded photo' : 'Uploaded CV.pdf')}
              </p>
              <p className="text-xs text-slate-500">
                {uploadedMeta?.size ? formatBytes(uploadedMeta.size) : kind === 'photo' ? 'Ready to save' : 'PDF Document'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {onPreview && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onPreview}
                leftIcon={<Eye className="w-3.5 h-3.5" />}
              >
                View
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Replace
            </Button>
            {onRemove && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={() => {
                  setLocalPreview(null);
                  setUploadedMeta(null);
                  setErrorMsg(null);
                  onRemove();
                }}
                className="text-rose-600 hover:bg-rose-50"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      )}

      {(!hasExistingFile || uploading) && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled && !uploading) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => {
            if (!disabled && !uploading) inputRef.current?.click();
          }}
          className={`border-2 border-dashed rounded-2xl p-5 text-center transition-colors cursor-pointer ${
            isDragging
              ? 'border-[#0F2A4A] bg-blue-50/60'
              : 'border-slate-300 bg-slate-50/40 hover:border-slate-400 hover:bg-slate-50'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <UploadCloud className="w-7 h-7 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-700">
            {uploading
              ? `Uploading ${kind === 'photo' ? 'photo' : 'PDF CV'}... ${progress}%`
              : kind === 'photo'
              ? 'Drag & drop profile photo here, or click to browse'
              : 'Drag & drop your PDF CV here, or click to browse'}
          </p>
          <p className="text-xs text-slate-500 mt-1">{helperText || defaultHelper}</p>

          {uploading && (
            <div className="w-full max-w-xs mx-auto h-2 bg-slate-200 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-[#0F2A4A] transition-all duration-200"
                style={{ width: `${Math.max(8, progress)}%` }}
              />
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <div role="alert" className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
