import { useEffect } from 'react';
import { setTitlePrefix } from '@/core/routing/documentTitle';
import { useUnreadConversationsCount } from '@/main/userMessaging/useUnreadConversationsCount';
import { clearFaviconBadge, setFaviconBadge } from './faviconBadge';

/**
 * Drives the browser-tab unread indicator (US5): a `(N) ` title prefix plus a
 * favicon badge, whenever there are unread conversations.
 *
 * Reads ONLY the unread-conversations count — never the sound settings (FR-009):
 * the badge is a separate, always-on indicator not governed by either toggle.
 * The count is the number of conversations having unread messages (the same
 * number the in-app launcher badge shows), so the two never disagree.
 */
export const useUnreadTabBadge = (): void => {
  const count = useUnreadConversationsCount();

  useEffect(() => {
    if (count > 0) {
      setTitlePrefix(`(${count}) `);
      setFaviconBadge(count);
    } else {
      setTitlePrefix('');
      clearFaviconBadge();
    }
  }, [count]);
};
