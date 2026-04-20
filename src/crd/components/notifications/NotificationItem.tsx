import { Archive, Eye, EyeOff, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CrdNotificationItemData } from '@/crd/layouts/types';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';

type NotificationItemProps = {
  notification: CrdNotificationItemData;
  onClick?: (notification: CrdNotificationItemData) => void;
  onRead?: (id: string) => void;
  onUnread?: (id: string) => void;
  onArchive?: (id: string) => void;
};

export function NotificationItem({ notification, onClick, onRead, onUnread, onArchive }: NotificationItemProps) {
  const { t } = useTranslation('crd-notifications');

  return (
    <div
      className={cn(
        'group flex gap-3 p-4 transition-colors border-b border-border',
        notification.isUnread ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'
      )}
    >
      <button
        type="button"
        className="flex gap-3 flex-1 min-w-0 text-left bg-transparent border-none p-0 cursor-pointer"
        onClick={() => onClick?.(notification)}
      >
        {/* Avatar */}
        <div className="shrink-0 mt-0.5 relative">
          <Avatar className="h-8 w-8 md:h-10 md:w-10 border border-border">
            <AvatarImage src={notification.avatarUrl} alt="" />
            <AvatarFallback className="bg-primary/10 text-primary text-caption">
              {notification.avatarFallback}
            </AvatarFallback>
          </Avatar>
          {notification.typeBadgeIcon && (
            <div className="absolute -bottom-1 -right-1 rounded-full p-0.5 bg-primary text-primary-foreground border-2 border-background">
              <span className="[&>svg]:w-2.5 [&>svg]:h-2.5">{notification.typeBadgeIcon}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-body text-foreground">
            {notification.isUnread && (
              <span className="inline-block w-2 h-2 rounded-full bg-primary mr-1.5 align-middle" aria-hidden="true" />
            )}
            <span className={cn(notification.isUnread && 'font-semibold')}>{notification.title}</span>
          </p>
          {notification.description && (
            <p className="text-body text-muted-foreground line-clamp-2">{notification.description}</p>
          )}
          {notification.comment && (
            <p className="text-body text-muted-foreground line-clamp-2 italic">{notification.comment}</p>
          )}
        </div>
      </button>

      {/* Right column: actions + timestamp */}
      <div className="shrink-0 flex flex-col items-center gap-1 self-start pt-0.5">
        {(onRead || onUnread || onArchive) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild={true}>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:opacity-100"
                aria-label={t('notifications.actions.menu')}
                onClick={e => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {notification.isUnread && onRead && (
                <DropdownMenuItem onClick={() => onRead(notification.id)} className="cursor-pointer">
                  <Eye aria-hidden="true" className="mr-2 h-4 w-4" />
                  <span>{t('notifications.actions.read')}</span>
                </DropdownMenuItem>
              )}
              {!notification.isUnread && onUnread && (
                <DropdownMenuItem onClick={() => onUnread(notification.id)} className="cursor-pointer">
                  <EyeOff aria-hidden="true" className="mr-2 h-4 w-4" />
                  <span>{t('notifications.actions.unread')}</span>
                </DropdownMenuItem>
              )}
              {onArchive && (
                <DropdownMenuItem onClick={() => onArchive(notification.id)} className="cursor-pointer">
                  <Archive aria-hidden="true" className="mr-2 h-4 w-4" />
                  <span>{t('notifications.actions.archive')}</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <span className="text-caption text-muted-foreground whitespace-nowrap">{notification.timestamp}</span>
      </div>
    </div>
  );
}
