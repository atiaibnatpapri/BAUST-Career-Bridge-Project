/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  Users, 
  GraduationCap, 
  FileText, 
  UserCheck, 
  Calendar, 
  TrendingUp, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';

import {
  AreaChart,
  Area,
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
  Legend
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { alumniList, studentList, serviceRequests, verifications, mentorshipRequests, approveVerification } = useApp();
  const [approvingId, setApprovingId] = React.useState<string | null>(null);

  const handleQuickApprove = async (id: string) => {
    setApprovingId(id);
    await approveVerification(id);
    setApprovingId(null);
  };

  const pendingVerifications = verifications.filter((v) => v.status === 'Pending').length;
  const pendingRequests = serviceRequests.filter((s) => s.status === 'Pending' || s.status === 'Under Review').length;

  // Chart 1: Registrations Over Time (Monthly trends)
  const registrationTrendData = [
    { month: 'May 2026', alumni: 120, students: 280 },
    { month: 'Jun 2026', alumni: 190, students: 410 },
    { month: 'Jul 2026', alumni: 280, students: 620 },
    { month: 'Aug 2026', alumni: 340, students: 780 },
    { month: 'Sep 2026', alumni: 480, students: 1040 },
    { month: 'Oct 2026', alumni: 610, students: 1390 },
  ];

  // Chart 2: Alumni by Job Sector (Pie Chart)
  const sectorCountMap: Record<string, number> = {};
  alumniList.forEach((a) => {
    sectorCountMap[a.sector] = (sectorCountMap[a.sector] || 0) + 1;
  });
  const sectorPieData = Object.keys(sectorCountMap).map((sector) => ({
    name: sector,
    value: sectorCountMap[sector],
  }));

  const SECTOR_COLORS = ['#0F2A4A', '#2E5E3E', '#C9A227', '#0284C7', '#64748B'];

  // Chart 3: Alumni by Batch (Bar Chart)
  const batchCountMap: Record<string, number> = {};
  alumniList.forEach((a) => {
    batchCountMap[a.batch] = (batchCountMap[a.batch] || 0) + 1;
  });
  const batchBarData = Object.keys(batchCountMap).map((batch) => ({
    batch,
    graduates: batchCountMap[batch],
  }));

  // Chart 4: Service Requests by Status
  const requestStatusMap: Record<string, number> = {
    'Pending': 0,
    'Under Review': 0,
    'Approved': 0,
    'Ready': 0,
    'Delivered': 0,
  };
  serviceRequests.forEach((r) => {
    if (requestStatusMap[r.status] !== undefined) {
      requestStatusMap[r.status] += 1;
    }
  });
  const requestStatusData = Object.keys(requestStatusMap).map((status) => ({
    status,
    count: requestStatusMap[status],
  }));

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight">
              BAUST Administration Executive Console
            </h1>
            <Badge variant="army">Registrar Office</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time verification queue, document dispatch monitoring, and alumni employment analytics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/verifications">
            <Button variant="primary" size="sm" leftIcon={<UserCheck className="w-4 h-4" />}>
              Review Verifications ({pendingVerifications})
            </Button>
          </Link>
          <Link to="/admin/service-requests">
            <Button variant="outline" size="sm" leftIcon={<FileText className="w-4 h-4" />}>
              Manage Documents ({pendingRequests})
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Alumni"
          value={alumniList.length * 65} // realistic representation scale
          subtitle="Across 8 departments"
          icon={<Users className="w-5 h-5" />}
          trend={{ value: '+14% MoM', isPositive: true }}
        />

        <StatCard
          title="Active Students"
          value="3,842"
          subtitle="Enrolled under Cantonment"
          icon={<GraduationCap className="w-5 h-5" />}
          iconBg="bg-[#2E5E3E]/10 text-[#2E5E3E]"
          trend={{ value: '+8% this term', isPositive: true }}
        />

        <StatCard
          title="Pending Verification"
          value={pendingVerifications}
          subtitle="Requires ID match"
          icon={<UserCheck className="w-5 h-5" />}
          iconBg="bg-amber-50 text-amber-700"
        />

        <StatCard
          title="Document Requests"
          value={serviceRequests.length}
          subtitle={`${pendingRequests} in review / prep`}
          icon={<FileText className="w-5 h-5" />}
          iconBg="bg-indigo-50 text-indigo-700"
        />

        <StatCard
          title="Mentorships"
          value={mentorshipRequests.length * 28}
          subtitle="Total sessions held"
          icon={<Calendar className="w-5 h-5" />}
          iconBg="bg-[#C9A227]/20 text-[#8C6B08]"
        />
      </div>

      {/* Charts Grid 1: Registrations Over Time + Alumni by Job Sector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Registrations Trend Chart (2 Cols) */}
        <Card className="lg:col-span-2 p-6 border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0F2A4A]">
                Platform Registrations Over Time
              </h3>
              <p className="text-xs text-slate-500">
                Verified student enrollments vs alumni activations (May - Oct 2026)
              </p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              +38% Rapid Growth
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={registrationTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E5E3E" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2E5E3E" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorAlumni" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F2A4A" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0F2A4A" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="students" name="Active Students" stroke="#2E5E3E" strokeWidth={2} fillOpacity={1} fill="url(#colorStudents)" />
                <Area type="monotone" dataKey="alumni" name="Verified Alumni" stroke="#0F2A4A" strokeWidth={2} fillOpacity={1} fill="url(#colorAlumni)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Alumni by Job Sector Donut Chart (1 Col) */}
        <Card className="p-6 border-slate-200 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#0F2A4A]">Alumni Employment by Sector</h3>
            <p className="text-xs text-slate-500">Distribution across Government, Private, and Abroad</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {sectorPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            {sectorPieData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: SECTOR_COLORS[idx % SECTOR_COLORS.length] }}
                />
                <span className="text-slate-600 truncate">{item.name}</span>
                <span className="font-bold text-slate-900 ml-auto tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* Charts Grid 2: Alumni by Batch + Document Requests by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Alumni by Batch Bar Chart */}
        <Card className="p-6 border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0F2A4A]">Alumni Distribution by Batch</h3>
              <p className="text-xs text-slate-500">Registered graduates across 2015 - 2024 cohorts</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={batchBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="batch" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="graduates" name="Graduates Registered" fill="#0F2A4A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Requests by Status Bar Chart */}
        <Card className="p-6 border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0F2A4A]">Administrative Document Requests</h3>
              <p className="text-xs text-slate-500">Current pipeline volume by fulfillment phase</p>
            </div>
            <Link to="/admin/service-requests" className="text-xs font-bold text-[#0F2A4A] hover:underline">
              View all ({serviceRequests.length})
            </Link>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={requestStatusData} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="status" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Applications" fill="#2E5E3E" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      {/* Pending Verifications Direct Action Table */}
      <Card className="p-6 border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#0F2A4A]">Pending Registration Verifications</h3>
              <Badge variant="pending" size="sm">
                {pendingVerifications} Awaiting Action
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Recent user registrations requiring ID and matriculation review
            </p>
          </div>
          <Link to="/admin/verifications">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View Full Queue ({verifications.length})
            </Button>
          </Link>
        </div>

        {verifications.filter((v) => v.status === 'Pending').length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No pending registration requests in queue. All applicants are verified.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                  <th className="py-2.5 px-3">Applicant</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">BAUST ID / Dept</th>
                  <th className="py-2.5 px-3">Submitted</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {verifications
                  .filter((v) => v.status === 'Pending')
                  .slice(0, 5)
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{item.email}</p>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant={item.role === 'student' ? 'army' : 'navy'} size="sm">
                          {item.role.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-[#0F2A4A]">{item.baustId}</span>
                        <p className="text-[11px] text-slate-500">{item.department} · {item.batch}</p>
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px]">
                        {item.submittedAt}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs py-1 px-2.5"
                            isLoading={approvingId === item.id}
                            disabled={!!approvingId}
                            onClick={() => handleQuickApprove(item.id)}
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          >
                            Approve
                          </Button>
                          <Link to="/admin/verifications">
                            <Button variant="outline" size="sm" className="text-xs py-1 px-2.5">
                              Review
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

    </div>
  );
};
