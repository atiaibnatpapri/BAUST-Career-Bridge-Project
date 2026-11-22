/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  applyToJob,
  subscribeJobApplications,
  subscribeJobs,
} from '../../services/firestorePortal';
import { notify } from '../../services/careerBridgeService';
import { JobApplication, JobPosting } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Loader } from '../../components/ui/Loader';
import { toList } from '../../utils/utils';
import { BAUST_DEPARTMENTS } from '../../constants/baustDataModel';
import {
  Briefcase,
  MapPin,
  Search,
  Send,
  CheckCircle2,
  Building2,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export const StudentJobsPage: React.FC = () => {
  const { firebaseUser, userProfile } = useAuth();
  const { addToast } = useApp();

  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');

  const [applyModalJob, setApplyModalJob] = useState<JobPosting | null>(null);
  const [coverNote, setCoverNote] = useState('');
  const [cvFileName, setCvFileName] = useState(userProfile?.cvFileName || 'BAUST_Student_CV.pdf');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setCvFileName(userProfile?.cvFileName || 'BAUST_Student_CV.pdf');
  }, [userProfile?.cvFileName]);

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

    const unsubApps = firebaseUser
      ? subscribeJobApplications({ studentId: firebaseUser.uid }, setApplications)
      : () => {};

    return () => {
      unsubJobs();
      unsubApps();
    };
  }, [firebaseUser]);

  const appliedJobIds = new Set(applications.map((a) => a.jobId));

  const filteredJobs = jobs.filter((job) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.description.toLowerCase().includes(q);
    const matchesType = typeFilter === 'All' || job.type === typeFilter;
    const matchesDept =
      deptFilter === 'All' || job.department === 'All' || job.department === deptFilter;
    return job.status === 'Open' && matchesSearch && matchesType && matchesDept;
  });

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyModalJob || !firebaseUser || !userProfile) return;
    setSubmitting(true);
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
        department: userProfile.department || 'CSE',
        batch: userProfile.batch || 'BAUST',
        cgpa: String(userProfile.cgpa ?? ''),
        cvFileName: cvFileName.trim() || 'Student_CV.pdf',
        coverNote: coverNote.trim(),
        isDemo: Boolean(userProfile.isDemo),
      });
      if (applyModalJob.postedById && applyModalJob.postedById !== firebaseUser.uid) {
        const destLink =
          applyModalJob.postedByRole === 'admin'
            ? `/admin/jobs?app=${appId}`
            : `/alumni/jobs?app=${appId}`;
        void notify(
          applyModalJob.postedById,
          'job',
          'New Job Application',
          `${userProfile.name} applied for ${applyModalJob.title} (${applyModalJob.company}).`,
          destLink,
          appId
        );
      }
      addToast('success', 'Application Submitted', `Applied to ${applyModalJob.title} at ${applyModalJob.company}`);
      setApplyModalJob(null);
      setCoverNote('');
    } catch (err: any) {
      addToast('error', 'Application Failed', err?.message || 'Could not submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader label="Loading career opportunities..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-blue-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
              Student Career Board
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight mt-1">
            Jobs, Internships & Alumni Referrals
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Explore curated openings posted by verified BAUST alumni and university placement admins
          </p>
        </div>

        <Link to="/student/applications">
          <Button variant="outline" size="sm">
            My Applications ({applications.length})
          </Button>
        </Link>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <Card className="p-4 border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search role, company, or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-white border border-slate-300 text-xs font-semibold rounded-xl px-3 py-2.5 text-slate-800"
          >
            <option value="All">All Opportunity Types</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Internship">Internship</option>
            <option value="Referral">Alumni Referral</option>
            <option value="Research">Research</option>
          </select>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full bg-white border border-slate-300 text-xs font-semibold rounded-xl px-3 py-2.5 text-slate-800"
          >
            <option value="All">All Departments</option>
            {BAUST_DEPARTMENTS.map((d) => (
              <option key={d.code} value={d.code}>
                {d.code}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {filteredJobs.length === 0 ? (
        <Card className="p-12 text-center space-y-2 border-dashed border-slate-300">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No open positions match your filters</p>
          <p className="text-xs text-slate-500">
            Check back soon as BAUST alumni and admins post new opportunities.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredJobs.map((job) => {
            const isApplied = appliedJobIds.has(job.id);
            return (
              <Card key={job.id} hoverable className="p-5 border-slate-200 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant="in-progress" size="sm">
                        {job.type}
                      </Badge>
                      <h3 className="text-base font-bold text-[#0F2A4A] mt-2">{job.title}</h3>
                      <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        {job.company}
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
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

                  {toList(job.requirements).length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {toList(job.requirements).map((req) => (
                        <span
                          key={req}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  )}
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
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => setApplyModalJob(job)}
                      rightIcon={<Send className="w-3.5 h-3.5" />}
                    >
                      Apply Now
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={Boolean(applyModalJob)}
        onClose={() => setApplyModalJob(null)}
        title={`Apply: ${applyModalJob?.title || ''}`}
        description={`${applyModalJob?.company || ''} · ${applyModalJob?.location || ''}`}
      >
        <form onSubmit={handleApply} className="space-y-4">
          <Input
            label="Attached CV Filename"
            required
            value={cvFileName}
            onChange={(e) => setCvFileName(e.target.value)}
            placeholder="e.g. Tanvir_BAUST_CSE_CV.pdf"
          />
          <Textarea
            label="Cover Note / Why You Fit"
            required
            rows={4}
            value={coverNote}
            onChange={(e) => setCoverNote(e.target.value)}
            placeholder="Highlight your relevant projects, coursework, and availability..."
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setApplyModalJob(null)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="bg-blue-600 hover:bg-blue-700"
              isLoading={submitting}
            >
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
