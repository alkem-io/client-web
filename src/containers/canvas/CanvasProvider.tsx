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
  ContextWithCanvasDetailsFragment,
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
  contextId: string | undefined;
  authorization: ContextWithCanvasDetailsFragment['authorization'];
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

  const context =
    hubData?.hub.context ?? challengeData?.hub.challenge.context ?? opportunityData?.hub.opportunity.context;

  const canvases = context?.canvases ?? [];

  const templates = canvasTemplates?.hub.templates?.canvasTemplates ?? [];

  const contextId = context?.id;
  const authorization = context?.authorization;

  return (
    <>
      {children(
        { canvases, templates, contextId, authorization },
        { loadingCanvases: loadingHub || loadingChallenge || loadingOpportunity, loadingTemplates }
      )}
    </>
  );
};

export { CanvasProvider };
