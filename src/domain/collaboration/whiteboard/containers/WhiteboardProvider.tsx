import React, { FC } from 'react';
import {
  useChallengeWhiteboardFromCalloutQuery,
  useHubWhiteboardFromCalloutQuery,
  useOpportunityWhiteboardFromCalloutQuery,
  useWhiteboardTemplatesQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import {
  WhiteboardDetailsFragment,
  CollaborationWithWhiteboardDetailsFragment,
  CreateWhiteboardWhiteboardTemplateFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { getWhiteboardCallout } from './getWhiteboardCallout';
import { JourneyLocation } from '../../../../common/utils/urlBuilders';

interface WhiteboardLocation extends JourneyLocation {
  calloutNameId: string;
  whiteboardNameId: string;
}

interface WhiteboardProviderProps extends WhiteboardLocation {
  children: (entities: IProvidedEntities, state: IProvidedEntitiesState) => React.ReactNode;
}

export type TemplateQuery = {
  [key in 'challengeId' | 'opportunityId']?: string;
} & { hubId: string };

export interface IProvidedEntities {
  whiteboard: WhiteboardDetailsFragment | undefined;
  templates: CreateWhiteboardWhiteboardTemplateFragment[];
  calloutId: string | undefined;
  authorization: NonNullable<CollaborationWithWhiteboardDetailsFragment['callouts']>[0]['authorization'];
}

export interface IProvidedEntitiesState {
  loadingWhiteboards: boolean;
  loadingTemplates: boolean;
}

const WhiteboardProvider: FC<WhiteboardProviderProps> = ({
  hubNameId: hubId,
  challengeNameId: challengeId = '',
  opportunityNameId: opportunityId = '',
  calloutNameId: calloutId,
  whiteboardNameId: whiteboardId,
  children,
}) => {
  const { data: whiteboardTemplates, loading: loadingTemplates } = useWhiteboardTemplatesQuery({
    variables: { hubId },
  });

  const { data: hubData, loading: loadingHub } = useHubWhiteboardFromCalloutQuery({
    variables: { hubId, calloutId, whiteboardId },
    skip: !!(challengeId || opportunityId),
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  const { data: challengeData, loading: loadingChallenge } = useChallengeWhiteboardFromCalloutQuery({
    variables: { hubId, challengeId, calloutId, whiteboardId },
    skip: !challengeId || !!opportunityId,
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  const { data: opportunityData, loading: loadingOpportunity } = useOpportunityWhiteboardFromCalloutQuery({
    variables: { hubId, opportunityId, calloutId, whiteboardId },
    skip: !opportunityId,
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  const callout =
    getWhiteboardCallout(hubData?.hub.collaboration?.callouts, calloutId) ??
    getWhiteboardCallout(challengeData?.hub.challenge.collaboration?.callouts, calloutId) ??
    getWhiteboardCallout(opportunityData?.hub.opportunity.collaboration?.callouts, calloutId);

  const whiteboard =
    callout?.whiteboards?.find(whiteboard => whiteboard.nameID === whiteboardId || whiteboard.id === whiteboardId) ??
    undefined;

  const templates = whiteboardTemplates?.hub.templates?.whiteboardTemplates ?? [];
  const authorization = callout?.authorization;

  return (
    <>
      {children(
        { whiteboard, templates, calloutId, authorization },
        { loadingWhiteboards: loadingHub || loadingChallenge || loadingOpportunity, loadingTemplates }
      )}
    </>
  );
};

export { WhiteboardProvider };
