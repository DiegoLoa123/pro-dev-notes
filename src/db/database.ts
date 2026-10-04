import Dexie, { type EntityTable } from 'dexie';

import type { Note } from '../features/notes/domain/Note';

class AppDatabase extends Dexie {
  notes!: EntityTable<Note, 'id'>;

  constructor() {
    super('offline-notes-db');

    this.version(1).stores({
      notes: 'id, title, createdAt, updatedAt, isDeleted',
    });
  }
}

export const db = new AppDatabase();