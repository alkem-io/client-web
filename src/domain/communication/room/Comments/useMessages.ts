import { useMemo } from 'react';
import { buildAuthorFromUser } from '../../../community/user/utils/buildAuthorFromUser';
import { ProfileType } from '@core/apollo/generated/graphql-schema';

interface FetchedMessage {
  id: string;
  threadID?: string;
  message: string;
  sender?: {
    id: string;
    profile: {
      id: string;
      displayName: string;
      url: string;
      type?: ProfileType;
      visual?: { id: string; uri: string };
      tagsets?: { id: string; name: string; tags: string[] }[];
      location?: { id: string; city?: string; country?: string };
    };
  };
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
      body: message.message,
      author: message?.sender?.id ? buildAuthorFromUser(message.sender) : undefined,
      createdAt: new Date(message.timestamp),
      reactions: message.reactions,
    }));
  }, [messages]);
