import { TagsetReservedName } from '@/core/apollo/generated/graphql-schema';
import type { ContributorPreviewData } from '@/crd/components/contributor/ContributorHoverCard';

type ContributorKind = ContributorPreviewData['type'];

export type PreviewProfileLike = {
  displayName?: string | null;
  url?: string | null;
  avatar?: { uri?: string | null } | null;
  tagline?: string | null;
  location?: { city?: string | null; country?: string | null } | null;
  /** The Keywords tagset's tags — the only tags the card shows. */
  keywords?: string[] | null;
};

export const canMessageContributor = (
  contributor: { type: ContributorKind; id: string },
  viewerId: string | undefined
) => Boolean(viewerId) && contributor.type !== 'virtualContributor' && contributor.id !== viewerId;

const KEYWORDS = TagsetReservedName.Keywords.toLowerCase();

/** The Keywords tags out of a profile's full tagset list (comment senders load every tagset). */
export const keywordTags = (tagsets: { name: string; tags: string[] }[] | null | undefined) =>
  tagsets?.find(tagset => tagset.name.toLowerCase() === KEYWORDS)?.tags;

export function mapContributorPreview(
  id: string,
  type: ContributorKind,
  profile: PreviewProfileLike,
  currentUserId: string | undefined
): ContributorPreviewData {
  return {
    id,
    type,
    name: profile.displayName ?? '',
    avatarUrl: profile.avatar?.uri ?? undefined,
    href: profile.url ?? undefined,
    locationLabel: [profile.location?.city, profile.location?.country].filter(Boolean).join(', ') || undefined,
    tagline: profile.tagline?.trim() || undefined,
    tags: profile.keywords ?? [],
    // The card's Message action is a direct chat, which only users have; an organisation
    // is messaged through its own dialog elsewhere, never from the card.
    canMessage: type === 'user' && canMessageContributor({ type, id }, currentUserId),
  };
}
