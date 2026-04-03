import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';

export type ActivityItemData = {
  id: string;
  avatarUrl?: string;
  avatarInitials: string;
  userName: string;
  actionText: string;
  targetName: string;
  targetHref?: string;
  timestamp: string;
};

type ActivityItemProps = ActivityItemData & {
  className?: string;
};

function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffSeconds = Math.floor((now - then) / 1000);

  if (diffSeconds < 60) {
    return 'just now';
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays}d ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths}mo ago`;
  }

  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears}y ago`;
}

export function ActivityItem({
  avatarUrl,
  avatarInitials,
  userName,
  actionText,
  targetName,
  targetHref,
  timestamp,
  className,
}: ActivityItemProps) {
  const relativeTime = formatRelativeTime(timestamp);

  return (
    <article
      aria-label={`${userName} ${actionText} ${targetName} ${relativeTime}`}
      className={cn('flex items-start gap-3 border-b border-border py-2', className)}
    >
      <Avatar className="size-8">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} />}
        <AvatarFallback className="text-xs">{avatarInitials}</AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="text-sm">
          <span className="font-medium">{userName}</span> <span className="text-muted-foreground">{actionText}</span>{' '}
          {targetHref ? (
            <a href={targetHref} className="text-primary hover:underline">
              {targetName}
            </a>
          ) : (
            <span>{targetName}</span>
          )}
        </div>
      </div>

      <time dateTime={timestamp} className="shrink-0 text-sm text-muted-foreground">
        {relativeTime}
      </time>
    </article>
  );
}
