import React, { FC } from 'react';
import { useUrlParams } from '../../hooks';
import {
  useCanvasTemplatesQuery,
  useChallengeCanvasesQuery,
  useHubCanvasesQuery,
  useOpportunityCanvasesQuery,
} from '../../hooks/generated/graphql';
import {
  CanvasDetailsFragment,
  CollaborationWithCanvasDetailsFragment,
  CreateCanvasCanvasTemplateFragment,
} from '../../models/graphql-schema';
import { getCanvasCallout } from './getCanvasCallout';

interface CanvasProviderProps {
  children: (entities: IProvidedEntities, state: IProvidedEntitiesState) => React.ReactNode;
}

export type TemplateQuery = {
  [key in 'challengeId' | 'opportunityId']?: string;
} & { hubId: string };

export interface IProvidedEntities {
  canvases: (CanvasDetailsFragment & { calloutNameId: string })[];
  templates: CreateCanvasCanvasTemplateFragment[];
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
  } = useUrlParams();

  const { data: canvasTemplates, loading: loadingTemplates } = useCanvasTemplatesQuery({
    variables: { hubId },
  });

  const { data: hubData, loading: loadingHub } = useHubCanvasesQuery({
    variables: { hubId },
    skip: !!(challengeId || opportunityId),
    errorPolicy: 'all',
  });

  const { data: challengeData, loading: loadingChallenge } = useChallengeCanvasesQuery({
    variables: { hubId: hubId, challengeId },
    skip: !challengeId || !!opportunityId,
    errorPolicy: 'all',
  });

  const { data: opportunityData, loading: loadingOpportunity } = useOpportunityCanvasesQuery({
    variables: { hubId, opportunityId: opportunityId },
    skip: !opportunityId,
    errorPolicy: 'all',
  });

  const callout =
    getCanvasCallout(hubData?.hub.collaboration?.callouts) ??
    getCanvasCallout(challengeData?.hub.challenge.collaboration?.callouts) ??
    getCanvasCallout(opportunityData?.hub.opportunity.collaboration?.callouts);

  const canvases = callout?.canvases?.map(canvas => ({ ...canvas, calloutNameId: callout.nameID })) ?? [];

  const templates = canvasTemplates?.hub.templates?.canvasTemplates ?? [];

  const calloutId = callout?.id;
  const authorization = callout?.authorization;

  return (
    <>
      {children(
        { canvases, templates, calloutId, authorization },
        { loadingCanvases: loadingHub || loadingChallenge || loadingOpportunity, loadingTemplates }
      )}
    </>
  );
};

export { CanvasProvider };
