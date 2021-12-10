import React, { FC, useMemo } from 'react';
import { useUrlParams } from '../../hooks';
import {
  useChallengeCanvasesQuery,
  useEcoverseCanvasesQuery,
  useOpportunityCanvasesQuery,
} from '../../hooks/generated/graphql';
import { Canvas } from '../../models/graphql-schema';

interface CanvasProviderProps {
  children: (entities: IProvidedEntities, state: IProvidedEntitiesState) => React.ReactNode;
}

export interface IProvidedEntities {
  canvases: Omit<Canvas, 'value'>[];
}
export interface IProvidedEntitiesState {
  loading: boolean;
}

const CanvasProvider: FC<CanvasProviderProps> = ({ children }) => {
  const { ecoverseNameId: ecoverseId, challengeNameId: challengeId, opportunityNameId: opportunityId } = useUrlParams();

  const { data: ecoverseData, loading: loadingEcoverse } = useEcoverseCanvasesQuery({
    variables: { ecoverseId },
    errorPolicy: 'all',
    skip: !ecoverseId || Boolean(challengeId) || Boolean(opportunityId),
  });

  const { data: challengeData, loading: loadingChallenge } = useChallengeCanvasesQuery({
    variables: { ecoverseId: ecoverseId, challengeId },
    errorPolicy: 'all',
    skip: !ecoverseId || !challengeId || Boolean(opportunityId),
  });

  const { data: opportunityData, loading: loadingOpportunity } = useOpportunityCanvasesQuery({
    variables: { ecoverseId, opportunityId: opportunityId },
    errorPolicy: 'all',
    skip: !ecoverseId || !opportunityId,
  });

  const canvases = useMemo(() => {
    return (
      ecoverseData?.ecoverse.context?.canvases ||
      challengeData?.ecoverse.challenge.context?.canvases ||
      opportunityData?.ecoverse.opportunity.context?.canvases ||
      []
    );
  }, [ecoverseData, challengeData, opportunityData]);

  return (
    <>
      {children(
        { canvases: canvases as Canvas[] },
        { loading: loadingEcoverse || loadingChallenge || loadingOpportunity }
      )}
    </>
  );
};

export { CanvasProvider };
