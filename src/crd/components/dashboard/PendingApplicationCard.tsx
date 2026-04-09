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

const getInitials = (name: string): string =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w.charAt(0).toUpperCase())
    .join('');

function PendingApplicationCard({ application, onClick, className }: PendingApplicationCardProps) {
  return (
    <a
      href={application.spaceHref}
      onClick={e => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
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
          className={cn('rounded-lg text-xs', application.color && 'text-white')}
          style={application.color ? { backgroundColor: application.color } : undefined}
        >
          {getInitials(application.spaceName)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight truncate">{application.spaceName}</p>
        {application.tagline && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{application.tagline}</p>
        )}
      </div>
    </a>
  );
}

function PendingApplicationCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
      <Skeleton className="size-10 rounded-lg shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  );
}

export { PendingApplicationCard, PendingApplicationCardSkeleton };
export type { PendingApplicationCardData, PendingApplicationCardProps };
