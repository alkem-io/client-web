import { ActorType, TagsetReservedName } from '@/core/apollo/generated/graphql-schema';
import type { ContributorPreviewData } from '@/crd/components/contributor/ContributorHoverCard';

type ContributorKind = ContributorPreviewData['type'];

export type PreviewProfileLike = {
  displayName?: string | null;
  url?: string | null;
  avatar?: { uri?: string | null } | null;
  tagline?: string | null;
  location?: { city?: string | null; country?: string | null } | null;
  tagsets?: { name: string; tags: string[] }[] | null;
};

// Only the contributor ActorType subtypes map to a card kind; the others (SPACE/ACCOUNT/VIRTUAL_ASSISTANT) do not.
const SERVER_TO_TYPE_ID: Partial<Record<ActorType, ContributorKind>> = {
  [ActorType.User]: 'user',
  [ActorType.Organization]: 'organization',
  [ActorType.VirtualContributor]: 'virtualContributor',
};

export const contributorTypeFromActor = (type?: ActorType): ContributorKind | undefined =>
  type ? SERVER_TO_TYPE_ID[type] : undefined;

export const canMessageContributor = (
  contributor: { type: ContributorKind; id: string },
  viewerId: string | undefined
) => Boolean(viewerId) && contributor.type !== 'virtualContributor' && contributor.id !== viewerId;

const KEYWORDS = TagsetReservedName.Keywords.toLowerCase();

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
    tags: profile.tagsets?.find(tagset => tagset.name.toLowerCase() === KEYWORDS)?.tags ?? [],
    canMessage: canMessageContributor({ type, id }, currentUserId),
  };
}
