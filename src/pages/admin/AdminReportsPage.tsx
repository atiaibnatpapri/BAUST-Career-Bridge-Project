/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  subscribeContributions,
  subscribeEvents,
  subscribeFirestoreMentorships,
  subscribeFirestoreUsers,
  subscribeJobApplications,
  subscribeJobs,
} from '../../services/firestorePortal';
import { subscribeKnowledgeSessions } from '../../services/careerBridgeService';
import { useAdminDeskStore } from '../../hooks/useAdminDeskStore';
import { useApp } from '../../context/AppContext';
import { formatLocalizedNumber } from '../../data/translations';
import {
  computeAlumniStats,
  computeLargestRemainderPercentages,
  normalizeDepartment,
} from '../../constants/baustDataModel';
import { Card } from '../../components/ui/Card';
import { Loader } from '../../components/ui/Loader';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#1D4ED8', '#15803D', '#EA580C', '#7E22CE', '#0F2A4A', '#C9A227'];

export const AdminReportsPage: React.FC = () => {
  const { t, language } = useApp();
  const { documentRequests } = useAdminDeskStore();
  const [users, setUsers] = useState<Record<string, any>[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [mentorships, setMentorships] = useState<any[]>([]);
  const [contributions, setContributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const u1 = subscribeFirestoreUsers((list) => {
      setUsers(list);
      setLoading(false);
    });
    const u2 = subscribeJobs(setJobs);
    const u3 = subscribeJobApplications({}, setApplications);
    const u4 = subscribeEvents(setEvents);
    const u5 = subscribeFirestoreMentorships({}, setMentorships);
    const u6 = subscribeContributions(setContributions);
    const u7 = subscribeKnowledgeSessions(setSessions);
    return () => {
      u1();
      u2();
      u3();
      u4();
      u5();
      u6();
      u7();
    };
  }, []);

  if (loading) {
    return <Loader label={t.common.loading} />;
  }

  const alumniStats = computeAlumniStats(users);

  const roleCounts = computeLargestRemainderPercentages(
    [
      { name: t.roles.student, value: users.filter((u) => u.role === 'student').length },
      { name: t.roles.alumni, value: alumniStats.verifiedApprovedAlumni },
      { name: t.roles.admin, value: users.filter((u) => u.role === 'admin').length },
      { name: t.roles.superAdmin, value: users.filter((u) => u.role === 'superAdmin').length },
    ].filter((x) => x.value > 0)
  );

  const sectorSlices = computeLargestRemainderPercentages(
    Object.entries(alumniStats.bySector).map(([name, value], idx) => ({
      name,
      value,
      color: COLORS[idx % COLORS.length],
    }))
  );

  const deptMap: Record<string, number> = {};
  users.forEach((u) => {
    const dept = normalizeDepartment(u.department);
    deptMap[dept] = (deptMap[dept] || 0) + 1;
  });
  const deptData = Object.keys(deptMap).map((dept) => ({ dept, members: deptMap[dept] }));

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200">
        <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[11px] font-bold">
          Live Firestore Analytics
        </span>
        <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight mt-1">
          {t.reports.title}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">{t.reports.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card className="p-4 border-slate-200">
          <p className="text-[10px] font-bold uppercase text-slate-400">{t.reports.totalUsers}</p>
          <p className="text-2xl font-black text-[#0F2A4A] mt-1">
            {formatLocalizedNumber(users.length, language)}
          </p>
        </Card>
        <Card className="p-4 border-slate-200">
          <p className="text-[10px] font-bold uppercase text-slate-400">{t.reports.verifiedAlumni}</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            {formatLocalizedNumber(alumniStats.verifiedApprovedAlumni, language)}
          </p>
        </Card>
        <Card className="p-4 border-slate-200">
          <p className="text-[10px] font-bold uppercase text-slate-400">{t.reports.pendingAlumni}</p>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {formatLocalizedNumber(alumniStats.pendingAlumni, language)}
          </p>
        </Card>
        <Card className="p-4 border-slate-200">
          <p className="text-[10px] font-bold uppercase text-slate-400">{t.reports.jobsPosted}</p>
          <p className="text-2xl font-black text-blue-700 mt-1">
            {formatLocalizedNumber(jobs.length, language)}
          </p>
        </Card>
        <Card className="p-4 border-slate-200">
          <p className="text-[10px] font-bold uppercase text-slate-400">{t.reports.applications}</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            {formatLocalizedNumber(applications.length, language)}
          </p>
        </Card>
        <Card className="p-4 border-slate-200">
          <p className="text-[10px] font-bold uppercase text-slate-400">{t.reports.mentorships}</p>
          <p className="text-2xl font-black text-indigo-700 mt-1">
            {formatLocalizedNumber(mentorships.length, language)}
          </p>
        </Card>
        <Card className="p-4 border-slate-200">
          <p className="text-[10px] font-bold uppercase text-slate-400">{t.reports.sessions}</p>
          <p className="text-2xl font-black text-orange-700 mt-1">
            {formatLocalizedNumber(sessions.length + events.length, language)}
          </p>
        </Card>
        <Card className="p-4 border-slate-200">
          <p className="text-[10px] font-bold uppercase text-slate-400">{t.reports.docRequests}</p>
          <p className="text-2xl font-black text-purple-700 mt-1">
            {formatLocalizedNumber(documentRequests.length, language)}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-[#0F2A4A]">{t.reports.accountsByRole}</h3>
          {roleCounts.length === 0 ? (
            <p className="text-xs text-slate-500 py-10 text-center">{t.reports.emptyChart}</p>
          ) : (
            <>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={roleCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75}>
                      {roleCounts.map((entry, idx) => (
                        <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any, _n: any, item: any) => [`${v} (${item?.payload?.percentage || 0}%)`, item?.payload?.name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {roleCounts.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg">
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="truncate">{item.name}</span>
                    </span>
                    <span className="font-bold text-slate-900 shrink-0">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card className="p-6 border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-[#0F2A4A]">{t.reports.alumniBySector}</h3>
          {sectorSlices.length === 0 ? (
            <p className="text-xs text-slate-500 py-10 text-center">{t.reports.emptyChart}</p>
          ) : (
            <>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sectorSlices} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={75}>
                      {sectorSlices.map((entry, idx) => (
                        <Cell key={entry.name} fill={entry.color || COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any, _n: any, item: any) => [`${v} (${item?.payload?.percentage || 0}%)`, item?.payload?.name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {sectorSlices.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg">
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color || COLORS[idx % COLORS.length] }} />
                      <span className="truncate">{item.name}</span>
                    </span>
                    <span className="font-bold text-slate-900 shrink-0">
                      {formatLocalizedNumber(item.value, language)} ({item.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card className="p-6 border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-[#0F2A4A]">{t.reports.membersByDept}</h3>
          {deptData.length === 0 ? (
            <p className="text-xs text-slate-500 py-10 text-center">{t.reports.emptyChart}</p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="dept" fontSize={11} />
                  <YAxis fontSize={11} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="members" fill="#EA580C" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <Card className="p-5 border-slate-200 text-xs text-slate-600">
        {language === 'bn' ? 'অ্যালামনাই অনুদান প্রতিশ্রুতি:' : 'Alumni Giving Back Pledges Logged:'}{' '}
        <strong>{formatLocalizedNumber(contributions.length, language)}</strong> (Total{' '}
        <strong>
          BDT {contributions.reduce((s, c) => s + (c.amountBdt || 0), 0).toLocaleString()}
        </strong>
        )
      </Card>
    </div>
  );
};
