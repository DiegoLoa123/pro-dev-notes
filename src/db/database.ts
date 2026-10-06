import Dexie, { type EntityTable } from 'dexie';

import type { Note } from '../features/notes/domain/Note';
import type { Folder } from '../features/folders/domain/Folder';

import { plainTextToHtml } from './migrations/migrateToV2';

class AppDatabase extends Dexie {
  notes!: EntityTable<Note, 'id'>;
  folders!: EntityTable<Folder, 'id'>;

  constructor() {
    super('offline-notes-db');

    // Fase 1
    this.version(1).stores({
      notes: 'id, title, createdAt, updatedAt, isDeleted',
      folders: 'id, name, parentId, createdAt, updatedAt',
    });

    // Fase 2
    this.version(2)
      .stores({
        notes: 'id, title, createdAt, updatedAt, isDeleted',
      })
      .upgrade(async (transaction) => {
        await transaction
          .table<Note, string>('notes')
          .toCollection()
          .modify((note) => {
            note.content = plainTextToHtml(note.content);
          });
      });

    // =============================
    // VERSION 3
    // =============================

    this.version(3)
      .stores({
        notes: 'id, title, folderId, createdAt, updatedAt, isDeleted',
        folders: 'id, name, parentId, createdAt, updatedAt',
      })
      .upgrade(async (transaction) => {
        await transaction
          .table<Note, string>('notes')
          .toCollection()
          .modify((note) => {
            note.folderId = null;
          });

      });
  }
}

export const db = new AppDatabase();