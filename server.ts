import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { requireAuth } from './src/middleware/auth.ts';
import type { AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser } from './src/db/users.ts';
import {
  deleteUserDriveDocument,
  listUserDriveDocuments,
  saveUserDriveDocument,
  updateUserDriveDocumentName,
} from './src/db/driveDocuments.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT =
    Number(process.env.DEFAULT_APP_PORT) ||
    (process.env.PORT && process.env.PORT !== process.env.NGINX_PORT
      ? Number(process.env.PORT)
      : 3000);

  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/users/sync', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || req.body?.email || '';
      if (!uid) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const user = await getOrCreateUser(
        uid,
        email,
        typeof req.body?.name === 'string' ? req.body.name : undefined,
        typeof req.body?.role === 'string' ? req.body.role : undefined
      );
      res.json({ user });
    } catch (error: any) {
      console.error('Error syncing user:', error);
      res.status(500).json({ error: error?.message || 'Failed to sync user' });
    }
  });

  app.get('/api/drive-documents', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const documents = await listUserDriveDocuments(uid);
      res.json({ documents });
    } catch (error: any) {
      console.error('Failed to list linked Drive documents:', error);
      res.status(500).json({ error: error?.message || 'Failed to load documents' });
    }
  });

  app.post('/api/drive-documents', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || '';
      if (!uid) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { driveFileId, fileName, mimeType, webViewLink, fileSize, category, notes, name, role } =
        req.body || {};

      if (!driveFileId || !fileName || !mimeType) {
        return res.status(400).json({
          error: 'driveFileId, fileName, and mimeType are required.',
        });
      }

      const saved = await saveUserDriveDocument(
        uid,
        email,
        {
          driveFileId: String(driveFileId),
          fileName: String(fileName),
          mimeType: String(mimeType),
          webViewLink: typeof webViewLink === 'string' ? webViewLink : undefined,
          fileSize: typeof fileSize === 'string' ? fileSize : undefined,
          category: typeof category === 'string' ? category : 'other',
          notes: typeof notes === 'string' ? notes : undefined,
        },
        typeof name === 'string' ? name : undefined,
        typeof role === 'string' ? role : undefined
      );

      res.status(201).json({ document: saved });
    } catch (error: any) {
      console.error('Failed to save linked Drive document:', error);
      res.status(500).json({ error: error?.message || 'Failed to save document' });
    }
  });

  app.patch('/api/drive-documents/:driveFileId', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const driveFileId = String(req.params.driveFileId || '');
      const { fileName } = req.body || {};
      if (!driveFileId || !fileName) {
        return res.status(400).json({ error: 'driveFileId and fileName are required.' });
      }
      const updated = await updateUserDriveDocumentName(uid, driveFileId, String(fileName));
      res.json({ document: updated });
    } catch (error: any) {
      console.error('Failed to update linked Drive document:', error);
      res.status(500).json({ error: error?.message || 'Failed to update document' });
    }
  });

  app.delete('/api/drive-documents/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const docId = Number(req.params.id);
      if (!Number.isInteger(docId) || docId <= 0) {
        return res.status(400).json({ error: 'Invalid document ID.' });
      }
      const deleted = await deleteUserDriveDocument(uid, docId);
      res.json({ deleted });
    } catch (error: any) {
      console.error('Failed to delete linked Drive document:', error);
      res.status(500).json({ error: error?.message || 'Failed to delete document' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
