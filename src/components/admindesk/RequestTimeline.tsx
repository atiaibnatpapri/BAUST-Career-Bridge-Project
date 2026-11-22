/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Clock,
  AlertTriangle,
  XCircle,
  Check,
  User,
  RotateCcw,
} from 'lucide-react';
import { AdminDeskRequest } from '../../types/admindesk';
import { DOC_STAGES, DocumentStageRecord } from '../../constants/baustDataModel';
import { useApp } from '../../context/AppContext';

interface RequestTimelineProps {
  request: AdminDeskRequest;
  onReApply?: () => void;
  onReUpload?: () => void;
}

function formatStageTimestamp(ts?: string): string {
  if (!ts) return '';
  const ms = Date.parse(ts);
  if (!Number.isNaN(ms) && (ts.includes('T') || ts.includes('-'))) {
    return new Date(ms).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return ts;
}

export const RequestTimeline: React.FC<RequestTimelineProps> = ({
  request,
  onReApply,
  onReUpload,
}) => {
  const { language, t } = useApp();
  const isBn = language === 'bn';
  const isRejected = request.status === 'Rejected';
  const isCancelled = request.status === 'Cancelled';
  const isActionRequired = request.status === 'Action Required';

  const canonicalStages: DocumentStageRecord[] =
    Array.isArray(request.stages) && request.stages.length === DOC_STAGES.length
      ? request.stages
      : DOC_STAGES.map((def, idx) => {
          const legacy = request.timeline?.[idx];
          return {
            key: def.key,
            label: def.label,
            status: legacy?.completed
              ? 'done'
              : legacy?.isCurrent
              ? isRejected
                ? 'rejected'
                : 'current'
              : 'pending',
            completedAt: legacy?.completed ? legacy.timestamp : undefined,
            completedByName: legacy?.handledBy,
            note: legacy?.remarks,
          };
        });

  const currentIdx = canonicalStages.findIndex((s) => s.status === 'current');
  const activeStepNumber = isRejected
    ? canonicalStages.findIndex((s) => s.status === 'rejected') + 1 || (request.currentStageIndex ?? 1) + 1
    : currentIdx >= 0
    ? currentIdx + 1
    : DOC_STAGES.length;
  const completedCount = canonicalStages.filter((s) => s.status === 'done').length;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0F2A4A]" />
            {isBn ? 'লাইভ প্রক্রিয়াকরণ ও ডেলিভারি টাইমলাইন' : 'Live Processing & Dispatch Timeline'}
          </h3>
          <p className="text-xs text-slate-500">
            {isBn
              ? `${DOC_STAGES.length}টির মধ্যে ${completedCount}টি ধাপ সম্পন্ন`
              : `Step ${Math.min(activeStepNumber, DOC_STAGES.length)} of ${DOC_STAGES.length} • ${completedCount} completed`}
          </p>
        </div>

        <span
          className={`text-xs font-bold px-3 py-1 rounded-full border ${
            request.status === 'Delivered'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : request.status === 'Ready'
              ? 'bg-sky-50 text-sky-800 border-sky-300'
              : request.status === 'Processing' || request.status === 'Approved'
              ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
              : request.status === 'Action Required'
              ? 'bg-amber-50 text-amber-800 border-amber-300'
              : request.status === 'Rejected'
              ? 'bg-rose-50 text-rose-800 border-rose-300'
              : request.status === 'Cancelled'
              ? 'bg-slate-100 text-slate-600 border-slate-300'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          {request.status}
        </span>
      </div>

      {/* Action Required Banner */}
      {isActionRequired && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Action Required from Applicant
          </div>
          <p className="text-amber-800">
            {request.actionRequiredReason ||
              'The university administrative desk requires additional document verification to proceed.'}
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

      {/* Rejected Banner */}
      {isRejected && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <XCircle className="w-5 h-5 text-rose-600" />
            Request Rejected{request.rejectionReason ? ` (${request.rejectionReason})` : ''}
          </div>
          {request.rejectionMessage && (
            <p className="text-rose-800">{request.rejectionMessage}</p>
          )}
          {request.rejectedBy && (
            <p className="text-[11px] text-rose-700">
              Reviewed by {request.rejectedBy}
              {request.rejectedAt ? ` • ${formatStageTimestamp(request.rejectedAt)}` : ''}
            </p>
          )}
          {onReApply && (
            <button
              onClick={onReApply}
              className="mt-2 text-xs font-bold px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Re-apply with Corrected Info
            </button>
          )}
        </div>
      )}

      {/* Cancelled Banner */}
      {isCancelled && (
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300 text-slate-700 text-xs space-y-1">
          <div className="font-bold text-sm text-slate-900">Request Cancelled</div>
          <p>
            Cancelled by {request.cancelledBy || request.alumniName}
            {request.cancelledAt ? ` on ${formatStageTimestamp(request.cancelledAt)}` : ''}.
          </p>
        </div>
      )}

      {/* 6-Stage Canonical Stepper */}
      <div className="relative pl-7 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {canonicalStages.map((stage, idx) => {
          const def = DOC_STAGES[idx];
          const isDone = stage.status === 'done';
          const isStageRejected = stage.status === 'rejected';
          const isCurrent = stage.status === 'current' && !isCancelled && !isRejected;
          const stageLabel = isBn ? def.labelBn : def.label;
          const stageDesc = isBn ? def.descriptionBn : def.description;

          return (
            <div key={stage.key} className="relative">
              {/* Step Circle */}
              <div
                className={`absolute -left-7 top-0.5 w-6 h-6 rounded-full border-2 border-white ring-2 flex items-center justify-center text-[10px] font-bold transition-colors ${
                  isStageRejected
                    ? 'bg-rose-600 text-white ring-rose-200'
                    : isDone
                    ? 'bg-emerald-600 text-white ring-emerald-200'
                    : isCurrent
                    ? 'bg-[#0F2A4A] text-white ring-[#0F2A4A]/20 animate-pulse'
                    : 'bg-slate-100 text-slate-400 ring-slate-200'
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5" />
                ) : isStageRejected ? (
                  <XCircle className="w-3.5 h-3.5" />
                ) : (
                  idx + 1
                )}
              </div>

              {/* Stage Content */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-xs font-bold ${
                        isStageRejected
                          ? 'text-rose-700'
                          : isDone
                          ? 'text-slate-900'
                          : isCurrent
                          ? 'text-[#0F2A4A]'
                          : 'text-slate-400'
                      }`}
                    >
                      {stageLabel}
                    </h4>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        {isBn ? t.docStages.inProgress : 'In progress'}
                      </span>
                    )}
                    {isDone && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        {isBn ? 'সম্পন্ন' : 'Done'}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    {isDone && stage.completedAt
                      ? formatStageTimestamp(stage.completedAt)
                      : isStageRejected
                      ? stage.completedAt
                        ? formatStageTimestamp(stage.completedAt)
                        : 'Rejected'
                      : isCurrent
                      ? isBn
                        ? t.docStages.inProgress
                        : 'In progress'
                      : isBn
                      ? 'অপেক্ষমাণ'
                      : 'Pending'}
                  </span>
                </div>

                <p className={`text-[11px] ${isDone || isCurrent ? 'text-slate-500' : 'text-slate-400'}`}>
                  {stageDesc}
                </p>

                {stage.completedByName && (isDone || isStageRejected) && (
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-0.5">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>
                      {idx === 0 ? 'Submitted by' : isStageRejected ? 'Rejected by' : 'Completed by'}:{' '}
                      <strong className="text-slate-700">{stage.completedByName}</strong>
                    </span>
                  </div>
                )}

                {stage.note && (
                  <p
                    className={`text-xs p-2.5 rounded-xl border mt-1.5 leading-relaxed ${
                      isStageRejected
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : 'bg-slate-50 border-slate-100 text-slate-700'
                    }`}
                  >
                    {stage.note}
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
