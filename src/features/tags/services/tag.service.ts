import type {Tag, NoteTag} from '../domain/Tag';
import { tagRepository } from '../repositories/tag.repository';
import { noteService } from '../../notes/services/note.service';

class TagService {
  async getTags(): Promise<Tag[]> {
    return tagRepository.findAll();
  }

  async getTagById(id: string): Promise<Tag | undefined> {
    return tagRepository.findById(id);
  }

  private normalizeName(name: string): string {
    const normalized = name
        .trim()
        .replace(/^#+/, '')
        .replace(/\s+/g, ' ');

    if (!normalized) throw new Error('El nombre del tag es obligatorio.');
    return normalized;
  }

  private async validateUniqueName(name: string, excludeId?: string): Promise<void> {
    const tags = await tagRepository.findAll();
    const normalized = name.toLocaleLowerCase();

    const duplicated =
      tags.some(
        (tag) =>
          tag.id !== excludeId &&
          tag.name.toLocaleLowerCase() === normalized,
      );

    if (duplicated) throw new Error('Ya existe un tag con ese nombre.');
  }

  async createTag(name: string): Promise<Tag> {
    const normalizedName = this.normalizeName(name);
    await this.validateUniqueName(normalizedName);

    const now = Date.now();
    const tag: Tag = {
      id: crypto.randomUUID(),
      name: normalizedName,
      createdAt: now,
      updatedAt: now,
    };
    await tagRepository.create(tag);

    return tag;
  }

  async renameTag(id: string, name: string): Promise<void> {
    const tag = await tagRepository.findById(id);
    if (!tag) throw new Error('El tag no existe.');

    const normalizedName = this.normalizeName(name);
    await this.validateUniqueName(normalizedName, id);
    await tagRepository.update(
      id,
      {
        name: normalizedName,
        updatedAt: Date.now(),
      },
    );
  }

  async deleteTag(id: string): Promise<void> {
    const tag = await tagRepository.findById(id);
    if (!tag) throw new Error('El tag no existe.');
    await tagRepository.delete(id);
  }

  async addTagToNote(noteId: string, tagId: string): Promise<void> {
    const note = await noteService.getNoteById(noteId);

    if (!note) throw new Error('La nota no existe.');
    if (note.isDeleted) throw new Error('No se pueden modificar los tags de una nota eliminada.');

    const tag = await tagRepository.findById(tagId);
    if (!tag) throw new Error('El tag no existe.');

    const exists = await tagRepository.existsOnNote(noteId, tagId);
    if (exists) return;

    const relation: NoteTag = {
      id: crypto.randomUUID(),
      noteId,
      tagId,
    };
    await tagRepository.addToNote(relation);
  }

  async removeTagFromNote(noteId: string, tagId: string): Promise<void> {
    await tagRepository.removeFromNote(noteId, tagId);
  }

  async getTagsByNote(noteId: string): Promise<Tag[]> {
    return tagRepository.findByNoteId(noteId);
  }

  async getNoteIdsByTag(tagId: string): Promise<string[]> {
    return tagRepository.findNoteIdsByTag(tagId);
  }

  async deleteNoteRelations(noteId: string): Promise<void> {
    await tagRepository.deleteRelationsByNote(noteId);
  }
}

export const tagService = new TagService();