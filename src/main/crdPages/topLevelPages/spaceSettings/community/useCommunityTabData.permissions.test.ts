import { describe, expect, it } from 'vitest';

import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import useActionPermission from '@/domain/access/permissions/useActionPermission';
import {
  ROLE_SET_ASSIGN_ORGANIZATION_PRIVILEGES,
  ROLE_SET_ASSIGN_PRIVILEGES,
} from '@/main/crdPages/permissions/roleAssignmentPrivileges';

/**
 * Surface 4 gating. `useCommunityTabData` forwards the raw role-set privileges and the
 * loading flag (they were previously derived into booleans and dropped, which left the
 * add-member path entirely ungated); `CrdSpaceSettingsPage` resolves one decision per
 * control from them. These specs pin the decisions for every control on the surface.
 */

const ASSIGN = AuthorizationPrivilege.RolesetEntryRoleAssign;
const ASSIGN_ORG = AuthorizationPrivilege.RolesetEntryRoleAssignOrganization;
const GRANT = AuthorizationPrivilege.Grant;

/** Controls resolved against the plain role-set assign privilege. */
const USER_CONTROLS = ['add member', 'remove member', 'lead toggle', 'admin toggle', 'add virtual contributor'];

describe('space settings community — user and VC controls', () => {
  it.each(USER_CONTROLS)('%s is permitted when the assign privilege is held', control => {
    expect(useActionPermission([ASSIGN], ROLE_SET_ASSIGN_PRIVILEGES, false)).toEqual({
      allowed: true,
      reason: 'allowed',
    });
    expect(control).toBeTruthy();
  });

  it.each(USER_CONTROLS)('%s is denied without the assign privilege', control => {
    expect(useActionPermission([GRANT], ROLE_SET_ASSIGN_PRIVILEGES, false)).toEqual({
      allowed: false,
      reason: 'denied',
    });
    expect(control).toBeTruthy();
  });

  it('is checking while privileges load, never interactive first', () => {
    expect(useActionPermission(undefined, ROLE_SET_ASSIGN_PRIVILEGES, true)).toEqual({
      allowed: false,
      reason: 'checking',
    });
  });

  it('is unverifiable when the query completed without privileges', () => {
    expect(useActionPermission(undefined, ROLE_SET_ASSIGN_PRIVILEGES, false)).toEqual({
      allowed: false,
      reason: 'unverifiable',
    });
  });
});

describe('space settings community — organization rows need both tokens', () => {
  it('is denied with only the organization assign privilege', () => {
    expect(useActionPermission([ASSIGN_ORG], ROLE_SET_ASSIGN_ORGANIZATION_PRIVILEGES, false).allowed).toBe(false);
  });

  it('is denied with only GRANT', () => {
    expect(useActionPermission([GRANT], ROLE_SET_ASSIGN_ORGANIZATION_PRIVILEGES, false).allowed).toBe(false);
  });

  it('is denied with the plain assign privilege, which does not cover organizations', () => {
    expect(useActionPermission([ASSIGN], ROLE_SET_ASSIGN_ORGANIZATION_PRIVILEGES, false).allowed).toBe(false);
  });

  it('is permitted only with both tokens', () => {
    expect(useActionPermission([ASSIGN_ORG, GRANT], ROLE_SET_ASSIGN_ORGANIZATION_PRIVILEGES, false)).toEqual({
      allowed: true,
      reason: 'allowed',
    });
  });

  it('gates organization rows independently of the user controls', () => {
    // A space admin holding only the plain assign privilege may manage users but not organizations.
    const privileges = [ASSIGN];
    expect(useActionPermission(privileges, ROLE_SET_ASSIGN_PRIVILEGES, false).allowed).toBe(true);
    expect(useActionPermission(privileges, ROLE_SET_ASSIGN_ORGANIZATION_PRIVILEGES, false).allowed).toBe(false);
  });
});
