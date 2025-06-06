export interface SpaceSettingsPrivacy {
  mode: string;
  allowPlatformSupportAsAdmin: boolean;
}

export interface SpaceSettingsMembership {
  policy: string;
  trustedOrganizations: string[];
  allowSubspaceAdminsToInviteMembers: boolean;
}

export interface SpaceSettingsCollaboration {
  allowMembersToCreateCallouts: boolean;
  allowMembersToCreateSubspaces: boolean;
  inheritMembershipRights: boolean;
  allowEventsFromSubspaces: boolean;
}

export interface SpaceSettingsModel {
  privacy: SpaceSettingsPrivacy;
  membership: SpaceSettingsMembership;
  collaboration: SpaceSettingsCollaboration;
}
