import { CommunityMembershipPolicy, SpacePrivacyMode } from '@/core/apollo/generated/graphql-schema';

export const defaultSpaceSettings = {
  privacy: {
    mode: SpacePrivacyMode.Public,
    allowPlatformSupportAsAdmin: false,
  },
  membership: {
    policy: CommunityMembershipPolicy.Invitations,
    trustedOrganizations: [],
    hostOrganizationTrusted: false, // Computed from `trustedOrganizations`
    allowSubspaceAdminsToInviteMembers: true,
  },
  collaboration: {
    allowMembersToCreateCallouts: true,
    allowMembersToCreateSubspaces: true,
    inheritMembershipRights: true,
    allowEventsFromSubspaces: true,
    allowMembersToVideoCall: false,
  },
};
