/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  applyToJob,
  createJobPosting,
  deleteJobPostingWithApplications,
  subscribeJobApplications,
  subscribeJobs,
  updateApplicationStatusFirestore,
  updateJobStatus,
} from '../../services/firestorePortal';
import { notify } from '../../services/careerBridgeService';
import { JobApplication, JobPosting } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, BadgeVariant } from '../../components/ui/Badge';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Loader } from '../../components/ui/Loader';
import { FileUploader } from '../../components/ui/FileUploader';
import { FilePreviewModal } from '../../components/ui/FilePreviewModal';
import { UploadFileResult } from '../../services/fileUploadService';
import {
  Briefcase,
  Plus,
  Trash2,
  Users,
  AlertCircle,
  Send,
  CheckCircle2,
  Building2,
  MapPin,
  Calendar,
  FileText,
  CalendarClock,
  ClipboardList,
} from 'lucide-react';
import { BAUST_DEPARTMENTS } from '../../constants/baustDataModel';

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

export const AlumniJobsPage: React.FC = () => {
  const { firebaseUser, userProfile } = useAuth();
  const { addToast } = useApp();
  const [searchParams] = useSearchParams();
  const highlightedAppId = searchParams.get('app');

  const [activeTab, setActiveTab] = useState<'posted' | 'browse' | 'my-apps'>('posted');
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [postedApplications, setPostedApplications] = useState<JobApplication[]>([]);
  const [myApplications, setMyApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Create job modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<JobPosting | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState(userProfile?.company || '');
  const [location, setLocation] = useState('Dhaka, Bangladesh');
  const [type, setType] = useState<JobPosting['type']>('Referral');
  const [department, setDepartment] = useState<string>(userProfile?.department || 'CSE');
  const [salaryRange, setSalaryRange] = useState('BDT 45,000 - 70,000');
  const [deadline, setDeadline] = useState('2026-12-30');
  const [requirements, setRequirements] = useState('React, TypeScript, Problem Solving');
  const [description, setDescription] = useState('');

  // Alumni applying to open campus/admin jobs
  const [applyModalJob, setApplyModalJob] = useState<JobPosting | null>(null);
  const [coverNote, setCoverNote] = useState('');
  const [uploadedCv, setUploadedCv] = useState<UploadFileResult | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  // Preview CV modal + Call for Interview modal
  const [cvPreviewApp, setCvPreviewApp] = useState<JobApplication | null>(null);
  const [interviewApp, setInterviewApp] = useState<JobApplication | null>(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('10:30');
  const [interviewMode, setInterviewMode] = useState('Online');
  const [interviewLink, setInterviewLink] = useState('');
  const [interviewNote, setInterviewNote] = useState('');
  const [schedulingInterview, setSchedulingInterview] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsubJobs = subscribeJobs(
      (items) => {
        setJobs(items);
        setLoading(false);
      },
      (err) => {
        setErrorMsg(err.message);
        setLoading(false);
      }
    );

    const unsubPostedApps = firebaseUser?.uid
      ? subscribeJobApplications(
          { postedBy: firebaseUser.uid },
          setPostedApplications,
          (err) => setErrorMsg(err.message)
        )
      : () => {};

    const unsubMyApps = firebaseUser?.uid
      ? subscribeJobApplications(
          { studentId: firebaseUser.uid },
          setMyApplications,
          (err) => setErrorMsg(err.message)
        )
      : () => {};

    return () => {
      unsubJobs();
      unsubPostedApps();
      unsubMyApps();
    };
  }, [firebaseUser?.uid]);

  useEffect(() => {
    if (!highlightedAppId) return;
    if (myApplications.some((a) => a.id === highlightedAppId)) {
      setActiveTab('my-apps');
    } else if (postedApplications.some((a) => a.id === highlightedAppId)) {
      setActiveTab('posted');
    }
  }, [highlightedAppId, myApplications, postedApplications]);

  const myJobs = jobs.filter((j) => j.postedById === firebaseUser?.uid);
  const myJobIds = new Set(myJobs.map((j) => j.id));
  const applicantList = postedApplications.filter((a) => myJobIds.has(a.jobId));

  const openCampusJobs = jobs.filter(
    (j) => j.status === 'Open' && j.postedById !== firebaseUser?.uid
  );
  const myActiveAppliedJobIds = new Set(
    myApplications
      .filter((a) => a.status !== 'Withdrawn' && a.status !== 'Job Removed')
      .map((a) => a.jobId)
  );

  const handleStatusChange = async (app: JobApplication, nextStatus: JobApplication['status']) => {
    if (nextStatus === app.status) return;
    if (nextStatus === 'Call for Interview') {
      setInterviewApp(app);
      setInterviewDate(app.interviewDate || new Date().toISOString().split('T')[0]);
      setInterviewTime(app.interviewTime || '10:30');
      setInterviewMode(app.interviewMode || 'Online');
      setInterviewLink(app.interviewLink || '');
      setInterviewNote('');
      return;
    }
    try {
      const actorName = userProfile?.name || 'Alumni';
      await updateApplicationStatusFirestore(app.id, nextStatus, actorName);
      if (app.studentId && app.studentId !== firebaseUser?.uid) {
        const destLink =
          app.applicantRole === 'alumni' ? `/alumni/jobs?app=${app.id}` : `/student/applications?app=${app.id}`;
        void notify(
          app.studentId,
          'job',
          `Application ${nextStatus}`,
          `${actorName} updated your application for ${app.jobTitle} to "${nextStatus}".`,
          destLink,
          app.id
        );
      }
      addToast('success', 'Application Updated', `${app.studentName} marked as ${nextStatus}.`);
    } catch (err: any) {
      addToast('error', 'Update Failed', err?.message || 'Could not update application status.');
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewApp || !interviewDate || !interviewTime) return;
    setSchedulingInterview(true);
    try {
      const actorName = userProfile?.name || 'Alumni';
      const detailSummary = `Call for Interview on ${interviewDate} at ${interviewTime} (${interviewMode})${
        interviewNote.trim() ? ` — ${interviewNote.trim()}` : ''
      }`;
      await updateApplicationStatusFirestore(
        interviewApp.id,
        'Call for Interview',
        actorName,
        detailSummary,
        {
          interviewDate,
          interviewTime,
          interviewMode,
          interviewLink: interviewLink.trim(),
        }
      );
      if (interviewApp.studentId && interviewApp.studentId !== firebaseUser?.uid) {
        const destLink =
          interviewApp.applicantRole === 'alumni'
            ? `/alumni/jobs?app=${interviewApp.id}`
            : `/student/applications?app=${interviewApp.id}`;
        void notify(
          interviewApp.studentId,
          'job',
          `Interview Invitation: ${interviewApp.jobTitle}`,
          `${actorName} invited you for an interview on ${interviewDate} at ${interviewTime} (${interviewMode}).`,
          destLink,
          interviewApp.id
        );
      }
      addToast('success', 'Interview Scheduled', `${interviewApp.studentName} notified.`);
      setInterviewApp(null);
    } catch (err: any) {
      addToast('error', 'Schedule Failed', err?.message || 'Could not save interview schedule.');
    } finally {
      setSchedulingInterview(false);
    }
  };

  const handleConfirmDeleteJob = async () => {
    if (!jobToDelete) return;
    setDeleting(true);
    try {
      const actorName = userProfile?.name || 'Alumni';
      const affected = await deleteJobPostingWithApplications(jobToDelete, actorName, applicantList);
      affected.forEach((app) => {
        if (app.studentId && app.studentId !== firebaseUser?.uid) {
          const destLink =
            app.applicantRole === 'alumni'
              ? `/alumni/jobs?app=${app.id}`
              : `/student/applications?app=${app.id}`;
          void notify(
            app.studentId,
            'job',
            'Job Listing Removed',
            `${jobToDelete.title} (${jobToDelete.company}) was removed by ${actorName}.`,
            destLink,
            app.id
          );
        }
      });
      addToast('info', 'Job Removed', `Deleted "${jobToDelete.title}" and updated affected applications.`);
      setJobToDelete(null);
    } catch (err: any) {
      addToast('error', 'Delete Failed', err?.message || 'Permission denied.');
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !userProfile) return;
    setSaving(true);
    try {
      await createJobPosting({
        title: title.trim(),
        company: company.trim() || 'Partner Organization',
        location: location.trim() || 'Bangladesh',
        type,
        department,
        salaryRange: salaryRange.trim() || 'Negotiable',
        deadline: deadline.trim() || 'Open',
        description: description.trim(),
        requirements: requirements
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        postedById: firebaseUser.uid,
        postedByName: userProfile.name,
        postedByRole: 'alumni',
        status: 'Open',
        isDemo: Boolean(userProfile.isDemo),
      });
      addToast('success', 'Opportunity Published', `${title} is now live across BAUST Career Bridge.`);
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
    } catch (err: any) {
      addToast('error', 'Failed to Post Job', err?.message || 'Permission denied.');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyToJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyModalJob || !firebaseUser || !userProfile) return;

    if (!uploadedCv) {
      setCvError('Please upload your PDF CV before submitting your application.');
      return;
    }

    setCvError(null);
    setApplying(true);
    try {
      const appId = await applyToJob({
        jobId: applyModalJob.id,
        jobTitle: applyModalJob.title,
        company: applyModalJob.company,
        postedBy: applyModalJob.postedById,
        postedById: applyModalJob.postedById,
        postedByName: applyModalJob.postedByName,
        postedByRole: applyModalJob.postedByRole,
        studentId: firebaseUser.uid,
        studentName: userProfile.name,
        studentEmail: userProfile.email,
        applicantRole: 'alumni',
        applicantPhotoURL: userProfile.photoURL || userProfile.avatar || '',
        department: userProfile.department || 'CSE',
        batch: userProfile.batch || 'Alumni',
        cgpa: String(userProfile.cgpa ?? ''),
        cvFileName: uploadedCv.fileName,
        cvName: uploadedCv.fileName,
        cvUrl: uploadedCv.url,
        cvFileDocId: uploadedCv.fileDocId || '',
        coverNote: coverNote.trim(),
        isDemo: Boolean(userProfile.isDemo),
      });

      const isAdminPosting =
        applyModalJob.postedByRole === 'admin' || applyModalJob.postedByRole === 'superAdmin';
      const targetRecipient = isAdminPosting ? 'ALL_ADMINS' : applyModalJob.postedById;
      if (targetRecipient && targetRecipient !== firebaseUser.uid) {
        const destLink = isAdminPosting
          ? `/admin/jobs/applications/${appId}`
          : `/alumni/jobs?app=${appId}`;
        void notify(
          targetRecipient,
          'job',
          'New Alumni Job Application',
          `${userProfile.name} (Alumni) applied for ${applyModalJob.title} (${applyModalJob.company}).`,
          destLink,
          appId
        );
      }

      addToast('success', 'Application Submitted', `Applied for ${applyModalJob.title}`);
      setApplyModalJob(null);
      setCoverNote('');
      setUploadedCv(null);
      setActiveTab('my-apps');
    } catch (err: any) {
      addToast('error', 'Application Failed', err?.message || 'Could not submit application.');
    } finally {
      setApplying(false);
    }
  };

  const handleWithdrawMyApp = async (app: JobApplication) => {
    if (!firebaseUser) return;
    setWithdrawingId(app.id);
    try {
      const actorName = userProfile?.name || 'Alumni';
      await updateApplicationStatusFirestore(app.id, 'Withdrawn', actorName, 'Withdrawn by applicant');
      const isAdminPosting = app.postedByRole === 'admin' || app.postedByRole === 'superAdmin';
      const ownerId = isAdminPosting ? 'ALL_ADMINS' : app.postedBy || app.postedById;
      if (ownerId && ownerId !== firebaseUser.uid) {
        const destLink = isAdminPosting
          ? `/admin/jobs/applications/${app.id}`
          : `/alumni/jobs?app=${app.id}`;
        void notify(
          ownerId,
          'job',
          'Job Application Withdrawn',
          `${actorName} withdrew their application for ${app.jobTitle}.`,
          destLink,
          app.id
        );
      }
      addToast('info', 'Application Withdrawn', `Withdrew application for ${app.jobTitle}.`);
    } catch (err: any) {
      addToast('error', 'Withdraw Failed', err?.message || 'Unable to withdraw application.');
    } finally {
      setWithdrawingId(null);
    }
  };

  if (loading) {
    return <Loader label="Loading career opportunities..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-emerald-100">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
            Alumni Career Hub
          </span>
          <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight mt-1">
            Jobs, Referrals & Applications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Post openings for BAUST students or apply to career circulars posted by the Placement Office
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Post New Opportunity
        </Button>
      </div>

      {/* Role Workflow Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('posted')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'posted'
              ? 'bg-[#0F2A4A] text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          My Posted Jobs & Applicants ({applicantList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('browse')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'browse'
              ? 'bg-[#0F2A4A] text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Browse & Apply to Jobs ({openCampusJobs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('my-apps')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'my-apps'
              ? 'bg-[#0F2A4A] text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          My Applications ({myApplications.length})
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {activeTab === 'posted' && (
        <div className="space-y-6">
          <Card className="p-6 border-slate-200 space-y-4">
            <h2 className="text-base font-bold text-[#0F2A4A] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-700" />
              Your Posted Opportunities ({myJobs.length})
            </h2>

            {myJobs.length === 0 ? (
              <div className="py-10 text-center space-y-2 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No jobs posted yet</p>
                <p className="text-xs text-slate-500">
                  Click "Post New Opportunity" to share a referral or opening with BAUST students.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{job.title}</h3>
                        <Badge variant={job.status === 'Open' ? 'approved' : 'neutral'} size="sm">
                          {job.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {job.company} · {job.type} · Dept: {job.department} · Deadline: {job.deadline}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          void updateJobStatus(job.id, job.status === 'Open' ? 'Closed' : 'Open')
                        }
                      >
                        {job.status === 'Open' ? 'Close' : 'Reopen'}
                      </Button>
                      <button
                        type="button"
                        onClick={() => setJobToDelete(job)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                        title="Delete job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 border-slate-200 space-y-4">
            <h2 className="text-base font-bold text-[#0F2A4A] flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-700" />
              Applicants ({applicantList.length})
            </h2>

            {applicantList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                No applications received for your postings yet.
              </div>
            ) : (
              <div className="space-y-3">
                {applicantList.map((app) => (
                  <div
                    key={app.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      highlightedAppId === app.id
                        ? 'border-[#0F2A4A] bg-blue-50/40 ring-1 ring-[#0F2A4A]/20'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900">
                        {app.studentName}{' '}
                        <span className="text-xs font-normal text-slate-500">
                          ({app.department} · {app.batch})
                        </span>
                      </p>
                      <p className="text-xs text-slate-600">
                        For: <strong>{app.jobTitle}</strong> · CV:{' '}
                        <span className="font-mono">{app.cvName || app.cvFileName}</span>
                      </p>
                      {app.interviewDate && (
                        <p className="text-[11px] font-semibold text-blue-700">
                          Interview: {app.interviewDate} at {app.interviewTime || 'TBD'} ({app.interviewMode || 'Online'})
                        </p>
                      )}
                      {app.coverNote && <p className="text-xs text-slate-500 italic">"{app.coverNote}"</p>}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {(app.cvUrl || app.cvFileDocId) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCvPreviewApp(app)}
                          leftIcon={<FileText className="w-3.5 h-3.5" />}
                        >
                          View CV
                        </Button>
                      )}

                      {app.status !== 'Withdrawn' && app.status !== 'Job Removed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setInterviewApp(app);
                            setInterviewDate(app.interviewDate || new Date().toISOString().split('T')[0]);
                            setInterviewTime(app.interviewTime || '10:30');
                            setInterviewMode(app.interviewMode || 'Online');
                            setInterviewLink(app.interviewLink || '');
                            setInterviewNote('');
                          }}
                          leftIcon={<CalendarClock className="w-3.5 h-3.5" />}
                        >
                          Call for Interview
                        </Button>
                      )}

                      {app.status === 'Withdrawn' || app.status === 'Job Removed' ? (
                        <Badge variant="neutral">{app.status}</Badge>
                      ) : (
                        <select
                          value={app.status}
                          onChange={(e) =>
                            void handleStatusChange(app, e.target.value as JobApplication['status'])
                          }
                          className="bg-white border border-slate-300 text-xs font-bold rounded-xl px-3 py-2 text-slate-800"
                        >
                          <option value="Applied">Applied</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Call for Interview">Call for Interview</option>
                          <option value="Interview">Interview</option>
                          <option value="Offered">Offered</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'browse' && (
        <div className="space-y-4">
          {openCampusJobs.length === 0 ? (
            <Card className="p-12 text-center space-y-2 border-dashed border-slate-300">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No open campus postings available right now</p>
              <p className="text-xs text-slate-500">Check back soon for new admin circulars or partner openings.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {openCampusJobs.map((job) => {
                const isApplied = myActiveAppliedJobIds.has(job.id);
                return (
                  <Card key={job.id} hoverable className="p-5 border-slate-200 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Badge variant="in-progress" size="sm">
                            {job.type}
                          </Badge>
                          <h3 className="text-base font-bold text-[#0F2A4A] mt-2">{job.title}</h3>
                          <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mt-0.5">
                            <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                            {job.company}
                          </p>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          {job.department}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Deadline: {job.deadline}
                        </span>
                        <span className="font-semibold text-emerald-700">{job.salaryRange}</span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{job.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <span className="text-[11px] text-slate-400">
                        Posted by <strong className="text-slate-600">{job.postedByName}</strong>
                      </span>
                      {isApplied ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                        </span>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setApplyModalJob(job);
                            setCoverNote('');
                            setUploadedCv(null);
                            setCvError(null);
                          }}
                          rightIcon={<Send className="w-3.5 h-3.5" />}
                        >
                          Apply with PDF CV
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'my-apps' && (
        <Card className="p-6 border-slate-200 space-y-4">
          <h2 className="text-base font-bold text-[#0F2A4A] flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-emerald-700" />
            My Submitted Applications ({myApplications.length})
          </h2>

          {myApplications.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              You have not applied to any campus job postings yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myApplications.map((app) => {
                const canWithdraw =
                  app.status === 'Applied' || app.status === 'Under Review' || app.status === 'On Hold';
                return (
                  <div
                    key={app.id}
                    className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      highlightedAppId === app.id ? 'bg-emerald-50/50 px-3 rounded-xl' : ''
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900">{app.jobTitle}</p>
                      <p className="text-xs text-slate-500">
                        {app.company} · CV: <span className="font-mono">{app.cvName || app.cvFileName}</span> ·{' '}
                        {app.createdAtLabel || 'Recently'}
                      </p>
                      {app.interviewDate && (
                        <p className="text-[11px] font-semibold text-blue-700">
                          Interview: {app.interviewDate} at {app.interviewTime || 'TBD'} ({app.interviewMode || 'Interview'})
                          {app.interviewLink ? ` · ${app.interviewLink}` : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={getAppBadgeVariant(app.status)}>{app.status}</Badge>
                      {(app.cvUrl || app.cvFileDocId) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCvPreviewApp(app)}
                          leftIcon={<FileText className="w-3.5 h-3.5" />}
                        >
                          View CV
                        </Button>
                      )}
                      {canWithdraw && (
                        <Button
                          variant="outline"
                          size="sm"
                          isLoading={withdrawingId === app.id}
                          onClick={() => void handleWithdrawMyApp(app)}
                          className="text-rose-600 hover:bg-rose-50"
                        >
                          Withdraw
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Delete Job Modal */}
      <Modal
        isOpen={Boolean(jobToDelete)}
        onClose={() => setJobToDelete(null)}
        title="Delete Job Posting?"
        description={`Remove "${jobToDelete?.title || ''}" at ${jobToDelete?.company || ''}?`}
        maxWidth="md"
      >
        <div className="space-y-4 text-left">
          <p className="text-xs text-slate-600">
            Any active applications for this listing will be marked as{' '}
            <strong>Job Removed</strong> and affected applicants will be notified.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setJobToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={deleting}
              onClick={() => void handleConfirmDeleteJob()}
              className="bg-rose-600 hover:bg-rose-700"
            >
              Delete Posting
            </Button>
          </div>
        </div>
      </Modal>

      {/* Post Job Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Post Job or Alumni Referral"
        description="Visible immediately across BAUST Career Bridge"
      >
        <form onSubmit={handleCreateJob} className="space-y-4">
          <Input
            label="Position Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Junior Backend Engineer (Node.js)"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Company / Organization"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Brain Station 23"
            />
            <Input
              label="Location"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Dhaka / Remote"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              options={[
                { value: 'Referral', label: 'Alumni Referral' },
                { value: 'Full-Time', label: 'Full-Time' },
                { value: 'Internship', label: 'Internship' },
                { value: 'Research', label: 'Research' },
              ]}
            />
            <Select
              label="Target Dept"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              options={[
                { value: 'All', label: 'All Departments' },
                ...BAUST_DEPARTMENTS.map((d) => ({ value: d.code, label: d.code })),
              ]}
            />
            <Input
              label="Deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Salary / Stipend Range"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
            />
            <Input
              label="Key Skills (comma separated)"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
            />
          </div>
          <Textarea
            label="Role Description & Referral Instructions"
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" isLoading={saving}>
              Publish Job
            </Button>
          </div>
        </form>
      </Modal>

      {/* Alumni Apply to Job Modal */}
      <Modal
        isOpen={Boolean(applyModalJob)}
        onClose={() => setApplyModalJob(null)}
        title={`Apply: ${applyModalJob?.title || ''}`}
        description={`${applyModalJob?.company || ''} · ${applyModalJob?.location || ''}`}
      >
        <form onSubmit={handleApplyToJob} className="space-y-4 text-left">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Attach PDF CV <span className="text-rose-500">*</span>
            </label>
            <FileUploader
              kind="cv"
              uid={firebaseUser?.uid || ''}
              docId={
                applyModalJob && firebaseUser
                  ? `appcv_${applyModalJob.id}_${firebaseUser.uid}`
                  : undefined
              }
              sharedWith={applyModalJob?.postedById ? [applyModalJob.postedById] : []}
              currentUrl={uploadedCv?.url}
              currentFileName={uploadedCv?.fileName}
              onUploaded={(res) => {
                setUploadedCv(res);
                setCvError(null);
              }}
              onRemove={() => setUploadedCv(null)}
            />
            {cvError && (
              <p role="alert" className="text-xs text-rose-600 font-semibold">
                {cvError}
              </p>
            )}
          </div>

          <Textarea
            label="Cover Note / Experience Summary"
            required
            rows={4}
            value={coverNote}
            onChange={(e) => setCoverNote(e.target.value)}
            placeholder="Summarize your industry background and interest in this opening..."
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setApplyModalJob(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={applying}>
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>

      {/* Call for Interview Modal */}
      <Modal
        isOpen={Boolean(interviewApp)}
        onClose={() => setInterviewApp(null)}
        title={`Call for Interview — ${interviewApp?.studentName || ''}`}
        description={interviewApp?.jobTitle}
        maxWidth="md"
      >
        <form onSubmit={handleScheduleInterview} className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          </div>
          <Select
            label="Interview Mode"
            value={interviewMode}
            onChange={(e) => setInterviewMode(e.target.value)}
            options={[
              { value: 'Online', label: 'Online (Meet / Zoom)' },
              { value: 'On-Campus', label: 'On-Campus (BAUST)' },
              { value: 'Office', label: 'Company Office' },
            ]}
          />
          <Input
            label="Meeting Link or Venue"
            value={interviewLink}
            onChange={(e) => setInterviewLink(e.target.value)}
            placeholder="https://meet.google.com/... or Room 302"
          />
          <Textarea
            label="Instructions for Candidate"
            rows={2}
            value={interviewNote}
            onChange={(e) => setInterviewNote(e.target.value)}
            placeholder="Optional portfolio or preparation instructions..."
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setInterviewApp(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={schedulingInterview}>
              Send Interview Call
            </Button>
          </div>
        </form>
      </Modal>

      <FilePreviewModal
        isOpen={Boolean(cvPreviewApp)}
        onClose={() => setCvPreviewApp(null)}
        title={`Candidate CV — ${cvPreviewApp?.studentName || ''}`}
        fileName={cvPreviewApp?.cvName || cvPreviewApp?.cvFileName || 'CV.pdf'}
        url={cvPreviewApp?.cvUrl}
        fileDocId={cvPreviewApp?.cvFileDocId}
      />
    </div>
  );
};
