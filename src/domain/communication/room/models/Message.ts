import { AuthorModel } from '@/domain/community/user/models/AuthorModel';

export interface Message {
  id: string;
  threadID?: string;
  author?: AuthorModel;
  createdAt: Date;
  message: string;
  reactions: {
    id: string;
    emoji: string;
    timestamp: number;
    sender?: {
      id: string;
      profile: { displayName: string };
    };
  }[];
}
