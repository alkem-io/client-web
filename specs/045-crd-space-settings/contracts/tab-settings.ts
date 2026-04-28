import type { SettingsScopeLevel } from './tab-community';

export type SpacePrivacy = 'public' | 'private';
export type MembershipPolicy = 'open' | 'application' | 'invitation';

/**
 * Every allowed-action key the Settings page can render in the toggle list.
 *
 * Level-aware visibility (FR-036, parity with MUI `MemberActionsSettings.tsx`)
 * — the view filters `allowedActions` by `level`:
 *
 *  - `subspaceAdminInvitations`, `memberCreateSubspaces` → L0 + L1
 *  - `subspaceEvents`, `alkemioSupportAccess` → L0 only
 *  - `inheritMembershipRights` → L1 + L2
 *  - `memberCreatePosts`, `videoCalls`, `guestContributions` → all levels
 *
 * Note: `trustHostOrganization` is NOT toggled through `allowedActions`. It is
 * rendered as a separate row driven by `hostOrganizationTrusted` /
 * `onHostOrgTrustChange` and is not gated by level.
 */
export type AllowedActionKey =
  | 'subspaceAdminInvitations'
  | 'memberCreatePosts'
  | 'videoCalls'
  | 'guestContributions'
  | 'memberCreateSubspaces'
  | 'subspaceEvents'
  | 'alkemioSupportAccess'
  | 'inheritMembershipRights'
  | 'trustHostOrganization';

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
