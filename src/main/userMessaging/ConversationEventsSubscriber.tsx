import { useIncomingCallsWatcher } from './calls/useIncomingCallsWatcher';
import { useSyncChatSound } from './matrix/useSyncChatSound';
import { useConversationEventsSubscription } from './useConversationEventsSubscription';

/**
 * Always-mounted, render-null subscriber for conversation events, so they
 * arrive with the chat panel closed too.
 *
 * GraphQL carries the control events (conversations created, updated, deleted
 * and membership changes); message content arrives through the browser's
 * Matrix sync, which also drives the chat sound. The unread badges follow sync
 * directly. Calls the user is not in count as unread and sound when they start.
 */
export const ConversationEventsSubscriber = () => {
  useConversationEventsSubscription();
  useSyncChatSound();
  useIncomingCallsWatcher();
  return null;
};
