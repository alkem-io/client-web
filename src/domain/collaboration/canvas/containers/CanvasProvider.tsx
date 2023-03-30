import React, { FC } from 'react';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import {
  useWhiteboardTemplatesQuery,
  useChallengeCanvasFromCalloutQuery,
  useHubCanvasFromCalloutQuery,
  useOpportunityCanvasFromCalloutQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import {
  CanvasDetailsFragment,
  CollaborationWithCanvasDetailsFragment,
  CreateCanvasWhiteboardTemplateFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { getCanvasCallout } from './getCanvasCallout';

interface CanvasProviderProps {
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

const CanvasProvider: FC<CanvasProviderProps> = ({ children }) => {
  const {
    hubNameId: hubId = '',
    challengeNameId: challengeId = '',
    opportunityNameId: opportunityId = '',
    calloutNameId: calloutId = '',
    canvasNameId = '',
  } = useUrlParams();

  const { data: whiteboardTemplates, loading: loadingTemplates } = useWhiteboardTemplatesQuery({
    variables: { hubId },
  });

  const { data: hubData, loading: loadingHub } = useHubCanvasFromCalloutQuery({
    variables: { hubId, calloutId, canvasId: canvasNameId },
    skip: !!(challengeId || opportunityId),
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  const { data: challengeData, loading: loadingChallenge } = useChallengeCanvasFromCalloutQuery({
    variables: { hubId, challengeId, calloutId, canvasId: canvasNameId },
    skip: !challengeId || !!opportunityId,
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  const { data: opportunityData, loading: loadingOpportunity } = useOpportunityCanvasFromCalloutQuery({
    variables: { hubId, opportunityId, calloutId, canvasId: canvasNameId },
    skip: !opportunityId,
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  const callout =
    getCanvasCallout(hubData?.hub.collaboration?.callouts, calloutId) ??
    getCanvasCallout(challengeData?.hub.challenge.collaboration?.callouts, calloutId) ??
    getCanvasCallout(opportunityData?.hub.opportunity.collaboration?.callouts, calloutId);

  const canvas = callout?.canvases?.find(canvas => canvas.nameID === canvasNameId) ?? undefined;

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
