import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import UserAdminLayout from '@/domain/community/userAdmin/layout/UserAdminLayout';
import { useMemo } from 'react';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useUserProvider } from '../../user/hooks/useUserProvider';
import { useUpdateUserSettingsMutation, useUserSettingsQuery } from '@/core/apollo/generated/apollo-hooks';
import Loading from '@/core/ui/loading/Loading';
import PageContent from '@/core/ui/content/PageContent';
import { useCurrentUserContext } from '../../userCurrent/useCurrentUserContext';
import { AuthorizationPrivilege, UpdateUserSettingsNotificationInput } from '@/core/apollo/generated/graphql-schema';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import { SpaceNotificationsSettings } from './components/SpaceNotificationsSettings';
import { SpaceAdminNotificationsSettings } from './components/SpaceAdminNotificationsSettings';
import { UserNotificationsSettings } from './components/UserNotificationsSettings';
import { UserMembershipNotificationsSettings } from './components/UserMembershipNotificationsSettings';
import { OrganizationNotificationsSettings } from './components/OrganizationNotificationsSettings';
import { PlatformAdminNotificationsSettings } from './components/PlatformAdminNotificationsSettings';
import { ForumNotificationsSettings } from './components/ForumNotificationsSettings';
import {
  NotificationSettings,
  SpaceNotificationSettings,
  SpaceAdminNotificationSettings,
  UserNotificationSettings,
  OrganizationNotificationSettings,
  PlatformNotificationSettings,
  PlatformAdminNotificationSettings,
} from '@/domain/community/userAdmin/tabs/model/NotificationSettings.model';

// Notification groups enum for explicit handling
export enum NotificationGroup {
  SPACE = 'space',
  SPACE_ADMIN = 'spaceAdmin',
  USER = 'user',
  ORGANIZATION = 'organization',
  PLATFORM = 'platform',
  PLATFORM_ADMIN = 'platformAdmin',
}

type NotificationUpdate = {
  group: NotificationGroup;
  property: string;
  value: boolean;
};

/**
 * User notification settings page component that allows users to configure their notification preferences.
 *
 * Features:
 * - Responsive two-column layout (desktop) / single column (mobile)
 * - Grouped notification settings by category (Space, Organization, Forum, Platform Admin)
 * - Role-based conditional rendering (Space Admin, Organization Admin, Platform Admin)
 * - Modular component structure with separate view components for each notification group
 *
 * @returns {JSX.Element} The user notifications settings page
 */
