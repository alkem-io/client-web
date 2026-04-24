import type { ReactNode } from 'react';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';

export type ActivityItemData = {
  id: string;
  /** Actor avatar image URL. */
  avatarUrl?: string;
  /** Actor initials (avatar fallback). */
  avatarInitials: string;
  /** Actor display name — used for avatar `alt` and the row's accessible name. Not rendered as visible text. */
  userName: string;
  /**
   * Small lucide icon overlaid as a badge on the avatar — conveys the type of activity
   * (post created, comment, whiteboard, etc.) so the user doesn't need a verb in the title.
   */
  activityIcon: ReactNode;
  /** Accessible label for the activity icon (e.g. "New post"). Required for screen readers. */
  activityIconLabel: string;
  /**
   * Primary line. Typically the display-name of the affected entity (callout, post, whiteboard)
   * rendered as a plain string, OR user-authored markdown (comment body / update message)
   * wrapped in `InlineMarkdown` by the consumer.
   */
  title: ReactNode;
  /**
   * Plain-text fallback of `title` used for the row's `aria-label`. Required when `title`
   * is not a plain string (e.g. an `InlineMarkdown` element).
   */
  titlePlain?: string;
  /** Navigation target for the full row. When omitted the row is a non-link `<article>`. */
  titleHref?: string;
  /** Secondary line — the parent container (space / callout / post) where the activity happened. */
  contextName?: string;
  /** Pre-formatted timestamp, e.g. "2h ago". Formatted by the integration layer. */
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
  activityIcon,
  activityIconLabel,
  title,
  titlePlain,
  titleHref,
  contextName,
  timestamp,
  rawDate,
  className,
}: ActivityItemProps) {
  const content = (
    <>
      <div className="shrink-0 relative">
        <Avatar className="size-10 border border-border">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} />}
          <AvatarFallback className="text-caption">{avatarInitials}</AvatarFallback>
        </Avatar>
        <span
          role="img"
          aria-label={activityIconLabel}
          className="absolute -bottom-1 -right-1 rounded-full p-0.5 bg-primary text-primary-foreground border-2 border-background [&>svg]:w-2.5 [&>svg]:h-2.5"
        >
          {activityIcon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0 text-body line-clamp-2">{title}</div>
          <time dateTime={rawDate} className="text-caption text-muted-foreground shrink-0 whitespace-nowrap pt-0.5">
            {timestamp}
          </time>
        </div>
        {contextName && <div className="text-caption text-muted-foreground truncate mt-0.5">{contextName}</div>}
      </div>
    </>
  );

  const resolvedTitlePlain = titlePlain ?? (typeof title === 'string' ? title : '');
  const ariaLabel = [userName, activityIconLabel, resolvedTitlePlain, contextName, timestamp].filter(Boolean).join(' ');
  const sharedClassName = cn('flex gap-4 rounded-md p-2 -mx-2 transition-colors hover:bg-accent/50', className);

  if (titleHref) {
    return (
      <a href={titleHref} className={cn(sharedClassName, 'no-underline text-inherit')} aria-label={ariaLabel}>
        {content}
      </a>
    );
  }

  return (
    <article aria-label={ariaLabel} className={sharedClassName}>
      {content}
    </article>
  );
}
