/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui/Avatar';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FileUploader } from '../ui/FileUploader';
import { Camera } from 'lucide-react';

interface ProfilePhotoEditorProps {
  src?: string;
  name: string;
  uid: string;
  size?: 'lg' | 'xl';
  isVerified?: boolean;
  onSaved?: (newUrl: string) => void;
}

export const ProfilePhotoEditor: React.FC<ProfilePhotoEditorProps> = ({
  src,
  name,
  uid,
  size = 'xl',
  isVerified = false,
  onSaved,
}) => {
  const { updateUserProfile } = useAuth();
  const { addToast } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string>('');
  const [pendingName, setPendingName] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const openModal = () => {
    setPendingUrl(src || '');
    setPendingName('');
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!pendingUrl) {
      setIsOpen(false);
      return;
    }
    setSaving(true);
    try {
      const res = await updateUserProfile({
        photoURL: pendingUrl,
        avatar: pendingUrl,
      });
      if (!res.success) {
        addToast('error', 'Update Failed', res.error || 'Could not save profile photo.');
        return;
      }

      if (auth.currentUser && pendingUrl.startsWith('https://')) {
        void updateProfile(auth.currentUser, { photoURL: pendingUrl }).catch(() => {});
      }

      onSaved?.(pendingUrl);
      addToast('success', 'Profile Photo Updated', 'Your new photo is live across BAUST Career Bridge.');
      setIsOpen(false);
    } catch (err: any) {
      addToast('error', 'Save Failed', err?.message || 'Unable to update profile photo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="relative group rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0F2A4A] focus:ring-offset-2 shrink-0"
        title="Change profile photo"
        aria-label="Change profile photo"
      >
        <Avatar src={src} name={name} size={size} isVerified={isVerified} />
        <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0F2A4A] text-white border-2 border-white shadow-sm flex items-center justify-center group-hover:bg-[#1D4ED8] transition-colors">
          <Camera className="w-3.5 h-3.5" />
        </span>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Update Profile Photo"
        description="Upload a clear square headshot (JPG, PNG, or WEBP up to 5 MB)"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <Avatar src={pendingUrl || src} name={name} size="xl" isVerified={isVerified} />
            <div className="text-xs text-slate-600">
              <p className="font-bold text-slate-900">{name}</p>
              <p className="mt-0.5">Preview of how your photo will appear in the navbar, directory, and chat.</p>
            </div>
          </div>

          <FileUploader
            kind="photo"
            uid={uid}
            currentUrl={pendingUrl}
            currentFileName={pendingName}
            onUploaded={(result) => {
              setPendingUrl(result.url);
              setPendingName(result.fileName);
            }}
            onRemove={() => {
              setPendingUrl('');
              setPendingName('');
            }}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={saving}
              disabled={!pendingUrl}
              onClick={() => void handleSave()}
            >
              Save Photo
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
