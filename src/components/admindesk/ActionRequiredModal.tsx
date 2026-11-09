/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { AdminDeskRequest } from '../../types/admindesk';

interface ActionRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: AdminDeskRequest;
  onConfirmActionRequired: (reason: string) => void;
}

export const ActionRequiredModal: React.FC<ActionRequiredModalProps> = ({
  isOpen,
  onClose,
  request,
  onConfirmActionRequired
}) => {
  const [reason, setReason] = useState('Missing clearance slip from Department Head');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirmActionRequired(reason.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/70">
          <div className="flex items-center gap-2 text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-sm">Request More Information / Document</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <p className="text-slate-600">
            Pause processing on request <strong className="text-slate-900">#{request.id}</strong> and prompt <strong>{request.alumniName}</strong> to upload missing information.
          </p>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Specific Document or Action Needed
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Scanned copy of National ID card is blurry. Please re-upload a clear colored scan..."
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
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
              className="px-5 py-2 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 transition-colors shadow-xs"
            >
              Notify Applicant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
