/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Input';
import { VerificationItem } from '../../types';
import { CheckCircle2, XCircle, Eye, FileText, Loader2, Crown } from 'lucide-react';

export const SuperAdminVerificationsPage: React.FC = () => {
  const { verifications, verificationsLoading, approveVerification, rejectVerification } = useApp();

  const [filterRole, setFilterRole] = useState<'All' | 'student' | 'alumni' | 'admin'>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [searchTerm, setSearchTerm] = useState('');

  const [previewItem, setPreviewItem] = useState<VerificationItem | null>(null);
  const [rejectItem, setRejectItem] = useState<VerificationItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const safeVerifications = Array.isArray(verifications) ? verifications : [];

  const filteredVerifications = safeVerifications.filter((item) => {
    const itemRole = (item?.role || 'student').toLowerCase();
    const itemStatus = (item?.status || 'Pending').toLowerCase();
    const matchesRole = filterRole === 'All' || itemRole === filterRole;
    const matchesStatus = filterStatus === 'All' || itemStatus === filterStatus.toLowerCase();
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      (item?.name || '').toLowerCase().includes(term) ||
      (item?.email || '').toLowerCase().includes(term) ||
      (item?.baustId || '').toLowerCase().includes(term);

    return matchesRole && matchesStatus && matchesSearch;
  });

  const handleApprove = async (item: VerificationItem): Promise<boolean> => {
    setActionLoadingId(item.id);
    const res = await approveVerification(item.userId || item.id);
    setActionLoadingId(null);
    return res;
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectItem) return;
    setActionLoadingId(rejectItem.id);
    await rejectVerification(
      rejectItem.userId || rejectItem.id,
      rejectionReason || 'Information does not match BAUST registrar archives.'
    );
    setActionLoadingId(null);
    setRejectItem(null);
    setRejectionReason('');
  };

  const pendingCount = safeVerifications.filter((v) => v.status === 'Pending').length;
  const approvedCount = safeVerifications.filter((v) => v.status === 'Approved').length;
  const rejectedCount = safeVerifications.filter((v) => v.status === 'Rejected').length;

  const columns = [
    {
      header: 'Applicant',
      cell: (item: VerificationItem) => (
        <div>
          <div className="flex items-center gap-1.5">
            <p className="font-bold text-xs text-slate-900">{item.name || 'Applicant'}</p>
            {(item.isDemo || item.id.startsWith('demo-')) && (
              <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                DEMO
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 font-mono">{item.email || '—'}</p>
          <span className="text-[10px] text-slate-400">Submitted {item.submittedAt || 'Recently'}</span>
        </div>
      ),
    },
    {
      header: 'ID / Dept / Office',
      cell: (item: VerificationItem) => (
        <div>
          <p className="font-mono font-bold text-xs text-[#0F2A4A]">{item.baustId || 'Pending ID'}</p>
          <p className="text-[11px] text-slate-600">
            {item.department || 'CSE'} · {item.office || item.batch || 'N/A'}
          </p>
        </div>
      ),
    },
    {
      header: 'Requested Role',
      cell: (item: VerificationItem) => (
        <Badge
          variant={
            item.role === 'admin' ? 'pending' : item.role === 'alumni' ? 'army' : 'in-progress'
          }
          size="sm"
        >
          {(item.role || 'student').toUpperCase()}
        </Badge>
      ),
    },
    {
      header: 'Proof',
      cell: (item: VerificationItem) => (
        <button
          type="button"
          onClick={() => setPreviewItem(item)}
          className="text-xs font-semibold text-purple-800 hover:underline flex items-center gap-1.5 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-purple-600" />
          <span className="truncate max-w-[140px]">{item.documentType || 'Verification Doc'}</span>
          <Eye className="w-3 h-3 text-slate-400" />
        </button>
      ),
    },
    {
      header: 'Status',
      cell: (item: VerificationItem) => (
        <Badge
          variant={
            item.status === 'Approved'
              ? 'approved'
              : item.status === 'Rejected'
              ? 'rejected'
              : 'pending'
          }
        >
          {item.status}
        </Badge>
      ),
    },
    {
      header: 'Super Admin Actions',
      align: 'right' as const,
      cell: (item: VerificationItem) => (
        <div className="flex items-center justify-end gap-1.5">
          {item.status === 'Pending' ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                className="text-xs py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                isLoading={actionLoadingId === item.id}
                disabled={Boolean(actionLoadingId)}
                onClick={() => void handleApprove(item)}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="text-xs py-1 px-2.5 bg-rose-600 hover:bg-rose-700 text-white"
                disabled={Boolean(actionLoadingId)}
                onClick={() => {
                  setRejectItem(item);
                  setRejectionReason('');
                }}
                leftIcon={<XCircle className="w-3.5 h-3.5" />}
              >
                Reject
              </Button>
            </>
          ) : (
            <span className="text-[11px] text-slate-400 italic">
              {item.status === 'Approved' ? 'Approved' : 'Rejected'}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-purple-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold inline-flex items-center gap-1">
              <Crown className="w-3 h-3" /> Super Admin Exclusive
            </span>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Firestore Live
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight mt-1">
            Registration Verification Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Approve or reject Student, Alumni, and Admin registration requests in real time
          </p>
        </div>

        <Badge variant="pending" size="md">
          {pendingCount} Pending Requests
        </Badge>
      </div>

      {/* Tabs with counts */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setFilterStatus('All')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterStatus === 'All'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Requests ({safeVerifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('Pending')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterStatus === 'Pending'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('Approved')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterStatus === 'Approved'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
          }`}
        >
          Approved ({approvedCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('Rejected')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterStatus === 'Rejected'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
          }`}
        >
          Rejected ({rejectedCount})
        </button>
      </div>

      <Card className="p-4 border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Search by applicant name, email, or BAUST/Employee ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300 text-xs rounded-xl px-3.5 py-2.5 text-slate-900"
          />

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="w-full bg-white border border-slate-300 text-xs font-semibold rounded-xl px-3 py-2.5 text-slate-800"
          >
            <option value="All">All Roles (Student, Alumni & Admin)</option>
            <option value="student">Student</option>
            <option value="alumni">Alumni</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </Card>

      {verificationsLoading ? (
        <Card className="p-10 text-center space-y-2 border-slate-200">
          <Loader2 className="w-6 h-6 text-purple-700 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">
            Loading verification requests from Cloud Firestore...
          </p>
        </Card>
      ) : (
        <Table
          columns={columns}
          data={filteredVerifications}
          keyExtractor={(item) => item.id}
          emptyMessage="No registration requests match the current filter."
        />
      )}

      <Modal
        isOpen={Boolean(previewItem)}
        onClose={() => setPreviewItem(null)}
        title={`Applicant Verification: ${previewItem?.name || ''}`}
        description={`${(previewItem?.role || 'student').toUpperCase()} · ID: ${previewItem?.baustId || ''}`}
      >
        {previewItem && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <p><strong>Email:</strong> {previewItem.email}</p>
              <p><strong>Role:</strong> {(previewItem.role || 'student').toUpperCase()}</p>
              <p><strong>Department:</strong> {previewItem.department}</p>
              <p><strong>Batch / Office:</strong> {previewItem.office || previewItem.batch || '—'}</p>
              {previewItem.passingYear ? <p><strong>Passing Year:</strong> {previewItem.passingYear}</p> : null}
              {previewItem.company && <p><strong>Organization / Company:</strong> {previewItem.company}</p>}
              {previewItem.designation && <p><strong>Designation:</strong> {previewItem.designation}</p>}
              {previewItem.details?.phone && <p><strong>Phone:</strong> {previewItem.details.phone}</p>}
              <p><strong>Document Type:</strong> {previewItem.documentType}</p>
              {previewItem.details?.documentFileName && (
                <p><strong>Uploaded Proof File:</strong> {previewItem.details.documentFileName}</p>
              )}
              {(previewItem.details?.verificationProofUrl || previewItem.documentPreviewUrl) && (
                <p className="flex items-center gap-1.5 flex-wrap">
                  <strong>Verification Proof Link:</strong>
                  <a
                    href={previewItem.details?.verificationProofUrl || previewItem.documentPreviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-700 font-semibold underline break-all"
                  >
                    {previewItem.details?.verificationProofUrl || previewItem.documentPreviewUrl}
                  </a>
                </p>
              )}
              {previewItem.details?.linkedin && (
                <p className="flex items-center gap-1.5 flex-wrap">
                  <strong>LinkedIn Profile:</strong>
                  <a
                    href={previewItem.details.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 font-semibold underline break-all"
                  >
                    {previewItem.details.linkedin}
                  </a>
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" onClick={() => setPreviewItem(null)}>
                Close
              </Button>
              {previewItem.status === 'Pending' && (
                <>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setRejectItem(previewItem);
                      setPreviewItem(null);
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="secondary"
                    isLoading={actionLoadingId === previewItem.id}
                    onClick={async () => {
                      const ok = await handleApprove(previewItem);
                      if (ok) setPreviewItem(null);
                    }}
                  >
                    Approve Account
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(rejectItem)}
        onClose={() => setRejectItem(null)}
        title="Reject Registration Request"
        description={`Specify reason for rejecting ${rejectItem?.name || ''}`}
      >
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <Textarea
            label="Rejection Reason (Optional — Shown to Applicant)"
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Optional: explain why this registration was rejected..."
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setRejectItem(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" isLoading={Boolean(actionLoadingId)}>
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
