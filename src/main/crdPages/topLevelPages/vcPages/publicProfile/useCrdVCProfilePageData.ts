import {
  useSpaceBodyOfKnowledgeAboutQuery,
  useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery,
  useVirtualContributorProfileWithModelCardQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, VirtualContributorBodyOfKnowledgeType } from '@/core/apollo/generated/graphql-schema';
import { isApolloNotFoundError } from '@/core/apollo/hooks/useApolloErrorHandler';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import useRestrictedRedirect from '@/core/routing/useRestrictedRedirect';
import useKnowledgeBase from '@/domain/community/virtualContributor/knowledgeBase/useKnowledgeBase';
import { createVirtualContributorModelFull } from '@/domain/community/virtualContributor/utils/createVirtualContributorModelFull';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

export const useCrdVCProfilePageData = () => {
  const { vcId, loading: urlResolverLoading } = useUrlResolver();
  const { loading: authLoading } = useAuthenticationContext();

  const {
    data,
    loading: vcLoading,
    error,
  } = useVirtualContributorProfileWithModelCardQuery({
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { id: vcId! },
    skip: !vcId,
  });

  const virtualContributor = data?.lookup.virtualContributor;
  const bokId = virtualContributor?.bodyOfKnowledgeID;
  const isBokSpace = virtualContributor?.bodyOfKnowledgeType === VirtualContributorBodyOfKnowledgeType.AlkemioSpace;
  const isBokKb =
    virtualContributor?.bodyOfKnowledgeType === VirtualContributorBodyOfKnowledgeType.AlkemioKnowledgeBase;

  const { data: vcSpaceBokAuthPrivileges, loading: loadingBokAuth } =
    useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery({
      // biome-ignore lint/style/noNonNullAssertion: ensured by skip
      variables: { spaceId: bokId! },
      skip: !bokId || !isBokSpace,
    });
  const hasSpaceProfileReadAccess =
    vcSpaceBokAuthPrivileges?.lookup.myPrivileges?.space?.includes(AuthorizationPrivilege.ReadAbout) ?? false;

  const { data: bokProfileData, loading: loadingBokProfile } = useSpaceBodyOfKnowledgeAboutQuery({
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { spaceId: bokId! },
    skip: !bokId || !isBokSpace || !hasSpaceProfileReadAccess,
  });

  const {
    knowledgeBaseDescription,
    hasReadAccess: kbHasReadAccess,
    loading: kbLoading,
  } = useKnowledgeBase({ id: vcId });

  useRestrictedRedirect(
    { data, error, skip: urlResolverLoading || vcLoading },
    d => d.lookup.virtualContributor?.authorization?.myPrivileges,
    { requiredPrivilege: AuthorizationPrivilege.Read }
  );

  const vc = createVirtualContributorModelFull(virtualContributor);
  const myPrivileges = virtualContributor?.authorization?.myPrivileges;

  const bokSpaceProfile =
    isBokSpace && bokProfileData?.lookup.space?.about.profile
      ? {
          id: bokProfileData.lookup.space.about.profile.id,
          displayName: bokProfileData.lookup.space.about.profile.displayName,
          url: bokProfileData.lookup.space.about.profile.url,
        }
      : undefined;

  // Per-region loading flags (FR-009): each region renders a Skeleton while its
  // underlying queries are in flight, then swaps to real content as data lands.
  const heroLoading = authLoading || urlResolverLoading || vcLoading || !vcId;
  const sidebarLoading = heroLoading;
  const contentViewLoading = heroLoading;
  const bokLoading =
    heroLoading ||
    (isBokSpace && (loadingBokAuth || (hasSpaceProfileReadAccess && loadingBokProfile))) ||
    (isBokKb && kbLoading);

  return {
    vcId,
    virtualContributor,
    vc,
    myPrivileges,
    error,
    isNotFoundError: error ? isApolloNotFoundError(error) : false,
    bokSpaceProfile,
    hasSpaceProfileReadAccess,
    knowledgeBaseDescription: knowledgeBaseDescription ?? undefined,
    kbHasReadAccess,
    loading: {
      hero: heroLoading,
      sidebar: sidebarLoading,
      contentView: contentViewLoading,
      bodyOfKnowledge: bokLoading,
    },
  };
};

export type CrdVCProfilePageData = ReturnType<typeof useCrdVCProfilePageData>;
