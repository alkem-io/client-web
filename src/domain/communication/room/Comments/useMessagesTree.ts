import { useMemo } from 'react';
import { groupBy } from 'lodash';
import { Identifiable } from '@core/utils/Identifiable';

const ROOT_THREAD = Symbol('root');

const useMessagesTree = <Message extends IdentifiableReply>(messages: Message[] | undefined) =>
  useMemo(() => buildMessagesTree(messages), [messages]);

export interface IdentifiableReply extends Identifiable {
  threadID?: string;
}

type Thread<Message> = Message & {
  replies?: Message[];
};

export const buildMessagesTree = <Message extends IdentifiableReply>(
  messages: Message[] | undefined
): Thread<Message>[] | undefined => {
  const groupedMessages = groupBy(messages, m =>
    // TODO After dealing with client-4587 change to `m.threadID ?? ROOT_THREAD`
    !m.threadID || m.threadID === m.id ? ROOT_THREAD : m.threadID
  ) as unknown as Record<string | typeof ROOT_THREAD, Message[] | undefined> | undefined;

  return groupedMessages?.[ROOT_THREAD]?.map(message => ({
    ...message,
    replies: groupedMessages[message.id],
  }));
};

export default useMessagesTree;
