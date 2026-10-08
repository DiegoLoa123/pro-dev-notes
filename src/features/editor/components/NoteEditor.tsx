import { useEffect } from 'react';

import { EditorContent, useEditor, useEditorState, } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import type { Note } from '../../notes/domain/Note';
import { NoteLinkMark } from '../../interlinks/extensions/NoteLinkMark';

import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';

interface NoteEditorProps {
  content: string;
  onChange?: (html: string) => void;
  editable?: boolean;
}
interface NoteEditorProps {
  content: string;
  onChange?: (html: string) => void;

  editable?: boolean;
  notes?: Note[];
  onOpenNote?: (noteId: string) => void;
}

export function NoteEditor({
  content,
  onChange,
  editable = true,
  notes = [],
  onOpenNote
}: NoteEditorProps) {
  const editor = useEditor({
    editable,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),

      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      NoteLinkMark,
    ],

    content,
    onUpdate: ({ editor }) => {
      if (!editable) return;
      onChange?.(editor.getHTML());
    },

    editorProps: {
      handleTextInput(view, from, to, text,) {
        if (text !== ']') return false;
        const resolved = view.state.doc.resolve(from);
        const textBefore = resolved.parent.textBetween(0, resolved.parentOffset, '\n', '\n') + text;

        const match = textBefore.match(/\[\[([^[\]]+)\]\]$/);
        if (!match) return false;

        const requestedTitle = match[1].trim();
        const matchingNotes =
          notes.filter(
            (note) =>
              note.isDeleted === 0 &&
              note.title.trim().toLocaleLowerCase() === requestedTitle.toLocaleLowerCase(),
          );

        //Si existen dos notas con el mismo título, no resolvemos automáticamente.
        if (matchingNotes.length !== 1) return false;

        const target = matchingNotes[0];
        const mark = view.state.schema.marks.noteLink.create({ noteId: target.id });
        const textNode = view.state.schema.text(`@${target.title}`, [mark]);

        /*
        * En el documento todavía existe: [[link]
        * El último ] aún no fue insertado.
        */
        const charactersAlreadyTyped = match[0].length - text.length;
        const start = from - charactersAlreadyTyped;

        const transaction = view.state.tr.replaceWith(start, to, textNode);
        view.dispatch(transaction);
        return true;
      },

      handleClick(_view, _position, event) {
        const element = event.target as HTMLElement;
        const link = element.closest<HTMLElement>('[data-note-link="true"]');
        if (!link) return false;

        const noteId = link.dataset.noteId;
        if (!noteId) return false;

        event.preventDefault();
        onOpenNote?.(noteId);
        return true;
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const currentContent = editor.getHTML();
    if (currentContent !== content) editor.commands.setContent(content);
  }, [content, editor]);

  if (!editor) return null;

  const buttonStyle = (
    isActive = false,
    disabled = false,
  ) => ({
    backgroundColor: isActive ? '#7c3aed' : '#ffffff',
    color: isActive ? '#ffffff' : disabled ? '#999999' : '#000000',
    border: '1px solid #999',
    padding: '6px 10px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1
  });

  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isBold: editor.isActive('bold'),
      isItalic: editor.isActive('italic'),
      isUnderline: editor.isActive('underline'),

      isH1: editor.isActive('heading', { level: 1 }),
      isH2: editor.isActive('heading', { level: 2 }),
      isH3: editor.isActive('heading', { level: 3 }),

      isBulletList: editor.isActive('bulletList'),
      isOrderedList: editor.isActive('orderedList'),

      isBlockquote: editor.isActive('blockquote'),

      isCode: editor.isActive('code'),
      isCodeBlock: editor.isActive('codeBlock'),

      isHighlight: editor.isActive('highlight'),
      isHighlightYellow: editor.isActive('highlight', { color: '#ffff00' }),
      hasTextColor: Boolean(editor.getAttributes('textStyle').color),

      isTextRed: editor.isActive('textStyle', { color: '#ff0000' }),
    }),
  });
  const canUndo = editor.can().undo();
  const canRedo = editor.can().redo();

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
  }, [editor, editable]);

  return (
    <div>
      {editable && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {/* TEXT */}

          <button
            type="button"
            style={buttonStyle(editorState.isBold)}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            Bold
          </button>

          <button
            type="button"
            style={buttonStyle(editorState.isItalic)}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            Italic
          </button>

          <button
            type="button"
            style={buttonStyle(editorState.isUnderline)}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            Underline
          </button>

          {/* HEADINGS */}

          <button
            type="button"
            style={buttonStyle(editorState.isH1)}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run() }
          >
            H1
          </button>

          <button
            type="button"
            style={buttonStyle(editorState.isH2)}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            H2
          </button>

          <button
            type="button"
            style={buttonStyle(editorState.isH3)}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            H3
          </button>

          {/* LISTAS */}

          <button
            type="button"
            style={buttonStyle(editorState.isBulletList)}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            Bullet List
          </button>

          <button
            type="button"
            style={buttonStyle(editorState.isOrderedList)}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            Ordered List
          </button>

          {/* BLOCKS */}

          <button
            type="button"
            style={buttonStyle(editorState.isBlockquote)}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            Quote
          </button>

          <button
            type="button"
            style={buttonStyle(editorState.isCode)}
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            Code
          </button>

          <button
            type="button"
            style={buttonStyle(editorState.isCodeBlock)}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            Code Block
          </button>

          {/* COLOR */}

          <button
            type="button"
            style={buttonStyle(editorState.isTextRed)}
            onClick={() => editor.chain().focus().setColor('#ff0000').run()}
          >
            Texto rojo
          </button>

          <button
            type="button"
            style={buttonStyle(false)}
            disabled={!editorState.hasTextColor}
            onClick={() => editor.chain().focus().unsetColor().run()}
          >
            Quitar color
          </button>

          {/* HIGHLIGHT */}

          <button
            type="button"
            style={buttonStyle(editorState.isHighlightYellow)}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHighlight({ color: '#ffff00' })
                .run()
            }
          >
            Highlight
          </button>

          {/* HISTORY */}

          <button
            type="button"
            style={buttonStyle(false, !canUndo)}
            disabled={!canUndo}
            onClick={() => editor.chain().focus().undo().run()}
          >
            Undo
          </button>

          <button
            type="button"
            style={buttonStyle(false, !canRedo)}
            disabled={!canRedo}
            onClick={() => editor.chain().focus().redo().run()}
          >
            Redo
          </button>
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}