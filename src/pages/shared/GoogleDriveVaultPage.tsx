/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { GoogleSignInButton } from '../../components/drive/GoogleSignInButton';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  DriveFileItem,
  LinkedDriveDocument,
  createDriveFolder,
  deleteDriveFile,
  downloadDriveFile,
  fetchLinkedDriveDocuments,
  formatBytes,
  getDriveAccessToken,
  googleDriveSignIn,
  linkDriveDocumentToVault,
  listDriveFiles,
  renameDriveFile,
  subscribeDriveToken,
  unlinkDriveDocumentFromVault,
  updateLinkedDriveDocumentName,
  uploadFileToDrive,
} from '../../services/googleDrive';
import {
  HardDrive,
  Search,
  UploadCloud,
  FolderPlus,
  FileText,
  Folder,
  ExternalLink,
  Download,
  Pencil,
  Trash2,
  BookmarkPlus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

type CategoryType = 'cv' | 'transcript' | 'certificate' | 'verification' | 'other';

export const GoogleDriveVaultPage: React.FC = () => {
  const { role, currentUser, addToast } = useApp();
  const { firebaseUser } = useAuth();

  const [hasDriveToken, setHasDriveToken] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'drive' | 'linked'>('drive');

  // Drive files state
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mimeFilter, setMimeFilter] = useState<'ALL' | 'PDF' | 'DOCS' | 'FOLDER'>('ALL');
  const [isUploading, setIsUploading] = useState(false);

  // Linked Vault Documents (stored in PostgreSQL)
  const [linkedDocs, setLinkedDocs] = useState<LinkedDriveDocument[]>([]);
  const [isLoadingLinked, setIsLoadingLinked] = useState(false);

  // Create Folder Modal
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('BAUST Career Bridge Documents');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Link to Vault Modal
  const [linkingFile, setLinkingFile] = useState<DriveFileItem | null>(null);
  const [linkCategory, setLinkCategory] = useState<CategoryType>('cv');
  const [linkNotes, setLinkNotes] = useState('');
  const [isSavingLink, setIsSavingLink] = useState(false);

  // Rename Confirmation Modal (mandatory user confirmation for modifying Drive files)
  const [renamingFile, setRenamingFile] = useState<DriveFileItem | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  // Delete Confirmation Modal (mandatory user confirmation for deleting Drive files)
  const [deletingFile, setDeletingFile] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Unlink Confirmation Modal
  const [unlinkingDoc, setUnlinkingDoc] = useState<LinkedDriveDocument | null>(null);
  const [isUnlinking, setIsUnlinking] = useState(false);

  useEffect(() => {
    const unsub = subscribeDriveToken((token) => {
      setHasDriveToken(Boolean(token));
    });
    return unsub;
  }, []);

  const loadDriveFiles = async () => {
    const token = await getDriveAccessToken();
    if (!token) {
      setHasDriveToken(false);
      return;
    }
    setIsLoadingDrive(true);
    try {
      const data = await listDriveFiles({
        query: searchQuery,
        mimeFilter,
      });
      setDriveFiles(data.files || []);
    } catch (err: any) {
      if (err.message === 'AUTH_REQUIRED') {
        setHasDriveToken(false);
      } else {
        addToast('error', 'Drive Load Failed', err.message || 'Could not retrieve Drive files.');
      }
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const loadLinkedDocs = async () => {
    if (!firebaseUser) {
      setLinkedDocs([]);
      return;
    }
    setIsLoadingLinked(true);
    try {
      const docs = await fetchLinkedDriveDocuments();
      setLinkedDocs(docs);
    } catch (err: any) {
      console.warn('Linked documents load note:', err.message);
    } finally {
      setIsLoadingLinked(false);
    }
  };

  useEffect(() => {
    if (hasDriveToken) {
      loadDriveFiles();
    }
  }, [hasDriveToken, mimeFilter]);

  useEffect(() => {
    if (firebaseUser) {
      loadLinkedDocs();
    }
  }, [firebaseUser?.uid]);

  const handleConnectGoogle = async () => {
    setIsConnecting(true);
    try {
      await googleDriveSignIn(role);
      setHasDriveToken(true);
      addToast('success', 'Google Drive Connected', 'Your Google Drive workspace is now active.');
      await loadLinkedDocs();
    } catch (err: any) {
      addToast('error', 'Connection Cancelled', err.message || 'Could not connect Google Drive.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const uploaded = await uploadFileToDrive(file, {
        description: `Uploaded by ${currentUser.name} via BAUST Career Bridge`,
      });
      addToast('success', 'Uploaded to Google Drive', `${uploaded.name} has been saved.`);
      await loadDriveFiles();
    } catch (err: any) {
      addToast('error', 'Upload Failed', err.message || 'Could not upload file to Google Drive.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setIsCreatingFolder(true);
    try {
      const folder = await createDriveFolder(newFolderName.trim());
      addToast('success', 'Folder Created', `Created "${folder.name}" in Google Drive.`);
      setIsFolderModalOpen(false);
      await loadDriveFiles();
    } catch (err: any) {
      addToast('error', 'Folder Creation Failed', err.message || 'Could not create folder.');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleConfirmLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkingFile) return;
    setIsSavingLink(true);
    try {
      await linkDriveDocumentToVault({
        driveFileId: linkingFile.id,
        fileName: linkingFile.name,
        mimeType: linkingFile.mimeType,
        webViewLink: linkingFile.webViewLink,
        fileSize: linkingFile.size,
        category: linkCategory,
        notes: linkNotes.trim() || undefined,
        userName: currentUser.name,
        userRole: role,
      });
      addToast('success', 'Document Saved to Vault', `${linkingFile.name} linked to your BAUST portfolio.`);
      setLinkingFile(null);
      setLinkNotes('');
      await loadLinkedDocs();
    } catch (err: any) {
      addToast('error', 'Save Failed', err.message || 'Could not link document.');
    } finally {
      setIsSavingLink(false);
    }
  };

  const handleConfirmRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingFile || !renameValue.trim()) return;
    setIsRenaming(true);
    try {
      const updated = await renameDriveFile(renamingFile.id, renameValue.trim());
      await updateLinkedDriveDocumentName(renamingFile.id, updated.name);
      addToast('success', 'File Renamed', `Renamed to "${updated.name}" in Google Drive.`);
      setRenamingFile(null);
      await loadDriveFiles();
      await loadLinkedDocs();
    } catch (err: any) {
      addToast('error', 'Rename Failed', err.message || 'Could not rename file.');
    } finally {
      setIsRenaming(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingFile) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(deletingFile.id);
      addToast('info', 'File Deleted', `"${deletingFile.name}" was permanently removed from Google Drive.`);
      setDeletingFile(null);
      await loadDriveFiles();
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message || 'Could not delete file from Google Drive.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmUnlink = async () => {
    if (!unlinkingDoc) return;
    setIsUnlinking(true);
    try {
      await unlinkDriveDocumentFromVault(unlinkingDoc.id);
      addToast('info', 'Document Unlinked', `"${unlinkingDoc.fileName}" removed from your BAUST Vault.`);
      setUnlinkingDoc(null);
      await loadLinkedDocs();
    } catch (err: any) {
      addToast('error', 'Remove Failed', err.message || 'Could not remove linked document.');
    } finally {
      setIsUnlinking(false);
    }
  };

  const handleDownload = async (file: DriveFileItem) => {
    try {
      await downloadDriveFile(file);
      addToast('success', 'Download Started', `Downloading ${file.name}`);
    } catch (err: any) {
      addToast('error', 'Download Failed', err.message || 'Unable to download file.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0F2A4A] via-[#1A3E68] to-[#2E5E3E] rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold">
            <HardDrive className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Google Drive & Academic Document Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Manage CVs, Transcripts & Career Documents
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Connect your Google Drive to store, organize, and attach official resumes, degree certificates, and verification records across BAUST Career Bridge.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {hasDriveToken ? (
            <>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C9A227] hover:bg-[#DFB83B] text-[#0F2A4A] text-xs font-bold cursor-pointer shadow-sm transition-colors">
                <UploadCloud className="w-4 h-4" />
                <span>{isUploading ? 'Uploading...' : 'Upload to Drive'}</span>
                <input
                  type="file"
                  className="hidden"
                  disabled={isUploading}
                  onChange={handleUploadFile}
                />
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-white/90 bg-white text-[#0F2A4A] hover:bg-slate-100 hover:text-[#0F2A4A] focus:bg-slate-100 focus:text-[#0F2A4A] active:bg-slate-200 active:text-[#0F2A4A] visited:text-[#0F2A4A] [&_svg]:text-[#0F2A4A] shadow-xs"
                onClick={() => setIsFolderModalOpen(true)}
                leftIcon={<FolderPlus className="w-4 h-4" />}
              >
                New Folder
              </Button>
            </>
          ) : (
            <GoogleSignInButton
              onClick={handleConnectGoogle}
              disabled={isConnecting}
              label={isConnecting ? 'Connecting...' : 'Sign in with Google'}
            />
          )}
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('drive')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'drive'
                ? 'bg-[#0F2A4A] text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            My Google Drive Files
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('linked')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'linked'
                ? 'bg-[#0F2A4A] text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>Saved BAUST Vault</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#C9A227] text-[#0F2A4A]">
              {linkedDocs.length}
            </span>
          </button>
        </div>

        {hasDriveToken && activeTab === 'drive' && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadDriveFiles}
            isLoading={isLoadingDrive}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Drive
          </Button>
        )}
      </div>

      {/* Tab 1: Google Drive Browser */}
      {activeTab === 'drive' && (
        !hasDriveToken ? (
          <Card className="p-10 text-center space-y-4 border-slate-200">
            <div className="w-16 h-16 rounded-2xl bg-[#0F2A4A]/5 border border-slate-200 flex items-center justify-center mx-auto">
              <HardDrive className="w-8 h-8 text-[#0F2A4A]" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-lg font-bold text-[#0F2A4A]">
                Google Drive Access Required
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Authorize Google Drive with your permission to browse your folders, upload resumes and certificates, and attach files directly to BAUST workflows.
              </p>
            </div>
            <div className="flex justify-center pt-2">
              <GoogleSignInButton
                onClick={handleConnectGoogle}
                disabled={isConnecting}
                label={isConnecting ? 'Authorizing...' : 'Sign in with Google'}
              />
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Search & Filter Toolbar */}
            <Card className="p-4 border-slate-200 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="flex-1">
                <Input
                  placeholder="Search files by name in Google Drive..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      loadDriveFiles();
                    }
                  }}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <div className="flex items-center gap-2">
                {(['ALL', 'PDF', 'DOCS', 'FOLDER'] as const).map((filterKey) => (
                  <button
                    key={filterKey}
                    type="button"
                    onClick={() => setMimeFilter(filterKey)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      mimeFilter === filterKey
                        ? 'bg-[#2E5E3E] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filterKey === 'ALL'
                      ? 'All'
                      : filterKey === 'PDF'
                      ? 'PDFs'
                      : filterKey === 'DOCS'
                      ? 'Docs'
                      : 'Folders'}
                  </button>
                ))}
                <Button type="button" size="sm" variant="primary" onClick={loadDriveFiles}>
                  Search
                </Button>
              </div>
            </Card>

            {/* Files Grid */}
            {isLoadingDrive ? (
              <Card className="p-12 text-center text-xs text-slate-500">
                Loading files from Google Drive...
              </Card>
            ) : driveFiles.length === 0 ? (
              <Card className="p-12 text-center space-y-2 border-dashed border-slate-300">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No matching files found</p>
                <p className="text-xs text-slate-500">
                  Upload a CV, transcript, or certificate using the button above.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {driveFiles.map((file) => {
                  const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                  const isAlreadyLinked = linkedDocs.some((d) => d.driveFileId === file.id);

                  return (
                    <Card
                      key={file.id}
                      className="p-4 border-slate-200 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isFolder
                              ? 'bg-amber-50 text-[#C9A227]'
                              : 'bg-[#0F2A4A]/5 text-[#0F2A4A]'
                          }`}
                        >
                          {isFolder ? (
                            <Folder className="w-5 h-5" />
                          ) : (
                            <FileText className="w-5 h-5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate" title={file.name}>
                            {file.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {isFolder ? 'Folder' : formatBytes(file.size)} ·{' '}
                            {file.modifiedTime
                              ? new Date(file.modifiedTime).toLocaleDateString()
                              : 'Drive'}
                          </p>
                          {isAlreadyLinked && (
                            <Badge variant="approved" size="sm" className="mt-1.5">
                              Saved in BAUST Vault
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-1.5 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-[#0F2A4A] hover:bg-slate-100 transition-colors"
                              title="Open in Google Drive"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          {!isFolder && (
                            <button
                              type="button"
                              onClick={() => handleDownload(file)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-[#0F2A4A] hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setRenamingFile(file);
                              setRenameValue(file.name);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0F2A4A] hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Rename File"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingFile(file)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete from Google Drive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {!isFolder && (
                          <Button
                            type="button"
                            size="sm"
                            variant={isAlreadyLinked ? 'outline' : 'secondary'}
                            onClick={() => {
                              setLinkingFile(file);
                              setLinkCategory('cv');
                              setLinkNotes('');
                            }}
                            leftIcon={
                              isAlreadyLinked ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <BookmarkPlus className="w-3.5 h-3.5" />
                              )
                            }
                          >
                            {isAlreadyLinked ? 'Linked' : 'Save to Vault'}
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )
      )}

      {/* Tab 2: Linked BAUST Vault Documents */}
      {activeTab === 'linked' && (
        <div className="space-y-4">
          {!firebaseUser ? (
            <Card className="p-10 text-center space-y-4 border-slate-200">
              <ShieldCheck className="w-8 h-8 text-[#0F2A4A] mx-auto" />
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-[#0F2A4A]">
                  Sign In to View Saved Vault Documents
                </h3>
                <p className="text-xs text-slate-500">
                  Your saved CVs, transcripts, and certificates linked from Google Drive are synced securely to your BAUST account.
                </p>
              </div>
              <div className="flex justify-center">
                <GoogleSignInButton
                  onClick={handleConnectGoogle}
                  disabled={isConnecting}
                  label={isConnecting ? 'Signing in...' : 'Sign in with Google'}
                />
              </div>
            </Card>
          ) : isLoadingLinked ? (
            <Card className="p-10 text-center text-xs text-slate-500">
              Loading your saved BAUST Vault documents...
            </Card>
          ) : linkedDocs.length === 0 ? (
            <Card className="p-10 text-center space-y-2 border-dashed border-slate-300">
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No documents saved in your BAUST Vault yet</p>
              <p className="text-xs text-slate-500">
                Browse your Google Drive files and click &quot;Save to Vault&quot; to pin important academic files here.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {linkedDocs.map((docItem) => (
                <Card key={docItem.id} className="p-5 border-slate-200 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#2E5E3E]/10 text-[#2E5E3E] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{docItem.fileName}</h4>
                        <Badge variant="navy" size="sm" className="uppercase">
                          {docItem.category}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {formatBytes(docItem.fileSize)} · Linked on{' '}
                        {new Date(docItem.createdAt).toLocaleDateString()}
                      </p>
                      {docItem.notes && (
                        <p className="text-xs text-slate-600 bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-100">
                          {docItem.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {docItem.webViewLink && (
                      <a
                        href={docItem.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-[#0F2A4A] hover:bg-slate-50"
                        title="View in Google Drive"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setUnlinkingDoc(docItem)}
                      className="p-2 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Remove from BAUST Vault"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Folder Modal */}
      <Modal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        title="Create Google Drive Folder"
        description="Organize your BAUST Career Bridge resumes and certificates in a dedicated Drive folder."
        maxWidth="md"
      >
        <form onSubmit={handleCreateFolder} className="space-y-4">
          <Input
            label="Folder Name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsFolderModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isCreatingFolder}>
              Create Folder
            </Button>
          </div>
        </form>
      </Modal>

      {/* Save/Link File to BAUST Vault Modal */}
      <Modal
        isOpen={Boolean(linkingFile)}
        onClose={() => setLinkingFile(null)}
        title="Save Document to BAUST Vault"
        description={linkingFile ? `Tag "${linkingFile.name}" for quick access across mentorship and admin services.` : ''}
        maxWidth="md"
      >
        <form onSubmit={handleConfirmLink} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Document Category</label>
            <select
              value={linkCategory}
              onChange={(e) => setLinkCategory(e.target.value as CategoryType)}
              className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F2A4A]/20"
            >
              <option value="cv">Curriculum Vitae (CV / Resume)</option>
              <option value="transcript">Official Academic Transcript</option>
              <option value="certificate">Degree / Provisional Certificate</option>
              <option value="verification">University ID / Verification Document</option>
              <option value="other">Other Career Document</option>
            </select>
          </div>
          <Input
            label="Optional Notes"
            placeholder="e.g. Updated Software Engineering CV for Fall 2026"
            value={linkNotes}
            onChange={(e) => setLinkNotes(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setLinkingFile(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" isLoading={isSavingLink}>
              Save to Vault
            </Button>
          </div>
        </form>
      </Modal>

      {/* Rename Confirmation Modal (Explicit user confirmation before modifying Drive file) */}
      <Modal
        isOpen={Boolean(renamingFile)}
        onClose={() => setRenamingFile(null)}
        title="Confirm File Rename in Google Drive"
        description="This will update the file name directly in your Google Drive."
        maxWidth="md"
      >
        <form onSubmit={handleConfirmRename} className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              You are about to rename <strong>{renamingFile?.name}</strong> inside your Google Drive account.
            </span>
          </div>
          <Input
            label="New File Name"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setRenamingFile(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isRenaming}>
              Confirm Rename
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal (Explicit user confirmation before deleting Drive file) */}
      <Modal
        isOpen={Boolean(deletingFile)}
        onClose={() => setDeletingFile(null)}
        title="Delete File from Google Drive?"
        description="Please confirm before deleting this file from your Google Drive."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Permanent Google Drive Action</p>
              <p>
                Are you sure you want to permanently delete <strong>{deletingFile?.name}</strong> from your Google Drive? This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setDeletingFile(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={isDeleting}
              onClick={handleConfirmDelete}
            >
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>

      {/* Unlink from Vault Confirmation Modal */}
      <Modal
        isOpen={Boolean(unlinkingDoc)}
        onClose={() => setUnlinkingDoc(null)}
        title="Remove Document from BAUST Vault?"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Remove <strong>{unlinkingDoc?.fileName}</strong> from your BAUST Career Bridge saved list? The original file in your Google Drive will remain untouched.
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setUnlinkingDoc(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={isUnlinking}
              onClick={handleConfirmUnlink}
            >
              Remove from Vault
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
