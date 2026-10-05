import type { Note } from '../domain/Note';
import { noteRepository } from '../repositories/note.repository';

class NoteService {
  async getNotes(): Promise<Note[]> {
    return noteRepository.findAll();
  }

  async getDeletedNotes(): Promise<Note[]> {
    return noteRepository.findDeleted();
  }

  async getNoteById(id: string): Promise<Note | undefined> {
    return noteRepository.findById(id);
  }

  async createNote(
    title: string,
    content: string,
  ): Promise<Note> {
    const now = Date.now();

    const note: Note = {
      id: crypto.randomUUID(),

      title: title.trim() || 'Sin título',
      content,

      createdAt: now,
      updatedAt: now,

      isDeleted: 0, //0 == false
      deletedAt: null,
    };

    await noteRepository.create(note);

    return note;
  }

  async updateNote(
    id: string,
    data: {
      title?: string;
      content?: string;
    },
  ): Promise<void> {
    const note = await noteRepository.findById(id);

    if (!note) throw new Error('La nota no existe.');
    if (note.isDeleted) throw new Error('No se puede editar una nota eliminada.');

    await noteRepository.update(id, {
      ...data,

      title:
        data.title !== undefined
          ? data.title.trim() || 'Sin título'
          : note.title,

      updatedAt: Date.now(),
    });
  }

  async moveToTrash(id: string): Promise<void> {
    const note = await noteRepository.findById(id);

    if (!note) throw new Error('La nota no existe.');
    if (note.isDeleted) return;

    await noteRepository.update(id, {
      isDeleted: 1, //1 == true
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  async restoreNote(id: string): Promise<void> {
    const note = await noteRepository.findById(id);

    if (!note) throw new Error('La nota no existe.');
    if (!note.isDeleted) return;

    await noteRepository.update(id, {
      isDeleted: 0, //0 == false
      deletedAt: null,
      updatedAt: Date.now(),
    });
  }

  async deletePermanently(id: string): Promise<void> {
    const note = await noteRepository.findById(id);
    if (!note) throw new Error('La nota no existe.');
    await noteRepository.delete(id);
  }
}

export const noteService = new NoteService();