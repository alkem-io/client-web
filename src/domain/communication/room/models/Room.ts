import { AuthorizationPrivilege } from '../../../../core/apollo/generated/graphql-schema';
import { Message } from '../../messages/models/message';

export interface Room {
  id: string;
  messagesCount: number;
  messages: Message[];
  myPrivileges: AuthorizationPrivilege[] | undefined;
}
