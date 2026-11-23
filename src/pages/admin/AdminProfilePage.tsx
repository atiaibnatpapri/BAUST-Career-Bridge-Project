/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { ProfilePhotoEditor } from '../../components/profile/ProfilePhotoEditor';
import { CheckCircle2, Save, ShieldCheck } from 'lucide-react';

export const AdminProfilePage: React.FC = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const { addToast, language } = useApp();

  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [office, setOffice] = useState(userProfile?.office || '');
  const [designation, setDesignation] = useState(userProfile?.designation || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setPhone(userProfile.phone || '');
      setOffice(userProfile.office || '');
      setDesignation(userProfile.designation || '');
      setBio(userProfile.bio || '');
    }
  }, [userProfile?.phone, userProfile?.office, userProfile?.designation, userProfile?.bio]);

  const isSuperAdmin = userProfile?.role === 'superAdmin';
  const uid = userProfile?.uid || userProfile?.id || '';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateUserProfile({
        phone: phone.trim(),
        office: office.trim(),
        designation: designation.trim(),
        bio: bio.trim(),
      });
      if (res.success) {
        addToast('success', 'Profile Updated', 'Your administrative profile has been saved.');
      } else {
        addToast('error', 'Update Failed', res.error || 'Could not update profile.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight">
            {language === 'bn'
              ? isSuperAdmin
                ? 'সুপার অ্যাডমিন প্রোফাইল'
                : 'অ্যাডমিন প্রোফাইল ও সেটিংস'
              : isSuperAdmin
              ? 'Super Admin Profile & Settings'
              : 'University Admin Profile & Settings'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'bn'
              ? 'আপনার ছবি, অফিসের তথ্য এবং যোগাযোগের বিবরণ হালনাগাদ করুন'
              : 'Update your profile photo, office desk, and administrative contact information'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 border-slate-200 space-y-6">
          <div className="flex items-center gap-4">
            <ProfilePhotoEditor
              src={userProfile?.photoURL || userProfile?.avatar}
              name={userProfile?.name || (isSuperAdmin ? 'Super Admin' : 'BAUST Admin')}
              uid={uid}
              size="xl"
              isVerified={Boolean(userProfile?.isVerified || userProfile?.verificationStatus === 'approved')}
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900">
                  {userProfile?.name || (isSuperAdmin ? 'Super Admin' : 'University Admin')}
                </h2>
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isSuperAdmin ? 'Super Admin' : 'University Admin'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {userProfile?.designation || 'Administrative Officer'} ·{' '}
                {userProfile?.office || 'BAUST Administration'}
              </p>
              <p className="text-[11px] text-slate-400">
                Click the camera badge on your photo to upload a new headshot (JPG/PNG/WEBP).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <Input
              label="Full Name (Verified Identity)"
              value={userProfile?.name || ''}
              disabled
              readOnly
              className="bg-slate-100 text-slate-600 cursor-not-allowed"
            />
            <Input
              label="Email Address"
              value={userProfile?.email || ''}
              disabled
              readOnly
              className="bg-slate-100 text-slate-600 cursor-not-allowed font-mono"
            />
            <Input
              label="Staff / BAUST ID"
              value={userProfile?.employeeId || userProfile?.baustId || 'Staff Verified'}
              disabled
              readOnly
              className="bg-slate-100 text-slate-600 cursor-not-allowed font-mono"
            />
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+880 17XX-XXXXXX"
            />
            <Input
              label="Office / Department"
              value={office}
              onChange={(e) => setOffice(e.target.value)}
              placeholder="e.g. Registrar Office / Placement Cell"
            />
            <Input
              label="Official Designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Assistant Registrar"
            />
          </div>

          <Textarea
            label="Administrative Bio / Responsibilities"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Describe your administrative desk responsibilities and student support hours..."
          />

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Changes save directly to Cloud Firestore
            </span>
            <Button
              type="submit"
              variant="primary"
              isLoading={saving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Profile
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};
