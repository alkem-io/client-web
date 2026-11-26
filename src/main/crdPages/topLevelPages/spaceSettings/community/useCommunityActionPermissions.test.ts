import { describe, expect, it } from 'vitest';
import type { CommunityGates } from '@/domain/spaceAdmin/SpaceAdminCommunity/hooks/useCommunityAdmin';
import useCommunityActionPermissions from './useCommunityActionPermissions';

/**
 * Space Community settings gating. `useCommunityTabData` forwards the native verdicts
 * (`SpaceCan.manageMembers`, `SpaceCan.invite`, the add-VC picker verdict); this hook resolves
 * one decision per control from them and `CrdSpaceSettingsPage` renders each decision as a
 * tooltip. These specs pin which verdict gates which control.
 */

const gates = (overrides: Partial<CommunityGates> = {}): CommunityGates => ({
  invite: false,
  manageMembers: false,
  loading: false,
  virtualContributorPicker: false,
  virtualContributorPickerLoading: false,
  ...overrides,
});

/** What a space admin is served: GRANT (manageMembers) and INVITE, and an admitted picker. */
const SPACE_ADMIN = gates({ invite: true, manageMembers: true, virtualContributorPicker: true });

describe('space community settings — role changes are gated by SpaceCan.manageMembers', () => {
  it('permits the lead toggle, the admin toggle and remove-from-space', () => {
    expect(useCommunityActionPermissions(SPACE_ADMIN).userRoleChange).toEqual({ allowed: true, reason: 'allowed' });
  });

  it('permits both directions of the organization lead toggle and removing an organization', () => {
    const permissions = useCommunityActionPermissions(SPACE_ADMIN);

    expect(permissions.organizationLeadAssign).toEqual({ allowed: true, reason: 'allowed' });
    expect(permissions.organizationRemove).toEqual({ allowed: true, reason: 'allowed' });
  });

  it('denies the role controls without manageMembers, whatever else is granted', () => {
    const permissions = useCommunityActionPermissions(gates({ invite: true, virtualContributorPicker: true }));

    expect(permissions.userRoleChange).toEqual({ allowed: false, reason: 'denied' });
    expect(permissions.organizationLeadAssign).toEqual({ allowed: false, reason: 'denied' });
    expect(permissions.organizationRemove).toEqual({ allowed: false, reason: 'denied' });
    expect(permissions.invite).toEqual({ allowed: true, reason: 'allowed' });
  });
});

describe('space community settings — invite is gated by SpaceCan.invite', () => {
  it('denies invite without the INVITE verdict even for a GRANT holder', () => {
    expect(useCommunityActionPermissions(gates({ manageMembers: true })).invite).toEqual({
      allowed: false,
      reason: 'denied',
    });
  });
});

describe('space community settings — the add-VC controls follow the picker verdict', () => {
  it('is permitted when the server admits the DIRECT directory', () => {
    expect(useCommunityActionPermissions(gates({ virtualContributorPicker: true })).addVirtualContributor).toEqual({
      allowed: true,
      reason: 'allowed',
    });
  });

  it('is denied when the server refuses it, even for a manageMembers holder', () => {
    expect(useCommunityActionPermissions(gates({ manageMembers: true })).addVirtualContributor).toEqual({
      allowed: false,
      reason: 'denied',
    });
  });

  it('is checking while only the picker verdict loads', () => {
    const permissions = useCommunityActionPermissions({ ...SPACE_ADMIN, virtualContributorPickerLoading: true });

    expect(permissions.addVirtualContributor).toEqual({ allowed: false, reason: 'checking' });
    expect(permissions.userRoleChange).toEqual({ allowed: true, reason: 'allowed' });
  });
});

describe('space community settings — non-affirmative verdicts fail closed', () => {
  it('denies every control to a viewer without verdicts', () => {
    const permissions = useCommunityActionPermissions(gates());

    expect(Object.values(permissions).every(permission => permission.reason === 'denied')).toBe(true);
  });

  it('is checking while the verdicts load, never interactive first', () => {
    const permissions = useCommunityActionPermissions(
      gates({ invite: undefined, manageMembers: undefined, loading: true, virtualContributorPickerLoading: true })
    );

    expect(Object.values(permissions).every(permission => permission.reason === 'checking')).toBe(true);
  });

  it('is unverifiable when a read completed without a verdict', () => {
    const permissions = useCommunityActionPermissions(
      gates({ invite: undefined, manageMembers: undefined, virtualContributorPicker: undefined })
    );

    expect(Object.values(permissions).every(permission => permission.reason === 'unverifiable')).toBe(true);
  });
});