const UserAdminNotificationsPage = () => {
  // User profile being viewed
  const { userId } = useUrlResolver();
  const { userModel: userProfile, loading: isLoadingUser } = useUserProvider(userId);

  // Current authenticated user
  const {
    userModel: currentUserModel,
    platformPrivilegeWrapper: userWrapper,
    loading: isLoadingUserContext,
  } = useCurrentUserContext();

  const notificationPageForCurrentUser = userProfile?.id === currentUserModel?.id;

  // Role-based permissions
  const isPlatformAdmin = useMemo(() => {
    if (isLoadingUserContext || isLoadingUser) return false;
    if (notificationPageForCurrentUser) {
      return userWrapper?.hasPlatformPrivilege(AuthorizationPrivilege.PlatformAdmin) ?? false;
    }
    return true; // If viewing another user's page, assume platform admin for now.
  }, [notificationPageForCurrentUser, userWrapper, isLoadingUserContext, isLoadingUser]);

  const isOrganizationAdmin =
    userWrapper?.hasPlatformPrivilege(AuthorizationPrivilege.ReceiveNotificationsOrganizationAdmin) ?? false;
  const isSpaceAdmin =
    userWrapper?.hasPlatformPrivilege(AuthorizationPrivilege.ReceiveNotificationsSpaceAdmin) ?? false;

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
    };
  }, [userProfileData]);

  if (loading || isLoadingUser) {
    return <Loading />;
  }

  // Unified update handler that processes a single notification setting update
  const handleUpdateSettings = async ({ group, property, value }: NotificationUpdate) => {
    const settingsVariable: UpdateUserSettingsNotificationInput = {};

    switch (group) {
      case NotificationGroup.SPACE:
        settingsVariable.space = {
          // Preserve existing space settings
          communicationUpdates: currentSettings.space?.communicationUpdates?.email ?? false,
          collaborationCalloutPublished: currentSettings.space?.collaborationCalloutPublished?.email ?? false,
          collaborationCalloutPostContributionComment:
            currentSettings.space?.collaborationCalloutPostContributionComment?.email ?? false,
          collaborationCalloutContributionCreated:
            currentSettings.space?.collaborationCalloutContributionCreated?.email ?? false,
          collaborationCalloutComment: currentSettings.space?.collaborationCalloutComment?.email ?? false,
          // Override the specific property
          [property]: value,
        };
        break;

      case NotificationGroup.SPACE_ADMIN:
        settingsVariable.space = {
          // Preserve existing space settings
          communicationUpdates: currentSettings.space?.communicationUpdates?.email ?? false,
          collaborationCalloutPublished: currentSettings.space?.collaborationCalloutPublished?.email ?? false,
          collaborationCalloutPostContributionComment:
            currentSettings.space?.collaborationCalloutPostContributionComment?.email ?? false,
          collaborationCalloutContributionCreated:
            currentSettings.space?.collaborationCalloutContributionCreated?.email ?? false,
          collaborationCalloutComment: currentSettings.space?.collaborationCalloutComment?.email ?? false,
          admin: {
            // Preserve existing space admin settings
            communityApplicationReceived: currentSettings.spaceAdmin?.communityApplicationReceived?.email ?? false,
            communityNewMember: currentSettings.spaceAdmin?.communityNewMember?.email ?? false,
            collaborationCalloutContributionCreated:
              currentSettings.spaceAdmin?.collaborationCalloutContributionCreated?.email ?? false,
            communicationMessageReceived: currentSettings.spaceAdmin?.communicationMessageReceived?.email ?? false,
            // Override the specific property
            [property]: value,
          },
        };
        break;

      case NotificationGroup.USER: {
        const userSettings = {
          // Preserve existing user settings
          commentReply: currentSettings.user?.commentReply?.email ?? false,
          mentioned: currentSettings.user?.mentioned?.email ?? false,
          messageReceived: currentSettings.user?.messageReceived?.email ?? false,
          copyOfMessageSent: currentSettings.user?.copyOfMessageSent?.email ?? false,
          membership: {
            spaceCommunityInvitationReceived:
              currentSettings.user?.membership?.spaceCommunityInvitationReceived?.email ?? false,
            spaceCommunityJoined: currentSettings.user?.membership?.spaceCommunityJoined?.email ?? false,
            spaceCommunityApplicationSubmitted:
              currentSettings.user?.membership?.spaceCommunityApplicationSubmitted?.email ?? false,
          },
        };

        // Handle nested membership properties
        if (property.startsWith('membership.')) {
          const membershipProperty = property.replace('membership.', '');
          userSettings.membership[membershipProperty] = value;
        } else {
          userSettings[property] = value;
        }

        settingsVariable.user = userSettings;
        break;
      }

      case NotificationGroup.ORGANIZATION:
        settingsVariable.organization = {
          // Preserve existing organization settings
          adminMentioned: currentSettings.organization?.adminMentioned?.email ?? false,
          adminMessageReceived: currentSettings.organization?.adminMessageReceived?.email ?? false,
          // Override the specific property
          [property]: value,
        };
        break;

      case NotificationGroup.PLATFORM:
        settingsVariable.platform = {
          // Preserve existing platform settings
          forumDiscussionComment: currentSettings.platform?.forumDiscussionComment?.email ?? false,
          forumDiscussionCreated: currentSettings.platform?.forumDiscussionCreated?.email ?? false,
          // Override the specific property
          [property]: value,
        };
        break;

      case NotificationGroup.PLATFORM_ADMIN:
        settingsVariable.platform = {
          // Preserve existing platform settings
          forumDiscussionComment: currentSettings.platform?.forumDiscussionComment?.email ?? false,
          forumDiscussionCreated: currentSettings.platform?.forumDiscussionCreated?.email ?? false,
          admin: {
            // Preserve existing platform admin settings
            userProfileCreated: currentSettings.platformAdmin?.userProfileCreated?.email ?? false,
            userProfileRemoved: currentSettings.platformAdmin?.userProfileRemoved?.email ?? false,
            userGlobalRoleChanged: currentSettings.platformAdmin?.userGlobalRoleChanged?.email ?? false,
            spaceCreated: currentSettings.platformAdmin?.spaceCreated?.email ?? false,
            // Override the specific property
            [property]: value,
          },
        };
        break;

      default:
        console.warn(`Unknown notification group: ${group}`);
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

  return (
    <UserAdminLayout currentTab={SettingsSection.Notifications}>
      <PageContent background="transparent">
        {loading && <Loading />}
        {!loading && (
          <>
            <PageContentColumn columns={6}>
              <SpaceNotificationsSettings
                currentSpaceSettings={currentSettings.space}
                onUpdateSettings={(property, value) =>
                  handleUpdateSettings({ group: NotificationGroup.SPACE, property, value })
                }
              />

              <UserMembershipNotificationsSettings
                currentUserSettings={currentSettings.user}
                onUpdateSettings={(property, value) =>
                  handleUpdateSettings({ group: NotificationGroup.USER, property, value })
                }
              />

              <UserNotificationsSettings
                currentUserSettings={currentSettings.user}
                onUpdateSettings={(property, value) =>
                  handleUpdateSettings({ group: NotificationGroup.USER, property, value })
                }
              />

              {(isPlatformAdmin || isSpaceAdmin) && (
                <SpaceAdminNotificationsSettings
                  currentSpaceAdminSettings={currentSettings.spaceAdmin}
                  onUpdateSettings={(property, value) =>
                    handleUpdateSettings({ group: NotificationGroup.SPACE_ADMIN, property, value })
                  }
                />
              )}
            </PageContentColumn>

            <PageContentColumn columns={6}>
              {isPlatformAdmin && (
                <PlatformAdminNotificationsSettings
                  currentPlatformAdminSettings={currentSettings.platformAdmin}
                  onUpdateSettings={(property, value) =>
                    handleUpdateSettings({ group: NotificationGroup.PLATFORM_ADMIN, property, value })
                  }
                />
              )}

              {(isPlatformAdmin || isOrganizationAdmin) && (
                <OrganizationNotificationsSettings
                  currentOrgSettings={currentSettings.organization}
                  onUpdateSettings={(property, value) =>
                    handleUpdateSettings({ group: NotificationGroup.ORGANIZATION, property, value })
                  }
                />
              )}

              <ForumNotificationsSettings
                currentPlatformSettings={currentSettings.platform}
                onUpdateSettings={(property, value) =>
                  handleUpdateSettings({ group: NotificationGroup.PLATFORM, property, value })
                }
              />
            </PageContentColumn>
          </>
        )}
      </PageContent>
    </UserAdminLayout>
  );
};

export default UserAdminNotificationsPage;
