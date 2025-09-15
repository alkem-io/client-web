import { ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import VCPageLayout from '../layout/VCPageLayout';
import VCProfilePageView from './VCProfilePageView';
import {
  useSpaceBodyOfKnowledgeAboutQuery,
  useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery,
  useVirtualContributorProfileWithModelCardQuery,
} from '@/core/apollo/generated/apollo-hooks';
import Loading from '@/core/ui/loading/Loading';
import { Error404 } from '@/core/pages/Errors/Error404';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { isApolloNotFoundError, isApolloAuthorizationError } from '@/core/apollo/hooks/useApolloErrorHandler';
import { AiPersonaBodyOfKnowledgeType, AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { VirtualContributorModelFull } from '../model/VirtualContributorModelFull';
import { createVirtualContributorModelFull } from '../utils/createVirtualContributorModelFull';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import { useLocation } from 'react-router-dom';
import { AUTH_REQUIRED_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import { buildReturnUrlParam } from '@/main/routing/urlBuilders';
import useNavigate from '@/core/routing/useNavigate';

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
  const { isAuthenticated, loading: authLoading } = useAuthenticationContext();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const { data, loading, error } = useVirtualContributorProfileWithModelCardQuery({
    variables: {
      id: vcId!, // ensured by skip
    },
    skip: !vcId,
  });

  const isBokSpace =
    data?.lookup.virtualContributor?.aiPersona?.bodyOfKnowledgeType === AiPersonaBodyOfKnowledgeType.AlkemioSpace;
  const bokId = data?.lookup.virtualContributor?.aiPersona?.bodyOfKnowledgeID;
  // TODO: Additional Auth Check
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

  // Custom authentication and authorization logic
  useEffect(() => {
    if (authLoading || urlResolverLoading || loading) {
      return; // Still loading, don't redirect yet
    }

    const privileges = data?.lookup.virtualContributor?.authorization?.myPrivileges;
    const hasReadPrivilege = privileges?.includes(AuthorizationPrivilege.Read);

    // Check for authorization errors
    const isAuthorizationError = isApolloAuthorizationError(error);
    // If there's an authorization error or the user doesn't have READ privileges
    if (isAuthorizationError || (data && !hasReadPrivilege)) {
      if (!isAuthenticated) {
        // For unauthenticated users, redirect to authentication required page
        navigate(`${AUTH_REQUIRED_PATH}${buildReturnUrlParam(pathname)}`);
      } else {
        // For authenticated users without access, redirect to restricted page
        navigate(`/restricted?origin=${encodeURI(pathname)}`);
      }
    }
  }, [data, error, authLoading, urlResolverLoading, loading, isAuthenticated, pathname, navigate]);

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
