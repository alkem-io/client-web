import React, { FC, useMemo } from 'react';
import { useUrlParams } from '../../hooks';
import {
  useCanvasTemplatesQuery,
  useChallengeCanvasesQuery,
  useHubCanvasesQuery,
  useOpportunityCanvasesQuery,
} from '../../hooks/generated/graphql';
import { CanvasDetailsFragment, CreateCanvasCanvasTemplateFragment } from '../../models/graphql-schema';

interface CanvasProviderProps {
  children: (entities: IProvidedEntities, state: IProvidedEntitiesState) => React.ReactNode;
}

export type TemplateQuery = {
  [key in 'challengeId' | 'opportunityId']?: string;
} & { hubId: string };

export interface IProvidedEntities {
  canvases: CanvasDetailsFragment[];
  templates: CreateCanvasCanvasTemplateFragment[];
}

export interface IProvidedEntitiesState {
  loading: boolean;
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
    skip: !challengeId,
    errorPolicy: 'all',
  });

  const { data: opportunityData, loading: loadingOpportunity } = useOpportunityCanvasesQuery({
    variables: { hubId, opportunityId: opportunityId },
    skip: !opportunityId,
    errorPolicy: 'all',
  });

  const canvases = useMemo(() => {
    return (
      hubData?.hub.context?.canvases ??
      challengeData?.hub.challenge.context?.canvases ??
      opportunityData?.hub.opportunity.context?.canvases ??
      []
    );
  }, [hubData, challengeData, opportunityData]);

  const templates = useMemo(() => {
    return canvasTemplates?.hub.templates?.canvasTemplates ?? [];
  }, [hubData]);

  return (
    <>
      {children(
        { canvases, templates },
        { loading: loadingHub || loadingChallenge || loadingOpportunity, loadingTemplates }
      )}
    </>
  );
};

export { CanvasProvider };
