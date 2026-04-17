import { BellOff, MailOpen, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NotificationItem } from '@/crd/components/notifications/NotificationItem';
import type { CrdNotificationFilter, CrdNotificationItemData } from '@/crd/layouts/types';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogTitle } from '@/crd/primitives/dialog';
import { Skeleton } from '@/crd/primitives/skeleton';

type NotificationsPanelProps = {
  open: boolean;
  onClose: () => void;
  items: CrdNotificationItemData[];
  filters: CrdNotificationFilter[];
  selectedFilter: string;
  loading?: boolean;
  hasMore?: boolean;
  settingsHref?: string;
  onFilterChange: (key: string) => void;
  onMarkAllRead: () => void;
  onLoadMore: () => void;
  onNotificationClick?: (notification: CrdNotificationItemData) => void;
  onRead?: (id: string) => void;
  onUnread?: (id: string) => void;
  onArchive?: (id: string) => void;
};

function NotificationSkeleton() {
  return (
    <div className="flex gap-3 p-4 border-b border-border">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-[70%]" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-2.5 w-16" />
      </div>
    </div>
  );
}

export function NotificationsPanel({
  open,
  onClose,
  items,
  filters,
  selectedFilter,
  loading,
  hasMore,
  settingsHref,
  onFilterChange,
  onMarkAllRead,
  onLoadMore,
  onNotificationClick,
  onRead,
  onUnread,
  onArchive,
}: NotificationsPanelProps) {
  const { t } = useTranslation('crd-notifications');

  const showEmpty = items.length === 0 && !loading;
  const showSkeletons = loading && items.length === 0;

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent
        className="max-w-none h-[100dvh] sm:h-auto sm:max-w-lg md:max-w-xl rounded-none sm:rounded-lg p-0 gap-0 overflow-hidden flex flex-col"
        closeLabel={t('notifications.close')}
      >
        {/* Header */}
        <div className="flex items-center justify-between pl-4 pr-10 pt-[10px] pb-3 border-b border-border bg-muted/30">
          <DialogTitle className="text-card-title">{t('notifications.title')}</DialogTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              aria-label={t('notifications.markAllRead')}
              onClick={onMarkAllRead}
            >
              <MailOpen aria-hidden="true" className="h-4 w-4" />
            </Button>
            {settingsHref && (
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" asChild={true}>
                <a href={settingsHref} aria-label={t('notifications.settings')}>
                  <Settings aria-hidden="true" className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Filter chips */}
        {filters.length > 0 && (
          <div className="flex gap-1 px-4 py-1.5 border-b border-border overflow-x-auto">
            {filters.map(filter => (
              <Button
                key={filter.key}
                variant={selectedFilter === filter.key ? 'secondary' : 'ghost'}
                size="sm"
                className={cn(
                  'h-7 text-caption rounded-full shrink-0',
                  selectedFilter === filter.key && 'font-semibold'
                )}
                onClick={() => onFilterChange(filter.key)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        )}

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto sm:max-h-[60vh]">
          {showSkeletons && (
            <output aria-label={t('notifications.loading')}>
              {Array.from({ length: 5 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                <NotificationSkeleton key={i} />
              ))}
            </output>
          )}

          {!showSkeletons &&
            items.map(item => (
              <NotificationItem
                key={item.id}
                notification={item}
                onClick={onNotificationClick}
                onRead={onRead}
                onUnread={onUnread}
                onArchive={onArchive}
              />
            ))}

          {/* Empty state */}
          {showEmpty && (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <BellOff aria-hidden="true" className="h-10 w-10 text-muted-foreground opacity-50 mb-3" />
              <p className="text-subsection-title mb-1 text-foreground">{t('notifications.emptyTitle')}</p>
              <p className="text-body text-muted-foreground max-w-[280px] leading-normal">
                {t('notifications.emptyMessage')}
              </p>
            </div>
          )}

          {/* Load more */}
          {hasMore && items.length > 0 && !loading && (
            <div className="flex justify-center p-3 border-t border-border bg-muted/30">
              <Button variant="ghost" size="sm" className="w-full h-8 text-caption" onClick={onLoadMore}>
                {t('notifications.loadMore')}
              </Button>
            </div>
          )}

          {/* Loading more indicator */}
          {loading && items.length > 0 && (
            <output className="flex justify-center py-3" aria-label={t('notifications.loading')}>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-border border-t-transparent" />
            </output>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
