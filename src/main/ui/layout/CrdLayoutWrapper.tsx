import { type ReactNode, Suspense, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { trackChatOpen } from '@/core/analytics/events/unifiedChat';
import { AUTH_LOGOUT_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import useNavigate from '@/core/routing/useNavigate';
import { BreadcrumbsTrail } from '@/crd/components/common/BreadcrumbsTrail';
import { CrdLayout } from '@/crd/layouts/CrdLayout';
import { MarkdownConfigProvider } from '@/crd/lib/markdownConfig';
import {
  PendingMembershipsDialogType,
  usePendingMembershipsDialog,
} from '@/domain/community/pendingMembership/PendingMembershipsDialogContext';
import { usePendingInvitationsCount } from '@/domain/community/pendingMembership/usePendingInvitationsCount';
import { useConfig } from '@/domain/platform/config/useConfig';
import { useInAppNotificationsContext } from '@/main/inAppNotifications/InAppNotificationsContext';
import { useInAppNotifications } from '@/main/inAppNotifications/useInAppNotifications';
import { SearchProvider, useSearch } from '@/main/search/SearchContext';
import { BreadcrumbsProvider, useBreadcrumbs } from '@/main/ui/breadcrumbs/BreadcrumbsContext';
import { BannerOverlayProvider, useBannerOverlay } from '@/main/ui/layout/BannerOverlayContext';
import { LayoutWidthProvider, useSpaceFullWidthActive } from '@/main/ui/layout/LayoutWidthContext';
import { useCrdNavigation } from '@/main/ui/layout/useCrdNavigation';
import { useCrdUser } from '@/main/ui/layout/useCrdUser';
import { useUserMessagingContext } from '@/main/userMessaging/UserMessagingContext';
import { useUnreadConversationsCount } from '@/main/userMessaging/useUnreadConversationsCount';

const CrdPendingMembershipsDialog = lazyWithGlobalErrorHandler(
  () => import('@/main/crdPages/dashboard/CrdPendingMembershipsDialog')
);
const HelpDialog = lazyWithGlobalErrorHandler(() => import('@/main/crdPages/help/CrdHelpDialog'));
const CrdSearchOverlay = lazyWithGlobalErrorHandler(() => import('@/main/crdPages/search/CrdSearchOverlay'));

function CrdLayoutConnector({ children }: { children?: ReactNode }) {
  const { user, userModel, isAuthenticated, isAdmin } = useCrdUser();
  const { integration: { iframeAllowedUrls = [] } = {} } = useConfig();
  const {
    navigationHrefs,
    footerLinks,
    languages,
    currentLanguage,
    currentPath,
    handleLanguageChange,
    platformNavigationItems,
  } = useCrdNavigation();

  const { setIsOpen: setNotificationsOpen } = useInAppNotificationsContext();
  const { unreadCount: notificationsUnreadCount } = useInAppNotifications();
  const { setIsOpen: setMessagingOpen } = useUserMessagingContext();
  const unreadMessagesCount = useUnreadConversationsCount();
  const { setOpenDialog } = usePendingMembershipsDialog();
  const { count: pendingInvitationsCount } = usePendingInvitationsCount();
  const { openSearch } = useSearch();
  const navigate = useNavigate();
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const breadcrumbItems = useBreadcrumbs();
  const overlayBanner = useBannerOverlay();
  // Full-width is owned per-space by the space page; the global header reads
  // the live value here only so its top bar stays aligned with the body.
  const headerFullWidth = useSpaceFullWidthActive();

  const handleLogout = () => {
    navigate(AUTH_LOGOUT_PATH);
  };

  const handlePendingMembershipsClick = () => {
    setOpenDialog({ type: PendingMembershipsDialogType.PendingMembershipsList });
  };

  // Cmd+K / Ctrl+K keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openSearch]);

  return (
    <MarkdownConfigProvider iframeAllowedUrls={iframeAllowedUrls}>
      <CrdLayout
        user={user}
        authenticated={isAuthenticated}
        navigationHrefs={navigationHrefs}
        isAdmin={isAdmin}
        pendingInvitationsCount={pendingInvitationsCount}
        platformNavigationItems={platformNavigationItems}
        currentPath={currentPath}
        unreadNotificationsCount={notificationsUnreadCount}
        unreadMessagesCount={unreadMessagesCount}
        languages={languages}
        currentLanguage={currentLanguage}
        breadcrumbs={breadcrumbItems.length > 0 ? <BreadcrumbsTrail items={breadcrumbItems} /> : undefined}
        overlayBanner={overlayBanner}
        fullWidth={headerFullWidth}
        onLanguageChange={handleLanguageChange}
        onLogout={handleLogout}
        onMessagesClick={() => {
          trackChatOpen('headerIcon');
          setMessagingOpen(true);
        }}
        onNotificationsClick={() => setNotificationsOpen(true)}
        onPendingMembershipsClick={isAuthenticated ? handlePendingMembershipsClick : undefined}
        onHelpClick={() => setIsHelpDialogOpen(true)}
        onSearchClick={() => openSearch()}
        footerLinks={footerLinks}
      >
        {children ?? <Outlet />}
      </CrdLayout>
      {userModel && (
        <Suspense fallback={null}>
          <CrdPendingMembershipsDialog />
        </Suspense>
      )}
      <Suspense fallback={null}>
        <HelpDialog open={isHelpDialogOpen} onClose={() => setIsHelpDialogOpen(false)} />
      </Suspense>
      <Suspense fallback={null}>
        <CrdSearchOverlay />
      </Suspense>
    </MarkdownConfigProvider>
  );
}

export function CrdLayoutWrapper({ children }: { children?: ReactNode } = {}) {
  return (
    <BreadcrumbsProvider>
      <BannerOverlayProvider>
        <LayoutWidthProvider>
          <SearchProvider>
            <CrdLayoutConnector>{children}</CrdLayoutConnector>
          </SearchProvider>
        </LayoutWidthProvider>
      </BannerOverlayProvider>
    </BreadcrumbsProvider>
  );
}
