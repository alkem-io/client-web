import { Message } from '../../messages/models/message';

export interface Room {
  id: string;
  messagesCount: number;
  messages: Message[];
}
