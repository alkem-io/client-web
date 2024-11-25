import { Author } from '@/domain/shared/components/AuthorAvatar/models/author';

export interface Message {
  id: string;
  threadID?: string;
  author?: Author;
  createdAt: Date;
  body: string;
  reactions: {
    id: string;
    emoji: string;
    sender?: {
      id: string;
      profile: { displayName: string };
    };
  }[];
}
