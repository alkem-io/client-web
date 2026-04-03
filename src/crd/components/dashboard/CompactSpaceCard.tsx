import { Lock, Pin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Skeleton } from '@/crd/primitives/skeleton';

export type CompactSpaceCardData = {
  id: string;
  name: string;
  href: string;
  bannerUrl?: string;
  isPrivate: boolean;
  isHomeSpace: boolean;
};

type CompactSpaceCardProps = CompactSpaceCardData & {
  className?: string;
};

export function CompactSpaceCard({ name, href, bannerUrl, isPrivate, isHomeSpace, className }: CompactSpaceCardProps) {
  const { t } = useTranslation('crd-dashboard');

  return (
    <a
      href={href}
      className={cn(
        'block min-w-[180px] rounded-lg border border-border bg-card hover:shadow-md transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        className
      )}
    >
      <div className="relative aspect-video rounded-t-lg overflow-hidden">
        {bannerUrl ? (
          <img src={bannerUrl} alt="" className="size-full object-cover" aria-hidden="true" />
        ) : (
          <div className="size-full bg-gradient-to-br from-muted to-accent" aria-hidden="true" />
        )}
        {isPrivate && (
          <span
            role="img"
            className="absolute top-1.5 right-1.5 flex items-center rounded-full bg-foreground/70 px-1.5 py-0.5"
            aria-label={t('recentSpaces.private', 'Private')}
          >
            <Lock size={14} className="text-white" aria-hidden="true" />
          </span>
        )}
        {isHomeSpace && (
          <span className="absolute top-1.5 left-1.5" aria-hidden="true">
            <Pin size={14} className="text-white drop-shadow" />
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-medium">{name}</p>
      </div>
    </a>
  );
}

export function CompactSpaceCardSkeleton({ className }: { className?: string }) {
  return (
    <output
      className={cn('block min-w-[180px] rounded-lg border border-border bg-card', className)}
      aria-label="Loading space"
    >
      <Skeleton className="aspect-video rounded-t-lg rounded-b-none" />
      <div className="p-3">
        <Skeleton className="h-4 w-3/4" />
      </div>
    </output>
  );
}
