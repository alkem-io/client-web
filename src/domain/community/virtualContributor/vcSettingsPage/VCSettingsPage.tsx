import React from 'react';
import Loading from '../../../../core/ui/loading/Loading';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import VCPageLayout from '../layout/VCPageLayout';
import { useVirtualContributorQuery } from '../../../../core/apollo/generated/apollo-hooks';

export const VCSettingsPage = () => {
  const { vcNameId = '' } = useUrlParams();

  const { data, loading } = useVirtualContributorQuery({
    variables: {
      id: vcNameId,
    },
  });

  if (loading) return <Loading text={'Loading Virtual Contributor Settings ...'} />;

  return (
    <VCPageLayout>
      <div>{data?.virtualContributor.profile.displayName} Settings Page</div>
    </VCPageLayout>
  );
};

export default VCSettingsPage;
