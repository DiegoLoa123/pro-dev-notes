import type { NoteLink } from '../domain/NoteLink';
import { interlinkRepository } from '../repositories/interlink.repository';
import { noteRepository } from '../../notes/repositories/note.repository';

class InterlinkService {
  async getOutgoingLinks(noteId: string): Promise<NoteLink[]> {
    return interlinkRepository.findOutgoing(noteId);
  }

  async getIncomingLinks(noteId: string): Promise<NoteLink[]> {
    return interlinkRepository.findIncoming(noteId);
  }

  async syncLinks(sourceNoteId: string, targetNoteIds: string[]): Promise<void> {
    await interlinkRepository.syncOutgoing(sourceNoteId, targetNoteIds);
  }

  extractTargetIds(html: string): string[] {
    const ids = new Set<string>();
    const regex = /data-note-id=["']([^"']+)["']/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(html)) !== null) {
      if (match[1]) ids.add(match[1]);
    }
    return [...ids];
  }

  async syncFromContent(sourceNoteId: string, html: string): Promise<void> {
    const targetIds = this.extractTargetIds(html);
    await this.syncLinks(sourceNoteId, targetIds);
  }

  async getBrokenLinks(sourceNoteId: string): Promise<NoteLink[]> {
    const links = await interlinkRepository.findOutgoing(sourceNoteId);

    const notes = await Promise.all(
      links.map(
        (link) => noteRepository.findById(link.targetNoteId),
      ),
    );

    return links.filter(
      (_, index) => !notes[index] || notes[index]?.isDeleted === 1,
    );
  }
}

export const interlinkService = new InterlinkService();