import { Bot, Building2, User } from 'lucide-react';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Card, CardContent } from '@/crd/primitives/card';

/**
 * Plain CRD data for one contributor card (feature 008). Mirrors the existing
 * member-card visual (`SpaceMembers` UserCard/OrganizationCard) so contributors
 * render with the same avatar / name / role-label treatment. Location fields are
 * present only for users/orgs; coordinates only when valid (drives the map plot).
 */
export type ContributorCardType = 'user' | 'organization' | 'virtualContributor';

export type ContributorCardData = {
  id: string;
  type: ContributorCardType;
  name: string;
  avatarUrl?: string;
  roleLabel?: string;
  href?: string;
  /** Human-readable "city, country" label, if any. */
  locationLabel?: string;
  /** Precise coordinates — set only when `hasValidCoordinates` is true. */
  latitude?: number;
  longitude?: number;
  hasValidCoordinates: boolean;
};

type ContributorCardProps = {
  contributor: ContributorCardData;
  onContributorClick?: (href: string) => void;
  className?: string;
};

const TYPE_ICON = {
  user: User,
  organization: Building2,
  virtualContributor: Bot,
} as const;

export function ContributorCard({ contributor, onContributorClick, className }: ContributorCardProps) {
  const Icon = TYPE_ICON[contributor.type];
  const isOrg = contributor.type === 'organization';
  const href = contributor.href;

  const handleClick = (e: React.MouseEvent) => {
    if (href && onContributorClick) {
      e.preventDefault();
      onContributorClick(href);
    }
  };

  const avatar = (
    <Avatar className={cn('w-12 h-12 border border-border', isOrg && 'rounded-md')}>
      {contributor.avatarUrl && (
        <AvatarImage src={contributor.avatarUrl} alt={contributor.name} className={cn(isOrg && 'rounded-md')} />
      )}
      <AvatarFallback className={cn('text-card-title', isOrg && 'rounded-md')}>
        {contributor.name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <Card className={cn('overflow-hidden hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-0">
        <div className="p-4 flex items-start gap-3">
          {href ? (
            <a
              href={href}
              onClick={handleClick}
              className={cn(
                'shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isOrg ? 'rounded-md' : 'rounded-full'
              )}
            >
              {avatar}
            </a>
          ) : (
            <div className="shrink-0">{avatar}</div>
          )}
          <div className="min-w-0 flex-1">
            {href ? (
              <a
                href={href}
                onClick={handleClick}
                className="block text-card-title text-foreground truncate hover:text-primary transition-colors focus-visible:outline-none focus-visible:underline"
              >
                {contributor.name}
              </a>
            ) : (
              <span className="block text-card-title text-foreground truncate">{contributor.name}</span>
            )}
            {contributor.roleLabel && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-caption font-medium border border-border bg-muted text-muted-foreground">
                <Icon className="w-3 h-3" aria-hidden="true" />
                {contributor.roleLabel}
              </span>
            )}
            {contributor.locationLabel && (
              <p className="mt-2 text-caption text-muted-foreground truncate">{contributor.locationLabel}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
