export interface Tag {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}
export interface NoteTag {
  id: string;
  noteId: string;
  tagId: string;
}