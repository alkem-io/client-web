import React, { FC, useMemo } from 'react';
import { useUrlParams } from '../../hooks';
import {
  useChallengeCanvasesQuery,
  useHubCanvasesQuery,
  useOpportunityCanvasesQuery,
} from '../../hooks/generated/graphql';
import { CanvasDetailsFragment } from '../../models/graphql-schema';

interface CanvasProviderProps {
  children: (entities: IProvidedEntities, state: IProvidedEntitiesState) => React.ReactNode;
}

export type TemplateQuery = {
  [key in 'challengeId' | 'opportunityId']?: string;
} & { hubId: string };

export interface ITemplateQueryResult {
  query: TemplateQuery;
  result: CanvasDetailsFragment[];
}

export interface IProvidedEntities {
  canvases: CanvasDetailsFragment[];
  templates: Record<string, ITemplateQueryResult>;
}
export interface IProvidedEntitiesState {
  loading: boolean;
}

const CanvasProvider: FC<CanvasProviderProps> = ({ children }) => {
  const {
    hubNameId: hubId = '',
    challengeNameId: challengeId = '',
    opportunityNameId: opportunityId = '',
  } = useUrlParams();

  const { data: hubData, loading: loadingHub } = useHubCanvasesQuery({
    variables: { hubId },
    errorPolicy: 'all',
  });

  const { data: challengeData, loading: loadingChallenge } = useChallengeCanvasesQuery({
    variables: { hubId: hubId, challengeId },
    skip: !Boolean(challengeId),
    errorPolicy: 'all',
  });

  const { data: opportunityData, loading: loadingOpportunity } = useOpportunityCanvasesQuery({
    variables: { hubId, opportunityId: opportunityId },
    skip: !Boolean(opportunityId),
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

  // const templates = useMemo(() => {
  //   return {
  //     hub: {
  //       query: { hubId: hubId },
  //       result: hubData?.hub.templates?.canvasTemplates || [],
  //     },
  //   };
  // }, [hubData]);

  return (
    <>{children({ canvases, templates: {} }, { loading: loadingHub || loadingChallenge || loadingOpportunity })}</>
  );
};

export { CanvasProvider };
