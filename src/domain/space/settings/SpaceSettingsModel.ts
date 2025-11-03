import { CommunityMembershipPolicy, SpacePrivacyMode } from '@/core/apollo/generated/graphql-schema';

export interface SpaceSettingsPrivacy {
  mode: SpacePrivacyMode;
  allowPlatformSupportAsAdmin: boolean;
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

export interface SpaceSettingsModel {
  privacy: SpaceSettingsPrivacy;
  membership: SpaceSettingsMembership;
  collaboration: SpaceSettingsCollaboration;
}
