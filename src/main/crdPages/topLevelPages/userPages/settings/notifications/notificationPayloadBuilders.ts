/**
 * Helpers that build the full `UpdateUserSettingsNotificationInput` payload
 * for a single property + channel toggle. Ported almost verbatim from the
 * MUI `UserAdminNotificationsPage`'s `buildSpaceSettings` /
 * `buildSpaceAdminSettings` / etc. helpers — the GraphQL mutation requires
 * a complete group payload (not a partial), so we always preserve every
 * other property's existing channel state.
 *
 * `serverSettings` MUST be the un-overridden server snapshot (not the
 * optimistic-override view) so we never accidentally persist a temporary
 * override value when toggling a different property.
 */

import type {
  NotificationChannels,
  NotificationSettings,
  OrganizationNotificationSettings,
  PlatformAdminNotificationSettings,
  PlatformNotificationSettings,
  SpaceAdminNotificationSettings,
  SpaceNotificationSettings,
  UserNotificationSettings,
  VCNotificationSettings,
} from '@/domain/community/userAdmin/tabs/model/NotificationSettings.model';

export type ChannelType = 'inApp' | 'email' | 'push';

export type NotificationGroupId =
  | 'space'
  | 'spaceAdmin'
  | 'user'
  | 'organization'
  | 'platform'
  | 'platformAdmin'
  | 'virtualContributor';

const channel = (
  type: ChannelType,
  property: string,
  targetProperty: string,
  value: boolean,
  current?: NotificationChannels
): NotificationChannels => ({
  email: type === 'email' && property === targetProperty ? value : (current?.email ?? false),
  inApp: type === 'inApp' && property === targetProperty ? value : (current?.inApp ?? false),
  push: type === 'push' && property === targetProperty ? value : (current?.push ?? false),
});

const preserve = (current?: NotificationChannels): NotificationChannels => ({
  email: current?.email ?? false,
  inApp: current?.inApp ?? false,
  push: current?.push ?? false,
});

const buildSpace = (
  server: SpaceNotificationSettings | undefined,
  property: string,
  type: ChannelType,
  value: boolean
) => ({
  communicationUpdates: channel(type, property, 'communicationUpdates', value, server?.communicationUpdates),
  collaborationCalloutPublished: channel(
    type,
    property,
    'collaborationCalloutPublished',
    value,
    server?.collaborationCalloutPublished
  ),
  collaborationCalloutPostContributionComment: channel(
    type,
    property,
    'collaborationCalloutPostContributionComment',
    value,
    server?.collaborationCalloutPostContributionComment
  ),
  collaborationCalloutContributionCreated: channel(
    type,
    property,
    'collaborationCalloutContributionCreated',
    value,
    server?.collaborationCalloutContributionCreated
  ),
  collaborationCalloutComment: channel(
    type,
    property,
    'collaborationCalloutComment',
    value,
    server?.collaborationCalloutComment
  ),
  communityCalendarEvents: channel(type, property, 'communityCalendarEvents', value, server?.communityCalendarEvents),
  collaborationPollVoteCastOnOwnPoll: channel(
    type,
    property,
    'collaborationPollVoteCastOnOwnPoll',
    value,
    server?.collaborationPollVoteCastOnOwnPoll
  ),
  collaborationPollVoteCastOnPollIVotedOn: channel(
    type,
    property,
    'collaborationPollVoteCastOnPollIVotedOn',
    value,
    server?.collaborationPollVoteCastOnPollIVotedOn
  ),
  collaborationPollModifiedOnPollIVotedOn: channel(
    type,
    property,
    'collaborationPollModifiedOnPollIVotedOn',
    value,
    server?.collaborationPollModifiedOnPollIVotedOn
  ),
  collaborationPollVoteAffectedByOptionChange: channel(
    type,
    property,
    'collaborationPollVoteAffectedByOptionChange',
    value,
    server?.collaborationPollVoteAffectedByOptionChange
  ),
});

const preserveSpace = (server: SpaceNotificationSettings | undefined) => ({
  communicationUpdates: preserve(server?.communicationUpdates),
  collaborationCalloutPublished: preserve(server?.collaborationCalloutPublished),
  collaborationCalloutPostContributionComment: preserve(server?.collaborationCalloutPostContributionComment),
  collaborationCalloutContributionCreated: preserve(server?.collaborationCalloutContributionCreated),
  collaborationCalloutComment: preserve(server?.collaborationCalloutComment),
  communityCalendarEvents: preserve(server?.communityCalendarEvents),
  collaborationPollVoteCastOnOwnPoll: preserve(server?.collaborationPollVoteCastOnOwnPoll),
  collaborationPollVoteCastOnPollIVotedOn: preserve(server?.collaborationPollVoteCastOnPollIVotedOn),
  collaborationPollModifiedOnPollIVotedOn: preserve(server?.collaborationPollModifiedOnPollIVotedOn),
  collaborationPollVoteAffectedByOptionChange: preserve(server?.collaborationPollVoteAffectedByOptionChange),
});

