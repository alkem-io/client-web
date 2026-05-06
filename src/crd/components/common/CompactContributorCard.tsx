import { Users } from 'lucide-react';
import { fallbackInitials } from '@/crd/lib/fallbackInitials';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';

export type CompactContributorCardItem = {
  id: string;
  displayName: string;
  avatarImageUrl: string | null;
  caption: string | null;
  secondaryCaption: string | null;
  href?: string;
};

export type CompactContributorCardProps = CompactContributorCardItem & {
  variant?: 'compact' | 'spacious';
  ariaLabel?: string;
  /**
   * Optional badge rendered to the right of the row (e.g., member-count chip).
   * When provided, it replaces the secondaryCaption pill rendering.
   */
  badge?: { label: string; icon?: 'users' };
  className?: string;
};

export function CompactContributorCard({
  displayName,
  avatarImageUrl,
  caption,
  secondaryCaption,
  href,
  variant = 'compact',
  ariaLabel,
  badge,
  className,
}: CompactContributorCardProps) {
  const padding = variant === 'compact' ? 'p-3' : 'p-4';
  const avatarSize = variant === 'compact' ? 'size-10' : 'size-12';

  const content = (
    <div className={cn('flex w-full items-center gap-3', padding)}>
      <Avatar className={cn(avatarSize, 'rounded-lg border border-border shrink-0')}>
        {avatarImageUrl ? <AvatarImage src={avatarImageUrl} alt={displayName} /> : null}
        <AvatarFallback className="rounded-lg bg-secondary text-secondary-foreground text-badge">
          {fallbackInitials(displayName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="text-card-title truncate">{displayName}</div>
        {caption ? <div className="text-caption text-muted-foreground truncate">{caption}</div> : null}
        {secondaryCaption && !badge ? (
          <div className="text-caption text-muted-foreground truncate">{secondaryCaption}</div>
        ) : null}
      </div>
      {badge ? (
        <div className="flex items-center gap-1 text-caption text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full shrink-0">
          {badge.icon === 'users' ? <Users className="w-3 h-3" aria-hidden="true" /> : null}
          <span>{badge.label}</span>
        </div>
      ) : null}
    </div>
  );

  const baseClasses = cn(
    'block w-full overflow-hidden rounded-xl border border-border/50 bg-card text-card-foreground transition-shadow',
    href
      ? 'hover:shadow-md cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
      : '',
    className
  );

  if (href) {
    return (
      <a href={href} aria-label={ariaLabel ?? displayName} className={baseClasses}>
        {content}
      </a>
    );
  }
  return <div className={baseClasses}>{content}</div>;
}
