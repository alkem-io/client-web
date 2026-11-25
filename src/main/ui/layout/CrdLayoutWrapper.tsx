import { format } from 'date-fns';
import { type ReactNode, Suspense, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { trackChatOpen } from '@/core/analytics/events/unifiedChat';
import { isAppMode } from '@/core/appMode/isAppMode';
import { isStandaloneDisplay } from '@/core/appMode/isStandaloneDisplay';
import { AUTH_LOGOUT_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import useNavigate from '@/core/routing/useNavigate';
import { BreadcrumbsTrail } from '@/crd/components/common/BreadcrumbsTrail';
import { DownNoticeBanner } from '@/crd/components/common/DownNoticeBanner';
import { MobileBreadcrumbs } from '@/crd/components/common/MobileBreadcrumbs';
import { SecondFactorReminderBanner } from '@/crd/components/common/SecondFactorReminderBanner';
import { CrdLayout } from '@/crd/layouts/CrdLayout';
import { resolveDateFnsLocale } from '@/crd/lib/dateFnsLocale';
import { MarkdownConfigProvider } from '@/crd/lib/markdownConfig';
import {
  PendingMembershipsDialogType,
  usePendingMembershipsDialog,
} from '@/domain/community/pendingMembership/PendingMembershipsDialogContext';
import { usePendingInvitationsCount } from '@/domain/community/pendingMembership/usePendingInvitationsCount';
import { LanguageOfferBannerConnector } from '@/domain/language/LanguageOfferBannerConnector';
import { useConfig } from '@/domain/platform/config/useConfig';
import { useInAppNotificationsContext } from '@/main/inAppNotifications/InAppNotificationsContext';
import { useInAppNotifications } from '@/main/inAppNotifications/useInAppNotifications';
import { SearchProvider, useSearch } from '@/main/search/SearchContext';
import { BreadcrumbsProvider, useBreadcrumbs } from '@/main/ui/breadcrumbs/BreadcrumbsContext';
import { BannerOverlayProvider, useBannerOverlay } from '@/main/ui/layout/BannerOverlayContext';
import { LayoutWidthProvider, useSpaceFullWidthActive } from '@/main/ui/layout/LayoutWidthContext';
import { MemoSigningReturnProvider } from '@/main/ui/layout/MemoSigningReturnContext';
import { MemoSigningReturnDialogConnector } from '@/main/ui/layout/MemoSigningReturnDialogConnector';
import { useCrdNavigation } from '@/main/ui/layout/useCrdNavigation';
import { useCrdUser } from '@/main/ui/layout/useCrdUser';
import { useDownNoticeBanner } from '@/main/ui/layout/useDownNoticeBanner';
import { useSecondFactorReminder } from '@/main/ui/layout/useSecondFactorReminder';
import { useIncomingCallLabel } from '@/main/userMessaging/calls/useIncomingCallLabel';
import { useUserMessagingContext } from '@/main/userMessaging/UserMessagingContext';
import { useUnreadConversationsCount } from '@/main/userMessaging/useUnreadConversationsCount';

const CrdPendingMembershipsDialog = lazyWithGlobalErrorHandler(
  () => import('@/main/crdPages/dashboard/CrdPendingMembershipsDialog')
);
const HelpDialog = lazyWithGlobalErrorHandler(() => import('@/main/crdPages/help/CrdHelpDialog'));
const CrdSearchOverlay = lazyWithGlobalErrorHandler(() => import('@/main/crdPages/search/CrdSearchOverlay'));

// The viewer's zone at that date, e.g. "CET". en-GB names the European zones; others read "GMT-5".
const timeZoneLabel = (date: Date) =>
  new Intl.DateTimeFormat('en-GB', { timeZoneName: 'short' })
    .formatToParts(date)
    .find(part => part.type === 'timeZoneName')?.value ?? '';

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
  const incomingCallLabel = useIncomingCallLabel();
  const { setOpenDialog } = usePendingMembershipsDialog();
  const { count: pendingInvitationsCount } = usePendingInvitationsCount();
  const { openSearch } = useSearch();
  const navigate = useNavigate();
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const { visible: downNoticeVisible, notice: downNotice, dismiss: dismissDownNotice } = useDownNoticeBanner();
  const breadcrumbItems = useBreadcrumbs();
  const overlayBanner = useBannerOverlay();
  const secondFactorReminder = useSecondFactorReminder();
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
      {/* Language offer banner — shown AFTER cookie consent resolves, never pre-empting it (R-9). */}
      <LanguageOfferBannerConnector />
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
        incomingCallLabel={incomingCallLabel}
        languages={languages}
        currentLanguage={currentLanguage}
        breadcrumbs={
          breadcrumbItems.length > 0 ? (
            <>
              <BreadcrumbsTrail items={breadcrumbItems} />
              <MobileBreadcrumbs items={breadcrumbItems} homeHref={navigationHrefs.home} />
            </>
          ) : undefined
        }
        overlayBanner={overlayBanner}
        topBanner={
          downNoticeVisible || secondFactorReminder.visible ? (
            <>
              {downNoticeVisible && downNotice ? (
                <DownNoticeBanner
                  kind={downNotice.kind}
                  name={downNotice.name}
                  scheduledFor={
                    downNotice.scheduledFor &&
                    `${format(downNotice.scheduledFor, 'd MMM yyyy, HH:mm', {
                      locale: resolveDateFnsLocale(currentLanguage),
                    })} ${timeZoneLabel(downNotice.scheduledFor)}`
                  }
                  statusHref={downNotice.href}
                  onDismiss={dismissDownNotice}
                />
              ) : null}
              {secondFactorReminder.visible && secondFactorReminder.deadline ? (
                <SecondFactorReminderBanner
                  deadline={format(secondFactorReminder.deadline, 'PPP', {
                    locale: resolveDateFnsLocale(currentLanguage),
                  })}
                  secondWayNeeded={secondFactorReminder.secondWayNeeded}
                  securityHref={secondFactorReminder.securityHref}
                  onDismiss={secondFactorReminder.dismiss}
                />
              ) : null}
            </>
          ) : undefined
        }
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
        // A full reload, like the new-version banner: it also picks up a newer client build.
        // Offered where there is no browser reload button: the store app and the installed PWA.
        onRefreshClick={
          isAppMode() || isStandaloneDisplay()
            ? // The origin is pinned: a pathname starting with '//' alone would be a protocol-relative URL.
              () => window.location.replace(window.location.origin + window.location.pathname + window.location.search)
            : undefined
        }
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
      <MemoSigningReturnDialogConnector />
    </MarkdownConfigProvider>
  );
}

export function CrdLayoutWrapper({ children }: { children?: ReactNode } = {}) {
  // LanguageOfferProvider is NOT here — it is hoisted to App (corr-client-4 fix) so the
  // in-memory anonymous choice survives navigation between route groups within one session.
  return (
    <BreadcrumbsProvider>
      <BannerOverlayProvider>
        <LayoutWidthProvider>
          <SearchProvider>
            <MemoSigningReturnProvider>
              <CrdLayoutConnector>{children}</CrdLayoutConnector>
            </MemoSigningReturnProvider>
          </SearchProvider>
        </LayoutWidthProvider>
      </BannerOverlayProvider>
    </BreadcrumbsProvider>
  );
}
