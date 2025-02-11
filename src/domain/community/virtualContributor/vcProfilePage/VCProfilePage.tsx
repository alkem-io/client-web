import { PropsWithChildren } from 'react';

import { useTranslation } from 'react-i18next';

import VCPageLayout from '../layout/VCPageLayout';
import VCProfilePageView from './VCProfilePageView';
import { useBodyOfKnowledgeProfileQuery, useVirtualContributorQuery } from '@/core/apollo/generated/apollo-hooks';
import Loading from '@/core/ui/loading/Loading';
import { Error404 } from '@/core/pages/Errors/Error404';
import { VirtualContributorProfileProps } from './model';
import useUrlResolver from '@/main/urlResolver/useUrlResolver';
import useRestrictedRedirect from '@/core/routing/useRestrictedRedirect';
import { isApolloNotFoundError } from '@/core/apollo/hooks/useApolloErrorHandler';
import { AiPersonaBodyOfKnowledgeType } from '@/core/apollo/generated/graphql-schema';

type VCProfilePageProps = {
  openKnowledgeBaseDialog?: boolean;
};

export const VCProfilePage = ({ openKnowledgeBaseDialog, children }: PropsWithChildren<VCProfilePageProps>) => {
  const { t } = useTranslation();
  const { vcId } = useUrlResolver();

  const { data, loading, error } = useVirtualContributorQuery({
    variables: {
      id: vcId!, // ensured by skip
    },
    skip: !vcId,
  });

  const isBokSpace =
    data?.lookup.virtualContributor?.aiPersona?.bodyOfKnowledgeType === AiPersonaBodyOfKnowledgeType.AlkemioSpace;

  const { data: bokProfile } = useBodyOfKnowledgeProfileQuery({
    variables: {
      spaceId: data?.lookup.virtualContributor?.aiPersona?.bodyOfKnowledgeID!,
    },
    skip: !data?.lookup.virtualContributor?.aiPersona?.bodyOfKnowledgeID || !isBokSpace,
  });

  useRestrictedRedirect({ data, error }, data => data.lookup.virtualContributor?.authorization?.myPrivileges);

  if (loading || !vcId) {
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
        virtualContributor={data?.lookup.virtualContributor as VirtualContributorProfileProps}
        openKnowledgeBaseDialog={openKnowledgeBaseDialog}
      />
      {children}
    </VCPageLayout>
  );
};

export default VCProfilePage;
