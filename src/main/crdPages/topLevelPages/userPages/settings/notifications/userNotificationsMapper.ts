import type { TFunction } from 'i18next';
import type { UserSettingsQuery } from '@/core/apollo/generated/graphql-schema';
import type {
  NotificationChannels,
  NotificationSettings,
} from '@/domain/community/userAdmin/tabs/model/NotificationSettings.model';
import type { NotificationGroupId } from './notificationPayloadBuilders';

export type ContributorSettingsTranslator = TFunction<'crd-contributorSettings'>;

export type NotificationRow = {
  /** Stable property key used by the mutation builder. Dot-paths supported (e.g. `membership.spaceCommunityJoined`). */
  property: string;
  /** Pre-localized human label rendered as the row's main text. */
  label: string;
  /** Resolved channel state (server values + optimistic overrides applied). Channels missing on the server default to `false`. */
  channels: NotificationChannels;
};

export type NotificationGroup = {
  groupId: NotificationGroupId;
  /** Pre-localized section title (e.g., "Space Notifications"). */
  title: string;
  /** Pre-localized description shown beneath the title. */
  description: string;
  rows: NotificationRow[];
};

export type NotificationViewData = {
  groups: NotificationGroup[];
};

export type NotificationPrivileges = {
  isPlatformAdmin: boolean;
  isOrganizationAdmin: boolean;
  isSpaceAdmin: boolean;
  isSpaceLead: boolean;
};

/** Pull settings out of the GraphQL query payload into the local model shape. */
export const extractServerSettings = (data: UserSettingsQuery | undefined): NotificationSettings => {
  const notification = data?.lookup.user?.settings?.notification;
  return {
    space: notification?.space,
    spaceAdmin: notification?.space?.admin,
    organization: notification?.organization,
    platform: notification?.platform,
    platformAdmin: notification?.platform?.admin,
    user: notification?.user,
    virtualContributor: notification?.virtualContributor,
  } as NotificationSettings;
};

/** Compose `(group, property, channel)` into a single key for the override map. */
export const overrideKey = (
  group: NotificationGroupId,
  property: string,
  channel: 'inApp' | 'email' | 'push'
): string => `${group}::${property}::${channel}`;

/** Resolve a row's channels by applying overrides on top of the server values. */
const resolveChannels = (
  server: NotificationChannels | undefined,
  overrides: Map<string, boolean>,
  group: NotificationGroupId,
  property: string
): NotificationChannels => ({
  inApp: overrides.get(overrideKey(group, property, 'inApp')) ?? server?.inApp ?? false,
  email: overrides.get(overrideKey(group, property, 'email')) ?? server?.email ?? false,
  push: overrides.get(overrideKey(group, property, 'push')) ?? server?.push ?? false,
});

/**
 * Build the flat group/row view data. Skips groups whose privilege gate is
 * false (Space Admin / Platform Admin / Organization). Always includes
 * Space, User, Platform, Virtual Contributor.
 */
