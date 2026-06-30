import type {
  CommunityMembershipPolicy,
  SpacePrivacyMode,
  UserInformationVisibility,
} from '@/core/apollo/generated/graphql-schema';

export interface SpaceSettingsPrivacy {
  mode: SpacePrivacyMode;
  allowPlatformSupportAsAdmin: boolean;
  /** Who may read member-user information (feature 008). Absent = follow space visibility. */
  userInformationVisibility?: UserInformationVisibility;
}

export interface SpaceSettingsMembership {
  policy: CommunityMembershipPolicy;
  trustedOrganizations: string[]; // UUID[]
  allowSubspaceAdminsToInviteMembers: boolean;
}

export interface SpaceSettingsCollaboration {
  allowMembersToCreateCallouts: boolean;
  allowMembersToCreateSubspaces: boolean;
  inheritMembershipRights: boolean;
  allowEventsFromSubspaces: boolean;
  allowMembersToVideoCall: boolean;
  allowGuestContributions: boolean;
}
