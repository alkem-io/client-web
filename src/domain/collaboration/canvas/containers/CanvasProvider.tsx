import React, { FC } from 'react';
import {
  useChallengeCanvasFromCalloutQuery,
  useHubCanvasFromCalloutQuery,
  useOpportunityCanvasFromCalloutQuery,
  useWhiteboardTemplatesQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import {
  CanvasDetailsFragment,
  CollaborationWithCanvasDetailsFragment,
  CreateCanvasWhiteboardTemplateFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { getCanvasCallout } from './getCanvasCallout';
import { JourneyLocation } from '../../../../common/utils/urlBuilders';

interface CanvasLocation extends JourneyLocation {
  calloutNameId: string;
  whiteboardNameId: string;
}

interface CanvasProviderProps extends CanvasLocation {
  children: (entities: IProvidedEntities, state: IProvidedEntitiesState) => React.ReactNode;
}

export type TemplateQuery = {
  [key in 'challengeId' | 'opportunityId']?: string;
} & { hubId: string };

export interface IProvidedEntities {
  canvas: CanvasDetailsFragment | undefined;
  templates: CreateCanvasWhiteboardTemplateFragment[];
  calloutId: string | undefined;
  authorization: NonNullable<CollaborationWithCanvasDetailsFragment['callouts']>[0]['authorization'];
}

export interface IProvidedEntitiesState {
  loadingCanvases: boolean;
  loadingTemplates: boolean;
}

const CanvasProvider: FC<CanvasProviderProps> = ({
  hubNameId: hubId,
  challengeNameId: challengeId = '',
  opportunityNameId: opportunityId = '',
  calloutNameId: calloutId,
  whiteboardNameId: canvasId,
  children,
}) => {
  const { data: whiteboardTemplates, loading: loadingTemplates } = useWhiteboardTemplatesQuery({
    variables: { hubId },
  });

  const { data: hubData, loading: loadingHub } = useHubCanvasFromCalloutQuery({
    variables: { hubId, calloutId, canvasId },
    skip: !!(challengeId || opportunityId),
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  const { data: challengeData, loading: loadingChallenge } = useChallengeCanvasFromCalloutQuery({
    variables: { hubId, challengeId, calloutId, canvasId },
    skip: !challengeId || !!opportunityId,
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  const { data: opportunityData, loading: loadingOpportunity } = useOpportunityCanvasFromCalloutQuery({
    variables: { hubId, opportunityId, calloutId, canvasId },
    skip: !opportunityId,
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  const callout =
    getCanvasCallout(hubData?.hub.collaboration?.callouts, calloutId) ??
    getCanvasCallout(challengeData?.hub.challenge.collaboration?.callouts, calloutId) ??
    getCanvasCallout(opportunityData?.hub.opportunity.collaboration?.callouts, calloutId);

  const canvas = callout?.canvases?.find(canvas => canvas.nameID === canvasId || canvas.id === canvasId) ?? undefined;

  const templates = whiteboardTemplates?.hub.templates?.whiteboardTemplates ?? [];
  const authorization = callout?.authorization;

  return (
    <>
      {children(
        { canvas, templates, calloutId, authorization },
        { loadingCanvases: loadingHub || loadingChallenge || loadingOpportunity, loadingTemplates }
      )}
    </>
  );
};

export { CanvasProvider };
