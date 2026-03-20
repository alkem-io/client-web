import type { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import type { Message } from './Message';

export interface Room {
  id: string;
  messagesCount: number;
  messages: Message[];
  myPrivileges: AuthorizationPrivilege[] | undefined;
}
