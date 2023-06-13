import { Author } from '../../../shared/components/AuthorAvatar/models/author';

export interface Message {
  id: string;
  author?: Author;
  createdAt: Date;
  body: string;
}
