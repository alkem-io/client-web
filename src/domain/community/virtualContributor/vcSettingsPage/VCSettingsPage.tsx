import React from 'react';
import Loading from '../../../../core/ui/loading/Loading';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import VCPageLayout from '../layout/VCPageLayout';
import {
  useUpdateVirtualContributorMutation,
  useVirtualContributorQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import VirtualContributorForm from './VirtualContributorForm';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContent from '../../../../core/ui/content/PageContent';

export const VCSettingsPage = () => {
  const { vcNameId = '' } = useUrlParams();

  const { data, loading } = useVirtualContributorQuery({
    variables: {
      id: vcNameId,
    },
  });

  const [updateContributorMutation] = useUpdateVirtualContributorMutation();

  const handleUpdate = async virtualContributor => {
    await updateContributorMutation({
      variables: {
        virtualContributorData: {
          ID: virtualContributor.ID,
          profileData: virtualContributor.profileData,
        },
      },
    });
  };

  if (loading) return <Loading text={'Loading Virtual Contributor Settings ...'} />;

  // TODO: StorageProvider for the VC
  return (
    <VCPageLayout>
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
    </VCPageLayout>
  );
};

export default VCSettingsPage;
