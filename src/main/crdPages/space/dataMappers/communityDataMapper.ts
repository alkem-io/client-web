import { RoleName } from '@/core/apollo/generated/graphql-schema';
import type { MemberCardData, MemberRoleKey, MemberRoleType } from '@/crd/components/space/SpaceMembers';
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
 * Derive the user's most elevated role from their role list — used only
 * for the display badge (precedence Admin > Lead > Member).
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

/**
 * Convert the full `RoleName[]` into the `MemberRoleKey[]` array used
 * by the filter pills. Admin + Lead are NOT mutually exclusive — a user
 * who holds both roles should match both filters.
 */
function deriveUserRolesList(roles: RoleName[] | undefined): MemberRoleKey[] {
  const keys: MemberRoleKey[] = [];
  if (!roles || roles.length === 0) {
    return ['member'];
  }
  if (roles.includes(RoleName.Admin)) keys.push('admin');
  if (roles.includes(RoleName.Lead)) keys.push('lead');
  if (roles.includes(RoleName.Member)) keys.push('member');
  // Fallback: if the user has none of the three "member grid" roles
  // (shouldn't happen in practice), still surface them under `member`.
  return keys.length > 0 ? keys : ['member'];
}

export function mapRoleSetToMemberCards(users: RoleSetMember[], organizations: RoleSetMember[]): MemberCardData[] {
  const toUserCard = (m: RoleSetMember): MemberCardData | undefined => {
    if (!m.profile) return undefined;
    const location = [m.profile.location?.city, m.profile.location?.country].filter(Boolean).join(', ');
    const tags = m.profile.tagsets?.flatMap(ts => ts.tags) ?? [];
    const { role, roleType } = deriveUserRole(m.roles);
    const roles = deriveUserRolesList(m.roles);
    return {
      id: m.id,
      name: m.profile.displayName,
      avatarUrl: m.profile.avatar?.uri,
      type: 'user',
      role,
      roles,
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
      roles: ['organization'],
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

// ── Sidebar data mappers ───────────────────────────────

export type SidebarLeadData = {
  id: string;
  name: string;
  avatarUrl?: string;
  initials: string;
  location?: string;
  href: string;
  type: 'person' | 'org';
};

export type SidebarVirtualContributorData = {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  initials: string;
  href?: string;
};

/**
 * Map a role-set member (user or organization) with the Lead role into the
 * sidebar lead item shape used by the Community tab sidebar.
 */
export function mapRoleSetMemberToSidebarLead(
  member: RoleSetMember,
  type: 'person' | 'org'
): SidebarLeadData | undefined {
  if (!member.profile) return undefined;
  const location = [member.profile.location?.city, member.profile.location?.country].filter(Boolean).join(', ');
  return {
    id: member.id,
    name: member.profile.displayName,
    avatarUrl: member.profile.avatar?.uri,
    initials: getInitials(member.profile.displayName),
    location: location || undefined,
    href: member.profile.url,
    type,
  };
}

/**
 * Map a role-set virtual contributor into the sidebar VC item shape.
 * VCs do not expose a tagline/description in the role-set fragment, so
 * `description` is always undefined here.
 */
export function mapVirtualContributorToSidebar(vc: {
  id: string;
  profile?: {
    displayName: string;
    url: string;
    avatar?: { uri: string } | null;
  } | null;
}): SidebarVirtualContributorData | undefined {
  if (!vc.profile) return undefined;
  return {
    id: vc.id,
    name: vc.profile.displayName,
    avatarUrl: vc.profile.avatar?.uri,
    initials: getInitials(vc.profile.displayName),
    href: vc.profile.url,
  };
}
