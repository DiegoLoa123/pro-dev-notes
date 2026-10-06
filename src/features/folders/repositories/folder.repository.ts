import { db } from '../../../db/database';
import type { Folder } from '../domain/Folder';

class FolderRepository {
  async findAll(): Promise<Folder[]> {
    const folders = await db.folders.toArray();

    return folders.sort(
      (a, b) => a.name.localeCompare(b.name),
    );
  }

  async findById(
    id: string,
  ): Promise<Folder | undefined> {
    return db.folders.get(id);
  }

  async create(
    folder: Folder,
  ): Promise<string> {
    return db.folders.add(folder);
  }

  async update(
    id: string,
    changes: Partial<Folder>,
  ): Promise<number> {
    return db.folders.update(id, changes);
  }

  async delete(
    id: string,
  ): Promise<void> {
    await db.folders.delete(id);
  }
}

export const folderRepository = new FolderRepository();