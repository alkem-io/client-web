import { useMemo } from 'react';
import { groupBy } from 'lodash';
import { Message } from '../models/Message';

const ROOT_THREAD = Symbol('root');

const useMessagesTree = (messages: Message[] | undefined) => useMemo(() => buildMessagesTree(messages), [messages]);

const buildMessagesTree = (messages: Message[] | undefined) => {
  const groupedMessages = groupBy(messages, m => m.threadID ?? ROOT_THREAD) as unknown as
    | Record<string | typeof ROOT_THREAD, Message[] | undefined>
    | undefined;

  return groupedMessages?.[ROOT_THREAD]?.map(message => ({
    ...message,
    replies: groupedMessages[message.id],
  }));
};

export default useMessagesTree;
