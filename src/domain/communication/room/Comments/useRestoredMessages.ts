import { Message } from '../models/Message';
import { useMemo } from 'react';
import { keyBy, sortBy } from 'lodash';

interface DeletedMessage extends Omit<Message, 'message'> {
  deleted: true;
}

export interface NonDeletedMessage extends Message {
  deleted?: false;
}

export type MaybeDeletedMessage = DeletedMessage | NonDeletedMessage;

const useRestoredMessages = (
  messages: Message[] | undefined,
  sortOrder: 'asc' | 'desc' = 'desc'
): MaybeDeletedMessage[] | undefined => {
  return useMemo(() => {
    if (!messages) {
      return undefined;
    }

    const messagesById = keyBy(messages, ({ id }) => id);

    const nonDeletedMessages: NonDeletedMessage[] = messages.map(message => ({
      ...message,
      deleted: false,
    }));

    const restoredMessagesById = messages.reduce<Record<string, DeletedMessage>>((restored, message) => {
      const { threadID } = message;
      if (!threadID) {
        return restored;
      }
      const isThreadStarterMissing = !messagesById[threadID];
      if (isThreadStarterMissing) {
        if (!restored[threadID]) {
          restored[threadID] = {
            id: threadID,
            deleted: true,
            author: undefined,
            reactions: [],
            createdAt: message.createdAt,
          };
        } else if (restored[threadID].createdAt > message.createdAt) {
          restored[threadID].createdAt = message.createdAt;
        }
      }
      return restored;
    }, {});

    const sorted = sortBy(
      [...nonDeletedMessages, ...Object.values(restoredMessagesById)],
      message => message.createdAt
    );
    return sortOrder === 'desc' ? sorted.reverse() : sorted;
  }, [messages, sortOrder]);
};

export default useRestoredMessages;
