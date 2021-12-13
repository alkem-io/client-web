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

export interface IProvidedEntities {
  canvases: CanvasWithoutValue[];
  templates: Record<string, CanvasWithoutValue[]>;
}
export interface IProvidedEntitiesState {
  loading: boolean;
}

const CanvasProvider: FC<CanvasProviderProps> = ({ children }) => {
  const { ecoverseNameId: ecoverseId, challengeNameId: challengeId, opportunityNameId: opportunityId } = useUrlParams();

  const { data: ecoverseData, loading: loadingEcoverse } = useEcoverseCanvasesQuery({
    variables: { ecoverseId },
    errorPolicy: 'all',
  });

  const { data: challengeData, loading: loadingChallenge } = useChallengeCanvasesQuery({
    variables: { ecoverseId: ecoverseId, challengeId },
    errorPolicy: 'all',
  });

  const { data: opportunityData, loading: loadingOpportunity } = useOpportunityCanvasesQuery({
    variables: { ecoverseId, opportunityId: opportunityId },
    errorPolicy: 'all',
  });

  const canvases = useMemo(() => {
    if (ecoverseId && !Boolean(challengeId) && !Boolean(opportunityId)) {
      return ecoverseData?.ecoverse.context?.canvases || [];
    }
    if (ecoverseId && challengeId && !Boolean(opportunityId)) {
      return challengeData?.ecoverse.challenge.context?.canvases || [];
    }
    if (ecoverseId && opportunityId) {
      return opportunityData?.ecoverse.opportunity.context?.canvases || [];
    }

    return [] as CanvasWithoutValue[];
  }, [ecoverseData, challengeData, opportunityData]);

  const templates = useMemo(() => {
    return {
      ecoverse: ecoverseData?.ecoverse.context?.canvases?.filter(c => c.isTemplate) || [],
      challenge: challengeData?.ecoverse.challenge.context?.canvases?.filter(c => c.isTemplate) || [],
      opportunity: opportunityData?.ecoverse.opportunity.context?.canvases?.filter(c => c.isTemplate) || [],
    };
  }, [ecoverseData, challengeData, opportunityData]);

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
