import { useTranslation } from 'react-i18next';
import { NotificationEventInAppState } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { useInAppNotificationsContext } from '@/main/inAppNotifications/InAppNotificationsContext';
import { NotificationFilterType } from '@/main/inAppNotifications/notificationFilters';
import { useInAppNotifications } from '@/main/inAppNotifications/useInAppNotifications';
import { buildNotificationSettingsUrl } from '@/main/routing/urlBuilders';
import { mapNotificationsToItemDataList } from '@/main/ui/layout/notificationDataMapper';

export function useCrdNotifications(userProfileUrl?: string) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    isOpen: isNotificationsOpen,
    setIsOpen: setNotificationsOpen,
    selectedFilter: notificationFilter,
    setSelectedFilter: setNotificationFilter,
  } = useInAppNotificationsContext();
  const {
    notificationsInApp,
    unreadCount: notificationsUnreadCount,
    unreadCountsByFilter,
    isLoading: isLoadingNotifications,
    updateNotificationState,
    markNotificationsAsRead,
    fetchMore: fetchMoreNotifications,
    hasMore: hasMoreNotifications,
  } = useInAppNotifications();

  const notificationItems = mapNotificationsToItemDataList(
    notificationsInApp ?? [],
    t,
    NotificationEventInAppState.Unread
  );

  const notificationFilters = [
    {
      key: NotificationFilterType.All,
      label: t('components.inAppNotifications.filters.all'),
      hasUnread: unreadCountsByFilter[NotificationFilterType.All] > 0,
    },
    {
      key: NotificationFilterType.MessagesAndReplies,
      label: t('components.inAppNotifications.filters.messagesAndReplies'),
      hasUnread: unreadCountsByFilter[NotificationFilterType.MessagesAndReplies] > 0,
    },
    {
      key: NotificationFilterType.Space,
      label: t('components.inAppNotifications.filters.space'),
      hasUnread: unreadCountsByFilter[NotificationFilterType.Space] > 0,
    },
    {
      key: NotificationFilterType.Platform,
      label: t('components.inAppNotifications.filters.platform'),
      hasUnread: unreadCountsByFilter[NotificationFilterType.Platform] > 0,
    },
  ];

  const notificationSettingsHref = userProfileUrl ? buildNotificationSettingsUrl(userProfileUrl) : undefined;

  const handleNotificationClick = (notification: { id: string; isUnread: boolean; href?: string }) => {
    if (notification.isUnread) {
      updateNotificationState(notification.id, NotificationEventInAppState.Read);
    }
    setNotificationsOpen(false);
    if (notification.href) {
      navigate(notification.href);
    }
  };

  return {
    isNotificationsOpen,
    setNotificationsOpen,
    notificationsUnreadCount,
    notificationItems,
    notificationFilters,
    notificationFilter,
    setNotificationFilter,
    isLoadingNotifications,
    hasMoreNotifications,
    notificationSettingsHref,
    handleNotificationClick,
    markNotificationsAsRead,
    fetchMoreNotifications,
    updateNotificationState,
  };
}
