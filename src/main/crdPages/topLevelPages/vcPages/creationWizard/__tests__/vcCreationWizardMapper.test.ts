import { describe, expect, it } from 'vitest';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import { hasReadPrivilege, type MappableSpace, mapSpaceToSelectable } from '../vcCreationWizardMapper';

describe('hasReadPrivilege', () => {
  it('is true only when the Read privilege is present', () => {
    expect(hasReadPrivilege({ authorization: { myPrivileges: [AuthorizationPrivilege.Read] } })).toBe(true);
    expect(hasReadPrivilege({ authorization: { myPrivileges: [AuthorizationPrivilege.Update] } })).toBe(false);
    expect(hasReadPrivilege({ authorization: {} })).toBe(false);
    expect(hasReadPrivilege({})).toBe(false);
  });
});

describe('mapSpaceToSelectable', () => {
  const space: MappableSpace = {
    id: 'space-1',
    about: { profile: { displayName: 'My Space', avatar: { uri: 'https://x/a.png' } } },
    subspaces: [{ id: 'sub-1', about: { profile: { displayName: 'Sub' } } }],
  };

  it('maps identity, deterministic color, level and nested subspaces', () => {
    const result = mapSpaceToSelectable(space, 'space');
    expect(result.id).toBe('space-1');
    expect(result.displayName).toBe('My Space');
    expect(result.avatarUrl).toBe('https://x/a.png');
    expect(result.color).toBe(pickColorFromId('space-1'));
    expect(result.level).toBe('space');
    expect(result.subspaces).toHaveLength(1);
    expect(result.subspaces?.[0]).toMatchObject({ id: 'sub-1', displayName: 'Sub', level: 'subspace' });
  });

  it('leaves avatarUrl undefined when absent', () => {
    expect(mapSpaceToSelectable({ id: 'x' }, 'space').avatarUrl).toBeUndefined();
  });
});
