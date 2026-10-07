import type { Folder } from '../domain/Folder';
import { folderService } from '../services/folder.service';

interface FolderSidebarProps {
  folders: Folder[];
  selectedFolderId: string | null | undefined; //undefined = todas | null = sin carpeta | string = folderId
  onSelectFolder: (folderId: string | null | undefined) => void;
}

export function FolderSidebar({
  folders,
  selectedFolderId,
  onSelectFolder,
}: FolderSidebarProps) {
  const runAction = async (
    action: () => Promise<void>,
  ) => {
    try {
      await action();
    } catch (error) {
      console.error(error);
      window.alert(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error.',
      );
    }
  };

  const handleCreate = (
    parentId: string | null,
  ) => {
    const name = window.prompt(
      parentId
        ? 'Nombre de la subcarpeta'
        : 'Nombre de la carpeta',
    );

    if (!name) return;
    void runAction(async () => {
      await folderService.createFolder(name, parentId);
    });
  };

  const handleRename = (
    folder: Folder,
  ) => {
    const name = window.prompt('Nuevo nombre', folder.name);

    if (!name) return;
    void runAction(async () => {
      await folderService.renameFolder(folder.id, name);
    });
  };

  const handleDelete = (
    folder: Folder,
  ) => {
    const confirmed = window.confirm(
      `¿Eliminar la carpeta "${folder.name}"?\n\n` +
      'Las notas perderan su folder y las subcarpetas subirán un nivel.',
    );

    if (!confirmed) return;

    void runAction(async () => {
      await folderService.deleteFolder(folder.id);
      if (selectedFolderId === folder.id) onSelectFolder(undefined);
    });
  };

  const handleMove = (
    folder: Folder,
    parentId: string | null,
  ) => {
    void runAction(async () => {
      await folderService.moveFolder(folder.id, parentId);
    });
  };

  const folderIds = new Set(folders.map((folder) => folder.id));

  const getChildren = (
    parentId: string | null,
  ) =>
    folders.filter((folder) => {
      if (parentId === null) {
        return (
          folder.parentId === null ||
          !folderIds.has(folder.parentId)
        );
      }
      return folder.parentId === parentId;
    });

  const renderFolders = (
    parentId: string | null,
    visited = new Set<string>(),
  ): React.ReactNode => {
    const children = getChildren(parentId);

    return children.map((folder) => {
      if (visited.has(folder.id)) return null;

      const nextVisited = new Set(visited);
      nextVisited.add(folder.id);
      const selected = selectedFolderId === folder.id;

      return (
        <div key={folder.id}>

          <div className={`
            flex items-center gap-1 rounded-md p-1
            ${selected ? 'bg-violet-100' : 'hover:bg-gray-100'}
          `}>
            <button
              type="button"
              onClick={() => onSelectFolder(folder.id)}
              className="min-w-0 flex-1 truncate rounded px-2 py-1 text-left text-sm"
            >
              📁 {folder.name}
            </button>

            <button
              type="button"
              title="Crear subcarpeta"
              onClick={() => handleCreate(folder.id)}
              className="rounded px-2 py-1 hover:bg-gray-200"
            >
              +
            </button>

            <button
              type="button"
              title="Renombrar"
              onClick={() => handleRename(folder)}
              className="rounded px-2 py-1 hover:bg-gray-200"
            >
              ✎
            </button>

            <button
              type="button"
              title="Eliminar"
              onClick={() => handleDelete(folder)}
              className="rounded px-2 py-1 hover:bg-red-100"
            >
              ×
            </button>
          </div>

          <div className="ml-4">
            <select
              aria-label={`Mover ${folder.name}`}
              value={folder.parentId ?? ''}
              onChange={(event) => {
                const value = event.target.value;
                handleMove(folder, value || null);
              }}
              className="my-1 w-full rounded border border-gray-200 bg-white px-2 py-1 text-xs"
            >
              <option value="">Mover a raíz</option>
              {folders
                .filter((candidate) => candidate.id !== folder.id)
                .map((candidate) => (
                  <option
                    key={candidate.id}
                    value={candidate.id}
                  >
                    {candidate.name}
                  </option>
                ))}
            </select>

            <div className="border-l border-gray-200 pl-2">
              {renderFolders(folder.id, nextVisited)}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">
          Carpetas
        </h2>

        <button
          type="button"
          onClick={() => handleCreate(null)}
          className="rounded bg-violet-600 px-3 py-1 text-sm text-white hover:bg-violet-700"
        >
          + Carpeta
        </button>
      </div>

      <div className="space-y-1">
        <button
          type="button"
          onClick={() => onSelectFolder(undefined)}
          className={`
            w-full rounded-md
            px-3 py-2 text-left text-sm
            ${selectedFolderId === undefined ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}
          `}
        >
          📝 Todas las notas
        </button>

        <button
          type="button"
          onClick={() => onSelectFolder(null)}
          className={`
            w-full rounded-md
            px-3 py-2 text-left text-sm
            ${selectedFolderId === null ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}
          `}
        >
          📄 Sin carpeta
        </button>
      </div>

      <div>
        {folders.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-gray-500">No tienes carpetas.</p>
        ) : (
          renderFolders(null)
        )}
      </div>
    </div>
  );
}