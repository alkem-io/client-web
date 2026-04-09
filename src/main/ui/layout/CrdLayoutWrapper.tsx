import { Suspense, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { IdentityRoutes } from '@/core/auth/authentication/routing/IdentityRoute';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import useNavigate from '@/core/routing/useNavigate';
import { CrdLayout } from '@/crd/layouts/CrdLayout';
import {
  PendingMembershipsDialogType,
  usePendingMembershipsDialog,
} from '@/domain/community/pendingMembership/PendingMembershipsDialogContext';
import { usePendingInvitationsCount } from '@/domain/community/pendingMembership/usePendingInvitationsCount';
import { useInAppNotificationsContext } from '@/main/inAppNotifications/InAppNotificationsContext';
import { useInAppNotifications } from '@/main/inAppNotifications/useInAppNotifications';
import { SearchProvider, useSearch } from '@/main/search/SearchContext';
import { useCrdNavigation } from '@/main/ui/layout/useCrdNavigation';
import { useCrdUser } from '@/main/ui/layout/useCrdUser';
import { useUserMessagingContext } from '@/main/userMessaging/UserMessagingContext';

const CrdPendingMembershipsDialog = lazyWithGlobalErrorHandler(
  () => import('@/main/crdPages/dashboard/CrdPendingMembershipsDialog')
);
const HelpDialog = lazyWithGlobalErrorHandler(() => import('@/core/help/dialog/HelpDialog'));
const CrdSearchOverlay = lazyWithGlobalErrorHandler(() => import('@/main/search/CrdSearchOverlay'));

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

  const { setIsOpen: setNotificationsOpen } = useInAppNotificationsContext();
  const { unreadCount: notificationsUnreadCount } = useInAppNotifications();
  const { setIsOpen: setMessagingOpen } = useUserMessagingContext();
  const { setOpenDialog } = usePendingMembershipsDialog();
  const { count: pendingInvitationsCount } = usePendingInvitationsCount();
  const { openSearch } = useSearch();
  const navigate = useNavigate();
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);

  const handleLogout = () => {
    navigate(IdentityRoutes.Logout);
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
        onSearchClick={() => openSearch()}
        footerLinks={footerLinks}
      >
        <Outlet />
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
    </>
  );
}

export function CrdLayoutWrapper() {
  return (
    <SearchProvider>
      <CrdLayoutConnector />
    </SearchProvider>
  );
}
