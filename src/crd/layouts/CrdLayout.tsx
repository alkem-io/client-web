import type { ReactNode } from 'react';
import { Footer } from '@/crd/layouts/Footer';
import { Header } from '@/crd/layouts/Header';

type CrdUserInfo = {
  name: string;
  avatarUrl?: string;
  initials: string;
};

type CrdNavigationHrefs = {
  home: string;
  spaces: string;
  messages: string;
  notifications: string;
  profile: string;
  settings: string;
};

type CrdLayoutProps = {
  user?: CrdUserInfo;
  authenticated: boolean;
  navigationHrefs: CrdNavigationHrefs;
  onLogout?: () => void;
  children: ReactNode;
};

export function CrdLayout({ user, authenticated, navigationHrefs, onLogout, children }: CrdLayoutProps) {
  return (
    <div className="crd-root flex min-h-screen flex-col bg-background text-foreground">
      <Header user={user} authenticated={authenticated} navigationHrefs={navigationHrefs} onLogout={onLogout} />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}
