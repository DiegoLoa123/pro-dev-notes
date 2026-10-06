import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';

import type { Note } from '../domain/Note';
import { noteService } from '../services/note.service';
import { NoteEditor } from '../../editor/components/NoteEditor';
import { folderService } from '../../folders/services/folder.service';

type ViewMode = 'notes' | 'trash';

export function NoteManager() {
  const [viewMode, setViewMode] = useState<ViewMode>('notes');

  const notes = useLiveQuery(
    () => noteService.getNotes(), [], [],
  );
  const deletedNotes = useLiveQuery(
    () => noteService.getDeletedNotes(), [], [],
  );
  const folders = useLiveQuery(
    () => folderService.getFolders(), [], [],
  );

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const [notesTitle, setNotesTitle] = useState('');
  const [notesContent, setNotesContent] = useState('');

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedNote =
    notes.find(
      (note) => note.id === selectedNoteId,
    ) ?? null;

  const selectedDeletedNote =
    deletedNotes.find(
      (note) => note.id === selectedNoteId,
    ) ?? null;

  const handleNewNote = () => {
    setSelectedNoteId(null);

    setNotesTitle('');
    setNotesContent('');

    setIsDirty(false);

    setViewMode('notes');
  };

  const handleSelectNote = (note: Note) => {
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

  const saveCurrentNote = async () => {
    if (!isDirty) {
      return;
    }

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
        const newNote =
          await noteService.createNote(
            notesTitle,
            notesContent,
          );

        setSelectedNoteId(newNote.id);

        setNotesTitle(newNote.title);
        setNotesContent(newNote.content);
      }

      setIsDirty(false);
    } catch (error) {
      console.error('Error guardando nota:', error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!isDirty) return;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(
      () => {
        void saveCurrentNote();
      }, 1500,
    );

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [notesTitle, notesContent, isDirty, selectedNoteId]);

  const handleMoveToTrash = async () => {
    if (!selectedNoteId) return;
    await noteService.moveToTrash(selectedNoteId);
    handleNewNote();
  };

  const handleRestore = async (
    noteId: string,
  ) => {
    await noteService.restoreNote(noteId);

    setSelectedNoteId(null);
    setNotesTitle('');
    setNotesContent('');
  };

  const handleDeletePermanently = async (
    noteId: string,
  ) => {
    const confirmed = window.confirm('¿Eliminar esta nota definitivamente?');
    if (!confirmed) return;

    await noteService.deletePermanently(noteId);

    setSelectedNoteId(null);
    setNotesTitle('');
    setNotesContent('');
  };

  const handleChangeView = (
    mode: ViewMode,
  ) => {
    setViewMode(mode);

    setSelectedNoteId(null);
    setNotesTitle('');
    setNotesContent('');
    setIsDirty(false);
  };

  const handleCreateFolder = async () => {
    const name = window.prompt('Nombre de la carpeta');

    if (!name) return;
    try {
      await folderService.createFolder(name);
    } catch (error) {
      console.error('Error creando carpeta:', error);
    }
  };

  return (
    <div>
      <h1>Offline Notes</h1>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={handleCreateFolder}>
          + Nueva carpeta
        </button>

        <button onClick={handleNewNote}>
          Nueva nota
        </button>

        <button onClick={() => handleChangeView('notes')}>
          Notas
        </button>

        <button onClick={() => handleChangeView('trash')}>
          Papelera
        </button>
      </div>

      <hr />

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '20px' }}>
        <aside>
          <h3>Carpetas</h3>
          {folders.length === 0 && (
            <p style={{ textAlign: 'center' }}>No tienes carpetas.</p>
          )}

          {folders.map((folder) => (
            <button key={folder.id} style={{ display: 'block', width: '100%', marginBottom: '4px' }}>
              📁 {folder.name}
            </button>
          ))}
          <br />

          {viewMode === 'notes' && (
            <>
              <h2>Notas</h2>
              {notes.length === 0 && (
                <p>No tienes notas.</p>
              )}

              {notes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  style={{ display: 'block', width: '100%', marginBottom: '8px' }}
                >
                  {note.title}
                </button>
              ))}
            </>
          )}

          {viewMode === 'trash' && (
            <>
              <h2>Papelera</h2>
              {deletedNotes.length === 0 && (
                <p>
                  La papelera está
                  vacía.
                </p>
              )}

              {deletedNotes.map(
                (note) => (
                  <button
                    key={note.id}
                    onClick={() => handleSelectNote(note)}
                    style={{ display: 'block', width: '100%', marginBottom: '8px' }}
                  >
                    {note.title}
                  </button>
                ),
              )}
            </>
          )}
        </aside>

        <main>
          {viewMode === 'notes' && (
            <>
              <section className="flex flex-col gap-4 w-full">
                <div className="flex flex-row items-end gap-4 w-full">
                  {/* Campo del Título */}
                  <div className="flex-1 flex flex-col gap-1">
                    <label htmlFor="title" className="text-sm font-medium text-gray-700">Título</label>
                    <input
                      id="title"
                      value={notesTitle}
                      onChange={(event) => handleTitleChange(event.target.value)}
                      placeholder="Título de la nota"
                      className="w-full"
                    />
                  </div>

                  {/* Selector de Carpeta */}
                  <div className="w-48"> {/* Puedes ajustar este ancho según prefieras */}
                    <select
                      value={selectedNote?.folderId ?? ''}
                      onChange={(event) => {
                        if (!selectedNote) return;
                        const folderId = event.target.value || null;
                        void noteService.moveNoteToFolder(selectedNote.id, folderId);
                      }}
                      className="w-full p-[7px] border-2 border-[#9b9b9b] focus:border-[#1b1b1b] focus:outline-none cursor-pointer"
                    >
                      <option value="">Sin carpeta</option>
                      {folders.map((folder) => (
                        <option key={folder.id} value={folder.id}>
                          {folder.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>


              <div>
                <label htmlFor="content">
                  Contenido
                </label>
                <br />

                <NoteEditor
                  content={notesContent}
                  onChange={handleContentChange}
                />
              </div>
              <br />

              <p>
                mss: {isSaving
                  ? 'Guardando...' : isDirty
                    ? 'Cambios pendientes'
                    : 'Guardado'}
              </p>

              {selectedNote && (
                <button onClick={handleMoveToTrash}>
                  Enviar a papelera
                </button>
              )}
            </>
          )}

          {viewMode === 'trash' &&
            selectedDeletedNote && (
              <>
                <h2>{selectedDeletedNote.title}</h2>
                <NoteEditor
                  content={selectedDeletedNote.content}
                  editable={false}
                />
                <br />

                <button onClick={() => handleRestore(selectedDeletedNote.id)}>
                  Restaurar
                </button>
                <button onClick={() => handleDeletePermanently(selectedDeletedNote.id)}>
                  Eliminar definitivamente
                </button>
              </>
            )}
        </main>
      </div>
    </div>
  )
}