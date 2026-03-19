import { Alert, Box, Switch } from '@mui/material';
import { useMemo, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import {
  refetchUserSettingsQuery,
  useUpdateUserSettingsMutation,
  useUserSettingsQuery,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  type UpdateUserSettingsNotificationInput,
} from '@/core/apollo/generated/graphql-schema';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import type { ChannelType } from '@/core/ui/forms/SettingsGroups/types/NotificationTypes';
import Loading from '@/core/ui/loading/Loading';
import { BlockTitle, Caption } from '@/core/ui/typography/components';
import UserAdminLayout from '@/domain/community/userAdmin/layout/UserAdminLayout';
import { VCNotificationsSettings } from '@/domain/community/userAdmin/tabs/components/VCNotificationsSettings';
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
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import { usePushNotificationContext } from '@/main/pushNotifications/PushNotificationProvider';
import { useUserProvider } from '../../user/hooks/useUserProvider';
import useUserRouteContext from '../../user/routing/useUserRouteContext';
import { useCurrentUserContext } from '../../userCurrent/useCurrentUserContext';
import { CombinedPlatformNotificationsSettings } from './components/CombinedPlatformNotificationsSettings';
import { CombinedSpaceNotificationsSettings } from './components/CombinedSpaceNotificationsSettings';
import { CombinedUserNotificationsSettings } from './components/CombinedUserNotificationsSettings';
import { OrganizationNotificationsSettings } from './components/OrganizationNotificationsSettings';
import { PushSubscriptionsList } from './components/PushSubscriptionsList';

// Notification groups enum for explicit handling
export enum NotificationGroup {
  SPACE = 'space',
  SPACE_ADMIN = 'spaceAdmin',
  USER = 'user',
  ORGANIZATION = 'organization',
  PLATFORM = 'platform',
  PLATFORM_ADMIN = 'platformAdmin',
  VIRTUAL_CONTRIBUTOR = 'virtualContributor',
}

type NotificationUpdate = {
  group: NotificationGroup;
  property: string;
  type: ChannelType;
  value: boolean;
};

// Optimistic overrides: track individual setting changes so the UI updates immediately
type OptimisticOverride = {
  group: NotificationGroup;
  property: string;
  channelType: ChannelType;
  value: boolean;
};

type OverridesAction = { type: 'set'; override: OptimisticOverride } | { type: 'clear' };

function overridesReducer(state: OptimisticOverride[], action: OverridesAction): OptimisticOverride[] {
  switch (action.type) {
    case 'set':
      return [
        ...state.filter(
          o =>
            !(
              o.group === action.override.group &&
              o.property === action.override.property &&
              o.channelType === action.override.channelType
            )
        ),
        action.override,
      ];
    case 'clear':
      return [];
    default:
      return state;
  }
}

// Helper function to create notification channel objects
const createNotificationChannel = (
  type: ChannelType,
  property: string,
  targetProperty: string,
  value: boolean,
  currentChannel?: NotificationChannels
): NotificationChannels => ({
  email: type === 'email' && property === targetProperty ? value : (currentChannel?.email ?? false),
  inApp: type === 'inApp' && property === targetProperty ? value : (currentChannel?.inApp ?? false),
  push: type === 'push' && property === targetProperty ? value : (currentChannel?.push ?? false),
});

// Helper function to preserve existing channels with default values
const preserveChannel = (channel?: NotificationChannels): NotificationChannels => ({
  email: channel?.email ?? false,
  inApp: channel?.inApp ?? false,
  push: channel?.push ?? false,
});

// Apply optimistic overrides to a NotificationChannels object
const applyOverrides = (
  channel: NotificationChannels | undefined,
  overrides: OptimisticOverride[],
  group: NotificationGroup,
  property: string
): NotificationChannels | undefined => {
  const matching = overrides.filter(o => o.group === group && o.property === property);
  if (matching.length === 0) return channel;
  const base: NotificationChannels = {
    email: channel?.email ?? false,
    inApp: channel?.inApp ?? false,
    push: channel?.push ?? false,
  };
  for (const o of matching) {
    base[o.channelType] = o.value;
  }
  return base;
};

const UserAdminNotificationsPage = () => {
  const { t } = useTranslation();

  // User profile being viewed
  const { userId } = useUserRouteContext();
  const { userModel: userProfile, loading: isLoadingUser } = useUserProvider(userId);

  // Current authenticated user
  const {
    userModel: currentUserModel,
    platformPrivilegeWrapper: userWrapper,
    loading: isLoadingUserContext,
  } = useCurrentUserContext();

  // Push notification context
  const {
    isSupported: isPushSupported,
    isServerEnabled: isPushServerEnabled,
    permissionState: pushPermissionState,
    isSubscribed: isPushSubscribed,
    subscribe: pushSubscribe,
    unsubscribe: pushUnsubscribe,
    loading: pushLoading,
    requiresPWAMode,
    isPrivateBrowsing,
  } = usePushNotificationContext();

  const isPushAvailable = isPushSupported && isPushServerEnabled && !requiresPWAMode && !isPrivateBrowsing;
  const isPushEnabled = isPushAvailable && isPushSubscribed;

  const notificationPageForCurrentUser = userProfile?.id === currentUserModel?.id;

  // Role-based permissions
  const isPlatformAdmin = useMemo(() => {
    if (isLoadingUserContext || isLoadingUser) return false;
    if (notificationPageForCurrentUser) {
      return userWrapper?.hasPlatformPrivilege(AuthorizationPrivilege.PlatformAdmin) ?? false;
    }
    return true;
  }, [notificationPageForCurrentUser, userWrapper, isLoadingUserContext, isLoadingUser]);

  const isOrganizationAdmin = useMemo(
    () => userWrapper?.hasPlatformPrivilege(AuthorizationPrivilege.ReceiveNotificationsOrganizationAdmin) ?? false,
    [userWrapper]
  );

  const isSpaceAdmin = useMemo(
    () => userWrapper?.hasPlatformPrivilege(AuthorizationPrivilege.ReceiveNotificationsSpaceAdmin) ?? false,
    [userWrapper]
  );

  const isSpaceLead = useMemo(
    () => userWrapper?.hasPlatformPrivilege(AuthorizationPrivilege.ReceiveNotificationsSpaceLead) ?? false,
    [userWrapper]
  );

  const userID = userProfile?.id ?? '';

  const { data: userProfileData, loading } = useUserSettingsQuery({
    variables: { userID },
    skip: isLoadingUser || !userID,
    fetchPolicy: 'cache-and-network',
  });

  const [updateUserSettings] = useUpdateUserSettingsMutation();

  // Optimistic overrides for immediate UI feedback
  const [overrides, dispatchOverrides] = useReducer(overridesReducer, []);

  // Server settings from the query
  const serverSettings = useMemo((): NotificationSettings => {
    const notification = userProfileData?.lookup.user?.settings?.notification;

    return {
      space: notification?.space as SpaceNotificationSettings | undefined,
      spaceAdmin: notification?.space?.admin as SpaceAdminNotificationSettings | undefined,
      organization: notification?.organization as OrganizationNotificationSettings | undefined,
      platform: notification?.platform as PlatformNotificationSettings | undefined,
      platformAdmin: notification?.platform?.admin as PlatformAdminNotificationSettings | undefined,
      user: notification?.user as UserNotificationSettings | undefined,
      virtualContributor: notification?.virtualContributor as VCNotificationSettings | undefined,
    };
  }, [userProfileData]);

  // Merge server settings with optimistic overrides for the UI
  const currentSettings = useMemo((): NotificationSettings => {
    if (overrides.length === 0) return serverSettings;

    return {
      space: serverSettings.space
        ? {
            communicationUpdates: applyOverrides(
              serverSettings.space.communicationUpdates,
              overrides,
              NotificationGroup.SPACE,
              'communicationUpdates'
            ),
            collaborationCalloutPublished: applyOverrides(
              serverSettings.space.collaborationCalloutPublished,
              overrides,
              NotificationGroup.SPACE,
              'collaborationCalloutPublished'
            ),
            collaborationCalloutPostContributionComment: applyOverrides(
              serverSettings.space.collaborationCalloutPostContributionComment,
              overrides,
              NotificationGroup.SPACE,
              'collaborationCalloutPostContributionComment'
            ),
            collaborationCalloutContributionCreated: applyOverrides(
              serverSettings.space.collaborationCalloutContributionCreated,
              overrides,
              NotificationGroup.SPACE,
              'collaborationCalloutContributionCreated'
            ),
            collaborationCalloutComment: applyOverrides(
              serverSettings.space.collaborationCalloutComment,
              overrides,
              NotificationGroup.SPACE,
              'collaborationCalloutComment'
            ),
            communityCalendarEvents: applyOverrides(
              serverSettings.space.communityCalendarEvents,
              overrides,
              NotificationGroup.SPACE,
              'communityCalendarEvents'
            ),
            collaborationPollVoteCastOnOwnPoll: applyOverrides(
              serverSettings.space.collaborationPollVoteCastOnOwnPoll,
              overrides,
              NotificationGroup.SPACE,
              'collaborationPollVoteCastOnOwnPoll'
            ),
            collaborationPollVoteCastOnPollIVotedOn: applyOverrides(
              serverSettings.space.collaborationPollVoteCastOnPollIVotedOn,
              overrides,
              NotificationGroup.SPACE,
              'collaborationPollVoteCastOnPollIVotedOn'
            ),
            collaborationPollModifiedOnPollIVotedOn: applyOverrides(
              serverSettings.space.collaborationPollModifiedOnPollIVotedOn,
              overrides,
              NotificationGroup.SPACE,
              'collaborationPollModifiedOnPollIVotedOn'
            ),
            collaborationPollVoteAffectedByOptionChange: applyOverrides(
              serverSettings.space.collaborationPollVoteAffectedByOptionChange,
              overrides,
              NotificationGroup.SPACE,
              'collaborationPollVoteAffectedByOptionChange'
            ),
          }
        : undefined,
      spaceAdmin: serverSettings.spaceAdmin
        ? {
            communityApplicationReceived: applyOverrides(
              serverSettings.spaceAdmin.communityApplicationReceived,
              overrides,
              NotificationGroup.SPACE_ADMIN,
              'communityApplicationReceived'
            ),
            communityNewMember: applyOverrides(
              serverSettings.spaceAdmin.communityNewMember,
              overrides,
              NotificationGroup.SPACE_ADMIN,
              'communityNewMember'
            ),
            collaborationCalloutContributionCreated: applyOverrides(
              serverSettings.spaceAdmin.collaborationCalloutContributionCreated,
              overrides,
              NotificationGroup.SPACE_ADMIN,
              'collaborationCalloutContributionCreated'
            ),
            communicationMessageReceived: applyOverrides(
              serverSettings.spaceAdmin.communicationMessageReceived,
              overrides,
              NotificationGroup.SPACE_ADMIN,
              'communicationMessageReceived'
            ),
          }
        : undefined,
      user: serverSettings.user
        ? {
            commentReply: applyOverrides(
              serverSettings.user.commentReply,
              overrides,
              NotificationGroup.USER,
              'commentReply'
            ),
            mentioned: applyOverrides(serverSettings.user.mentioned, overrides, NotificationGroup.USER, 'mentioned'),
            messageReceived: applyOverrides(
              serverSettings.user.messageReceived,
              overrides,
              NotificationGroup.USER,
              'messageReceived'
            ),
            membership: serverSettings.user.membership
              ? {
                  spaceCommunityInvitationReceived: applyOverrides(
                    serverSettings.user.membership.spaceCommunityInvitationReceived,
                    overrides,
                    NotificationGroup.USER,
                    'membership.spaceCommunityInvitationReceived'
                  ),
                  spaceCommunityJoined: applyOverrides(
                    serverSettings.user.membership.spaceCommunityJoined,
                    overrides,
                    NotificationGroup.USER,
                    'membership.spaceCommunityJoined'
                  ),
                }
              : undefined,
          }
        : undefined,
      organization: serverSettings.organization
        ? {
            adminMentioned: applyOverrides(
              serverSettings.organization.adminMentioned,
              overrides,
              NotificationGroup.ORGANIZATION,
              'adminMentioned'
            ),
            adminMessageReceived: applyOverrides(
              serverSettings.organization.adminMessageReceived,
              overrides,
              NotificationGroup.ORGANIZATION,
              'adminMessageReceived'
            ),
          }
        : undefined,
      platform: serverSettings.platform
        ? {
            forumDiscussionComment: applyOverrides(
              serverSettings.platform.forumDiscussionComment,
              overrides,
              NotificationGroup.PLATFORM,
              'forumDiscussionComment'
            ),
            forumDiscussionCreated: applyOverrides(
              serverSettings.platform.forumDiscussionCreated,
              overrides,
              NotificationGroup.PLATFORM,
              'forumDiscussionCreated'
            ),
          }
        : undefined,
      platformAdmin: serverSettings.platformAdmin
        ? {
            userProfileCreated: applyOverrides(
              serverSettings.platformAdmin.userProfileCreated,
              overrides,
              NotificationGroup.PLATFORM_ADMIN,
              'userProfileCreated'
            ),
            userProfileRemoved: applyOverrides(
              serverSettings.platformAdmin.userProfileRemoved,
              overrides,
              NotificationGroup.PLATFORM_ADMIN,
              'userProfileRemoved'
            ),
            userGlobalRoleChanged: applyOverrides(
              serverSettings.platformAdmin.userGlobalRoleChanged,
              overrides,
              NotificationGroup.PLATFORM_ADMIN,
              'userGlobalRoleChanged'
            ),
            spaceCreated: applyOverrides(
              serverSettings.platformAdmin.spaceCreated,
              overrides,
              NotificationGroup.PLATFORM_ADMIN,
              'spaceCreated'
            ),
          }
        : undefined,
      virtualContributor: serverSettings.virtualContributor
        ? {
            adminSpaceCommunityInvitation: applyOverrides(
              serverSettings.virtualContributor.adminSpaceCommunityInvitation,
              overrides,
              NotificationGroup.VIRTUAL_CONTRIBUTOR,
              'adminSpaceCommunityInvitation'
            ),
          }
        : undefined,
    };
  }, [serverSettings, overrides]);

  if (loading || isLoadingUser) {
    return <Loading />;
  }

  const handlePushMasterToggle = async () => {
    if (isPushSubscribed) {
      await pushUnsubscribe();
    } else {
      await pushSubscribe();
    }
  };

  // Helper functions for building notification settings objects
  // These use serverSettings (not currentSettings with overrides) to avoid sending optimistic values
  const buildSpaceSettings = (property: string, type: ChannelType, value: boolean) => ({
    communicationUpdates: createNotificationChannel(
      type,
      property,
      'communicationUpdates',
      value,
      serverSettings.space?.communicationUpdates
    ),
    collaborationCalloutPublished: createNotificationChannel(
      type,
      property,
      'collaborationCalloutPublished',
      value,
      serverSettings.space?.collaborationCalloutPublished
    ),
    collaborationCalloutPostContributionComment: createNotificationChannel(
      type,
      property,
      'collaborationCalloutPostContributionComment',
      value,
      serverSettings.space?.collaborationCalloutPostContributionComment
    ),
    collaborationCalloutContributionCreated: createNotificationChannel(
      type,
      property,
      'collaborationCalloutContributionCreated',
      value,
      serverSettings.space?.collaborationCalloutContributionCreated
    ),
    collaborationCalloutComment: createNotificationChannel(
      type,
      property,
      'collaborationCalloutComment',
      value,
      serverSettings.space?.collaborationCalloutComment
    ),
    communityCalendarEvents: createNotificationChannel(
      type,
      property,
      'communityCalendarEvents',
      value,
      serverSettings.space?.communityCalendarEvents
    ),
    collaborationPollVoteCastOnOwnPoll: createNotificationChannel(
      type,
      property,
      'collaborationPollVoteCastOnOwnPoll',
      value,
      serverSettings.space?.collaborationPollVoteCastOnOwnPoll
    ),
    collaborationPollVoteCastOnPollIVotedOn: createNotificationChannel(
      type,
      property,
      'collaborationPollVoteCastOnPollIVotedOn',
      value,
      serverSettings.space?.collaborationPollVoteCastOnPollIVotedOn
    ),
    collaborationPollModifiedOnPollIVotedOn: createNotificationChannel(
      type,
      property,
      'collaborationPollModifiedOnPollIVotedOn',
      value,
      serverSettings.space?.collaborationPollModifiedOnPollIVotedOn
    ),
    collaborationPollVoteAffectedByOptionChange: createNotificationChannel(
      type,
      property,
      'collaborationPollVoteAffectedByOptionChange',
      value,
      serverSettings.space?.collaborationPollVoteAffectedByOptionChange
    ),
  });

  const buildSpaceAdminSettings = (property: string, type: ChannelType, value: boolean) => ({
    communityApplicationReceived: createNotificationChannel(
      type,
      property,
      'communityApplicationReceived',
      value,
      serverSettings.spaceAdmin?.communityApplicationReceived
    ),
    communityNewMember: createNotificationChannel(
      type,
      property,
      'communityNewMember',
      value,
      serverSettings.spaceAdmin?.communityNewMember
    ),
    collaborationCalloutContributionCreated: createNotificationChannel(
      type,
      property,
      'collaborationCalloutContributionCreated',
      value,
      serverSettings.spaceAdmin?.collaborationCalloutContributionCreated
    ),
    communicationMessageReceived: createNotificationChannel(
      type,
      property,
      'communicationMessageReceived',
      value,
      serverSettings.spaceAdmin?.communicationMessageReceived
    ),
  });

  const buildUserSettings = (property: string, type: ChannelType, value: boolean) => ({
    commentReply: createNotificationChannel(type, property, 'commentReply', value, serverSettings.user?.commentReply),
    mentioned: createNotificationChannel(type, property, 'mentioned', value, serverSettings.user?.mentioned),
    messageReceived: createNotificationChannel(
      type,
      property,
      'messageReceived',
      value,
      serverSettings.user?.messageReceived
    ),
    membership: {
      spaceCommunityInvitationReceived: createNotificationChannel(
        type,
        property,
        'membership.spaceCommunityInvitationReceived',
        value,
        serverSettings.user?.membership?.spaceCommunityInvitationReceived
      ),
      spaceCommunityJoined: createNotificationChannel(
        type,
        property,
        'membership.spaceCommunityJoined',
        value,
        serverSettings.user?.membership?.spaceCommunityJoined
      ),
    },
  });

  const buildOrganizationSettings = (property: string, type: ChannelType, value: boolean) => ({
    adminMentioned: createNotificationChannel(
      type,
      property,
      'adminMentioned',
      value,
      serverSettings.organization?.adminMentioned
    ),
    adminMessageReceived: createNotificationChannel(
      type,
      property,
      'adminMessageReceived',
      value,
      serverSettings.organization?.adminMessageReceived
    ),
  });

  const buildPlatformSettings = (property: string, type: ChannelType, value: boolean) => ({
    forumDiscussionComment: createNotificationChannel(
      type,
      property,
      'forumDiscussionComment',
      value,
      serverSettings.platform?.forumDiscussionComment
    ),
    forumDiscussionCreated: createNotificationChannel(
      type,
      property,
      'forumDiscussionCreated',
      value,
      serverSettings.platform?.forumDiscussionCreated
    ),
  });

  const buildPlatformAdminSettings = (property: string, type: ChannelType, value: boolean) => ({
    userProfileCreated: createNotificationChannel(
      type,
      property,
      'userProfileCreated',
      value,
      serverSettings.platformAdmin?.userProfileCreated
    ),
    userProfileRemoved: createNotificationChannel(
      type,
      property,
      'userProfileRemoved',
      value,
      serverSettings.platformAdmin?.userProfileRemoved
    ),
    userGlobalRoleChanged: createNotificationChannel(
      type,
      property,
      'userGlobalRoleChanged',
      value,
      serverSettings.platformAdmin?.userGlobalRoleChanged
    ),
    spaceCreated: createNotificationChannel(
      type,
      property,
      'spaceCreated',
      value,
      serverSettings.platformAdmin?.spaceCreated
    ),
  });

  const buildVCSettings = (property: string, type: ChannelType, value: boolean) => ({
    adminSpaceCommunityInvitation: createNotificationChannel(
      type,
      property,
      'adminSpaceCommunityInvitation',
      value,
      serverSettings.virtualContributor?.adminSpaceCommunityInvitation
    ),
  });

  // Unified update handler that processes a single notification setting update
  const handleUpdateSettings = async ({ group, property, type, value }: NotificationUpdate) => {
    // Immediately apply the change to local state for instant UI feedback
    dispatchOverrides({
      type: 'set',
      override: { group, property, channelType: type, value },
    });

    const settingsVariable: UpdateUserSettingsNotificationInput = {};

    switch (group) {
      case NotificationGroup.SPACE:
        settingsVariable.space = buildSpaceSettings(property, type, value);
        break;

      case NotificationGroup.SPACE_ADMIN:
        settingsVariable.space = {
          communicationUpdates: preserveChannel(serverSettings.space?.communicationUpdates),
          collaborationCalloutPublished: preserveChannel(serverSettings.space?.collaborationCalloutPublished),
          collaborationCalloutPostContributionComment: preserveChannel(
            serverSettings.space?.collaborationCalloutPostContributionComment
          ),
          collaborationCalloutContributionCreated: preserveChannel(
            serverSettings.space?.collaborationCalloutContributionCreated
          ),
          collaborationCalloutComment: preserveChannel(serverSettings.space?.collaborationCalloutComment),
          communityCalendarEvents: preserveChannel(serverSettings.space?.communityCalendarEvents),
          collaborationPollVoteCastOnOwnPoll: preserveChannel(serverSettings.space?.collaborationPollVoteCastOnOwnPoll),
          collaborationPollVoteCastOnPollIVotedOn: preserveChannel(serverSettings.space?.collaborationPollVoteCastOnPollIVotedOn),
          collaborationPollModifiedOnPollIVotedOn: preserveChannel(serverSettings.space?.collaborationPollModifiedOnPollIVotedOn),
          collaborationPollVoteAffectedByOptionChange: preserveChannel(serverSettings.space?.collaborationPollVoteAffectedByOptionChange),
          admin: buildSpaceAdminSettings(property, type, value),
        };
        break;

      case NotificationGroup.USER:
        settingsVariable.user = buildUserSettings(property, type, value);
        break;

      case NotificationGroup.ORGANIZATION:
        settingsVariable.organization = buildOrganizationSettings(property, type, value);
        break;

      case NotificationGroup.PLATFORM:
        settingsVariable.platform = buildPlatformSettings(property, type, value);
        break;

      case NotificationGroup.PLATFORM_ADMIN:
        settingsVariable.platform = {
          forumDiscussionComment: preserveChannel(serverSettings.platform?.forumDiscussionComment),
          forumDiscussionCreated: preserveChannel(serverSettings.platform?.forumDiscussionCreated),
          admin: buildPlatformAdminSettings(property, type, value),
        };
        break;

      case NotificationGroup.VIRTUAL_CONTRIBUTOR:
        settingsVariable.virtualContributor = buildVCSettings(property, type, value);
        break;

      default:
        return;
    }

    await updateUserSettings({
      variables: {
        settingsData: {
          userID,
          settings: {
            notification: settingsVariable,
          },
        },
      },
      refetchQueries: [refetchUserSettingsQuery({ userID })],
      awaitRefetchQueries: true,
    });

    // Clear overrides after the server data has been refetched
    dispatchOverrides({ type: 'clear' });
  };

  const showSpaceAdminSettings = isPlatformAdmin || isSpaceAdmin || isSpaceLead;

  return (
    <UserAdminLayout currentTab={SettingsSection.Notifications}>
      <PageContent background="transparent">
        {loading && <Loading />}
        {!loading && (
          <>
            {isPushAvailable && (
              <PageContentColumn columns={12}>
                <PageContentBlock>
                  <BlockTitle>{t('pages.userNotificationsSettings.push.masterToggle')}</BlockTitle>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Switch
                      checked={isPushSubscribed}
                      onChange={handlePushMasterToggle}
                      disabled={pushLoading}
                      aria-label={t('pages.userNotificationsSettings.push.masterToggle')}
                    />
                    <Caption>{t('pages.userNotificationsSettings.push.masterToggleDescription')}</Caption>
                  </Box>
                  {pushPermissionState === 'denied' && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      {t('pages.userNotificationsSettings.push.permissionDenied')}
                    </Alert>
                  )}
                  {isPushAvailable && <PushSubscriptionsList />}
                </PageContentBlock>
              </PageContentColumn>
            )}

            {requiresPWAMode && (
              <PageContentColumn columns={12}>
                <Alert severity="info">{t('pages.userNotificationsSettings.push.requiresPWA')}</Alert>
              </PageContentColumn>
            )}

            <PageContentColumn columns={6}>
              <CombinedSpaceNotificationsSettings
                currentSpaceSettings={currentSettings.space}
                currentSpaceAdminSettings={currentSettings.spaceAdmin}
                onUpdateSettings={(property, type, value) =>
                  handleUpdateSettings({ group: NotificationGroup.SPACE, property, type, value })
                }
                onUpdateSpaceAdminSettings={(property, type, value) =>
                  handleUpdateSettings({ group: NotificationGroup.SPACE_ADMIN, property, type, value })
                }
                showSpaceAdminSettings={showSpaceAdminSettings}
                isPushEnabled={isPushEnabled}
                isPushAvailable={isPushAvailable}
              />

              <CombinedUserNotificationsSettings
                currentUserSettings={currentSettings.user}
                onUpdateSettings={(property, type, value) =>
                  handleUpdateSettings({ group: NotificationGroup.USER, property, type, value })
                }
                isPushEnabled={isPushEnabled}
                isPushAvailable={isPushAvailable}
              />
            </PageContentColumn>

            <PageContentColumn columns={6}>
              <CombinedPlatformNotificationsSettings
                currentPlatformSettings={currentSettings.platform}
                currentPlatformAdminSettings={currentSettings.platformAdmin}
                onUpdatePlatformSettings={(property, type, value) =>
                  handleUpdateSettings({ group: NotificationGroup.PLATFORM, property, type, value })
                }
                onUpdatePlatformAdminSettings={(property, type, value) =>
                  handleUpdateSettings({ group: NotificationGroup.PLATFORM_ADMIN, property, type, value })
                }
                isPlatformAdmin={isPlatformAdmin}
                isPushEnabled={isPushEnabled}
                isPushAvailable={isPushAvailable}
              />

              {(isPlatformAdmin || isOrganizationAdmin) && (
                <OrganizationNotificationsSettings
                  currentOrgSettings={currentSettings.organization}
                  onUpdateSettings={(property, type, value) =>
                    handleUpdateSettings({ group: NotificationGroup.ORGANIZATION, property, type, value })
                  }
                  isPushEnabled={isPushEnabled}
                  isPushAvailable={isPushAvailable}
                />
              )}

              <VCNotificationsSettings
                currentVCSettings={currentSettings.virtualContributor}
                onUpdateSettings={(property, type, value) =>
                  handleUpdateSettings({ group: NotificationGroup.VIRTUAL_CONTRIBUTOR, property, type, value })
                }
                isPushEnabled={isPushEnabled}
                isPushAvailable={isPushAvailable}
              />
            </PageContentColumn>
          </>
        )}
      </PageContent>
    </UserAdminLayout>
  );
};

export default UserAdminNotificationsPage;
