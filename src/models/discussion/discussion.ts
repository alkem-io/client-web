import { DiscussionCategory } from '../graphql-schema';
import { Author } from './author';
import { Comment } from './comment';

export interface Discussion {
  id: string;
  title: string;
  author?: Author;
  authors: Author[];
  category: DiscussionCategory;
  description: string;
  createdAt: Date;
  comments?: Comment[];
  totalComments: number;
}
