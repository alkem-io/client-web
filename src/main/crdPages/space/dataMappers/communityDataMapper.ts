import { RoleName } from '@/core/apollo/generated/graphql-schema';
import type { MemberCardData, MemberRoleType } from '@/crd/components/space/SpaceMembers';
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
  roles?: RoleName[];
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

/**
 * Derive the user's most elevated role from their role list.
 * Precedence: Admin > Lead > Member.
 * Returns both an i18n key suffix (used by the UI for labels) and a
 * roleType bucket used for badge styling.
 */
function deriveUserRole(roles: RoleName[] | undefined): {
  role: 'admin' | 'lead' | 'member';
  roleType: MemberRoleType;
} {
  if (!roles || roles.length === 0) {
    return { role: 'member', roleType: 'member' };
  }
  if (roles.includes(RoleName.Admin)) {
    return { role: 'admin', roleType: 'admin' };
  }
  if (roles.includes(RoleName.Lead)) {
    return { role: 'lead', roleType: 'moderator' };
  }
  return { role: 'member', roleType: 'member' };
}

export function mapRoleSetToMemberCards(users: RoleSetMember[], organizations: RoleSetMember[]): MemberCardData[] {
  const toUserCard = (m: RoleSetMember): MemberCardData | undefined => {
    if (!m.profile) return undefined;
    const location = [m.profile.location?.city, m.profile.location?.country].filter(Boolean).join(', ');
    const tags = m.profile.tagsets?.flatMap(ts => ts.tags) ?? [];
    const { role, roleType } = deriveUserRole(m.roles);
    return {
      id: m.id,
      name: m.profile.displayName,
      avatarUrl: m.profile.avatar?.uri,
      type: 'user',
      role,
      roleType,
      location: location || undefined,
      tagline: m.profile.tagline ?? m.profile.description ?? undefined,
      tags,
      href: m.profile.url,
    };
  };

  const toOrgCard = (m: RoleSetMember): MemberCardData | undefined => {
    if (!m.profile) return undefined;
    const location = [m.profile.location?.city, m.profile.location?.country].filter(Boolean).join(', ');
    const tags = m.profile.tagsets?.flatMap(ts => ts.tags) ?? [];
    return {
      id: m.id,
      name: m.profile.displayName,
      avatarUrl: m.profile.avatar?.uri,
      type: 'organization',
      role: 'organization',
      location: location || undefined,
      tagline: m.profile.tagline ?? m.profile.description ?? undefined,
      tags,
      href: m.profile.url,
    };
  };

  const userCards = users.map(toUserCard).filter((c): c is MemberCardData => c !== undefined);
  const orgCards = organizations.map(toOrgCard).filter((c): c is MemberCardData => c !== undefined);
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
