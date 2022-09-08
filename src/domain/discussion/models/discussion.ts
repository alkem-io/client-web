import { AuthorizationPrivilege, DiscussionCategory } from '../../../models/graphql-schema';
import { Author } from '../../shared/components/Comments/models/author';
import { Comment } from '../../shared/components/Comments/models/comment';

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
