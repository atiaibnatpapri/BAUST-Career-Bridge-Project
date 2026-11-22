/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { Badge } from '../../components/ui/Badge';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Loader } from '../../components/ui/Loader';
import { Briefcase, Plus, Trash2, AlertCircle, Users } from 'lucide-react';
import { BAUST_DEPARTMENTS } from '../../constants/baustDataModel';

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

  const handleStatusChange = async (app: JobApplication, nextStatus: JobApplication['status']) => {
    if (nextStatus === app.status) return;
    try {
      const actorName = userProfile?.name || 'Admin Office';
      await updateApplicationStatusFirestore(app.id, nextStatus, actorName);
      if (app.studentId && app.studentId !== firebaseUser?.uid) {
        void notify(
          app.studentId,
          'job',
          `Application ${nextStatus}`,
          `${actorName} updated your application for ${app.jobTitle} to "${nextStatus}".`,
          `/student/applications?app=${app.id}`,
          app.id
        );
      }
      addToast('success', 'Application Updated', `${app.studentName} marked as ${nextStatus}.`);
    } catch (err: any) {
      addToast('error', 'Update Failed', err?.message || 'Permission denied.');
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
          void notify(
            app.studentId,
            'job',
            'Job Listing Removed',
            `${jobToDelete.title} (${jobToDelete.company}) was removed by ${actorName}.`,
            `/student/applications?app=${app.id}`,
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
      addToast('success', 'Job Posting Created', `${title} is now visible to BAUST students.`);
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
            Manage Job & Internship Postings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create official campus circulars and moderate active job listings
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

      {/* Campus & Job Applicants */}
      <Card className="p-6 border-slate-200 space-y-4">
        <h2 className="text-base font-bold text-[#0F2A4A] flex items-center gap-2">
          <Users className="w-4 h-4 text-orange-600" />
          Student Applications Across Listings ({applications.length})
        </h2>

        {applications.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            No student applications submitted yet.
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  highlightedAppId === app.id
                    ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500/20'
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
                    For: <strong>{app.jobTitle}</strong> ({app.company}) · CV:{' '}
                    <span className="font-mono">{app.cvFileName}</span>
                  </p>
                  {app.coverNote && <p className="text-xs text-slate-500 italic">"{app.coverNote}"</p>}
                </div>

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
                    <option value="Interview">Interview</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                )}
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
            Any active student applications for this listing will be marked as{' '}
            <strong>Job Removed</strong> and affected students will be notified.
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
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish Campus Job / Internship"
        description="Immediately visible on Student Jobs & Internships board"
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
    </div>
  );
};
