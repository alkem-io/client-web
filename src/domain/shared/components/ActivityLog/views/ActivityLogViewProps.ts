import { Author } from '../../AuthorAvatar/models/author';

export interface ActivityLogViewProps {
  author: Author;
  createdDate: Date;
  description: string;
}
