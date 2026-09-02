import { useConversationEventsSubscription } from './useConversationEventsSubscription';

/**
 * Always-mounted, render-null subscriber for conversation events.
 *
 * Previously the conversation-events subscription lived inside
 * `UnifiedChatPanelConnector`, which mounts only while the chat panel is open —
 * so no `messageReceived` event reached a closed panel, and neither the chat
 * sound (US1) nor the tab badge (US5) could fire. Hoisting it here (mounted in
 * `root.tsx` under the messaging provider) keeps exactly one subscription alive
 * for the whole session, panel open or closed. It also refreshes the launcher's
 * unread badge, which is otherwise a cache-first query with no polling.
 */
export const ConversationEventsSubscriber = () => {
  useConversationEventsSubscription();
  return null;
};
