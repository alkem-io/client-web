import { CommunityMembershipStatus, SpaceSortMode, SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import type { SpaceCardData, SpaceLead } from '@/crd/components/space/SpaceCard';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import { getInitials } from './spacePageDataMapper';

type SubspaceQueryData = {
  id: string;
  visibility?: SpaceVisibility;
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
    // Leave undefined when no real cardBanner exists — `SpaceCard` renders the
    // deterministic gradient from `avatarColor` instead of a stock default image.
    bannerImageUrl: profile.cardBanner?.uri || undefined,
    initials: getInitials(profile.displayName),
    avatarColor: pickColorFromId(subspace.id),
    isPrivate: !subspace.about.isContentPublic,
    isMember: membership?.myMembershipStatus === CommunityMembershipStatus.Member,
    isPinned: showPinIndicator && (subspace.pinned ?? false),
    tags: profile.tagset?.tags ?? [],
    leads,
    href: profile.url,
    status: mapVisibilityToStatus(subspace.visibility),
  };
}

/**
 * Translate the GraphQL SpaceVisibility enum to the plain status string
 * consumed by CRD filter pills.
 */
function mapVisibilityToStatus(visibility?: SpaceVisibility): string {
  switch (visibility) {
    case SpaceVisibility.Archived:
      return 'archived';
    case SpaceVisibility.Inactive:
      return 'inactive';
    case SpaceVisibility.Demo:
      return 'demo';
    case SpaceVisibility.Active:
    default:
      return 'active';
  }
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
