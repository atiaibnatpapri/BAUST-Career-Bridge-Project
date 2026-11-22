/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { logPortalActivity, subscribeFirestoreUsers } from '../../services/firestorePortal';
import { isDemoAccountEmail } from '../../config/demoConfig';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { UserCog, Lock, Unlock, Crown, ArrowRight } from 'lucide-react';

export const SuperAdminAdminsPage: React.FC = () => {
  const { userProfile } = useAuth();
  const { addToast } = useApp();

  const [users, setUsers] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    return subscribeFirestoreUsers((list) => {
      setUsers(list.filter((u) => u.role === 'admin' || u.role === 'superAdmin'));
      setLoading(false);
    });
  }, []);

  const handleToggleSuspend = async (adminDoc: Record<string, any>) => {
    const isDemoUser = Boolean(adminDoc.isDemo) || isDemoAccountEmail(adminDoc.email);
    if (!userProfile || adminDoc.role === 'superAdmin' || isDemoUser) {
      addToast('warning', 'Protected Account', 'Super Admin and Demo Admin accounts cannot be suspended.');
      return;
    }

    const nextSuspended = !Boolean(adminDoc.suspended);
    setUpdatingUid(adminDoc.id);
    try {
      await updateDoc(doc(db, 'users', adminDoc.id), {
        suspended: nextSuspended,
        updatedAt: serverTimestamp(),
      });
      await logPortalActivity({
        actorId: userProfile.id,
        actorName: userProfile.name,
        actorRole: 'superAdmin',
        action: nextSuspended ? 'SUSPEND_ADMIN' : 'REACTIVATE_ADMIN',
        targetType: 'admin',
        targetId: adminDoc.id,
        details: `${nextSuspended ? 'Suspended' : 'Reactivated'} Admin ${adminDoc.name}`,
        isDemo: Boolean(userProfile.isDemo),
      });
      addToast('success', 'Admin Updated', `${adminDoc.name} is now ${nextSuspended ? 'suspended' : 'active'}.`);
    } catch (err: any) {
      addToast('error', 'Action Failed', err?.message || 'Permission denied.');
    } finally {
      setUpdatingUid(null);
    }
  };

  if (loading) {
    return <Loader label="Loading administrative accounts..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-purple-100">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold">
            Admin Governance
          </span>
          <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight mt-1">
            Manage Administrative Staff
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review approved university Admins and pending Admin applications
          </p>
        </div>

        <Link to="/superadmin/verifications">
          <Button variant="primary" size="sm" className="bg-purple-700 hover:bg-purple-800" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Review Pending Admin Requests
          </Button>
        </Link>
      </div>

      {users.length === 0 ? (
        <Card className="p-12 text-center space-y-2 border-dashed border-slate-300">
          <UserCog className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No Admin accounts found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((adm) => {
            const isSuper = adm.role === 'superAdmin';
            const isDemoUser = Boolean(adm.isDemo) || isDemoAccountEmail(adm.email);
            const isProtected = isSuper || adm.id === userProfile?.id || isDemoUser;
            const isSuspended = Boolean(adm.suspended);
            return (
              <Card key={adm.id} className="p-5 border-slate-200 flex flex-col justify-between space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Avatar src={adm.avatar} name={adm.name || 'Admin'} size="md" isVerified={Boolean(adm.isVerified)} />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-slate-900">{adm.name}</h3>
                        {isSuper && <Crown className="w-3.5 h-3.5 text-purple-700" />}
                        {isDemoUser && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                            DEMO
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-mono">{adm.email}</p>
                      <p className="text-xs text-slate-600 mt-1">
                        {adm.designation || 'Staff'} · {adm.office || adm.batch || 'Administration'}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      isSuspended
                        ? 'rejected'
                        : adm.verificationStatus === 'approved'
                        ? 'approved'
                        : 'pending'
                    }
                    size="sm"
                  >
                    {isSuspended ? 'Suspended' : adm.verificationStatus || 'pending'}
                  </Badge>
                </div>

                {!isProtected ? (
                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <Button
                      variant={isSuspended ? 'secondary' : 'outline'}
                      size="sm"
                      isLoading={updatingUid === adm.id}
                      onClick={() => void handleToggleSuspend(adm)}
                      leftIcon={isSuspended ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    >
                      {isSuspended ? 'Reactivate Admin' : 'Suspend Admin'}
                    </Button>
                  </div>
                ) : (
                  isDemoUser && !isSuper && (
                    <div className="pt-3 border-t border-slate-100 flex justify-end">
                      <span className="text-[11px] text-slate-400 italic">Demo Protected</span>
                    </div>
                  )
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
