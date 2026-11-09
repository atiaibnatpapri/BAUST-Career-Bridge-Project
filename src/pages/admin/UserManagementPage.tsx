/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { UserRole } from '../../types';
import { 
  Users, 
  Search, 
  Ban, 
  CheckCircle, 
  ShieldCheck, 
  Eye, 
  Lock, 
  Unlock,
  GraduationCap,
  Briefcase
} from 'lucide-react';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'alumni';
  department: string;
  batch: string;
  avatar: string;
  status: 'Active' | 'Blocked';
  isVerified: boolean;
}

export const UserManagementPage: React.FC = () => {
  const { alumniList, studentList, verifications, addToast } = useApp();

  // Combine alumni, students, and newly registered accounts from verifications
  const [userList, setUserList] = useState<ManagedUser[]>(() => {
    const existingEmails = new Set([...alumniList.map((a) => a.email), ...studentList.map((s) => s.email)]);
    const dynamicFromVerifications: ManagedUser[] = verifications
      .filter((v) => !existingEmails.has(v.email))
      .map((v) => ({
        id: v.userId || v.id,
        name: v.name,
        email: v.email,
        role: v.role,
        department: v.department,
        batch: v.batch,
        avatar: v.role === 'student'
          ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        status: (v.status === 'Approved' ? 'Active' : v.status === 'Rejected' ? 'Blocked' : 'Active') as 'Active' | 'Blocked',
        isVerified: v.status === 'Approved',
      }));

    const combined: ManagedUser[] = [
      ...dynamicFromVerifications,
      ...alumniList.map((a) => ({
        id: a.id,
        name: a.name,
        email: a.email,
        role: 'alumni' as const,
        department: a.department,
        batch: a.batch,
        avatar: a.avatar,
        status: 'Active' as const,
        isVerified: a.isVerified ?? true,
      })),
      ...studentList.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        role: 'student' as const,
        department: s.department,
        batch: s.batch,
        avatar: s.avatar,
        status: 'Active' as const,
        isVerified: s.isVerified ?? true,
      })),
    ];
    return combined;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'student' | 'alumni'>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);

  const handleToggleBlock = (userId: string) => {
    setUserList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === 'Active' ? 'Blocked' : 'Active';
          addToast(
            newStatus === 'Blocked' ? 'warning' : 'success',
            `User ${newStatus}`,
            `${u.name} has been ${newStatus.toLowerCase()} from accessing the platform.`
          );
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const filteredUsers = userList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const matchesDept = departmentFilter === 'All' || u.department === departmentFilter;

    return matchesSearch && matchesRole && matchesDept;
  });

  const columns = [
    {
      header: 'Member',
      cell: (item: ManagedUser) => (
        <div className="flex items-center gap-3">
          <Avatar src={item.avatar} name={item.name} size="sm" isVerified={item.isVerified} />
          <div>
            <p className="font-bold text-xs text-slate-900">{item.name}</p>
            <p className="text-[11px] text-slate-500 font-mono">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role & Dept',
      cell: (item: ManagedUser) => (
        <div>
          <Badge variant={item.role === 'student' ? 'army' : 'navy'} size="sm">
            {item.role.toUpperCase()}
          </Badge>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {item.department} · {item.batch}
          </p>
        </div>
      ),
    },
    {
      header: 'Account Status',
      cell: (item: ManagedUser) => (
        <Badge variant={item.status === 'Active' ? 'approved' : 'rejected'}>
          {item.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      align: 'right' as const,
      cell: (item: ManagedUser) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs py-1"
            onClick={() => setSelectedUser(item)}
          >
            Details
          </Button>
          <Button
            variant={item.status === 'Active' ? 'outline' : 'secondary'}
            size="sm"
            className={`text-xs py-1 ${
              item.status === 'Active' ? 'text-rose-600 hover:bg-rose-50 border-rose-200' : ''
            }`}
            onClick={() => handleToggleBlock(item.id)}
            leftIcon={item.status === 'Active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          >
            {item.status === 'Active' ? 'Block' : 'Unblock'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight">
            User Account Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer verified student and alumni directory accounts, access privileges, and permissions
          </p>
        </div>

        <Badge variant="navy">Total Accounts: {userList.length}</Badge>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="w-full bg-white border border-slate-300 text-xs font-semibold rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F2A4A]"
          >
            <option value="All">All User Roles</option>
            <option value="student">Current Students</option>
            <option value="alumni">Verified Alumni</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full bg-white border border-slate-300 text-xs font-semibold rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F2A4A]"
          >
            <option value="All">All Departments</option>
            {['CSE', 'EEE', 'CE', 'ME', 'IPE', 'Textile', 'BBA', 'English'].map((d) => (
              <option key={d} value={d}>
                Dept of {d}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* User Table */}
      <Table
        columns={columns}
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        emptyMessage="No users match your criteria."
      />

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="User Record Summary"
        description={`${selectedUser?.name} (${selectedUser?.role.toUpperCase()})`}
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <Avatar src={selectedUser.avatar} name={selectedUser.name} size="md" isVerified />
              <div>
                <p className="font-bold text-xs text-slate-900">{selectedUser.name}</p>
                <p className="text-[11px] text-slate-500 font-mono">{selectedUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Role</span>
                <span className="font-bold text-slate-800 capitalize">{selectedUser.role}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
                <span className="font-bold text-slate-800">{selectedUser.department}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Batch</span>
                <span className="font-bold text-slate-800">{selectedUser.batch}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                <span className={`font-bold ${selectedUser.status === 'Active' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {selectedUser.status}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button
                variant={selectedUser.status === 'Active' ? 'danger' : 'secondary'}
                size="sm"
                onClick={() => {
                  handleToggleBlock(selectedUser.id);
                  setSelectedUser(null);
                }}
              >
                {selectedUser.status === 'Active' ? 'Block Access' : 'Restore Access'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
