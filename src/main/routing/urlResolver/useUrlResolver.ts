import {
  useUrlResolverQuery,
/*
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
  useUserUrlResolverQuery,
  useVirtualContributorKeyEntitiesIDsQuery,
  useVirtualContributorUrlResolverQuery,
  */
} from '@/core/apollo/generated/apollo-hooks';
import { SpaceLevel, UrlType } from '@/core/apollo/generated/graphql-schema';
import { useMemo } from 'react';
import { compact } from 'lodash';

export type JourneyPath = [] | [string] | [string, string] | [string, string, string];


type UseUrlResolverProvided = {
  type: UrlType | undefined;
  // Space:
  /**
   * The current Space or Subspace Id, no matter the level
   */
  spaceId: string | undefined;
  spaceLevel: SpaceLevel | undefined;
  levelZeroSpaceId: string | undefined;
  /**
   * [level0, level1, level2]
   */
  journeyPath: JourneyPath;
  /**
   * The parent space id of the current space
   */
  parentSpaceId: string | undefined;

  // Collaboration:
  collaborationId: string | undefined;
  calloutsSetId: string | undefined;
  calloutId: string | undefined;
  contributionId: string | undefined;
  postId: string | undefined;
  whiteboardId: string | undefined;

  // Contributors:
  organizationId: string | undefined;
  userId: string | undefined;
  vcId: string | undefined;

  // Forum:
  discussionId: string | undefined;

  // Templates
  innovationPackId: string | undefined;
  templatesSetId: string | undefined;
  templateId: string | undefined;

  //!! pending
  innovationHubId: string | undefined;
  loading: boolean;
};

type useUrlResolverParams = {
  handleException?: (ex: Error) => boolean;
};

const useUrlResolver = ({
  handleException = (ex) => { throw ex; },
}: useUrlResolverParams = {}): UseUrlResolverProvided => {

  const { data: urlResolverData, loading: urlResolverLoading } = useUrlResolverQuery({
    variables: {
      url: window.location.href,
    },
    // skip:
  });

  //!! memoize this with lodash? window.location.href
  const result = useMemo<UseUrlResolverProvided>(() => {
    const type = urlResolverData?.urlResolver.type;
    const data = urlResolverData?.urlResolver;
    return {
      type,
      // Space:
      spaceId: data?.space?.id,
      spaceLevel: data?.space?.level,
      levelZeroSpaceId: data?.space?.levelZeroSpaceID,
      parentSpaceId: (data?.space?.parentSpaces ?? []).slice(-1)[0],
      journeyPath: compact(data?.space?.parentSpaces) as JourneyPath,

      // Collaboration:
      collaborationId: data?.space?.collaboration.id,
      calloutsSetId: data?.space?.collaboration.calloutsSetId,
      calloutId: data?.space?.collaboration.calloutId,
      contributionId: data?.space?.collaboration.contributionId,
      postId: data?.space?.collaboration.postId,
      whiteboardId: data?.space?.collaboration.whiteboardId,

      // Contributors:
      organizationId: data?.organizationId,
      userId: data?.userId,
      vcId: data?.vcId,

      // Innovation Packs:
      innovationPackId: data?.innovationPack?.id,

      // Templates:
      templatesSetId: data?.space?.templatesSet?.id ?? data?.innovationPack?.templatesSet.id,
      templateId: data?.space?.templatesSet?.templateId ?? data?.innovationPack?.templatesSet.templateId,

      // Forum:
      discussionId: data?.discussionId,

      // PENDING
      innovationHubId: undefined,
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
    throw new NotFoundError(`Callout '${calloutNameId}' not found in calloutSet '${calloutsSetId}'`);
  }

  // Callout for posts and a post open
  const { data: calloutPostData, loading: calloutPostLoading } = usePostInCalloutUrlResolverQuery({
    variables: { calloutId: calloutId!, postNameId: postNameId! },
    skip: !calloutId || !postNameId,
  });
  const contribution = calloutPostData?.lookup.callout?.contributions.find(contribution => contribution.post);
  const contributionId = contribution?.id;
  const postId = contribution?.post?.id;
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