const buildSpaceAdmin = (
  server: SpaceAdminNotificationSettings | undefined,
  property: string,
  type: ChannelType,
  value: boolean
) => ({
  communityApplicationReceived: channel(
    type,
    property,
    'communityApplicationReceived',
    value,
    server?.communityApplicationReceived
  ),
  communityNewMember: channel(type, property, 'communityNewMember', value, server?.communityNewMember),
  collaborationCalloutContributionCreated: channel(
    type,
    property,
    'collaborationCalloutContributionCreated',
    value,
    server?.collaborationCalloutContributionCreated
  ),
  communicationMessageReceived: channel(
    type,
    property,
    'communicationMessageReceived',
    value,
    server?.communicationMessageReceived
  ),
});

const buildUser = (
  server: UserNotificationSettings | undefined,
  property: string,
  type: ChannelType,
  value: boolean
) => ({
  commentReply: channel(type, property, 'commentReply', value, server?.commentReply),
  mentioned: channel(type, property, 'mentioned', value, server?.mentioned),
  messageReceived: channel(type, property, 'messageReceived', value, server?.messageReceived),
  membership: {
    spaceCommunityInvitationReceived: channel(
      type,
      property,
      'membership.spaceCommunityInvitationReceived',
      value,
      server?.membership?.spaceCommunityInvitationReceived
    ),
    spaceCommunityJoined: channel(
      type,
      property,
      'membership.spaceCommunityJoined',
      value,
      server?.membership?.spaceCommunityJoined
    ),
  },
});

const buildOrganization = (
  server: OrganizationNotificationSettings | undefined,
  property: string,
  type: ChannelType,
  value: boolean
) => ({
  adminMentioned: channel(type, property, 'adminMentioned', value, server?.adminMentioned),
  adminMessageReceived: channel(type, property, 'adminMessageReceived', value, server?.adminMessageReceived),
});

const buildPlatform = (
  server: PlatformNotificationSettings | undefined,
  property: string,
  type: ChannelType,
  value: boolean
) => ({
  forumDiscussionComment: channel(type, property, 'forumDiscussionComment', value, server?.forumDiscussionComment),
  forumDiscussionCreated: channel(type, property, 'forumDiscussionCreated', value, server?.forumDiscussionCreated),
});

const preservePlatform = (server: PlatformNotificationSettings | undefined) => ({
  forumDiscussionComment: preserve(server?.forumDiscussionComment),
  forumDiscussionCreated: preserve(server?.forumDiscussionCreated),
});

const buildPlatformAdmin = (
  server: PlatformAdminNotificationSettings | undefined,
  property: string,
  type: ChannelType,
  value: boolean
) => ({
  userProfileCreated: channel(type, property, 'userProfileCreated', value, server?.userProfileCreated),
  userProfileRemoved: channel(type, property, 'userProfileRemoved', value, server?.userProfileRemoved),
  userGlobalRoleChanged: channel(type, property, 'userGlobalRoleChanged', value, server?.userGlobalRoleChanged),
  spaceCreated: channel(type, property, 'spaceCreated', value, server?.spaceCreated),
});

const buildVC = (server: VCNotificationSettings | undefined, property: string, type: ChannelType, value: boolean) => ({
  adminSpaceCommunityInvitation: channel(
    type,
    property,
    'adminSpaceCommunityInvitation',
    value,
    server?.adminSpaceCommunityInvitation
  ),
});

/**
 * Build the full mutation payload for a single property+channel toggle.
 * Returns the `notification: {...}` object expected by the mutation.
 */
export const buildNotificationUpdate = (
  server: NotificationSettings,
  group: NotificationGroupId,
  property: string,
  type: ChannelType,
  value: boolean
): Record<string, unknown> => {
  switch (group) {
    case 'space':
      return { space: buildSpace(server.space, property, type, value) };
    case 'spaceAdmin':
      return {
        space: {
          ...preserveSpace(server.space),
          admin: buildSpaceAdmin(server.spaceAdmin, property, type, value),
        },
      };
    case 'user':
      return { user: buildUser(server.user, property, type, value) };
    case 'organization':
      return { organization: buildOrganization(server.organization, property, type, value) };
    case 'platform':
      return { platform: buildPlatform(server.platform, property, type, value) };
    case 'platformAdmin':
      return {
        platform: {
          ...preservePlatform(server.platform),
          admin: buildPlatformAdmin(server.platformAdmin, property, type, value),
        },
      };
    case 'virtualContributor':
      return { virtualContributor: buildVC(server.virtualContributor, property, type, value) };
  }
};
