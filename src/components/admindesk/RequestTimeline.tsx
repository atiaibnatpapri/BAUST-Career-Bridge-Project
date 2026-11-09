/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Check, 
  User, 
  FileText,
  RotateCcw
} from 'lucide-react';
import { AdminDeskRequest } from '../../types/admindesk';

interface RequestTimelineProps {
  request: AdminDeskRequest;
  onReApply?: () => void;
  onReUpload?: () => void;
}

export const RequestTimeline: React.FC<RequestTimelineProps> = ({
  request,
  onReApply,
  onReUpload
}) => {
  const isRejected = request.status === 'Rejected';
  const isActionRequired = request.status === 'Action Required';
  const isCancelled = request.status === 'Cancelled';

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-navy" />
            Live Processing & Dispatch Timeline
          </h3>
          <p className="text-xs text-slate-500">
            Real-time stage tracking stamped by BAUST exam controller staff
          </p>
        </div>

        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
          request.status === 'Delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
          request.status === 'Ready' ? 'bg-sky-50 text-sky-800 border-sky-300' :
          request.status === 'Approved' ? 'bg-indigo-50 text-indigo-800 border-indigo-300' :
          request.status === 'Processing' ? 'bg-blue-50 text-blue-800 border-blue-300' :
          request.status === 'Action Required' ? 'bg-amber-50 text-amber-800 border-amber-300' :
          request.status === 'Rejected' ? 'bg-rose-50 text-rose-800 border-rose-300' :
          request.status === 'Cancelled' ? 'bg-slate-100 text-slate-600 border-slate-300' :
          'bg-slate-100 text-slate-800 border-slate-200'
        }`}>
          Status: {request.status}
        </span>
      </div>

      {/* Special Branch: Action Required Banner */}
      {isActionRequired && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Action Required from Applicant
          </div>
          <p className="text-amber-800">
            {request.actionRequiredReason || 'The university administrative desk requires additional document verification to proceed.'}
          </p>
          {onReUpload && (
            <button
              onClick={onReUpload}
              className="mt-2 text-xs font-bold px-4 py-2 rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-xs"
            >
              Upload Missing Document
            </button>
          )}
        </div>
      )}

      {/* Special Branch: Rejected Banner with Re-Apply */}
      {isRejected && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <XCircle className="w-5 h-5 text-rose-600" />
            Request Could Not Be Approved ({request.rejectionReason})
          </div>
          <p className="text-rose-800">
            {request.rejectionMessage || 'Discrepancy found between request details and institutional archives.'}
          </p>
          {onReApply && (
            <button
              onClick={onReApply}
              className="mt-2 text-xs font-bold px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Re-apply with Corrected Info
            </button>
          )}
        </div>
      )}

      {/* Timeline Steps List */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {request.timeline.map((item, idx) => {
          const isDone = item.completed;
          const isCurrent = item.isCurrent;

          return (
            <div key={idx} className="relative group">
              {/* Circle Marker */}
              <div
                className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white ring-2 flex items-center justify-center ${
                  isRejected && idx === request.timeline.length - 1
                    ? 'bg-rose-600 ring-rose-200'
                    : isActionRequired && idx === request.timeline.length - 1
                    ? 'bg-amber-500 ring-amber-200 animate-pulse'
                    : isDone
                    ? 'bg-emerald-600 ring-emerald-200'
                    : isCurrent
                    ? 'bg-navy ring-navy/20 animate-pulse'
                    : 'bg-slate-200 ring-slate-100'
                }`}
              >
                {isDone && <Check className="w-2.5 h-2.5 text-white" />}
              </div>

              {/* Content */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <h4
                    className={`text-xs font-bold ${
                      isDone
                        ? 'text-slate-900'
                        : isCurrent
                        ? 'text-navy'
                        : 'text-slate-400'
                    }`}
                  >
                    {item.step}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {item.timestamp}
                  </span>
                </div>

                {item.handledBy && (
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>Handled by: <strong className="text-slate-700">{item.handledBy}</strong></span>
                  </div>
                )}

                {item.remarks && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2 leading-relaxed">
                    "{item.remarks}"
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
