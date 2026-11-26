import { Audience } from '@/core/apollo/generated-v2/graphql-schema';
import type {
  AllowedActionKey,
  AllowedActionToggle,
  MembershipPolicy,
  SpacePrivacy,
  UserInfoVisibility,
} from '@/crd/components/space/settings/SpaceSettingsSettingsView';

/**
 * `Space.settings` as served: the core.space_settings keys plus the space facts as flat fact-id keys
 * (S24-SPACE-SETTINGS-FACT-MAPPING; facts: schema.sql fact_type rows for `space`; keys: core.space_settings
 * value_schema). Only the keys this tab reads or writes are typed.
 */
export type NativeSpaceSettings = {
  allow_callouts?: boolean;
  allow_guests?: boolean;
  allow_platform_support_as_admin?: boolean;
  allow_subspaces?: boolean;
  inherit_membership?: boolean;
  membership_policy?: string;
  subspace_invites?: boolean;
  events_from_subspaces?: boolean;
  permissions?: { members_video_call?: boolean; inherit_audience?: boolean };
  user_information_visibility?: string;
};

/**
 * Legacy privacy.mode public/private ↔ Audience PUBLIC/RESTRICTED (proofs.md:254-255; canonical-mechanisms M41), plus the
 * signed FC-S4 option: readable to signed-in users only ↔ Audience REGISTERED.
 */
export function mapPrivacy(audience: Audience | null | undefined): SpacePrivacy | undefined {
  if (audience === Audience.Registered) return 'registered';
  return audience === Audience.Restricted ? 'private' : 'public';
}

export function mapPrivacyToAudience(privacy: SpacePrivacy): Audience {
  if (privacy === 'registered') return Audience.Registered;
  return privacy === 'private' ? Audience.Restricted : Audience.Public;
}

/** core.space_settings user_information_visibility: members | space (default space). */
export function mapUserInfoVisibility(value: string | undefined): UserInfoVisibility {
  return value === 'members' ? 'membersOnly' : 'followSpace';
}

export function mapUserInfoVisibilityToSettings(value: UserInfoVisibility): string {
  return value === 'membersOnly' ? 'members' : 'space';
}

/** The membership_policy fact: open | applications | invitations. */
export function mapMembershipPolicy(value: string | undefined): MembershipPolicy {
  switch (value) {
    case 'open':
      return 'open';
    case 'applications':
      return 'application';
    default:
      return 'invitation';
  }
}

export function mapMembershipPolicyToSettings(policy: MembershipPolicy): string {
  switch (policy) {
    case 'open':
      return 'open';
    case 'application':
      return 'applications';
    case 'invitation':
      return 'invitations';
  }
}

/**
 * Each Allowed Actions toggle and its one stored value (the host-trust toggle is the trusted_org reference list). The importer maps the legacy switches to exactly these keys
 * (cmd/importer/spaces/graph_source.sql:19-35).
 */
type StoredAllowedActionKey = Exclude<AllowedActionKey, 'trustHostOrganization'>;

const readAllowedAction: Record<StoredAllowedActionKey, (settings: NativeSpaceSettings) => boolean> = {
  memberCreatePosts: s => s.allow_callouts ?? false,
  // core.space_settings permissions.members_video_call, schema default false.
  videoCalls: s => s.permissions?.members_video_call ?? false,
  guestContributions: s => s.allow_guests ?? false,
  memberCreateSubspaces: s => s.allow_subspaces ?? false,
  inheritMembershipRights: s => s.inherit_membership ?? false,
  // core.space_settings events_from_subspaces, schema default true.
  subspaceEvents: s => s.events_from_subspaces ?? true,
  alkemioSupportAccess: s => s.allow_platform_support_as_admin ?? false,
  subspaceAdminInvitations: s => s.subspace_invites ?? false,
};

export function mapAllowedActions(settings: NativeSpaceSettings): AllowedActionToggle[] {
  // Order drives the on-screen order of the Allowed Actions grid — the view
  // filters this list by level but never re-sorts it.
  const order: StoredAllowedActionKey[] = [
    'memberCreatePosts',
    'videoCalls',
    'guestContributions',
    'memberCreateSubspaces',
    'inheritMembershipRights',
    'subspaceEvents',
    'alkemioSupportAccess',
    'subspaceAdminInvitations',
  ];
  return order.map(key => ({ key, enabled: readAllowedAction[key](settings) }));
}

/** The flat settings patch for the changed toggles; video calls live in the permissions object, kept whole. */
export function allowedActionsToSettings(
  changes: Partial<Record<AllowedActionKey, boolean>>,
  current: NativeSpaceSettings
): NativeSpaceSettings {
  const patch: NativeSpaceSettings = {};
  for (const [key, value] of Object.entries(changes) as [AllowedActionKey, boolean][]) {
    switch (key) {
      case 'memberCreatePosts':
        patch.allow_callouts = value;
        break;
      case 'videoCalls':
        patch.permissions = { ...current.permissions, members_video_call: value };
        break;
      case 'guestContributions':
        patch.allow_guests = value;
        break;
      case 'memberCreateSubspaces':
        patch.allow_subspaces = value;
        break;
      case 'inheritMembershipRights':
        patch.inherit_membership = value;
        break;
      case 'subspaceEvents':
        patch.events_from_subspaces = value;
        break;
      case 'alkemioSupportAccess':
        patch.allow_platform_support_as_admin = value;
        break;
      case 'subspaceAdminInvitations':
        patch.subspace_invites = value;
        break;
    }
  }
  return patch;
}
