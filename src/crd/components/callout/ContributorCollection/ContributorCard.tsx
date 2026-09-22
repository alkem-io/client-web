import { Bot, Building2, ExternalLink, MapPin, User, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Card, CardContent } from '@/crd/primitives/card';

/** A card shows at most this many tag pills — never a "+N" overflow indicator. */
const MAX_CARD_TAGS = 2;

/**
 * Plain CRD data for one contributor card. Mirrors the existing
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
  /** Profile tagline. Users get an italic fallback when absent; org/VC get no row. */
  tagline?: string;
  /** The FULL chosen tag list (skills-then-keywords for users; keywords-then-capabilities for org/VC); the card shows only the first two. */
  tags?: string[];
  /** Organisations only. The platform-wide associates count; 0 is a value, not absence. */
  associatesCount?: number;
  /** Organisations only. Already normalised by the server — used as delivered. */
  websiteUrl?: string;
  /** Users only. A ready, localised "Oct 2023"-style label, decorated at render time. */
  joinedMonthLabel?: string;
  /** Whether the viewer may message this contributor (decided by the connector: type, signed in, not self). */
  canMessage?: boolean;
};

type ContributorCardProps = {
  contributor: ContributorCardData;
  onContributorClick?: (href: string) => void;
  /** Opens the Message action for this card. The "…" menu offers "Message" only when this is set. */
  onMessage?: (contributor: ContributorCardData) => void;
  className?: string;
};

const TYPE_ICON = {
  user: User,
  organization: Building2,
  virtualContributor: Bot,
} as const;

export function ContributorCard({ contributor, onContributorClick, className }: ContributorCardProps) {
  const { t } = useTranslation('crd-space');
  const Icon = TYPE_ICON[contributor.type];
  const isOrg = contributor.type === 'organization';
  const isVc = contributor.type === 'virtualContributor';
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

  // Tagline: two-line clamp for everyone; a user with none gets the italic
  // fallback, an organisation/VC with none gets no row at all.
  const hasTagline = Boolean(contributor.tagline);
  const showTaglineRow = hasTagline || contributor.type === 'user';

  // At most MAX_CARD_TAGS pills, in stored order, never a "+N" indicator.
  const visibleTags = (contributor.tags ?? []).slice(0, MAX_CARD_TAGS);

  // Organisation bottom line: shown whenever associatesCount is a number,
  // including zero — `typeof` distinguishes 0 from "not applicable".
  const showAssociatesLine = isOrg && typeof contributor.associatesCount === 'number';

  return (
    <Card className={cn('h-full overflow-hidden hover:shadow-md transition-shadow', className)}>
      <CardContent className="flex h-full flex-col p-0">
        <div className="p-4 flex items-start gap-3">
          {href ? (
            // Clickable for pointer users, but out of the tab order and the
            // accessibility tree — the name link below is the card's ONE
            // profile link for keyboard and assistive-technology users. The
            // biome `useAnchorContent` rule is scoped off for this file
            // (biome.json) because it flags any aria-hidden anchor and its
            // suggested fix (dropping aria-hidden) is exactly what this
            // deliberately duplicate, hidden link must not do.
            <a
              href={href}
              onClick={handleClick}
              aria-hidden="true"
              tabIndex={-1}
              className={cn('shrink-0', isOrg ? 'rounded-md' : 'rounded-full')}
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
                className="block truncate text-card-title text-foreground transition-colors hover:text-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {contributor.name}
              </a>
            ) : (
              <span className="block text-card-title text-foreground truncate">{contributor.name}</span>
            )}
            {contributor.roleLabel && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-caption font-medium border border-border bg-muted text-muted-foreground">
                <Icon className="w-3 h-3" aria-hidden="true" />
                {t(`members.role.${contributor.roleLabel}` as 'members.role.lead')}
              </span>
            )}
          </div>
          {/* Control cluster: website (organisations only), then the "…"
              actions menu, added in a later slice. */}
          <div className="flex shrink-0 items-center gap-1">
            {isOrg && contributor.websiteUrl && (
              <a
                href={contributor.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('contributors.card.website', { name: contributor.name })}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
        <div className="flex flex-1 flex-col px-4 pb-4">
          {showTaglineRow &&
            (hasTagline ? (
              <p className="line-clamp-2 text-body text-muted-foreground">{contributor.tagline}</p>
            ) : (
              <p className="line-clamp-2 text-body text-muted-foreground italic">
                {t('contributors.card.taglineFallback')}
              </p>
            ))}
          {visibleTags.length > 0 && (
            <div className="mt-3 flex gap-1 overflow-hidden">
              {visibleTags.map(tag => (
                <span
                  key={tag}
                  title={tag}
                  className="min-w-0 shrink truncate rounded-full border border-border bg-muted px-1.5 py-0.5 text-caption text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {!isVc && contributor.locationLabel && (
            <div className="mt-3 flex items-center gap-1 text-caption text-muted-foreground">
              <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{contributor.locationLabel}</span>
            </div>
          )}
          {showAssociatesLine && (
            <div className="mt-auto pt-3 flex items-center gap-1 text-caption text-muted-foreground">
              <Users className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span>{t('contributors.card.associates', { count: contributor.associatesCount })}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
