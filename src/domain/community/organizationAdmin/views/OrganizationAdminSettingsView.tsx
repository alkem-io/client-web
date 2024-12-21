import React, { FC, useMemo } from 'react';
import { useOrganization } from '@/domain/community/contributor/organization/hooks/useOrganization';
import Loading from '@/core/ui/loading/Loading';
import { Trans, useTranslation } from 'react-i18next';
import {
  useOrganizationSettingsQuery,
  useUpdateOrganizationSettingsMutation,
} from '@/core/apollo/generated/apollo-hooks';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { BlockTitle } from '@/core/ui/typography/components';
import SwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/SwitchSettingsGroup';

const defaultOrganizationSettings = {
  privacy: {
    contributionRolePubliclyVisible: true,
  },
  membership: {
    allowUsersMatchingDomainToJoin: false,
  },
};

export const OrganizationAdminSettingsView: FC = () => {
  const { organizationId, loading: isLoadingOrganization } = useOrganization();
  const { t } = useTranslation();

  const { data, loading } = useOrganizationSettingsQuery({
    variables: { orgId: organizationId },
    skip: isLoadingOrganization,
  });

  const [updateOrganizationSettings] = useUpdateOrganizationSettingsMutation();

  const currentSettings = useMemo(() => {
    const settings = data?.organization.settings;
    return {
      ...settings,
    };
  }, [data, organizationId]);

  if (loading) {
    return <Loading />;
  }

  const handleUpdateSettings = async ({
    allowUsersMatchingDomainToJoin = currentSettings?.membership?.allowUsersMatchingDomainToJoin ||
      defaultOrganizationSettings.membership.allowUsersMatchingDomainToJoin,
    contributionRolesPubliclyVisible = currentSettings?.privacy?.contributionRolesPubliclyVisible ||
      defaultOrganizationSettings.privacy.contributionRolePubliclyVisible,
  }: {
    allowUsersMatchingDomainToJoin?: boolean;
    contributionRolesPubliclyVisible?: boolean;
  }) => {
    const settingsVariable = {
      privacy: {
        contributionRolesPubliclyVisible,
      },
      membership: {
        allowUsersMatchingDomainToJoin,
      },
    };

    await updateOrganizationSettings({
      variables: {
        settingsData: {
          organizationID: organizationId,
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
            <BlockTitle>{t('pages.admin.organization.settings.title')}</BlockTitle>
            <SwitchSettingsGroup
              options={{
                allowUsersMatchingDomainToJoin: {
                  checked: currentSettings?.membership?.allowUsersMatchingDomainToJoin || false,
                  label: (
                    <Trans
                      i18nKey="pages.admin.organization.settings.membership.usersMatchingEmail"
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

export default OrganizationAdminSettingsView;
