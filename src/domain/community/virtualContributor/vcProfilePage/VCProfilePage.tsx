import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import VCPageLayout from '../layout/VCPageLayout';
import VCProfilePageView from './VCProfilePageView';
import {
  useBodyOfKnowledgeProfileAuthorizationQuery,
  useBodyOfKnowledgeProfileQuery,
  useVirtualContributorQuery,
} from '@/core/apollo/generated/apollo-hooks';
import Loading from '@/core/ui/loading/Loading';
import { Error404 } from '@/core/pages/Errors/Error404';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import useRestrictedRedirect from '@/core/routing/useRestrictedRedirect';
import { isApolloNotFoundError } from '@/core/apollo/hooks/useApolloErrorHandler';
import { AiPersonaBodyOfKnowledgeType, AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

/**
 * children will have the virtual contributor data available if it is loaded
 */
interface VirtualContributorProvided {
  id: string;
  profile: {
    displayName: string;
    url: string;
  };
}

type VCProfilePageProps = {
  openKnowledgeBaseDialog?: boolean;
  children?: (vc: VirtualContributorProvided | undefined) => ReactNode;
};

export const VCProfilePage = ({ openKnowledgeBaseDialog, children }: VCProfilePageProps) => {
  const { t } = useTranslation();
  const { vcId, loading: urlResolverLoading } = useUrlResolver();

  const { data, loading, error } = useVirtualContributorQuery({
    variables: {
      id: vcId!, // ensured by skip
    },
    skip: !vcId,
  });

  const isBokSpace =
    data?.lookup.virtualContributor?.aiPersona?.bodyOfKnowledgeType === AiPersonaBodyOfKnowledgeType.AlkemioSpace;
  const bokId = data?.lookup.virtualContributor?.aiPersona?.bodyOfKnowledgeID;

  // TODO: Additional Auth Check
  const { data: bokProfileAuthData } = useBodyOfKnowledgeProfileAuthorizationQuery({
    variables: {
      spaceId: bokId!,
    },
    skip: !bokId || !isBokSpace,
  });

  const hasSpaceProfileReadAccess = bokProfileAuthData?.lookup.space?.authorization?.myPrivileges?.includes(
    AuthorizationPrivilege.Read
  );

  const { data: bokProfile } = useBodyOfKnowledgeProfileQuery({
    variables: {
      spaceId: bokId!,
    },
    skip: !bokId || !isBokSpace || !hasSpaceProfileReadAccess,
  });

  useRestrictedRedirect(
    { data, error, skip: urlResolverLoading || loading },
    data => data.lookup.virtualContributor?.authorization?.myPrivileges,
    {
      requiredPrivilege: AuthorizationPrivilege.ReadAbout,
    }
  );

  if (urlResolverLoading || loading || !vcId) {
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
        bokProfile={isBokSpace ? bokProfile?.lookup.space?.about.profile : undefined}
        virtualContributor={data?.lookup.virtualContributor}
        openKnowledgeBaseDialog={openKnowledgeBaseDialog}
      />
      {children?.(data?.lookup.virtualContributor)}
    </VCPageLayout>
  );
};

export default VCProfilePage;
