import { Bell, Home, LayoutGrid, LogOut, Menu, MessageSquare, Search, Settings, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AlkemioLogo } from '@/crd/components/common/AlkemioLogo';
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
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';

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

type HeaderProps = {
  user?: CrdUserInfo;
  authenticated: boolean;
  navigationHrefs: CrdNavigationHrefs;
  onLogout?: () => void;
  onMenuClick?: () => void;
  className?: string;
};

export function Header({ user, authenticated, navigationHrefs, onLogout, onMenuClick, className }: HeaderProps) {
  const { t } = useTranslation('crd');

  return (
    <header
      className={cn(
        'h-16 border-b border-border bg-background sticky top-0 z-50 px-6 flex items-center justify-between',
        className
      )}
    >
      {/* Left: Logo + mobile menu */}
      <div className="flex items-center gap-4">
        <button
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
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="text-muted-foreground" title={t('header.search')}>
          <Search className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground"
          title={t('header.messages')}
          asChild={true}
        >
          <a href={navigationHrefs.messages}>
            <MessageSquare className="w-5 h-5" />
          </a>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground"
          title={t('header.notifications')}
          asChild={true}
        >
          <a href={navigationHrefs.notifications}>
            <Bell className="w-5 h-5" />
          </a>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground"
          title={t('header.spaces')}
          asChild={true}
        >
          <a href={navigationHrefs.spaces}>
            <LayoutGrid className="w-5 h-5" />
          </a>
        </Button>

        <div className="h-6 w-px hidden md:block" style={{ background: 'var(--border)' }} />

        {authenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <div className="relative p-1.5 rounded-full hover:bg-accent/50 transition-colors cursor-pointer">
                <Avatar className="h-8 w-8" style={{ border: '1px solid var(--border)' }}>
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">{user.initials}</AvatarFallback>
                </Avatar>
                <Badge
                  variant="secondary"
                  className="absolute -bottom-1 -right-1 px-1 py-0 h-4 border border-border"
                  style={{ fontSize: '9px', fontWeight: 700, lineHeight: '14px' }}
                >
                  Beta
                </Badge>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel
                className="uppercase tracking-wider text-muted-foreground"
                style={{ fontSize: '11px' }}
              >
                {t('header.myAccount')}
              </DropdownMenuLabel>
              <DropdownMenuItem asChild={true}>
                <a href={navigationHrefs.home} className="cursor-pointer">
                  <Home className="mr-2 h-4 w-4" />
                  <span>{t('header.dashboard')}</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild={true}>
                <a href={navigationHrefs.profile} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>{t('header.profile')}</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild={true}>
                <a href={navigationHrefs.settings} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('header.settings')}</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('header.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" size="sm" asChild={true}>
            <a href="/login">{t('header.login')}</a>
          </Button>
        )}
      </div>
    </header>
  );
}
