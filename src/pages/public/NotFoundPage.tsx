/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { getDashboardPathForRole } from './ApprovalStatusPage';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Compass, Home, ArrowLeft, LayoutDashboard } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { t } = useApp();
  const { firebaseUser, userProfile } = useAuth();
  const isApproved = Boolean(
    firebaseUser && userProfile && userProfile.verificationStatus === 'approved' && !userProfile.suspended
  );

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full text-center p-6 sm:p-8 space-y-5 border-slate-200">
        <div className="w-16 h-16 rounded-2xl bg-[#0F2A4A]/10 text-[#0F2A4A] flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8 animate-spin-slow" />
        </div>
        <div className="space-y-1">
          <span className="text-4xl font-black font-mono text-[#0F2A4A]">{t.notFound.code}</span>
          <h2 className="text-xl font-bold text-slate-900">{t.notFound.title}</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            {t.notFound.description}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {isApproved && userProfile ? (
            <Link to={getDashboardPathForRole(userProfile.role)}>
              <Button variant="primary" size="sm" leftIcon={<LayoutDashboard className="w-4 h-4" />}>
                {t.nav.dashboard}
              </Button>
            </Link>
          ) : (
            <Link to="/">
              <Button variant="primary" size="sm" leftIcon={<Home className="w-4 h-4" />}>
                {t.notFound.backHome}
              </Button>
            </Link>
          )}
          <Link to="/student/directory">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              {t.notFound.openDirectory}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
