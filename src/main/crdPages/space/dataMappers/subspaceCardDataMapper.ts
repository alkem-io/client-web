import { CommunityMembershipStatus } from '@/core/apollo/generated/graphql-schema';
import type { SubspaceListCardData } from '@/crd/components/space/SpaceSubspacesList';

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

export function mapSubspaceToCardData(subspace: SubspaceQueryData): SubspaceListCardData {
  const profile = subspace.about.profile;
  const membership = subspace.about.membership;

  const leads: Array<{ name: string; avatarUrl?: string }> = [];
  for (const u of membership?.leadUsers ?? []) {
    if (u.profile) {
      leads.push({ name: u.profile.displayName, avatarUrl: u.profile.avatar?.uri });
    }
  }
  for (const o of membership?.leadOrganizations ?? []) {
    if (o.profile) {
      leads.push({ name: o.profile.displayName, avatarUrl: o.profile.avatar?.uri });
    }
  }

  return {
    id: subspace.id,
    name: profile.displayName,
    tagline: profile.tagline ?? undefined,
    bannerUrl: profile.cardBanner?.uri,
    tags: profile.tagset?.tags ?? [],
    isPrivate: !subspace.about.isContentPublic,
    isMember: membership?.myMembershipStatus === CommunityMembershipStatus.Member,
    isPinned: subspace.pinned ?? false,
    leads,
    href: profile.url,
  };
}

export function mapSubspacesToCardDataList(subspaces: SubspaceQueryData[]): SubspaceListCardData[] {
  return subspaces.map(mapSubspaceToCardData);
}
