import { useState } from 'react';
import { NotFoundError } from '@/core/40XErrorHandler/40XErrors';
import {
  useSpaceSettingsSetAudienceMutation,
  useSpaceSettingsSetTrustedOrganizationsMutation,
  useSpaceSettingsSettingsQuery,
  useSpaceSettingsUpdateSettingsMutation,
} from '@/core/apollo/generated-v2/apollo-hooks';
import type { SpaceSettingsSettingsQuery } from '@/core/apollo/generated-v2/graphql-schema';
import type {
  AllowedActionKey,
  AllowedActionToggle,
  MembershipPolicy,
  SpacePrivacy,
  UserInfoVisibility,
} from '@/crd/components/space/settings/SpaceSettingsSettingsView';
import { errorMessage, type TabUnsavedChanges } from '@/main/crdPages/utils/tabUnsavedChanges';
import {
  allowedActionsToSettings,
  mapAllowedActions,
  mapMembershipPolicy,
  mapMembershipPolicyToSettings,
  mapPrivacy,
  mapPrivacyToAudience,
  mapUserInfoVisibility,
  mapUserInfoVisibilityToSettings,
  type NativeSpaceSettings,
} from './settingsMapper';

type SettingsSpace = Extract<NonNullable<SpaceSettingsSettingsQuery['node']>, { __typename?: 'Space' }>;

/** The trusted organizations are the space's `trusted_org` references (canonical-mechanisms M25). */
const TRUSTED_ORG_ROLE = 'trusted_org';

/** Buffered (unsaved) Settings values — a key is present only while it differs from the server. */
type SettingsDraft = {
  privacy?: SpacePrivacy;
  userInfoVisibility?: UserInfoVisibility;
  membershipPolicy?: MembershipPolicy;
  hostOrganizationTrusted?: boolean;
  allowedActions?: Partial<Record<AllowedActionKey, boolean>>;
};

