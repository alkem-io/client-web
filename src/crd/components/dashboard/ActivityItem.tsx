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

  if (diffSeconds < 60) return 'just now';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${Math.floor(diffMonths / 12)}y ago`;
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

  const content = (
    <>
      <div className="shrink-0">
        <Avatar className="size-10 border border-border">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} />}
          <AvatarFallback className="text-xs">{avatarInitials}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-relaxed line-clamp-2">
          <span className="font-semibold">{userName}</span> <span className="text-muted-foreground">{actionText}</span>{' '}
          <span className="font-medium text-primary">{targetName}</span>
        </p>
        <div className="flex items-center gap-2 mt-1">
          <time dateTime={timestamp} className="text-xs text-muted-foreground">
            {relativeTime}
          </time>
        </div>
      </div>
    </>
  );

  const sharedClassName = cn('flex gap-4 rounded-md p-2 -mx-2 transition-colors hover:bg-accent/50', className);

  if (targetHref) {
    return (
      <a
        href={targetHref}
        className={cn(sharedClassName, 'no-underline text-inherit')}
        aria-label={`${userName} ${actionText} ${targetName} ${relativeTime}`}
      >
        {content}
      </a>
    );
  }

  return (
    <article aria-label={`${userName} ${actionText} ${targetName} ${relativeTime}`} className={sharedClassName}>
      {content}
    </article>
  );
}
