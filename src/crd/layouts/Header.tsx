import { Bell, LayoutGrid, Menu, MessageSquare, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AlkemioLogo } from '@/crd/components/common/AlkemioLogo';
import { PlatformNavigationMenu } from '@/crd/layouts/components/PlatformNavigationMenu';
import { UserMenu } from '@/crd/layouts/components/UserMenu';
import type {
  CrdLanguageOption,
  CrdNavigationHrefs,
  CrdPlatformNavigationItem,
  CrdUserInfo,
} from '@/crd/layouts/types';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

type HeaderProps = {
  user?: CrdUserInfo;
  authenticated: boolean;
  navigationHrefs: CrdNavigationHrefs;
  isAdmin?: boolean;
  pendingInvitationsCount?: number;
  platformNavigationItems?: CrdPlatformNavigationItem[];
  currentPath?: string;
  unreadNotificationsCount?: number;
  languages?: CrdLanguageOption[];
  currentLanguage?: string;
  onLogout?: () => void;
  onMenuClick?: () => void;
  onMessagesClick?: () => void;
  onNotificationsClick?: () => void;
  onSearchClick?: () => void;
  onPendingMembershipsClick?: () => void;
  onHelpClick?: () => void;
  onLanguageChange?: (code: string) => void;
  className?: string;
};

export function Header({
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
  onLogout,
  onMenuClick,
  onMessagesClick,
  onNotificationsClick,
  onSearchClick,
  onPendingMembershipsClick,
  onHelpClick,
  onLanguageChange,
  className,
}: HeaderProps) {
  const { t } = useTranslation('crd-layout');

  return (
    <header
      className={cn(
        'h-16 border-b border-border bg-background sticky top-0 z-50 px-4 sm:px-6 flex items-center justify-between',
        className
      )}
    >
      {/* Left: Logo + mobile menu */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 hover:bg-accent rounded-md"
          aria-label={t('header.menu')}
        >
          <Menu className="w-5 h-5" />
        </button>

        <a href={navigationHrefs.home} className="flex items-center shrink-0" aria-label={t('header.home')}>
          <AlkemioLogo className="w-8 h-8" />
        </a>
      </div>

      {/* Right: icon row */}
      <nav aria-label={t('header.menu')} className="flex items-center gap-1">
        {onSearchClick ? (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            aria-label={t('header.search')}
            onClick={onSearchClick}
          >
            <Search aria-hidden="true" className="w-5 h-5" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="text-muted-foreground" aria-label={t('header.search')}>
            <Search aria-hidden="true" className="w-5 h-5" />
          </Button>
        )}

        {onMessagesClick ? (
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground"
            aria-label={t('header.messages')}
            onClick={onMessagesClick}
          >
            <MessageSquare aria-hidden="true" className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground"
            aria-label={t('header.messages')}
            asChild={true}
          >
            <a href={navigationHrefs.messages}>
              <MessageSquare aria-hidden="true" className="w-5 h-5" />
            </a>
          </Button>
        )}

        {onNotificationsClick ? (
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground"
            aria-label={t('header.notifications')}
            onClick={onNotificationsClick}
          >
            <Bell aria-hidden="true" className="w-5 h-5" />
            {typeof unreadNotificationsCount === 'number' && unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive border border-background" />
            )}
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground"
            aria-label={t('header.notifications')}
            asChild={true}
          >
            <a href={navigationHrefs.notifications}>
              <Bell aria-hidden="true" className="w-5 h-5" />
              {typeof unreadNotificationsCount === 'number' && unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive border border-background" />
              )}
            </a>
          </Button>
        )}

        {platformNavigationItems && platformNavigationItems.length > 0 ? (
          <PlatformNavigationMenu items={platformNavigationItems} currentPath={currentPath} />
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            aria-label={t('header.spaces')}
            asChild={true}
          >
            <a href={navigationHrefs.spaces}>
              <LayoutGrid aria-hidden="true" className="w-5 h-5" />
            </a>
          </Button>
        )}

        <div className="h-6 w-px hidden md:block bg-border" />

        <UserMenu
          user={user}
          authenticated={authenticated}
          navigationHrefs={navigationHrefs}
          isAdmin={isAdmin}
          pendingInvitationsCount={pendingInvitationsCount}
          languages={languages}
          currentLanguage={currentLanguage}
          onLogout={onLogout}
          onPendingMembershipsClick={onPendingMembershipsClick}
          onHelpClick={onHelpClick}
          onLanguageChange={onLanguageChange}
        />
      </nav>
    </header>
  );
}
