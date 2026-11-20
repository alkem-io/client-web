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

const buildSubtitle = (associate: UsersInRoleLike['users'][number]): string | undefined => {
  const city = associate.profile?.location?.city;
  const country = associate.profile?.location?.country;
  const location = [city, country].filter(Boolean).join(', ');
  if (location) return location;
  return associate.email || undefined;
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
 * The server's `RoleSetPolicyRoleLimitsException` text (`role.set.service.ts`), e.g.
 * `Max limit of users reached for role 'admin': 6, cannot assign new user.` /
 * `Min limit of users reached for role 'owner': 1, cannot remove user.`. The role token is
 * the enum VALUE (lower-case), so it is matched case-insensitively — an upper-case variant
 * would silently fall through to a generic failure otherwise.
 */
const ROLE_LIMIT_MESSAGE = /\b(Max|Min) limit\b.*?\brole '([\w-]+)'/i;

/** Maps a role-limit refusal to the readable copy key naming the limit, never a generic failure. */
export const mapRoleLimitError = (message: string | undefined): RoleLimitErrorKind | undefined => {
  if (!message) return undefined;
  const match = ROLE_LIMIT_MESSAGE.exec(message);
  if (!match) return undefined;
  const bound = match[1].toLowerCase();
  const role = match[2].toLowerCase();
  if (bound === 'max' && role === 'admin') return 'limitAdmin';
  if (bound === 'max' && role === 'owner') return 'limitOwner';
  if (bound === 'min' && role === 'owner') return 'minOwner';
  return undefined;
};
