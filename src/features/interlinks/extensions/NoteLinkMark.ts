import { Mark, mergeAttributes } from '@tiptap/core';

export const NoteLinkMark = Mark.create({
  name: 'noteLink',
  inclusive: false,

  addAttributes() {
    return {
      noteId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-note-id'),
        renderHTML: (attributes) => ({'data-note-id': attributes.noteId}),
      },
    };
  },

  parseHTML() {
    return [{tag: 'span[data-note-link="true"]'}];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(
        HTMLAttributes,
        {
          'data-note-link': 'true',
          class: 'cursor-pointer rounded px-1 text-violet-700 underline decoration-violet-400 hover:bg-violet-100',
        },
      ),
      0,
    ];
  },
});