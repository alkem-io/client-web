import React from 'react';
import Loading from '../../../../core/ui/loading/Loading';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import {
  useUpdateVirtualContributorMutation,
  useVirtualContributorQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import VirtualContributorForm from './VirtualContributorForm';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContent from '../../../../core/ui/content/PageContent';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import { StorageConfigContextProvider } from '../../../storage/StorageBucket/StorageConfigContext';
import { useTranslation } from 'react-i18next';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/constants';
import VCSettingsPageLayout from '../layout/VCSettingsPageLayout';

export const VCSettingsPage = () => {
  const { t } = useTranslation();

  const { vcNameId = '' } = useUrlParams();

  const notify = useNotification();

  const { data, loading } = useVirtualContributorQuery({
    variables: {
      id: vcNameId,
    },
  });

  const [updateContributorMutation] = useUpdateVirtualContributorMutation();

  const handleUpdate = virtualContributor => {
    updateContributorMutation({
      variables: {
        virtualContributorData: {
          ID: virtualContributor.ID,
          profileData: virtualContributor.profileData,
        },
      },
      onCompleted: () => {
        notify('Profile updated successfully', 'success');
      },
    });
  };

  if (loading)
    return (
      <Loading
        text={t('components.loading.message', { blockName: t('pages.virtualContributorProfile.settings.title') })}
      />
    );

  return (
    <StorageConfigContextProvider locationType="platform">
      <VCSettingsPageLayout currentTab={SettingsSection.MyProfile}>
        <PageContent background="background.paper">
          <PageContentColumn columns={12}>
            <PageContentBlock>
              {data?.virtualContributor && (
                <VirtualContributorForm
                  virtualContributor={data?.virtualContributor}
                  avatar={data?.virtualContributor.profile.avatar}
                  onSave={handleUpdate}
                />
              )}
            </PageContentBlock>
          </PageContentColumn>
        </PageContent>
      </VCSettingsPageLayout>
    </StorageConfigContextProvider>
  );
};

export default VCSettingsPage;
