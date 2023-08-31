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

    const restoredMessagesById = messages.reduce<Record<string, DeletedMessage>>((restored, message) => {
      const { threadID } = message;
      if (!threadID) {
        return restored;
      }
      const isThreadStarterMissing = !messagesById[threadID];
      if (isThreadStarterMissing && !restored[threadID]) {
        restored[threadID] = {
          id: threadID,
          deleted: true,
          author: undefined,
          reactions: [],
        };
      }
      return restored;
    }, {});

    return [...nonDeletedMessages, ...Object.values(restoredMessagesById)];
  }, [messages]);
};

export default useRestoredMessages;
