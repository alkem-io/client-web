import * as Apollo from '@apollo/client';
import {
  useCalloutUrlResolverQuery,
  useInnovationHubUrlResolverQuery,
  useInnovationPackUrlResolverQuery,
  useOrganizationUrlResolverQuery,
  usePostInCalloutUrlResolverQuery,
  useSpaceKeyEntitiesIDsQuery,
  useSpaceUrlResolverQuery,
  useSubspaceUrlResolverQuery,
  useTemplatesSetUrlResolverQuery,
  useTemplateUrlResolverQuery,
  useUrlResolverLazyQuery,
  useUrlResolverQuery,
  useUserUrlResolverQuery,
  useVirtualContributorKeyEntitiesIDsQuery,
  useVirtualContributorUrlResolverQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { useUrlParams } from '@/core/routing/useUrlParams';
import UrlParams from '../routing/urlParams';
import { useEffect, useMemo } from 'react';
import { NotFoundError } from '@/core/notFound/NotFoundErrorBoundary';
import { compact, uniq } from 'lodash';
import { useLocation } from 'react-router-dom';
import { SpaceLevel, UrlType } from '@/core/apollo/generated/graphql-schema';

type UseUrlResolverProvided = {
  spaceId: string | undefined;
  subspaceIds: [string, string] | [string, string, string] | undefined; // level0, level1, level2
  subspaceId: string | undefined;
  organizationId: string | undefined;
  innovationPackId: string | undefined;
  innovationHubId: string | undefined;
  templateId: string | undefined;
  calloutsSetId: string | undefined;
  calloutId: string | undefined;
  contributionId: string | undefined;
  postId: string | undefined;
  userId: string | undefined;
  vcId: string | undefined;
  loading: boolean;
};

type useUrlResolverParams = {
  throwIfNotFound?: boolean;
  overrideUrlParams?: UrlParams;
};

const useUrlResolver = ({
  throwIfNotFound = true,
  overrideUrlParams,
}: useUrlResolverParams = {}): UseUrlResolverProvided => {
  const urlParams = {
    ...useUrlParams(),
    ...overrideUrlParams,
  };

  const {
    spaceNameId,
    subspaceNameId,
    subsubspaceNameId,
    organizationNameId,
    innovationHubNameId,
    innovationPackNameId,
    templateNameId,
    userNameId,
    vcNameId,
    calloutNameId,
    postNameId,
  } = urlParams;
  let loading = false;

  const { data: urlResolverData, loading: urlResolverLoading } = useUrlResolverQuery({
    variables: {
      url: window.location.href,
    }
  });

  const result: UseUrlResolverProvided = useMemo(() => {

    const spaceId = urlResolverData?.urlResolver.space?.level === SpaceLevel.L0 ?
      urlResolverData?.urlResolver.space.id :
      urlResolverData?.urlResolver.space?.levelZeroSpaceID;

    const subspaceIds = urlResolverData?.urlResolver.space?.level === SpaceLevel.L0 ?
      [spaceId] :
      urlResolverData?.urlResolver.space?.level === SpaceLevel.L1 ?
        [spaceId, urlResolverData?.urlResolver.space?.id] :
        urlResolverData?.urlResolver.space?.level === SpaceLevel.L2 ?
          [spaceId, urlResolverData?.urlResolver.space.parentSpaces[0], urlResolverData?.urlResolver.space?.id] :
          undefined;

    const subspaceId = urlResolverData?.urlResolver.space?.level === SpaceLevel.L0 ? undefined : urlResolverData?.urlResolver.space?.id;

    return {
      spaceId,
      subspaceIds,
      subspaceId,
      organizationId: urlResolverData?.urlResolver.organizationId,
      calloutsSetId: urlResolverData?.urlResolver.space?.collaboration.calloutsSetId,
      calloutId: urlResolverData?.urlResolver.space?.collaboration.calloutId,
      contributionId: urlResolverData?.urlResolver.space?.collaboration.contributionId,
      postId: urlResolverData?.urlResolver.space?.collaboration.postId,
      userId: urlResolverData?.urlResolver.userId,
      vcId: urlResolverData?.urlResolver.vcId,
      //PENDING
      innovationPackId: undefined,
      innovationHubId: undefined,
      templateId: undefined,
      loading: urlResolverLoading
    }
  }, [urlResolverData, urlResolverLoading]);

/*
  // Space
  const { data: spaceData, loading: spaceLoading } = useSpaceUrlResolverQuery({
    variables: { nameId: spaceNameId! },
    skip: !spaceNameId,
  });
  const spaceId = spaceData?.lookupByName.space?.id;
  loading = loading || spaceLoading;
  if (throwIfNotFound && spaceNameId && !spaceLoading && !spaceId) {
    throw new NotFoundError(`Space '${spaceNameId}' not found`);
  }

  // Subspace
  const { data: subspaceData, loading: subspaceDataLoading } = useSubspaceUrlResolverQuery({
    variables: {
      spaceNameId: spaceNameId!,
      subspaceL1NameId: subspaceNameId,
      subspaceL2NameId: subsubspaceNameId,
      includeSubspaceL1: !!subspaceNameId,
      includeSubspaceL2: !!subsubspaceNameId,
    },
    skip: !spaceNameId || !subspaceNameId,
  });
  const subspaceIds = compact([spaceId, subspaceData?.lookupByName.space?.subspaceByNameID?.id, subspaceData?.lookupByName.space?.subspaceByNameID?.subspaceByNameID?.id])
  const subspaceId = subspaceIds[subspaceIds.length - 1];
  loading = loading || subspaceDataLoading;
  if (throwIfNotFound && spaceNameId && subspaceNameId && !subspaceDataLoading && !subspaceId) {
    throw new NotFoundError(`Subspace '${subspaceNameId}/${subsubspaceNameId}/' not found on '${spaceNameId}'`);
  }

  const { data: spaceKeyEntitiesData, loading: spaceKeyEntitiesLoading } = useSpaceKeyEntitiesIDsQuery({
    variables: {
      spaceId: subspaceId ?? spaceId!,
    },
    skip: (!spaceId && !subspaceId) || !calloutNameId,
  });
  loading = loading || spaceKeyEntitiesLoading;
  const spaceCalloutsSetId = spaceKeyEntitiesData?.lookup.space?.collaboration?.calloutsSet.id;

  // Organization
  const { data: organizationData, loading: organizationLoading } = useOrganizationUrlResolverQuery({
    variables: { nameId: organizationNameId! },
    skip: !organizationNameId,
  });
  const organizationId = organizationData?.lookupByName.organization;
  loading = loading || organizationLoading;
  if (throwIfNotFound && organizationNameId && !organizationLoading && !organizationId) {
    throw new NotFoundError(`Organization '${organizationNameId}' not found`);
  }

  // Innovation Hubs
  const { data: innovationHubData, loading: innovationHubLoading } = useInnovationHubUrlResolverQuery({
    variables: { innovationHubNameId: innovationHubNameId! },
    skip: !innovationHubNameId,
  });
  const innovationHubId = innovationHubData?.lookupByName.innovationHub;
  loading = loading || innovationHubLoading;
  if (throwIfNotFound && innovationHubNameId && !innovationHubLoading && !innovationHubId) {
    throw new NotFoundError(`InnovationHub '${innovationHubNameId}' not found`);
  }

  // Innovation Packs
  const { data: innovationPackData, loading: innovationPackLoading } = useInnovationPackUrlResolverQuery({
    variables: { innovationPackNameId: innovationPackNameId! },
    skip: !innovationPackNameId,
  });
  const innovationPackId = innovationPackData?.lookupByName.innovationPack;
  loading = loading || innovationPackLoading;
  if (throwIfNotFound && innovationPackNameId && !innovationPackLoading && !innovationPackId) {
    throw new NotFoundError(`InnovationPack '${innovationPackNameId}' not found`);
  }

  // Templates:
  // Templates need a templatesSetId to resolve the templateId, either from a space or from an innovation pack
  const { data: templatesSetData, loading: templatesSetLoading } = useTemplatesSetUrlResolverQuery({
    variables: {
      spaceId: spaceId!,
      includeSpace: !!spaceId,
      innovationPackId: innovationPackId!,
      includeInnovationPack: !!innovationPackId,
    },
    skip:
      !templateNameId || // Only retrieve the templatesSetId if we have to because we want to resolve a templateNameId
      (!spaceId && !innovationPackId),
  });
  loading = loading || templatesSetLoading;
  const templatesSetId = spaceId
    ? templatesSetData?.lookup.space?.templatesManager?.templatesSet?.id
    : templatesSetData?.lookup.innovationPack?.templatesSet?.id;

  const { data: templateData, loading: templateLoading } = useTemplateUrlResolverQuery({
    variables: { templatesSetId: templatesSetId!, templateNameId: templateNameId! },
    skip: !templatesSetId || !templateNameId,
  });
  loading = loading || templateLoading;
  const templateId = templateData?.lookupByName.template;
  if (throwIfNotFound && templateNameId && !spaceNameId && !innovationPackNameId) {
    console.error('Template cannot be resolved without a space or innovation pack', {
      throwIfNotFound,
      templateNameId,
      spaceNameId,
      innovationPackNameId,
    });
    throw new NotFoundError(`Template '${templateNameId}' cannot be found. Space or InnovationPack must be provided`);
  }

  if (
    throwIfNotFound &&
    templateNameId &&
    !innovationPackLoading &&
    !spaceLoading &&
    !templatesSetLoading &&
    !templateLoading &&
    !templateId
  ) {
    console.error('Template not found', {
      throwIfNotFound,
      templateNameId,
      innovationPackLoading,
      spaceLoading,
      templatesSetLoading,
      templateId,
    });
    throw new NotFoundError(`Template '${templateNameId}' not found`);
  }

  // User
  const { data: userData, loading: userLoading } = useUserUrlResolverQuery({
    variables: { nameId: userNameId! },
    skip: !userNameId,
  });
  loading = loading || userLoading;
  const userId = userData?.lookupByName.user;
  if (throwIfNotFound && userNameId && !userLoading && !userId) {
    throw new NotFoundError(`User '${userNameId}' not found`);
  }

  // Virtual Contributor
  const { data: vcData, loading: vcLoading } = useVirtualContributorUrlResolverQuery({
    variables: { nameId: vcNameId! },
    skip: !vcNameId,
  });
  const vcId = vcData?.lookupByName.virtualContributor;
  loading = loading || vcLoading;
  if (throwIfNotFound && vcNameId && !vcLoading && !vcId) {
    throw new NotFoundError(`VirtualContributor '${vcNameId}' not found`);
  }

  // Virtual Contributor with callout open
  const { data: vcCalloutsSetData, loading: vcCalloutsSetLoading } = useVirtualContributorKeyEntitiesIDsQuery({
    variables: { virtualContributorId: vcId! },
    skip: !vcId || !calloutNameId,
  });
  const vcCalloutsSetId = vcCalloutsSetData?.virtualContributor.knowledgeBase?.calloutsSet.id;
  loading = loading || vcCalloutsSetLoading;

  // Callouts
  const calloutsSetId = vcCalloutsSetId ?? spaceCalloutsSetId;
  const { data: calloutData, loading: calloutDataLoading } = useCalloutUrlResolverQuery({
    variables: { calloutsSetId: calloutsSetId!, calloutNameId: calloutNameId! },
    skip: !calloutsSetId || !calloutNameId,
  });
  const calloutId = calloutData?.lookup.calloutsSet?.callouts?.[0].id;
  loading = loading || calloutDataLoading;
  if (throwIfNotFound && calloutNameId && calloutsSetId && !calloutDataLoading && !calloutId) {
    throw new NotFoundError(`Callout '${calloutNameId}' not found in VC '${vcNameId}'`);
  }

  // Callout for posts and a post open
  const { data: calloutPostData, loading: calloutPostLoading } = usePostInCalloutUrlResolverQuery({
    variables: { calloutId: calloutId!, postNameId: postNameId! },
    skip: !calloutId || !postNameId,
  });
  const contributionId = calloutPostData?.lookup.callout?.contributions[0]?.id;
  const postId = calloutPostData?.lookup.callout?.contributions[0]?.post?.id;
  loading = loading || calloutPostLoading;
  if (throwIfNotFound && calloutId && postNameId && !calloutPostLoading && !postId) {
    throw new NotFoundError(`Post '${postNameId}' in callout '${calloutNameId}' ${calloutId} not found`);
  }

  const result = useMemo(
    () => ({
      spaceId,
      subspaceId,
      subspaceIds,
      organizationId,
      innovationPackId,
      innovationHubId,
      templateId,
      userId,
      vcId,
      calloutId,
      calloutsSetId,
      contributionId,
      postId,
      loading,
    }),
    [
      spaceId,
      organizationId,
      innovationPackId,
      innovationHubId,
      templateId,
      userId,
      vcId,
      calloutId,
      calloutsSetId,
      contributionId,
      postId,
      loading,
    ]
  );
  */
  return result;
};

export default useUrlResolver;
