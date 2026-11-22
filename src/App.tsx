/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { MentorshipStoreProvider } from './hooks/useMentorshipStore';
import { DirectoryStoreProvider } from './hooks/useDirectoryStore';
import { AdminDeskProvider } from './hooks/useAdminDeskStore';
import { AppRoutes } from './routes/AppRoutes';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <AuthProvider>
          <AppProvider>
            <MentorshipStoreProvider>
              <DirectoryStoreProvider>
                <AdminDeskProvider>
                  <AppRoutes />
                </AdminDeskProvider>
              </DirectoryStoreProvider>
            </MentorshipStoreProvider>
          </AppProvider>
        </AuthProvider>
      </HashRouter>
    </ErrorBoundary>
  );
}
