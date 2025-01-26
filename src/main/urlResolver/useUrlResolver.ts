import {
  useInnovationHubUrlResolverQuery,
  useInnovationPackUrlResolverQuery,
  useOrganizationUrlResolverQuery,
  useSpaceUrlResolverQuery,
  useTemplatesSetUrlResolverQuery,
  useTemplateUrlResolverQuery,
  useUserUrlResolverQuery,
  useVirtualContributorUrlResolverQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { useUrlParams } from '@/core/routing/useUrlParams';
import UrlParams from '../routing/urlParams';
import { useMemo } from 'react';
import { NotFoundError } from '@/core/notFound/NotFoundErrorBoundary';

type UseUrlResolverProvided = {
  spaceId: string | undefined;
  organizationId: string | undefined;
  innovationPackId: string | undefined;
  innovationHubId: string | undefined;
  templateId: string | undefined;
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
    organizationNameId,
    innovationHubNameId,
    innovationPackNameId,
    templateNameId,
    userNameId,
    vcNameId,
  } = urlParams;

  // Space
  const { data: spaceData, loading: spaceLoading } = useSpaceUrlResolverQuery({
    variables: { nameId: spaceNameId! },
    skip: !spaceNameId,
  });
  const spaceId = spaceData?.lookupByName.space?.id;
  if (throwIfNotFound && spaceNameId && !spaceLoading && !spaceId) {
    throw new NotFoundError(`Space '${spaceNameId}' not found`);
  }

  // Organization
  const { data: organizationData, loading: organizationLoading } = useOrganizationUrlResolverQuery({
    variables: { nameId: organizationNameId! },
    skip: !organizationNameId,
  });
  const organizationId = organizationData?.lookupByName.organization;
  if (throwIfNotFound && organizationNameId && !organizationLoading && !organizationId) {
    throw new NotFoundError(`Organization '${organizationNameId}' not found`);
  }

  // Innovation Hubs
  const { data: innovationHubData, loading: innovationHubLoading } = useInnovationHubUrlResolverQuery({
    variables: { innovationHubNameId: innovationHubNameId! },
    skip: !innovationHubNameId,
  });
  const innovationHubId = innovationHubData?.lookupByName.innovationHub;
  if (throwIfNotFound && innovationHubNameId && !innovationHubLoading && !innovationHubId) {
    throw new NotFoundError(`InnovationHub '${innovationHubNameId}' not found`);
  }

  // Innovation Packs
  const { data: innovationPackData, loading: innovationPackLoading } = useInnovationPackUrlResolverQuery({
    variables: { innovationPackNameId: innovationPackNameId! },
    skip: !innovationPackNameId,
  });
  const innovationPackId = innovationPackData?.lookupByName.innovationPack;
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
  const templatesSetId = spaceId
    ? templatesSetData?.lookup.space?.templatesManager?.templatesSet?.id
    : templatesSetData?.lookup.innovationPack?.templatesSet?.id;

  const { data: templateData, loading: templateLoading } = useTemplateUrlResolverQuery({
    variables: { templatesSetId: templatesSetId!, templateNameId: templateNameId! },
    skip: !templatesSetId || !templateNameId,
  });
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
  if (throwIfNotFound && vcNameId && !vcLoading && !vcId) {
    throw new NotFoundError(`User '${vcNameId}' not found`);
  }

  const result = useMemo(
    () => ({
      spaceId,
      organizationId,
      innovationPackId,
      innovationHubId,
      templateId,
      userId,
      vcId,
      loading:
        spaceLoading ||
        organizationLoading ||
        templatesSetLoading ||
        innovationHubLoading ||
        innovationPackLoading ||
        templateLoading ||
        userLoading ||
        vcLoading,
    }),
    [
      spaceId,
      organizationId,
      innovationPackId,
      innovationHubId,
      templateId,
      userId,
      vcId,
      spaceLoading,
      organizationLoading,
      templatesSetLoading,
      innovationHubLoading,
      innovationPackLoading,
      templateLoading,
      userLoading,
      vcLoading,
    ]
  );
  return result;
};

export default useUrlResolver;
