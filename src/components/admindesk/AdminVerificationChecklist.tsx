/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, CheckSquare, Square, CheckCircle2 } from 'lucide-react';
import { AdminDeskRequest } from '../../types/admindesk';

interface AdminVerificationChecklistProps {
  request: AdminDeskRequest;
  onToggleChecklist: (key: keyof AdminDeskRequest['checklist'], value: boolean) => void;
}

export const AdminVerificationChecklist: React.FC<AdminVerificationChecklistProps> = ({
  request,
  onToggleChecklist
}) => {
  const allVerified = Object.values(request.checklist).every(Boolean);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-navy" />
          <h3 className="font-bold text-sm text-slate-900">
            Internal Verification Checklist
          </h3>
        </div>
        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
          allVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
        }`}>
          {Object.values(request.checklist).filter(Boolean).length} / 4 Verified
        </span>
      </div>

      <div className="space-y-2.5">
        {[
          { key: 'baustIdMatches' as const, label: 'BAUST Student ID matches registrar master enrollment records', sub: `Matched with ${request.baustId} (${request.department}, ${request.batch})` },
          { key: 'academicRecordFound' as const, label: 'Graduation CGPA and convocation ledger verified', sub: `Recorded CGPA ${request.cgpa.toFixed(2)} in Exam Database` },
          { key: 'paymentVerified' as const, label: 'Accounts Office payment receipt & transaction verified', sub: `${request.payment.method} TXN: ${request.payment.transactionId} (BDT ${request.payment.totalAmount})` },
          { key: 'documentsValid' as const, label: 'All uploaded clearance and supporting files authenticated', sub: `${request.uploadedDocuments.length} document(s) attached` }
        ].map((item) => {
          const checked = request.checklist[item.key];
          return (
            <div
              key={item.key}
              onClick={() => onToggleChecklist(item.key, !checked)}
              className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                checked
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
              }`}
            >
              <button type="button" className="mt-0.5 text-navy">
                {checked ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-300" />
                )}
              </button>
              <div>
                <div className={`text-xs font-bold ${checked ? 'text-emerald-950' : 'text-slate-800'}`}>
                  {item.label}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {item.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
