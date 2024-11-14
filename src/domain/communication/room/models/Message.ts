import { Author } from '../../../shared/components/AuthorAvatar/models/author';

export interface Message {
  id: string;
  threadID?: string;
  author?: Author;
  createdAt: Date;
  message: string;
  reactions: {
    id: string;
    emoji: string;
    sender?: {
      id: string;
      profile: { displayName: string };
    };
  }[];
}
