import { db } from '../../../db/database';
import type { NoteLink } from '../domain/NoteLink';

class InterlinkRepository {
  async findOutgoing(sourceNoteId: string): Promise<NoteLink[]> {
    return db.noteLinks
      .where('sourceNoteId')
      .equals(sourceNoteId)
      .toArray();
  }

  async findIncoming(targetNoteId: string): Promise<NoteLink[]> {
    return db.noteLinks
      .where('targetNoteId')
      .equals(targetNoteId)
      .toArray();
  }

  /**
   * Sincroniza las relaciones de una nota con los IDs presentes en su contenido.
   * Crea relaciones nuevas y elimina las que ya no aparecen.
   */
  async syncOutgoing(sourceNoteId: string, targetNoteIds: string[]): Promise<void> {
    await db.transaction(
      'rw',
      db.notes,
      db.noteLinks,
      async () => {
        const source = await db.notes.get(sourceNoteId);
        if (!source || source.isDeleted) throw new Error('La nota de origen no existe o está eliminada.');

        const desired = new Set(targetNoteIds.filter((id) => id && id !== sourceNoteId));
        const current = await db.noteLinks
          .where('sourceNoteId')
          .equals(sourceNoteId)
          .toArray();

        const currentIds = new Set(current.map((link) => link.targetNoteId));

        const toDelete = current
          .filter((link) => !desired.has(link.targetNoteId))
          .map((link) => link.id);

        const toCreate = [...desired]
          .filter((id) => !currentIds.has(id))
          .map((targetNoteId): NoteLink => ({
            id: crypto.randomUUID(),
            sourceNoteId,
            targetNoteId,
            createdAt: Date.now(),
          }));

        if (toDelete.length > 0) await db.noteLinks.bulkDelete(toDelete);
        if (toCreate.length > 0) await db.noteLinks.bulkAdd(toCreate);
      },
    );
  }
}

export const interlinkRepository = new InterlinkRepository();