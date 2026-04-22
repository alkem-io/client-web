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
  /** Pre-formatted display string, e.g. "2h ago". Formatted by the integration layer. */
  timestamp: string;
  /** ISO date string for the `<time>` element's `dateTime` attribute. */
  rawDate?: string;
};

type ActivityItemProps = ActivityItemData & {
  className?: string;
};

export function ActivityItem({
  avatarUrl,
  avatarInitials,
  userName,
  actionText,
  targetName,
  targetHref,
  timestamp,
  rawDate,
  className,
}: ActivityItemProps) {
  const content = (
    <>
      <div className="shrink-0">
        <Avatar className="size-10 border border-border">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} />}
          <AvatarFallback className="text-caption">{avatarInitials}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body line-clamp-2">
          <span className="font-semibold">{userName}</span> <span className="text-muted-foreground">{actionText}</span>{' '}
          <span className="font-medium text-primary">{targetName}</span>
        </p>
        <div className="flex items-center gap-2 mt-1">
          <time dateTime={rawDate} className="text-caption text-muted-foreground">
            {timestamp}
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
        aria-label={`${userName} ${actionText} ${targetName} ${timestamp}`}
      >
        {content}
      </a>
    );
  }

  return (
    <article aria-label={`${userName} ${actionText} ${targetName} ${timestamp}`} className={sharedClassName}>
      {content}
    </article>
  );
}
