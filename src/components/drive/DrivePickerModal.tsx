/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { GoogleSignInButton } from './GoogleSignInButton';
import {
  DriveFileItem,
  formatBytes,
  getDriveAccessToken,
  googleDriveSignIn,
  listDriveFiles,
  subscribeDriveToken,
  uploadFileToDrive,
} from '../../services/googleDrive';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Folder,
  Search,
  UploadCloud,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface DrivePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFile: (file: DriveFileItem) => void;
  title?: string;
  description?: string;
  defaultFilter?: 'ALL' | 'PDF' | 'DOCS';
}

export const DrivePickerModal: React.FC<DrivePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectFile,
  title = 'Select File from Google Drive',
  description = 'Choose an existing document from your Google Drive or upload a new file directly.',
  defaultFilter = 'ALL',
}) => {
  const { role, addToast } = useApp();
  const [hasToken, setHasToken] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mimeFilter, setMimeFilter] = useState<'ALL' | 'PDF' | 'DOCS'>(defaultFilter);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeDriveToken((token) => {
      setHasToken(Boolean(token));
    });
    return unsub;
  }, []);

  const loadFiles = async () => {
    const token = await getDriveAccessToken();
    if (!token) {
      setHasToken(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await listDriveFiles({ query: searchQuery, mimeFilter });
      setFiles(
        (data.files || []).filter(
          (f) => f.mimeType !== 'application/vnd.google-apps.folder'
        )
      );
    } catch (err: any) {
      if (err.message === 'AUTH_REQUIRED') {
        setHasToken(false);
      } else {
        setError(err.message || 'Could not load Google Drive files.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && hasToken) {
      loadFiles();
    }
  }, [isOpen, hasToken, mimeFilter]);

  const handleConnectGoogle = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      await googleDriveSignIn(role);
      setHasToken(true);
      addToast('success', 'Google Drive Connected', 'You can now browse and attach your Drive files.');
    } catch (err: any) {
      setError(err.message || 'Google Sign-In was cancelled or failed.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleUploadNew = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const uploaded = await uploadFileToDrive(file, {
        description: 'Uploaded via BAUST Career Bridge',
      });
      addToast('success', 'Uploaded to Google Drive', `${uploaded.name} is ready.`);
      onSelectFile(uploaded);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Upload to Google Drive failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} description={description} maxWidth="2xl">
      {!hasToken ? (
        <div className="py-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0F2A4A]/5 border border-slate-200 flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7 text-[#0F2A4A]" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h4 className="text-base font-bold text-[#0F2A4A]">
              Connect Your Google Drive
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sign in with your Google account to browse, attach, or upload CVs, transcripts, and academic certificates directly from Google Drive.
            </p>
          </div>
          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 max-w-md mx-auto">
              {error}
            </p>
          )}
          <div className="flex justify-center pt-1">
            <GoogleSignInButton
              onClick={handleConnectGoogle}
              disabled={isConnecting}
              label={isConnecting ? 'Connecting...' : 'Sign in with Google'}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Search & Filter Row */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="flex-1">
              <Input
                placeholder="Search files in your Google Drive..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    loadFiles();
                  }
                }}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={mimeFilter}
                onChange={(e) => setMimeFilter(e.target.value as 'ALL' | 'PDF' | 'DOCS')}
                className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0F2A4A]/20"
              >
                <option value="ALL">All Files</option>
                <option value="PDF">PDF Only</option>
                <option value="DOCS">Docs & Word</option>
              </select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={loadFiles}
                isLoading={isLoading}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Search
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Upload Direct to Drive Bar */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2.5">
              <UploadCloud className="w-4 h-4 text-[#2E5E3E]" />
              <span className="text-xs font-medium text-slate-700">
                Want to upload a new document to Google Drive?
              </span>
            </div>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2E5E3E] hover:bg-[#1E3F2A] text-white text-xs font-semibold cursor-pointer transition-colors">
              <span>{isUploading ? 'Uploading...' : 'Upload & Attach'}</span>
              <input
                type="file"
                className="hidden"
                disabled={isUploading}
                onChange={handleUploadNew}
              />
            </label>
          </div>

          {/* File List */}
          <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {isLoading ? (
              <div className="py-10 text-center text-xs text-slate-500">
                Loading your Google Drive files...
              </div>
            ) : files.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500">
                No matching files found in your Google Drive.
              </div>
            ) : (
              files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between gap-3 p-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#0F2A4A]/5 text-[#0F2A4A] flex items-center justify-center shrink-0">
                      {file.mimeType === 'application/vnd.google-apps.folder' ? (
                        <Folder className="w-4 h-4 text-[#C9A227]" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {formatBytes(file.size)} ·{' '}
                        {file.modifiedTime
                          ? new Date(file.modifiedTime).toLocaleDateString()
                          : 'Google Drive'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-400 hover:text-[#0F2A4A] rounded-lg"
                        title="Open in Google Drive"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        onSelectFile(file);
                        onClose();
                      }}
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Select
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
