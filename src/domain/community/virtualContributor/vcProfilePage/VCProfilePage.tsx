import React from 'react';
import Loading from '../../../../core/ui/loading/Loading';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import VCPageLayout from '../layout/VCPageLayout';
import VCProfilePageView from './VCProfilePageView';
import { useVirtualContributorQuery } from '../../../../core/apollo/generated/apollo-hooks';

export const VCProfilePage = () => {
  const { vcNameId = '' } = useUrlParams();

  const { data, loading, error } = useVirtualContributorQuery({
    variables: {
      id: vcNameId,
    },
  });

  if (loading) return <Loading text={'Loading Virtual Contributor Profile ...'} />;

  if (error) {
    return (
      <VCPageLayout>
        <Error404 />
      </VCPageLayout>
    );
  }

  return (
    <VCPageLayout>
      <VCProfilePageView virtualContributor={data?.virtualContributor} />
    </VCPageLayout>
  );
};

export default VCProfilePage;
