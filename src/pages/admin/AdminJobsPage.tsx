/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
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
import { FilePreviewModal } from '../../components/ui/FilePreviewModal';
import {
  Briefcase,
  Plus,
  Trash2,
  AlertCircle,
  Users,
  Search,
  FileText,
  CalendarClock,
  ExternalLink,
} from 'lucide-react';
import { BAUST_DEPARTMENTS } from '../../constants/baustDataModel';

const FILTER_STATUSES = [
  'All',
  'Applied',
  'Under Review',
  'Shortlisted',
  'Call for Interview',
  'Interview',
  'Offered',
  'Accepted',
  'Rejected',
] as const;

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

export const AdminJobsPage: React.FC = () => {
  const { firebaseUser, userProfile } = useAuth();
  const { addToast } = useApp();
  const [searchParams] = useSearchParams();
  const highlightedAppId = searchParams.get('app');

  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<JobPosting | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filters & search
  const [appSearch, setAppSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [cvPreviewApp, setCvPreviewApp] = useState<JobApplication | null>(null);

  // Interview Schedule Modal
  const [interviewApp, setInterviewApp] = useState<JobApplication | null>(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('10:30');
  const [interviewMode, setInterviewMode] = useState('Online');
  const [interviewLink, setInterviewLink] = useState('');
  const [interviewNote, setInterviewNote] = useState('');
  const [schedulingInterview, setSchedulingInterview] = useState(false);

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('Dhaka / Saidpur');
  const [type, setType] = useState<JobPosting['type']>('Full-Time');
  const [department, setDepartment] = useState('All');
  const [salaryRange, setSalaryRange] = useState('Negotiable');
  const [deadline, setDeadline] = useState('2026-12-30');
  const [requirements, setRequirements] = useState('B.Sc in Engineering, Strong Communication');
  const [description, setDescription] = useState('');

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
    const unsubApps = subscribeJobApplications(
      {},
      setApplications,
      (err) => setErrorMsg(err.message)
    );
    return () => {
      unsubJobs();
      unsubApps();
    };
  }, []);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: applications.length };
    applications.forEach((a) => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return counts;
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const q = appSearch.trim().toLowerCase();
    return applications.filter((app) => {
      const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
      const matchesSearch =
        !q ||
        app.studentName.toLowerCase().includes(q) ||
        app.studentEmail.toLowerCase().includes(q) ||
        app.jobTitle.toLowerCase().includes(q) ||
        app.company.toLowerCase().includes(q) ||
        app.department.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [applications, appSearch, statusFilter]);

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
      const actorName = userProfile?.name || 'Admin Office';
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
      addToast('error', 'Update Failed', err?.message || 'Permission denied.');
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewApp || !interviewDate || !interviewTime) return;
    setSchedulingInterview(true);
    try {
      const actorName = userProfile?.name || 'Admin Office';
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
          `Interview Call: ${interviewApp.jobTitle}`,
          `Scheduled for ${interviewDate} at ${interviewTime} (${interviewMode}).`,
          destLink,
          interviewApp.id
        );
      }
      addToast('success', 'Interview Scheduled', `${interviewApp.studentName} notified.`);
      setInterviewApp(null);
    } catch (err: any) {
      addToast('error', 'Schedule Failed', err?.message || 'Permission denied.');
    } finally {
      setSchedulingInterview(false);
    }
  };

  const handleConfirmDeleteJob = async () => {
    if (!jobToDelete) return;
    setDeleting(true);
    try {
      const actorName = userProfile?.name || 'Admin Office';
      const jobApps = applications.filter((a) => a.jobId === jobToDelete.id);
      const affected = await deleteJobPostingWithApplications(jobToDelete, actorName, jobApps);
      affected.forEach((app) => {
        if (app.studentId && app.studentId !== firebaseUser?.uid) {
          const destLink =
            app.applicantRole === 'alumni' ? `/alumni/jobs?app=${app.id}` : `/student/applications?app=${app.id}`;
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !userProfile) return;
    setSaving(true);
    try {
      await createJobPosting({
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        type,
        department,
        salaryRange: salaryRange.trim(),
        deadline,
        description: description.trim(),
        requirements: requirements
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        postedById: firebaseUser.uid,
        postedByName: userProfile.name,
        postedByRole: userProfile.role,
        status: 'Open',
        isDemo: Boolean(userProfile.isDemo),
      });
      addToast('success', 'Job Posting Created', `${title} is now visible across the portal.`);
      setIsModalOpen(false);
      setTitle('');
      setCompany('');
      setDescription('');
    } catch (err: any) {
      addToast('error', 'Failed to Post Job', err?.message || 'Permission denied.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader label="Loading job & internship postings..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-orange-100">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[11px] font-bold">
            Placement Administration
          </span>
          <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight mt-1">
            Job Posts & Applications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Publish official campus circulars, inspect applicant CVs, shortlist, and schedule interviews
          </p>
        </div>

        <Button
          variant="primary"
          className="bg-orange-600 hover:bg-orange-700"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Post Campus Job
        </Button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {jobs.length === 0 ? (
        <Card className="p-12 text-center space-y-2 border-dashed border-slate-300">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No job postings in Firestore yet</p>
          <p className="text-xs text-slate-500">Create a campus job or internship posting above.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Card key={job.id} className="p-5 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-slate-900">{job.title}</h3>
                  <Badge variant={job.status === 'Open' ? 'approved' : 'neutral'} size="sm">
                    {job.status}
                  </Badge>
                  <Badge variant="navy" size="sm">
                    {job.type}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600">
                  {job.company} · {job.location} · Dept: {job.department} · Deadline: {job.deadline}
                </p>
                <p className="text-[11px] text-slate-400">
                  Posted by {job.postedByName} ({job.postedByRole})
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void updateJobStatus(job.id, job.status === 'Open' ? 'Closed' : 'Open')}
                >
                  {job.status === 'Open' ? 'Close Listing' : 'Reopen'}
                </Button>
                <button
                  type="button"
                  onClick={() => setJobToDelete(job)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                  title="Delete job posting"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Applicant Management */}
      <Card className="p-6 border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[#0F2A4A] flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-600" />
            All Job Applications ({applications.length})
          </h2>

          <div className="w-full sm:w-72">
            <Input
              placeholder="Search applicant, role, company..."
              value={appSearch}
              onChange={(e) => setAppSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {FILTER_STATUSES.map((st) => {
            const count = statusCounts[st] || 0;
            const active = statusFilter === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer border ${
                  active
                    ? 'bg-[#0F2A4A] text-white border-[#0F2A4A]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>

        {filteredApplications.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            No matching applications found.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className={`p-4 rounded-xl border flex flex-col lg:flex-row lg:items-center justify-between gap-3 ${
                  highlightedAppId === app.id
                    ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-900">
                      {app.studentName}{' '}
                      <span className="text-xs font-normal text-slate-500">
                        ({app.department} · {app.batch})
                      </span>
                    </p>
                    <Badge variant={app.applicantRole === 'alumni' ? 'navy' : 'neutral'} size="sm">
                      {app.applicantRole === 'alumni' ? 'Alumni' : 'Student'}
                    </Badge>
                    <Badge variant={getAppBadgeVariant(app.status)} size="sm">
                      {app.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">
                    For: <strong>{app.jobTitle}</strong> ({app.company}) · CV:{' '}
                    <span className="font-mono">{app.cvName || app.cvFileName}</span>
                  </p>
                  {app.interviewDate && (
                    <p className="text-[11px] font-semibold text-blue-700">
                      Interview: {app.interviewDate} at {app.interviewTime || 'TBD'} ({app.interviewMode || 'Online'})
                    </p>
                  )}
                  {app.coverNote && <p className="text-xs text-slate-500 italic">"{app.coverNote}"</p>}
                </div>

                <div className="flex items-center gap-2 flex-wrap shrink-0">
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

                  <Link to={`/admin/jobs/applications/${app.id}`}>
                    <Button variant="ghost" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                      Open
                    </Button>
                  </Link>

                  {app.status !== 'Withdrawn' && app.status !== 'Job Removed' && (
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
              { value: 'Office', label: 'Employer Office' },
            ]}
          />
          <Input
            label="Meeting Link or Room"
            value={interviewLink}
            onChange={(e) => setInterviewLink(e.target.value)}
            placeholder="https://meet.google.com/... or BAUST Seminar Hall"
          />
          <Textarea
            label="Candidate Note"
            rows={2}
            value={interviewNote}
            onChange={(e) => setInterviewNote(e.target.value)}
            placeholder="Bring academic transcripts / prepare a brief portfolio walkthrough..."
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setInterviewApp(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={schedulingInterview}>
              Schedule & Notify
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish Campus Job / Internship"
        description="Immediately visible on Jobs & Internships boards"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Job Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Employer / Company" required value={company} onChange={(e) => setCompany(e.target.value)} />
            <Input label="Location" required value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              options={[
                { value: 'Full-Time', label: 'Full-Time' },
                { value: 'Internship', label: 'Internship' },
                { value: 'Research', label: 'Research' },
                { value: 'Referral', label: 'Referral' },
              ]}
            />
            <Select
              label="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              options={[
                { value: 'All', label: 'All Departments' },
                ...BAUST_DEPARTMENTS.map((d) => ({ value: d.code, label: d.code })),
              ]}
            />
            <Input label="Deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Salary / Stipend" value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} />
            <Input label="Requirements (comma separated)" value={requirements} onChange={(e) => setRequirements(e.target.value)} />
          </div>
          <Textarea label="Description" required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-orange-600 hover:bg-orange-700" isLoading={saving}>
              Publish Job
            </Button>
          </div>
        </form>
      </Modal>

      <FilePreviewModal
        isOpen={Boolean(cvPreviewApp)}
        onClose={() => setCvPreviewApp(null)}
        title={`Applicant CV — ${cvPreviewApp?.studentName || ''}`}
        fileName={cvPreviewApp?.cvName || cvPreviewApp?.cvFileName || 'CV.pdf'}
        url={cvPreviewApp?.cvUrl}
        fileDocId={cvPreviewApp?.cvFileDocId}
      />
    </div>
  );
};
