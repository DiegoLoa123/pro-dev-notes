import { useEffect } from 'react';

import { EditorContent, useEditor, useEditorState, } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';

interface NoteEditorProps {
  content: string;
  onChange?: (html: string) => void;
  editable?: boolean;
}

export function NoteEditor({
  content,
  onChange,
  editable = true,
}: NoteEditorProps) {
  const editor = useEditor({
    editable,
    extensions: [
      StarterKit.configure({
        heading: {levels: [1, 2, 3]},
      }),

      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
    ],

    content,
    onUpdate: ({ editor }) => {
      if (!editable) return;
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const currentContent = editor.getHTML();

    if (currentContent !== content) {
      editor.commands.setContent(content);
    }
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

      isTextRed: editor.isActive('textStyle', {
        color: '#ff0000',
      }),
    }),
  });
  const canUndo = editor.can().undo();
  const canRedo = editor.can().redo();

  return (
    <div>
      {editable && (
        <div style={{display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px'}}>
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
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHeading({ level: 1 })
                .run()
            }
          >
            H1
          </button>

          <button
            type="button"
            style={buttonStyle(editorState.isH2)}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHeading({ level: 2 })
                .run()
            }
          >
            H2
          </button>

          <button
            type="button"
            style={buttonStyle(editorState.isH3)}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHeading({ level: 3 })
                .run()
            }
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
                .toggleHighlight({color: '#ffff00'})
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