export const mapUserNotifications = (
  server: NotificationSettings,
  overrides: Map<string, boolean>,
  privileges: NotificationPrivileges,
  t: ContributorSettingsTranslator
): NotificationViewData => {
  const groups: NotificationGroup[] = [];

  // ── Space (always visible) ──
  groups.push({
    groupId: 'space',
    title: t('user.notifications.groups.space.title'),
    description: t('user.notifications.groups.space.description'),
    rows: [
      {
        property: 'communicationUpdates',
        label: t('user.notifications.rows.space.communicationUpdates'),
        channels: resolveChannels(server.space?.communicationUpdates, overrides, 'space', 'communicationUpdates'),
      },
      {
        property: 'collaborationCalloutPublished',
        label: t('user.notifications.rows.space.collaborationCalloutPublished'),
        channels: resolveChannels(
          server.space?.collaborationCalloutPublished,
          overrides,
          'space',
          'collaborationCalloutPublished'
        ),
      },
      {
        property: 'collaborationCalloutPostContributionComment',
        label: t('user.notifications.rows.space.collaborationCalloutPostContributionComment'),
        channels: resolveChannels(
          server.space?.collaborationCalloutPostContributionComment,
          overrides,
          'space',
          'collaborationCalloutPostContributionComment'
        ),
      },
      {
        property: 'collaborationCalloutContributionCreated',
        label: t('user.notifications.rows.space.collaborationCalloutContributionCreated'),
        channels: resolveChannels(
          server.space?.collaborationCalloutContributionCreated,
          overrides,
          'space',
          'collaborationCalloutContributionCreated'
        ),
      },
      {
        property: 'collaborationCalloutComment',
        label: t('user.notifications.rows.space.collaborationCalloutComment'),
        channels: resolveChannels(
          server.space?.collaborationCalloutComment,
          overrides,
          'space',
          'collaborationCalloutComment'
        ),
      },
      {
        property: 'communityCalendarEvents',
        label: t('user.notifications.rows.space.communityCalendarEvents'),
        channels: resolveChannels(server.space?.communityCalendarEvents, overrides, 'space', 'communityCalendarEvents'),
      },
      {
        property: 'collaborationPollVoteCastOnOwnPoll',
        label: t('user.notifications.rows.space.collaborationPollVoteCastOnOwnPoll'),
        channels: resolveChannels(
          server.space?.collaborationPollVoteCastOnOwnPoll,
          overrides,
          'space',
          'collaborationPollVoteCastOnOwnPoll'
        ),
      },
      {
        property: 'collaborationPollVoteCastOnPollIVotedOn',
        label: t('user.notifications.rows.space.collaborationPollVoteCastOnPollIVotedOn'),
        channels: resolveChannels(
          server.space?.collaborationPollVoteCastOnPollIVotedOn,
          overrides,
          'space',
          'collaborationPollVoteCastOnPollIVotedOn'
        ),
      },
      {
        property: 'collaborationPollModifiedOnPollIVotedOn',
        label: t('user.notifications.rows.space.collaborationPollModifiedOnPollIVotedOn'),
        channels: resolveChannels(
          server.space?.collaborationPollModifiedOnPollIVotedOn,
          overrides,
          'space',
          'collaborationPollModifiedOnPollIVotedOn'
        ),
      },
      {
        property: 'collaborationPollVoteAffectedByOptionChange',
        label: t('user.notifications.rows.space.collaborationPollVoteAffectedByOptionChange'),
        channels: resolveChannels(
          server.space?.collaborationPollVoteAffectedByOptionChange,
          overrides,
          'space',
          'collaborationPollVoteAffectedByOptionChange'
        ),
      },
    ],
  });

  // ── Space Admin (gated by isPlatformAdmin OR isSpaceAdmin OR isSpaceLead) ──
  if (privileges.isPlatformAdmin || privileges.isSpaceAdmin || privileges.isSpaceLead) {
    groups.push({
      groupId: 'spaceAdmin',
      title: t('user.notifications.groups.spaceAdmin.title'),
      description: t('user.notifications.groups.spaceAdmin.description'),
      rows: [
        {
          property: 'communityApplicationReceived',
          label: t('user.notifications.rows.spaceAdmin.communityApplicationReceived'),
          channels: resolveChannels(
            server.spaceAdmin?.communityApplicationReceived,
            overrides,
            'spaceAdmin',
            'communityApplicationReceived'
          ),
        },
        {
          property: 'communityNewMember',
          label: t('user.notifications.rows.spaceAdmin.communityNewMember'),
          channels: resolveChannels(
            server.spaceAdmin?.communityNewMember,
            overrides,
            'spaceAdmin',
            'communityNewMember'
          ),
        },
        {
          property: 'collaborationCalloutContributionCreated',
          label: t('user.notifications.rows.spaceAdmin.collaborationCalloutContributionCreated'),
          channels: resolveChannels(
            server.spaceAdmin?.collaborationCalloutContributionCreated,
            overrides,
            'spaceAdmin',
            'collaborationCalloutContributionCreated'
          ),
        },
        {
          property: 'communicationMessageReceived',
          label: t('user.notifications.rows.spaceAdmin.communicationMessageReceived'),
          channels: resolveChannels(
            server.spaceAdmin?.communicationMessageReceived,
            overrides,
            'spaceAdmin',
            'communicationMessageReceived'
          ),
        },
      ],
    });
  }

  // ── User (always visible) ──
  groups.push({
    groupId: 'user',
    title: t('user.notifications.groups.user.title'),
    description: t('user.notifications.groups.user.description'),
    rows: [
      {
        property: 'commentReply',
        label: t('user.notifications.rows.user.commentReply'),
        channels: resolveChannels(server.user?.commentReply, overrides, 'user', 'commentReply'),
      },
      {
        property: 'mentioned',
        label: t('user.notifications.rows.user.mentioned'),
        channels: resolveChannels(server.user?.mentioned, overrides, 'user', 'mentioned'),
      },
      {
        property: 'messageReceived',
        label: t('user.notifications.rows.user.messageReceived'),
        channels: resolveChannels(server.user?.messageReceived, overrides, 'user', 'messageReceived'),
      },
      {
        property: 'membership.spaceCommunityInvitationReceived',
        label: t('user.notifications.rows.user.membershipInvitationReceived'),
        channels: resolveChannels(
          server.user?.membership?.spaceCommunityInvitationReceived,
          overrides,
          'user',
          'membership.spaceCommunityInvitationReceived'
        ),
      },
      {
        property: 'membership.spaceCommunityJoined',
        label: t('user.notifications.rows.user.membershipCommunityJoined'),
        channels: resolveChannels(
          server.user?.membership?.spaceCommunityJoined,
          overrides,
          'user',
          'membership.spaceCommunityJoined'
        ),
      },
    ],
  });

  // ── Platform (always visible) ──
  groups.push({
    groupId: 'platform',
    title: t('user.notifications.groups.platform.title'),
    description: t('user.notifications.groups.platform.description'),
    rows: [
      {
        property: 'forumDiscussionComment',
        label: t('user.notifications.rows.platform.forumDiscussionComment'),
        channels: resolveChannels(
          server.platform?.forumDiscussionComment,
          overrides,
          'platform',
          'forumDiscussionComment'
        ),
      },
      {
        property: 'forumDiscussionCreated',
        label: t('user.notifications.rows.platform.forumDiscussionCreated'),
        channels: resolveChannels(
          server.platform?.forumDiscussionCreated,
          overrides,
          'platform',
          'forumDiscussionCreated'
        ),
      },
    ],
  });

  // ── Platform Admin (gated by isPlatformAdmin) ──
  if (privileges.isPlatformAdmin) {
    groups.push({
      groupId: 'platformAdmin',
      title: t('user.notifications.groups.platformAdmin.title'),
      description: t('user.notifications.groups.platformAdmin.description'),
      rows: [
        {
          property: 'userProfileCreated',
          label: t('user.notifications.rows.platformAdmin.userProfileCreated'),
          channels: resolveChannels(
            server.platformAdmin?.userProfileCreated,
            overrides,
            'platformAdmin',
            'userProfileCreated'
          ),
        },
        {
          property: 'userProfileRemoved',
          label: t('user.notifications.rows.platformAdmin.userProfileRemoved'),
          channels: resolveChannels(
            server.platformAdmin?.userProfileRemoved,
            overrides,
            'platformAdmin',
            'userProfileRemoved'
          ),
        },
        {
          property: 'userGlobalRoleChanged',
          label: t('user.notifications.rows.platformAdmin.userGlobalRoleChanged'),
          channels: resolveChannels(
            server.platformAdmin?.userGlobalRoleChanged,
            overrides,
            'platformAdmin',
            'userGlobalRoleChanged'
          ),
        },
        {
          property: 'spaceCreated',
          label: t('user.notifications.rows.platformAdmin.spaceCreated'),
          channels: resolveChannels(server.platformAdmin?.spaceCreated, overrides, 'platformAdmin', 'spaceCreated'),
        },
      ],
    });
  }

  // ── Organization (gated by isPlatformAdmin OR isOrganizationAdmin) ──
  if (privileges.isPlatformAdmin || privileges.isOrganizationAdmin) {
    groups.push({
      groupId: 'organization',
      title: t('user.notifications.groups.organization.title'),
      description: t('user.notifications.groups.organization.description'),
      rows: [
        {
          property: 'adminMentioned',
          label: t('user.notifications.rows.organization.adminMentioned'),
          channels: resolveChannels(server.organization?.adminMentioned, overrides, 'organization', 'adminMentioned'),
        },
        {
          property: 'adminMessageReceived',
          label: t('user.notifications.rows.organization.adminMessageReceived'),
          channels: resolveChannels(
            server.organization?.adminMessageReceived,
            overrides,
            'organization',
            'adminMessageReceived'
          ),
        },
      ],
    });
  }

  // ── Virtual Contributor (always visible) ──
  groups.push({
    groupId: 'virtualContributor',
    title: t('user.notifications.groups.virtualContributor.title'),
    description: t('user.notifications.groups.virtualContributor.description'),
    rows: [
      {
        property: 'adminSpaceCommunityInvitation',
        label: t('user.notifications.rows.virtualContributor.adminSpaceCommunityInvitation'),
        channels: resolveChannels(
          server.virtualContributor?.adminSpaceCommunityInvitation,
          overrides,
          'virtualContributor',
          'adminSpaceCommunityInvitation'
        ),
      },
    ],
  });

  return { groups };
};
