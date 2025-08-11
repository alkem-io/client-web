import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
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
      applicationSubmitted: boolean;
      calloutPublished: boolean;
      commentReply: boolean;
      communicationMention: boolean;
      communicationUpdates: boolean;
      communityInvitationUser: boolean;
      communityNewMember: boolean;
      postCommentCreated: boolean;
      postCreated: boolean;
      whiteboardCreated: boolean;
      // Space Admin notifications
      applicationReceived: boolean;
      postCreatedAdmin: boolean;
      communicationUpdatesAdmin: boolean;
      communityNewMemberAdmin: boolean;
      // Organization notifications
      mentioned: boolean;
      messageReceived: boolean;
      // Forum notifications
      forumDiscussionComment: boolean;
      forumDiscussionCreated: boolean;
      // Platform Admin notifications
      newUserSignUp: boolean;
      userProfileRemoved: boolean;
    }>
  ) => {
    const currentSpaceSettings = currentSettings?.notification?.space;
    const currentOrgSettings = currentSettings?.notification?.organization;
    const currentPlatformSettings = currentSettings?.notification?.platform;

    const settingsVariable = {
      notification: {
        space: {
          applicationReceived: updates.applicationReceived ?? currentSpaceSettings?.applicationReceived,
          applicationSubmitted: updates.applicationSubmitted ?? currentSpaceSettings?.applicationSubmitted,
          calloutPublished: updates.calloutPublished ?? currentSpaceSettings?.calloutPublished,
          commentReply: updates.commentReply ?? currentSpaceSettings?.commentReply,
          communicationMention: updates.communicationMention ?? currentSpaceSettings?.communicationMention,
          communicationUpdates: updates.communicationUpdates ?? currentSpaceSettings?.communicationUpdates,
          communicationUpdatesAdmin:
            updates.communicationUpdatesAdmin ?? currentSpaceSettings?.communicationUpdatesAdmin,
          communityInvitationUser: updates.communityInvitationUser ?? currentSpaceSettings?.communityInvitationUser,
          communityNewMember: updates.communityNewMember ?? currentSpaceSettings?.communityNewMember,
          communityNewMemberAdmin: updates.communityNewMemberAdmin ?? currentSpaceSettings?.communityNewMemberAdmin,
          postCommentCreated: updates.postCommentCreated ?? currentSpaceSettings?.postCommentCreated,
          postCreated: updates.postCreated ?? currentSpaceSettings?.postCreated,
          postCreatedAdmin: updates.postCreatedAdmin ?? currentSpaceSettings?.postCreatedAdmin,
          whiteboardCreated: updates.whiteboardCreated ?? currentSpaceSettings?.whiteboardCreated,
        },
        organization: {
          mentioned: updates.mentioned ?? currentOrgSettings?.mentioned,
          messageReceived: updates.messageReceived ?? currentOrgSettings?.messageReceived,
        },
        platform: {
          forumDiscussionComment: updates.forumDiscussionComment ?? currentPlatformSettings?.forumDiscussionComment,
          forumDiscussionCreated: updates.forumDiscussionCreated ?? currentPlatformSettings?.forumDiscussionCreated,
          newUserSignUp: updates.newUserSignUp ?? currentPlatformSettings?.newUserSignUp,
          userProfileRemoved: updates.userProfileRemoved ?? currentPlatformSettings?.userProfileRemoved,
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
                    applicationSubmitted: {
                      checked: currentSettings?.notification?.space?.applicationSubmitted || false,
                      label: t('pages.userNotificationsSettings.space.settings.applicationSubmitted'),
                    },
                    calloutPublished: {
                      checked: currentSettings?.notification?.space?.calloutPublished || false,
                      label: t('pages.userNotificationsSettings.space.settings.calloutPublished'),
                    },
                    commentReply: {
                      checked: currentSettings?.notification?.space?.commentReply || false,
                      label: t('pages.userNotificationsSettings.space.settings.commentReply'),
                    },
                    communicationMention: {
                      checked: currentSettings?.notification?.space?.communicationMention || false,
                      label: t('pages.userNotificationsSettings.space.settings.communicationMention'),
                    },
                    communicationUpdates: {
                      checked: currentSettings?.notification?.space?.communicationUpdates || false,
                      label: t('pages.userNotificationsSettings.space.settings.communicationUpdates'),
                    },
                    communityInvitationUser: {
                      checked: currentSettings?.notification?.space?.communityInvitationUser || false,
                      label: t('pages.userNotificationsSettings.space.settings.communityInvitationUser'),
                    },
                    communityNewMember: {
                      checked: currentSettings?.notification?.space?.communityNewMember || false,
                      label: t('pages.userNotificationsSettings.space.settings.communityNewMember'),
                    },
                    postCommentCreated: {
                      checked: currentSettings?.notification?.space?.postCommentCreated || false,
                      label: t('pages.userNotificationsSettings.space.settings.postCommentCreated'),
                    },
                    postCreated: {
                      checked: currentSettings?.notification?.space?.postCreated || false,
                      label: t('pages.userNotificationsSettings.space.settings.postCreated'),
                    },

                    whiteboardCreated: {
                      checked: currentSettings?.notification?.space?.whiteboardCreated || false,
                      label: t('pages.userNotificationsSettings.space.settings.whiteboardCreated'),
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
                      applicationReceived: {
                        checked: currentSettings?.notification?.space?.applicationReceived || false,
                        label: t('pages.userNotificationsSettings.spaceAdmin.settings.applicationReceived'),
                      },
                      communicationUpdatesAdmin: {
                        checked: currentSettings?.notification?.space?.communicationUpdatesAdmin || false,
                        label: t('pages.userNotificationsSettings.spaceAdmin.settings.communicationUpdatesAdmin'),
                      },
                      communityNewMemberAdmin: {
                        checked: currentSettings?.notification?.space?.communityNewMemberAdmin || false,
                        label: t('pages.userNotificationsSettings.spaceAdmin.settings.communityNewMemberAdmin'),
                      },
                      postCreatedAdmin: {
                        checked: currentSettings?.notification?.space?.postCreatedAdmin || false,
                        label: t('pages.userNotificationsSettings.spaceAdmin.settings.postCreatedAdmin'),
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
                        checked: currentSettings?.notification?.platform?.newUserSignUp || false,
                        label: t('pages.userNotificationsSettings.platformAdmin.settings.newUserSignUp'),
                      },
                      userProfileRemoved: {
                        checked: currentSettings?.notification?.platform?.userProfileRemoved || false,
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
                      mentioned: {
                        checked: currentSettings?.notification?.organization?.mentioned || false,
                        label: t('pages.userNotificationsSettings.organization.settings.mentioned'),
                      },
                      messageReceived: {
                        checked: currentSettings?.notification?.organization?.messageReceived || false,
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
                      checked: currentSettings?.notification?.platform?.forumDiscussionComment || false,
                      label: t('pages.userNotificationsSettings.forum.settings.forumDiscussionComment'),
                    },
                    forumDiscussionCreated: {
                      checked: currentSettings?.notification?.platform?.forumDiscussionCreated || false,
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
