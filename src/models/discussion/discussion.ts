import { Author } from './author';
import { Comment } from './comment';

export interface Discussion {
  id: string;
  title: string;
  author?: Author;
  authors: Author[];
  description: string;
  createdAt: Date;
  comments?: Comment[];
  totalComments: number;
}
