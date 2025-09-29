import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import VCPageLayout from '../layout/VCPageLayout';
import VCProfilePageView from './VCProfilePageView';
import {
  useSpaceBodyOfKnowledgeAboutQuery,
  useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery,
  useVirtualContributorProfileWithModelCardQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { VirtualContributorBodyOfKnowledgeType } from '@/core/apollo/generated/graphql-schema';
import Loading from '@/core/ui/loading/Loading';
import { Error404 } from '@/core/pages/Errors/Error404';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { isApolloNotFoundError } from '@/core/apollo/hooks/useApolloErrorHandler';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { VirtualContributorModelFull } from '../model/VirtualContributorModelFull';
import { createVirtualContributorModelFull } from '../utils/createVirtualContributorModelFull';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import useRestrictedRedirect from '@/core/routing/useRestrictedRedirect';

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
  const { loading: authLoading } = useAuthenticationContext();

  const { data, loading, error } = useVirtualContributorProfileWithModelCardQuery({
    variables: {
      id: vcId!, // ensured by skip
    },
    skip: !vcId,
  });
  //
  // TODO: Additional Auth Check
  const isBokSpace =
    data?.lookup.virtualContributor?.bodyOfKnowledgeType === VirtualContributorBodyOfKnowledgeType.AlkemioSpace;
  const bokId = data?.lookup.virtualContributor?.bodyOfKnowledgeID;

  const { data: vcSpaceBoKAuthPrivileges } = useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery({
    variables: {
      spaceId: bokId!,
    },
    skip: !bokId || !isBokSpace,
  });

  const hasSpaceProfileReadAccess = vcSpaceBoKAuthPrivileges?.lookup.myPrivileges?.space?.includes(
    AuthorizationPrivilege.ReadAbout
  );

  const { data: bokProfile } = useSpaceBodyOfKnowledgeAboutQuery({
    variables: {
      spaceId: bokId!,
    },
    skip: !bokId || !isBokSpace || !hasSpaceProfileReadAccess,
  });

  useRestrictedRedirect(
    { data, error, skip: urlResolverLoading || loading },
    data => data.lookup.virtualContributor?.authorization?.myPrivileges,
    {
      requiredPrivilege: AuthorizationPrivilege.Read,
    }
  );

  if (authLoading || urlResolverLoading || loading || !vcId) {
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

  const virtualContributor = data?.lookup.virtualContributor;
  const virtualContributorModel: VirtualContributorModelFull = createVirtualContributorModelFull(virtualContributor);

  return (
    <>
      <VCProfilePageView
        bokProfile={isBokSpace ? bokProfile?.lookup.space?.about.profile : undefined}
        virtualContributor={virtualContributorModel}
        openKnowledgeBaseDialog={openKnowledgeBaseDialog}
      />
      {children?.(data?.lookup.virtualContributor)}
    </>
  );
};

export default VCProfilePage;
