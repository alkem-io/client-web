import React from 'react';
import Loading from '../../../../core/ui/loading/Loading';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import VCPageLayout from '../layout/VCPageLayout';
import VCProfilePageView from './VCProfilePageView';
import {
  useBodyOfKnowledgeProfileQuery,
  useVirtualContributorQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useTranslation } from 'react-i18next';

export const VCProfilePage = () => {
  const { t } = useTranslation();

  const { vcNameId = '' } = useUrlParams();

  const { data, loading, error } = useVirtualContributorQuery({
    variables: {
      id: vcNameId,
    },
  });

  const { data: bokProfile, loading: loadingBok } = useBodyOfKnowledgeProfileQuery({
    variables: {
      spaceId: data?.virtualContributor.bodyOfKnowledgeID!,
    },
    skip: !data?.virtualContributor.bodyOfKnowledgeID,
  });

  if (loading)
    return (
      <Loading text={t('components.loading.message', { blockName: t('pages.virtualContributorProfile.title') })} />
    );

  if (error) {
    return (
      <VCPageLayout>
        <Error404 />
      </VCPageLayout>
    );
  }

  return (
    <VCPageLayout>
      <VCProfilePageView
        virtualContributor={data?.virtualContributor}
        bokProfile={bokProfile?.lookup.space?.profile}
        showDefaults={!loadingBok}
      />
    </VCPageLayout>
  );
};

export default VCProfilePage;
