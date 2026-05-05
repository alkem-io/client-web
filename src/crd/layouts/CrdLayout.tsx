import type { ReactNode } from 'react';
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
  children,
}: CrdLayoutProps) {
  const content = (
    <div className="crd-root flex min-h-screen flex-col bg-background text-foreground">
      <Header
        user={user}
        authenticated={authenticated}
        navigationHrefs={navigationHrefs}
        isAdmin={isAdmin}
        pendingInvitationsCount={pendingInvitationsCount}
        platformNavigationItems={platformNavigationItems}
        currentPath={currentPath}
        unreadNotificationsCount={unreadNotificationsCount}
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
      />
      <main className="flex-1 flex flex-col">{children}</main>
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
