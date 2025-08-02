import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import UserAdminLayout from '@/domain/community/userAdmin/layout/UserAdminLayout';
import { useMemo } from 'react';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useTranslation } from 'react-i18next';
import { useUserProvider } from '../../user/hooks/useUserProvider';
import { useUpdateUserSettingsMutation, useUserSettingsQuery } from '@/core/apollo/generated/apollo-hooks';
import Loading from '@/core/ui/loading/Loading';
import PageContent from '@/core/ui/content/PageContent';
import { BlockTitle } from '@/core/ui/typography/components';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import SwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/SwitchSettingsGroup';
import { useCurrentUserContext } from '../../userCurrent/useCurrentUserContext';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

const UserAdminNotificationsPage = () => {
  const { t } = useTranslation();
  // Note: there is the page for whom the settings are being show. There is also the user that is currently logged in.

  const { userId } = useUrlResolver();
  const { userModel: userModel, loading: isLoadingUser } = useUserProvider(userId);

  const { userModel: currentUserModel, platformPrivilegeWrapper: userWrapper } = useCurrentUserContext();
  const notificationPageForCurrentUser = userModel?.id === currentUserModel?.id;

  // For most users they will be looking at their own page, so unless they are platform admins they should not see those sections.
  // For platform elevated users they should be able to see all sections.
  let isPlatformAdmin = true;
  if (notificationPageForCurrentUser) {
    isPlatformAdmin = userWrapper?.hasPlatformPrivilege(AuthorizationPrivilege.PlatformAdmin) ?? false;
  }

  // Until can determine quickly if the user for the page being shown has particular roles, we will assume they are an organization and space admin.
  const isOrganizationAdmin = true;
  const isSpaceAdmin = true;

  const userID = userModel?.id ?? '';

  const { data, loading } = useUserSettingsQuery({
    variables: { userID },
    skip: isLoadingUser || !userID,
  });

  const [updateUserSettings] = useUpdateUserSettingsMutation();

  const currentSettings = useMemo(() => {
    const settings = data?.lookup.user?.settings;

    return {
      ...settings,
    };
  }, [data, userID]);

  if (loading) {
    return <Loading />;
  }

  const currentSpaceNotificationSettings = currentSettings?.notification?.space;

  const handleUpdateSettings = async ({
    // Space notifications
    applicationReceived = currentSpaceNotificationSettings?.applicationReceived,
    applicationSubmitted = currentSpaceNotificationSettings?.applicationSubmitted,
    calloutPublished = currentSpaceNotificationSettings?.calloutPublished,
    commentReply = currentSpaceNotificationSettings?.commentReply,
    communicationMention = currentSpaceNotificationSettings?.communicationMention,
    communicationUpdates = currentSpaceNotificationSettings?.communicationUpdates,
    communicationUpdatesAdmin = currentSpaceNotificationSettings?.communicationUpdatesAdmin,
    communityInvitationUser = currentSpaceNotificationSettings?.communityInvitationUser,
    communityNewMember = currentSpaceNotificationSettings?.communityNewMember,
    communityNewMemberAdmin = currentSpaceNotificationSettings?.communityNewMemberAdmin,
    postCommentCreated = currentSpaceNotificationSettings?.postCommentCreated,
    postCreated = currentSpaceNotificationSettings?.postCreated,
    postCreatedAdmin = currentSpaceNotificationSettings?.postCreatedAdmin,
    whiteboardCreated = currentSpaceNotificationSettings?.whiteboardCreated,
    // Organization notifications
    mentioned = currentSettings?.notification?.organization?.mentioned,
    messageReceived = currentSettings?.notification?.organization?.messageReceived,
    // Platform notifications
    forumDiscussionComment = currentSettings?.notification?.platform?.forumDiscussionComment,
    forumDiscussionCreated = currentSettings?.notification?.platform?.forumDiscussionCreated,
    newUserSignUp = currentSettings?.notification?.platform?.newUserSignUp,
    userProfileRemoved = currentSettings?.notification?.platform?.userProfileRemoved,
  }: {
    // Space notifications
    applicationReceived?: boolean;
    applicationSubmitted?: boolean;
    calloutPublished?: boolean;
    commentReply?: boolean;
    communicationMention?: boolean;
    communicationUpdates?: boolean;
    communicationUpdatesAdmin?: boolean;
    communityInvitationUser?: boolean;
    communityNewMember?: boolean;
    communityNewMemberAdmin?: boolean;
    postCommentCreated?: boolean;
    postCreated?: boolean;
    postCreatedAdmin?: boolean;
    whiteboardCreated?: boolean;
    // Organization notifications
    mentioned?: boolean;
    messageReceived?: boolean;
    // Platform notifications
    forumDiscussionComment?: boolean;
    forumDiscussionCreated?: boolean;
    newUserSignUp?: boolean;
    userProfileRemoved?: boolean;
  }) => {
    const settingsVariable = {
      notification: {
        space: {
          applicationReceived,
          applicationSubmitted,
          calloutPublished,
          commentReply,
          communicationMention,
          communicationUpdates,
          communicationUpdatesAdmin,
          communityInvitationUser,
          communityNewMember,
          communityNewMemberAdmin,
          postCommentCreated,
          postCreated,
          postCreatedAdmin,
          whiteboardCreated,
        },
        organization: {
          mentioned,
          messageReceived,
        },
        platform: {
          forumDiscussionComment,
          forumDiscussionCreated,
          newUserSignUp,
          userProfileRemoved,
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
        {!loading && (
          <>
            <PageContentBlock>
              <BlockTitle>{t('pages.user-notifications-settings.space', 'Space settings')}</BlockTitle>
              <SwitchSettingsGroup
                options={{
                  applicationSubmitted: {
                    checked: currentSettings?.notification?.space?.applicationSubmitted || false,
                    label: t('pages.user-notifications-settings.general.applicationSubmitted', 'Application Submitted'),
                  },
                  calloutPublished: {
                    checked: currentSettings?.notification?.space?.calloutPublished || false,
                    label: t('pages.user-notifications-settings.general.calloutPublished', 'Callout Published'),
                  },
                  commentReply: {
                    checked: currentSettings?.notification?.space?.commentReply || false,
                    label: t('pages.user-notifications-settings.general.commentReply', 'Comment Reply'),
                  },
                  communicationMention: {
                    checked: currentSettings?.notification?.space?.communicationMention || false,
                    label: t(
                      'pages.user-notifications-settings.user-communication.communicationMention',
                      'Communication Mention'
                    ),
                  },
                  communicationUpdates: {
                    checked: currentSettings?.notification?.space?.communicationUpdates || false,
                    label: t(
                      'pages.user-notifications-settings.user-communication.communicationUpdates',
                      'Communication Updates'
                    ),
                  },
                  communityInvitationUser: {
                    checked: currentSettings?.notification?.space?.communityInvitationUser || false,
                    label: t(
                      'pages.user-notifications-settings.general.communityInvitationUser',
                      'Community Invitation'
                    ),
                  },
                  communityNewMember: {
                    checked: currentSettings?.notification?.space?.communityNewMember || false,
                    label: t('pages.user-notifications-settings.general.communityNewMember', 'New Community Member'),
                  },
                  postCommentCreated: {
                    checked: currentSettings?.notification?.space?.postCommentCreated || false,
                    label: t('pages.user-notifications-settings.general.postCommentCreated', 'Post Comment Created'),
                  },
                  postCreated: {
                    checked: currentSettings?.notification?.space?.postCreated || false,
                    label: t('pages.user-notifications-settings.general.postCreated', 'Post Created'),
                  },

                  whiteboardCreated: {
                    checked: currentSettings?.notification?.space?.whiteboardCreated || false,
                    label: t('pages.user-notifications-settings.general.whiteboardCreated', 'Whiteboard Created'),
                  },
                }}
                onChange={(setting, newValue) => handleUpdateSettings({ [setting]: newValue })}
              />
            </PageContentBlock>

            {isSpaceAdmin && (
              <PageContentBlock>
                <BlockTitle>{t('pages.user-notifications-settings.space', 'Space admin settings')}</BlockTitle>
                <SwitchSettingsGroup
                  options={{
                    applicationReceived: {
                      checked: currentSettings?.notification?.space?.applicationReceived || false,
                      label: t('pages.user-notifications-settings.general.applicationReceived', 'Application Received'),
                    },
                    communicationUpdatesAdmin: {
                      checked: currentSettings?.notification?.space?.communicationUpdatesAdmin || false,
                      label: t(
                        'pages.user-notifications-settings.community-administration.communicationUpdatesAdmin',
                        'Communication Updates (Admin)'
                      ),
                    },
                    communityNewMemberAdmin: {
                      checked: currentSettings?.notification?.space?.communityNewMemberAdmin || false,
                      label: t(
                        'pages.user-notifications-settings.community-administration.communityNewMemberAdmin',
                        'New Community Member (Admin)'
                      ),
                    },
                    postCreatedAdmin: {
                      checked: currentSettings?.notification?.space?.postCreatedAdmin || false,
                      label: t(
                        'pages.user-notifications-settings.community-administration.postCreatedAdmin',
                        'Post Created (Admin)'
                      ),
                    },
                  }}
                  onChange={(setting, newValue) => handleUpdateSettings({ [setting]: newValue })}
                />
              </PageContentBlock>
            )}

            {isOrganizationAdmin && (
              <PageContentBlock>
                <BlockTitle>{t('pages.user-notifications-settings.organization-communication.title')}</BlockTitle>
                <SwitchSettingsGroup
                  options={{
                    mentioned: {
                      checked: currentSettings?.notification?.organization?.mentioned || false,
                      label: t(
                        'pages.user-notifications-settings.organization-communication.mentioned',
                        'Organization Mentioned'
                      ),
                    },
                    messageReceived: {
                      checked: currentSettings?.notification?.organization?.messageReceived || false,
                      label: t(
                        'pages.user-notifications-settings.organization-communication.messageReceived',
                        'Message Received'
                      ),
                    },
                  }}
                  onChange={(setting, newValue) => handleUpdateSettings({ [setting]: newValue })}
                />
              </PageContentBlock>
            )}

            <PageContentBlock>
              <BlockTitle>{t('pages.user-notifications-settings.platform.forum', 'Forum')}</BlockTitle>
              <SwitchSettingsGroup
                options={{
                  forumDiscussionComment: {
                    checked: currentSettings?.notification?.platform?.forumDiscussionComment || false,
                    label: t(
                      'pages.user-notifications-settings.forum.forumDiscussionComment',
                      'Forum Discussion Comment'
                    ),
                  },
                  forumDiscussionCreated: {
                    checked: currentSettings?.notification?.platform?.forumDiscussionCreated || false,
                    label: t(
                      'pages.user-notifications-settings.forum.forumDiscussionCreated',
                      'Forum Discussion Created'
                    ),
                  },
                }}
                onChange={(setting, newValue) => handleUpdateSettings({ [setting]: newValue })}
              />
            </PageContentBlock>
            {isPlatformAdmin && (
              <PageContentBlock>
                <BlockTitle>{t('pages.user-notifications-settings.platform.admin', 'Platform Admin')}</BlockTitle>
                <SwitchSettingsGroup
                  options={{
                    newUserSignUp: {
                      checked: currentSettings?.notification?.platform?.newUserSignUp || false,
                      label: t(
                        'pages.user-notifications-settings.user-administration.newUserSignUp',
                        'New User Sign Up'
                      ),
                    },
                    userProfileRemoved: {
                      checked: currentSettings?.notification?.platform?.userProfileRemoved || false,
                      label: t(
                        'pages.user-notifications-settings.user-administration.userProfileRemoved',
                        'User Profile Removed'
                      ),
                    },
                  }}
                  onChange={(setting, newValue) => handleUpdateSettings({ [setting]: newValue })}
                />
              </PageContentBlock>
            )}
          </>
        )}
      </PageContent>
    </UserAdminLayout>
  );
};

export default UserAdminNotificationsPage;
