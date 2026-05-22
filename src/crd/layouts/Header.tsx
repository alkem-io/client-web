import { Bell, LayoutGrid, MessageSquare, Search } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlkemioLogo } from '@/crd/components/common/AlkemioLogo';
import { PlatformNavigationMenu } from '@/crd/layouts/components/PlatformNavigationMenu';
import { UserMenu } from '@/crd/layouts/components/UserMenu';
import type {
  CrdDesignVersionSwitch,
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
  unreadMessagesCount?: number;
  unreadNotificationsCount?: number;
  languages?: CrdLanguageOption[];
  currentLanguage?: string;
  breadcrumbs?: ReactNode;
  onLogout?: () => void;
  onMenuClick?: () => void;
  onMessagesClick?: () => void;
  onNotificationsClick?: () => void;
  onSearchClick?: () => void;
  onPendingMembershipsClick?: () => void;
  onHelpClick?: () => void;
  onLanguageChange?: (code: string) => void;
  showGridToggle?: boolean;
  designVersionSwitch?: CrdDesignVersionSwitch;
  /**
   * When true the header renders transparently at the top of the page so a
   * banner image below shows through. The left and right element groups get
   * a frosted-glass pill background so they remain legible. After the user
   * scrolls past the banner zone (~120px) the header fades back to the solid
   * background. Default: false.
   */
  overlayBanner?: boolean;
  className?: string;
};

// Threshold at which an overlaying header fades from transparent to solid.
// Matches the prototype's heuristic — far enough that the banner has clearly
// started scrolling out of view, close enough that the legibility hand-off
// happens before the banner fully clears the viewport.
const OVERLAY_SCROLL_THRESHOLD = 120;

export function Header({
  user,
  authenticated,
  navigationHrefs,
  isAdmin,
  pendingInvitationsCount,
  platformNavigationItems,
  currentPath,
  unreadMessagesCount,
  unreadNotificationsCount,
  languages,
  currentLanguage,
  breadcrumbs,
  onLogout,
  onMenuClick,
  onMessagesClick,
  onNotificationsClick,
  onSearchClick,
  onPendingMembershipsClick,
  onHelpClick,
  onLanguageChange,
  showGridToggle,
  designVersionSwitch,
  overlayBanner = false,
  className,
}: HeaderProps) {
  const { t } = useTranslation('crd-layout');
  const [scrolledPastBanner, setScrolledPastBanner] = useState(false);

  useEffect(() => {
    if (!overlayBanner) {
      setScrolledPastBanner(false);
      return;
    }
    const onScroll = () => setScrolledPastBanner(window.scrollY > OVERLAY_SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [overlayBanner]);

  const isTransparent = overlayBanner && !scrolledPastBanner;
  const pillClasses = isTransparent ? 'bg-white/75 dark:bg-black/40 backdrop-blur-md rounded-lg px-3 py-1' : undefined;

  return (
    <header
      className={cn(
        'h-16 sticky top-0 z-50 transition-colors duration-300',
        isTransparent ? 'bg-transparent border-b border-transparent' : 'border-b border-border bg-background',
        className
      )}
    >
      {/* Inner grid — left and right groups align with the inner content's left/right edges
          (`lg:col-start-2 / lg:col-span-10`), matching `SpaceShell`'s body width so the
          header items are not flush against the viewport edges. */}
      <div className="w-full h-full px-6 md:px-8">
        <div className="grid grid-cols-12 gap-6 h-full">
          <div className="col-span-12 lg:col-start-2 lg:col-span-10 flex items-center justify-between h-full">
            {/* Left: Logo + breadcrumbs */}
            <div className={cn('flex items-center gap-4 min-w-0', pillClasses)}>
              <a href={navigationHrefs.home} className="flex items-center shrink-0" aria-label={t('header.home')}>
                <AlkemioLogo className="w-8 h-8" />
              </a>
              {breadcrumbs && (
                <>
                  <div className={cn('h-6 w-px hidden md:block', isTransparent ? 'bg-foreground/20' : 'bg-border')} />
                  <div className="min-w-0">{breadcrumbs}</div>
                </>
              )}
            </div>

            {/* Right: icon row */}
            <nav aria-label={t('header.menu')} className={cn('flex items-center gap-1', pillClasses)}>
              <HeaderIconButton
                onClick={onSearchClick}
                ariaLabel={t('header.search')}
                icon={<Search aria-hidden="true" className="w-5 h-5" />}
              />

              {authenticated && (
                <>
                  <HeaderIconButton
                    onClick={onMessagesClick}
                    href={navigationHrefs.messages}
                    ariaLabel={t('header.messages')}
                    icon={<MessageSquare aria-hidden="true" className="w-5 h-5" />}
                    badge={
                      typeof unreadMessagesCount === 'number' && unreadMessagesCount > 0 ? (
                        <>
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive border border-background" />
                          <span className="sr-only">{t('header.unreadMessages', { count: unreadMessagesCount })}</span>
                        </>
                      ) : undefined
                    }
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
                          <span className="sr-only">
                            {t('header.unreadNotifications', { count: unreadNotificationsCount })}
                          </span>
                        </>
                      ) : undefined
                    }
                  />
                </>
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

              <div className={cn('h-6 w-px hidden md:block', isTransparent ? 'bg-foreground/20' : 'bg-border')} />

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
                designVersionSwitch={designVersionSwitch}
              />
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