export type UseSettingsTabDataResult = {
  /** Displayed values — the buffered value where one exists, else the server value (none for REGISTERED). */
  privacy: SpacePrivacy | undefined;
  userInfoVisibility: UserInfoVisibility;
  membershipPolicy: MembershipPolicy;
  allowedActions: AllowedActionToggle[];
  hostOrganizationTrusted: boolean;
  /** Trusting the host only makes sense when the space is hosted by an organization, not a user. */
  hostIsOrganization: boolean;
  providerDisplayName: string;
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
  const {
    data,
    loading,
    error: queryError,
  } = useSpaceSettingsSettingsQuery({
    variables: { id: spaceId },
    skip: !spaceId,
  });
  if (spaceId && queryError) throw queryError;
  if (spaceId && data && !loading && !data.node) throw new NotFoundError();

  const space =
    data?.node?.id === spaceId && data.node.entityType === 'space' ? (data.node as SettingsSpace) : undefined;
  const settings = (space?.settings ?? {}) as NativeSpaceSettings;
  const host = space?.host;
  const hostId = host?.id;
  const hostIsOrganization = host?.actorType === 'organization';
  const providerDisplayName = host?.about?.displayName ?? '';

  // Every trust link is kept, the non-host ones included (H-space-v2); setReferences replaces the ordered list.
  const trustedOrganizationIds = (space?.curated ?? [])
    .filter(item => item.role === TRUSTED_ORG_ROLE)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(item => item.node.id);
  const hostOrganizationTrusted = !!hostId && trustedOrganizationIds.includes(hostId);

  const [updateSettings] = useSpaceSettingsUpdateSettingsMutation();
  const [setAudience] = useSpaceSettingsSetAudienceMutation();
  const [setTrustedOrganizations] = useSpaceSettingsSetTrustedOrganizationsMutation();
  const [draft, setDraft] = useState<SettingsDraft>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const serverPrivacy = mapPrivacy(space?.audience);
  const serverUserInfoVisibility = mapUserInfoVisibility(settings.user_information_visibility);
  const serverMembershipPolicy = mapMembershipPolicy(settings.membership_policy);
  const serverAllowedActions = mapAllowedActions(settings);

  const privacy = draft.privacy ?? serverPrivacy;
  const userInfoVisibility = draft.userInfoVisibility ?? serverUserInfoVisibility;
  const membershipPolicy = draft.membershipPolicy ?? serverMembershipPolicy;
  const allowedActions = serverAllowedActions.map(action => ({
    ...action,
    enabled: draft.allowedActions?.[action.key] ?? action.enabled,
  }));
  const displayedHostOrganizationTrusted = draft.hostOrganizationTrusted ?? hostOrganizationTrusted;

  // Each setter keeps a key in the draft only while it differs from the server, so
  // flipping a control back to its saved value drops it from the count (FR-025b).
  const setField = <K extends Exclude<keyof SettingsDraft, 'allowedActions'>>(
    key: K,
    next: NonNullable<SettingsDraft[K]>,
    // undefined when the server value has no option here (a REGISTERED audience): any pick is then a change.
    serverValue: SettingsDraft[K]
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
    setSaving(true);
    setError(null);
    // Only the changed values are written, each through the intent that owns it: the settings keys in one
    // updateSpace, privacy through setSpaceAudience, the trust list through setReferences (screens-dispositions.tsv:19534).
    const settingsPatch: NativeSpaceSettings = allowedActionsToSettings(draft.allowedActions ?? {}, settings);
    if (draft.userInfoVisibility !== undefined) {
      settingsPatch.user_information_visibility = mapUserInfoVisibilityToSettings(draft.userInfoVisibility);
    }
    if (draft.membershipPolicy !== undefined) {
      settingsPatch.membership_policy = mapMembershipPolicyToSettings(draft.membershipPolicy);
    }
    const saved: SettingsDraft = {};
    const errors: string[] = [];
    const run = async (write: () => Promise<unknown>, onSaved: () => void) => {
      try {
        await write();
        onSaved();
      } catch (err) {
        errors.push(errorMessage(err));
      }
    };
    if (Object.keys(settingsPatch).length > 0) {
      await run(
        () => updateSettings({ variables: { id: spaceId, settings: settingsPatch } }),
        () => {
          saved.allowedActions = draft.allowedActions;
          saved.userInfoVisibility = draft.userInfoVisibility;
          saved.membershipPolicy = draft.membershipPolicy;
        }
      );
    }
    if (draft.privacy !== undefined) {
      const nextPrivacy = draft.privacy;
      await run(
        () => setAudience({ variables: { id: spaceId, audience: mapPrivacyToAudience(nextPrivacy) } }),
        () => {
          saved.privacy = nextPrivacy;
        }
      );
    }
    if (draft.hostOrganizationTrusted !== undefined && hostId) {
      const trust = draft.hostOrganizationTrusted;
      const targets = trust
        ? [...trustedOrganizationIds.filter(id => id !== hostId), hostId]
        : trustedOrganizationIds.filter(id => id !== hostId);
      await run(
        () =>
          // The space's whole curated list comes back with the write and replaces the cached one.
          setTrustedOrganizations({ variables: { owner: spaceId, targets } }),
        () => {
          saved.hostOrganizationTrusted = trust;
        }
      );
    }
    // What was written leaves the buffer; what failed stays counted so Save retries it.
    setDraft(prev => {
      const next: SettingsDraft = { ...prev };
      for (const key of Object.keys(saved) as (keyof SettingsDraft)[]) {
        if (saved[key] !== undefined) delete next[key];
      }
      return next;
    });
    setSaving(false);
    setError(errors[0] ?? null);
    return errors.length === 0;
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
    hostIsOrganization,
    providerDisplayName,
    loading,
    onPrivacyChange,
    onUserInfoVisibilityChange,
    onMembershipPolicyChange,
    onToggleAllowedAction,
    onHostOrgTrustChange,
    unsaved: { count, canSave: true, saving, error, saveAll, reset },
  };
}
