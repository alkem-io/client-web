import { describe, expect, it } from 'vitest';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import { mapRoleLimitError, mapUsersInRolesToAssociateRows, type UsersInRoleLike } from './orgAssociatesMapper';

const user = (id: string, displayName: string) => ({ id, profile: { displayName } });

describe('mapUsersInRolesToAssociateRows (062, T005)', () => {
  it('unions associates, admins and owners into one row per user with a badge flag each', () => {
    const usersInRoles: UsersInRoleLike[] = [
      { role: RoleName.Associate, users: [user('u1', 'Ada'), user('u2', 'Bob')] },
      { role: RoleName.Admin, users: [user('u2', 'Bob')] },
      { role: RoleName.Owner, users: [user('u3', 'Cleo')] },
    ];
    const rows = mapUsersInRolesToAssociateRows(usersInRoles, RoleName.Associate, RoleName.Admin, RoleName.Owner);

    expect(rows).toHaveLength(3);
    const bob = rows.find(r => r.id === 'u2');
    expect(bob).toMatchObject({ isAssociate: true, isAdmin: true, isOwner: false });

    // An admin who does not hold the entry role (F7) is still visible — not just an
    // associates-only list, which would make them invisible and un-demotable.
    const cleo = rows.find(r => r.id === 'u3');
    expect(cleo).toMatchObject({ isAssociate: false, isAdmin: false, isOwner: true });
  });

  it('sorts rows by display name', () => {
    const usersInRoles: UsersInRoleLike[] = [
      { role: RoleName.Associate, users: [user('u1', 'Zeta'), user('u2', 'Alpha')] },
    ];
    const rows = mapUsersInRolesToAssociateRows(usersInRoles, RoleName.Associate, RoleName.Admin, RoleName.Owner);
    expect(rows.map(r => r.displayName)).toEqual(['Alpha', 'Zeta']);
  });
});

describe('mapRoleLimitError (062, T005)', () => {
  it('maps the Admin max-limit message', () => {
    expect(mapRoleLimitError("Max limit of Users reached for role 'ADMIN': 6, cannot assign new Users.")).toBe(
      'limitAdmin'
    );
  });

  it('maps the Owner max-limit message', () => {
    expect(mapRoleLimitError("Max limit of Users reached for role 'OWNER': 3, cannot assign new Users.")).toBe(
      'limitOwner'
    );
  });

  it('maps the Owner min-limit message', () => {
    expect(mapRoleLimitError("Min limit of Users reached for role 'OWNER': 1, cannot remove Users.")).toBe('minOwner');
  });

  it('returns undefined for an unrelated message', () => {
    expect(mapRoleLimitError('Some other server error')).toBeUndefined();
    expect(mapRoleLimitError(undefined)).toBeUndefined();
  });
});
