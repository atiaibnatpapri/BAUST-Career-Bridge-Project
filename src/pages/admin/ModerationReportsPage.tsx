/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { TextArea } from '../../components/ui/Input';
import { ReportEntity } from '../../constants/baustDataModel';
import {
  cascadeDeleteUserResources,
  resolveModerationReport,
  subscribeReports,
} from '../../services/careerBridgeService';
import { ShieldAlert, CheckCircle2, Ban, Eye } from 'lucide-react';

export const ModerationReportsPage: React.FC = () => {
  const { addToast, language } = useApp();
  const { firebaseUser, userProfile } = useAuth();
  const isBn = language === 'bn';
  const isSuperAdmin = userProfile?.role === 'superAdmin';

  const [reports, setReports] = useState<ReportEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'All' | ReportEntity['status']>('All');
  const [selectedReport, setSelectedReport] = useState<ReportEntity | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLoading(true);
    return subscribeReports(
      {},
      (items) => {
        setReports(items);
        setLoading(false);
      },
      () => setLoading(false)
    );
  }, []);

  const handleResolve = async (status: 'Reviewed' | 'Action Taken' | 'Dismissed', suspendTarget = false) => {
    if (!selectedReport || !firebaseUser || !userProfile) return;
    setBusy(true);
    try {
      await resolveModerationReport({
        report: selectedReport,
        status,
        reviewerId: firebaseUser.uid,
        reviewerName: userProfile.name,
        resolutionNote: resolutionNote.trim() || `Marked as ${status}`,
      });

      if (suspendTarget && isSuperAdmin && selectedReport.targetType === 'user') {
        await cascadeDeleteUserResources({
          targetUid: selectedReport.targetId,
          mode: 'suspend',
        });
      }

      addToast('success', isBn ? 'রিপোর্ট আপডেট হয়েছে' : 'Report Updated', `${selectedReport.targetName} · ${status}`);
      setSelectedReport(null);
      setResolutionNote('');
    } catch (err: any) {
      addToast('error', isBn ? 'ত্রুটি' : 'Error', err?.message || 'Unable to update report.');
    } finally {
      setBusy(false);
    }
  };

  const filtered =
    filterStatus === 'All' ? reports : reports.filter((r) => r.status === filterStatus);

  return (
    <div className="space-y-6">
      <div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200">
          <ShieldAlert className="w-3.5 h-3.5" />
          {isBn ? 'সেফটি ও মডারেশন কিউ' : 'FR-19 · User & Content Moderation'}
        </span>
        <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight mt-1">
          {isBn ? 'রিপোর্ট ও মডারেশন ব্যবস্থাপনা' : 'Moderation & Safety Reports'}
        </h1>
        <p className="text-xs text-slate-600 mt-0.5">
          {isBn
            ? 'শিক্ষার্থী ও অ্যালামনাইদের দাখিল করা প্রোফাইল ও কনটেন্ট রিপোর্ট পর্যালোচনা করুন।'
            : 'Review user-submitted profile or content reports and enforce campus governance standards.'}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {(['All', 'Pending', 'Reviewed', 'Action Taken', 'Dismissed'] as const).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
              filterStatus === st
                ? 'bg-[#0F2A4A] text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {loading ? (
        <Card className="p-8 text-center text-xs text-slate-500">Loading reports...</Card>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center space-y-2 border-dashed">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <p className="text-sm font-bold text-slate-700">
            {isBn ? 'কোনো মডারেশন রিপোর্ট পাওয়া যায়নি' : 'No moderation reports matching filter'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((rep) => (
            <Card key={rep.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-slate-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      rep.status === 'Pending'
                        ? 'bg-amber-100 text-amber-800'
                        : rep.status === 'Action Taken'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {rep.status}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{rep.targetName}</span>
                  <span className="text-[11px] text-slate-500">({rep.reason})</span>
                </div>
                <p className="text-xs text-slate-600">{rep.details}</p>
                <p className="text-[11px] text-slate-400">
                  {isBn ? 'রিপোর্টকারী:' : 'Reported by:'} {rep.reporterName}
                  {rep.resolutionNote ? ` · Note: ${rep.resolutionNote}` : ''}
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                leftIcon={<Eye className="w-3.5 h-3.5" />}
                onClick={() => {
                  setSelectedReport(rep);
                  setResolutionNote(rep.resolutionNote || '');
                }}
              >
                {isBn ? 'পর্যালোচনা করুন' : 'Review Report'}
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
        title={isBn ? 'মডারেশন সিদ্ধান্ত' : 'Review Moderation Report'}
      >
        {selectedReport && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <p>
                <strong>Target:</strong> {selectedReport.targetName} ({selectedReport.targetType})
              </p>
              <p>
                <strong>Reason:</strong> {selectedReport.reason}
              </p>
              <p className="text-slate-600">{selectedReport.details}</p>
            </div>

            <TextArea
              label={isBn ? 'সিদ্ধান্ত ও মন্তব্য' : 'Moderator Resolution Note'}
              rows={3}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
            />

            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" disabled={busy} onClick={() => void handleResolve('Dismissed')}>
                {isBn ? 'খারিজ করুন' : 'Dismiss'}
              </Button>
              <Button variant="primary" disabled={busy} onClick={() => void handleResolve('Reviewed')}>
                {isBn ? 'পর্যালোচিত' : 'Mark Reviewed'}
              </Button>
              {isSuperAdmin && selectedReport.targetType === 'user' && (
                <Button
                  variant="danger"
                  disabled={busy}
                  leftIcon={<Ban className="w-3.5 h-3.5" />}
                  onClick={() => void handleResolve('Action Taken', true)}
                >
                  {isBn ? 'ব্যবহারকারী স্থগিত করুন' : 'Suspend User'}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
