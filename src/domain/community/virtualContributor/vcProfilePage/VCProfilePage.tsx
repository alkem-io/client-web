import { ReactNode } from 'react';
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
import useRestrictedRedirect from '@/core/routing/useRestrictedRedirect';
import { isApolloNotFoundError } from '@/core/apollo/hooks/useApolloErrorHandler';
import {
  AiPersonaBodyOfKnowledgeType,
  AiPersonaEngine,
  AuthorizationPrivilege,
} from '@/core/apollo/generated/graphql-schema';
import { AiPersonaModelCardModel, EMPTY_MODEL_CARD } from '../model/AiPersonaModelCardModel';

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

  const modelCardData = data?.lookup.virtualContributor?.aiPersona?.modelCard;
  const engine = data?.lookup.virtualContributor?.aiPersona?.engine;
  const modelCard: AiPersonaModelCardModel = modelCardData
    ? {
        spaceUsage: modelCardData.spaceUsage ?? EMPTY_MODEL_CARD.spaceUsage,
        aiEngine: {
          isExternal: modelCardData.aiEngine?.isExternal ?? EMPTY_MODEL_CARD.aiEngine.isExternal,
          hostingLocation: modelCardData.aiEngine?.hostingLocation ?? EMPTY_MODEL_CARD.aiEngine.hostingLocation,
          isUsingOpenWeightsModel:
            modelCardData.aiEngine?.isUsingOpenWeightsModel ?? EMPTY_MODEL_CARD.aiEngine.isUsingOpenWeightsModel,
          isInteractionDataUsedForTraining:
            modelCardData.aiEngine?.isInteractionDataUsedForTraining ??
            EMPTY_MODEL_CARD.aiEngine.isInteractionDataUsedForTraining,
          canAccessWebWhenAnswering:
            modelCardData.aiEngine?.canAccessWebWhenAnswering ?? EMPTY_MODEL_CARD.aiEngine.canAccessWebWhenAnswering,
          areAnswersRestrictedToBodyOfKnowledge:
            modelCardData.aiEngine?.areAnswersRestrictedToBodyOfKnowledge ??
            EMPTY_MODEL_CARD.aiEngine.areAnswersRestrictedToBodyOfKnowledge,
          additionalTechnicalDetails:
            modelCardData.aiEngine?.additionalTechnicalDetails ?? EMPTY_MODEL_CARD.aiEngine.additionalTechnicalDetails,
          isAssistant: engine === AiPersonaEngine.OpenaiAssistant,
        },
        monitoring: {
          isUsageMonitoredByAlkemio:
            modelCardData.monitoring?.isUsageMonitoredByAlkemio ??
            EMPTY_MODEL_CARD.monitoring.isUsageMonitoredByAlkemio,
        },
      }
    : EMPTY_MODEL_CARD;

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
    <>
      <VCProfilePageView
        bokProfile={isBokSpace ? bokProfile?.lookup.space?.about.profile : undefined}
        virtualContributor={data?.lookup.virtualContributor}
        modelCard={modelCard}
        openKnowledgeBaseDialog={openKnowledgeBaseDialog}
      />
      {children?.(data?.lookup.virtualContributor)}
    </>
  );
};

export default VCProfilePage;
