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

interface CanvasProviderProps {
  children: (entities: IProvidedEntities, state: IProvidedEntitiesState) => React.ReactNode;
}

export type TemplateQuery = {
  [key in 'challengeId' | 'opportunityId']?: string;
} & { hubId: string };

export interface IProvidedEntities {
  canvases: CanvasDetailsFragment[];
  templates: CreateCanvasCanvasTemplateFragment[];
  calloutId: string | undefined;
  authorization: CollaborationWithCanvasDetailsFragment['authorization'];
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
    hubData?.hub.collaboration?.callouts?.[0] ??
    challengeData?.hub.challenge.collaboration?.callouts?.[0] ??
    opportunityData?.hub.opportunity.collaboration?.callouts?.[0];

  const canvases = callout?.canvases ?? [];

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
