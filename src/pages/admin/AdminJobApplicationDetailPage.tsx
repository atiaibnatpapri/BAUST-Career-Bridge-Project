/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { formatTsLabel, updateApplicationStatusFirestore } from '../../services/firestorePortal';
import { notify } from '../../services/careerBridgeService';
import { JobApplication, UserRole } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, BadgeVariant } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Loader } from '../../components/ui/Loader';
import { FilePreviewModal } from '../../components/ui/FilePreviewModal';
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  FileText,
  Mail,
  Briefcase,
  AlertCircle,
} from 'lucide-react';

function getAppBadgeVariant(status: JobApplication['status']): BadgeVariant {
  switch (status) {
    case 'Accepted':
    case 'Offered':
      return 'approved';
    case 'Rejected':
    case 'Job Removed':
      return 'rejected';
    case 'Shortlisted':
    case 'Call for Interview':
    case 'Interview':
    case 'Under Review':
      return 'in-progress';
    case 'On Hold':
      return 'gold';
    case 'Withdrawn':
      return 'neutral';
    default:
      return 'pending';
  }
}

export const AdminJobApplicationDetailPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { firebaseUser, userProfile } = useAuth();
  const { addToast } = useApp();

  const [app, setApp] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cvPreviewOpen, setCvPreviewOpen] = useState(false);

  const [nextStatus, setNextStatus] = useState<JobApplication['status']>('Under Review');
  const [note, setNote] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('10:30');
  const [interviewMode, setInterviewMode] = useState('Online');
  const [interviewLink, setInterviewLink] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!applicationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    return onSnapshot(
      doc(db, 'jobApplications', applicationId),
      (snap) => {
        if (!snap.exists()) {
          setApp(null);
          setLoading(false);
          return;
        }
        const data = snap.data() as Record<string, any>;
        const mapped: JobApplication = {
          id: snap.id,
          jobId: data.jobId ?? '',
          jobTitle: data.jobTitle ?? 'Position',
          company: data.company ?? 'Organization',
          postedBy: data.postedBy ?? data.postedById ?? '',
          postedById: data.postedById ?? data.postedBy ?? '',
          postedByName: data.postedByName ?? '',
          postedByRole: (data.postedByRole as UserRole) ?? undefined,
          studentId: data.studentId ?? '',
          studentName: data.studentName ?? 'Applicant',
          studentEmail: data.studentEmail ?? '',
          applicantRole: (data.applicantRole as UserRole) ?? 'student',
          applicantPhotoURL: data.applicantPhotoURL ?? '',
          department: data.department ?? 'CSE',
          batch: data.batch ?? '',
          cgpa: String(data.cgpa ?? ''),
          cvFileName: data.cvFileName ?? data.cvName ?? '',
          cvName: data.cvName ?? data.cvFileName ?? '',
          cvUrl: data.cvUrl ?? '',
          cvFileDocId: data.cvFileDocId ?? '',
          coverNote: data.coverNote ?? '',
          interviewDate: data.interviewDate ?? '',
          interviewTime: data.interviewTime ?? '',
          interviewMode: data.interviewMode ?? '',
          interviewLink: data.interviewLink ?? '',
          status: data.status ?? 'Applied',
          statusHistory: Array.isArray(data.statusHistory) ? data.statusHistory : [],
          isDemo: Boolean(data.isDemo),
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          createdAtLabel: formatTsLabel(data.createdAt),
        };
        setApp(mapped);
        setNextStatus(mapped.status);
        setInterviewDate(mapped.interviewDate || '');
        setInterviewTime(mapped.interviewTime || '10:30');
        setInterviewMode(mapped.interviewMode || 'Online');
        setInterviewLink(mapped.interviewLink || '');
        setLoading(false);
      },
      (err) => {
        setErrorMsg(err.message);
        setLoading(false);
      }
    );
  }, [applicationId]);

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app) return;
    setSaving(true);
    try {
      const actorName = userProfile?.name || 'Admin Office';
      const isInterview = nextStatus === 'Call for Interview' || nextStatus === 'Interview';
      const noteText =
        note.trim() ||
        (isInterview && interviewDate
          ? `${nextStatus}: ${interviewDate} at ${interviewTime} (${interviewMode})`
          : `Status updated to ${nextStatus}`);

      await updateApplicationStatusFirestore(
        app.id,
        nextStatus,
        actorName,
        noteText,
        isInterview
          ? {
              interviewDate,
              interviewTime,
              interviewMode,
              interviewLink: interviewLink.trim(),
            }
          : undefined
      );

      if (app.studentId && app.studentId !== firebaseUser?.uid) {
        const destLink =
          app.applicantRole === 'alumni' ? `/alumni/jobs?app=${app.id}` : `/student/applications?app=${app.id}`;
        void notify(
          app.studentId,
          'job',
          `Application Update: ${nextStatus}`,
          `${actorName} updated your application for ${app.jobTitle} to "${nextStatus}".`,
          destLink,
          app.id
        );
      }

      setNote('');
      addToast('success', 'Application Updated', `${app.studentName} is now marked "${nextStatus}".`);
    } catch (err: any) {
      addToast('error', 'Update Failed', err?.message || 'Permission denied.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader label="Loading job application details..." />;
  }

  if (!app) {
    return (
      <Card className="p-10 text-center space-y-4 max-w-xl mx-auto">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <div>
          <h2 className="text-lg font-bold text-slate-900">Application Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">
            {errorMsg || 'This job application may have been removed or does not exist.'}
          </p>
        </div>
        <Link to="/admin/jobs">
          <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Job Posts & Applications
          </Button>
        </Link>
      </Card>
    );
  }

  const isLocked = app.status === 'Withdrawn' || app.status === 'Job Removed';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/admin/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F2A4A] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Job Posts & Applications
        </Link>
        <Badge variant={getAppBadgeVariant(app.status)}>{app.status}</Badge>
      </div>

      {/* Applicant Overview */}
      <Card className="p-6 border-slate-200 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar src={app.applicantPhotoURL} name={app.studentName} size="lg" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-[#0F2A4A]">{app.studentName}</h1>
                <Badge variant={app.applicantRole === 'alumni' ? 'navy' : 'neutral'} size="sm">
                  {app.applicantRole === 'alumni' ? 'Alumni' : 'Student'}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {app.department} · {app.batch}
                {app.cgpa ? ` · CGPA ${app.cgpa}` : ''}
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Mail className="w-3.5 h-3.5" /> {app.studentEmail}
              </p>
            </div>
          </div>

          {(app.cvUrl || app.cvFileDocId) && (
            <Button
              type="button"
              variant="primary"
              onClick={() => setCvPreviewOpen(true)}
              leftIcon={<FileText className="w-4 h-4" />}
            >
              View / Download PDF CV
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Position Applied</p>
            <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-orange-600" />
              {app.jobTitle}
            </p>
            <p className="text-slate-600">{app.company} · Submitted {app.createdAtLabel || 'Recently'}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Attached CV</p>
            <p className="font-mono font-bold text-slate-900 truncate">{app.cvName || app.cvFileName}</p>
            <p className="text-slate-500">
              {app.cvUrl || app.cvFileDocId
                ? 'Stored PDF available for preview & download'
                : 'Filename reference submitted'}
            </p>
          </div>
        </div>

        {app.coverNote && (
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cover Note</p>
            <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 italic leading-relaxed">
              "{app.coverNote}"
            </p>
          </div>
        )}

        {app.interviewDate && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <CalendarClock className="w-4 h-4 text-blue-700" />
              Scheduled Interview
            </p>
            <p>
              {app.interviewDate} at {app.interviewTime || 'TBD'} · Mode: {app.interviewMode || 'Online'}
            </p>
            {app.interviewLink && <p className="font-mono break-all">Venue / Link: {app.interviewLink}</p>}
          </div>
        )}
      </Card>

      {/* Admin Action & Interview Schedule Panel */}
      {!isLocked && (
        <Card className="p-6 border-slate-200">
          <h2 className="text-base font-bold text-[#0F2A4A] mb-4">Update Status & Interview Schedule</h2>
          <form onSubmit={handleSaveUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Application Status"
                value={nextStatus}
                onChange={(e) => setNextStatus(e.target.value as JobApplication['status'])}
                options={[
                  { value: 'Applied', label: 'Applied' },
                  { value: 'Under Review', label: 'Under Review' },
                  { value: 'Shortlisted', label: 'Shortlisted' },
                  { value: 'Call for Interview', label: 'Call for Interview' },
                  { value: 'Interview', label: 'Interview' },
                  { value: 'Offered', label: 'Offered' },
                  { value: 'On Hold', label: 'On Hold' },
                  { value: 'Accepted', label: 'Accepted' },
                  { value: 'Rejected', label: 'Rejected' },
                ]}
              />
              <Input
                label="Reviewer Note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Reason, shortlist remark, or offer instructions..."
              />
            </div>

            {(nextStatus === 'Call for Interview' || nextStatus === 'Interview') && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Interview Date"
                  type="date"
                  required
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                />
                <Input
                  label="Interview Time"
                  type="time"
                  required
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                />
                <Select
                  label="Interview Mode"
                  value={interviewMode}
                  onChange={(e) => setInterviewMode(e.target.value)}
                  options={[
                    { value: 'Online', label: 'Online (Meet / Zoom)' },
                    { value: 'On-Campus', label: 'On-Campus (BAUST)' },
                    { value: 'Office', label: 'Employer Office' },
                  ]}
                />
                <Input
                  label="Meeting Link or Room"
                  value={interviewLink}
                  onChange={(e) => setInterviewLink(e.target.value)}
                  placeholder="https://meet.google.com/... or Room 302"
                />
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                isLoading={saving}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Save Status & Notify Applicant
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Status Timeline */}
      <Card className="p-6 border-slate-200 space-y-3">
        <h2 className="text-base font-bold text-[#0F2A4A]">Application Activity Timeline</h2>
        {Array.isArray(app.statusHistory) && app.statusHistory.length > 0 ? (
          <div className="space-y-3 border-l-2 border-slate-200 pl-4">
            {app.statusHistory.map((h, idx) => (
              <div key={idx} className="text-xs space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900">{h.status}</span>
                  <span className="text-[11px] text-slate-400">
                    {h.at ? new Date(h.at).toLocaleString() : ''}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">Updated by {h.by}</p>
                {h.note && <p className="text-[11px] text-slate-500 italic">{h.note}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">Submitted with status: {app.status}</p>
        )}
      </Card>

      <FilePreviewModal
        isOpen={cvPreviewOpen}
        onClose={() => setCvPreviewOpen(false)}
        title={`Applicant CV — ${app.studentName}`}
        fileName={app.cvName || app.cvFileName || 'CV.pdf'}
        url={app.cvUrl}
        fileDocId={app.cvFileDocId}
      />
    </div>
  );
};
