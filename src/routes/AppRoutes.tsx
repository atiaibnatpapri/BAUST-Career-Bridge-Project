/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { NotFoundPage } from '../pages/public/NotFoundPage';

// Student Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { AlumniDirectoryPage } from '../pages/student/directory/AlumniDirectoryPage';
import { SavedAlumniPage } from '../pages/student/directory/SavedAlumniPage';
import { AlumniDetailView } from '../pages/student/directory/AlumniDetailView';
import { MentorshipHome } from '../pages/student/mentorship/MentorshipHome';
import { MentorProfilePage } from '../pages/student/mentorship/MentorProfilePage';
import { AlumniMentorshipPage } from '../pages/alumni/mentorship/AlumniMentorshipPage';
import { StudentProfilePage } from '../pages/student/StudentProfilePage';
import { ChatPage } from '../pages/student/ChatPage';

// Alumni Pages
import { AlumniDashboard } from '../pages/alumni/AlumniDashboard';
import { MentorSettingsPage } from '../pages/alumni/MentorSettingsPage';
import { AlumniOwnProfilePage } from '../pages/alumni/profile/AlumniOwnProfilePage';
import { AlumniAdminDeskPage } from '../pages/alumni/admindesk/AlumniAdminDeskPage';
import { AlumniRequestDetailPage } from '../pages/alumni/admindesk/AlumniRequestDetailPage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { VerificationQueuePage } from '../pages/admin/VerificationQueuePage';
import { UserManagementPage } from '../pages/admin/UserManagementPage';
import { AnnouncementsPage } from '../pages/admin/AnnouncementsPage';
import { AdminAdminDeskPage } from '../pages/admin/admindesk/AdminAdminDeskPage';
import { AdminRequestDetailPage } from '../pages/admin/admindesk/AdminRequestDetailPage';

// Public Verification Page
import { VerifyDocumentPage } from '../pages/public/VerifyDocumentPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-document" element={<VerifyDocumentPage />} />

        {/* Student Workspace Pages */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/directory" element={<AlumniDirectoryPage />} />
        <Route path="/student/directory/saved" element={<SavedAlumniPage />} />
        <Route path="/student/directory/:id" element={<AlumniDetailView />} />
        <Route path="/student/alumni/:id" element={<AlumniDetailView />} />
        <Route path="/student/mentorship" element={<MentorshipHome />} />
        <Route path="/student/mentorship/mentor/:id" element={<MentorProfilePage />} />
        <Route path="/student/profile" element={<StudentProfilePage />} />

        {/* Alumni Workspace Pages */}
        <Route path="/alumni/dashboard" element={<AlumniDashboard />} />
        <Route path="/alumni/my-profile" element={<AlumniOwnProfilePage />} />
        <Route path="/alumni/mentorship" element={<AlumniMentorshipPage />} />
        <Route path="/alumni/admin-desk" element={<AlumniAdminDeskPage />} />
        <Route path="/alumni/admin-desk/requests/:id" element={<AlumniRequestDetailPage />} />
        <Route path="/alumni/services" element={<AlumniAdminDeskPage />} />
        <Route path="/alumni/mentor-settings" element={<MentorSettingsPage />} />

        {/* Admin Workspace Pages */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/verifications" element={<VerificationQueuePage />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/admin-desk" element={<AdminAdminDeskPage />} />
        <Route path="/admin/admin-desk/requests/:id" element={<AdminRequestDetailPage />} />
        <Route path="/admin/service-requests" element={<AdminAdminDeskPage />} />
        <Route path="/admin/announcements" element={<AnnouncementsPage />} />

        {/* Shared Workspaces */}
        <Route path="/chat" element={<ChatPage />} />

        {/* 404 Fallback */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
};
