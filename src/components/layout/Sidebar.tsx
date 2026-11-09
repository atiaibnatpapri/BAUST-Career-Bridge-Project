/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  MessageSquare, 
  FileText, 
  Sliders, 
  User, 
  Calendar, 
  Megaphone, 
  ShieldCheck, 
  Briefcase,
  HelpCircle,
  GraduationCap,
  Bookmark
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { role, verifications, mentorshipRequests, serviceRequests } = useApp();
  const navigate = useNavigate();

  // Calculate pending badges
  const pendingVerifications = verifications.filter((v) => v.status === 'Pending').length;
  const pendingMentorships = mentorshipRequests.filter((m) => m.status === 'Pending').length;
  const pendingServiceRequests = serviceRequests.filter((s) => s.status === 'Pending' || s.status === 'Under Review').length;

  interface NavItem {
    to: string;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
    subtext?: string;
  }

  const studentLinks: NavItem[] = [
    { to: '/student/dashboard', label: 'Student Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/student/directory', label: 'Alumni Directory', icon: <Users className="w-4 h-4" /> },
    { to: '/student/directory/saved', label: 'Saved Bookmarks', icon: <Bookmark className="w-4 h-4" /> },
    { to: '/student/mentorship', label: 'Mentorship Hub', icon: <Calendar className="w-4 h-4" /> },
    { to: '/verify-document', label: 'Verify Documents', icon: <ShieldCheck className="w-4 h-4" /> },
    { to: '/chat', label: 'Direct Messages', icon: <MessageSquare className="w-4 h-4" /> },
    { to: '/student/profile', label: 'My CV & Profile', icon: <User className="w-4 h-4" /> },
  ];

  const alumniLinks: NavItem[] = [
    { to: '/alumni/dashboard', label: 'Alumni Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/alumni/my-profile', label: 'My Public Profile & Editor', icon: <User className="w-4 h-4" /> },
    { to: '/student/directory', label: 'Browse Alumni', icon: <Users className="w-4 h-4" /> },
    { 
      to: '/alumni/mentorship', 
      label: 'Mentorship Workspace', 
      icon: <Calendar className="w-4 h-4" />, 
      badge: pendingMentorships > 0 ? pendingMentorships : undefined 
    },
    { 
      to: '/alumni/admin-desk', 
      label: 'University Admin Desk', 
      icon: <FileText className="w-4 h-4" />,
      subtext: 'Transcripts & Certificates'
    },
    { to: '/verify-document', label: 'Verify Documents', icon: <ShieldCheck className="w-4 h-4" /> },
    { to: '/alumni/mentor-settings', label: 'Mentor Availability', icon: <Sliders className="w-4 h-4" /> },
    { to: '/chat', label: 'Direct Messages', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  const adminLinks: NavItem[] = [
    { to: '/admin/dashboard', label: 'Admin Analytics', icon: <LayoutDashboard className="w-4 h-4" /> },
    { 
      to: '/admin/verifications', 
      label: 'Verification Queue', 
      icon: <UserCheck className="w-4 h-4" />, 
      badge: pendingVerifications > 0 ? pendingVerifications : undefined,
      badgeColor: 'bg-amber-500' 
    },
    { to: '/admin/users', label: 'User Management', icon: <Users className="w-4 h-4" /> },
    { 
      to: '/admin/admin-desk', 
      label: 'University Admin Desk', 
      icon: <FileText className="w-4 h-4" />, 
      badge: pendingServiceRequests > 0 ? pendingServiceRequests : undefined 
    },
    { to: '/verify-document', label: 'Verify Documents', icon: <ShieldCheck className="w-4 h-4" /> },
    { to: '/admin/announcements', label: 'Notices & Events', icon: <Megaphone className="w-4 h-4" /> },
  ];

  const currentLinks = role === 'student' ? studentLinks : role === 'alumni' ? alumniLinks : adminLinks;

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] hidden lg:flex flex-col justify-between py-6 px-4">
      <div className="space-y-6">
        {/* Role Identity Tag */}
        <div className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${
              role === 'student' ? 'bg-emerald-100 text-emerald-800' :
              role === 'alumni' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {role === 'student' ? <GraduationCap className="w-4 h-4" /> :
               role === 'alumni' ? <Briefcase className="w-4 h-4" /> :
               <ShieldCheck className="w-4 h-4" />}
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Portal View</p>
              <p className="text-xs font-bold text-slate-900 capitalize">{role} Portal</p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Workspace Navigation
          </p>
          <nav className="mt-2 space-y-1">
            {currentLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#0F2A4A] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white ${
                      item.badgeColor || 'bg-[#2E5E3E]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* University Saidpur Support Box */}
      <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#0F2A4A]/5 to-[#2E5E3E]/5 border border-slate-200/90 text-left space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F2A4A]">
          <HelpCircle className="w-3.5 h-3.5 text-[#2E5E3E]" />
          <span>BAUST Support Desk</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-snug">
          Saidpur Cantonment, Nilphamari. Registrar Desk: registrar@baust.edu.bd
        </p>
      </div>
    </aside>
  );
};
