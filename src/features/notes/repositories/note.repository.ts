import { db } from '../../../db/database';
import type { Note } from '../domain/Note';

class NoteRepository {
  async findAll(): Promise<Note[]> {
    const notes = await db.notes
      .where('isDeleted')
      .equals(0)
      .toArray();

    return notes.sort(
      (a, b) => b.updatedAt - a.updatedAt,
    );
  }

  async findDeleted(): Promise<Note[]> {
    const notes = await db.notes
      .where('isDeleted')
      .equals(1)
      .toArray();

    return notes.sort(
      (a, b) =>
        (b.deletedAt ?? 0) -
        (a.deletedAt ?? 0),
    );
  }

  async findById(id: string): Promise<Note | undefined> {
    return db.notes.get(id);
  }

  async create(note: Note): Promise<string> {
    return db.notes.add(note);
  }

  async update(id: string, changes: Partial<Note>): Promise<number> {
    return db.notes.update(id, changes);
  }

  async delete(id: string): Promise<void> {
    await db.transaction(
      'rw',
      db.notes,
      db.noteTags,
      db.noteLinks,
      async () => {
        // Eliminar asociaciones con tags
        await db.noteTags
          .where('noteId')
          .equals(id)
          .delete();

        // Eliminar enlaces que salen de esta nota
        await db.noteLinks
          .where('sourceNoteId')
          .equals(id)
          .delete();

        // Eliminar la nota
        await db.notes.delete(id);
      },
    );
  }


  /**********/
  async findByFolderId(
    folderId: string,
  ): Promise<Note[]> {
    const notes = await db.notes
      .where('folderId')
      .equals(folderId)
      .toArray();

    return notes
      .filter((note) => note.isDeleted === 0)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async findUnfoldered(): Promise<Note[]> {
    const notes = await db.notes.toArray();
    return notes
      .filter(
        (note) =>
          note.isDeleted === 0 &&
          note.folderId === null,
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }
}

export const noteRepository = new NoteRepository();