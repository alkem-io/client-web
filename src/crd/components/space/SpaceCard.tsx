import { cn } from '@/crd/lib/utils';
import { SpaceCardIdentity, SpaceCardLeads } from './SpaceCardIdentity';

export type SpaceLead = {
  name: string;
  avatarUrl: string;
  type: 'person' | 'org';
};

export type SpaceCardParent = {
  name: string;
  href: string;
  avatarUrl?: string;
  initials: string;
  avatarColor: string;
};

/** Plain visibility variant (no GraphQL enum) used to drive the banner label. */
export type SpaceCardVisibility = 'active' | 'demo' | 'inactive' | 'archived';

export type SpaceCardData = {
  id: string;
  name: string;
  description: string;
  bannerImageUrl?: string;
  /** Optional avatar image. When omitted the avatar renders initials on a coloured background. */
  avatarUrl?: string;
  initials: string;
  /**
   * Accent colour used for (1) the deterministic gradient on the banner when `bannerImageUrl` is
   * missing, and (2) the avatar fallback when `avatarUrl` is missing. Always required for the
   * banner gradient, even for L0 spaces that suppress the avatar block entirely.
   */
  avatarColor: string;
  /**
   * Suppress the avatar block (StackedAvatars) entirely. Set for L0 spaces, which per the
   * canonical visual-fields rule do not show an avatar in cards (cards = title + cardBanner only).
   */
  hideAvatar?: boolean;
  isPrivate: boolean;
  isMember?: boolean;
  isPinned?: boolean;
  tags: string[];
  leads: SpaceLead[];
  href: string;
  matchedTerms?: boolean;
  parent?: SpaceCardParent;
  /** Lifecycle status used for filter pills (e.g. 'active', 'archived'). */
  status?: string;
  /**
   * Space visibility. When provided and not `active`, a centered ribbon (Demo / Inactive /
   * Archived) is shown at the top of the banner — mirrors the MUI card. Omit (or `active`)
   * to show no ribbon.
   */
  visibility?: SpaceCardVisibility;
  /**
   * Raw markdown excerpt sources for the expanded card variant (feature 076). Ignored by
   * the compact `SpaceCard` — only `ExpandedSpaceCard` reads these, and only for a post in
   * expanded mode (FR-027). `what` is the About *description* — never confuse with this
   * type's own `description` field above, which carries the tagline.
   */
  what?: string;
  why?: string;
  who?: string;
};

export type SpaceCardProps = {
  space: SpaceCardData;
  onClick?: (space: SpaceCardData) => void;
  onParentClick?: (parent: SpaceCardParent) => void;
  className?: string;
};

export function SpaceCard({ space, onClick, onParentClick, className }: SpaceCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick(space);
    }
  };

  return (
    <a
      href={space.href}
      onClick={handleClick}
      className={cn(
        'group block h-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl',
        className
      )}
    >
      <article className="h-full flex flex-col rounded-xl bg-card border border-border shadow-none hover:shadow-[var(--elevation-sm)] hover:border-primary/30 transition-all duration-300">
        <SpaceCardIdentity space={space} onParentClick={onParentClick} />

        {/* Card Footer — Leads only */}
        {space.leads.length > 0 && (
          <div className="flex items-center mt-3 px-4 py-3 border-t border-border">
            <SpaceCardLeads leads={space.leads} />
          </div>
        )}
      </article>
    </a>
  );
}

export function SpaceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl animate-pulse bg-card border border-border">
      <div className="aspect-video bg-muted" />
      <div className="px-4 pt-6">
        <div className="rounded w-[70%] h-3.5 bg-muted mb-2" />
        <div className="rounded w-full h-3 bg-muted mb-1" />
        <div className="rounded w-[60%] h-3 bg-muted mb-3" />
        <div className="flex gap-1.5">
          <div className="rounded-full w-12 h-[18px] bg-muted" />
          <div className="rounded-full w-14 h-[18px] bg-muted" />
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3 mt-3 border-t border-border">
        <div className="flex -space-x-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="rounded-full border-2 size-[26px] bg-muted border-card" />
          ))}
        </div>
        <div className="rounded w-10 h-3 bg-muted" />
      </div>
    </div>
  );
}
