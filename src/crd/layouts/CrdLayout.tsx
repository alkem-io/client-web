import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { GridOverlayProvider } from '@/crd/hooks/useGridOverlay';
import { GridOverlay } from '@/crd/layouts/components/GridOverlay';
import { Footer } from '@/crd/layouts/Footer';
import { Header } from '@/crd/layouts/Header';
import type {
  CrdFooterLinks,
  CrdLanguageOption,
  CrdNavigationHrefs,
  CrdPlatformNavigationItem,
  CrdUserInfo,
} from '@/crd/layouts/types';

type CrdLayoutProps = {
  user?: CrdUserInfo;
  authenticated: boolean;
  navigationHrefs: CrdNavigationHrefs;
  isAdmin?: boolean;
  pendingInvitationsCount?: number;
  platformNavigationItems?: CrdPlatformNavigationItem[];
  currentPath?: string;
  unreadNotificationsCount?: number;
  unreadMessagesCount?: number;
  languages: CrdLanguageOption[];
  currentLanguage: string;
  breadcrumbs?: ReactNode;
  onLanguageChange: (code: string) => void;
  onLogout?: () => void;
  onMessagesClick?: () => void;
  onNotificationsClick?: () => void;
  onSearchClick?: () => void;
  onPendingMembershipsClick?: () => void;
  onHelpClick?: () => void;
  footerLinks?: CrdFooterLinks;
  showGridToggle?: boolean;
  /** When true the header's inner content fills all 12 grid columns (full-width space pages). */
  fullWidth?: boolean;
  /** When true the header renders transparently over a hero banner below it. */
  overlayBanner?: boolean;
  children: ReactNode;
};

export function CrdLayout({
  user,
  authenticated,
  navigationHrefs,
  isAdmin,
  pendingInvitationsCount,
  platformNavigationItems,
  currentPath,
  unreadNotificationsCount,
  unreadMessagesCount,
  languages,
  currentLanguage,
  breadcrumbs,
  onLanguageChange,
  onLogout,
  onMessagesClick,
  onNotificationsClick,
  onSearchClick,
  onPendingMembershipsClick,
  onHelpClick,
  footerLinks,
  showGridToggle,
  fullWidth,
  overlayBanner,
  children,
}: CrdLayoutProps) {
  const { t } = useTranslation('crd-layout');
  const content = (
    <div className="crd-root flex min-h-screen flex-col bg-background text-foreground">
      <a
        href="#crd-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {t('header.skipToContent')}
      </a>
      <Header
        user={user}
        authenticated={authenticated}
        navigationHrefs={navigationHrefs}
        isAdmin={isAdmin}
        pendingInvitationsCount={pendingInvitationsCount}
        platformNavigationItems={platformNavigationItems}
        currentPath={currentPath}
        unreadNotificationsCount={unreadNotificationsCount}
        unreadMessagesCount={unreadMessagesCount}
        languages={languages}
        currentLanguage={currentLanguage}
        breadcrumbs={breadcrumbs}
        onLanguageChange={onLanguageChange}
        onLogout={onLogout}
        onMessagesClick={onMessagesClick}
        onNotificationsClick={onNotificationsClick}
        onSearchClick={onSearchClick}
        onPendingMembershipsClick={onPendingMembershipsClick}
        onHelpClick={onHelpClick}
        showGridToggle={showGridToggle}
        fullWidth={fullWidth}
        overlayBanner={overlayBanner}
      />
      <main id="crd-main-content" tabIndex={-1} className="flex-1 flex flex-col outline-none">
        {children}
      </main>
      <Footer
        links={footerLinks}
        languages={languages}
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
        onSupportClick={onHelpClick}
      />
      {showGridToggle && <GridOverlay />}
    </div>
  );

  if (showGridToggle) {
    return <GridOverlayProvider>{content}</GridOverlayProvider>;
  }

  return content;
}
