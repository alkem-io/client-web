import { FormControlLabel, Switch, Typography } from '@mui/material';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useUpdateUserSettingsMutation, useUserSettingsQuery } from '@/core/apollo/generated/apollo-hooks';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import SwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/SwitchSettingsGroup';
import Loading from '@/core/ui/loading/Loading';
import { BlockTitle } from '@/core/ui/typography/components';
import UserAdminLayout from '@/domain/community/userAdmin/layout/UserAdminLayout';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import { useUserProvider } from '../../user/hooks/useUserProvider';
import useUserRouteContext from '../../user/routing/useUserRouteContext';
import { useCurrentUserContext } from '../../userCurrent/useCurrentUserContext';

const CRD_STORAGE_KEY = 'alkemio-crd-enabled';

export const UserAdminSettingsPage = () => {
  const { userId } = useUserRouteContext();
  const { userModel, loading: isLoadingUser } = useUserProvider(userId);
  const { userModel: currentUserModel, platformRoles } = useCurrentUserContext();

  const { t } = useTranslation();
  const userID = userModel?.id ?? '';

  const { data, loading } = useUserSettingsQuery({
    variables: { userID },
    skip: isLoadingUser || !userID,
  });

  const [updateUserSettings] = useUpdateUserSettingsMutation();

  const [isNewDesign, setIsNewDesign] = useState(() => {
    try {
      return localStorage.getItem(CRD_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const currentSettings = (() => {
    const settings = data?.lookup.user?.settings;

    return {
      ...settings,
    };
  })();

  if (loading) {
    return <Loading />;
  }

  const handleUpdateSettings = async ({
    allowOtherUsersToSendMessages = currentSettings?.communication?.allowOtherUsersToSendMessages,
    contributionRolesPubliclyVisible = currentSettings?.privacy?.contributionRolesPubliclyVisible,
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

  const handleDesignSystemChange = (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    try {
      if (checked) {
        localStorage.setItem(CRD_STORAGE_KEY, 'true');
      } else {
        localStorage.removeItem(CRD_STORAGE_KEY);
      }
    } catch {
      return;
    }
    setIsNewDesign(checked);
    location.reload();
  };

  const isBetaTester = currentUserModel?.id === userID && platformRoles.includes(RoleName.PlatformBetaTester);

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
            {isBetaTester && (
              <PageContentBlock>
                <BlockTitle>{t('pages.admin.user.settings.designSystem.title')}</BlockTitle>
                <Typography variant="body2">{t('pages.admin.user.settings.designSystem.description')}</Typography>
                <FormControlLabel
                  control={<Switch checked={isNewDesign} onChange={handleDesignSystemChange} />}
                  label={t('pages.admin.user.settings.designSystem.toggleLabel')}
                />
              </PageContentBlock>
            )}
          </>
        )}
      </PageContent>
    </UserAdminLayout>
  );
};

export default UserAdminSettingsPage;
