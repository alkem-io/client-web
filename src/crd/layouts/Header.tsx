import { Bell, LayoutGrid, MessageSquare, Search } from 'lucide-react';
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

type HeaderIconButtonProps = {
  onClick?: () => void;
  href?: string;
  ariaLabel: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
};

function HeaderIconButton({ onClick, href, ariaLabel, icon, badge }: HeaderIconButtonProps) {
  if (onClick) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative text-muted-foreground"
        aria-label={ariaLabel}
        onClick={onClick}
      >
        {icon}
        {badge}
      </Button>
    );
  }
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative text-muted-foreground"
      aria-label={ariaLabel}
      asChild={true}
    >
      <a href={href}>
        {icon}
        {badge}
      </a>
    </Button>
  );
}

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
  showGridToggle?: boolean;
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
  showGridToggle,
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
        <a href={navigationHrefs.home} className="flex items-center shrink-0" aria-label={t('header.home')}>
          <AlkemioLogo className="w-8 h-8" />
        </a>
      </div>

      {/* Right: icon row */}
      <nav aria-label={t('header.menu')} className="flex items-center gap-1">
        <HeaderIconButton
          onClick={onSearchClick}
          ariaLabel={t('header.search')}
          icon={<Search aria-hidden="true" className="w-5 h-5" />}
        />

        <HeaderIconButton
          onClick={onMessagesClick}
          href={navigationHrefs.messages}
          ariaLabel={t('header.messages')}
          icon={<MessageSquare aria-hidden="true" className="w-5 h-5" />}
        />

        <HeaderIconButton
          onClick={onNotificationsClick}
          href={navigationHrefs.notifications}
          ariaLabel={t('header.notifications')}
          icon={<Bell aria-hidden="true" className="w-5 h-5" />}
          badge={
            typeof unreadNotificationsCount === 'number' && unreadNotificationsCount > 0 ? (
              <>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive border border-background" />
                <span className="sr-only">{t('header.unreadNotifications', { count: unreadNotificationsCount })}</span>
              </>
            ) : undefined
          }
        />

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
          showGridToggle={showGridToggle}
        />
      </nav>
    </header>
  );
}
