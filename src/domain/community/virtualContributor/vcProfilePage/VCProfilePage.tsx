import { useTranslation } from 'react-i18next';

import VCPageLayout from '../layout/VCPageLayout';
import VCProfilePageView from './VCProfilePageView';
import { useBodyOfKnowledgeProfileQuery, useVirtualContributorQuery } from '@/core/apollo/generated/apollo-hooks';
import Loading from '@/core/ui/loading/Loading';
import { Error404 } from '@/core/pages/Errors/Error404';
import useUrlResolver from '@/main/urlResolver/useUrlResolver';
import useRestrictedRedirect from '@/core/routing/useRestrictedRedirect';
import { isApolloNotFoundError } from '@/core/apollo/hooks/useApolloErrorHandler';
import { AiPersonaBodyOfKnowledgeType } from '@/core/apollo/generated/graphql-schema';

export const VCProfilePage = () => {
  const { t } = useTranslation();
  const { vcId = '' } = useUrlResolver();

  const { data, loading, error } = useVirtualContributorQuery({ variables: { id: vcId } });

  const isBokSpace =
    data?.lookup.virtualContributor?.aiPersona?.bodyOfKnowledgeType === AiPersonaBodyOfKnowledgeType.AlkemioSpace;

  const { data: bokProfile } = useBodyOfKnowledgeProfileQuery({
    variables: {
      spaceId: data?.lookup.virtualContributor?.aiPersona?.bodyOfKnowledgeID!,
    },
    skip: !data?.lookup.virtualContributor?.aiPersona?.bodyOfKnowledgeID || !isBokSpace,
  });

  useRestrictedRedirect({ data, error }, data => data.lookup.virtualContributor?.authorization?.myPrivileges);

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
        bokProfile={isBokSpace ? bokProfile?.lookup.space?.profile : undefined}
        virtualContributor={data?.lookup.virtualContributor}
      />
    </VCPageLayout>
  );
};

export default VCProfilePage;
