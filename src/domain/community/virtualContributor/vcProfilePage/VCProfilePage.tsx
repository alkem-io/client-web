import { useTranslation } from 'react-i18next';

import VCPageLayout from '../layout/VCPageLayout';
import VCProfilePageView from './VCProfilePageView';
import { useBodyOfKnowledgeProfileQuery, useVirtualContributorQuery } from '@core/apollo/generated/apollo-hooks';
import Loading from '@core/ui/loading/Loading';
import { Error404 } from '@core/pages/Errors/Error404';
import { useUrlParams } from '@core/routing/useUrlParams';
import useRestrictedRedirect from '@core/routing/useRestrictedRedirect';
import { isApolloNotFoundError } from '@core/apollo/hooks/useApolloErrorHandler';
import { AiPersonaBodyOfKnowledgeType } from '@core/apollo/generated/graphql-schema';

export const VCProfilePage = () => {
  const { t } = useTranslation();
  const { vcNameId = '' } = useUrlParams();

  const { data, loading, error } = useVirtualContributorQuery({
    variables: {
      id: vcNameId,
    },
  });

  const isBokSpace =
    data?.virtualContributor?.aiPersona?.bodyOfKnowledgeType === AiPersonaBodyOfKnowledgeType.AlkemioSpace;

  const { data: bokProfile } = useBodyOfKnowledgeProfileQuery({
    variables: {
      spaceId: data?.virtualContributor?.aiPersona?.bodyOfKnowledgeID!,
    },
    skip: !data?.virtualContributor?.aiPersona?.bodyOfKnowledgeID || !isBokSpace,
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
        bokDescription={data?.virtualContributor?.aiPersona?.bodyOfKnowledge}
        bokProfile={isBokSpace ? bokProfile?.lookup.space?.profile : undefined}
        hasBokId={Boolean(data?.virtualContributor.aiPersona?.bodyOfKnowledgeID)}
      />
    </VCPageLayout>
  );
};

export default VCProfilePage;
