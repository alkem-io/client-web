import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import useNavigate from '@/core/routing/useNavigate';
import { useUserMessagingContext } from '@/main/userMessaging/UserMessagingContext';
import type { UnifiedConversation } from './dataMapper';

/** Query param carrying the deep-linked conversation id (contract C-6). */
export const CHAT_DEEP_LINK_PARAM = 'chat';

/**
 * Opens the chat panel on app load when the URL carries `?chat={conversationID}`
 * (contract C-6 / US1). Lives wherever the always-mounted launcher is (unlike
 * `UnifiedChatPanelConnector`, which only renders once the panel is open) so it
 * is the one place that can flip `isOpen` from a cold load. Fires at most once
 * per param instance — conversation SELECTION and stripping the param happen
 * downstream, once the panel connector's conversation list resolves
 * (`useChatDeepLinkSelect`).
 *
 * "Once per param instance" is why the latch stores the consumed ID rather than
 * a boolean. This hook's host (`UnifiedChatLauncher`) is mounted for the whole
 * session, so a boolean latched the FIRST deep link forever: the service worker
 * navigating an existing tab to `/?chat=B` re-ran this effect and returned
 * early, and every push notification after the first opened nothing. The ID is
 * cleared once the param is gone (stripped downstream), so a later link to the
 * SAME conversation is treated as a new instance and works too.
 */
export const useChatDeepLinkOpen = () => {
  const { search } = useLocation();
  const { isEnabled, setIsOpen } = useUserMessagingContext();
  const consumedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }
    const chatId = new URLSearchParams(search).get(CHAT_DEEP_LINK_PARAM);
    if (!chatId) {
      consumedIdRef.current = null;
      return;
    }
    if (consumedIdRef.current === chatId) {
      return;
    }
    consumedIdRef.current = chatId;
    setIsOpen(true);
  }, [search, isEnabled, setIsOpen]);
};

/**
 * Once the chat panel is open (this hook is called from `UnifiedChatPanelConnector`,
 * which only mounts while `isOpen`), selects the conversation named by `?chat=`
 * as soon as the conversation list has resolved, then strips the param via
 * `history.replaceState` (react-router `navigate(..., { replace: true })` —
 * same mechanism the calendar deep link uses). An unknown/inaccessible id
 * strips the param the same way and leaves the default list open — no error
 * UI (contract C-6, risk R-13). A URL with no `chat` param is a no-op: the
 * effect returns before touching history (and clears the latch, so a repeat
 * link to the same conversation is a fresh instance).
 *
 * The latch stores the consumed ID for the same reason as `useChatDeepLinkOpen`
 * above: while the panel stays open this hook stays mounted, so a boolean would
 * have made every deep link after the first select nothing.
 */
export const useChatDeepLinkSelect = (conversations: UnifiedConversation[], isLoadingConversations: boolean) => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { setSelectedConversationId, setSelectedRoomId } = useUserMessagingContext();
  const consumedIdRef = useRef<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const chatId = params.get(CHAT_DEEP_LINK_PARAM);
    if (!chatId) {
      consumedIdRef.current = null;
      return;
    }
    if (consumedIdRef.current === chatId || isLoadingConversations) {
      return;
    }

    const match = conversations.find(conversation => conversation.id === chatId);
    if (match) {
      setSelectedConversationId(match.id);
      setSelectedRoomId(match.roomId);
    }
    // Unknown/inaccessible id: no selection made — default list stays shown, no error UI.

    consumedIdRef.current = chatId;
    params.delete(CHAT_DEEP_LINK_PARAM);
    const nextSearch = params.toString();
    navigate(`${pathname}${nextSearch ? `?${nextSearch}` : ''}`, { replace: true });
  }, [conversations, isLoadingConversations, search, pathname, navigate, setSelectedConversationId, setSelectedRoomId]);
};
