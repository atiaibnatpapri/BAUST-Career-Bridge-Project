/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { subscribeActivityLogs } from '../../services/firestorePortal';
import { ActivityLogItem } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Loader } from '../../components/ui/Loader';
import { Activity, AlertCircle } from 'lucide-react';

export const SuperAdminActivityPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    return subscribeActivityLogs(
      (items) => {
        setLogs(items);
        setLoading(false);
      },
      (err) => {
        setErrorMsg(err.message);
        setLoading(false);
      }
    );
  }, []);

  if (loading) {
    return <Loader label="Loading system activity logs..." />;
  }

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-purple-100">
        <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold">
          Audit Trail
        </span>
        <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight mt-1">
          System Activity Overview
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Chronological Firestore log of registration approvals, rejections, suspensions, and seeding events
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {logs.length === 0 ? (
        <Card className="p-12 text-center space-y-2 border-dashed border-slate-300">
          <Activity className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No activity events recorded yet</p>
        </Card>
      ) : (
        <Card className="divide-y divide-slate-100 border-slate-200">
          {logs.map((log) => (
            <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="navy" size="sm">
                    {log.action}
                  </Badge>
                  <span className="font-bold text-slate-900">{log.actorName}</span>
                  <span className="text-slate-400">({log.actorRole})</span>
                </div>
                <p className="text-slate-600">{log.details}</p>
              </div>
              <span className="text-[11px] text-slate-400 font-mono shrink-0">{log.createdAtLabel}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};
