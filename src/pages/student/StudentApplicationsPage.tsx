/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  subscribeJobApplications,
  updateApplicationStatusFirestore,
} from '../../services/firestorePortal';
import { notify } from '../../services/careerBridgeService';
import { JobApplication, MentorshipRequest } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge, BadgeVariant } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { Modal } from '../../components/ui/Modal';
import { FilePreviewModal } from '../../components/ui/FilePreviewModal';
import { ClipboardList, Briefcase, Calendar, AlertCircle, Eye, FileText } from 'lucide-react';

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

export const StudentApplicationsPage: React.FC = () => {
  const { firebaseUser, userProfile } = useAuth();
  const { mentorshipRequests, addToast } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [selectedMentorship, setSelectedMentorship] = useState<MentorshipRequest | null>(null);
  const [cvPreviewApp, setCvPreviewApp] = useState<JobApplication | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    return subscribeJobApplications(
      { studentId: firebaseUser.uid },
      (items) => {
        setApplications(items);
        setLoading(false);
      },
      (err) => {
        setErrorMsg(err.message);
        setLoading(false);
      }
    );
  }, [firebaseUser]);

  useEffect(() => {
    const appId = searchParams.get('app');
    if (!appId || applications.length === 0) return;
    const match = applications.find((a) => a.id === appId);
    if (match) {
      setSelectedApp(match);
      const next = new URLSearchParams(searchParams);
      next.delete('app');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, applications, setSearchParams]);

  const handleWithdraw = async (app: JobApplication) => {
    if (!firebaseUser) return;
    setWithdrawingId(app.id);
    try {
      const actorName = userProfile?.name || app.studentName || 'Student';
      await updateApplicationStatusFirestore(app.id, 'Withdrawn', actorName, 'Withdrawn by student');
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
      setSelectedApp(null);
    } catch (err: any) {
      addToast('error', 'Withdraw Failed', err?.message || 'Unable to withdraw application.');
    } finally {
      setWithdrawingId(null);
    }
  };

  if (loading) {
    return <Loader label="Loading your applications..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-blue-100">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
            Student Tracker
          </span>
          <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight mt-1">
            Application & Mentorship Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track live statuses of your submitted job applications and alumni mentorship requests
          </p>
        </div>

        <Link to="/student/jobs">
          <Button variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700">
            Browse Open Jobs
          </Button>
        </Link>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Job Applications Section */}
      <Card className="p-6 border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0F2A4A] flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            Submitted Job Applications ({applications.length})
          </h2>
        </div>

        {applications.length === 0 ? (
          <div className="py-10 text-center space-y-2 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <ClipboardList className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No job applications yet</p>
            <p className="text-xs text-slate-500">
              Browse open jobs and internships posted by alumni and admins to apply.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {applications.map((app) => {
              const canWithdraw =
                app.status === 'Applied' || app.status === 'Under Review' || app.status === 'On Hold';
              return (
                <div
                  key={app.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">{app.jobTitle}</p>
                    <p className="text-xs text-slate-500">
                      {app.company} · CV: <span className="font-mono">{app.cvName || app.cvFileName}</span> · Applied{' '}
                      {app.createdAtLabel || 'Recently'}
                    </p>
                    {app.interviewDate && (
                      <p className="text-[11px] font-semibold text-blue-700 mt-0.5">
                        Interview: {app.interviewDate} {app.interviewTime ? `at ${app.interviewTime}` : ''} ({app.interviewMode || 'Interview'})
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                    <Badge variant={getAppBadgeVariant(app.status)}>{app.status}</Badge>
                    {(app.cvUrl || app.cvFileDocId) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCvPreviewApp(app)}
                      >
                        <FileText className="w-3.5 h-3.5 mr-1" />
                        View CV
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedApp(app)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Details
                    </Button>
                    {canWithdraw && (
                      <Button
                        variant="outline"
                        size="sm"
                        isLoading={withdrawingId === app.id}
                        onClick={() => void handleWithdraw(app)}
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

      {/* Mentorship Requests Section */}
      <Card className="p-6 border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0F2A4A] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Mentorship Requests ({mentorshipRequests.length})
          </h2>
          <Link to="/student/mentorship" className="text-xs font-bold text-blue-700 hover:underline">
            Request Mentorship
          </Link>
        </div>

        {mentorshipRequests.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            No mentorship requests sent yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {mentorshipRequests.map((m) => (
              <div
                key={m.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {m.topic} with {m.alumniName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {m.alumniCompany} · Preferred: {m.preferredDate} {m.preferredTime}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Badge
                    variant={
                      m.status === 'Accepted' || m.status === 'Completed'
                        ? 'approved'
                        : m.status === 'On Hold'
                        ? 'gold'
                        : m.status === 'Declined'
                        ? 'rejected'
                        : m.status === 'Cancelled'
                        ? 'neutral'
                        : 'pending'
                    }
                  >
                    {m.status}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedMentorship(m)}>
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    Timeline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Job Application Details & Status History Modal */}
      {selectedApp && (
        <Modal
          isOpen={Boolean(selectedApp)}
          onClose={() => setSelectedApp(null)}
          title={selectedApp.jobTitle}
          description={`${selectedApp.company} · Applied ${selectedApp.createdAtLabel || 'Recently'}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-left">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Current Status</span>
                <Badge variant={getAppBadgeVariant(selectedApp.status)}>{selectedApp.status}</Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-500">Attached CV</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-800">{selectedApp.cvName || selectedApp.cvFileName}</span>
                  {(selectedApp.cvUrl || selectedApp.cvFileDocId) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCvPreviewApp(selectedApp)}
                    >
                      View CV
                    </Button>
                  )}
                </div>
              </div>
              {selectedApp.interviewDate && (
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 space-y-1">
                  <p className="font-bold">Interview Scheduled</p>
                  <p>
                    Date & Time: {selectedApp.interviewDate} {selectedApp.interviewTime ? `· ${selectedApp.interviewTime}` : ''}
                  </p>
                  {selectedApp.interviewMode && <p>Mode: {selectedApp.interviewMode}</p>}
                  {selectedApp.interviewLink && (
                    <p className="font-mono break-all">Venue / Link: {selectedApp.interviewLink}</p>
                  )}
                </div>
              )}
              {selectedApp.postedByName && (
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Hiring Contact</span>
                  <span className="font-semibold text-slate-800">{selectedApp.postedByName}</span>
                </div>
              )}
              {selectedApp.coverNote && (
                <div>
                  <span className="font-semibold text-slate-600 block mb-1">Cover Note:</span>
                  <p className="text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-200">
                    "{selectedApp.coverNote}"
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Status History</h4>
              {Array.isArray(selectedApp.statusHistory) && selectedApp.statusHistory.length > 0 ? (
                <div className="space-y-2 border-l-2 border-slate-200 pl-3">
                  {selectedApp.statusHistory.map((h, i) => (
                    <div key={i} className="text-xs space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900">{h.status}</span>
                        <span className="text-[11px] text-slate-400">
                          {h.at ? new Date(h.at).toLocaleString() : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">By {h.by}</p>
                      {h.note && <p className="text-[11px] text-slate-500 italic">{h.note}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Submitted with status: {selectedApp.status}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              {(selectedApp.status === 'Applied' ||
                selectedApp.status === 'Under Review' ||
                selectedApp.status === 'On Hold') && (
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={withdrawingId === selectedApp.id}
                  onClick={() => void handleWithdraw(selectedApp)}
                  className="text-rose-600"
                >
                  Withdraw Application
                </Button>
              )}
              <Button variant="primary" size="sm" onClick={() => setSelectedApp(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Mentorship Status History Modal */}
      {selectedMentorship && (
        <Modal
          isOpen={Boolean(selectedMentorship)}
          onClose={() => setSelectedMentorship(null)}
          title={`${selectedMentorship.topic} with ${selectedMentorship.alumniName}`}
          description={`${selectedMentorship.alumniCompany} · ${selectedMentorship.preferredDate} ${selectedMentorship.preferredTime}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-left">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Status</span>
                <Badge
                  variant={
                    selectedMentorship.status === 'Accepted' || selectedMentorship.status === 'Completed'
                      ? 'approved'
                      : selectedMentorship.status === 'On Hold'
                      ? 'gold'
                      : selectedMentorship.status === 'Declined'
                      ? 'rejected'
                      : selectedMentorship.status === 'Cancelled'
                      ? 'neutral'
                      : 'pending'
                  }
                >
                  {selectedMentorship.status}
                </Badge>
              </div>
              {selectedMentorship.feedback && (
                <div>
                  <span className="font-semibold text-slate-600 block mb-1">Mentor Note:</span>
                  <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                    {selectedMentorship.feedback}
                  </p>
                </div>
              )}
              {selectedMentorship.meetingLink && (
                <div>
                  <span className="font-semibold text-slate-600">Meeting Link: </span>
                  <a
                    href={selectedMentorship.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0F2A4A] underline font-mono"
                  >
                    {selectedMentorship.meetingLink}
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Status History</h4>
              {Array.isArray(selectedMentorship.statusHistory) &&
              selectedMentorship.statusHistory.length > 0 ? (
                <div className="space-y-2 border-l-2 border-slate-200 pl-3">
                  {selectedMentorship.statusHistory.map((h, i) => (
                    <div key={i} className="text-xs space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900">{h.status}</span>
                        <span className="text-[11px] text-slate-400">
                          {h.at ? new Date(h.at).toLocaleString() : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">By {h.by}</p>
                      {h.note && <p className="text-[11px] text-slate-500 italic">{h.note}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Current status: {selectedMentorship.status}</p>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="primary" size="sm" onClick={() => setSelectedMentorship(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <FilePreviewModal
        isOpen={Boolean(cvPreviewApp)}
        onClose={() => setCvPreviewApp(null)}
        title={`Attached CV — ${cvPreviewApp?.jobTitle || ''}`}
        fileName={cvPreviewApp?.cvName || cvPreviewApp?.cvFileName || 'CV.pdf'}
        url={cvPreviewApp?.cvUrl}
        fileDocId={cvPreviewApp?.cvFileDocId}
      />
    </div>
  );
};
