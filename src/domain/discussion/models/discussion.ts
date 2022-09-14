import { AuthorizationPrivilege, DiscussionCategory } from '../../../models/graphql-schema';
import { Author } from '../../shared/components/AuthorAvatar/models/author';
import { Message as Comment } from '../../shared/components/Comments/models/message';

export interface Discussion {
  id: string;
  title: string;
  category: DiscussionCategory;
  myPrivileges: AuthorizationPrivilege[];
  author?: Author;
  authors: Author[];
  description: string;
  createdAt: Date;
  comments?: Comment[];
  totalComments: number;
}
