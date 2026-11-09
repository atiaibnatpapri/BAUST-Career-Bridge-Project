/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { MentorshipStoreProvider } from './hooks/useMentorshipStore';
import { DirectoryStoreProvider } from './hooks/useDirectoryStore';
import { AdminDeskProvider } from './hooks/useAdminDeskStore';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
