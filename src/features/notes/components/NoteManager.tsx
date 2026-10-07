import { useEffect, useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';

import type { Note } from '../domain/Note';
import { noteService } from '../services/note.service';
import { NoteEditor } from '../../editor/components/NoteEditor';
import { folderService } from '../../folders/services/folder.service';
import { FolderSidebar } from '../../folders/components/FolderSidebar';

type ViewMode = | 'notes' | 'trash';

export function NoteManager() {
  const [viewMode, setViewMode] = useState<ViewMode>('notes');
  const [folderFilter, setFolderFilter] =
    useState<string | null | undefined>(undefined); //undefined = todas | null = sin carpeta | string = folderId

  const notes = useLiveQuery(() => noteService.getNotes(), [], [],);
  const deletedNotes = useLiveQuery(() => noteService.getDeletedNotes(), [], [],);
  const folders = useLiveQuery(() => folderService.getFolders(), [], [],);

  const visibleNotes =
    useMemo(() => {
      if (folderFilter === undefined) return notes;
      if (folderFilter === null) return notes.filter((note) => note.folderId === null);

      return notes.filter((note) => note.folderId === folderFilter);
    }, [notes, folderFilter]);

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [notesTitle, setNotesTitle] = useState('');
  const [notesContent, setNotesContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedNote = notes.find((note) => note.id === selectedNoteId) ?? null;
  const selectedDeletedNote = deletedNotes.find((note) => note.id === selectedNoteId) ?? null;

  const resetEditor = () => {
    setSelectedNoteId(null);
    setNotesTitle('');
    setNotesContent('');
    setIsDirty(false);
  };

  const handleNewNote = () => {
    resetEditor();
    setViewMode('notes');
  };

  const handleSelectNote = (
    note: Note,
  ) => {
    setSelectedNoteId(note.id);
    setNotesTitle(note.title);
    setNotesContent(note.content);
    setIsDirty(false);
  };

  const handleTitleChange = (
    value: string,
  ) => {
    setNotesTitle(value);
    setIsDirty(true);
  };

  const handleContentChange = (
    value: string,
  ) => {
    setNotesContent(value);
    setIsDirty(true);
  };

  const saveCurrentNote =
    async () => {
      if (!isDirty) return;
      setIsSaving(true);

      try {
        if (selectedNoteId) {
          await noteService.updateNote(
            selectedNoteId,
            {
              title: notesTitle,
              content: notesContent,
            },
          );
        } else {
          const initialFolderId =
            typeof folderFilter === 'string'
              ? folderFilter : null;

          const newNote = await noteService.createNote(notesTitle, notesContent, initialFolderId);
          setSelectedNoteId(newNote.id);
          setNotesTitle(newNote.title);
          setNotesContent(newNote.content);
        }
        setIsDirty(false);

      } catch (error) {
        console.error('Error guardando nota:', error)
      } finally { setIsSaving(false) }
    };

  useEffect(() => {
    if (!isDirty) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      void saveCurrentNote() }, 1000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [notesTitle, notesContent, isDirty, selectedNoteId]);

  const handleMoveToTrash =
    async () => {
      if (!selectedNoteId) return;
      await noteService.moveToTrash(selectedNoteId);
      resetEditor();
    };

  const handleRestore =
    async (noteId: string) => {
      await noteService.restoreNote(noteId);
      resetEditor();
    };

  const handleDeletePermanently =
    async (noteId: string) => {
      const confirmed = window.confirm('¿Eliminar esta nota definitivamente?');
      if (!confirmed) return;
      await noteService.deletePermanently(noteId);
      resetEditor();
    };

  const handleChangeView = (
    mode: ViewMode,
  ) => {
    setViewMode(mode);
    resetEditor();
  };

  const handleMoveNote =
    async (folderId: string | null) => {
      if (!selectedNote) return;
      try {
        await noteService.moveNoteToFolder(selectedNote.id, folderId);
        setFolderFilter(folderId); //Después de mover, mostrar la carpeta destino.

      } catch (error) {
        console.error(error);
        window.alert(
          error instanceof Error
            ? error.message : 'No se pudo mover la nota.',
        );
      }
    };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-7xl p-4">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Offline Notes</h1>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleNewNote}
              className="rounded bg-violet-600 px-4 py-2 text-white hover:bg-violet-700"
            >
              + Nueva nota
            </button>

            <button
              type="button"
              onClick={() => handleChangeView('notes')}
              className="rounded border bg-white px-4 py-2 hover:bg-gray-100"
            >
              Notas
            </button>

            <button
              type="button"
              onClick={() => handleChangeView('trash')}
              className="rounded border bg-white px-4 py-2 hover:bg-gray-100"
            >
              Papelera
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-lg border bg-white p-3">
            {viewMode === 'notes' && (
              <>
                <FolderSidebar
                  folders={folders}
                  selectedFolderId={folderFilter}
                  onSelectFolder={setFolderFilter}
                />
                <hr className="my-4" />
                <h2 className="mb-2 font-semibold">Notas</h2>

                {visibleNotes.length === 0 && (
                  <p className="py-4 text-center text-sm text-gray-500">
                    No tienes notas.
                  </p>
                )}

                <div className="space-y-1">
                  {visibleNotes.map(
                    (note) => (
                      <button
                        type="button"
                        key={note.id}
                        onClick={() => handleSelectNote(note)}
                        className={`w-full truncate rounded-md px-3 py-2 text-left
                          ${selectedNoteId === note.id ? 'bg-violet-100 font-medium' : 'hover:bg-gray-100'}`}
                      >
                        {note.title}
                      </button>
                    ),
                  )}
                </div>
              </>
            )}

            {viewMode === 'trash' && (
              <>
                <h2 className="mb-2 font-semibold">Papelera</h2>
                {deletedNotes.length === 0 && (
                  <p className="text-sm text-gray-500">
                    La papelera está vacía.
                  </p>
                )}

                <div className="space-y-1">
                  {deletedNotes.map(
                    (note) => (
                      <button
                        type="button"
                        key={note.id}
                        onClick={() => handleSelectNote(note)}
                        className="w-full truncate rounded-md px-3 py-2 text-left hover:bg-gray-100"
                      >
                        {note.title}
                      </button>
                    ),
                  )}
                </div>
              </>
            )}
          </aside>

          <main className="min-w-0 rounded-lg border bg-white p-5">
            {viewMode === 'notes' && (
              <>
                <section className="mb-4 flex flex-col gap-4 md:flex-row md:items-end">
                  <div className="flex-1">
                    <label htmlFor="title" className="mb-1 block text-sm font-medium">Título</label>

                    <input
                      id="title"
                      value={notesTitle}
                      onChange={(event) => handleTitleChange(event.target.value)}
                      placeholder="Título de la nota"
                      className="w-full rounded-md border px-3 py-2 outline-none focus:border-violet-500"
                    />
                  </div>

                  {selectedNote && (
                    <div className="w-full md:w-56">
                      <label htmlFor="folder" className="mb-1 block text-sm font-medium">
                        Carpeta
                      </label>

                      <select
                        id="folder"
                        value={selectedNote.folderId ?? ''}
                        onChange={(event) => {
                          const value = event.target.value;
                          void handleMoveNote(value || null);
                        }}
                        className="w-full rounded-md border bg-white px-3 py-2 outline-none focus:border-violet-500"
                      >
                        <option value="">Sin carpeta</option>
                        {folders.map(
                          (folder) => (
                            <option
                              key={folder.id}
                              value={folder.id}
                            >
                              {folder.name}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                  )}
                </section>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Contenido
                  </label>
                  <NoteEditor
                    content={notesContent}
                    onChange={handleContentChange}
                  />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-sm text-gray-500">
                    Estado:{' '}
                    {isSaving
                      ? 'Guardando...'
                      : isDirty
                        ? 'Cambios pendientes'
                        : 'Guardado'}
                  </p>

                  {selectedNote && (
                    <button
                      type="button"
                      onClick={handleMoveToTrash}
                      className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Enviar a papelera
                    </button>
                  )}
                </div>
              </>
            )}

            {viewMode === 'trash' &&
              selectedDeletedNote && (
                <>
                  <h2 className="mb-4 text-xl font-semibold">{selectedDeletedNote.title}</h2>
                  <NoteEditor
                    content={selectedDeletedNote.content}
                    editable={false}
                  />
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleRestore(selectedDeletedNote.id)}
                      className="rounded bg-violet-600 px-4 py-2 text-white"
                    >
                      Restaurar
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeletePermanently(selectedDeletedNote.id)}
                      className="rounded border border-red-300 px-4 py-2 text-red-600"
                    >
                      Eliminar definitivamente
                    </button>
                  </div>
                </>
              )}
          </main>
        </div>
      </div>
    </div>
  );
}