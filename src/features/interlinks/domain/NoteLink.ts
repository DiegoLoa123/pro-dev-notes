export interface NoteLink {
  id: string;

  sourceNoteId: string;
  targetNoteId: string;

  createdAt: number;
}