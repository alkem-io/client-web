import { Component, type ErrorInfo, type ReactNode, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthorizationPrivilege, RoleName } from '@/core/apollo/generated/graphql-schema';
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
import { TopLevelRoutePath } from '@/main/routing/TopLevelRoutePath';
import { buildLoginUrl, buildUserAccountUrl } from '@/main/routing/urlBuilders';
import { useUserMessagingContext } from '@/main/userMessaging/UserMessagingContext';

const PendingMembershipsDialog = lazyWithGlobalErrorHandler(
  () => import('@/domain/community/pendingMembership/PendingMembershipsDialog')
);
const HelpDialog = lazyWithGlobalErrorHandler(() => import('@/core/help/dialog/HelpDialog'));

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
  const { setIsOpen: setNotificationsOpen } = useInAppNotificationsContext();
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
    </>
  );
}

// Error boundary to catch CRD rendering errors gracefully
class CrdErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CRD layout error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Something went wrong loading this page.</h2>
          <p>
            <a href="/" style={{ color: '#09BCD4' }}>
              Return home
            </a>
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export function CrdLayoutWrapper() {
  return (
    <CrdErrorBoundary>
      <CrdLayoutConnector />
    </CrdErrorBoundary>
  );
}
