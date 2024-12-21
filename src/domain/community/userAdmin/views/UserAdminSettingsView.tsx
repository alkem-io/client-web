import React, { FC, useMemo } from 'react';
import Loading from '@/core/ui/loading/Loading';
import { Trans, useTranslation } from 'react-i18next';
import { useUserSettingsQuery, useUpdateUserSettingsMutation } from '@/core/apollo/generated/apollo-hooks';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { BlockTitle } from '@/core/ui/typography/components';
import SwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/SwitchSettingsGroup';
import { useUrlParams } from '@/core/routing/useUrlParams';
import { useUserMetadata } from '@/domain/community/user/hooks/useUserMetadata';

const defaultUserSettings = {
  privacy: {
    contributionRolePubliclyVisible: true,
  },
  communication: {
    allowOtherUsersToSendMessages: true,
  },
};

export const UserAdminSettingsView: FC = () => {
  const { userNameId = '' } = useUrlParams();
  const { user: userMetadata, loading: isLoadingUser } = useUserMetadata(userNameId);

  const { t } = useTranslation();
  const userID = userMetadata?.user.id || '';

  const { data, loading } = useUserSettingsQuery({
    variables: { userID },
    skip: isLoadingUser,
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

    // if (showNotification) {
    //   notify(t('pages.admin.space.settings.savedSuccessfully'), 'success');
    // }
  };

  return (
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
  );
};

export default UserAdminSettingsView;
