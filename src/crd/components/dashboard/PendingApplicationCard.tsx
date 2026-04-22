import { useTranslation } from 'react-i18next';
import { getInitials } from '@/crd/lib/getInitials';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Skeleton } from '@/crd/primitives/skeleton';

type PendingApplicationCardData = {
  id: string;
  spaceName: string;
  spaceAvatarUrl?: string;
  tagline?: string;
  spaceHref: string;
  /** Deterministic accent colour, shown as the avatar fallback when
   * `spaceAvatarUrl` is missing. */
  color?: string;
};

type PendingApplicationCardProps = {
  application: PendingApplicationCardData;
  onClick?: () => void;
  className?: string;
};

function PendingApplicationCard({ application, onClick, className }: PendingApplicationCardProps) {
  const { t } = useTranslation('crd-dashboard');

  return (
    <a
      href={application.spaceHref}
      onClick={e => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={t('pendingMemberships.applicationAriaLabel', { spaceName: application.spaceName })}
      className={cn(
        'block w-full min-h-11 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        'flex items-center gap-3',
        className
      )}
    >
      <Avatar className="size-10 shrink-0 rounded-lg">
        {application.spaceAvatarUrl ? (
          <AvatarImage
            src={application.spaceAvatarUrl}
            alt={application.spaceName}
            className="rounded-lg object-cover"
          />
        ) : null}
        <AvatarFallback
          className={cn('rounded-lg text-caption', application.color && 'text-white')}
          color={application.color}
        >
          {getInitials(application.spaceName)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="text-card-title leading-tight truncate">{application.spaceName}</p>
        {application.tagline && (
          <p className="text-caption text-muted-foreground mt-0.5 line-clamp-1">{application.tagline}</p>
        )}
      </div>
    </a>
  );
}

function PendingApplicationCardSkeleton() {
  const { t } = useTranslation('crd-dashboard');
  return (
    <output
      aria-label={t('pendingMemberships.loadingApplication')}
      className="rounded-lg border border-border bg-card p-4 flex items-center gap-3"
    >
      <Skeleton className="size-10 rounded-lg shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
    </output>
  );
}

export { PendingApplicationCard, PendingApplicationCardSkeleton };
export type { PendingApplicationCardData, PendingApplicationCardProps };
