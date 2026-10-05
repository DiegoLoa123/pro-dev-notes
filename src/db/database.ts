import Dexie, { type EntityTable } from 'dexie';

import type { Note } from '../features/notes/domain/Note';
import { plainTextToHtml } from './migrations/migrateToV2';

class AppDatabase extends Dexie {
  notes!: EntityTable<Note, 'id'>;

  constructor() {
    super('offline-notes-db');

    // Fase 1
    this.version(1).stores({
      notes: 'id, title, createdAt, updatedAt, isDeleted',
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
  }
}

export const db = new AppDatabase();