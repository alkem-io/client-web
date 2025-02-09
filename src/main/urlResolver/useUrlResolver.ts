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
  useUserUrlResolverQuery,
  useVirtualContributorKeyEntitiesIDsQuery,
  useVirtualContributorUrlResolverQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { useUrlParams } from '@/core/routing/useUrlParams';
import UrlParams from '../routing/urlParams';
import { useMemo } from 'react';
import { NotFoundError } from '@/core/notFound/NotFoundErrorBoundary';

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

  // Space
  const { data: spaceData, loading: spaceLoading } = useSpaceUrlResolverQuery({
    variables: { nameId: spaceNameId! },
    skip: !spaceNameId,
  });
  const spaceId = spaceData?.lookupByName.space;
  loading = loading || spaceLoading;
  if (throwIfNotFound && spaceNameId && !spaceLoading && !spaceId) {
    throw new NotFoundError(`Space '${spaceNameId}' not found`);
  }

  // Subspace
  const { data: subspaceData, loading: subspaceDataLoading } = useSubspaceUrlResolverQuery({
    variables: {
      spaceNameId: spaceNameId!,
      level1: !!subspaceNameId,
      level1subspaceNameId: subspaceNameId,
      level2: !!subsubspaceNameId,
      level2subspaceNameId: subsubspaceNameId,
    },
    skip: !spaceNameId || !subspaceNameId,
  });
  const subspaceIds = !spaceId
    ? undefined
    : subspaceData?.space.subspace?.subspace?.id && subspaceData?.space.subspace?.id
    ? ([spaceId, subspaceData.space.subspace.id, subspaceData.space.subspace.subspace.id] as [string, string, string])
    : subspaceData?.space.subspace?.id
    ? ([spaceId, subspaceData.space.subspace.id] as [string, string])
    : undefined;
  const subspaceId = subspaceData?.space.subspace?.subspace?.id ?? subspaceData?.space.subspace?.id;
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
  return result;
};

export default useUrlResolver;
