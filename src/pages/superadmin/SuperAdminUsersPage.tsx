/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { logPortalActivity, subscribeFirestoreUsers } from '../../services/firestorePortal';
import {
  cascadeDeleteUserResources,
  toggleUserFeaturedStatus,
  toggleVerifiedAlumniBadge,
} from '../../services/careerBridgeService';
import { isDemoAccountEmail } from '../../config/demoConfig';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Loader } from '../../components/ui/Loader';
import { Search, Users, Lock, Unlock, AlertCircle, ShieldCheck, Star, Trash2 } from 'lucide-react';

export const SuperAdminUsersPage: React.FC = () => {
  const { userProfile } = useAuth();
  const { addToast } = useApp();

  const [users, setUsers] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    setLoading(true);
    return subscribeFirestoreUsers(
      (list) => {
        setUsers(list);
        setLoading(false);
      },
      (err) => {
        setErrorMsg(err.message);
        setLoading(false);
      }
    );
  }, []);

  const isAccountProtected = (target: Record<string, any>): boolean => {
    const targetIsDemo = Boolean(target.isDemo) || isDemoAccountEmail(target.email);
    return Boolean(target.id === userProfile?.id || target.role === 'superAdmin' || targetIsDemo);
  };

  const handleToggleSuspend = async (target: Record<string, any>) => {
    if (!userProfile) return;
    if (isAccountProtected(target)) {
      addToast('warning', 'Protected Account', 'Super Admin and Demo accounts are protected and cannot be suspended.');
      return;
    }

    const nextSuspended = !Boolean(target.suspended);
    setUpdatingUid(target.id);
    try {
      if (nextSuspended) {
        await cascadeDeleteUserResources({
          targetUid: target.id,
          targetEmail: target.email,
          baustId: target.baustId,
          mode: 'suspend',
        });
      } else {
        await updateDoc(doc(db, 'users', target.id), {
          suspended: false,
          updatedAt: serverTimestamp(),
        });
      }
      await logPortalActivity({
        actorId: userProfile.id,
        actorName: userProfile.name,
        actorRole: 'superAdmin',
        action: nextSuspended ? 'SUSPEND_USER' : 'REACTIVATE_USER',
        targetType: 'user',
        targetId: target.id,
        details: `${nextSuspended ? 'Suspended' : 'Reactivated'} ${target.name} (${target.role})`,
        isDemo: Boolean(userProfile.isDemo),
      });
      addToast(
        nextSuspended ? 'warning' : 'success',
        nextSuspended ? 'Account Suspended' : 'Account Reactivated',
        `${target.name} has been ${nextSuspended ? 'suspended' : 'restored'}.`
      );
    } catch (err: any) {
      addToast('error', 'Action Failed', err?.message || 'Permission denied.');
    } finally {
      setUpdatingUid(null);
    }
  };

  const handleToggleVerifiedBadge = async (target: Record<string, any>) => {
    if (!userProfile || isAccountProtected(target)) return;
    const nextBadge = !Boolean(target.verifiedAlumniBadge);
    setUpdatingUid(target.id);
    try {
      await toggleVerifiedAlumniBadge({
        targetUid: target.id,
        targetName: target.name || 'Alumni',
        targetEmail: target.email,
        nextBadge,
        actorUid: userProfile.id,
        actorName: userProfile.name,
      });
      addToast(
        'success',
        nextBadge ? 'Verified Badge Granted' : 'Verified Badge Removed',
        `${target.name}'s Verified Alumni trust badge has been updated.`
      );
    } catch (err: any) {
      addToast('error', 'Update Failed', err?.message || 'Permission denied.');
    } finally {
      setUpdatingUid(null);
    }
  };

  const handleToggleFeatured = async (target: Record<string, any>) => {
    if (!userProfile || isAccountProtected(target)) return;
    const nextFeatured = !Boolean(target.isFeatured);
    setUpdatingUid(target.id);
    try {
      await toggleUserFeaturedStatus({
        targetUid: target.id,
        targetName: target.name || 'Alumni',
        targetEmail: target.email,
        nextFeatured,
        actorUid: userProfile.id,
        actorName: userProfile.name,
        actorRole: 'superAdmin',
      });
      addToast(
        'success',
        nextFeatured ? 'Alumni Featured' : 'Featured Removed',
        `${target.name} ${nextFeatured ? 'is now featured on Landing & Directory' : 'removed from Featured showcase'}.`
      );
    } catch (err: any) {
      addToast('error', 'Update Failed', err?.message || 'Permission denied.');
    } finally {
      setUpdatingUid(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userProfile || !deleteTarget) return;
    if (isAccountProtected(deleteTarget)) {
      addToast('warning', 'Protected Account', 'Super Admin and Demo accounts cannot be deleted.');
      setDeleteTarget(null);
      return;
    }

    setUpdatingUid(deleteTarget.id);
    try {
      await cascadeDeleteUserResources({
        targetUid: deleteTarget.id,
        targetEmail: deleteTarget.email,
        baustId: deleteTarget.baustId,
        mode: 'delete',
      });
      await logPortalActivity({
        actorId: userProfile.id,
        actorName: userProfile.name,
        actorRole: 'superAdmin',
        action: 'DELETE_USER_CASCADE',
        targetType: 'user',
        targetId: deleteTarget.id,
        details: `Deleted ${deleteTarget.name} (${deleteTarget.role}) and closed dependent jobs/slots`,
        isDemo: Boolean(userProfile.isDemo),
      });
      addToast('info', 'User & Dependent Records Removed', `${deleteTarget.name} was deleted cleanly.`);
      setDeleteTarget(null);
    } catch (err: any) {
      addToast('error', 'Delete Failed', err?.message || 'Could not remove user record.');
    } finally {
      setUpdatingUid(null);
    }
  };

  const filtered = users.filter((u) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.baustId || '').toLowerCase().includes(q);
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return <Loader label="Loading all registered accounts..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-purple-100">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold">
            User Governance
          </span>
          <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight mt-1">
            Manage All Platform Users
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Grant Verified Alumni &amp; Featured badges, suspend accounts, or remove invalid profiles cleanly
          </p>
        </div>

        <Badge variant="navy">Total Users: {users.length}</Badge>
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
            placeholder="Search by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-white border border-slate-300 text-xs font-semibold rounded-xl px-3 py-2.5 text-slate-800"
          >
            <option value="All">All Roles</option>
            <option value="student">Student</option>
            <option value="alumni">Alumni</option>
            <option value="admin">Admin</option>
            <option value="superAdmin">Super Admin</option>
          </select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center space-y-2 border-dashed border-slate-300">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No users match your filter</p>
        </Card>
      ) : (
        <Card className="overflow-hidden border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Approval Status</th>
                  <th className="py-3 px-4">Standing</th>
                  <th className="py-3 px-4 text-right">Governance Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => {
                  const isSuspended = Boolean(u.suspended);
                  const isDemoUser = Boolean(u.isDemo) || isDemoAccountEmail(u.email);
                  const isProtected = u.role === 'superAdmin' || u.id === userProfile?.id || isDemoUser;
                  const isApprovedAlumni = u.role === 'alumni' && u.verificationStatus === 'approved';
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={u.avatar} name={u.name || 'User'} size="sm" isVerified={Boolean(u.isVerified)} />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-bold text-slate-900">{u.name || 'User'}</p>
                              {isDemoUser && (
                                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                                  DEMO
                                </span>
                              )}
                              {Boolean(u.verifiedAlumniBadge) && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                  Verified Alumni
                                </span>
                              )}
                              {Boolean(u.isFeatured) && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                  Featured
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="navy" size="sm">
                          {(u.role || 'student').toUpperCase()}
                        </Badge>
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
                      <td className="py-3 px-4">
                        <Badge variant={isSuspended ? 'rejected' : 'approved'} size="sm">
                          {isSuspended ? 'Suspended' : 'Active'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isProtected ? (
                          <span className="text-[11px] text-slate-400 italic">
                            {isDemoUser ? 'Demo Protected' : 'Protected'}
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {isApprovedAlumni && (
                              <>
                                <Button
                                  variant={u.verifiedAlumniBadge ? 'secondary' : 'outline'}
                                  size="sm"
                                  disabled={Boolean(updatingUid)}
                                  onClick={() => void handleToggleVerifiedBadge(u)}
                                  leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                                >
                                  {u.verifiedAlumniBadge ? 'Badged' : 'Grant Badge'}
                                </Button>
                                <Button
                                  variant={u.isFeatured ? 'accent' : 'outline'}
                                  size="sm"
                                  disabled={Boolean(updatingUid)}
                                  onClick={() => void handleToggleFeatured(u)}
                                  leftIcon={<Star className="w-3.5 h-3.5" />}
                                >
                                  {u.isFeatured ? 'Featured' : 'Feature'}
                                </Button>
                              </>
                            )}
                            <Button
                              variant={isSuspended ? 'secondary' : 'outline'}
                              size="sm"
                              isLoading={updatingUid === u.id}
                              disabled={Boolean(updatingUid)}
                              className={!isSuspended ? 'text-amber-700 border-amber-200 hover:bg-amber-50' : ''}
                              onClick={() => void handleToggleSuspend(u)}
                              leftIcon={
                                isSuspended ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />
                              }
                            >
                              {isSuspended ? 'Reactivate' : 'Suspend'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={Boolean(updatingUid)}
                              className="text-rose-600 border-rose-200 hover:bg-rose-50"
                              onClick={() => setDeleteTarget(u)}
                              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Cascading Account Removal"
        description={`This removes ${deleteTarget?.name || 'user'}'s profile, ID index, and closes open job postings / appointment slots.`}
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
            <strong>Warning:</strong> Deleting <strong>{deleteTarget?.name}</strong> ({deleteTarget?.email}) will immediately cascade cleanup across Firestore collections (#33).
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={Boolean(updatingUid)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={Boolean(updatingUid)}
              onClick={() => void handleConfirmDelete()}
            >
              Delete User &amp; Cascade Cleanup
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
