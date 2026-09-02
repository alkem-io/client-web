import type { RoleAssignmentPerson } from '@/crd/components/contributor/settings/RoleAssignmentView';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';

/** Subset of `RoleSetMemberUserFragmentWithRoles` we read in the mapper. */
export type RoleSetMemberLike = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profile?: {
    displayName: string;
    avatar?: { uri: string } | undefined;
    location?: { city?: string; country?: string } | undefined;
  };
};

/** Subset of the available-users response we read in the mapper. */
export type AvailableUserLike = {
  id: string;
  profile?: { displayName: string };
  email?: string;
};

const buildSubtitle = (member: RoleSetMemberLike): string | undefined => {
  const city = member.profile?.location?.city;
  const country = member.profile?.location?.country;
  const location = [city, country].filter(Boolean).join(', ');
  if (location) return location;
  return member.email || undefined;
};

/** Map a role-set current-member entry to a `RoleAssignmentPerson` row. */
export const mapCurrentMemberToPerson = (member: RoleSetMemberLike): RoleAssignmentPerson => ({
  id: member.id,
  displayName:
    member.profile?.displayName ??
    (`${member.firstName ?? ''} ${member.lastName ?? ''}`.trim() || member.email || member.id),
  avatarUrl: member.profile?.avatar?.uri,
  subtitle: buildSubtitle(member),
  color: pickColorFromId(member.id),
});

/** Map an available-user entry to a `RoleAssignmentPerson` row. */
export const mapAvailableUserToPerson = (user: AvailableUserLike): RoleAssignmentPerson => ({
  id: user.id,
  displayName: user.profile?.displayName ?? user.email ?? user.id,
  subtitle: user.email,
  color: pickColorFromId(user.id),
});
