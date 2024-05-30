import React from 'react';
import Loading from '../../../../core/ui/loading/Loading';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import VCPageLayout from '../layout/VCPageLayout';
import {
  useUpdateVirtualContributorMutation,
  useVirtualContributorQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import VirtualContributorForm from './VirtualContributorForm';

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
      {data?.virtualContributor && (
        <VirtualContributorForm
          virtualContributor={data?.virtualContributor}
          avatar={data?.virtualContributor.profile.avatar}
          onSave={handleUpdate}
        />
      )}
    </VCPageLayout>
  );
};

export default VCSettingsPage;
