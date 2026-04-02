import { Suspense, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { NotificationEventInAppState } from '@/core/apollo/generated/graphql-schema';
import { IdentityRoutes } from '@/core/auth/authentication/routing/IdentityRoute';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { CrdLayout } from '@/crd/layouts/CrdLayout';
import {
  PendingMembershipsDialogType,
  usePendingMembershipsDialog,
} from '@/domain/community/pendingMembership/PendingMembershipsDialogContext';
import { usePendingInvitationsCount } from '@/domain/community/pendingMembership/usePendingInvitationsCount';
import type { NotificationFilterType } from '@/main/inAppNotifications/notificationFilters';
import { useCrdNavigation } from '@/main/ui/layout/useCrdNavigation';
import { useCrdNotifications } from '@/main/ui/layout/useCrdNotifications';
import { useCrdUser } from '@/main/ui/layout/useCrdUser';
import { useUserMessagingContext } from '@/main/userMessaging/UserMessagingContext';

const PendingMembershipsDialog = lazyWithGlobalErrorHandler(
  () => import('@/domain/community/pendingMembership/PendingMembershipsDialog')
);
const HelpDialog = lazyWithGlobalErrorHandler(() => import('@/core/help/dialog/HelpDialog'));
const NotificationsPanel = lazyWithGlobalErrorHandler(async () => {
  const m = await import('@/crd/components/notifications/NotificationsPanel');
  return { default: m.NotificationsPanel };
});

function CrdLayoutConnector() {
  const { user, userModel, isAuthenticated, isAdmin } = useCrdUser();
  const {
    navigationHrefs,
    footerLinks,
    languages,
    currentLanguage,
    currentPath,
    handleLanguageChange,
    platformNavigationItems,
  } = useCrdNavigation();
  const {
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
  } = useCrdNotifications(userModel?.profile?.url);

  const { setIsOpen: setMessagingOpen } = useUserMessagingContext();
  const { setOpenDialog } = usePendingMembershipsDialog();
  const { count: pendingInvitationsCount } = usePendingInvitationsCount();
  const navigate = useNavigate();
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);

  const handleLogout = () => {
    navigate(IdentityRoutes.Logout);
  };

  const handlePendingMembershipsClick = () => {
    setOpenDialog({ type: PendingMembershipsDialogType.PendingMembershipsList });
  };

  return (
    <>
      <CrdLayout
        user={user}
        authenticated={isAuthenticated}
        navigationHrefs={navigationHrefs}
        isAdmin={isAdmin}
        pendingInvitationsCount={pendingInvitationsCount}
        platformNavigationItems={platformNavigationItems}
        currentPath={currentPath}
        unreadNotificationsCount={notificationsUnreadCount}
        languages={languages}
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        onLogout={handleLogout}
        onMessagesClick={() => setMessagingOpen(true)}
        onNotificationsClick={() => setNotificationsOpen(true)}
        onPendingMembershipsClick={isAuthenticated ? handlePendingMembershipsClick : undefined}
        onHelpClick={() => setIsHelpDialogOpen(true)}
        footerLinks={footerLinks}
      >
        <Outlet />
      </CrdLayout>
      {userModel && (
        <Suspense fallback={null}>
          <PendingMembershipsDialog />
        </Suspense>
      )}
      <Suspense fallback={null}>
        <HelpDialog open={isHelpDialogOpen} onClose={() => setIsHelpDialogOpen(false)} />
      </Suspense>
      {isAuthenticated && (
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
      )}
    </>
  );
}

export function CrdLayoutWrapper() {
  return <CrdLayoutConnector />;
}
