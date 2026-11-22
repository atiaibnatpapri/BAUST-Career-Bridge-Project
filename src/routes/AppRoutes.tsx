/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Loader } from '../components/ui/Loader';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { getDashboardPathForRole } from '../pages/public/ApprovalStatusPage';
import { UserRole } from '../types';

// Lazy-loaded Public Pages
const LandingPage = lazy(() =>
  import('../pages/public/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const LoginPage = lazy(() =>
  import('../pages/public/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('../pages/public/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const ApprovalStatusPage = lazy(() =>
  import('../pages/public/ApprovalStatusPage').then((m) => ({ default: m.ApprovalStatusPage }))
);
const NotFoundPage = lazy(() =>
  import('../pages/public/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);
const VerifyDocumentPage = lazy(() =>
  import('../pages/public/VerifyDocumentPage').then((m) => ({ default: m.VerifyDocumentPage }))
);

// Lazy-loaded Student Pages
const StudentDashboard = lazy(() =>
  import('../pages/student/StudentDashboard').then((m) => ({ default: m.StudentDashboard }))
);
const StudentProfilePage = lazy(() =>
  import('../pages/student/StudentProfilePage').then((m) => ({ default: m.StudentProfilePage }))
);
const StudentJobsPage = lazy(() =>
  import('../pages/student/StudentJobsPage').then((m) => ({ default: m.StudentJobsPage }))
);
const StudentApplicationsPage = lazy(() =>
  import('../pages/student/StudentApplicationsPage').then((m) => ({
    default: m.StudentApplicationsPage,
  }))
);
const AlumniDirectoryPage = lazy(() =>
  import('../pages/student/directory/AlumniDirectoryPage').then((m) => ({
    default: m.AlumniDirectoryPage,
  }))
);
const SavedAlumniPage = lazy(() =>
  import('../pages/student/directory/SavedAlumniPage').then((m) => ({
    default: m.SavedAlumniPage,
  }))
);
const AlumniDetailView = lazy(() =>
  import('../pages/student/directory/AlumniDetailView').then((m) => ({
    default: m.AlumniDetailView,
  }))
);
const MentorshipHome = lazy(() =>
  import('../pages/student/mentorship/MentorshipHome').then((m) => ({
    default: m.MentorshipHome,
  }))
);
const MentorProfilePage = lazy(() =>
  import('../pages/student/mentorship/MentorProfilePage').then((m) => ({
    default: m.MentorProfilePage,
  }))
);
const ChatPage = lazy(() =>
  import('../pages/student/ChatPage').then((m) => ({ default: m.ChatPage }))
);

// Lazy-loaded Alumni Pages
const AlumniDashboard = lazy(() =>
  import('../pages/alumni/AlumniDashboard').then((m) => ({ default: m.AlumniDashboard }))
);
const AlumniOwnProfilePage = lazy(() =>
  import('../pages/alumni/profile/AlumniOwnProfilePage').then((m) => ({
    default: m.AlumniOwnProfilePage,
  }))
);
const AlumniJobsPage = lazy(() =>
  import('../pages/alumni/AlumniJobsPage').then((m) => ({ default: m.AlumniJobsPage }))
);
const AlumniEventsPage = lazy(() =>
  import('../pages/alumni/AlumniEventsPage').then((m) => ({ default: m.AlumniEventsPage }))
);
const AlumniConnectStudentsPage = lazy(() =>
  import('../pages/alumni/AlumniConnectStudentsPage').then((m) => ({
    default: m.AlumniConnectStudentsPage,
  }))
);
const AlumniGivingBackPage = lazy(() =>
  import('../pages/alumni/AlumniGivingBackPage').then((m) => ({
    default: m.AlumniGivingBackPage,
  }))
);
const AlumniMentorshipPage = lazy(() =>
  import('../pages/alumni/mentorship/AlumniMentorshipPage').then((m) => ({
    default: m.AlumniMentorshipPage,
  }))
);
const MentorSettingsPage = lazy(() =>
  import('../pages/alumni/MentorSettingsPage').then((m) => ({
    default: m.MentorSettingsPage,
  }))
);
const AlumniAdminDeskPage = lazy(() =>
  import('../pages/alumni/admindesk/AlumniAdminDeskPage').then((m) => ({
    default: m.AlumniAdminDeskPage,
  }))
);
const AlumniRequestDetailPage = lazy(() =>
  import('../pages/alumni/admindesk/AlumniRequestDetailPage').then((m) => ({
    default: m.AlumniRequestDetailPage,
  }))
);

// Lazy-loaded Admin Pages (Zero Verification Approval or User Suspension Permissions)
const AdminDashboard = lazy(() =>
  import('../pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const AdminJobsPage = lazy(() =>
  import('../pages/admin/AdminJobsPage').then((m) => ({ default: m.AdminJobsPage }))
);
const AdminDirectoryViewPage = lazy(() =>
  import('../pages/admin/AdminDirectoryViewPage').then((m) => ({
    default: m.AdminDirectoryViewPage,
  }))
);
const AdminReportsPage = lazy(() =>
  import('../pages/admin/AdminReportsPage').then((m) => ({ default: m.AdminReportsPage }))
);
const AnnouncementsPage = lazy(() =>
  import('../pages/admin/AnnouncementsPage').then((m) => ({
    default: m.AnnouncementsPage,
  }))
);
const AdminAdminDeskPage = lazy(() =>
  import('../pages/admin/admindesk/AdminAdminDeskPage').then((m) => ({
    default: m.AdminAdminDeskPage,
  }))
);
const AdminRequestDetailPage = lazy(() =>
  import('../pages/admin/admindesk/AdminRequestDetailPage').then((m) => ({
    default: m.AdminRequestDetailPage,
  }))
);

// Lazy-loaded Super Admin Pages (Exclusive Approvals + Governance)
const SuperAdminDashboard = lazy(() =>
  import('../pages/superadmin/SuperAdminDashboard').then((m) => ({
    default: m.SuperAdminDashboard,
  }))
);
const SuperAdminVerificationsPage = lazy(() =>
  import('../pages/superadmin/SuperAdminVerificationsPage').then((m) => ({
    default: m.SuperAdminVerificationsPage,
  }))
);
const SuperAdminUsersPage = lazy(() =>
  import('../pages/superadmin/SuperAdminUsersPage').then((m) => ({
    default: m.SuperAdminUsersPage,
  }))
);
const SuperAdminAdminsPage = lazy(() =>
  import('../pages/superadmin/SuperAdminAdminsPage').then((m) => ({
    default: m.SuperAdminAdminsPage,
  }))
);
const SuperAdminActivityPage = lazy(() =>
  import('../pages/superadmin/SuperAdminActivityPage').then((m) => ({
    default: m.SuperAdminActivityPage,
  }))
);

// Lazy-loaded Shared Pages
const GoogleDriveVaultPage = lazy(() =>
  import('../pages/shared/GoogleDriveVaultPage').then((m) => ({
    default: m.GoogleDriveVaultPage,
  }))
);
const DocumentServiceActionPage = lazy(() =>
  import('../pages/shared/DocumentServiceActionPage').then((m) => ({
    default: m.DocumentServiceActionPage,
  }))
);
const KnowledgeSessionsPage = lazy(() =>
  import('../pages/shared/KnowledgeSessionsPage').then((m) => ({
    default: m.KnowledgeSessionsPage,
  }))
);
const AppointmentsPage = lazy(() =>
  import('../pages/shared/AppointmentsPage').then((m) => ({
    default: m.AppointmentsPage,
  }))
);
const CVReviewsPage = lazy(() =>
  import('../pages/shared/CVReviewsPage').then((m) => ({
    default: m.CVReviewsPage,
  }))
);
const ModerationReportsPage = lazy(() =>
  import('../pages/admin/ModerationReportsPage').then((m) => ({
    default: m.ModerationReportsPage,
  }))
);

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  loginRedirect?: string;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { firebaseUser, userProfile, loading, isSwitchingDemo } = useAuth();

  if (isSwitchingDemo) {
    return <Loader fullScreen label="Switching demo workspace..." />;
  }

  if (loading) {
    return <Loader fullScreen label="Verifying your BAUST session..." />;
  }

  if (!firebaseUser || !userProfile) {
    return <Navigate to="/login" replace />;
  }

  if (userProfile.suspended || userProfile.verificationStatus !== 'approved') {
    return <Navigate to="/approval-status" replace />;
  }

  if (!allowedRoles.includes(userProfile.role)) {
    return <Navigate to={getDashboardPathForRole(userProfile.role)} replace />;
  }

  return <>{children}</>;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { firebaseUser, userProfile, loading, isSwitchingDemo } = useAuth();
  const { addToast } = useApp();
  const location = useLocation();
  const notifiedPathRef = useRef<string | null>(null);

  const isSignedInWithProfile = !loading && !isSwitchingDemo && Boolean(firebaseUser && userProfile);

  useEffect(() => {
    if (isSignedInWithProfile && userProfile && notifiedPathRef.current !== location.pathname) {
      notifiedPathRef.current = location.pathname;
      addToast(
        'info',
        'Active Session Detected',
        `You are already signed in as ${userProfile.name} (${userProfile.role}). Please log out first to sign in or register with another account.`
      );
    }
    if (!isSignedInWithProfile) {
      notifiedPathRef.current = null;
    }
  }, [isSignedInWithProfile, userProfile, location.pathname, addToast]);

  if (isSwitchingDemo) {
    return <Loader fullScreen label="Switching demo workspace..." />;
  }

  if (loading) {
    return <Loader fullScreen label="Checking session..." />;
  }

  if (firebaseUser && userProfile) {
    const dest =
      userProfile.verificationStatus === 'approved' && !userProfile.suspended
        ? getDashboardPathForRole(userProfile.role)
        : '/approval-status';
    return <Navigate to={dest} replace />;
  }

  return <>{children}</>;
};

const withSuspense = (node: React.ReactNode, label = 'Loading page...', sectionName?: string) => (
  <ErrorBoundary sectionName={sectionName}>
    <Suspense fallback={<Loader label={label} />}>{node}</Suspense>
  </ErrorBoundary>
);

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public Pages */}
        <Route path="/" element={withSuspense(<LandingPage />)} />
        <Route
          path="/login"
          element={withSuspense(
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          )}
        />
        <Route
          path="/student/login"
          element={withSuspense(
            <PublicOnlyRoute>
              <LoginPage portalRole="student" />
            </PublicOnlyRoute>
          )}
        />
        <Route
          path="/alumni/login"
          element={withSuspense(
            <PublicOnlyRoute>
              <LoginPage portalRole="alumni" />
            </PublicOnlyRoute>
          )}
        />
        <Route
          path="/admin/login"
          element={withSuspense(
            <PublicOnlyRoute>
              <LoginPage portalRole="admin" />
            </PublicOnlyRoute>
          )}
        />
        <Route
          path="/superadmin/login"
          element={withSuspense(
            <PublicOnlyRoute>
              <LoginPage portalRole="superAdmin" />
            </PublicOnlyRoute>
          )}
        />
        <Route
          path="/register"
          element={withSuspense(
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          )}
        />
        <Route
          path="/register/student"
          element={withSuspense(
            <PublicOnlyRoute>
              <RegisterPage defaultRole="student" />
            </PublicOnlyRoute>
          )}
        />
        <Route
          path="/register/alumni"
          element={withSuspense(
            <PublicOnlyRoute>
              <RegisterPage defaultRole="alumni" />
            </PublicOnlyRoute>
          )}
        />
        <Route
          path="/register/admin"
          element={withSuspense(
            <PublicOnlyRoute>
              <RegisterPage defaultRole="admin" />
            </PublicOnlyRoute>
          )}
        />
        <Route
          path="/student/register"
          element={withSuspense(
            <PublicOnlyRoute>
              <RegisterPage defaultRole="student" />
            </PublicOnlyRoute>
          )}
        />
        <Route
          path="/alumni/register"
          element={withSuspense(
            <PublicOnlyRoute>
              <RegisterPage defaultRole="alumni" />
            </PublicOnlyRoute>
          )}
        />
        <Route
          path="/admin/register"
          element={withSuspense(
            <PublicOnlyRoute>
              <RegisterPage defaultRole="admin" />
            </PublicOnlyRoute>
          )}
        />
        <Route path="/approval-status" element={withSuspense(<ApprovalStatusPage />)} />
        <Route path="/verify-document" element={withSuspense(<VerifyDocumentPage />)} />

        {/* Student Workspace Pages */}
        <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
        <Route
          path="/student/dashboard"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['student']} loginRedirect="/student/login">
              <StudentDashboard />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/student/profile"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['student']} loginRedirect="/student/login">
              <StudentProfilePage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/student/jobs"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['student']} loginRedirect="/student/login">
              <StudentJobsPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/student/applications"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['student']} loginRedirect="/student/login">
              <StudentApplicationsPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/student/mentorship"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['student']} loginRedirect="/student/login">
              <MentorshipHome />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/student/mentorship/mentor/:id"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['student']} loginRedirect="/student/login">
              <MentorProfilePage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/student/sessions"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['student']} loginRedirect="/student/login">
              <KnowledgeSessionsPage />
            </ProtectedRoute>,
            'Loading knowledge sessions...',
            'Knowledge Sessions'
          )}
        />
        <Route
          path="/student/appointments"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['student']} loginRedirect="/student/login">
              <AppointmentsPage />
            </ProtectedRoute>,
            'Loading appointment slots...',
            'Appointment Slots'
          )}
        />
        <Route
          path="/student/cv-reviews"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['student']} loginRedirect="/student/login">
              <CVReviewsPage />
            </ProtectedRoute>,
            'Loading CV review hub...',
            'CV Reviews & Evaluations'
          )}
        />
        <Route
          path="/student/services"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['student']} loginRedirect="/student/login">
              <ErrorBoundary sectionName="University Admin Desk & Document Services">
                <AlumniAdminDeskPage />
              </ErrorBoundary>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/student/admin-desk"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['student']} loginRedirect="/student/login">
              <ErrorBoundary sectionName="University Admin Desk & Document Services">
                <AlumniAdminDeskPage />
              </ErrorBoundary>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/student/admin-desk/requests/:id"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['student']} loginRedirect="/student/login">
              <ErrorBoundary sectionName="University Admin Desk & Document Services">
                <AlumniRequestDetailPage />
              </ErrorBoundary>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/student/document-requests/new"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['student']} loginRedirect="/student/login">
              <ErrorBoundary sectionName="University Admin Desk & Document Services">
                <DocumentServiceActionPage mode="new" />
              </ErrorBoundary>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/student/document-requests/transcript"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['student']} loginRedirect="/student/login">
              <ErrorBoundary sectionName="University Admin Desk & Document Services">
                <DocumentServiceActionPage mode="transcript" />
              </ErrorBoundary>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/student/document-requests/certificate"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['student']} loginRedirect="/student/login">
              <ErrorBoundary sectionName="University Admin Desk & Document Services">
                <DocumentServiceActionPage mode="certificate" />
              </ErrorBoundary>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/student/document-requests/history"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['student']} loginRedirect="/student/login">
              <ErrorBoundary sectionName="University Admin Desk & Document Services">
                <DocumentServiceActionPage mode="history" />
              </ErrorBoundary>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/student/document-requests/clearance"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['student']} loginRedirect="/student/login">
              <ErrorBoundary sectionName="University Admin Desk & Document Services">
                <DocumentServiceActionPage mode="clearance" />
              </ErrorBoundary>
            </ProtectedRoute>
          )}
        />

        {/* Alumni Directory (Shared for authenticated Student, Alumni & Admin) */}
        <Route
          path="/student/directory"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['student', 'alumni', 'admin', 'superAdmin']} loginRedirect="/login">
              <AlumniDirectoryPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/student/directory/saved"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['student', 'alumni', 'admin', 'superAdmin']} loginRedirect="/login">
              <SavedAlumniPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/student/directory/:id"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['student', 'alumni', 'admin', 'superAdmin']} loginRedirect="/login">
              <AlumniDetailView />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/student/alumni/:id"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['student', 'alumni', 'admin', 'superAdmin']} loginRedirect="/login">
              <AlumniDetailView />
            </ProtectedRoute>
          )}
        />

        {/* Alumni Workspace Pages */}
        <Route path="/alumni" element={<Navigate to="/alumni/dashboard" replace />} />
        <Route
          path="/alumni/dashboard"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['alumni']} loginRedirect="/alumni/login">
              <AlumniDashboard />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/alumni/my-profile"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['alumni']} loginRedirect="/alumni/login">
              <AlumniOwnProfilePage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/alumni/jobs"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['alumni']} loginRedirect="/alumni/login">
              <AlumniJobsPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/alumni/mentorship"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['alumni']} loginRedirect="/alumni/login">
              <AlumniMentorshipPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/alumni/sessions"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['alumni']} loginRedirect="/alumni/login">
              <KnowledgeSessionsPage />
            </ProtectedRoute>,
            'Loading knowledge sessions...',
            'Knowledge Sessions'
          )}
        />
        <Route
          path="/alumni/appointments"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['alumni']} loginRedirect="/alumni/login">
              <AppointmentsPage />
            </ProtectedRoute>,
            'Loading appointment slots...',
            'Appointment Slots'
          )}
        />
        <Route
          path="/alumni/cv-reviews"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['alumni']} loginRedirect="/alumni/login">
              <CVReviewsPage />
            </ProtectedRoute>,
            'Loading CV reviews...',
            'CV Reviews & Evaluations'
          )}
        />
        <Route
          path="/alumni/events"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['alumni']} loginRedirect="/alumni/login">
              <AlumniEventsPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/alumni/students"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['alumni']} loginRedirect="/alumni/login">
              <AlumniConnectStudentsPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/alumni/giving-back"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['alumni']} loginRedirect="/alumni/login">
              <AlumniGivingBackPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/alumni/mentor-settings"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['alumni']} loginRedirect="/alumni/login">
              <MentorSettingsPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/alumni/services"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['alumni']} loginRedirect="/alumni/login">
              <ErrorBoundary sectionName="University Admin Desk & Document Services">
                <AlumniAdminDeskPage />
              </ErrorBoundary>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/alumni/admin-desk"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['alumni']} loginRedirect="/alumni/login">
              <ErrorBoundary sectionName="University Admin Desk & Document Services">
                <AlumniAdminDeskPage />
              </ErrorBoundary>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/alumni/admin-desk/requests/:id"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['alumni']} loginRedirect="/alumni/login">
              <ErrorBoundary sectionName="University Admin Desk & Document Services">
                <AlumniRequestDetailPage />
              </ErrorBoundary>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/alumni/document-requests/new"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['alumni']} loginRedirect="/alumni/login">
              <ErrorBoundary sectionName="University Admin Desk & Document Services">
                <DocumentServiceActionPage mode="new" />
              </ErrorBoundary>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/alumni/document-requests/transcript"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['alumni']} loginRedirect="/alumni/login">
              <ErrorBoundary sectionName="University Admin Desk & Document Services">
                <DocumentServiceActionPage mode="transcript" />
              </ErrorBoundary>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/alumni/document-requests/certificate"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['alumni']} loginRedirect="/alumni/login">
              <ErrorBoundary sectionName="University Admin Desk & Document Services">
                <DocumentServiceActionPage mode="certificate" />
              </ErrorBoundary>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/alumni/document-requests/history"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['alumni']} loginRedirect="/alumni/login">
              <ErrorBoundary sectionName="University Admin Desk & Document Services">
                <DocumentServiceActionPage mode="history" />
              </ErrorBoundary>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/alumni/document-requests/clearance"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['alumni']} loginRedirect="/alumni/login">
              <ErrorBoundary sectionName="University Admin Desk & Document Services">
                <DocumentServiceActionPage mode="clearance" />
              </ErrorBoundary>
            </ProtectedRoute>
          )}
        />

        {/* Admin Workspace Pages (No Verification Approvals or User Suspension) */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route
          path="/admin/dashboard"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['admin']} loginRedirect="/admin/login">
              <AdminDashboard />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/jobs"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['admin']} loginRedirect="/admin/login">
              <AdminJobsPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/directory"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['admin']} loginRedirect="/admin/login">
              <AdminDirectoryViewPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/admin-desk"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['admin']} loginRedirect="/admin/login">
              <ErrorBoundary sectionName="University Admin Desk Management">
                <AdminAdminDeskPage />
              </ErrorBoundary>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/admin-desk/requests/:id"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['admin']} loginRedirect="/admin/login">
              <ErrorBoundary sectionName="University Admin Desk Management">
                <AdminRequestDetailPage />
              </ErrorBoundary>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/service-requests"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['admin']} loginRedirect="/admin/login">
              <ErrorBoundary sectionName="University Admin Desk Management">
                <AdminAdminDeskPage />
              </ErrorBoundary>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/announcements"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['admin']} loginRedirect="/admin/login">
              <AnnouncementsPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/reports"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['admin', 'superAdmin']} loginRedirect="/admin/login">
              <AdminReportsPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/sessions"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['admin', 'superAdmin']} loginRedirect="/admin/login">
              <KnowledgeSessionsPage />
            </ProtectedRoute>,
            'Loading knowledge sessions...',
            'Knowledge Sessions'
          )}
        />
        <Route
          path="/admin/moderation"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['admin', 'superAdmin']} loginRedirect="/admin/login">
              <ModerationReportsPage />
            </ProtectedRoute>,
            'Loading moderation reports...',
            'User Reports & Moderation'
          )}
        />

        {/* Super Admin Workspace Pages (Exclusive Approvals + Governance) */}
        <Route path="/superadmin" element={<Navigate to="/superadmin/dashboard" replace />} />
        <Route
          path="/superadmin/dashboard"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['superAdmin']} loginRedirect="/superadmin/login">
              <SuperAdminDashboard />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/superadmin/verifications"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['superAdmin']} loginRedirect="/superadmin/login">
              <SuperAdminVerificationsPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/superadmin/verification"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['superAdmin']} loginRedirect="/superadmin/login">
              <SuperAdminVerificationsPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/superadmin/users"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['superAdmin']} loginRedirect="/superadmin/login">
              <SuperAdminUsersPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/superadmin/admins"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['superAdmin']} loginRedirect="/superadmin/login">
              <SuperAdminAdminsPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/superadmin/activity"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['superAdmin']} loginRedirect="/superadmin/login">
              <SuperAdminActivityPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/superadmin/moderation"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['superAdmin', 'admin']} loginRedirect="/superadmin/login">
              <ModerationReportsPage />
            </ProtectedRoute>,
            'Loading moderation reports...',
            'User Reports & Moderation'
          )}
        />

        {/* Shared Authenticated Workspaces */}
        <Route
          path="/chat"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['student', 'alumni', 'admin', 'superAdmin']} loginRedirect="/login">
              <ChatPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/drive-vault"
          element={withSuspense(
            <ProtectedRoute allowedRoles={['student', 'alumni', 'admin', 'superAdmin']} loginRedirect="/login">
              <GoogleDriveVaultPage />
            </ProtectedRoute>
          )}
        />

        {/* 404 & Catch-all */}
        <Route path="/404" element={withSuspense(<NotFoundPage />)} />
        <Route path="*" element={withSuspense(<NotFoundPage />)} />
      </Route>
    </Routes>
  );
};
