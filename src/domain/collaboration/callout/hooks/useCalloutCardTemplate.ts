import { useApolloErrorHandler } from '../../../../hooks';
import {
  useChallengeCalloutCardTemplateQuery,
  useHubCalloutCardTemplateQuery,
  useOpportunityCalloutCardTemplateQuery,
} from '../../../../hooks/generated/graphql';
import { Scalars } from '../../../../models/graphql-schema';
import { CardCreationCardTemplate } from '../../aspect/AspectCreationDialog/AspectCreationDialog';

type UseCalloutCardTemplateReturnType = {
  cardTemplate: CardCreationCardTemplate | undefined;
};

type CalloutCardTemplateParams = {
  calloutNameId: Scalars['UUID_NAMEID'];
  hubNameId: Scalars['UUID_NAMEID'];
  challengeNameId?: Scalars['UUID_NAMEID'];
  opportunityNameId?: Scalars['UUID_NAMEID'];
};

export const useCalloutCardTemplate = (params: CalloutCardTemplateParams): UseCalloutCardTemplateReturnType => {
  const handleError = useApolloErrorHandler();

  const { calloutNameId, hubNameId, challengeNameId = '', opportunityNameId = '' } = params;

  const { data: hubCalloutsCardTemplates } = useHubCalloutCardTemplateQuery({
    variables: { hubId: hubNameId, calloutId: calloutNameId },
    skip: !hubNameId || !!(challengeNameId || opportunityNameId),
    onError: handleError,
  });
  const { data: challengeCalloutsCardTemplates } = useChallengeCalloutCardTemplateQuery({
    variables: { hubId: hubNameId, calloutId: calloutNameId, challengeNameId },
    skip: !challengeNameId || !hubNameId || !!opportunityNameId,
    onError: handleError,
  });
  const { data: opportunityCalloutsCardTemplates } = useOpportunityCalloutCardTemplateQuery({
    variables: { hubId: hubNameId, calloutId: calloutNameId, opportunityNameId },
    skip: !opportunityNameId || !hubNameId,
    onError: handleError,
  });

  let cardTemplate: CardCreationCardTemplate | undefined;
  if (hubCalloutsCardTemplates?.hub.collaboration?.callouts) {
    const parentCallout = hubCalloutsCardTemplates.hub.collaboration.callouts[0];
    if (parentCallout) {
      cardTemplate = {
        type: parentCallout?.cardTemplate?.type,
        defaultDescription: parentCallout?.cardTemplate?.defaultDescription,
        info: {
          tags: parentCallout?.cardTemplate?.info.tagset?.tags,
          visualUri: parentCallout?.cardTemplate?.info.visual?.uri,
        },
      };
    }
  }
  if (challengeCalloutsCardTemplates?.hub.challenge.collaboration?.callouts) {
    const parentCallout = challengeCalloutsCardTemplates.hub.challenge.collaboration.callouts[0];
    if (parentCallout) {
      cardTemplate = {
        type: parentCallout?.cardTemplate?.type,
        defaultDescription: parentCallout?.cardTemplate?.defaultDescription,
        info: {
          tags: parentCallout?.cardTemplate?.info.tagset?.tags,
          visualUri: parentCallout?.cardTemplate?.info.visual?.uri,
        },
      };
    }
  }
  if (opportunityCalloutsCardTemplates?.hub.opportunity.collaboration?.callouts) {
    const parentCallout = opportunityCalloutsCardTemplates.hub.opportunity.collaboration.callouts[0];
    if (parentCallout) {
      cardTemplate = {
        type: parentCallout?.cardTemplate?.type,
        defaultDescription: parentCallout?.cardTemplate?.defaultDescription,
        info: {
          tags: parentCallout?.cardTemplate?.info.tagset?.tags,
          visualUri: parentCallout?.cardTemplate?.info.visual?.uri,
        },
      };
    }
  }

  return { cardTemplate };
};
