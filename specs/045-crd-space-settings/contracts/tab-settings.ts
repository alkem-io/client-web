import type { SettingsScopeLevel } from './tab-community';

export type SpacePrivacy = 'public' | 'private';
export type MembershipPolicy = 'open' | 'application' | 'invitation';

/**
 * Every allowed-action key the current MUI Settings page exposes — retained
 * in full (FR-022). No new keys introduced for L0 behaviour.
 *
 * Level-aware visibility (added 2026-04-27, FR-036) — the view filters by `level`:
 *  - `subspaceAdminInvitations`, `memberCreateSubspaces`, `subspaceEvents` → L0 + L1 only.
 *  - `inheritMembershipRights` → L1 + L2 only.
 *  - All others (`memberCreatePosts`, `videoCalls`, `guestContributions`,
 *    `alkemioSupportAccess`, `trustHostOrganization`) → all levels.
 */
export type AllowedActionKey =
  | 'subspaceAdminInvitations'
  | 'memberCreatePosts'
  | 'videoCalls'
  | 'guestContributions'
  | 'memberCreateSubspaces'
  | 'subspaceEvents'
  | 'alkemioSupportAccess'
  | 'trustHostOrganization'
  | 'inheritMemberRightsFromParent'
  /** Added 2026-04-27 — implementation key for the L1/L2 inherit-member-rights toggle. */
  | 'inheritMembershipRights';

export type AllowedActionToggle = {
  key: AllowedActionKey;
  enabled: boolean;
};

export type ApplicableOrganization = {
  id: string;
  name: string;
  domain: string;
  automaticAccess: boolean;
};

export type SettingsViewProps = {
  /** Added 2026-04-27. Drives the level-aware filtering of `allowedActions` (FR-036). */
  level: SettingsScopeLevel;
  privacy: SpacePrivacy;
  membershipPolicy: MembershipPolicy;
  applicableOrganizations: ApplicableOrganization[];
  allowedActions: AllowedActionToggle[];
  canDeleteSpace: boolean;
  onPrivacyChange: (next: SpacePrivacy) => void;
  onMembershipPolicyChange: (next: MembershipPolicy) => void;
  onAddOrganization: () => void;
  onRemoveOrganization: (id: string) => void;
  onToggleAutomaticAccess: (id: string, next: boolean) => void;
  onToggleAllowedAction: (key: AllowedActionKey, next: boolean) => void;
  onDeleteSpace: () => void;
};
