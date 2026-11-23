/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { buildChatLink } from '../../constants/baustDataModel';
import { subscribeFirestoreUsers } from '../../services/firestorePortal';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loader } from '../../components/ui/Loader';
import { BAUST_DEPARTMENTS } from '../../constants/baustDataModel';
import { toList } from '../../utils/utils';
import { Users, Search, MessageSquare, GraduationCap, AlertCircle } from 'lucide-react';

export const AlumniConnectStudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { openOrCreateConversation } = useApp();
  const [users, setUsers] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  useEffect(() => {
    setLoading(true);
    return subscribeFirestoreUsers(
      (list) => {
        setUsers(
          list.filter(
            (u) =>
              u.role === 'student' &&
              (u.verificationStatus === 'approved' || u.isVerified === true) &&
              !u.suspended
          )
        );
        setLoading(false);
      },
      (err) => {
        setErrorMsg(err.message);
        setLoading(false);
      }
    );
  }, []);

  const filtered = users.filter((stu) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (stu.name || '').toLowerCase().includes(q) ||
      (stu.careerGoal || '').toLowerCase().includes(q) ||
      (stu.baustId || '').toLowerCase().includes(q);
    const matchesDept = deptFilter === 'All' || stu.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  if (loading) {
    return <Loader label="Loading verified BAUST students..." />;
  }

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-emerald-100">
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
          Alumni-Student Outreach
        </span>
        <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight mt-1">
          Connect with BAUST Students
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Discover approved undergraduates seeking mentorship, project guidance, and internship referrals
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <Card className="p-4 border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            placeholder="Search student name, BAUST ID, or career goal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full bg-white border border-slate-300 text-xs font-semibold rounded-xl px-3 py-2.5 text-slate-800"
          >
            <option value="All">All Departments</option>
            {BAUST_DEPARTMENTS.map((d) => (
              <option key={d.code} value={d.code}>
                Dept of {d.code}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center space-y-2 border-dashed border-slate-300">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No verified students found</p>
          <p className="text-xs text-slate-500">Approved student profiles will appear here automatically.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((stu) => (
            <Card key={stu.id} className="p-5 border-slate-200 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar src={stu.avatar} name={stu.name || 'Student'} size="md" isVerified />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{stu.name}</h3>
                    <p className="text-xs text-slate-500">
                      {stu.department || 'CSE'} · {stu.batch || 'BAUST'}
                    </p>
                    <p className="text-[11px] font-mono text-emerald-700 font-semibold">
                      ID: {stu.baustId || stu.studentId || '—'}
                    </p>
                  </div>
                </div>

                {stu.careerGoal && (
                  <p className="text-xs text-slate-600 line-clamp-2">
                    <GraduationCap className="w-3.5 h-3.5 inline mr-1 text-emerald-700" />
                    {stu.careerGoal}
                  </p>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {toList(stu.interests)
                    .slice(0, 4)
                    .map((tag) => (
                      <Badge key={tag} variant="neutral" size="sm">
                        {tag}
                      </Badge>
                    ))}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                onClick={async () => {
                  const convId = await openOrCreateConversation(stu.id, 'directory');
                  navigate(buildChatLink('alumni', convId));
                }}
              >
                Message Student
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
