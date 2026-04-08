import type { MemberCardData } from '@/crd/components/space/SpaceMembers';
import { getInitials } from './spacePageDataMapper';

type UserLike = {
  id: string;
  profile: {
    displayName: string;
    url: string;
    avatar?: { uri: string } | null;
    tagline?: string | null;
    location?: { city?: string; country?: string } | null;
    tagsets?: Array<{ tags: string[] }> | null;
  };
};

export function mapUserToMemberCard(user: UserLike, type: 'user' | 'organization' = 'user'): MemberCardData {
  const location = [user.profile.location?.city, user.profile.location?.country].filter(Boolean).join(', ');

  const tags = user.profile.tagsets?.flatMap(ts => ts.tags) ?? [];

  return {
    id: user.id,
    name: user.profile.displayName,
    avatarUrl: user.profile.avatar?.uri,
    type,
    location: location || undefined,
    tagline: user.profile.tagline ?? undefined,
    tags,
    href: user.profile.url,
  };
}

export function mapLeadToSidebarData(user: UserLike) {
  const location = [user.profile.location?.city, user.profile.location?.country].filter(Boolean).join(', ');

  return {
    name: user.profile.displayName,
    avatarUrl: user.profile.avatar?.uri,
    initials: getInitials(user.profile.displayName),
    location: location || undefined,
    bio: user.profile.tagline ?? undefined,
    href: user.profile.url,
  };
}

export function mapVirtualContributor(vc: {
  id: string;
  profile: {
    displayName: string;
    url: string;
    avatar?: { uri: string } | null;
    tagline?: string | null;
  };
}) {
  return {
    name: vc.profile.displayName,
    description: vc.profile.tagline ?? undefined,
    avatarUrl: vc.profile.avatar?.uri,
    initials: getInitials(vc.profile.displayName),
    href: vc.profile.url,
  };
}
