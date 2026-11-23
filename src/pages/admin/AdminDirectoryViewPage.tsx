/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { subscribeFirestoreUsers } from '../../services/firestorePortal';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Loader } from '../../components/ui/Loader';
import { BAUST_DEPARTMENTS } from '../../constants/baustDataModel';
import { Search, Users, AlertCircle, Lock } from 'lucide-react';

export const AdminDirectoryViewPage: React.FC = () => {
  const [users, setUsers] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'alumni'>('all');
  const [deptFilter, setDeptFilter] = useState('All');

  useEffect(() => {
    setLoading(true);
    return subscribeFirestoreUsers(
      (list) => {
        setUsers(list.filter((u) => u.role === 'student' || u.role === 'alumni'));
        setLoading(false);
      },
      (err) => {
        setErrorMsg(err.message);
        setLoading(false);
      }
    );
  }, []);

  const filtered = users.filter((u) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.baustId || '').toLowerCase().includes(q);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesDept = deptFilter === 'All' || u.department === deptFilter;
    return matchesSearch && matchesRole && matchesDept;
  });

  if (loading) {
    return <Loader label="Loading Students & Alumni directory..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-orange-100">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
            View-Only Directory
          </span>
          <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight mt-1">
            Students & Alumni Directory Lists
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Read-only registry of registered students and alumni. Account approval & suspension belong to Super Admin.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          Read-Only View ({filtered.length})
        </span>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <Card className="p-4 border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search by name, email, or BAUST ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="w-full min-h-[44px] bg-white border border-slate-300 text-xs font-semibold rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/35 focus:border-[#0F2A4A]"
          >
            <option value="all">Students & Alumni</option>
            <option value="student">Students Only</option>
            <option value="alumni">Alumni Only</option>
          </select>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full min-h-[44px] bg-white border border-slate-300 text-xs font-semibold rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/35 focus:border-[#0F2A4A]"
          >
            <option value="All">All Departments</option>
            {BAUST_DEPARTMENTS.map((d) => (
              <option key={d.code} value={d.code}>
                {d.code}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center space-y-2 border-dashed border-slate-300">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No members match current filters</p>
        </Card>
      ) : (
        <Card className="overflow-hidden border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 z-10 bg-slate-50">
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">BAUST ID & Dept</th>
                  <th className="py-3 px-4">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => (
                  <tr key={u.id} className="even:bg-slate-50/40 hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 max-w-[240px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar src={u.avatar} name={u.name || 'User'} size="sm" isVerified={Boolean(u.isVerified)} />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate" title={u.name || 'BAUST Member'}>
                            {u.name || 'BAUST Member'}
                          </p>
                          <p className="text-xs text-slate-500 font-mono truncate" title={u.email}>
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={u.role === 'alumni' ? 'army' : 'in-progress'} size="sm">
                        {(u.role || 'student').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-[#0F2A4A] tabular-nums">{u.baustId || '—'}</span>
                      <p className="text-xs text-slate-500">
                        {u.department || 'CSE'} · {u.batch || ''}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          u.verificationStatus === 'approved'
                            ? 'approved'
                            : u.verificationStatus === 'rejected'
                            ? 'rejected'
                            : 'pending'
                        }
                        size="sm"
                      >
                        {u.verificationStatus || 'pending'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
