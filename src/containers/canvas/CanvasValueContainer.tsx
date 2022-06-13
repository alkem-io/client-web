import { FC, useMemo } from 'react';
import { useUrlParams, useUserContext } from '../../hooks';
import {
  CanvasContentUpdatedDocument,
  useChallengeCanvasValuesQuery,
  useHubCanvasValuesQuery,
  useOpportunityCanvasValuesQuery,
} from '../../hooks/generated/graphql';
import { ContainerChildProps } from '../../models/container';
import {
  Canvas,
  CanvasContentUpdatedSubscription,
  CanvasDetailsFragment,
  CanvasValueFragment,
  SubscriptionCanvasContentUpdatedArgs,
} from '../../models/graphql-schema';
import { TemplateQuery } from './CanvasProvider';
import UseSubscriptionToSubEntity from '../../domain/shared/subscriptions/useSubscriptionToSubEntity';
import findById from '../../domain/shared/utils/findById';

export interface ICanvasValueEntities {
  canvas?: Canvas;
}

export interface CanvasValueContainerState {
  loadingCanvasValue?: boolean;
}

export interface CanvasValueParams {
  canvasId: string | undefined;
  params?: TemplateQuery;
}

export interface CanvasValueContainerProps
  extends ContainerChildProps<ICanvasValueEntities, {}, CanvasValueContainerState>,
    CanvasValueParams {}

const useSubscribeToCanvas = UseSubscriptionToSubEntity<
  CanvasValueFragment & CanvasDetailsFragment,
  CanvasContentUpdatedSubscription,
  SubscriptionCanvasContentUpdatedArgs
>({
  subscriptionDocument: CanvasContentUpdatedDocument,
  getSubscriptionVariables: canvas => ({ canvasIDs: [canvas.id] }),
  updateSubEntity: (canvas, subscriptionData) => {
    if (canvas) {
      canvas.value = subscriptionData.canvasContentUpdated.value;
    }
  },
});

const CanvasValueContainer: FC<CanvasValueContainerProps> = ({ children, canvasId, params }) => {
  const {
    hubNameId: hubId = '',
    challengeNameId: challengeId = '',
    opportunityNameId: opportunityId = '',
  } = useUrlParams();
  let queryOpportunityId: string | undefined = opportunityId;
  let queryChallengeId: string | undefined = challengeId;
  let queryHubId: string | undefined = hubId;

  const { user: userMetadata } = useUserContext();
  const userId = userMetadata?.user.id;

  if (params) {
    queryOpportunityId = params?.opportunityId;
    queryChallengeId = params?.challengeId;
    queryHubId = params?.hubId;
  }

  const skipHub = Boolean(queryChallengeId) || Boolean(queryOpportunityId) || !Boolean(canvasId);
  const skipChallenge = Boolean(queryOpportunityId) || !Boolean(queryChallengeId) || !Boolean(canvasId);
  const skipOpportunity = !Boolean(queryOpportunityId) || !Boolean(canvasId);

  const {
    data: hubData,
    loading: loadingHubCanvasValue,
    subscribeToMore: subHub,
  } = useHubCanvasValuesQuery({
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-and-network',
    skip: skipHub,
    variables: {
      hubId: queryHubId,
      canvasId: canvasId || '',
    },
  });
  const {
    data: challengeData,
    loading: loadingChallengeCanvasValue,
    subscribeToMore: subChallenge,
  } = useChallengeCanvasValuesQuery({
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-and-network',
    skip: skipChallenge,
    variables: {
      hubId: queryHubId,
      challengeId: queryChallengeId || '',
      canvasId: canvasId || '',
    },
  });
  const {
    data: opportunityData,
    loading: loadingOpportunityCanvasValue,
    subscribeToMore: subOpportunity,
  } = useOpportunityCanvasValuesQuery({
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-and-network',
    skip: skipOpportunity,
    variables: {
      hubId: queryHubId,
      opportunityId: queryOpportunityId || '',
      canvasId: canvasId || '',
    },
  });

  const canvas = useMemo(() => {
    const sourceArray =
      hubData?.hub.context?.canvases ||
      challengeData?.hub.challenge.context?.canvases ||
      opportunityData?.hub.opportunity.context?.canvases;

    return sourceArray?.find(c => c.id === canvasId) as Canvas | undefined;
  }, [hubData, challengeData, opportunityData, canvasId]);

  const skipCanvasSubscription = !canvasId || canvas?.checkout?.lockedBy === userId;

  useSubscribeToCanvas(hubData, data => findById(data?.hub.context?.canvases, canvasId!), subHub, {
    skip: skipCanvasSubscription,
  });

  useSubscribeToCanvas(
    challengeData,
    data => findById(data?.hub.challenge.context?.canvases, canvasId!),
    subChallenge,
    { skip: skipCanvasSubscription }
  );

  useSubscribeToCanvas(
    opportunityData,
    data => findById(data?.hub.opportunity.context?.canvases, canvasId!),
    subOpportunity,
    { skip: skipCanvasSubscription }
  );

  return (
    <>
      {children(
        {
          canvas,
        },
        {
          loadingCanvasValue: loadingHubCanvasValue || loadingChallengeCanvasValue || loadingOpportunityCanvasValue,
        },
        {}
      )}
    </>
  );
};

export default CanvasValueContainer;
