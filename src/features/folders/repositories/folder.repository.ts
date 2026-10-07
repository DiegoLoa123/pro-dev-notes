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

  /**
   * Elimina la carpeta sin eliminar contenido.
   * - Las notas pasan a "Sin carpeta".
   * - Las subcarpetas pasan al padre de la carpeta eliminada.
   */
  async deletePreservingContent(
    folder: Folder,
  ): Promise<void> {

    const now = Date.now();

    await db.transaction(
      'rw',
      db.folders,
      db.notes,
      async () => {

        await db.notes
          .where('folderId')
          .equals(folder.id)
          .modify({
            folderId: null,
            updatedAt: now,
          });

        await db.folders
          .where('parentId')
          .equals(folder.id)
          .modify({
            parentId: folder.parentId,
            updatedAt: now,
          });

        await db.folders.delete(folder.id);
      },
    );
  }
}

export const folderRepository = new FolderRepository();