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
import { 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  FileText, 
  Clock, 
  ShieldAlert, 
  Search,
  Filter
} from 'lucide-react';

export const VerificationQueuePage: React.FC = () => {
  const { verifications, approveVerification, rejectVerification } = useApp();

  const [filterRole, setFilterRole] = useState<'All' | 'student' | 'alumni'>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected item for Document Preview & Approval/Rejection
  const [previewItem, setPreviewItem] = useState<VerificationItem | null>(null);
  const [rejectItem, setRejectItem] = useState<VerificationItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const filteredVerifications = verifications.filter((item) => {
    const matchesRole = filterRole === 'All' || item.role === filterRole;
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.baustId.includes(searchTerm);

    return matchesRole && matchesStatus && matchesSearch;
  });

  const handleApprove = async (id: string): Promise<boolean> => {
    setActionLoadingId(id);
    const res = await approveVerification(id);
    setActionLoadingId(null);
    return res;
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectItem) return;
    setActionLoadingId(rejectItem.id);
    await rejectVerification(rejectItem.id, rejectionReason || 'Information does not match BAUST registrar archives.');
    setActionLoadingId(null);
    setRejectItem(null);
    setRejectionReason('');
  };

  const columns = [
    {
      header: 'Applicant',
      cell: (item: VerificationItem) => (
        <div>
          <p className="font-bold text-xs text-slate-900">{item.name}</p>
          <p className="text-[11px] text-slate-500 font-mono">{item.email}</p>
          <span className="text-[10px] text-slate-400">Submitted {item.submittedAt}</span>
        </div>
      ),
    },
    {
      header: 'BAUST ID & Dept',
      cell: (item: VerificationItem) => (
        <div>
          <p className="font-mono font-bold text-xs text-[#0F2A4A]">{item.baustId}</p>
          <p className="text-[11px] text-slate-600">
            {item.department} · {item.batch}
          </p>
        </div>
      ),
    },
    {
      header: 'Role',
      cell: (item: VerificationItem) => (
        <Badge variant={item.role === 'student' ? 'army' : 'navy'} size="sm">
          {item.role.toUpperCase()}
        </Badge>
      ),
    },
    {
      header: 'Proof Document',
      cell: (item: VerificationItem) => (
        <button
          onClick={() => setPreviewItem(item)}
          className="text-xs font-semibold text-[#0F2A4A] hover:underline flex items-center gap-1.5 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-[#C9A227]" />
          <span className="truncate max-w-[140px]">{item.documentType}</span>
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
      header: 'Review Actions',
      align: 'right' as const,
      cell: (item: VerificationItem) => (
        <div className="flex items-center justify-end gap-1.5">
          {item.status === 'Pending' ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                className="text-xs py-1 px-2.5"
                isLoading={actionLoadingId === item.id}
                disabled={!!actionLoadingId}
                onClick={() => handleApprove(item.id)}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs py-1 px-2.5 text-rose-600 border-rose-200 hover:bg-rose-50"
                onClick={() => {
                  setRejectItem(item);
                  setRejectionReason('');
                }}
                leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-500" />}
              >
                Reject
              </Button>
            </>
          ) : (
            <span className="text-[11px] text-slate-400 italic">
              {item.status === 'Approved' ? 'Verified' : 'Rejected'}
            </span>
          )}
        </div>
      ),
    },
  ];

  const pendingCount = verifications.filter((v) => v.status === 'Pending').length;
  const approvedCount = verifications.filter((v) => v.status === 'Approved').length;
  const rejectedCount = verifications.filter((v) => v.status === 'Rejected').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight">
              Profile Verification Queue
            </h1>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Cloud Firestore Live
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Validate student and alumni identities against BAUST examination archives to prevent fraudulent profiles
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="pending" size="md">
            {pendingCount} Pending Verifications
          </Badge>
        </div>
      </div>

      {/* Status Segment Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setFilterStatus('All')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterStatus === 'All'
              ? 'bg-[#0F2A4A] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Requests ({verifications.length})
        </button>
        <button
          onClick={() => setFilterStatus('Pending')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            filterStatus === 'Pending'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
          }`}
        >
          <span>Pending Review</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/30 text-[10px]">
            {pendingCount}
          </span>
        </button>
        <button
          onClick={() => setFilterStatus('Approved')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            filterStatus === 'Approved'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
          }`}
        >
          <span>Approved ({approvedCount})</span>
        </button>
        <button
          onClick={() => setFilterStatus('Rejected')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            filterStatus === 'Rejected'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
          }`}
        >
          <span>Rejected ({rejectedCount})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Search by applicant name, email, or BAUST ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300 text-xs rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F2A4A]"
          />

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="w-full bg-white border border-slate-300 text-xs font-semibold rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F2A4A]"
          >
            <option value="All">All Roles (Student & Alumni)</option>
            <option value="student">Current Students Only</option>
            <option value="alumni">Graduated Alumni Only</option>
          </select>
        </div>
      </Card>

      {/* Verification Queue Table */}
      <Table
        columns={columns}
        data={filteredVerifications}
        keyExtractor={(item) => item.id}
        emptyMessage="No registration items match current filter criteria."
      />

      {/* DOCUMENT PREVIEW MODAL */}
      <Modal
        isOpen={!!previewItem}
        onClose={() => setPreviewItem(null)}
        title={`Verification Document Preview: ${previewItem?.name}`}
        description={`${previewItem?.role.toUpperCase()} · BAUST ID: ${previewItem?.baustId}`}
      >
        {previewItem && (
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-900/5 p-2 flex items-center justify-center min-h-[280px]">
              <img
                src={previewItem.documentPreviewUrl}
                alt="Document Preview"
                className="max-h-72 object-contain rounded-lg shadow-sm"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-900">Document Type: {previewItem.documentType}</p>
              <p className="text-slate-500">
                Department: {previewItem.department} · {previewItem.batch}
              </p>
              <p className="text-slate-500">Applicant Email: {previewItem.email}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" onClick={() => setPreviewItem(null)}>
                Close
              </Button>
              {previewItem.status === 'Pending' && (
                <>
                  <Button
                    variant="danger"
                    size="md"
                    onClick={() => {
                      setRejectItem(previewItem);
                      setPreviewItem(null);
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    isLoading={actionLoadingId === previewItem.id}
                    disabled={!!actionLoadingId}
                    onClick={async () => {
                      const ok = await handleApprove(previewItem.id);
                      if (ok) setPreviewItem(null);
                    }}
                  >
                    Approve & Verify
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* REJECT WITH REASON MODAL */}
      <Modal
        isOpen={!!rejectItem}
        onClose={() => setRejectItem(null)}
        title="Reject Profile Verification"
        description={`State official reason for rejecting ${rejectItem?.name} (${rejectItem?.baustId})`}
      >
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Quick Preset Reasons
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                'BAUST ID not found in registrar matriculation roll',
                'Batch or Department mismatch with academic records',
                'Uploaded document image is illegible or blurred',
                'Degree certificate verification could not be confirmed',
              ].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setRejectionReason(preset)}
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer border border-slate-200"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="Reason for Rejection (Visible to Applicant)"
            placeholder="e.g. Student ID does not correspond to the 2019 CSE matriculation roll or uploaded photo is illegible..."
            rows={4}
            required
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setRejectItem(null)}>
              Cancel
            </Button>
            <Button variant="danger" type="submit">
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
