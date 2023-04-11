import { AuthorizationPrivilege, DiscussionCategory } from '../../../../core/apollo/generated/graphql-schema';
import { Author } from '../../../shared/components/AuthorAvatar/models/author';
import { Message as Comment } from '../../../shared/components/Comments/models/message';

export interface Discussion {
  id: string;
  nameID: string;
  title: string;
  category: DiscussionCategory;
  myPrivileges: AuthorizationPrivilege[] | undefined;
  author?: Author;
  authors: Author[];
  description?: string;
  createdAt: Date | undefined;
  comments?: Comment[];
  commentsCount: number;
}
