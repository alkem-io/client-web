import { CommunityMembershipStatus, SpaceSortMode, VisualType } from '@/core/apollo/generated/graphql-schema';
import type { SpaceCardData, SpaceLead } from '@/crd/components/space/SpaceCard';
import { getDefaultSpaceVisualUrl } from '@/domain/space/icons/defaultVisualUrls';
import { getInitials } from './spacePageDataMapper';

// Avatar color palette — mirrors the prototype's subspace color set.
const SUBSPACE_AVATAR_COLORS = [
  '#2563eb', // blue
  '#7c3aed', // purple
  '#059669', // emerald
  '#d97706', // amber
  '#dc2626', // red
  '#0891b2', // cyan
];

/** Deterministic color pick from the avatar palette based on entity id. */
export function getAvatarColorFromId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % SUBSPACE_AVATAR_COLORS.length;
  return SUBSPACE_AVATAR_COLORS[index];
}

type SubspaceQueryData = {
  id: string;
  about: {
    profile: {
      displayName: string;
      tagline?: string | null;
      url: string;
      cardBanner?: { uri: string } | null;
      tagset?: { tags: string[] } | null;
    };
    isContentPublic?: boolean;
    membership?: {
      myMembershipStatus?: CommunityMembershipStatus;
      leadUsers?: Array<{
        profile?: {
          displayName: string;
          avatar?: { uri: string } | null;
        } | null;
      }>;
      leadOrganizations?: Array<{
        profile?: {
          displayName: string;
          avatar?: { uri: string } | null;
        } | null;
      }>;
    };
  };
  pinned?: boolean;
};

function mapSubspaceToCardData(subspace: SubspaceQueryData, showPinIndicator: boolean): SpaceCardData {
  const profile = subspace.about.profile;
  const membership = subspace.about.membership;

  const leads: SpaceLead[] = [];
  for (const u of membership?.leadUsers ?? []) {
    if (u.profile) {
      leads.push({
        name: u.profile.displayName,
        avatarUrl: u.profile.avatar?.uri ?? '',
        type: 'person',
      });
    }
  }
  for (const o of membership?.leadOrganizations ?? []) {
    if (o.profile) {
      leads.push({
        name: o.profile.displayName,
        avatarUrl: o.profile.avatar?.uri ?? '',
        type: 'org',
      });
    }
  }

  return {
    id: subspace.id,
    name: profile.displayName,
    description: profile.tagline ?? '',
    bannerImageUrl: profile.cardBanner?.uri || getDefaultSpaceVisualUrl(VisualType.Card, subspace.id),
    initials: getInitials(profile.displayName),
    avatarColor: getAvatarColorFromId(subspace.id),
    isPrivate: !subspace.about.isContentPublic,
    isMember: membership?.myMembershipStatus === CommunityMembershipStatus.Member,
    isPinned: showPinIndicator && (subspace.pinned ?? false),
    tags: profile.tagset?.tags ?? [],
    leads,
    href: profile.url,
  };
}

/**
 * Map subspace query results into CRD SpaceCard props.
 *
 * The pin indicator is only rendered when the parent space uses alphabetical
 * sorting (FR-031). Pass the parent space's `sortMode` so the mapper can zero
 * out `isPinned` for other modes.
 */
export function mapSubspacesToCardDataList(subspaces: SubspaceQueryData[], sortMode?: SpaceSortMode): SpaceCardData[] {
  const showPinIndicator = sortMode === SpaceSortMode.Alphabetical;
  return subspaces.map(s => mapSubspaceToCardData(s, showPinIndicator));
}
