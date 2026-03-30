import {
  Bell,
  Check,
  CircleEllipsis,
  Globe,
  HelpCircle,
  Home,
  LayoutGrid,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  Shield,
  User,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AlkemioLogo } from '@/crd/components/common/AlkemioLogo';
import type { CrdLanguageOption, CrdNavigationHrefs, CrdUserInfo } from '@/crd/layouts/types';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';

type HeaderProps = {
  user?: CrdUserInfo;
  authenticated: boolean;
  navigationHrefs: CrdNavigationHrefs;
  isAdmin?: boolean;
  pendingInvitationsCount?: number;
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
  const { t } = useTranslation('crd');

  const currentLanguageLabel = languages?.find(l => currentLanguage?.startsWith(l.code))?.label;

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
            </a>
          </Button>
        )}

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

        <div className="h-6 w-px hidden md:block bg-border" />

        {authenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full">
              <div className="relative p-1.5 rounded-full hover:bg-accent/50 transition-colors cursor-pointer">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">{user.initials}</AvatarFallback>
                </Avatar>
                <Badge
                  variant="secondary"
                  className="absolute -bottom-1 -right-1 px-1 py-0 h-4 border border-border text-[9px] font-bold leading-[14px]"
                >
                  {t('header.beta')}
                </Badge>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* User identity */}
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold">{user.name}</span>
                  {user.role && (
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{user.role}</span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Navigation items */}
              <DropdownMenuItem asChild={true}>
                <a href={navigationHrefs.home} className="cursor-pointer">
                  <Home aria-hidden="true" className="mr-2 h-4 w-4" />
                  <span>{t('header.dashboard')}</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild={true}>
                <a href={navigationHrefs.profile} className="cursor-pointer">
                  <User aria-hidden="true" className="mr-2 h-4 w-4" />
                  <span>{t('header.profile')}</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild={true}>
                <a href={navigationHrefs.account} className="cursor-pointer">
                  <Settings aria-hidden="true" className="mr-2 h-4 w-4" />
                  <span>{t('header.myAccount')}</span>
                </a>
              </DropdownMenuItem>

              {/* Pending memberships */}
              {onPendingMembershipsClick && (
                <DropdownMenuItem onClick={onPendingMembershipsClick} className="cursor-pointer">
                  <CircleEllipsis aria-hidden="true" className="mr-2 h-4 w-4" />
                  <span>{t('header.pendingMemberships')}</span>
                  {typeof pendingInvitationsCount === 'number' && pendingInvitationsCount > 0 && (
                    <Badge className="ml-auto text-[10px] px-1.5 h-[18px] bg-primary text-primary-foreground rounded-full">
                      {pendingInvitationsCount}
                    </Badge>
                  )}
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {/* Admin */}
              {isAdmin && (
                <DropdownMenuItem asChild={true}>
                  <a href={navigationHrefs.admin} className="cursor-pointer">
                    <Shield aria-hidden="true" className="mr-2 h-4 w-4" />
                    <span>{t('header.administration')}</span>
                  </a>
                </DropdownMenuItem>
              )}

              {/* Language sub-menu */}
              {languages && languages.length > 0 && onLanguageChange && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer">
                    <Globe aria-hidden="true" className="mr-2 h-4 w-4" />
                    <span>{t('header.changeLanguage')}</span>
                    {currentLanguageLabel && (
                      <span className="ml-auto text-xs text-muted-foreground">{currentLanguageLabel}</span>
                    )}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {languages.map(lang => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => onLanguageChange(lang.code)}
                        className={cn('cursor-pointer', currentLanguage?.startsWith(lang.code) && 'bg-accent')}
                      >
                        <span className="text-sm">{lang.label}</span>
                        {currentLanguage?.startsWith(lang.code) && (
                          <Check aria-hidden="true" className="ml-auto h-4 w-4 shrink-0 text-primary" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}

              {/* Help */}
              {onHelpClick && (
                <DropdownMenuItem onClick={onHelpClick} className="cursor-pointer">
                  <HelpCircle aria-hidden="true" className="mr-2 h-4 w-4" />
                  <span>{t('header.getHelp')}</span>
                </DropdownMenuItem>
              )}

              {(isAdmin || onHelpClick || (languages && languages.length > 0)) && <DropdownMenuSeparator />}

              {/* Logout */}
              <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={onLogout}>
                <LogOut aria-hidden="true" className="mr-2 h-4 w-4" />
                <span>{t('header.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" size="sm" asChild={true}>
            <a href={navigationHrefs.login}>{t('header.login')}</a>
          </Button>
        )}
      </nav>
    </header>
  );
}
