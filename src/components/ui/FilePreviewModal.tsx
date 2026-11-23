/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Loader } from './Loader';
import { resolveFilePreviewUrl } from '../../services/fileUploadService';
import { Download, AlertCircle, FileText } from 'lucide-react';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  fileName?: string;
  url?: string;
  fileDocId?: string;
  kind?: 'pdf' | 'image';
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  title = 'Document Preview',
  fileName = 'CV.pdf',
  url,
  fileDocId,
  kind = 'pdf',
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolved, setResolved] = useState<{
    previewUrl: string;
    downloadUrl: string;
    fileName: string;
    revokeAfterUse: boolean;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (!url && !fileDocId) {
      setError('No uploaded file URL or document reference found.');
      return;
    }

    let active = true;
    let objectUrlToRevoke: string | null = null;
    setLoading(true);
    setError(null);

    void resolveFilePreviewUrl({ url, fileDocId, fileName })
      .then((res) => {
        if (!active) {
          if (res.revokeAfterUse) URL.revokeObjectURL(res.previewUrl);
          return;
        }
        if (res.revokeAfterUse) objectUrlToRevoke = res.previewUrl;
        setResolved(res);
      })
      .catch((err: any) => {
        if (active) {
          setError(err?.message || 'Unable to load preview for this file.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
      setResolved(null);
    };
  }, [isOpen, url, fileDocId, fileName]);

  const handleDownload = () => {
    if (!resolved?.downloadUrl) return;
    const anchor = document.createElement('a');
    anchor.href = resolved.downloadUrl;
    anchor.download = resolved.fileName || fileName || 'document.pdf';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={resolved?.fileName || fileName}
      maxWidth="xl"
    >
      <div className="space-y-4">
        {loading ? (
          <div className="py-12">
            <Loader label="Loading document preview..." />
          </div>
        ) : error ? (
          <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Preview Unavailable</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        ) : resolved?.previewUrl ? (
          kind === 'image' ? (
            <div className="flex justify-center bg-slate-50 rounded-xl p-4 border border-slate-200">
              <img
                src={resolved.previewUrl}
                alt={resolved.fileName}
                className="max-h-[65vh] rounded-lg object-contain"
              />
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-[65vh]">
              <iframe
                src={resolved.previewUrl}
                title={resolved.fileName}
                className="w-full h-full border-0"
              />
            </div>
          )
        ) : (
          <div className="py-10 text-center text-xs text-slate-500">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No previewable content.
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          {resolved?.downloadUrl && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleDownload}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Download PDF
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
