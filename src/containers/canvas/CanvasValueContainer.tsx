import { FC, useMemo } from 'react';
import { useUrlParams } from '../../hooks';
import {
  useChallengeCanvasValuesQuery,
  useEcoverseCanvasValuesQuery,
  useOpportunityCanvasValuesQuery,
} from '../../hooks/generated/graphql';
import { ContainerProps } from '../../models/container';
import { Canvas } from '../../models/graphql-schema';
import { TemplateQuery } from './CanvasProvider';

export interface ICanvasValueEntities {
  canvas?: Canvas;
}

export interface CanvasValueContainerState {
  loadingCanvasValue?: boolean;
}

export interface CanvasValueParams {
  canvasId?: string;
  params?: TemplateQuery;
}

export interface CanvasValueContainerProps
  extends ContainerProps<ICanvasValueEntities, {}, CanvasValueContainerState>,
    CanvasValueParams {}

const CanvasValueContainer: FC<CanvasValueContainerProps> = ({ children, canvasId, params }) => {
  const { ecoverseNameId: ecoverseId, challengeNameId: challengeId, opportunityNameId: opportunityId } = useUrlParams();
  let queryOpportunityId: string | undefined = opportunityId;
  let queryChallengeId: string | undefined = challengeId;
  let queryEcoverseId: string | undefined = ecoverseId;

  if (params) {
    queryOpportunityId = params?.opportunityId;
    queryChallengeId = params?.challengeId;
    queryEcoverseId = params?.hubId;
  }

  const { data: ecoverseData, loading: loadingEcoverseCanvasValue } = useEcoverseCanvasValuesQuery({
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-and-network',
    skip: Boolean(queryChallengeId) || Boolean(queryOpportunityId) || !Boolean(canvasId),
    variables: {
      ecoverseId: queryEcoverseId,
      canvasId: canvasId || '',
    },
  });
  const { data: challengeData, loading: loadingChallengeCanvasValue } = useChallengeCanvasValuesQuery({
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-and-network',
    skip: Boolean(queryOpportunityId) || !Boolean(queryChallengeId) || !Boolean(canvasId),
    variables: {
      ecoverseId: queryEcoverseId,
      challengeId: queryChallengeId || '',
      canvasId: canvasId || '',
    },
  });
  const { data: opportunityData, loading: loadingOpportunityCanvasValue } = useOpportunityCanvasValuesQuery({
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-and-network',
    skip: !Boolean(queryOpportunityId) || !Boolean(canvasId),
    variables: {
      ecoverseId: queryEcoverseId,
      opportunityId: queryOpportunityId || '',
      canvasId: canvasId || '',
    },
  });

  const canvas = useMemo(() => {
    const sourceArray =
      ecoverseData?.ecoverse.context?.canvases ||
      challengeData?.ecoverse.challenge.context?.canvases ||
      opportunityData?.ecoverse.opportunity.context?.canvases;

    return sourceArray?.find(c => c.id === canvasId) as Canvas | undefined;
  }, [ecoverseData, challengeData, opportunityData, canvasId]);
  return (
    <>
      {children(
        {
          canvas,
        },
        {
          loadingCanvasValue:
            loadingEcoverseCanvasValue || loadingChallengeCanvasValue || loadingOpportunityCanvasValue,
        },
        {}
      )}
    </>
  );
};

export default CanvasValueContainer;
