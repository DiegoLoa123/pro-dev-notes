import type { Note } from '../domain/Note';
import { noteRepository } from '../repositories/note.repository';
import { folderService } from '../../folders/services/folder.service';

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
      folderId: null,

      createdAt: now,
      updatedAt: now,

      isDeleted: 0,
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
      isDeleted: 1,
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  async restoreNote(id: string): Promise<void> {
    const note = await noteRepository.findById(id);

    if (!note) throw new Error('La nota no existe.');
    if (!note.isDeleted) return;

    await noteRepository.update(id, {
      isDeleted: 0,
      deletedAt: null,
      updatedAt: Date.now(),
    });
  }

  async deletePermanently(id: string): Promise<void> {
    const note = await noteRepository.findById(id);
    if (!note) throw new Error('La nota no existe.');
    await noteRepository.delete(id);
  }


  /* MOVE*/
  async moveNoteToFolder(
    noteId: string,
    folderId: string | null,
  ): Promise<void> {
    const note = await noteRepository.findById(noteId);

    if (!note) throw new Error('La nota no existe.');
    if (note.isDeleted) throw new Error('No se puede mover una nota eliminada.');

    if (folderId !== null) {
      const folder = await folderService.getFolderById(folderId);
      if (!folder) throw new Error('La carpeta destino no existe.');
    }

    await noteRepository.update(
      noteId,
      {
        folderId,
        updatedAt: Date.now(),
      },
    );

  }
}

export const noteService = new NoteService();