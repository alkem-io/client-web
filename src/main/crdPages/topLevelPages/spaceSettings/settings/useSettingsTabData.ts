import { useState } from 'react';
import { useSpaceSettingsQuery, useUpdateSpaceSettingsMutation } from '@/core/apollo/generated/apollo-hooks';
import type {
  CommunityMembershipPolicy,
  SpacePrivacyMode,
  UserInformationVisibility,
} from '@/core/apollo/generated/graphql-schema';
import type {
  AllowedActionKey,
  AllowedActionToggle,
  MembershipPolicy,
  SpacePrivacy,
  UserInfoVisibility,
} from '@/crd/components/space/settings/SpaceSettingsSettingsView';
import { defaultSpaceSettings } from '@/domain/spaceAdmin/SpaceAdminSettings/SpaceDefaultSettings';
import { errorMessage, type TabUnsavedChanges } from '@/main/crdPages/utils/tabUnsavedChanges';
import {
  mapAllowedActions,
  mapMembershipPolicy,
  mapMembershipPolicyToBackend,
  mapPrivacy,
  mapPrivacyToBackend,
  mapUserInfoVisibility,
  mapUserInfoVisibilityToBackend,
} from './settingsMapper';

/** Buffered (unsaved) Settings values — a key is present only while it differs from the server. */
type SettingsDraft = {
  privacy?: SpacePrivacy;
  userInfoVisibility?: UserInfoVisibility;
  membershipPolicy?: MembershipPolicy;
  hostOrganizationTrusted?: boolean;
  allowedActions?: Partial<Record<AllowedActionKey, boolean>>;
};

const COLLABORATION_KEY_MAP: Partial<Record<AllowedActionKey, string>> = {
  memberCreatePosts: 'allowMembersToCreateCallouts',
  videoCalls: 'allowMembersToVideoCall',
  guestContributions: 'allowGuestContributions',
  memberCreateSubspaces: 'allowMembersToCreateSubspaces',
  inheritMembershipRights: 'inheritMembershipRights',
  subspaceEvents: 'allowEventsFromSubspaces',
};

export type UseSettingsTabDataResult = {
  /** Displayed values — the buffered value where one exists, else the server value. */
  privacy: SpacePrivacy;
  userInfoVisibility: UserInfoVisibility;
  membershipPolicy: MembershipPolicy;
  allowedActions: AllowedActionToggle[];
  hostOrganizationTrusted: boolean;
  providerDisplayName: string;
  roleSetId: string | undefined;
  loading: boolean;
  onPrivacyChange: (next: SpacePrivacy) => void;
  onUserInfoVisibilityChange: (next: UserInfoVisibility) => void;
  onMembershipPolicyChange: (next: MembershipPolicy) => void;
  onToggleAllowedAction: (key: AllowedActionKey, next: boolean) => void;
  onHostOrgTrustChange: (next: boolean) => void;
  /** Every radio / toggle is buffered and saved together through the unsaved-changes bar (FR-023). */
  unsaved: TabUnsavedChanges;
};

