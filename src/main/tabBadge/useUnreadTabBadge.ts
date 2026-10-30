import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { setTitlePrefix } from '@/core/routing/documentTitle';
import { useUnreadNotificationsCount } from '@/main/inAppNotifications/useUnreadNotificationsCount';
import { useIncomingCallRooms } from '@/main/userMessaging/calls/incomingCallStore';
import { useUserMessagingContext } from '@/main/userMessaging/UserMessagingContext';
import { useUnreadConversationsCount } from '@/main/userMessaging/useUnreadConversationsCount';
import { clearFaviconBadge, setFaviconBadge } from './faviconBadge';

/**
 * Drives the browser-tab unread indicator (US5): a `(N) ` title prefix plus a
 * favicon badge, and "Name is calling you" while someone calls the user in a
 * direct conversation the user is not looking at.
 *
 * The count is the unread-conversations count plus the unread-notifications count
 * (FR-007/008/009), and is deliberately INDEPENDENT of the two sound settings:
 * muting a sound silences the cue but must never hide its items from the tab — for a
 * user who has muted the sounds, the badge is the only unread signal left. Do not
 * reintroduce a read of `settings.notification.sound` here.
 */
export const useUnreadTabBadge = (): void => {
  const { t } = useTranslation();
  const { t: tChat } = useTranslation('crd-chat');
  const { selectedRoomId } = useUserMessagingContext();
  const conversationsCount = useUnreadConversationsCount();
  const notificationsCount = useUnreadNotificationsCount();
  const incomingCallRooms = useIncomingCallRooms();

  const count = conversationsCount + notificationsCount;
  const caller = [...incomingCallRooms].find(([roomId, name]) => name && roomId !== selectedRoomId)?.[1];
  const callingPrefix = caller ? `${tChat('call.callingYou', { name: caller })}${t('pages.titles.separator')}` : '';

  useEffect(() => {
    const countPrefix = count > 0 ? `(${count}) ` : '';
    setTitlePrefix(`${countPrefix}${callingPrefix}`);
    if (count > 0) {
      setFaviconBadge(count);
    } else {
      clearFaviconBadge();
    }
  }, [count, callingPrefix]);
};
