import { useState } from 'react';
import {
  useDeleteSpaceMutation,
  useSpacePrivilegesQuery,
  useSpaceSettingsQuery,
  useUpdateSpaceSettingsMutation,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  type CommunityMembershipPolicy,
  type SpacePrivacyMode,
} from '@/core/apollo/generated/graphql-schema';
import type {
  AllowedActionKey,
  AllowedActionToggle,
  MembershipPolicy,
  SpacePrivacy,
} from '@/crd/components/space/settings/SpaceSettingsSettingsView';
import { defaultSpaceSettings } from '@/domain/spaceAdmin/SpaceAdminSettings/SpaceDefaultSettings';
import {
  mapAllowedActions,
  mapMembershipPolicy,
  mapMembershipPolicyToBackend,
  mapPrivacy,
  mapPrivacyToBackend,
} from './settingsMapper';

export type UseSettingsTabDataResult = {
  privacy: SpacePrivacy;
  membershipPolicy: MembershipPolicy;
  allowedActions: AllowedActionToggle[];
  hostOrganizationTrusted: boolean;
  providerDisplayName: string;
  roleSetId: string | undefined;
  canDeleteSpace: boolean;
  loading: boolean;
  updatingKeys: ReadonlySet<string>;
  onPrivacyChange: (next: SpacePrivacy) => void;
  onMembershipPolicyChange: (next: MembershipPolicy) => void;
  onToggleAllowedAction: (key: AllowedActionKey, next: boolean) => void;
  onHostOrgTrustChange: (next: boolean) => void;
  onDeleteSpace: () => void;
  pendingDeleteSpace: boolean;
  confirmDeleteSpace: () => void;
  cancelDeleteSpace: () => void;
};

