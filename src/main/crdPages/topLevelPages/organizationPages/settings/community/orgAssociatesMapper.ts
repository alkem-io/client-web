import type { RoleName } from '@/core/apollo/generated/graphql-schema';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';

export type OrgAssociateRow = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  subtitle?: string;
  color: string;
  isAssociate: boolean;
  isAdmin: boolean;
  isOwner: boolean;
};

/** Subset of `usersInRoles` we read in the mapper — one entry per role, users repeated across roles. */
export type UsersInRoleLike = {
  role: RoleName;
  users: {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    profile?: {
      displayName: string;
      avatar?: { uri: string } | undefined;
      location?: { city?: string; country?: string } | undefined;
    };
  }[];
};

const buildSubtitle = (member: UsersInRoleLike['users'][number]): string | undefined => {
  const city = member.profile?.location?.city;
  const country = member.profile?.location?.country;
  const location = [city, country].filter(Boolean).join(', ');
  if (location) return location;
  return member.email || undefined;
};

/**
 * Flattens `usersInRoles([ASSOCIATE, ADMIN, OWNER])` into one row per distinct user, with a
 * badge flag per role held. This is deliberately the UNION, not the associate-only list: an
 * admin or owner who does not hold the entry role exists (`requiresEntryRole` is unenforced
 * at assignment) and must stay visible and demotable (F7, D14).
 */
export const mapUsersInRolesToAssociateRows = (
  usersInRoles: UsersInRoleLike[],
  associateRole: RoleName,
  adminRole: RoleName,
  ownerRole: RoleName
): OrgAssociateRow[] => {
  const rowsById = new Map<string, OrgAssociateRow>();

  for (const { role, users } of usersInRoles) {
    for (const user of users) {
      let row = rowsById.get(user.id);
      if (!row) {
        row = {
          id: user.id,
          displayName: user.profile?.displayName ?? user.email ?? user.id,
          avatarUrl: user.profile?.avatar?.uri,
          subtitle: buildSubtitle(user),
          color: pickColorFromId(user.id),
          isAssociate: false,
          isAdmin: false,
          isOwner: false,
        };
        rowsById.set(user.id, row);
      }
      if (role === associateRole) row.isAssociate = true;
      if (role === adminRole) row.isAdmin = true;
      if (role === ownerRole) row.isOwner = true;
    }
  }

  return [...rowsById.values()].sort((a, b) => a.displayName.localeCompare(b.displayName));
};

export type RoleLimitErrorKind = 'limitAdmin' | 'limitOwner' | 'minOwner';

/**
 * Maps a `RoleSetPolicyRoleLimitsException` message (server text, `role.set.service.ts`:
 * `Max limit of Users reached for role 'ADMIN': 6, cannot assign new Users.` /
 * `Min limit of Users reached for role 'OWNER': 1, cannot remove Users.`) to the readable
 * copy key naming the limit — never a generic failure toast (FR-019).
 */
export const mapRoleLimitError = (message: string | undefined): RoleLimitErrorKind | undefined => {
  if (!message) return undefined;
  const isMax = message.includes('Max limit');
  const isMin = message.includes('Min limit');
  if (isMax && message.includes("'ADMIN'")) return 'limitAdmin';
  if (isMax && message.includes("'OWNER'")) return 'limitOwner';
  if (isMin && message.includes("'OWNER'")) return 'minOwner';
  return undefined;
};
