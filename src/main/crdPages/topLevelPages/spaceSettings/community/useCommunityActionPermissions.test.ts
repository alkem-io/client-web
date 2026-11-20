import { describe, expect, it } from 'vitest';

import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

import useCommunityActionPermissions from './useCommunityActionPermissions';

/**
 * Space Community settings gating. `useCommunityTabData` forwards the raw role-set
 * privileges and the loading flag; this hook resolves one decision per control from them
 * and `CrdSpaceSettingsPage` renders each decision as a tooltip. These specs pin which
 * privilege gates which control, because the backend resolver enforces a different token
 * for inviting a member than for changing an existing member's roles.
 */

const {
  Create,
  Delete,
  Grant,
  Read,
  Update,
  CommunityAssignVcFromAccount: FROM_ACCOUNT,
  RolesetEntryRoleAssign: ASSIGN,
  RolesetEntryRoleInvite: INVITE,
} = AuthorizationPrivilege;

/**
 * What an ordinary space admin holds on the space role set: the cascading space-admin rule
 * grants CREATE/READ/UPDATE/DELETE/GRANT, and the role set adds the invite token.
 */
const SPACE_ADMIN = [Create, Read, Update, Delete, Grant, INVITE];

/** Every token any control on this surface is gated on. */
const EVERY_TOKEN = [...SPACE_ADMIN, FROM_ACCOUNT];

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

  // BOTH directions of the organization lead toggle are a space admin's to make.
  //
  // This assertion was inverted before server ruling R32: ticking the toggle calls
  // `assignRoleToOrganization`, which used to demand the organization assign token for
  // EVERY role change, so the control was disabled for every space admin — an
  // organization that accepted an invitation could never be given Lead, demoted or
  // removed. R32 narrowed that token to bringing a NEW organization in; for one already
  // holding the entry role the resolver asks for GRANT alone, exactly like
  // `removeRoleFromOrganization` always has.
  //
  // So this is the organization-shaped twin of the user bug #10280 fixed, and the two
  // directions no longer diverge.
  it('permits both directions of the organization lead toggle (R32)', () => {
    const permissions = useCommunityActionPermissions(SPACE_ADMIN, false);

    expect(permissions.organizationLeadAssign).toEqual({ allowed: true, reason: 'allowed' });
    expect(permissions.organizationRemove).toEqual({ allowed: true, reason: 'allowed' });
  });
});

describe('space community settings — the gates still hold for everyone else', () => {
  it('denies every control to a member without administrative privileges', () => {
    const permissions = useCommunityActionPermissions(VIEWER, false);

    expect(Object.values(permissions).every(permission => !permission.allowed)).toBe(true);
    expect(permissions.userRoleChange).toEqual({ allowed: false, reason: 'denied' });
    expect(permissions.organizationRemove).toEqual({ allowed: false, reason: 'denied' });
  });

  it('permits every control to a holder of every gating token', () => {
    const permissions = useCommunityActionPermissions(EVERY_TOKEN, false);

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

describe('space community settings — virtual contributors accept either privilege', () => {
  it('is permitted with the role-set assign privilege alone', () => {
    expect(useCommunityActionPermissions([ASSIGN], false).addVirtualContributor.allowed).toBe(true);
  });

  // Regression guard: space admins may hold only the account-assign privilege. Gating on
  // the role-set assign privilege alone would lock them out of the VC add controls.
  it('is permitted with the account-assign privilege alone', () => {
    expect(useCommunityActionPermissions([FROM_ACCOUNT], false).addVirtualContributor.allowed).toBe(true);
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
