import UserAdminLayout from '@/domain/community/userAdmin/layout/UserAdminLayout';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import SwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/SwitchSettingsGroup';
import { BlockTitle } from '@/core/ui/typography/components';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContent from '@/core/ui/content/PageContent';
import { Trans, useTranslation } from 'react-i18next';
import Loading from '@/core/ui/loading/Loading';
import { useMemo } from 'react';
import { useUpdateUserSettingsMutation, useUserSettingsQuery } from '@/core/apollo/generated/apollo-hooks';
import { useUserProvider } from '../../user/hooks/useUserProvider';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

const defaultUserSettings = {
  privacy: {
    contributionRolePubliclyVisible: true,
  },
  communication: {
    allowOtherUsersToSendMessages: true,
  },
};

export const UserAdminSettingsPage = () => {
  const { userId } = useUrlResolver();
  const { userModel: userModel, loading: isLoadingUser } = useUserProvider(userId);

  const { t } = useTranslation();
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

  const handleUpdateSettings = async ({
    allowOtherUsersToSendMessages = currentSettings?.communication?.allowOtherUsersToSendMessages ||
      defaultUserSettings.communication.allowOtherUsersToSendMessages,
    contributionRolesPubliclyVisible = currentSettings?.privacy?.contributionRolesPubliclyVisible ||
      defaultUserSettings.privacy.contributionRolePubliclyVisible,
  }: {
    allowOtherUsersToSendMessages?: boolean;
    contributionRolesPubliclyVisible?: boolean;
  }) => {
    const settingsVariable = {
      privacy: {
        contributionRolesPubliclyVisible,
      },
      communication: {
        allowOtherUsersToSendMessages,
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
    <UserAdminLayout currentTab={SettingsSection.Settings}>
      <PageContent background="transparent">
        {!loading && (
          <>
            <PageContentBlock>
              <BlockTitle>{t('pages.admin.user.settings.title')}</BlockTitle>
              <SwitchSettingsGroup
                options={{
                  allowOtherUsersToSendMessages: {
                    checked: currentSettings?.communication?.allowOtherUsersToSendMessages || false,
                    label: (
                      <Trans
                        i18nKey="pages.admin.user.settings.communication.allowOtherUsersToSendMessages"
                        components={{ b: <strong /> }}
                      />
                    ),
                  },
                }}
                onChange={(setting, newValue) => handleUpdateSettings({ [setting]: newValue })}
              />
            </PageContentBlock>
          </>
        )}
      </PageContent>
    </UserAdminLayout>
  );
};

export default UserAdminSettingsPage;
