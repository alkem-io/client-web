import {
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

type UseUrlResolverProvided = {
  spaceId: string | undefined;
  organizationId: string | undefined;
  innovationPackId: string | undefined;
  templateId: string | undefined;
  userId: string | undefined;
  vcId: string | undefined;
  loading: boolean;
};

const useUrlResolver = (overrideUrlParams?: UrlParams): UseUrlResolverProvided => {
  const urlParams = {
    ...useUrlParams(),
    ...overrideUrlParams,
  };

  const { spaceNameId, organizationNameId, innovationPackNameId, templateNameId, userNameId, vcNameId } = urlParams;

  // Space
  const { data: spaceData, loading: spaceLoading } = useSpaceUrlResolverQuery({
    variables: { nameId: spaceNameId! },
    skip: !spaceNameId,
  });
  const spaceId = spaceData?.lookupByName.space;

  // Organization
  const { data: organizationData, loading: organizationLoading } = useOrganizationUrlResolverQuery({
    variables: { nameId: organizationNameId! },
    skip: !organizationNameId,
  });
  const organizationId = organizationData?.lookupByName.organization;

  // Innovation Packs
  const { data: innovationPackData, loading: innovationPackLoading } = useInnovationPackUrlResolverQuery({
    variables: { innovationPackNameId: innovationPackNameId! },
    skip: !innovationPackNameId,
  });
  const innovationPackId = innovationPackData?.lookupByName.innovationPack;

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

  // User
  const { data: userData, loading: userLoading } = useUserUrlResolverQuery({
    variables: { nameId: userNameId! },
    skip: !userNameId,
  });
  const userId = userData?.lookupByName.user;

  // Virtual Contributor
  const { data: virtualContributorData, loading: virtualContributorLoading } = useVirtualContributorUrlResolverQuery({
    variables: { nameId: vcNameId! },
    skip: !vcNameId,
  });
  const vcId = virtualContributorData?.lookupByName.virtualContributor;

  return {
    spaceId,
    organizationId,
    innovationPackId,
    templateId,
    userId,
    vcId,
    loading:
      spaceLoading ||
      organizationLoading ||
      templatesSetLoading ||
      innovationPackLoading ||
      templateLoading ||
      userLoading ||
      virtualContributorLoading,
  };
};

export default useUrlResolver;
