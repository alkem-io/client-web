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
import { AiPersonaBodyOfKnowledgeType } from '../../../../core/apollo/generated/graphql-schema';
import { isApolloNotFoundError } from '../../../../core/apollo/hooks/useApolloErrorHandler';
import useRestrictedRedirect from '../../../../core/routing/useRestrictedRedirect';

export const VCProfilePage = () => {
  const { t } = useTranslation();
  const { vcNameId = '' } = useUrlParams();

  const { data, loading, error } = useVirtualContributorQuery({
    variables: {
      id: vcNameId,
    },
  });

  const isBoKSpace =
    data?.virtualContributor?.aiPersona?.bodyOfKnowledgeType === AiPersonaBodyOfKnowledgeType.AlkemioSpace;

  const { data: bokProfile, loading: loadingBok } = useBodyOfKnowledgeProfileQuery({
    variables: {
      spaceId: data?.virtualContributor?.aiPersona?.bodyOfKnowledgeID!,
    },
    skip: !data?.virtualContributor?.aiPersona?.bodyOfKnowledgeID || !isBoKSpace,
  });

  useRestrictedRedirect({ data, error }, data => data.virtualContributor.authorization?.myPrivileges);

  if (loading) {
    return (
      <Loading text={t('components.loading.message', { blockName: t('pages.virtualContributorProfile.title') })} />
    );
  }

  if (error && isApolloNotFoundError(error)) {
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
        bokProfile={isBoKSpace || loadingBok ? bokProfile?.lookup.space?.profile : undefined}
        bokDescription={loadingBok ? undefined : data?.virtualContributor?.aiPersona?.bodyOfKnowledge}
      />
    </VCPageLayout>
  );
};

export default VCProfilePage;
