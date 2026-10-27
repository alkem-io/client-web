import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ActorType,
  CommunityMembershipPolicy,
  SpacePrivacyMode,
  UserInformationVisibility,
} from '@/core/apollo/generated/graphql-schema';
import { useSettingsTabData } from './useSettingsTabData';

const updateSpaceSettings = vi.fn();
const host = vi.hoisted(() => ({ type: 'organization' as string }));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useSpaceSettingsQuery: () => ({
    loading: false,
    data: {
      lookup: {
        space: {
          about: {
            provider: { id: 'host-1', type: host.type, profile: { displayName: 'Host Org' } },
            membership: { roleSetID: 'rs' },
          },
          settings: {
            privacy: {
              mode: SpacePrivacyMode.Public,
              allowPlatformSupportAsAdmin: false,
              userInformationVisibility: UserInformationVisibility.FollowSpaceVisibility,
            },
            membership: {
              policy: CommunityMembershipPolicy.Applications,
              trustedOrganizations: [],
              allowSubspaceAdminsToInviteMembers: false,
            },
            collaboration: {
              allowMembersToCreateCallouts: true,
              allowMembersToCreateSubspaces: false,
              inheritMembershipRights: false,
              allowEventsFromSubspaces: false,
              allowMembersToVideoCall: false,
              allowGuestContributions: false,
            },
            layout: { calloutDescriptionDisplayMode: 'EXPANDED' },
          },
        },
      },
    },
  }),
  useUpdateSpaceSettingsMutation: () => [updateSpaceSettings],
}));

describe('useSettingsTabData — buffered through the unsaved-changes bar (spec 045 FR-023)', () => {
  beforeEach(() => {
    updateSpaceSettings.mockReset();
    host.type = ActorType.Organization;
  });

  it.each([
    [ActorType.Organization, true],
    [ActorType.User, false],
  ])('flags whether the host is an organization (host %s → %s) so Trusted applicants shows only then', (type, expected) => {
    host.type = type;
    const { result } = renderHook(() => useSettingsTabData('space-1'));
    expect(result.current.hostIsOrganization).toBe(expected);
  });

  it('shows a change at once, sends nothing, and counts one per control', () => {
    const { result } = renderHook(() => useSettingsTabData('space-1'));
    act(() => result.current.onPrivacyChange('private'));
    act(() => result.current.onToggleAllowedAction('videoCalls', true));
    act(() => result.current.onHostOrgTrustChange(true));

    expect(result.current.privacy).toBe('private');
    expect(result.current.allowedActions.find(a => a.key === 'videoCalls')?.enabled).toBe(true);
    expect(result.current.hostOrganizationTrusted).toBe(true);
    expect(result.current.unsaved.count).toBe(3);
    expect(updateSpaceSettings).not.toHaveBeenCalled();
  });

  it('drops a control from the count when it is put back', () => {
    const { result } = renderHook(() => useSettingsTabData('space-1'));
    act(() => result.current.onMembershipPolicyChange('open'));
    act(() => result.current.onMembershipPolicyChange('application'));
    act(() => result.current.onToggleAllowedAction('memberCreatePosts', false));
    act(() => result.current.onToggleAllowedAction('memberCreatePosts', true));
    expect(result.current.unsaved.count).toBe(0);
  });

  it('saves every change in one updateSpaceSettings call carrying the full settings', async () => {
    updateSpaceSettings.mockResolvedValue({});
    const { result } = renderHook(() => useSettingsTabData('space-1'));
    act(() => result.current.onPrivacyChange('private'));
    act(() => result.current.onToggleAllowedAction('videoCalls', true));
    act(() => result.current.onToggleAllowedAction('alkemioSupportAccess', true));
    act(() => result.current.onHostOrgTrustChange(true));

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.unsaved.saveAll();
    });

    expect(ok).toBe(true);
    expect(updateSpaceSettings).toHaveBeenCalledTimes(1);
    const { settings } = updateSpaceSettings.mock.calls[0][0].variables.settingsData;
    expect(settings.privacy).toMatchObject({ mode: SpacePrivacyMode.Private, allowPlatformSupportAsAdmin: true });
    expect(settings.membership).toMatchObject({
      policy: CommunityMembershipPolicy.Applications,
      trustedOrganizations: ['host-1'],
    });
    expect(settings.collaboration).toMatchObject({ allowMembersToVideoCall: true, allowMembersToCreateCallouts: true });
    expect(result.current.unsaved.count).toBe(0);
  });

  it('keeps the changes counted and reports the error when the save fails', async () => {
    updateSpaceSettings.mockImplementation(async () => {
      throw new Error('Forbidden');
    });
    const { result } = renderHook(() => useSettingsTabData('space-1'));
    act(() => result.current.onPrivacyChange('private'));

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.unsaved.saveAll();
    });

    expect(ok).toBe(false);
    expect(result.current.unsaved.error).toBe('Forbidden');
    expect(result.current.unsaved.count).toBe(1);
    expect(result.current.privacy).toBe('private');
  });

  it('reset puts every control back to the server value', () => {
    const { result } = renderHook(() => useSettingsTabData('space-1'));
    act(() => result.current.onPrivacyChange('private'));
    act(() => result.current.unsaved.reset());
    expect(result.current.privacy).toBe('public');
    expect(result.current.unsaved.count).toBe(0);
  });
});