export function useSettingsTabData(spaceId: string): UseSettingsTabDataResult {
  const { data, loading } = useSpaceSettingsQuery({
    variables: { spaceId },
    skip: !spaceId,
  });

  const settings = data?.lookup.space?.settings;
  const provider = data?.lookup.space?.about.provider;
  const hostId = provider?.id;
  const providerDisplayName = provider?.profile?.displayName ?? '';
  const roleSetId = data?.lookup.space?.about.membership?.roleSetID;

  const hostOrganizationTrusted = (!!hostId && settings?.membership?.trustedOrganizations?.includes(hostId)) ?? false;

  const [updateSpaceSettings] = useUpdateSpaceSettingsMutation();
  const [draft, setDraft] = useState<SettingsDraft>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const serverPrivacy = mapPrivacy(settings?.privacy);
  const serverUserInfoVisibility = mapUserInfoVisibility(settings?.privacy?.userInformationVisibility);
  const serverMembershipPolicy = mapMembershipPolicy(settings?.membership);
  const serverAllowedActions = mapAllowedActions(settings?.collaboration, settings?.membership, settings?.privacy);

  const privacy = draft.privacy ?? serverPrivacy;
  const userInfoVisibility = draft.userInfoVisibility ?? serverUserInfoVisibility;
  const membershipPolicy = draft.membershipPolicy ?? serverMembershipPolicy;
  const allowedActions = serverAllowedActions.map(action => ({
    ...action,
    enabled: draft.allowedActions?.[action.key] ?? action.enabled,
  }));
  const displayedHostOrganizationTrusted = draft.hostOrganizationTrusted ?? hostOrganizationTrusted;

  const buildFullSettings = (overrides: {
    privacyMode?: SpacePrivacyMode;
    userInformationVisibility?: UserInformationVisibility;
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
        // Preserve the existing user-info-visibility unless this change targets it
        // (feature 008). Omitting it would otherwise reset to the server default on
        // every other settings change.
        ...((overrides.userInformationVisibility ?? settings?.privacy?.userInformationVisibility)
          ? {
              userInformationVisibility:
                overrides.userInformationVisibility ?? settings?.privacy?.userInformationVisibility,
            }
          : {}),
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

  // Each setter keeps a key in the draft only while it differs from the server, so
  // flipping a control back to its saved value drops it from the count (FR-025b).
  const setField = <K extends Exclude<keyof SettingsDraft, 'allowedActions'>>(
    key: K,
    next: NonNullable<SettingsDraft[K]>,
    serverValue: NonNullable<SettingsDraft[K]>
  ) => {
    setError(null);
    setDraft(prev => {
      const updated: Partial<Record<keyof SettingsDraft, unknown>> = { ...prev };
      if (next === serverValue) delete updated[key];
      else updated[key] = next;
      return updated as SettingsDraft;
    });
  };

  const onPrivacyChange = (next: SpacePrivacy) => setField('privacy', next, serverPrivacy);
  const onUserInfoVisibilityChange = (next: UserInfoVisibility) =>
    setField('userInfoVisibility', next, serverUserInfoVisibility);
  const onMembershipPolicyChange = (next: MembershipPolicy) =>
    setField('membershipPolicy', next, serverMembershipPolicy);
  const onHostOrgTrustChange = (next: boolean) => setField('hostOrganizationTrusted', next, hostOrganizationTrusted);

  const onToggleAllowedAction = (key: AllowedActionKey, next: boolean) => {
    const serverValue = serverAllowedActions.find(action => action.key === key)?.enabled;
    setError(null);
    setDraft(prev => {
      const actions = { ...prev.allowedActions };
      if (next === serverValue) delete actions[key];
      else actions[key] = next;
      const { allowedActions: _previous, ...rest } = prev;
      return Object.keys(actions).length === 0 ? rest : { ...rest, allowedActions: actions };
    });
  };

  const count =
    (draft.privacy !== undefined ? 1 : 0) +
    (draft.userInfoVisibility !== undefined ? 1 : 0) +
    (draft.membershipPolicy !== undefined ? 1 : 0) +
    (draft.hostOrganizationTrusted !== undefined ? 1 : 0) +
    Object.keys(draft.allowedActions ?? {}).length;

  const saveAll = async (): Promise<boolean> => {
    if (count === 0) return true;
    const actions = draft.allowedActions ?? {};
    const collaboration: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(actions) as [AllowedActionKey, boolean][]) {
      const backendKey = COLLABORATION_KEY_MAP[key];
      if (backendKey) collaboration[backendKey] = value;
    }
    setSaving(true);
    setError(null);
    try {
      // The mutation takes the whole settings object, so every buffered change goes in one call.
      await updateSpaceSettings({
        variables: {
          settingsData: {
            spaceID: spaceId,
            settings: buildFullSettings({
              privacyMode: draft.privacy && mapPrivacyToBackend(draft.privacy),
              userInformationVisibility:
                draft.userInfoVisibility && mapUserInfoVisibilityToBackend(draft.userInfoVisibility),
              membershipPolicy: draft.membershipPolicy && mapMembershipPolicyToBackend(draft.membershipPolicy),
              allowPlatformSupportAsAdmin: actions.alkemioSupportAccess,
              allowSubspaceAdminsToInviteMembers: actions.subspaceAdminInvitations,
              collaboration,
              hostOrganizationTrusted: draft.hostOrganizationTrusted,
            }),
          },
        },
      });
      setDraft({});
      setSaving(false);
      return true;
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
      return false;
    }
  };

  const reset = () => {
    setDraft({});
    setError(null);
  };

  return {
    privacy,
    userInfoVisibility,
    membershipPolicy,
    allowedActions,
    hostOrganizationTrusted: displayedHostOrganizationTrusted,
    providerDisplayName,
    roleSetId,
    loading,
    onPrivacyChange,
    onUserInfoVisibilityChange,
    onMembershipPolicyChange,
    onToggleAllowedAction,
    onHostOrgTrustChange,
    unsaved: { count, canSave: true, saving, error, saveAll, reset },
  };
}
