export interface Note {
  id: string;
  title: string;
  content: string;

  folderId: string | null;

  createdAt: number;
  updatedAt: number;

  isDeleted: 0 | 1;
  deletedAt: number | null;
}