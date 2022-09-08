import { Author } from './author';

export interface Message {
  id: string;
  author?: Author;
  createdAt: Date;
  body: string;
}
