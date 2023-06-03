import { AuthorizationPrivilege, DiscussionCategory, Room } from '../../../../core/apollo/generated/graphql-schema';
import { Author } from '../../../shared/components/AuthorAvatar/models/author';

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
  comments: Room; //todo: should not be from generated code?
}
