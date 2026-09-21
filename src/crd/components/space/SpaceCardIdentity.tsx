import { Globe, Lock, Pin, UserCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CollapsibleTagList } from '@/crd/components/common/CollapsibleTagList';
import { StackedAvatars } from '@/crd/components/common/StackedAvatars';
import { backgroundGradient } from '@/crd/lib/backgroundGradient';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import type { SpaceCardData, SpaceLead } from './SpaceCard';

// Label keys for the visibilities that get a banner ribbon. `active` is intentionally
// absent — an active Space shows no ribbon.
const VISIBILITY_LABEL_KEY = {
  demo: 'crd-common:visibility.demo',
  inactive: 'crd-common:visibility.inactive',
  archived: 'crd-common:visibility.archived',
} as const;

export type SpaceCardIdentityProps = {
  space: SpaceCardData;
  onParentClick?: (parent: NonNullable<SpaceCardData['parent']>) => void;
  /**
   * Slot for the space's name — a plain string by default, or a caller-supplied
   * `<a>` when the identity block is composed inside a card whose real link lives
   * elsewhere (e.g. the expanded card's stretched name-link). Defaults to a plain
   * `<h3>{space.name}</h3>`.
   */
  nameSlot?: ReactNode;
};

/**
 * The compact card's identity block — banner (or the deterministic colour fallback),
 * visibility ribbon, Member/Public-Private/pin badges, avatar, name, parent line,
 * tagline and tags. Extracted from `SpaceCard` (feature 076, T006) so the expanded
 * card variant can reuse exactly this — never a copy — keeping FR-013 ("everything
 * the compact card shows") true by construction. Returns a fragment (two sibling
 * divs — banner, body) so composing it inside `SpaceCard`'s `<article>` produces
 * the exact same DOM as before the extraction; no extra wrapper element.
 */
