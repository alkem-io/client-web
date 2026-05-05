import { useTranslation } from 'react-i18next';
import {
  useSpaceBodyOfKnowledgeAboutQuery,
  useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery,
  useVirtualContributorProfileWithModelCardQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, VirtualContributorBodyOfKnowledgeType } from '@/core/apollo/generated/graphql-schema';
import { isApolloNotFoundError } from '@/core/apollo/hooks/useApolloErrorHandler';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import { Error404 } from '@/core/pages/Errors/Error404';
import { usePageTitle } from '@/core/routing/usePageTitle';
import useRestrictedRedirect from '@/core/routing/useRestrictedRedirect';
import { VCPublicProfileView } from '@/crd/components/virtualContributor/VCPublicProfileView';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import useKnowledgeBase from '@/domain/community/virtualContributor/knowledgeBase/useKnowledgeBase';
import { createVirtualContributorModelFull } from '@/domain/community/virtualContributor/utils/createVirtualContributorModelFull';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import {
  computeSettingsHref,
  mapHostCard,
  mapModelCardSummary,
  mapVcReferences,
  resolveBodyOfKnowledge,
} from './vcProfileMapper';

export const CrdVCProfilePage = () => {
  const { t } = useTranslation('crd-profilePages');
  const { t: tBase } = useTranslation();
  const { vcId, loading: urlResolverLoading } = useUrlResolver();
  const { loading: authLoading } = useAuthenticationContext();

  const { data, loading, error } = useVirtualContributorProfileWithModelCardQuery({
    variables: { id: vcId! },
    skip: !vcId,
  });

  const isBokSpace =
    data?.lookup.virtualContributor?.bodyOfKnowledgeType === VirtualContributorBodyOfKnowledgeType.AlkemioSpace;
  const isBokKb =
    data?.lookup.virtualContributor?.bodyOfKnowledgeType === VirtualContributorBodyOfKnowledgeType.AlkemioKnowledgeBase;
  const bokId = data?.lookup.virtualContributor?.bodyOfKnowledgeID;

  const { data: vcSpaceBokAuthPrivileges, loading: loadingBokAuth } =
    useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery({
      variables: { spaceId: bokId! },
      skip: !bokId || !isBokSpace,
    });
  const hasSpaceProfileReadAccess =
    vcSpaceBokAuthPrivileges?.lookup.myPrivileges?.space?.includes(AuthorizationPrivilege.ReadAbout) ?? false;

  const { data: bokProfileData, loading: loadingBokProfile } = useSpaceBodyOfKnowledgeAboutQuery({
    variables: { spaceId: bokId! },
    skip: !bokId || !isBokSpace || !hasSpaceProfileReadAccess,
  });

  // Knowledge-base description + privilege.
  const {
    knowledgeBaseDescription,
    hasReadAccess: kbHasReadAccess,
    loading: kbLoading,
  } = useKnowledgeBase({
    id: vcId,
  });

  useRestrictedRedirect(
    { data, error, skip: urlResolverLoading || loading },
    d => d.lookup.virtualContributor?.authorization?.myPrivileges,
    { requiredPrivilege: AuthorizationPrivilege.Read }
  );

  usePageTitle(data?.lookup.virtualContributor?.profile?.displayName);

  if (authLoading || urlResolverLoading || loading || !vcId) {
    return null;
  }

  if (error && isApolloNotFoundError(error)) {
    return <Error404 />;
  }

  const virtualContributor = data?.lookup.virtualContributor;
  const vc = createVirtualContributorModelFull(virtualContributor);
  const myPrivileges = virtualContributor?.authorization?.myPrivileges;

  const id = vc.id || vcId;
  const color = pickColorFromId(id);
  const profile = vc.profile;

  const bokSpaceProfile = isBokSpace ? bokProfileData?.lookup.space?.about.profile : undefined;

  const bodyOfKnowledge = resolveBodyOfKnowledge({
    vc,
    bokSpaceProfile: bokSpaceProfile
      ? { id: bokSpaceProfile.id, displayName: bokSpaceProfile.displayName, url: bokSpaceProfile.url }
      : undefined,
    hasSpaceReadAccess: hasSpaceProfileReadAccess,
    knowledgeBaseDescription: knowledgeBaseDescription ?? undefined,
    knowledgeBasePlaceholder: tBase('virtualContributorSpaceSettings.placeholder'),
    knowledgeBaseHasReadAccess: kbHasReadAccess,
    privateSpaceLabel: tBase('components.card.privacy.private', { entity: 'space' }),
    externalAssistantDescription: tBase('components.profile.fields.engines.externalVCDescription', {
      engineName: tBase('components.profile.fields.engines.externalAssistant'),
    }),
    externalGenericDescription: tBase('components.profile.fields.engines.externalVCDescription', {
      engineName: tBase('components.profile.fields.engines.external'),
    }),
  });

  const references = mapVcReferences(profile.references);

  const modelCard = mapModelCardSummary(vc, t('vcProfile.contentView.aiEngineExternal'));
  const host = mapHostCard(vc);
  const settingsHref = computeSettingsHref(vc, myPrivileges, buildSettingsUrl);

  const bokLoading =
    (isBokSpace && (loadingBokAuth || (hasSpaceProfileReadAccess && loadingBokProfile))) || (isBokKb && kbLoading);

  return (
    <VCPublicProfileView
      hero={{
        avatarImageUrl: profile.avatar?.uri ?? null,
        color,
        displayName: profile.displayName,
        settingsHref,
      }}
      sidebar={{
        description: profile.description ?? null,
        host,
        references,
        bodyOfKnowledge,
        labels: {
          descriptionTitle: t('vcProfile.sidebar.descriptionTitle'),
          hostTitle: t('vcProfile.sidebar.hostTitle'),
          hostEmpty: t('vcProfile.sidebar.hostEmpty'),
          referencesTitle: tBase('components.profile.fields.references.title'),
          referencesEmpty: tBase('common.no-references'),
          bodyOfKnowledgeTitle: tBase('components.profile.fields.bodyOfKnowledge.title'),
          bodyOfKnowledgePrivateTooltip: tBase('components.profile.fields.bodyOfKnowledge.privateBokTooltip'),
          bodyOfKnowledgeVisitButton: tBase('buttons.visit'),
        },
      }}
      contentView={{
        modelCard,
        references,
        labels: {
          modelCardTitle: t('vcProfile.contentView.modelCardTitle'),
          aiEngineLabel: t('vcProfile.contentView.aiEngineLabel'),
          aiEngineExternal: t('vcProfile.contentView.aiEngineExternal'),
          socialLinksTitle: t('vcProfile.contentView.socialLinksTitle'),
          socialLinksEmpty: t('vcProfile.contentView.socialLinksEmpty'),
        },
      }}
      loading={{
        hero: false,
        sidebar: false,
        bodyOfKnowledge: bokLoading,
        contentView: false,
      }}
    />
  );
};

export default CrdVCProfilePage;
