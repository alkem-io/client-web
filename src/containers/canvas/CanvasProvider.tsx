import React, { FC, useMemo } from 'react';
import { useUrlParams } from '../../hooks';
import {
  useChallengeCanvasesQuery,
  useEcoverseCanvasesQuery,
  useOpportunityCanvasesQuery,
} from '../../hooks/generated/graphql';
import { CanvasWithoutValue } from '../../models/entities/canvas';

interface CanvasProviderProps {
  children: (entities: IProvidedEntities, state: IProvidedEntitiesState) => React.ReactNode;
}

export type TemplateQuery = {
  [key in 'challengeId' | 'opportunityId']?: string;
} & { hubId: string };

export interface ITemplateQueryResult {
  query: TemplateQuery;
  result: CanvasWithoutValue[];
}

export interface IProvidedEntities {
  canvases: CanvasWithoutValue[];
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

  const { data: hubData, loading: loadingEcoverse } = useEcoverseCanvasesQuery({
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
    if (hubId && !Boolean(challengeId) && !Boolean(opportunityId)) {
      return hubData?.hub.context?.canvases || [];
    }
    if (hubId && challengeId && !Boolean(opportunityId)) {
      return challengeData?.hub.challenge.context?.canvases || [];
    }
    if (hubId && opportunityId) {
      return opportunityData?.hub.opportunity.context?.canvases || [];
    }

    return [] as CanvasWithoutValue[];
  }, [hubData, challengeData, opportunityData]);

  const templates = useMemo(() => {
    return {
      hub: {
        query: { hubId: hubId },
        result: hubData?.hub.context?.canvases?.filter(c => c.isTemplate) || [],
      },
      challenge: {
        query: { hubId: hubId, challengeId: challengeId },
        result: challengeData?.hub.challenge.context?.canvases?.filter(c => c.isTemplate) || [],
      },
      opportunity: {
        query: { hubId: hubId, opportunityId: opportunityId },
        result: opportunityData?.hub.opportunity.context?.canvases?.filter(c => c.isTemplate) || [],
      },
    };
  }, [hubData, challengeData, opportunityData]);

  return (
    <>
      {children(
        // TODO: need to fix the typings
        { canvases: canvases as any, templates: templates as any },
        { loading: loadingEcoverse || loadingChallenge || loadingOpportunity }
      )}
    </>
  );
};

export { CanvasProvider };
