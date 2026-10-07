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

  private normalizeName(name: string): string {
    const normalizedName = name.trim();
    if (!normalizedName) throw new Error('El nombre de la carpeta es obligatorio.');

    return normalizedName;
  }

  private async requireFolder(
    id: string,
  ): Promise<Folder> {
    const folder = await folderRepository.findById(id);
    if (!folder) throw new Error('La carpeta no existe.');

    return folder;
  }

  private async validateUniqueName(
    name: string,
    parentId: string | null,
    excludeId?: string,
  ): Promise<void> {
    const folders = await folderRepository.findAll();
    const normalizedName = name.toLocaleLowerCase();
    const duplicated = folders.some(
      (folder) =>
        folder.id !== excludeId &&
        folder.parentId === parentId &&
        folder.name.toLocaleLowerCase() === normalizedName,
    );

    if (duplicated) throw new Error('Ya existe una carpeta con ese nombre en este nivel.');
  }

  /**
   * Comprueba que mover una carpeta
   * no produzca: A -> B -> A
   */
  private async validateParent(
    folderId: string,
    parentId: string | null,
  ): Promise<void> {
    if (parentId === null) return;
    if (folderId === parentId) throw new Error('Una carpeta no puede contenerse a sí misma.');

    let currentId: string | null = parentId;
    const visited = new Set<string>();

    while (currentId !== null) {
      if (currentId === folderId) throw new Error('No se puede mover una carpeta dentro de una de sus subcarpetas.');
      if (visited.has(currentId)) throw new Error('La jerarquía de carpetas contiene un ciclo.');

      visited.add(currentId);
      const current = await folderRepository.findById(currentId);
      if (!current) throw new Error('La carpeta destino no existe.');

      currentId = current.parentId;
    }
  }

  async createFolder(
    name: string,
    parentId: string | null = null,
  ): Promise<Folder> {
    const normalizedName = this.normalizeName(name);

    if (parentId !== null) {
      await this.requireFolder(parentId);
    }
    await this.validateUniqueName(normalizedName, parentId);
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
    const folder = await this.requireFolder(id);
    const normalizedName = this.normalizeName(name);
    await this.validateUniqueName(normalizedName, folder.parentId, id);

    await folderRepository.update(
      id,
      {
        name: normalizedName,
        updatedAt: Date.now(),
      },
    );
  }

  async moveFolder(
    id: string,
    parentId: string | null,
  ): Promise<void> {
    const folder = await this.requireFolder(id);

    if (folder.parentId === parentId) return;

    await this.validateParent(id, parentId);
    await this.validateUniqueName(folder.name, parentId, id);
    await folderRepository.update(
      id,
      {
        parentId,
        updatedAt: Date.now(),
      },
    );
  }

  async deleteFolder(
    id: string,
  ): Promise<void> {
    const folder = await this.requireFolder(id);
    await folderRepository.deletePreservingContent(folder);
  }
}

export const folderService = new FolderService();