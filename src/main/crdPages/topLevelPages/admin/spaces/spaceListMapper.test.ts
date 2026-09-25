import { describe, expect, it } from 'vitest';
import { SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import { mapSpaceToRow } from './spaceListMapper';

const space = (myPrivileges: string[]) => ({
  id: 's1',
  nameID: 's1',
  visibility: SpaceVisibility.Active,
  about: {
    profile: { displayName: 'Alpha', url: '/space/alpha' },
    provider: null,
  },
  authorization: { myPrivileges },
});

describe('mapSpaceToRow — client-8 privilege gating', () => {
  it('withholds canEditPlatformSettings on Update alone', () => {
    expect(mapSpaceToRow(space(['UPDATE']) as never).canEditPlatformSettings).toBe(false);
  });

  it('grants canEditPlatformSettings on AccountLicenseManage', () => {
    expect(mapSpaceToRow(space(['ACCOUNT_LICENSE_MANAGE']) as never).canEditPlatformSettings).toBe(true);
  });

  it('grants canDelete on PlatformContentFullAccess', () => {
    expect(mapSpaceToRow(space(['PLATFORM_CONTENT_FULL_ACCESS']) as never).canDelete).toBe(true);
  });

  it('grants canDelete on Delete', () => {
    expect(mapSpaceToRow(space(['DELETE']) as never).canDelete).toBe(true);
  });

  it('withholds canDelete without either', () => {
    expect(mapSpaceToRow(space(['READ']) as never).canDelete).toBe(false);
  });
});
