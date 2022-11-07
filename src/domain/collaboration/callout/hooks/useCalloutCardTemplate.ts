import { useApolloErrorHandler } from '../../../../hooks';
import {
  useChallengeCalloutCardTemplateQuery,
  useHubCalloutCardTemplateQuery,
  useOpportunityCalloutCardTemplateQuery,
} from '../../../../hooks/generated/graphql';
import { CoreEntityIdTypes, isChallengeId, isHubId, isOpportunityId } from '../../../shared/types/CoreEntityIds';
import { CardCreationCardTemplate } from '../../aspect/AspectCreationDialog/AspectCreationDialog';

type UseCalloutCardTemplateReturnType = {
  cardTemplate: CardCreationCardTemplate | undefined;
};

type CalloutCardTemplateParams = CoreEntityIdTypes & {
  calloutNameId: string;
};

export const useCalloutCardTemplate = (params: CalloutCardTemplateParams): UseCalloutCardTemplateReturnType => {
  const handleError = useApolloErrorHandler();

  const { data: hubCalloutsCardTemplates } = useHubCalloutCardTemplateQuery({
    variables: isHubId(params) ? params : (params as never),
    skip: !isHubId(params),
    onError: handleError,
  });
  const { data: challengeCalloutsCardTemplates } = useChallengeCalloutCardTemplateQuery({
    variables: isChallengeId(params) ? params : (params as never),
    skip: !isChallengeId(params),
    onError: handleError,
  });
  const { data: opportunityCalloutsCardTemplates } = useOpportunityCalloutCardTemplateQuery({
    variables: isOpportunityId(params) ? params : (params as never),
    skip: !isOpportunityId(params),
    onError: handleError,
  });

  const callouts =
    hubCalloutsCardTemplates?.hub.collaboration?.callouts ??
    challengeCalloutsCardTemplates?.hub.challenge.collaboration?.callouts ??
    opportunityCalloutsCardTemplates?.hub.opportunity.collaboration?.callouts;

  if (callouts) {
    const parentCallout = callouts[0];
    const cardTemplate: CardCreationCardTemplate = {
      type: parentCallout?.cardTemplate?.type,
      defaultDescription: parentCallout?.cardTemplate?.defaultDescription,
      info: {
        tags: parentCallout?.cardTemplate?.info.tagset?.tags,
        visualUri: parentCallout?.cardTemplate?.info.visual?.uri,
      },
    };
    return { cardTemplate };
  }

  return { cardTemplate: undefined };
};
