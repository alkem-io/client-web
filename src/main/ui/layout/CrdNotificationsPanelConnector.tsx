import { Suspense } from 'react';
import { NotificationEventInAppState } from '@/core/apollo/generated/graphql-schema';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import type { NotificationFilterType } from '@/main/inAppNotifications/notificationFilters';
import { useCrdNotifications } from '@/main/ui/layout/useCrdNotifications';

const NotificationsPanel = lazyWithGlobalErrorHandler(async () => {
  const m = await import('@/crd/components/notifications/NotificationsPanel');
  return { default: m.NotificationsPanel };
});

function CrdNotificationsPanelConnector() {
  const { isAuthenticated, userModel } = useCurrentUserContext();
  const {
    isNotificationsOpen,
    setNotificationsOpen,
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
  } = useCrdNotifications(userModel?.profile?.url);

  if (!isAuthenticated) return null;

  return (
    <Suspense fallback={null}>
      <NotificationsPanel
        open={isNotificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        items={notificationItems}
        filters={notificationFilters}
        selectedFilter={notificationFilter}
        loading={isLoadingNotifications}
        hasMore={hasMoreNotifications}
        settingsHref={notificationSettingsHref}
        onFilterChange={key => setNotificationFilter(key as NotificationFilterType)}
        onMarkAllRead={() => markNotificationsAsRead()}
        onLoadMore={() => fetchMoreNotifications()}
        onNotificationClick={handleNotificationClick}
        onRead={id => updateNotificationState(id, NotificationEventInAppState.Read)}
        onUnread={id => updateNotificationState(id, NotificationEventInAppState.Unread)}
        onArchive={id => updateNotificationState(id, NotificationEventInAppState.Archived)}
      />
    </Suspense>
  );
}

export default CrdNotificationsPanelConnector;
