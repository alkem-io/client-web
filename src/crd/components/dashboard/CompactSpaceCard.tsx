import { Lock, Pin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { backgroundGradient } from '@/crd/lib/backgroundGradient';
import { cn } from '@/crd/lib/utils';
import { Skeleton } from '@/crd/primitives/skeleton';

export type CompactSpaceCardData = {
  id: string;
  name: string;
  href: string;
  bannerUrl?: string;
  isPrivate: boolean;
  isHomeSpace: boolean;
  initials?: string;
  /** Deterministic accent colour, used for the initials tile and as the banner
   * fallback when no `bannerUrl` is provided. */
  color?: string;
};

type CompactSpaceCardProps = CompactSpaceCardData & {
  onPinClick?: () => void;
  className?: string;
};

export function CompactSpaceCard({
  name,
  href,
  bannerUrl,
  isPrivate,
  isHomeSpace,
  initials,
  color,
  onPinClick,
  className,
}: CompactSpaceCardProps) {
  const { t } = useTranslation('crd-dashboard');

  const fallbackBannerStyle = color ? backgroundGradient(color) : undefined;

  return (
    <a
      href={href}
      className={cn(
        'group block overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        className
      )}
    >
      <div className="relative aspect-video overflow-hidden">
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt=""
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            aria-hidden="true"
          />
        ) : (
          <div
            className={cn('size-full', !color && 'bg-gradient-to-br from-muted to-accent')}
            style={fallbackBannerStyle}
            aria-hidden="true"
          />
        )}
        {isPrivate && (
          <div
            role="img"
            className="absolute top-2.5 right-2.5 flex items-center rounded-full p-1.5"
            style={{ background: 'color-mix(in srgb, var(--foreground) 50%, transparent)' }}
            aria-label={t('recentSpaces.private')}
          >
            <Lock size={12} className="text-primary-foreground" aria-hidden="true" />
          </div>
        )}
        {isHomeSpace && (
          <button
            type="button"
            className="absolute top-2 left-2 rounded-full p-1.5 transition-colors hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            style={{ background: 'color-mix(in srgb, var(--foreground) 50%, transparent)' }}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              onPinClick?.();
            }}
            aria-label={t('recentSpaces.homeSpaceSettings')}
          >
            <Pin size={12} className="text-primary-foreground" aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-3 p-4">
        {initials && (
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground"
            aria-hidden="true"
          >
            {initials}
          </div>
        )}
        <p className="min-w-0 truncate text-card-title">{name}</p>
      </div>
    </a>
  );
}

export function CompactSpaceCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-lg border border-border bg-card', className)} aria-hidden="true">
      <Skeleton className="aspect-video w-full rounded-b-none" />
      <div className="flex items-center gap-3 p-4">
        <Skeleton className="size-10 shrink-0 rounded-lg" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
