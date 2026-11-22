/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useAdminDeskStore } from '../../hooks/useAdminDeskStore';
import { UserRole } from '../../types';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  MessageSquare,
  FileText,
  User,
  Calendar,
  Megaphone,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Crown,
  BarChart3,
  Activity,
  UserCog,
  LogOut,
  Video,
  CalendarCheck,
  FileSearch,
  Flag,
  X,
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavGroup {
  section: string;
  items: NavItem[];
}

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const ROLE_THEME: Record<
  UserRole,
  {
    activeClass: string;
    badgeBgClass: string;
  }
> = {
  student: {
    activeClass: 'bg-blue-600 text-white shadow-xs',
    badgeBgClass: 'bg-blue-600',
  },
  alumni: {
    activeClass: 'bg-emerald-700 text-white shadow-xs',
    badgeBgClass: 'bg-emerald-600',
  },
  admin: {
    activeClass: 'bg-orange-600 text-white shadow-xs',
    badgeBgClass: 'bg-orange-600',
  },
  superAdmin: {
    activeClass: 'bg-purple-700 text-white shadow-xs',
    badgeBgClass: 'bg-purple-700',
  },
};

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { role, verifications, mentorshipRequests, conversations, addToast, t } = useApp();
  const { firebaseUser, userProfile, logout } = useAuth();
  const { requests: adminDeskRequests } = useAdminDeskStore();
  const navigate = useNavigate();

  const activeRole: UserRole = userProfile?.role || role || 'student';
  const activeUserId = firebaseUser?.uid || userProfile?.id || '';
  const theme = ROLE_THEME[activeRole] || ROLE_THEME.student;

  const pendingVerifications = verifications.filter((v) => v.status === 'Pending').length;
  const pendingMentorships = mentorshipRequests.filter(
    (m) =>
      (m.status === 'Pending' || m.status === 'On Hold') &&
      (!activeUserId || m.alumniId === activeUserId || m.mentorId === activeUserId)
  ).length;
  const pendingServiceRequests = adminDeskRequests.filter(
    (r) => !['Delivered', 'Rejected', 'Cancelled'].includes(r.status)
  ).length;

  const unreadMessages = conversations.reduce((sum, c) => {
    const count =
      typeof c.unreadCountByUid?.[activeUserId] === 'number'
        ? c.unreadCountByUid[activeUserId]
        : typeof c.unreadCount === 'number'
        ? c.unreadCount
        : 0;
    return sum + count;
  }, 0);

  const handleSidebarLogout = async () => {
    onCloseMobile?.();
    await logout(() => {
      addToast('info', 'Logged Out', 'Your session has been cleared.');
      navigate('/login', { replace: true });
    });
  };

  const studentGroups: NavGroup[] = [
    {
      section: t.sidebar.mainSection,
      items: [
        { to: '/student/dashboard', label: t.sidebar.dashboard, icon: <LayoutDashboard className="w-4 h-4" /> },
        { to: '/student/jobs', label: t.sidebar.jobsInternships, icon: <Briefcase className="w-4 h-4" /> },
        { to: '/student/profile', label: t.sidebar.profileCv, icon: <User className="w-4 h-4" /> },
      ],
    },
    {
      section: t.sidebar.communitySection,
      items: [
        { to: '/student/directory', label: t.sidebar.directory, icon: <Users className="w-4 h-4" /> },
        { to: '/student/mentorship', label: t.sidebar.mentorshipHub, icon: <Calendar className="w-4 h-4" /> },
        { to: '/student/appointments', label: t.sidebar.appointments, icon: <CalendarCheck className="w-4 h-4" /> },
        { to: '/student/cv-reviews', label: t.sidebar.cvReview, icon: <FileSearch className="w-4 h-4" /> },
        { to: '/student/sessions', label: t.sidebar.sessionsWebinars, icon: <Video className="w-4 h-4" /> },
        {
          to: '/student/messages',
          label: t.sidebar.messages,
          icon: <MessageSquare className="w-4 h-4" />,
          badge: unreadMessages > 0 ? unreadMessages : undefined,
        },
      ],
    },
    {
      section: t.sidebar.servicesSection,
      items: [
        { to: '/student/admin-desk', label: t.sidebar.documentServices, icon: <FileText className="w-4 h-4" /> },
      ],
    },
  ];

  const alumniGroups: NavGroup[] = [
    {
      section: t.sidebar.mainSection,
      items: [
        { to: '/alumni/dashboard', label: t.sidebar.alumniDashboard, icon: <LayoutDashboard className="w-4 h-4" /> },
        { to: '/alumni/jobs', label: t.sidebar.postJobs, icon: <Briefcase className="w-4 h-4" /> },
        { to: '/alumni/my-profile', label: t.sidebar.myProfile, icon: <User className="w-4 h-4" /> },
      ],
    },
    {
      section: t.sidebar.communitySection,
      items: [
        {
          to: '/alumni/mentorship',
          label: t.sidebar.mentorshipRequests,
          icon: <Calendar className="w-4 h-4" />,
          badge: pendingMentorships > 0 ? pendingMentorships : undefined,
        },
        { to: '/alumni/appointments', label: t.sidebar.appointments, icon: <CalendarCheck className="w-4 h-4" /> },
        { to: '/alumni/cv-reviews', label: t.sidebar.cvReview, icon: <FileSearch className="w-4 h-4" /> },
        { to: '/alumni/sessions', label: t.sidebar.sessionsWebinars, icon: <Video className="w-4 h-4" /> },
        {
          to: '/alumni/messages',
          label: t.sidebar.messages,
          icon: <MessageSquare className="w-4 h-4" />,
          badge: unreadMessages > 0 ? unreadMessages : undefined,
        },
      ],
    },
    {
      section: t.sidebar.servicesSection,
      items: [
        { to: '/alumni/admin-desk', label: t.sidebar.documentServices, icon: <FileText className="w-4 h-4" /> },
      ],
    },
  ];

  const adminGroups: NavGroup[] = [
    {
      section: t.sidebar.mainSection,
      items: [
        { to: '/admin/dashboard', label: t.sidebar.adminDashboard, icon: <LayoutDashboard className="w-4 h-4" /> },
        { to: '/admin/directory', label: t.sidebar.memberLists, icon: <Users className="w-4 h-4" /> },
      ],
    },
    {
      section: t.sidebar.requestsSection,
      items: [
        {
          to: '/admin/admin-desk',
          label: t.sidebar.documentRequests,
          icon: <FileText className="w-4 h-4" />,
          badge: pendingServiceRequests > 0 ? pendingServiceRequests : undefined,
        },
        { to: '/admin/jobs', label: t.sidebar.manageJobs, icon: <Briefcase className="w-4 h-4" /> },
      ],
    },
    {
      section: t.sidebar.communitySection,
      items: [
        { to: '/admin/announcements', label: t.sidebar.announcements, icon: <Megaphone className="w-4 h-4" /> },
        { to: '/admin/moderation', label: t.sidebar.moderationReports, icon: <Flag className="w-4 h-4" /> },
      ],
    },
    {
      section: t.sidebar.servicesSection,
      items: [
        { to: '/admin/reports', label: t.sidebar.reportsStats, icon: <BarChart3 className="w-4 h-4" /> },
      ],
    },
  ];

  const superAdminGroups: NavGroup[] = [
    {
      section: t.sidebar.mainSection,
      items: [
        { to: '/superadmin/dashboard', label: t.sidebar.directorateOverview, icon: <LayoutDashboard className="w-4 h-4" /> },
        { to: '/superadmin/users', label: t.sidebar.manageUsers, icon: <Users className="w-4 h-4" /> },
      ],
    },
    {
      section: t.sidebar.requestsSection,
      items: [
        {
          to: '/superadmin/verifications',
          label: t.sidebar.verificationQueue,
          icon: <UserCheck className="w-4 h-4" />,
          badge: pendingVerifications > 0 ? pendingVerifications : undefined,
        },
        { to: '/superadmin/admins', label: t.sidebar.manageAdmins, icon: <UserCog className="w-4 h-4" /> },
      ],
    },
    {
      section: t.sidebar.servicesSection,
      items: [
        { to: '/superadmin/activity', label: t.sidebar.activityOverview, icon: <Activity className="w-4 h-4" /> },
        { to: '/admin/reports', label: t.sidebar.systemStats, icon: <BarChart3 className="w-4 h-4" /> },
      ],
    },
  ];

  const currentGroups =
    activeRole === 'superAdmin'
      ? superAdminGroups
      : activeRole === 'admin'
      ? adminGroups
      : activeRole === 'alumni'
      ? alumniGroups
      : studentGroups;

  const roleIcon =
    activeRole === 'superAdmin' ? (
      <Crown className="w-4 h-4 text-purple-700" />
    ) : activeRole === 'admin' ? (
      <ShieldCheck className="w-4 h-4 text-orange-600" />
    ) : activeRole === 'alumni' ? (
      <Briefcase className="w-4 h-4 text-emerald-700" />
    ) : (
      <GraduationCap className="w-4 h-4 text-blue-600" />
    );

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full py-5 px-4">
      <div className="space-y-5">
        {userProfile?.isDemo && (
          <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              {roleIcon}
              {t.nav.demoMode}
            </span>
            <span className="text-[10px] font-medium text-amber-700">{t.sidebar.sandboxed}</span>
          </div>
        )}

        {currentGroups.map((group) => (
          <div key={group.section} className="space-y-1">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {group.section}
            </p>
            <nav className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onCloseMobile?.()}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? theme.activeClass
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`
                  }
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="shrink-0">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white shrink-0 ${theme.badgeBgClass}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => void handleSidebarLogout()}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>{t.nav.logout}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className="w-64 shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] hidden lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile slide-over drawer (< lg) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => onCloseMobile?.()}
          />
          <aside className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl border-r border-slate-200 overflow-y-auto z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0F2A4A]">
                {t.roles[activeRole]}
              </span>
              <button
                type="button"
                onClick={() => onCloseMobile?.()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                aria-label="Close navigation menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
