export interface Note {
  id: string;

  title: string;
  content: string;

  createdAt: number;
  updatedAt: number;

  isDeleted: 0 | 1;
  deletedAt: number | null;
}