export function useSettingsTabData(spaceId: string): UseSettingsTabDataResult {
  const { data, loading } = useSpaceSettingsQuery({
    variables: { spaceId },
    skip: !spaceId,
  });

  const { data: privData } = useSpacePrivilegesQuery({
    variables: { spaceId },
    skip: !spaceId,
  });

  const settings = data?.lookup.space?.settings;
  const provider = data?.lookup.space?.about.provider;
  const hostId = provider?.id;
  const providerDisplayName = provider?.profile?.displayName ?? '';
  const roleSetId = data?.lookup.space?.about.membership?.roleSetID;

  const hostOrganizationTrusted = (!!hostId && settings?.membership?.trustedOrganizations?.includes(hostId)) ?? false;

  const privileges = privData?.lookup.space?.authorization?.myPrivileges ?? [];
  const canDeleteSpace = privileges.includes(AuthorizationPrivilege.Delete);

  const [updateSpaceSettings] = useUpdateSpaceSettingsMutation();
  const [deleteSpace] = useDeleteSpaceMutation();
  const [pendingDeleteSpace, setPendingDeleteSpace] = useState(false);
  const [updatingKeys, setUpdatingKeys] = useState<Set<string>>(new Set());

  const privacy = mapPrivacy(settings?.privacy);
  const membershipPolicy = mapMembershipPolicy(settings?.membership);
  const allowedActions = mapAllowedActions(settings?.collaboration, settings?.membership, settings?.privacy);

  const buildFullSettings = (overrides: {
    privacyMode?: SpacePrivacyMode;
    membershipPolicy?: CommunityMembershipPolicy;
    allowSubspaceAdminsToInviteMembers?: boolean;
    allowPlatformSupportAsAdmin?: boolean;
    collaboration?: Record<string, boolean>;
    hostOrganizationTrusted?: boolean;
  }) => {
    // Compute trustedOrganizations based on toggle
    const trustedOrganizations = [...(settings?.membership?.trustedOrganizations ?? [])];
    if (overrides.hostOrganizationTrusted !== undefined && hostId) {
      if (overrides.hostOrganizationTrusted && !trustedOrganizations.includes(hostId)) {
        trustedOrganizations.push(hostId);
      } else if (!overrides.hostOrganizationTrusted) {
        const idx = trustedOrganizations.indexOf(hostId);
        if (idx >= 0) trustedOrganizations.splice(idx, 1);
      }
    }

    return {
      privacy: {
        mode: overrides.privacyMode ?? settings?.privacy?.mode ?? defaultSpaceSettings.privacy.mode,
        allowPlatformSupportAsAdmin:
          overrides.allowPlatformSupportAsAdmin ??
          settings?.privacy?.allowPlatformSupportAsAdmin ??
          defaultSpaceSettings.privacy.allowPlatformSupportAsAdmin,
      },
      membership: {
        policy: overrides.membershipPolicy ?? settings?.membership?.policy ?? defaultSpaceSettings.membership.policy,
        trustedOrganizations,
        allowSubspaceAdminsToInviteMembers:
          overrides.allowSubspaceAdminsToInviteMembers ??
          settings?.membership?.allowSubspaceAdminsToInviteMembers ??
          defaultSpaceSettings.membership.allowSubspaceAdminsToInviteMembers,
      },
      collaboration: {
        allowMembersToCreateCallouts:
          settings?.collaboration?.allowMembersToCreateCallouts ??
          defaultSpaceSettings.collaboration.allowMembersToCreateCallouts,
        allowMembersToCreateSubspaces:
          settings?.collaboration?.allowMembersToCreateSubspaces ??
          defaultSpaceSettings.collaboration.allowMembersToCreateSubspaces,
        inheritMembershipRights:
          settings?.collaboration?.inheritMembershipRights ??
          defaultSpaceSettings.collaboration.inheritMembershipRights,
        allowEventsFromSubspaces:
          settings?.collaboration?.allowEventsFromSubspaces ??
          defaultSpaceSettings.collaboration.allowEventsFromSubspaces,
        allowMembersToVideoCall:
          settings?.collaboration?.allowMembersToVideoCall ??
          defaultSpaceSettings.collaboration.allowMembersToVideoCall,
        allowGuestContributions:
          settings?.collaboration?.allowGuestContributions ??
          defaultSpaceSettings.collaboration.allowGuestContributions,
        ...overrides.collaboration,
      },
      layout: {
        calloutDescriptionDisplayMode:
          settings?.layout?.calloutDescriptionDisplayMode ?? defaultSpaceSettings.layout.calloutDescriptionDisplayMode,
      },
    };
  };

  const addKey = (k: string) => setUpdatingKeys(prev => new Set(prev).add(k));
  const removeKey = (k: string) =>
    setUpdatingKeys(prev => {
      const next = new Set(prev);
      next.delete(k);
      return next;
    });
  const hasPrefix = (prefix: string) => [...updatingKeys].some(k => k.startsWith(prefix));

  const onPrivacyChange = (next: SpacePrivacy) => {
    if (next === privacy || hasPrefix('privacy:')) return;
    const key = `privacy:${next}`;
    addKey(key);
    updateSpaceSettings({
      variables: {
        settingsData: {
          spaceID: spaceId,
          settings: buildFullSettings({ privacyMode: mapPrivacyToBackend(next) }),
        },
      },
    }).finally(() => removeKey(key));
  };

  const onMembershipPolicyChange = (next: MembershipPolicy) => {
    if (next === membershipPolicy || hasPrefix('membership:')) return;
    const key = `membership:${next}`;
    addKey(key);
    updateSpaceSettings({
      variables: {
        settingsData: {
          spaceID: spaceId,
          settings: buildFullSettings({ membershipPolicy: mapMembershipPolicyToBackend(next) }),
        },
      },
    }).finally(() => removeKey(key));
  };

  const onHostOrgTrustChange = (next: boolean) => {
    const key = 'membership:hostTrust';
    if (updatingKeys.has(key)) return;
    addKey(key);
    updateSpaceSettings({
      variables: {
        settingsData: {
          spaceID: spaceId,
          settings: buildFullSettings({ hostOrganizationTrusted: next }),
        },
      },
    }).finally(() => removeKey(key));
  };

  const onToggleAllowedAction = (key: AllowedActionKey, next: boolean) => {
    const actionKey = `action:${key}`;
    if (updatingKeys.has(actionKey)) return;
    addKey(actionKey);

    let settingsPayload: ReturnType<typeof buildFullSettings>;
    switch (key) {
      case 'alkemioSupportAccess':
        settingsPayload = buildFullSettings({ allowPlatformSupportAsAdmin: next });
        break;
      case 'subspaceAdminInvitations':
        settingsPayload = buildFullSettings({ allowSubspaceAdminsToInviteMembers: next });
        break;
      default: {
        const collaborationKeyMap: Record<string, string> = {
          memberCreatePosts: 'allowMembersToCreateCallouts',
          videoCalls: 'allowMembersToVideoCall',
          guestContributions: 'allowGuestContributions',
          memberCreateSubspaces: 'allowMembersToCreateSubspaces',
          subspaceEvents: 'allowEventsFromSubspaces',
        };
        const backendKey = collaborationKeyMap[key];
        if (!backendKey) {
          removeKey(actionKey);
          return;
        }
        settingsPayload = buildFullSettings({ collaboration: { [backendKey]: next } });
      }
    }

    updateSpaceSettings({
      variables: {
        settingsData: { spaceID: spaceId, settings: settingsPayload },
      },
    }).finally(() => removeKey(actionKey));
  };

  const onDeleteSpace = () => setPendingDeleteSpace(true);
  const confirmDeleteSpace = () => {
    void deleteSpace({ variables: { spaceId } });
    setPendingDeleteSpace(false);
  };
  const cancelDeleteSpace = () => setPendingDeleteSpace(false);

  return {
    privacy,
    membershipPolicy,
    allowedActions,
    hostOrganizationTrusted,
    providerDisplayName,
    roleSetId,
    canDeleteSpace,
    loading,
    updatingKeys,
    onPrivacyChange,
    onMembershipPolicyChange,
    onToggleAllowedAction,
    onHostOrgTrustChange,
    onDeleteSpace,
    pendingDeleteSpace,
    confirmDeleteSpace,
    cancelDeleteSpace,
  };
}
