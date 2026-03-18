import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Switch } from '@mui/material';
import { useUpdateUserSettingsMutation, useUserSettingsQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  type UpdateUserSettingsNotificationInput,
} from '@/core/apollo/generated/graphql-schema';
import type { ChannelType } from '@/core/ui/forms/SettingsGroups/types/NotificationTypes';
import PageContent from '@/core/ui/content/PageContent';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
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
  });

  const [updateUserSettings] = useUpdateUserSettingsMutation();

  // Current settings grouped by category with proper model
  const currentSettings = useMemo((): NotificationSettings => {
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
  const buildSpaceSettings = (property: string, type: ChannelType, value: boolean) => ({
    communicationUpdates: createNotificationChannel(type, property, 'communicationUpdates', value, currentSettings.space?.communicationUpdates),
    collaborationCalloutPublished: createNotificationChannel(type, property, 'collaborationCalloutPublished', value, currentSettings.space?.collaborationCalloutPublished),
    collaborationCalloutPostContributionComment: createNotificationChannel(type, property, 'collaborationCalloutPostContributionComment', value, currentSettings.space?.collaborationCalloutPostContributionComment),
    collaborationCalloutContributionCreated: createNotificationChannel(type, property, 'collaborationCalloutContributionCreated', value, currentSettings.space?.collaborationCalloutContributionCreated),
    collaborationCalloutComment: createNotificationChannel(type, property, 'collaborationCalloutComment', value, currentSettings.space?.collaborationCalloutComment),
    communityCalendarEvents: createNotificationChannel(type, property, 'communityCalendarEvents', value, currentSettings.space?.communityCalendarEvents),
  });

  const buildSpaceAdminSettings = (property: string, type: ChannelType, value: boolean) => ({
    communityApplicationReceived: createNotificationChannel(type, property, 'communityApplicationReceived', value, currentSettings.spaceAdmin?.communityApplicationReceived),
    communityNewMember: createNotificationChannel(type, property, 'communityNewMember', value, currentSettings.spaceAdmin?.communityNewMember),
    collaborationCalloutContributionCreated: createNotificationChannel(type, property, 'collaborationCalloutContributionCreated', value, currentSettings.spaceAdmin?.collaborationCalloutContributionCreated),
    communicationMessageReceived: createNotificationChannel(type, property, 'communicationMessageReceived', value, currentSettings.spaceAdmin?.communicationMessageReceived),
  });

  const buildUserSettings = (property: string, type: ChannelType, value: boolean) => ({
    commentReply: createNotificationChannel(type, property, 'commentReply', value, currentSettings.user?.commentReply),
    mentioned: createNotificationChannel(type, property, 'mentioned', value, currentSettings.user?.mentioned),
    messageReceived: createNotificationChannel(type, property, 'messageReceived', value, currentSettings.user?.messageReceived),
    membership: {
      spaceCommunityInvitationReceived: createNotificationChannel(type, property, 'membership.spaceCommunityInvitationReceived', value, currentSettings.user?.membership?.spaceCommunityInvitationReceived),
      spaceCommunityJoined: createNotificationChannel(type, property, 'membership.spaceCommunityJoined', value, currentSettings.user?.membership?.spaceCommunityJoined),
    },
  });

  const buildOrganizationSettings = (property: string, type: ChannelType, value: boolean) => ({
    adminMentioned: createNotificationChannel(type, property, 'adminMentioned', value, currentSettings.organization?.adminMentioned),
    adminMessageReceived: createNotificationChannel(type, property, 'adminMessageReceived', value, currentSettings.organization?.adminMessageReceived),
  });

  const buildPlatformSettings = (property: string, type: ChannelType, value: boolean) => ({
    forumDiscussionComment: createNotificationChannel(type, property, 'forumDiscussionComment', value, currentSettings.platform?.forumDiscussionComment),
    forumDiscussionCreated: createNotificationChannel(type, property, 'forumDiscussionCreated', value, currentSettings.platform?.forumDiscussionCreated),
  });

  const buildPlatformAdminSettings = (property: string, type: ChannelType, value: boolean) => ({
    userProfileCreated: createNotificationChannel(type, property, 'userProfileCreated', value, currentSettings.platformAdmin?.userProfileCreated),
    userProfileRemoved: createNotificationChannel(type, property, 'userProfileRemoved', value, currentSettings.platformAdmin?.userProfileRemoved),
    userGlobalRoleChanged: createNotificationChannel(type, property, 'userGlobalRoleChanged', value, currentSettings.platformAdmin?.userGlobalRoleChanged),
    spaceCreated: createNotificationChannel(type, property, 'spaceCreated', value, currentSettings.platformAdmin?.spaceCreated),
  });

  const buildVCSettings = (property: string, type: ChannelType, value: boolean) => ({
    adminSpaceCommunityInvitation: createNotificationChannel(type, property, 'adminSpaceCommunityInvitation', value, currentSettings.virtualContributor?.adminSpaceCommunityInvitation),
  });

  // Unified update handler that processes a single notification setting update
  const handleUpdateSettings = async ({ group, property, type, value }: NotificationUpdate) => {
    const settingsVariable: UpdateUserSettingsNotificationInput = {};

    switch (group) {
      case NotificationGroup.SPACE:
        settingsVariable.space = buildSpaceSettings(property, type, value);
        break;

      case NotificationGroup.SPACE_ADMIN:
        settingsVariable.space = {
          communicationUpdates: preserveChannel(currentSettings.space?.communicationUpdates),
          collaborationCalloutPublished: preserveChannel(currentSettings.space?.collaborationCalloutPublished),
          collaborationCalloutPostContributionComment: preserveChannel(currentSettings.space?.collaborationCalloutPostContributionComment),
          collaborationCalloutContributionCreated: preserveChannel(currentSettings.space?.collaborationCalloutContributionCreated),
          collaborationCalloutComment: preserveChannel(currentSettings.space?.collaborationCalloutComment),
          communityCalendarEvents: preserveChannel(currentSettings.space?.communityCalendarEvents),
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
          forumDiscussionComment: preserveChannel(currentSettings.platform?.forumDiscussionComment),
          forumDiscussionCreated: preserveChannel(currentSettings.platform?.forumDiscussionCreated),
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
    });
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
                  {isPushEnabled && <PushSubscriptionsList />}
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
