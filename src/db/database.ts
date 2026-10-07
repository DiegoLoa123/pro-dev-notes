import Dexie, {type EntityTable} from 'dexie';

import type { Note } from '../features/notes/domain/Note';
import type { Folder } from '../features/folders/domain/Folder';
import type {Tag, NoteTag} from '../features/tags/domain/Tag';

import { plainTextToHtml } from './migrations/migrateToV2';

class AppDatabase extends Dexie {
  notes!: EntityTable<Note, 'id'>;
  folders!: EntityTable<Folder, 'id'>;
  tags!: EntityTable<Tag, 'id'>;
  noteTags!: EntityTable<NoteTag, 'id'>;

  constructor() {
    super('offline-notes-db');

    // VERSION 1
    this.version(1).stores({
      notes: 'id, title, createdAt, updatedAt, isDeleted',
      folders: 'id, name, parentId, createdAt, updatedAt',
    });

    // VERSION 2
    this.version(2)
      .stores({
        notes: 'id, title, createdAt, updatedAt, isDeleted',
      })
      .upgrade(
        async (transaction) => {
          await transaction
            .table<Note, string>('notes')
            .toCollection()
            .modify((note) => {
              note.content = plainTextToHtml(note.content);
            });
        },
      );

    // VERSION 3 - FOLDERS
    this.version(3)
      .stores({
        notes: 'id, title, folderId, createdAt, updatedAt, isDeleted',
        folders: 'id, name, parentId, createdAt, updatedAt',
      })
      .upgrade(
        async (transaction) => {
          await transaction
            .table<Note, string>('notes')
            .toCollection()
            .modify((note) => {note.folderId = null});
        },
      );

    // =========================
    // VERSION 4 - TAGS
    // =========================
    this.version(4).stores({
      notes: 'id, title, folderId, createdAt, updatedAt, isDeleted',
      folders: 'id, name, parentId, createdAt, updatedAt',
      tags: 'id, &name, createdAt, updatedAt',
      noteTags: 'id, noteId, tagId, &[noteId+tagId]',
    });
  }
}

export const db = new AppDatabase();