import type { Tag } from '../domain/Tag';
import { tagService } from '../services/tag.service';

interface TagManagerProps {
  tags: Tag[];
  selectedTagId: string | null;
  onSelectTag: (tagId: string | null) => void;
}

export function TagManager({tags, selectedTagId, onSelectTag}: TagManagerProps) {
  const runAction = async (action: () => Promise<void>) => {
    try {
      await action();
    } catch (error) {
      console.error(error);

      window.alert(
        error instanceof Error
          ? error.message : 'Ocurrió un error.',
      );
    }
  };

  const handleCreate = () => {
    const name = window.prompt('Nombre del tag');
    if (!name) return;

    void runAction(
      async () => {
        await tagService.createTag(name);
      },
    );
  };

  const handleRename = (tag: Tag) => {
    const name = window.prompt('Nuevo nombre', tag.name);
    if (!name) return;

    void runAction(
      async () => {
        await tagService.renameTag(tag.id, name);
      },
    );
  };

  const handleDelete = (tag: Tag) => {
    const confirmed = window.confirm(
      `¿Eliminar el tag #${tag.name}?\n\n` +
      'Se quitará de todas las notas.',
    );
    if (!confirmed) return;

    void runAction(
      async () => {
        await tagService.deleteTag(tag.id);
        if (selectedTagId === tag.id) onSelectTag(null);
      },
    );
  };

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold">Tags</h2>

        <button
          type="button"
          onClick={handleCreate}
          className="rounded bg-violet-600 px-2 py-1 text-sm text-white hover:bg-violet-700"
        >
          + Tag
        </button>
      </div>

      <button
        type="button"
        onClick={() => onSelectTag(null)}
        className={`mb-1 w-full rounded-md px-3 py-2 text-left text-sm
          ${selectedTagId === null
            ? 'bg-gray-200 font-medium'
            : 'hover:bg-gray-100'
          }
        `}
      >
        🏷 Todos los tags
      </button>

      <div className="space-y-1">
        {tags.map(
          (tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-1"
            >
              <button
                type="button"
                onClick={() => onSelectTag(tag.id)}
                className={`min-w-0 flex-1 truncate rounded-md px-3 py-2 text-left text-sm
                  ${selectedTagId === tag.id
                    ? 'bg-violet-100 font-medium'
                    : 'hover:bg-gray-100'
                  }
                `}
              >
                #{tag.name}
              </button>

              <button
                type="button"
                title="Renombrar tag"
                onClick={() =>handleRename(tag)}
                className="rounded px-2 py-1 hover:bg-gray-200"
              >
                ✎
              </button>

              <button
                type="button"
                title="Eliminar tag"
                onClick={() => handleDelete(tag)}
                className="rounded px-2 py-1 hover:bg-red-100"
              >
                x
              </button>
            </div>
          ),
        )}

      </div>
      {tags.length === 0 && (
        <p className="py-3 text-center text-sm text-gray-500">No tienes tags.</p>
      )}
    </section>
  );
}