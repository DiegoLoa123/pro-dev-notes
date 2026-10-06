import type { Folder } from '../domain/Folder';
import { folderRepository } from '../repositories/folder.repository';

class FolderService {
  async getFolders(): Promise<Folder[]> {
    return folderRepository.findAll();
  }

  async getFolderById(
    id: string,
  ): Promise<Folder | undefined> {
    return folderRepository.findById(id);
  }

  async createFolder(
    name: string,
    parentId: string | null = null,
  ): Promise<Folder> {
    const normalizedName = name.trim();
    if (!normalizedName) throw new Error('El nombre de la carpeta es obligatorio.');

    const now = Date.now();
    const folder: Folder = {
      id: crypto.randomUUID(),
      name: normalizedName,

      parentId,

      createdAt: now,
      updatedAt: now,
    };

    await folderRepository.create(folder);
    return folder;
  }

  async renameFolder(
    id: string,
    name: string,
  ): Promise<void> {
    const folder = await folderRepository.findById(id);
    if (!folder) throw new Error('La carpeta no existe.');

    const normalizedName = name.trim();
    if (!normalizedName) throw new Error('El nombre de la carpeta es obligatorio.');

    await folderRepository.update(
      id,
      {
        name: normalizedName,
        updatedAt: Date.now(),
      },
    );
  }
}

export const folderService = new FolderService();