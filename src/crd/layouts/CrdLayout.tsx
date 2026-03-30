import type { ReactNode } from 'react';
import { Footer } from '@/crd/layouts/Footer';
import { Header } from '@/crd/layouts/Header';
import type { CrdLanguageOption, CrdNavigationHrefs, CrdUserInfo } from '@/crd/layouts/types';

type CrdLayoutProps = {
  user?: CrdUserInfo;
  authenticated: boolean;
  navigationHrefs: CrdNavigationHrefs;
  languages: CrdLanguageOption[];
  currentLanguage: string;
  onLanguageChange: (code: string) => void;
  onLogout?: () => void;
  onMessagesClick?: () => void;
  onNotificationsClick?: () => void;
  onSearchClick?: () => void;
  children: ReactNode;
};

export function CrdLayout({
  user,
  authenticated,
  navigationHrefs,
  languages,
  currentLanguage,
  onLanguageChange,
  onLogout,
  onMessagesClick,
  onNotificationsClick,
  onSearchClick,
  children,
}: CrdLayoutProps) {
  return (
    <div className="crd-root flex min-h-screen flex-col bg-background text-foreground">
      <Header
        user={user}
        authenticated={authenticated}
        navigationHrefs={navigationHrefs}
        onLogout={onLogout}
        onMessagesClick={onMessagesClick}
        onNotificationsClick={onNotificationsClick}
        onSearchClick={onSearchClick}
      />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer languages={languages} currentLanguage={currentLanguage} onLanguageChange={onLanguageChange} />
    </div>
  );
}
