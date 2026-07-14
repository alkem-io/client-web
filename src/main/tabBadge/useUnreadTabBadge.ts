import { useEffect } from 'react';
import type { UserDetailsFragment } from '@/core/apollo/generated/graphql-schema';
import { setTitlePrefix } from '@/core/routing/documentTitle';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useUnreadNotificationsCount } from '@/main/inAppNotifications/useUnreadNotificationsCount';
import { useUnreadConversationsCount } from '@/main/userMessaging/useUnreadConversationsCount';
import { clearFaviconBadge, setFaviconBadge } from './faviconBadge';

/**
 * Drives the browser-tab unread indicator (US5): a `(N) ` title prefix plus a
 * favicon badge.
 *
 * The count is COMPOSED from the two sound toggles (FR-007/008/009): the
 * unread-conversations count contributes only while the chat-message sound is on,
 * and the unread-notifications count only while the notification sound is on.
 * When both toggles are off the composed count is 0, so no badge is shown and the
 * tab title is left as its base (untouched). Each flag defaults to on when the
 * settings have not loaded yet.
 */
export const useUnreadTabBadge = (): void => {
  const { userModel } = useCurrentUserContext();
  const sound = (userModel as UserDetailsFragment | undefined)?.settings?.notification?.sound;
  const chatEnabled = sound?.chatMessage ?? true;
  const notificationsEnabled = sound?.inAppNotification ?? true;

  const conversationsCount = useUnreadConversationsCount();
  const notificationsCount = useUnreadNotificationsCount();

  const count = (chatEnabled ? conversationsCount : 0) + (notificationsEnabled ? notificationsCount : 0);

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
