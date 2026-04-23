export type SpacePrivacy = 'public' | 'private';
export type MembershipPolicy = 'open' | 'application' | 'invitation';

/**
 * Every allowed-action key the current MUI Settings page exposes — retained
 * in full (FR-022). No new keys introduced.
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
  | 'inheritMemberRightsFromParent';

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
