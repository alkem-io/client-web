import { Message } from '../models/Message';
import { useMemo } from 'react';
import { keyBy } from 'lodash';

interface DeletedMessage extends Omit<Message, 'body' | 'createdAt'> {
  deleted: true;
}

export interface NonDeletedMessage extends Message {
  deleted?: false;
}

export type MaybeDeletedMessage = DeletedMessage | NonDeletedMessage;

const useRestoredMessages = (messages: Message[] | undefined): MaybeDeletedMessage[] | undefined => {
  return useMemo(() => {
    if (!messages) {
      return undefined;
    }

    const messagesById = keyBy(messages, ({ id }) => id);

    const nonDeletedMessages: NonDeletedMessage[] = messages.map(message => ({
      ...message,
      deleted: false,
    }));

    const deletedMessagesById = messages.reduce<Record<string, DeletedMessage>>((deleted, message) => {
      const { threadID } = message;
      if (!threadID) {
        return deleted;
      }
      const isThreadStarterMissing = !messagesById[threadID];
      if (isThreadStarterMissing && !deleted[threadID]) {
        deleted[threadID] = {
          id: threadID,
          deleted: true,
          author: undefined,
          reactions: [],
        };
      }
      return deleted;
    }, {});

    return [...nonDeletedMessages, ...Object.values(deletedMessagesById)];
  }, [messages]);
};

export default useRestoredMessages;
