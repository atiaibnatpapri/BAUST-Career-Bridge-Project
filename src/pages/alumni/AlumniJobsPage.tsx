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
import { Briefcase, Plus, Trash2, Users, AlertCircle } from 'lucide-react';
import { BAUST_DEPARTMENTS } from '../../constants/baustDataModel';

export const AlumniJobsPage: React.FC = () => {
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
  const [company, setCompany] = useState(userProfile?.company || '');
  const [location, setLocation] = useState('Dhaka, Bangladesh');
  const [type, setType] = useState<JobPosting['type']>('Referral');
  const [department, setDepartment] = useState<string>(userProfile?.department || 'CSE');
  const [salaryRange, setSalaryRange] = useState('BDT 45,000 - 70,000');
  const [deadline, setDeadline] = useState('2026-12-30');
  const [requirements, setRequirements] = useState('React, TypeScript, Problem Solving');
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
    const unsubApps = firebaseUser?.uid
      ? subscribeJobApplications(
          { postedBy: firebaseUser.uid },
          setApplications,
          (err) => setErrorMsg(err.message)
        )
      : () => {};
    return () => {
      unsubJobs();
      unsubApps();
    };
  }, [firebaseUser?.uid]);

  const myJobs = jobs.filter((j) => j.postedById === firebaseUser?.uid);
  const myJobIds = new Set(myJobs.map((j) => j.id));
  const applicantList = applications.filter((a) => myJobIds.has(a.jobId));

  const handleStatusChange = async (app: JobApplication, nextStatus: JobApplication['status']) => {
    if (nextStatus === app.status) return;
    try {
      const actorName = userProfile?.name || 'Alumni';
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
      addToast('error', 'Update Failed', err?.message || 'Could not update application status.');
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
      addToast('success', 'Opportunity Published', `${title} is now live for BAUST students.`);
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
    } catch (err: any) {
      addToast('error', 'Failed to Post Job', err?.message || 'Permission denied.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader label="Loading your job postings..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-emerald-100">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
            Alumni Referrals & Hiring
          </span>
          <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight mt-1">
            Post Jobs & Referrals
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Share company openings, internships, and direct alumni referrals with BAUST students
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

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* My Posted Opportunities */}
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

      {/* Student Applicants */}
      <Card className="p-6 border-slate-200 space-y-4">
        <h2 className="text-base font-bold text-[#0F2A4A] flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-700" />
          Student Applicants ({applicantList.length})
        </h2>

        {applicantList.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            No student applications received for your postings yet.
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
                    {app.studentName} <span className="text-xs font-normal text-slate-500">({app.department} · {app.batch})</span>
                  </p>
                  <p className="text-xs text-slate-600">
                    For: <strong>{app.jobTitle}</strong> · CV: <span className="font-mono">{app.cvFileName}</span>
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
        title="Post Job or Alumni Referral"
        description="Visible immediately to verified BAUST students"
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
    </div>
  );
};
