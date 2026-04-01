import { BookOpen, Compass, Lightbulb, MessageCircle } from 'lucide-react';
import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthorizationPrivilege, NotificationEventInAppState, RoleName } from '@/core/apollo/generated/graphql-schema';
import { IdentityRoutes } from '@/core/auth/authentication/routing/IdentityRoute';
import { supportedLngs } from '@/core/i18n/config';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { CrdLayout } from '@/crd/layouts/CrdLayout';
import {
  PendingMembershipsDialogType,
  usePendingMembershipsDialog,
} from '@/domain/community/pendingMembership/PendingMembershipsDialogContext';
import { usePendingInvitationsCount } from '@/domain/community/pendingMembership/usePendingInvitationsCount';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useConfig } from '@/domain/platform/config/useConfig';
import { ROUTE_HOME, ROUTE_USER_ME } from '@/domain/platform/routes/constants';
import { useInAppNotificationsContext } from '@/main/inAppNotifications/InAppNotificationsContext';
import { NotificationFilterType } from '@/main/inAppNotifications/notificationFilters';
import { useInAppNotifications } from '@/main/inAppNotifications/useInAppNotifications';
import { TopLevelRoutePath } from '@/main/routing/TopLevelRoutePath';
import { buildLoginUrl, buildNotificationSettingsUrl, buildUserAccountUrl } from '@/main/routing/urlBuilders';
import { mapNotificationsToItemDataList } from '@/main/ui/layout/notificationDataMapper';
import { useUserMessagingContext } from '@/main/userMessaging/UserMessagingContext';

const PendingMembershipsDialog = lazyWithGlobalErrorHandler(
  () => import('@/domain/community/pendingMembership/PendingMembershipsDialog')
);
const HelpDialog = lazyWithGlobalErrorHandler(() => import('@/core/help/dialog/HelpDialog'));
const NotificationsPanel = lazyWithGlobalErrorHandler(async () => {
  const m = await import('@/crd/layouts/components/NotificationsPanel');
  return { default: m.NotificationsPanel };
});

function getInitials(displayName: string): string {
  const words = displayName.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return (words[0]?.[0] ?? '').toUpperCase();
}

const STATIC_NAVIGATION_HREFS = {
  home: ROUTE_HOME,
  spaces: `/${TopLevelRoutePath.Spaces}`,
  messages: ROUTE_HOME,
  notifications: ROUTE_HOME,
  profile: ROUTE_USER_ME,
  account: buildUserAccountUrl(ROUTE_USER_ME),
  admin: `/${TopLevelRoutePath.Admin}`,
};

function CrdLayoutConnector() {
  const { isAuthenticated, userModel, platformPrivilegeWrapper, platformRoles } = useCurrentUserContext();
  const { t, i18n } = useTranslation();
  const { setIsOpen: setMessagingOpen } = useUserMessagingContext();
  const { selectedFilter: notificationFilter, setSelectedFilter: setNotificationFilter } =
    useInAppNotificationsContext();
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const {
    notificationsInApp,
    unreadCount: notificationsUnreadCount,
    isLoading: isLoadingNotifications,
    updateNotificationState,
    markNotificationsAsRead,
    fetchMore: fetchMoreNotifications,
    hasMore: hasMoreNotifications,
  } = useInAppNotifications();
  const { setOpenDialog } = usePendingMembershipsDialog();
  const { count: pendingInvitationsCount } = usePendingInvitationsCount();
  const { locations } = useConfig();
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const isAdmin = platformPrivilegeWrapper?.hasPlatformPrivilege?.(AuthorizationPrivilege.PlatformAdmin);

  const languages = supportedLngs
    .filter(lng => lng !== 'inContextTool')
    .map(lng => ({ code: lng, label: t(`languages.${lng}`) }));

  const role = (() => {
    for (const platformRole of platformRoles) {
      switch (platformRole) {
        case RoleName.GlobalAdmin:
          return t('common.roles.GLOBAL_ADMIN');
        case RoleName.GlobalSupport:
          return t('common.roles.GLOBAL_SUPPORT');
        case RoleName.GlobalLicenseManager:
          return t('common.roles.GLOBAL_LICENSE_MANAGER');
        case RoleName.PlatformBetaTester:
          return t('common.roles.PLATFORM_BETA_TESTER');
        case RoleName.PlatformVcCampaign:
          return t('common.roles.PLATFORM_VC_CAMPAIGN');
      }
    }
    return undefined;
  })();

  const user = userModel?.profile
    ? {
        name: userModel.profile.displayName,
        avatarUrl: userModel.profile.avatar?.uri,
        initials: getInitials(userModel.profile.displayName),
        role,
      }
    : undefined;

  const navigationHrefs = { ...STATIC_NAVIGATION_HREFS, login: buildLoginUrl(pathname, search) };

  const footerLinks = locations
    ? { terms: locations.terms, privacy: locations.privacy, security: locations.security, about: locations.about }
    : undefined;

  const platformNavigationItems = [
    {
      icon: <Lightbulb className="h-4 w-4" />,
      label: t('pages.innovationLibrary.fullName'),
      href: `/${TopLevelRoutePath.InnovationLibrary}`,
    },
    {
      icon: <MessageCircle className="h-4 w-4" />,
      label: t('pages.forum.fullName'),
      href: `/${TopLevelRoutePath.Forum}`,
    },
    {
      icon: <Compass className="h-4 w-4" />,
      label: t('pages.exploreSpaces.fullName'),
      href: `/${TopLevelRoutePath.Spaces}`,
    },
    {
      icon: <BookOpen className="h-4 w-4" />,
      label: t('pages.documentation.title'),
      href: `/${TopLevelRoutePath.Docs}`,
    },
  ];

  const notificationItems = mapNotificationsToItemDataList(
    notificationsInApp ?? [],
    t,
    NotificationEventInAppState.Unread
  );

  const notificationFilters = [
    { key: NotificationFilterType.All, label: t('components.inAppNotifications.filters.all') },
    {
      key: NotificationFilterType.MessagesAndReplies,
      label: t('components.inAppNotifications.filters.messagesAndReplies'),
    },
    { key: NotificationFilterType.Space, label: t('components.inAppNotifications.filters.space') },
    { key: NotificationFilterType.Platform, label: t('components.inAppNotifications.filters.platform') },
  ];

  const notificationSettingsHref = userModel?.profile?.url
    ? buildNotificationSettingsUrl(userModel.profile.url)
    : undefined;

  const handleNotificationClick = (notification: { id: string; isUnread: boolean; href?: string }) => {
    if (notification.isUnread) {
      updateNotificationState(notification.id, NotificationEventInAppState.Read);
    }
    setNotificationsOpen(false);
    if (notification.href) {
      navigate(notification.href);
    }
  };

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
        currentPath={pathname}
        unreadNotificationsCount={notificationsUnreadCount}
        languages={languages}
        currentLanguage={i18n.language}
        onLanguageChange={code => i18n.changeLanguage(code)}
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
