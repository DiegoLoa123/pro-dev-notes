import { useEffect, useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';

import type { Note } from '../domain/Note';
import { noteService } from '../services/note.service';
import { NoteEditor } from '../../editor/components/NoteEditor';
import { folderService } from '../../folders/services/folder.service';
import { FolderSidebar } from '../../folders/components/FolderSidebar';
import { tagService } from '../../tags/services/tag.service';
import { TagManager } from '../../tags/components/TagManager';
import { NoteTags } from '../../tags/components/NoteTags';

import { interlinkService } from '../../interlinks/services/interlink.service';

type ViewMode = | 'notes' | 'trash';

export function NoteManager() {
  const [viewMode, setViewMode] = useState<ViewMode>('notes');

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [notesTitle, setNotesTitle] = useState('');
  const [notesContent, setNotesContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const [backHistory, setBackHistory] = useState<string[]>([]);
  const [forwardHistory, setForwardHistory] = useState<string[]>([]);
  const [isReadMode, setIsReadMode] = useState(false);

  //undefined = todas | null = sin carpeta | string = folderId
  const [folderFilter, setFolderFilter] = useState<string | null | undefined>(undefined);

  const notes = useLiveQuery(() => noteService.getNotes(), [], [],);
  const deletedNotes = useLiveQuery(() => noteService.getDeletedNotes(), [], [],);
  const folders = useLiveQuery(() => folderService.getFolders(), [], [],);
  const tags = useLiveQuery(() => tagService.getTags(), [], [],);

  const noteIdsByTag = useLiveQuery(() =>
    tagFilter
      ? tagService.getNoteIdsByTag(tagFilter)
      : Promise.resolve<string[]>([]),
    [tagFilter],[],
  );
  
  const brokenLinks =
    useLiveQuery(
      () => selectedNoteId
        ? interlinkService.getBrokenLinks(selectedNoteId)
        : Promise.resolve([]),
      [selectedNoteId, notesContent], [],
    );

  const visibleNotes = useMemo(() => {
    let result = notes;

    // FILTRO POR CARPETA
    if (folderFilter === null) {
      result = result.filter((note) => note.folderId === null);
    } else if (folderFilter !== undefined) {
      result = result.filter((note) => note.folderId === folderFilter);
    }

    // FILTRO POR TAG
    if (tagFilter !== null) {
      const noteIds = new Set(noteIdsByTag);
      result = result.filter((note) => noteIds.has(note.id));
    }
    return result;
  }, [notes, folderFilter, tagFilter, noteIdsByTag]);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedNote = notes.find((note) => note.id === selectedNoteId) ?? null;
  const selectedDeletedNote = deletedNotes.find((note) => note.id === selectedNoteId) ?? null;

  const resetEditor = () => {
    // Cancela cualquier autosave pendiente
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    setSelectedNoteId(null);
    setNotesTitle('');
    setNotesContent('');
    setIsDirty(false);
    setIsSaving(false);
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

    setIsReadMode(false);
    setBackHistory([]);
    setForwardHistory([]);
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

  const hasRealContent = (html: string): boolean => {
    const text = html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();
    return text.length > 0;
  };

  const saveCurrentNote =
    async () => {
      if (!isDirty) return;
      if (!selectedNoteId && !notesContent.trim()) return;
      if (!selectedNoteId && !hasRealContent(notesContent)) return;
      // Una nota nueva necesita contenido real, el título no es suficiente.

      setIsSaving(true);

      try {
        if (selectedNoteId) {
          await noteService.updateNote(
            selectedNoteId,
            {title: notesTitle, content: notesContent},
          );
          await interlinkService.syncFromContent(selectedNoteId, notesContent);

        } else {
          const initialFolderId = typeof folderFilter === 'string' ? folderFilter : null;
          const newNote = await noteService.createNote(notesTitle, notesContent, initialFolderId);
          await interlinkService.syncFromContent(newNote.id, notesContent);

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
      void saveCurrentNote()
    }, 1000);

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
      //await tagService.deleteNoteRelations(noteId);
      await noteService.deletePermanently(noteId);
      resetEditor();
    };

  const handleChangeView = (mode: ViewMode) => {
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

  const handleOpenLinkedNote = (targetNoteId: string) => {
    const target = notes.find((note) => note.id === targetNoteId);
    if (!target) {
      window.alert('⚠ El enlace está roto. La nota destino ya no existe.');
      return;
    }

    if (selectedNoteId && selectedNoteId !== targetNoteId) {
      setBackHistory((history) => [...history, selectedNoteId]);
    }

    setForwardHistory([]);
    setSelectedNoteId(target.id);
    setNotesTitle(target.title);
    setNotesContent(target.content);
    setIsDirty(false);

    //Links Notas entran en modo lectura.
    setIsReadMode(true);
    setViewMode('notes');
  };

  const handleBack = () => {
    if (backHistory.length === 0) return;

    const previousId = backHistory[backHistory.length - 1];
    const previous = notes.find((note) => note.id === previousId);
    if (!previous) return;

    if (selectedNoteId) {
      setForwardHistory((history) => [selectedNoteId, ...history]);
    }
    setBackHistory((history) => history.slice(0, -1));

    setSelectedNoteId(previous.id);
    setNotesTitle(previous.title);
    setNotesContent(previous.content);

    setIsDirty(false);
    setIsReadMode(true);
  };
  
  const handleForward = () => {
    if (forwardHistory.length === 0) return;
    const nextId = forwardHistory[0];
    const next = notes.find((note) => note.id === nextId);
    if (!next) return;

    if (selectedNoteId) {
      setBackHistory((history) => [...history, selectedNoteId]);
    }
    setForwardHistory((history) => history.slice(1));

    setSelectedNoteId(next.id);
    setNotesTitle(next.title);
    setNotesContent(next.content);

    setIsDirty(false);
    setIsReadMode(true);
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
                        onClick={() => {handleSelectNote(note)}}
                        className={`w-full truncate rounded-md px-3 py-2 text-left
                          ${selectedNoteId === note.id ? 'bg-violet-100 font-medium' : 'hover:bg-gray-100'}`}
                      >
                        {note.title}
                      </button>
                    ),
                  )}
                </div>

                <hr className="my-4" />
                <TagManager
                  tags={tags}
                  selectedTagId={tagFilter}
                  onSelectTag={setTagFilter}
                />
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
            {selectedNote && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={backHistory.length === 0}
                  onClick={handleBack}
                  className="rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-100"
                >
                  ← Atrás
                </button>

                <button
                  type="button"
                  disabled={forwardHistory.length === 0}
                  onClick={handleForward}
                  className="rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-100"
                >
                  Adelante →
                </button>

                <button
                  type="button"
                  onClick={() => setIsReadMode((value) => !value)}
                  className="ml-auto rounded border px-3 py-1 hover:bg-gray-100"
                >
                  {isReadMode ? '✏️ Editar' : '👁 Modo lectura'}
                </button>
              </div>
            )}

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
                            <option key={folder.id} value={folder.id}>
                              {folder.name}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                  )}

                  {selectedNote && (
                    <NoteTags noteId={selectedNote.id} tags={tags}/>
                  )}

                  <div className="mb-4" />
                </section>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Contenido
                  </label>
                  <NoteEditor
                    content={notesContent}
                    onChange={handleContentChange}
                    editable={!isReadMode}
                    notes={notes}
                    onOpenNote={handleOpenLinkedNote}
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

                {brokenLinks.length > 0 && (
                  <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                    ⚠ Esta nota contiene{' '}
                    {brokenLinks.length}
                    {' '}enlace{brokenLinks.length === 1 ? '' : 's'}
                    {' '}roto{brokenLinks.length === 1 ? '' : 's'}.
                  </div>
                )}
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