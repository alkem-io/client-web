import { useMemo } from 'react';
import { AuthorData, buildAuthorFromUser } from '@/domain/community/user/utils/buildAuthorFromUser';

interface FetchedMessage {
  id: string;
  threadID?: string;
  message: string;
  sender?: AuthorData;
  timestamp: number;
  reactions: {
    id: string;
    emoji: string;
    sender?: {
      id: string;
      profile: {
        displayName: string;
      };
    };
  }[];
}

export const useMessages = (messages: FetchedMessage[] | undefined) =>
  useMemo(() => {
    return messages?.map(message => ({
      id: message.id,
      threadID: message.threadID,
      message: message.message,
      author: message?.sender?.id ? buildAuthorFromUser(message.sender) : undefined,
      createdAt: new Date(message.timestamp),
      reactions: message.reactions,
    }));
  }, [messages]);
