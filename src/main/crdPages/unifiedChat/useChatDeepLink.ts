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
 */
export const useChatDeepLinkOpen = () => {
  const { search } = useLocation();
  const { isEnabled, setIsOpen } = useUserMessagingContext();
  const consumedRef = useRef(false);

  useEffect(() => {
    if (consumedRef.current || !isEnabled) {
      return;
    }
    const chatId = new URLSearchParams(search).get(CHAT_DEEP_LINK_PARAM);
    if (!chatId) {
      return;
    }
    consumedRef.current = true;
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
 * effect returns before touching history.
 */
export const useChatDeepLinkSelect = (conversations: UnifiedConversation[], isLoadingConversations: boolean) => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { setSelectedConversationId, setSelectedRoomId } = useUserMessagingContext();
  const consumedRef = useRef(false);

  useEffect(() => {
    if (consumedRef.current || isLoadingConversations) {
      return;
    }
    const params = new URLSearchParams(search);
    const chatId = params.get(CHAT_DEEP_LINK_PARAM);
    if (!chatId) {
      return;
    }

    const match = conversations.find(conversation => conversation.id === chatId);
    if (match) {
      setSelectedConversationId(match.id);
      setSelectedRoomId(match.roomId);
    }
    // Unknown/inaccessible id: no selection made — default list stays shown, no error UI.

    consumedRef.current = true;
    params.delete(CHAT_DEEP_LINK_PARAM);
    const nextSearch = params.toString();
    navigate(`${pathname}${nextSearch ? `?${nextSearch}` : ''}`, { replace: true });
  }, [conversations, isLoadingConversations, search, pathname, navigate, setSelectedConversationId, setSelectedRoomId]);
};
