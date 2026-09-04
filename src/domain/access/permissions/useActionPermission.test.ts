import { describe, expect, it } from 'vitest';

import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import useActionPermission from './useActionPermission';

const ASSIGN = AuthorizationPrivilege.RolesetEntryRoleAssign;
const ASSIGN_ORG = AuthorizationPrivilege.RolesetEntryRoleAssignOrganization;
const GRANT = AuthorizationPrivilege.Grant;

describe('useActionPermission derivation', () => {
  // Row 1 — an empty `required` list outranks every other input, loading included.
  it.each([
    ['loading', undefined, true],
    ['not loading, privileges present', [ASSIGN], false],
    ['not loading, privileges undefined', undefined, false],
  ])('denies when required is empty (%s)', (_label, privileges, loading) => {
    expect(useActionPermission(privileges, [], loading)).toEqual({ allowed: false, reason: 'denied' });
  });

  // Row 2 — in-flight query.
  it.each([
    ['privileges undefined', undefined],
    ['privileges already present', [ASSIGN]],
  ])('reports checking while loading (%s)', (_label, privileges) => {
    expect(useActionPermission(privileges, [ASSIGN], true)).toEqual({ allowed: false, reason: 'checking' });
  });

  // Row 3 — query complete, response carried no privilege list (spec Edge Case 3).
  it('reports unverifiable when the query completed without privileges', () => {
    expect(useActionPermission(undefined, [ASSIGN], false)).toEqual({ allowed: false, reason: 'unverifiable' });
  });

  it('keeps checking and unverifiable distinct', () => {
    const whileLoading = useActionPermission(undefined, [ASSIGN], true);
    const afterLoading = useActionPermission(undefined, [ASSIGN], false);

    expect(whileLoading.reason).toBe('checking');
    expect(afterLoading.reason).toBe('unverifiable');
    expect(whileLoading.reason).not.toBe(afterLoading.reason);
  });

  // Row 4 — the ordinary denied / allowed pair.
  it('denies when the required privilege is absent', () => {
    expect(useActionPermission([GRANT], [ASSIGN], false)).toEqual({ allowed: false, reason: 'denied' });
  });

  it('allows when the required privilege is present', () => {
    expect(useActionPermission([ASSIGN, GRANT], [ASSIGN], false)).toEqual({ allowed: true, reason: 'allowed' });
  });

  it('denies on an empty privilege array', () => {
    expect(useActionPermission([], [ASSIGN], false)).toEqual({ allowed: false, reason: 'denied' });
  });

  // Multi-privilege case — space-settings organization rows need both tokens.
  it('requires every listed privilege, not just one', () => {
    expect(useActionPermission([ASSIGN_ORG], [ASSIGN_ORG, GRANT], false)).toEqual({
      allowed: false,
      reason: 'denied',
    });
    expect(useActionPermission([GRANT], [ASSIGN_ORG, GRANT], false)).toEqual({ allowed: false, reason: 'denied' });
    expect(useActionPermission([ASSIGN_ORG, GRANT], [ASSIGN_ORG, GRANT], false)).toEqual({
      allowed: true,
      reason: 'allowed',
    });
  });
});
