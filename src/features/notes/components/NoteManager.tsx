import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';

import type { Note } from '../domain/Note';
import { noteService } from '../services/note.service';

export function NoteManager() {
  const notes = useLiveQuery(
    () => noteService.getNotes(),
    [], [],
  );

  const [selectedNote, setSelectedNote] =
    useState<Note | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleNewNote = () => {
    setSelectedNote(null);
    setTitle('');
    setContent('');
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);

    setTitle(note.title);
    setContent(note.content);
  };

  const handleSave = async () => {
    try {
      if (selectedNote) {
        await noteService.updateNote(selectedNote.id, {
          title,
          content,
        });

        setSelectedNote({
          ...selectedNote,
          title: title.trim() || 'Sin título',
          content,
          updatedAt: Date.now(),
        });

        return;
      }

      const newNote = await noteService.createNote(
        title,
        content,
      );

      setSelectedNote(newNote);

      setTitle(newNote.title);
      setContent(newNote.content);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!selectedNote) {
      return;
    }

    await noteService.moveToTrash(selectedNote.id);

    handleNewNote();
  };

  return (
    <div>
      <h1>Offline Notes</h1>

      <button onClick={handleNewNote}>
        Nueva nota
      </button>

      <hr />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '250px 1fr',
          gap: '20px',
        }}
      >
        <aside>
          <h2>Notas</h2>

          {notes.length === 0 && (
            <p>No tienes notas todavía.</p>
          )}

          {notes.map((note) => (
            <button
              key={note.id}
              onClick={() => handleSelectNote(note)}
              style={{
                display: 'block',
                width: '100%',
                marginBottom: '8px',
              }}
            >
              {note.title}
            </button>
          ))}
        </aside>

        <main>
          <div>
            <label htmlFor="title">
              Título
            </label>

            <br />

            <input
              id="title"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Título de la nota"
              style={{
                width: '100%',
                marginBottom: '16px',
              }}
            />
          </div>

          <div>
            <label htmlFor="content">
              Contenido
            </label>

            <br />

            <textarea
              id="content"
              value={content}
              onChange={(event) =>
                setContent(event.target.value)
              }
              placeholder="Escribe algo..."
              rows={20}
              style={{
                width: '100%',
              }}
            />
          </div>

          <br />

          <button onClick={handleSave}>
            Guardar
          </button>

          {selectedNote && (
            <>
              {' '}

              <button onClick={handleDelete}>
                Enviar a papelera
              </button>
            </>
          )}
        </main>
      </div>
    </div>
  );
}