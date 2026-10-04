import { db } from '../../../db/database';
import type { Note } from '../domain/Note';

class NoteRepository {
  async findAll(): Promise<Note[]> {
    return db.notes
      .filter((note) => !note.isDeleted)
      .reverse()
      .sortBy('updatedAt');
  }

  async findDeleted(): Promise<Note[]> {
    return db.notes
      .filter((note) => note.isDeleted)
      .reverse()
      .sortBy('deletedAt');
  }

  async findById(id: string): Promise<Note | undefined> {
    return db.notes.get(id);
  }

  async create(note: Note): Promise<string> {
    return db.notes.add(note);
  }

  async update(
    id: string,
    changes: Partial<Note>,
  ): Promise<number> {
    return db.notes.update(id, changes);
  }

  async delete(id: string): Promise<void> {
    await db.notes.delete(id);
  }
}

export const noteRepository = new NoteRepository();