import type { Note } from '../domain/Note';
import type { Folder } from '../../folders/domain/Folder';
import type { Tag } from '../../tags/domain/Tag';

import { FolderSidebar } from '../../folders/components/FolderSidebar';
import { TagManager } from '../../tags/components/TagManager';

interface NotesSidebarProps {
  viewMode: 'notes' | 'trash';

  notes: Note[];
  deletedNotes: Note[];

  folders: Folder[];
  tags: Tag[];

  selectedNoteId: string | null;

  folderFilter: string | null | undefined;
  tagFilter: string | null;

  onSelectFolder: (folderId: string | null | undefined) => void;
  onSelectTag: (tagId: string | null) => void;
  onSelectNote: (note: Note) => void;
}

export function NotesSidebar({
  viewMode,
  notes,
  deletedNotes,
  folders,
  tags,
  selectedNoteId,
  folderFilter,
  tagFilter,
  onSelectFolder,
  onSelectTag,
  onSelectNote,
}: NotesSidebarProps) {
  const isTrash = viewMode === 'trash';
  const displayedNotes = isTrash ? deletedNotes : notes;

  return (
    <div className="space-y-4">
      {!isTrash && (
        <FolderSidebar
          folders={folders}
          selectedFolderId={folderFilter}
          onSelectFolder={onSelectFolder}
        />
      )}

      <section>
        <h2 className="mb-2 font-semibold">
          {isTrash ? 'Papelera' : 'Notas'}
        </h2>

        {displayedNotes.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-500">
            {isTrash ? 'La papelera está vacía.' : 'No tienes notas.'}
          </p>
        )}

        <div className="space-y-1">
          {displayedNotes.map((note) => {
            const isSelected = selectedNoteId === note.id;

            return (
              <button
                key={note.id}
                type="button"
                onClick={() => onSelectNote(note)}
                className={[
                  'w-full truncate rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  isSelected
                    ? 'bg-violet-100 font-medium text-violet-900'
                    : 'hover:bg-gray-100',
                ].join(' ')}
              >
                {note.title || 'Sin título'}
              </button>
            );
          })}
        </div>
      </section>

      {!isTrash && (
        <div className="border-t border-gray-200 pt-4">
          <TagManager
            tags={tags}
            selectedTagId={tagFilter}
            onSelectTag={onSelectTag}
          />
        </div>
      )}
    </div>
  );
}