export function SpaceCardIdentity({ space, onParentClick, nameSlot }: SpaceCardIdentityProps) {
  const { t } = useTranslation(['crd-exploreSpaces', 'crd-common']);

  return (
    <>
      {/* Banner Image */}
      <div className="relative z-0">
        <div className="overflow-hidden rounded-t-xl aspect-video">
          {space.bannerImageUrl ? (
            <img
              src={space.bannerImageUrl}
              alt={space.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full" style={backgroundGradient(space.avatarColor)} aria-hidden="true" />
          )}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, color-mix(in srgb, var(--foreground) 25%, transparent) 0%, transparent 50%)',
            }}
          />
        </div>

        {/* Visibility ribbon — centered at the top of the banner for non-active Spaces
            (Demo / Inactive / Archived), mirroring the MUI card. */}
        {space.visibility && space.visibility !== 'active' && (
          <span className="absolute top-0 left-1/2 z-[3] -translate-x-1/2 rounded-b-xl bg-primary px-3 py-1 text-caption font-semibold text-primary-foreground">
            {t(VISIBILITY_LABEL_KEY[space.visibility])}
          </span>
        )}

        {/* Member badge */}
        {space.isMember && (
          <div className="absolute top-3 left-4 z-[3]">
            <output className="flex items-center gap-1 px-2 py-1 rounded-full bg-white text-primary text-badge">
              <UserCheck aria-hidden="true" className="size-2.5" />
              <span>{t('crd-common:member')}</span>
            </output>
          </div>
        )}

        {/* Privacy + pin badges */}
        <div className="absolute top-3 right-3 z-[3] flex items-center gap-1">
          {space.isPinned && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-sm text-badge bg-background/85 text-foreground">
              <Pin aria-hidden="true" className="size-2.5" />
              <span className="sr-only">{t('crd-common:pinned')}</span>
            </span>
          )}
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-sm text-badge',
              space.isPrivate ? 'bg-foreground/50 text-primary-foreground' : 'bg-background/85 text-foreground'
            )}
          >
            {space.isPrivate ? (
              <Lock aria-hidden="true" className="size-2.5" />
            ) : (
              <Globe aria-hidden="true" className="size-2.5" />
            )}
            <span>{space.isPrivate ? t('crd-common:private') : t('crd-common:public')}</span>
          </div>
        </div>

        {/* Space avatar — overlaps banner and card body. L0 cards (hideAvatar=true) suppress
            this block entirely per the canonical visual-fields rule (L0 has no avatar). */}
        {!space.hideAvatar && (
          <div className="absolute left-4 -bottom-[18px] z-10">
            <StackedAvatars
              primary={{
                initials: space.initials,
                avatarColor: space.avatarColor,
                avatarUrl: space.avatarUrl,
                name: space.name,
              }}
              secondary={
                space.parent
                  ? {
                      initials: space.parent.initials,
                      avatarUrl: space.parent.avatarUrl,
                      avatarColor: space.parent.avatarColor,
                      name: space.parent.name,
                    }
                  : undefined
              }
            />
          </div>
        )}
      </div>

      {/* Card Body. pt-6 leaves room for the avatar overlap; pt-4 when there's no avatar (L0). */}
      <div className={cn('flex flex-col flex-1 px-4 pb-4', space.hideAvatar ? 'pt-4' : 'pt-6')}>
        {/* Name */}
        {nameSlot ?? (
          <h3 className="truncate text-card-title text-card-foreground transition-colors duration-200">{space.name}</h3>
        )}

        {/* Parent indicator for subspaces. `relative z-10` is a no-op inside the compact
            `SpaceCard` (which wraps the whole article in its own link) but is required
            inside `ExpandedSpaceCard`, whose stretched name-link overlay would otherwise
            sit above this button and swallow its clicks. */}
        {space.parent && (
          <p className="relative z-10 truncate text-caption text-muted-foreground mt-0.5">
            {t('spaces.in')}:{' '}
            <button
              type="button"
              className="text-muted-foreground hover:underline cursor-pointer bg-transparent border-none p-0 font-inherit text-caption focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-sm"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                if (space.parent) onParentClick?.(space.parent);
              }}
            >
              {space.parent.name}
            </button>
          </p>
        )}

        {/* Description */}
        <p className="line-clamp-2 text-body text-muted-foreground mt-2">{space.description}</p>

        {/* Tags — capped at 2 rows that fit the card width: long tags
            truncate (hover shows full), the overflow collapses into a +N
            badge (hover lists the rest). Clicks inside this row don't
            trigger card navigation. `relative z-10` (see the parent-line
            comment above) keeps the "+N" overflow popover trigger and
            truncated-tag hints keyboard-operable inside ExpandedSpaceCard. */}
        {space.tags.length > 0 && (
          // biome-ignore lint/a11y/noStaticElementInteractions: click-intercept wrapper (not an actionable element)
          // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard activation happens on inner interactive elements; this only blocks pointer bubbling
          <div
            className="relative z-10 mt-2.5 mb-4 min-w-0"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <CollapsibleTagList tags={space.tags} />
          </div>
        )}
      </div>
    </>
  );
}

const MAX_VISIBLE_LEADS = 4;

export type SpaceCardLeadsProps = {
  leads: SpaceLead[];
  className?: string;
};

/**
 * The compact card's leads footer — extracted from `SpaceCard` (feature 076, T006)
 * so the expanded card's footer (which additionally carries a call-to-action) can
 * reuse this exact block.
 */
export function SpaceCardLeads({ leads, className }: SpaceCardLeadsProps) {
  const { t } = useTranslation(['crd-exploreSpaces', 'crd-common']);
  const visibleLeads = leads.slice(0, MAX_VISIBLE_LEADS);
  const overflowCount = leads.length - MAX_VISIBLE_LEADS;

  if (leads.length === 0) return null;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-label text-muted-foreground uppercase">{t('crd-common:leads')}</span>
      <div className="flex -space-x-2">
        {visibleLeads.map(lead => (
          <Avatar
            key={lead.name}
            className="size-[26px] border-2 border-card"
            aria-label={`${lead.name} (${t(`crd-common:leadType.${lead.type}`)})`}
          >
            <AvatarImage src={lead.avatarUrl} alt="" />
            <AvatarFallback
              className={cn(
                'text-badge',
                lead.type === 'org' ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground'
              )}
            >
              {lead.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
        {overflowCount > 0 && (
          <span className="flex items-center justify-center size-[26px] border-2 border-card rounded-full bg-muted text-badge text-muted-foreground">
            <span aria-hidden="true">+{overflowCount}</span>
            <span className="sr-only">{t('spaces.moreLeads', { count: overflowCount })}</span>
          </span>
        )}
      </div>
    </div>
  );
}
