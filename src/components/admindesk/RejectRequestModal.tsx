/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { XCircle, X, AlertTriangle } from 'lucide-react';
import { AdminDeskRequest } from '../../types/admindesk';

interface RejectRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: AdminDeskRequest;
  onConfirmReject: (reason: AdminDeskRequest['rejectionReason'], message: string) => void;
}

export const RejectRequestModal: React.FC<RejectRequestModalProps> = ({
  isOpen,
  onClose,
  request,
  onConfirmReject
}) => {
  const [reason, setReason] = useState<AdminDeskRequest['rejectionReason']>('Invalid documents');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onConfirmReject(reason, message.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/70">
          <div className="flex items-center gap-2 text-rose-800">
            <XCircle className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-sm">Reject Document Request</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-600">
            Rejecting request: <strong className="text-slate-900">#{request.id}</strong> by <strong>{request.alumniName}</strong> ({request.department})
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Primary Rejection Category
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            >
              <option value="Invalid documents">Invalid / Incomplete Documents Uploaded</option>
              <option value="Payment not verified">Payment not verified / Transaction ID mismatch</option>
              <option value="Record mismatch">BAUST Student ID / Academic Record Mismatch</option>
              <option value="Duplicate request">Duplicate Request Already Exists</option>
              <option value="Other">Other Discrepancy</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Detailed Reason to Applicant (Required)
            </label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain clearly why this request cannot be processed and what the alumni needs to fix when re-applying..."
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-rose-800 text-[11px] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>
              The applicant will be notified immediately in their notification bell and can re-apply in one click with corrected documents.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!message.trim()}
              className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
