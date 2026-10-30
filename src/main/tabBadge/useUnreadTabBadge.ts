import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { setTitleOverride, setTitlePrefix } from '@/core/routing/documentTitle';
import { useUnreadNotificationsCount } from '@/main/inAppNotifications/useUnreadNotificationsCount';
import { useIncomingCallRooms } from '@/main/userMessaging/calls/incomingCallStore';
import { useUserMessagingContext } from '@/main/userMessaging/UserMessagingContext';
import { useUnreadConversationsCount } from '@/main/userMessaging/useUnreadConversationsCount';
import { clearFaviconBadge, setFaviconBadge } from './faviconBadge';

const CALL_TITLE_INTERVAL_MS = 1500;

/**
 * Drives the browser-tab unread indicator (US5): a `(N) ` title prefix plus a
 * favicon badge. While a call the user is not in runs in a conversation the
 * user is not looking at, the title alternates between the page title and
 * "Name is calling you" (or "Call in Group").
 *
 * The count is the unread-conversations count plus the unread-notifications count
 * (FR-007/008/009), and is deliberately INDEPENDENT of the two sound settings:
 * muting a sound silences the cue but must never hide its items from the tab — for a
 * user who has muted the sounds, the badge is the only unread signal left. Do not
 * reintroduce a read of `settings.notification.sound` here.
 */
export const useUnreadTabBadge = (): void => {
  const { t } = useTranslation('crd-chat');
  const { selectedRoomId } = useUserMessagingContext();
  const conversationsCount = useUnreadConversationsCount();
  const notificationsCount = useUnreadNotificationsCount();
  const incomingCallRooms = useIncomingCallRooms();

  const count = conversationsCount + notificationsCount;
  const call = [...incomingCallRooms].find(([roomId, incoming]) => incoming && roomId !== selectedRoomId)?.[1];
  const callTitle = call ? t(call.isGroup ? 'call.groupCall' : 'call.callingYou', { name: call.name }) : '';

  useEffect(() => {
    if (count > 0) {
      setTitlePrefix(`(${count}) `);
      setFaviconBadge(count);
    } else {
      setTitlePrefix('');
      clearFaviconBadge();
    }
  }, [count]);

  // Alternates with the page title, so the call stands out among the tabs.
  useEffect(() => {
    if (!callTitle) {
      return;
    }
    let isShowingCall = true;
    setTitleOverride(callTitle);
    const timer = setInterval(() => {
      isShowingCall = !isShowingCall;
      setTitleOverride(isShowingCall ? callTitle : null);
    }, CALL_TITLE_INTERVAL_MS);
    return () => {
      clearInterval(timer);
      setTitleOverride(null);
    };
  }, [callTitle]);
};
