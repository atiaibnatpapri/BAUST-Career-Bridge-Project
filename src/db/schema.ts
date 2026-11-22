import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('student'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const driveDocuments = pgTable('drive_documents', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  driveFileId: text('drive_file_id').notNull(),
  fileName: text('file_name').notNull(),
  mimeType: text('mime_type').notNull(),
  webViewLink: text('web_view_link'),
  fileSize: text('file_size'),
  category: text('category').notNull().default('other'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  driveDocuments: many(driveDocuments),
}));

export const driveDocumentsRelations = relations(driveDocuments, ({ one }) => ({
  owner: one(users, {
    fields: [driveDocuments.userId],
    references: [users.id],
  }),
}));
