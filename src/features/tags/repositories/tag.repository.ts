import { db } from '../../../db/database';
import type { Tag, NoteTag } from '../domain/Tag';

class TagRepository {
  async findAll(): Promise<Tag[]> {
    const tags = await db.tags.toArray();
    return tags.sort(
      (a, b) => a.name.localeCompare(b.name),
    );
  }

  async findById(id: string): Promise<Tag | undefined> {
    return db.tags.get(id);
  }

  async findByName(name: string): Promise<Tag | undefined> {
    return db.tags
      .where('name')
      .equals(name)
      .first();
  }

  async create(tag: Tag): Promise<string> {
    return db.tags.add(tag);
  }

  async update(id: string, changes: Partial<Tag>): Promise<number> {
    return db.tags.update(id, changes);
  }

  async delete(id: string): Promise<void> {
    await db.transaction(
      'rw',
      db.tags,
      db.noteTags,
      async () => {
        await db.noteTags
          .where('tagId')
          .equals(id)
          .delete();

        await db.tags.delete(id);
      },
    );
  }

  async addToNote(noteTag: NoteTag): Promise<string> {
    return db.noteTags.add(noteTag);
  }

  async removeFromNote(noteId: string, tagId: string): Promise<void> {
    await db.noteTags
      .where('[noteId+tagId]')
      .equals([noteId, tagId])
      .delete();
  }

  async existsOnNote(noteId: string, tagId: string): Promise<boolean> {
    const relation =
      await db.noteTags
        .where('[noteId+tagId]')
        .equals([noteId, tagId])
        .first();

    return Boolean(relation);
  }

  async findByNoteId(noteId: string): Promise<Tag[]> {
    const relations = await db.noteTags
      .where('noteId')
      .equals(noteId)
      .toArray();

    if (relations.length === 0) return [];

    const tags = await db.tags.bulkGet(relations.map((relation) => relation.tagId));

    return tags
      .filter((tag): tag is Tag => tag !== undefined)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async findNoteIdsByTag(tagId: string): Promise<string[]> {
    const relations = await db.noteTags
      .where('tagId')
      .equals(tagId)
      .toArray();

    return relations.map((relation) => relation.noteId);
  }

  async deleteRelationsByNote(noteId: string): Promise<void> {
    await db.noteTags
      .where('noteId')
      .equals(noteId)
      .delete();
  }
}

export const tagRepository = new TagRepository();