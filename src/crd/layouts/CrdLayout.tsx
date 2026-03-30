import type { ReactNode } from 'react';
import { Footer } from '@/crd/layouts/Footer';
import { Header } from '@/crd/layouts/Header';
import type { CrdFooterLinks, CrdLanguageOption, CrdNavigationHrefs, CrdUserInfo } from '@/crd/layouts/types';

type CrdLayoutProps = {
  user?: CrdUserInfo;
  authenticated: boolean;
  navigationHrefs: CrdNavigationHrefs;
  isAdmin?: boolean;
  pendingInvitationsCount?: number;
  languages: CrdLanguageOption[];
  currentLanguage: string;
  onLanguageChange: (code: string) => void;
  onLogout?: () => void;
  onMessagesClick?: () => void;
  onNotificationsClick?: () => void;
  onSearchClick?: () => void;
  onPendingMembershipsClick?: () => void;
  onHelpClick?: () => void;
  footerLinks?: CrdFooterLinks;
  children: ReactNode;
};

export function CrdLayout({
  user,
  authenticated,
  navigationHrefs,
  isAdmin,
  pendingInvitationsCount,
  languages,
  currentLanguage,
  onLanguageChange,
  onLogout,
  onMessagesClick,
  onNotificationsClick,
  onSearchClick,
  onPendingMembershipsClick,
  onHelpClick,
  footerLinks,
  children,
}: CrdLayoutProps) {
  return (
    <div className="crd-root flex min-h-screen flex-col bg-background text-foreground">
      <Header
        user={user}
        authenticated={authenticated}
        navigationHrefs={navigationHrefs}
        isAdmin={isAdmin}
        pendingInvitationsCount={pendingInvitationsCount}
        languages={languages}
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
        onLogout={onLogout}
        onMessagesClick={onMessagesClick}
        onNotificationsClick={onNotificationsClick}
        onSearchClick={onSearchClick}
        onPendingMembershipsClick={onPendingMembershipsClick}
        onHelpClick={onHelpClick}
      />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer
        links={footerLinks}
        languages={languages}
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
        onSupportClick={onHelpClick}
      />
    </div>
  );
}
