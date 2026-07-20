import { useEffect } from 'react';
import { setTitlePrefix } from '@/core/routing/documentTitle';
import { useUnreadNotificationsCount } from '@/main/inAppNotifications/useUnreadNotificationsCount';
import { useUnreadConversationsCount } from '@/main/userMessaging/useUnreadConversationsCount';
import { clearFaviconBadge, setFaviconBadge } from './faviconBadge';

/**
 * Drives the browser-tab unread indicator (US5): a `(N) ` title prefix plus a
 * favicon badge.
 *
 * The count is the unread-conversations count plus the unread-notifications count
 * (FR-007/008/009), and is deliberately INDEPENDENT of the two sound settings:
 * muting a sound silences the cue but must never hide its items from the tab — for a
 * user who has muted the sounds, the badge is the only unread signal left. Do not
 * reintroduce a read of `settings.notification.sound` here.
 */
export const useUnreadTabBadge = (): void => {
  const conversationsCount = useUnreadConversationsCount();
  const notificationsCount = useUnreadNotificationsCount();

  const count = conversationsCount + notificationsCount;

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
