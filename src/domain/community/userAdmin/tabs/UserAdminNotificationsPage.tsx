import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import UserAdminLayout from '@/domain/community/userAdmin/layout/UserAdminLayout';
import { useMemo } from 'react';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useTranslation } from 'react-i18next';
import { useUserProvider } from '../../user/hooks/useUserProvider';
import { useUpdateUserSettingsMutation, useUserSettingsQuery } from '@/core/apollo/generated/apollo-hooks';
import Loading from '@/core/ui/loading/Loading';
import PageContent from '@/core/ui/content/PageContent';
import { BlockTitle, Caption } from '@/core/ui/typography/components';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import SwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/SwitchSettingsGroup';
import { useCurrentUserContext } from '../../userCurrent/useCurrentUserContext';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import PageContentColumn from '@/core/ui/content/PageContentColumn';

/**
 * User notification settings page component that allows users to configure their notification preferences.
 *
 * Features:
 * - Responsive two-column layout (desktop) / single column (mobile)
 * - Grouped notification settings by category (Space, Organization, Forum, Platform Admin)
 * - Role-based conditional rendering (Space Admin, Organization Admin, Platform Admin)
 *
 * @returns {JSX.Element} The user notifications settings page
 */
const UserAdminNotificationsPage = () => {
  const { t } = useTranslation();
  // NOTE:
  // we might have 2 user definitions on this page.
  // (1) the user whose profile is being viewed;
  // (2) the currently authenticated user;

  // (1)
  const { userId } = useUrlResolver();
  const { userModel: userProfile, loading: isLoadingUser } = useUserProvider(userId);

  // (2)
  const {
    userModel: currentUserModel,
    platformPrivilegeWrapper: userWrapper,
    loading: isLoadingUserContext,
  } = useCurrentUserContext();
  const notificationPageForCurrentUser = userProfile?.id === currentUserModel?.id;

  const isPlatformAdmin = useMemo(() => {
    if (isLoadingUserContext || isLoadingUser) {
      return false;
    }

    if (notificationPageForCurrentUser) {
      return userWrapper?.hasPlatformPrivilege(AuthorizationPrivilege.PlatformAdmin) ?? false;
    }

    return true; // If viewing another user's page, assume platform admin for now.
  }, [notificationPageForCurrentUser, userWrapper, isLoadingUserContext, isLoadingUser]);

  // TODO: impl
  const isOrganizationAdmin = true;
  const isSpaceAdmin = true;

  const userID = userProfile?.id ?? '';

  const { data: userProfileData, loading } = useUserSettingsQuery({
    variables: { userID },
    skip: isLoadingUser || !userID,
  });

  const [updateUserSettings] = useUpdateUserSettingsMutation();

  const currentSettings = useMemo(() => {
    const settings = userProfileData?.lookup.user?.settings;

    return {
      ...settings,
    };
  }, [userProfileData, userID]);

  if (loading) {
    return <Loading />;
  }

  const handleUpdateSettings = async (
    updates: Partial<{
      // Space notifications
      communicationUpdates: boolean;
      collaborationCalloutPublished: boolean;
      collaborationCalloutPostContributionComment: boolean;
      collaborationCalloutContributionCreated: boolean;
      collaborationCalloutComment: boolean;

      // Space Admin notifications
      spaceAdminCommunityNewMember: boolean;
      spaceAdminCommunityApplicationReceived: boolean;
      spaceAdminCollaborationContributionCreated: boolean;

      // Organization notifications
      organizationMentioned: boolean;
      organizationMessageReceived: boolean;

      // Forum notifications
      forumDiscussionComment: boolean;
      forumDiscussionCreated: boolean;

      // Platform Admin notifications
      platformAdminUserProfileCreated: boolean;
      platformAdminUserProfileRemoved: boolean;

      // User notifications
      commentReply: boolean;
      userMentioned: boolean;
      userMessageReceived: boolean;
      userSpaceCommunityApplicationSubmitted: boolean;
      userSpaceCommunityInvitationUser: boolean;
      userSpaceCommunityJoined: boolean;
      userCopyOfMessageSent: boolean;
    }>
  ) => {
    const currentSpaceSettings = currentSettings?.notification?.space;
    const currentOrgSettings = currentSettings?.notification?.organization;
    const currentPlatformSettings = currentSettings?.notification?.platform;
    const currentUserSettings = currentSettings?.notification?.user;

    const settingsVariable = {
      notification: {
        space: {
          communityApplicationReceived:
            updates.spaceAdminCommunityApplicationReceived ??
            currentSpaceSettings?.adminCommunityApplicationReceived.email,
          collaborationCalloutPublished:
            updates.collaborationCalloutPublished ?? currentSpaceSettings?.collaborationCalloutPublished.email,
          communicationUpdates: updates.communicationUpdates ?? currentSpaceSettings?.communicationUpdates.email,
          communityNewMemberAdmin:
            updates.spaceAdminCommunityNewMember ?? currentSpaceSettings?.adminCommunityNewMember.email,
          collaborationPostCommentCreated:
            updates.collaborationCalloutPostContributionComment ??
            currentSpaceSettings?.collaborationCalloutPostContributionComment.email,
          collaborationPostCreated:
            updates.collaborationCalloutContributionCreated ??
            currentSpaceSettings?.collaborationCalloutContributionCreated.email,
          collaborationPostCreatedAdmin:
            updates.spaceAdminCollaborationContributionCreated ??
            currentSpaceSettings?.adminCollaborationContributionCreated.email,
          collaborationWhiteboardCreated:
            updates.collaborationCalloutComment ?? currentSpaceSettings?.collaborationCalloutComment.email,
          // not updatable yet
          communicationMessage: currentSpaceSettings?.adminCommunicationMessageReceived.email,
        },
        organization: {
          adminMentioned: updates.organizationMentioned ?? currentOrgSettings?.adminMentioned.email,
          adminMessageReceived: updates.organizationMessageReceived ?? currentOrgSettings?.adminMessageReceived.email,
        },
        platform: {
          forumDiscussionComment:
            updates.forumDiscussionComment ?? currentPlatformSettings?.forumDiscussionComment.email,
          forumDiscussionCreated:
            updates.forumDiscussionCreated ?? currentPlatformSettings?.forumDiscussionCreated.email,
          adminUserProfileCreated:
            updates.platformAdminUserProfileCreated ?? currentPlatformSettings?.adminUserProfileCreated.email,
          adminUserProfileRemoved:
            updates.platformAdminUserProfileRemoved ?? currentPlatformSettings?.adminUserProfileRemoved.email,
          // Not updatable yet
          adminSpaceCreated: currentPlatformSettings?.adminSpaceCreated.email,
          adminUserGlobalRoleChange: currentPlatformSettings?.adminUserGlobalRoleChange.email,
        },
        user: {
          commentReply: updates.commentReply ?? currentUserSettings?.commentReply.email,
          mentioned: updates.userMentioned ?? currentUserSettings?.mentioned.email,
          communityApplicationSubmitted:
            updates.userSpaceCommunityApplicationSubmitted ??
            currentUserSettings?.spaceCommunityApplicationSubmitted.email,
          communityInvitationUser:
            updates.userSpaceCommunityInvitationUser ?? currentUserSettings?.spaceCommunityInvitationReceived.email,
          communityNewMember: updates.userSpaceCommunityJoined ?? currentUserSettings?.spaceCommunityJoined.email,
          userCopyOfMessageSent: updates.userCopyOfMessageSent ?? currentUserSettings?.copyOfMessageSent.email,
        },
      },
    };

    await updateUserSettings({
      variables: {
        settingsData: {
          userID,
          settings: settingsVariable,
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
              <PageContentBlock>
                <BlockTitle>{t('pages.userNotificationsSettings.space.title')}</BlockTitle>
                <Caption>{t('pages.userNotificationsSettings.space.subtitle')}</Caption>
                <SwitchSettingsGroup
                  options={{
                    communityApplicationSubmitted: {
                      checked: currentSettings?.notification?.space?.adminCommunityApplicationReceived.email || false,
                      label: t('pages.userNotificationsSettings.space.settings.communityApplicationSubmitted'),
                    },
                    collaborationCalloutPublished: {
                      checked: currentSettings?.notification?.space?.collaborationCalloutPublished.email || false,
                      label: t('pages.userNotificationsSettings.space.settings.collaborationCalloutPublished'),
                    },
                    communicationUpdates: {
                      checked: currentSettings?.notification?.space?.communicationUpdates.email || false,
                      label: t('pages.userNotificationsSettings.space.settings.communicationUpdates'),
                    },

                    collaborationPostCommentCreated: {
                      checked:
                        currentSettings?.notification?.space?.collaborationCalloutPostContributionComment.email ||
                        false,
                      label: t('pages.userNotificationsSettings.space.settings.collaborationPostCommentCreated'),
                    },
                    collaborationPostCreated: {
                      checked:
                        currentSettings?.notification?.space?.collaborationCalloutContributionCreated.email || false,
                      label: t('pages.userNotificationsSettings.space.settings.collaborationPostCreated'),
                    },
                    collaborationWhiteboardCreated: {
                      checked: currentSettings?.notification?.space?.collaborationCalloutComment.email || false,
                      label: t('pages.userNotificationsSettings.space.settings.collaborationWhiteboardCreated'),
                    },
                  }}
                  onChange={(setting, newValue) => handleUpdateSettings({ [setting]: newValue })}
                />
              </PageContentBlock>

              {/* User notification settings */}
              <PageContentBlock>
                <BlockTitle>{t('pages.userNotificationsSettings.user.title')}</BlockTitle>
                <Caption>{t('pages.userNotificationsSettings.user.subtitle')}</Caption>
                <SwitchSettingsGroup
                  options={{
                    communityInvitationUser: {
                      checked: currentSettings?.notification?.user?.spaceCommunityInvitationReceived.email || false,
                      label: t('pages.userNotificationsSettings.space.settings.communityInvitationUser'),
                    },
                    communityNewMember: {
                      checked: currentSettings?.notification?.user?.spaceCommunityJoined.email || false,
                      label: t('pages.userNotificationsSettings.space.settings.communityNewMember'),
                    },
                    commentReply: {
                      checked: currentSettings?.notification?.user?.commentReply.email || false,
                      label: t('pages.userNotificationsSettings.user.settings.commentReply'),
                    },
                    userMentioned: {
                      checked: currentSettings?.notification?.user?.mentioned.email || false,
                      label: t('pages.userNotificationsSettings.user.settings.mentioned'),
                    },
                  }}
                  onChange={(setting, newValue) => handleUpdateSettings({ [setting]: newValue })}
                />
              </PageContentBlock>

              {isSpaceAdmin && (
                <PageContentBlock>
                  <BlockTitle>{t('pages.userNotificationsSettings.spaceAdmin.title')}</BlockTitle>
                  <Caption>{t('pages.userNotificationsSettings.spaceAdmin.subtitle')}</Caption>
                  <SwitchSettingsGroup
                    options={{
                      communityApplicationReceived: {
                        checked: currentSettings?.notification?.space?.adminCommunityApplicationReceived.email || false,
                        label: t('pages.userNotificationsSettings.spaceAdmin.settings.communityApplicationReceived'),
                      },
                      communityNewMemberAdmin: {
                        checked: currentSettings?.notification?.space?.adminCommunityNewMember.email || false,
                        label: t('pages.userNotificationsSettings.spaceAdmin.settings.communityNewMemberAdmin'),
                      },
                      collaborationPostCreatedAdmin: {
                        checked:
                          currentSettings?.notification?.space?.adminCollaborationContributionCreated.email || false,
                        label: t('pages.userNotificationsSettings.spaceAdmin.settings.collaborationPostCreatedAdmin'),
                      },
                    }}
                    onChange={(setting, newValue) => handleUpdateSettings({ [setting]: newValue })}
                  />
                </PageContentBlock>
              )}
            </PageContentColumn>

            <PageContentColumn columns={6}>
              {isPlatformAdmin && (
                <PageContentBlock>
                  <BlockTitle>{t('pages.userNotificationsSettings.platformAdmin.title')}</BlockTitle>
                  <Caption>{t('pages.userNotificationsSettings.platformAdmin.subtitle')}</Caption>
                  <SwitchSettingsGroup
                    options={{
                      newUserSignUp: {
                        checked: currentSettings?.notification?.platform?.adminUserProfileCreated.email || false,
                        label: t('pages.userNotificationsSettings.platformAdmin.settings.newUserSignUp'),
                      },
                      userProfileRemoved: {
                        checked: currentSettings?.notification?.platform?.adminUserProfileRemoved.email || false,
                        label: t('pages.userNotificationsSettings.platformAdmin.settings.userProfileRemoved'),
                      },
                    }}
                    onChange={(setting, newValue) => handleUpdateSettings({ [setting]: newValue })}
                  />
                </PageContentBlock>
              )}

              {isOrganizationAdmin && (
                <PageContentBlock>
                  <BlockTitle>{t('pages.userNotificationsSettings.organization.title')}</BlockTitle>
                  <Caption>{t('pages.userNotificationsSettings.organization.subtitle')}</Caption>
                  <SwitchSettingsGroup
                    options={{
                      organizationMentioned: {
                        checked: currentSettings?.notification?.organization?.adminMentioned.email || false,
                        label: t('pages.userNotificationsSettings.organization.settings.mentioned'),
                      },
                      organizationMessageReceived: {
                        checked: currentSettings?.notification?.organization?.adminMessageReceived.email || false,
                        label: t('pages.userNotificationsSettings.organization.settings.messageReceived'),
                      },
                    }}
                    onChange={(setting, newValue) => handleUpdateSettings({ [setting]: newValue })}
                  />
                </PageContentBlock>
              )}

              <PageContentBlock>
                <BlockTitle>{t('pages.userNotificationsSettings.forum.title')}</BlockTitle>
                <Caption>{t('pages.userNotificationsSettings.forum.subtitle')}</Caption>
                <SwitchSettingsGroup
                  options={{
                    forumDiscussionComment: {
                      checked: currentSettings?.notification?.platform?.forumDiscussionComment.email || false,
                      label: t('pages.userNotificationsSettings.forum.settings.forumDiscussionComment'),
                    },
                    forumDiscussionCreated: {
                      checked: currentSettings?.notification?.platform?.forumDiscussionCreated.email || false,
                      label: t('pages.userNotificationsSettings.forum.settings.forumDiscussionCreated'),
                    },
                  }}
                  onChange={(setting, newValue) => handleUpdateSettings({ [setting]: newValue })}
                />
              </PageContentBlock>
            </PageContentColumn>
          </>
        )}
      </PageContent>
    </UserAdminLayout>
  );
};

export default UserAdminNotificationsPage;
