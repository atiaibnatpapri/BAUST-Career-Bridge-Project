/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Input, Textarea } from '../../components/ui/Input';
import { StudentProfile } from '../../types';
import {
  UploadCloud,
  FileCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Trash2,
  Save,
  HardDrive,
} from 'lucide-react';
import { DrivePickerModal } from '../../components/drive/DrivePickerModal';
import { DriveFileItem, linkDriveDocumentToVault } from '../../services/googleDrive';
import { generateStudentCvPdf } from '../../utils/cvPdf';
import { deriveAcademicStanding } from '../../constants/baustDataModel';

export const StudentProfilePage: React.FC = () => {
  const { currentUser, updateStudentProfile, addToast, language } = useApp();
  const { userProfile, updateUserProfile } = useAuth();

  const student = currentUser?.role === 'student' ? (currentUser as StudentProfile) : null;

  const academicStanding = deriveAcademicStanding(
    student?.batch || userProfile?.batch,
    student?.passingYear || userProfile?.passingYear
  );

  const [name, setName] = useState(student?.name ?? userProfile?.name ?? '');
  const [email, setEmail] = useState(student?.email ?? userProfile?.email ?? '');
  const [phone, setPhone] = useState(student?.phone ?? userProfile?.phone ?? '');
  const [cgpa, setCgpa] = useState(String(student?.cgpa ?? userProfile?.cgpa ?? 3.5));
  const [careerGoal, setCareerGoal] = useState(student?.careerGoal ?? userProfile?.careerGoal ?? '');
  const [bio, setBio] = useState(student?.bio ?? userProfile?.bio ?? '');
  const [skills, setSkills] = useState<string[]>(
    student?.interests ?? userProfile?.interests ?? ['Full-Stack Web', 'Distributed Systems', 'Cloud Computing']
  );
  const [newSkill, setNewSkill] = useState('');

  // CV Upload & PDF Download State
  const [cvFileName, setCvFileName] = useState(
    student?.cvFileName ?? userProfile?.cvFileName ?? 'BAUST_Student_Resume.pdf'
  );
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);
  const [isGeneratingCv, setIsGeneratingCv] = useState(false);

  // Privacy Settings synced to Firestore (#46, FR-07)
  const [hideEmail, setHideEmail] = useState<boolean>(Boolean(userProfile?.hideEmail));
  const [hidePhone, setHidePhone] = useState<boolean>(Boolean(userProfile?.hidePhone));
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private'>(
    userProfile?.profileVisibility === 'private' ? 'private' : 'public'
  );
  const [allowAlumniMessages, setAllowAlumniMessages] = useState<boolean>(
    userProfile?.allowAlumniMessages !== false
  );
  const [showCgpaPublicly, setShowCgpaPublicly] = useState<boolean>(
    userProfile?.privacy?.cgpa !== 'hidden'
  );
  const [notifyOnMentorship, setNotifyOnMentorship] = useState<boolean>(
    userProfile?.notifyOnMentorship !== false
  );

  // Sync form inputs when Firestore profile loads/updates via onSnapshot
  useEffect(() => {
    if (student || userProfile) {
      setName(userProfile?.name ?? student?.name ?? '');
      setEmail(userProfile?.email ?? student?.email ?? '');
      setPhone(userProfile?.phone ?? student?.phone ?? '');
      setCgpa(
        userProfile?.cgpa !== undefined
          ? String(userProfile.cgpa)
          : student?.cgpa !== undefined
          ? String(student.cgpa)
          : '3.50'
      );
      setCareerGoal(userProfile?.careerGoal ?? student?.careerGoal ?? '');
      setBio(userProfile?.bio ?? student?.bio ?? '');
      if (Array.isArray(userProfile?.interests)) {
        setSkills(userProfile.interests);
      } else if (Array.isArray(student?.interests)) {
        setSkills(student.interests);
      }
      if (userProfile?.cvFileName !== undefined || student?.cvFileName !== undefined) {
        setCvFileName(userProfile?.cvFileName || student?.cvFileName || '');
      }
      setHideEmail(Boolean(userProfile?.hideEmail));
      setHidePhone(Boolean(userProfile?.hidePhone));
      setProfileVisibility(userProfile?.profileVisibility === 'private' ? 'private' : 'public');
      setAllowAlumniMessages(userProfile?.allowAlumniMessages !== false);
      setShowCgpaPublicly(userProfile?.privacy?.cgpa !== 'hidden');
      setNotifyOnMentorship(userProfile?.notifyOnMentorship !== false);
    }
  }, [
    student?.id,
    userProfile?.name,
    userProfile?.email,
    userProfile?.phone,
    userProfile?.cgpa,
    userProfile?.careerGoal,
    userProfile?.bio,
    userProfile?.cvFileName,
    userProfile?.hideEmail,
    userProfile?.hidePhone,
    userProfile?.profileVisibility,
    userProfile?.allowAlumniMessages,
    userProfile?.privacy?.cgpa,
    userProfile?.notifyOnMentorship,
  ]);

  const verificationStatus =
    userProfile?.verificationStatus ||
    userProfile?.accountStatus ||
    (student?.isVerified ? 'approved' : 'pending');

  const handleDownloadCvPdf = () => {
    setIsGeneratingCv(true);
    try {
      const downloadedName = generateStudentCvPdf({
        name,
        email,
        phone,
        department: student?.department || userProfile?.department || 'CSE',
        batch: student?.batch || userProfile?.batch || 'BAUST Batch',
        studentId: student?.studentId || userProfile?.baustId || 'Pending ID',
        currentSemester: academicStanding.levelTerm,
        cgpa,
        bio,
        careerGoal,
        skills,
        cvFileName,
        verificationStatus,
      });
      addToast('success', 'CV PDF Downloaded', `Saved ${downloadedName} to your device.`);
    } catch (err: any) {
      console.error('CV PDF generation failed:', err);
      addToast('error', 'CV Download Failed', err?.message || 'Unable to generate PDF CV.');
    } finally {
      setIsGeneratingCv(false);
    }
  };

  const handleSelectDriveCV = async (file: DriveFileItem) => {
    setCvFileName(file.name);
    updateStudentProfile({
      cvFileName: file.name,
    });
    try {
      await linkDriveDocumentToVault({
        driveFileId: file.id,
        fileName: file.name,
        mimeType: file.mimeType,
        webViewLink: file.webViewLink,
        fileSize: file.size,
        category: 'cv',
        notes: 'Active Student CV',
        userName: name,
        userRole: 'student',
      });
    } catch {
      // Optional vault sync
    }
    addToast('success', 'CV Attached from Google Drive', `${file.name} is now your active CV.`);
  };

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault();
      if (!skills.includes(newSkill.trim())) {
        setSkills([...skills, newSkill.trim()]);
      }
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericCgpa = Math.min(4.0, Math.max(0, parseFloat(cgpa) || 0));
    updateStudentProfile({
      phone,
      currentSemester: academicStanding.levelTerm,
      cgpa: numericCgpa,
      careerGoal,
      bio,
      interests: skills,
      cvFileName,
    });
    await updateUserProfile({
      phone,
      currentSemester: academicStanding.levelTerm,
      cgpa: numericCgpa,
      careerGoal,
      bio,
      interests: skills,
      cvFileName,
      hideEmail,
      hidePhone,
      profileVisibility,
      allowAlumniMessages,
      notifyOnMentorship,
      privacy: {
        cgpa: showCgpaPublicly ? 'public' : 'hidden',
        email: hideEmail ? 'hidden' : 'public',
        phone: hidePhone ? 'hidden' : 'public',
        location: 'public',
      },
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight">
            {language === 'bn' ? 'আমার শিক্ষার্থী প্রোফাইল ও সেটিংস' : 'My Student Profile & Settings'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'bn'
              ? 'আপনার সিভি, ক্যারিয়ার লক্ষ্য এবং গোপনীয়তা সেটিংস পরিচালনা করুন'
              : 'Manage your public resume, career aspirations, and privacy controls'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            onClick={handleDownloadCvPdf}
            isLoading={isGeneratingCv}
            leftIcon={<Download className="w-4 h-4" />}
          >
            {language === 'bn' ? 'সিভি ডাউনলোড (PDF)' : 'Download CV (PDF)'}
          </Button>
          <Button variant="primary" onClick={handleSave} leftIcon={<Save className="w-4 h-4" />}>
            {language === 'bn' ? 'সব পরিবর্তন সংরক্ষণ' : 'Save All Changes'}
          </Button>
        </div>
      </div>

      {/* Live Verification Status Banner (Synced via Firestore onSnapshot) */}
      {verificationStatus === 'pending' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 shadow-xs">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-sm">Verification Status: Pending Admin Review</h4>
            <p className="text-amber-800 leading-relaxed">
              Your registration is queued for verification by the BAUST Registrar Office. This badge updates automatically in real time as soon as an admin approves your account.
            </p>
          </div>
        </div>
      )}

      {verificationStatus === 'rejected' && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start gap-3 shadow-xs">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-sm">Verification Status: Rejected</h4>
            <p className="text-rose-800 leading-relaxed">
              {userProfile?.rejectionReason
                ? `Reason: ${userProfile.rejectionReason}`
                : 'Your registration details could not be verified by the BAUST Registrar Office.'}
            </p>
          </div>
        </div>
      )}

      {verificationStatus === 'approved' && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Verified Student Account</span> — Approved by the BAUST Registrar Office. All career mentorship and document services are unlocked.
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <Card className="p-6 border-slate-200 space-y-6">
          <div className="flex items-center gap-4">
            <Avatar
              src={currentUser?.avatar}
              name={name || 'Student'}
              size="xl"
              isVerified={verificationStatus === 'approved'}
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-slate-900">{name || 'BAUST Student'}</h3>
                {verificationStatus === 'approved' ? (
                  <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                    Verified Student
                  </span>
                ) : verificationStatus === 'rejected' ? (
                  <span className="text-xs font-semibold bg-rose-50 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200">
                    Verification Rejected
                  </span>
                ) : (
                  <span className="text-xs font-semibold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                    Pending Approval
                  </span>
                )}
                {academicStanding.alumniEligible && (
                  <span className="text-xs font-semibold bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                    Alumni-Eligible Standing
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Department of {student?.department || userProfile?.department || 'CSE'} ·{' '}
                {student?.batch || userProfile?.batch || 'BAUST Batch'} · ID:{' '}
                {student?.studentId || userProfile?.baustId || 'Pending'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div>
              <Input
                label="Full Name (Official Registrar Record)"
                value={name}
                disabled
                readOnly
                className="bg-slate-100 text-slate-600 cursor-not-allowed"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Verified identity fields are locked after approval. Contact Super Admin for legal name corrections.
              </p>
            </div>
            <div>
              <Input
                label="Email Address (Verified Account)"
                value={email}
                disabled
                readOnly
                className="bg-slate-100 text-slate-600 cursor-not-allowed font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                BAUST ID: {student?.studentId || userProfile?.baustId || 'Pending'} (Immutable)
              </p>
            </div>
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  label="Current Standing (Auto)"
                  value={academicStanding.levelTerm}
                  disabled
                  readOnly
                  className="bg-slate-100 text-slate-700 cursor-not-allowed font-semibold"
                />
                <p className="text-[10px] text-slate-400 mt-1">Computed from batch</p>
              </div>
              <Input
                label="Current CGPA"
                type="number"
                step="0.01"
                min="0"
                max="4.00"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
              />
            </div>
          </div>

          <Textarea
            label="Professional Bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Introduce your key academic achievements, programming club roles, or projects..."
          />

          <Textarea
            label="Primary Career Goal"
            rows={2}
            value={careerGoal}
            onChange={(e) => setCareerGoal(e.target.value)}
            placeholder="e.g. Aspiring full-stack software engineer targeting fintech firms..."
          />
        </Card>

        {/* Skills & Interest Tags */}
        <Card className="p-6 border-slate-200 space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#0F2A4A]">Interests & Skills</h3>
            <p className="text-xs text-slate-500">
              Add technical skills, tools, or research interests to get matched with the best mentors.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(skills || []).map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-slate-400 hover:text-rose-600 cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="max-w-xs">
            <Input
              placeholder="Type skill & press Enter..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={handleAddSkill}
            />
          </div>
        </Card>

        {/* CV / Resume Upload & Real PDF Export */}
        <Card className="p-6 border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0F2A4A]">Curriculum Vitae (CV) & PDF Export</h3>
              <p className="text-xs text-slate-500">
                Download your formatted PDF CV directly or link a resume from Google Drive
              </p>
            </div>
            {cvFileName && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Active Resume
              </span>
            )}
          </div>

          {cvFileName ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{cvFileName}</p>
                  <p className="text-[11px] text-slate-400">PDF Document · Ready for download</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDrivePickerOpen(true)}
                  leftIcon={<HardDrive className="w-3.5 h-3.5" />}
                >
                  Change via Google Drive
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  isLoading={isGeneratingCv}
                  onClick={handleDownloadCvPdf}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Download PDF
                </Button>
                <button
                  type="button"
                  onClick={() => setCvFileName('')}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove CV"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center space-y-3">
              <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No active CV uploaded</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  isLoading={isGeneratingCv}
                  onClick={handleDownloadCvPdf}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Generate & Download PDF CV
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDrivePickerOpen(true)}
                  leftIcon={<HardDrive className="w-3.5 h-3.5" />}
                >
                  Select from Google Drive
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Privacy & Notification Settings */}
        <Card className="p-6 border-slate-200 space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#0F2A4A]">Privacy & Communication Controls</h3>
            <p className="text-xs text-slate-500">
              Configure who can reach you and enforce contact/profile privacy across BAUST Career Bridge
            </p>
          </div>

          <div className="space-y-3 divide-y divide-slate-100 text-xs">
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="font-bold text-slate-900">Hide Email Address from Directory & Peers</p>
                <p className="text-slate-500 text-[11px]">
                  Mask your email on shared directory views (Super Admin still verifies your account)
                </p>
              </div>
              <input
                type="checkbox"
                checked={hideEmail}
                onChange={(e) => setHideEmail(e.target.checked)}
                className="w-4 h-4 rounded text-[#0F2A4A]"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="font-bold text-slate-900">Hide Phone Number</p>
                <p className="text-slate-500 text-[11px]">
                  Keep your mobile number private from non-admin users
                </p>
              </div>
              <input
                type="checkbox"
                checked={hidePhone}
                onChange={(e) => setHidePhone(e.target.checked)}
                className="w-4 h-4 rounded text-[#0F2A4A]"
              />
            </div>

            <div className="flex items-center justify-between pt-3 gap-4">
              <div>
                <p className="font-bold text-slate-900">Profile Visibility</p>
                <p className="text-slate-500 text-[11px]">
                  Private hides bio, CGPA, and contact details from non-staff accounts
                </p>
              </div>
              <select
                value={profileVisibility}
                onChange={(e) => setProfileVisibility(e.target.value === 'private' ? 'private' : 'public')}
                className="text-xs rounded-xl border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-800"
              >
                <option value="public">Public (BAUST Community)</option>
                <option value="private">Private (Academic Summary Only)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="font-bold text-slate-900">Direct Messages from Alumni</p>
                <p className="text-slate-500 text-[11px]">Allow verified alumni to message you directly</p>
              </div>
              <input
                type="checkbox"
                checked={allowAlumniMessages}
                onChange={(e) => setAllowAlumniMessages(e.target.checked)}
                className="w-4 h-4 rounded text-[#0F2A4A]"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="font-bold text-slate-900">Display CGPA on Student Badge</p>
                <p className="text-slate-500 text-[11px]">Show your academic score when profile visibility is Public</p>
              </div>
              <input
                type="checkbox"
                checked={showCgpaPublicly}
                onChange={(e) => setShowCgpaPublicly(e.target.checked)}
                className="w-4 h-4 rounded text-[#0F2A4A]"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="font-bold text-slate-900">In-App Mentorship & Document Notifications</p>
                <p className="text-slate-500 text-[11px]">Receive real-time alerts for mentor replies and document updates</p>
              </div>
              <input
                type="checkbox"
                checked={notifyOnMentorship}
                onChange={(e) => setNotifyOnMentorship(e.target.checked)}
                className="w-4 h-4 rounded text-[#0F2A4A]"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="primary" type="submit" size="lg" leftIcon={<Save className="w-4 h-4" />}>
            Save All Settings
          </Button>
        </div>
      </form>

      <DrivePickerModal
        isOpen={isDrivePickerOpen}
        onClose={() => setIsDrivePickerOpen(false)}
        onSelectFile={handleSelectDriveCV}
        title="Attach CV from Google Drive"
        description="Choose an existing PDF or Doc resume from your Google Drive, or upload a new CV directly."
        defaultFilter="PDF"
      />
    </div>
  );
};
