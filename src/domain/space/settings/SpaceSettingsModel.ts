import { CommunityMembershipPolicy, SpacePrivacyMode } from '@/core/apollo/generated/graphql-schema';

interface SpaceSettingsPrivacy {
  mode: SpacePrivacyMode;
  allowPlatformSupportAsAdmin: boolean;
}

interface SpaceSettingsMembership {
  policy: CommunityMembershipPolicy;
  trustedOrganizations: string[]; // UUID[]
  allowSubspaceAdminsToInviteMembers: boolean;
}

interface SpaceSettingsCollaboration {
  allowMembersToCreateCallouts: boolean;
  allowMembersToCreateSubspaces: boolean;
  inheritMembershipRights: boolean;
  allowEventsFromSubspaces: boolean;
  allowMembersToVideoCall: boolean;
}

export interface SpaceSettingsModel {
  privacy: SpaceSettingsPrivacy;
  membership: SpaceSettingsMembership;
  collaboration: SpaceSettingsCollaboration;
}
