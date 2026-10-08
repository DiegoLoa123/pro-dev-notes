import { useLiveQuery } from 'dexie-react-hooks';
import type { Tag } from '../domain/Tag';
import { tagService } from '../services/tag.service';

interface NoteTagsProps {
  noteId: string;
  tags: Tag[];
}

export function NoteTags({noteId, tags}: NoteTagsProps) {
  const noteTags = useLiveQuery(() => tagService.getTagsByNote(noteId), [noteId], [],);
  const selectedIds = new Set(noteTags.map((tag) => tag.id));

  const handleChange =
    async (tag: Tag, checked: boolean) => {
      try {
        if (checked) {
          await tagService.addTagToNote(noteId, tag.id);
        } else {
          await tagService.removeTagFromNote(noteId, tag.id);
        }
      } catch (error) {
        console.error(error);
        window.alert(
          error instanceof Error
            ? error.message : 'No se pudo modificar el tag.',
        );
      }
    };

  return (
    <div className="mt-3 rounded-md border p-3">
      <p className="mb-2 text-sm font-medium">
        Tags de la nota
      </p>

      {tags.length === 0 && (
        <p className="text-sm text-gray-500">
          Primero crea un tag.
        </p>
      )}

      <div className=" flex flex-wrap gap-2 " >
        {tags.map(
          (tag) => {
            const checked = selectedIds.has(tag.id);
            return (
              <label
                key={tag.id}
                className={`cursor-pointer rounded-full border px-3 py-1 text-sm
                  ${checked
                    ? 'border-violet-500 bg-violet-100 text-violet-700'
                    : 'border-gray-300 hover:bg-gray-100'
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => {void handleChange(tag, event.target.checked)}}
                  className="sr-only"
                />
                #{tag.name}
              </label>
            );
          },
        )}
      </div>
    </div>
  );
}