import { describe, expect, it } from 'vitest';

import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

import useCommunityActionPermissions from './useCommunityActionPermissions';

/**
 * Space Community settings gating. `useCommunityTabData` forwards the raw role-set
 * privileges and the loading flag; this hook resolves one decision per control from them
 * and `CrdSpaceSettingsPage` renders each decision as a tooltip. These specs pin which
 * privilege gates which control, because the backend resolver enforces a different token
 * for adding a member than for changing an existing member's roles.
 */

const {
  Create,
  Delete,
  Grant,
  Read,
  Update,
  CommunityAssignVcFromAccount: FROM_ACCOUNT,
  RolesetEntryRoleAssign: ASSIGN,
  RolesetEntryRoleAssignOrganization: ASSIGN_ORG,
  RolesetEntryRoleInvite: INVITE,
} = AuthorizationPrivilege;

/**
 * What an ordinary space admin actually holds on the space role set: the cascading
 * space-admin rule grants CREATE/READ/UPDATE/DELETE/GRANT, and the role set adds the
 * invite token. It does NOT grant `ROLESET_ENTRY_ROLE_ASSIGN` or
 * `ROLESET_ENTRY_ROLE_ASSIGN_ORGANIZATION` — those rules name the global admin, global
 * support and beta-tester credentials only.
 */
const SPACE_ADMIN = [Create, Read, Update, Delete, Grant, INVITE];

/** A platform admin additionally holds the direct-add tokens. */
const PLATFORM_ADMIN = [...SPACE_ADMIN, ASSIGN, ASSIGN_ORG];

/** A community member with no administrative rights. */
const VIEWER = [Read];

describe('space community settings — a space admin may change an existing member’s roles', () => {
  // Regression guard. The lead toggle, the admin toggle and remove-from-space all resolve
  // from `userRoleChange`; gating them on the direct-add token disabled all three for every
  // space admin, for mutations the backend would have accepted on GRANT alone.
  it('permits the lead toggle, the admin toggle and remove-from-space', () => {
    const permissions = useCommunityActionPermissions(SPACE_ADMIN, false);

    expect(permissions.userRoleChange).toEqual({ allowed: true, reason: 'allowed' });
  });

  it('permits removing an organization from the space', () => {
    const permissions = useCommunityActionPermissions(SPACE_ADMIN, false);

    expect(permissions.organizationRemove).toEqual({ allowed: true, reason: 'allowed' });
  });

  it('still withholds the direct add-member path, which stays a platform-admin action', () => {
    const permissions = useCommunityActionPermissions(SPACE_ADMIN, false);

    expect(permissions.addMember).toEqual({ allowed: false, reason: 'denied' });
  });

  it('still withholds adding an organization, which needs the organization token too', () => {
    const permissions = useCommunityActionPermissions(SPACE_ADMIN, false);

    expect(permissions.addOrganization.allowed).toBe(false);
    expect(permissions.organizationLeadChange.allowed).toBe(false);
  });
});

describe('space community settings — the gates still hold for everyone else', () => {
  it('denies every control to a member without administrative privileges', () => {
    const permissions = useCommunityActionPermissions(VIEWER, false);

    expect(Object.values(permissions).every(permission => permission.allowed)).toBe(false);
    expect(permissions.userRoleChange).toEqual({ allowed: false, reason: 'denied' });
    expect(permissions.organizationRemove).toEqual({ allowed: false, reason: 'denied' });
  });

  it('permits every control to a platform admin', () => {
    const permissions = useCommunityActionPermissions(PLATFORM_ADMIN, false);

    expect(Object.values(permissions).every(permission => permission.allowed)).toBe(true);
  });

  it('is checking while privileges load, never interactive first', () => {
    const permissions = useCommunityActionPermissions(undefined, true);

    expect(Object.values(permissions).every(permission => permission.reason === 'checking')).toBe(true);
  });

  it('is unverifiable when the query completed without privileges', () => {
    const permissions = useCommunityActionPermissions(undefined, false);

    expect(Object.values(permissions).every(permission => permission.reason === 'unverifiable')).toBe(true);
  });
});

describe('space community settings — organization rows need both tokens to be added', () => {
  it('is denied with only the organization assign privilege', () => {
    expect(useCommunityActionPermissions([ASSIGN_ORG], false).addOrganization.allowed).toBe(false);
  });

  it('is denied with only GRANT', () => {
    expect(useCommunityActionPermissions([Grant], false).addOrganization.allowed).toBe(false);
  });

  it('is denied with the plain assign privilege, which does not cover organizations', () => {
    expect(useCommunityActionPermissions([ASSIGN], false).addOrganization.allowed).toBe(false);
  });

  it('is permitted only with both tokens', () => {
    expect(useCommunityActionPermissions([ASSIGN_ORG, Grant], false).addOrganization).toEqual({
      allowed: true,
      reason: 'allowed',
    });
  });
});

describe('space community settings — virtual contributors accept either privilege', () => {
  it('is permitted with the role-set assign privilege alone', () => {
    expect(useCommunityActionPermissions([ASSIGN], false).addVirtualContributor.allowed).toBe(true);
  });

  // Regression guard: space admins may hold only the account-assign privilege. Gating on
  // the role-set assign privilege alone would lock them out of the VC add controls.
  it('is permitted with the account-assign privilege alone', () => {
    const permissions = useCommunityActionPermissions([FROM_ACCOUNT], false);

    expect(permissions.addMember.allowed).toBe(false);
    expect(permissions.addVirtualContributor.allowed).toBe(true);
  });

  it('is denied when neither privilege is held', () => {
    expect(useCommunityActionPermissions([Grant], false).addVirtualContributor.allowed).toBe(false);
  });

  it('is denied while privileges load', () => {
    const permissions = useCommunityActionPermissions([ASSIGN, FROM_ACCOUNT], true);

    expect(permissions.addVirtualContributor.allowed).toBe(false);
    expect(permissions.addVirtualContributor.reason).toBe('checking');
  });
});
