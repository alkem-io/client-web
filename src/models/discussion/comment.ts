import { Author } from './author';

export interface Comment {
  id: string;
  author?: Author;
  createdAt: Date;
  body: string;
}
