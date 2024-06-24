import React from 'react';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import {
  useUpdateVirtualContributorMutation,
  useVirtualContributorQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContent from '../../../../core/ui/content/PageContent';
import { StorageConfigContextProvider } from '../../../storage/StorageBucket/StorageConfigContext';
import { Trans } from 'react-i18next';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/constants';
import VCSettingsPageLayout from '../layout/VCSettingsPageLayout';
import SwitchSettingsGroup from '../../../../core/ui/forms/SettingsGroups/SwitchSettingsGroup';
import { useNotification } from '../../../../core/ui/notifications/useNotification';

interface VCAccessibilityProps {
  listedInStore?: boolean;
}

export const VCAccessibilitySettingsPage = () => {
  const { vcNameId = '' } = useUrlParams();

  const notify = useNotification();

  const { data } = useVirtualContributorQuery({
    variables: {
      id: vcNameId,
    },
  });

  const [updateContributorMutation] = useUpdateVirtualContributorMutation();

  const handleUpdate = (props: VCAccessibilityProps) => {
    updateContributorMutation({
      variables: {
        virtualContributorData: {
          ID: data?.virtualContributor?.id ?? '',
          ...props,
        },
      },
      onCompleted: () => {
        notify('Settings updated successfully', 'success');
      },
    });
  };

  const updateListedInStore = (newValue: boolean) => {
    handleUpdate({ listedInStore: newValue });
  };

  return (
    <StorageConfigContextProvider locationType="platform">
      <VCSettingsPageLayout currentTab={SettingsSection.Settings}>
        <PageContent background="background.paper">
          <PageContentColumn columns={12}>
            <PageContentBlock>
              <SwitchSettingsGroup
                options={{
                  listedInStore: {
                    checked: data?.virtualContributor?.listedInStore || false,
                    label: (
                      <Trans
                        i18nKey="pages.virtualContributorProfile.settings.listedInStoreOption"
                        components={{ b: <strong /> }}
                      />
                    ),
                  },
                }}
                onChange={(event, newValue) => updateListedInStore(newValue)}
              />
            </PageContentBlock>
          </PageContentColumn>
        </PageContent>
      </VCSettingsPageLayout>
    </StorageConfigContextProvider>
  );
};

export default VCAccessibilitySettingsPage;
