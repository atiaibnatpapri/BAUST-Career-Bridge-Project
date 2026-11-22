import { and, desc, eq } from 'drizzle-orm';
import { db } from './index.ts';
import { driveDocuments, users } from './schema.ts';
import { getOrCreateUser } from './users.ts';

export interface CreateDriveDocumentInput {
  driveFileId: string;
  fileName: string;
  mimeType: string;
  webViewLink?: string;
  fileSize?: string;
  category?: string;
  notes?: string;
}

export async function listUserDriveDocuments(uid: string) {
  try {
    return await db
      .select({
        id: driveDocuments.id,
        userId: driveDocuments.userId,
        driveFileId: driveDocuments.driveFileId,
        fileName: driveDocuments.fileName,
        mimeType: driveDocuments.mimeType,
        webViewLink: driveDocuments.webViewLink,
        fileSize: driveDocuments.fileSize,
        category: driveDocuments.category,
        notes: driveDocuments.notes,
        createdAt: driveDocuments.createdAt,
        updatedAt: driveDocuments.updatedAt,
      })
      .from(driveDocuments)
      .innerJoin(users, eq(driveDocuments.userId, users.id))
      .where(eq(users.uid, uid))
      .orderBy(desc(driveDocuments.createdAt));
  } catch (error) {
    console.error('Failed to list drive documents:', error);
    throw new Error('Failed to load linked documents. Please try again later.', {
      cause: error,
    });
  }
}

export async function saveUserDriveDocument(
  uid: string,
  email: string,
  input: CreateDriveDocumentInput,
  name?: string,
  role?: string
) {
  try {
    const userRecord = await getOrCreateUser(uid, email, name, role);

    const existing = await db
      .select()
      .from(driveDocuments)
      .where(
        and(
          eq(driveDocuments.userId, userRecord.id),
          eq(driveDocuments.driveFileId, input.driveFileId)
        )
      );

    if (existing.length > 0) {
      const updated = await db
        .update(driveDocuments)
        .set({
          fileName: input.fileName,
          mimeType: input.mimeType,
          webViewLink: input.webViewLink || existing[0].webViewLink,
          fileSize: input.fileSize || existing[0].fileSize,
          category: input.category || existing[0].category,
          notes: input.notes ?? existing[0].notes,
          updatedAt: new Date(),
        })
        .where(eq(driveDocuments.id, existing[0].id))
        .returning();
      return updated[0];
    }

    const inserted = await db
      .insert(driveDocuments)
      .values({
        userId: userRecord.id,
        driveFileId: input.driveFileId,
        fileName: input.fileName,
        mimeType: input.mimeType,
        webViewLink: input.webViewLink || null,
        fileSize: input.fileSize || null,
        category: input.category || 'other',
        notes: input.notes || null,
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Failed to save drive document:', error);
    throw new Error('Failed to save linked document. Please try again later.', {
      cause: error,
    });
  }
}

export async function updateUserDriveDocumentName(
  uid: string,
  driveFileId: string,
  newName: string
) {
  try {
    const userRows = await db.select().from(users).where(eq(users.uid, uid));
    if (!userRows.length) return null;

    const updated = await db
      .update(driveDocuments)
      .set({
        fileName: newName,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(driveDocuments.userId, userRows[0].id),
          eq(driveDocuments.driveFileId, driveFileId)
        )
      )
      .returning();

    return updated[0] || null;
  } catch (error) {
    console.error('Failed to update drive document name:', error);
    throw new Error('Failed to update linked document.', { cause: error });
  }
}

export async function deleteUserDriveDocument(uid: string, docId: number) {
  try {
    const userRows = await db.select().from(users).where(eq(users.uid, uid));
    if (!userRows.length) return false;

    const deleted = await db
      .delete(driveDocuments)
      .where(
        and(
          eq(driveDocuments.id, docId),
          eq(driveDocuments.userId, userRows[0].id)
        )
      )
      .returning();

    return deleted.length > 0;
  } catch (error) {
    console.error('Failed to delete drive document:', error);
    throw new Error('Failed to remove linked document.', { cause: error });
  }
}
