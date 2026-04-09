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

type RoleSetMember = {
  id: string;
  profile?: {
    displayName: string;
    url: string;
    avatar?: { uri: string } | null;
    tagline?: string | null;
    description?: string | null;
    location?: { city?: string; country?: string } | null;
    tagsets?: Array<{ tags: string[] }> | null;
  };
};

export function mapRoleSetToMemberCards(users: RoleSetMember[], organizations: RoleSetMember[]): MemberCardData[] {
  const toCard = (m: RoleSetMember, type: 'user' | 'organization'): MemberCardData | undefined => {
    if (!m.profile) return undefined;
    const location = [m.profile.location?.city, m.profile.location?.country].filter(Boolean).join(', ');
    const tags = m.profile.tagsets?.flatMap(ts => ts.tags) ?? [];
    return {
      id: m.id,
      name: m.profile.displayName,
      avatarUrl: m.profile.avatar?.uri,
      type,
      location: location || undefined,
      tagline: m.profile.tagline ?? m.profile.description ?? undefined,
      tags,
      href: m.profile.url,
    };
  };

  const userCards = users.map(u => toCard(u, 'user')).filter((c): c is MemberCardData => c !== undefined);
  const orgCards = organizations
    .map(o => toCard(o, 'organization'))
    .filter((c): c is MemberCardData => c !== undefined);
  return [...userCards, ...orgCards];
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
