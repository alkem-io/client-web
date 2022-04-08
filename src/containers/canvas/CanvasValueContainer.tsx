import { ApolloError, SubscribeToMoreOptions } from '@apollo/client';
import { cloneDeep } from 'lodash';
import { FC, useEffect, useMemo } from 'react';
import { useApolloErrorHandler, useConfig, useNotification, useUrlParams, useUserContext } from '../../hooks';
import {
  CanvasContentUpdatedDocument,
  useChallengeCanvasValuesQuery,
  useHubCanvasValuesQuery,
  useOpportunityCanvasValuesQuery,
} from '../../hooks/generated/graphql';
import { FEATURE_SUBSCRIPTIONS } from '../../models/constants';
import { ContainerChildProps } from '../../models/container';
import {
  Canvas,
  CanvasContentUpdatedSubscription,
  CanvasValueFragment,
  ChallengeCanvasValuesQuery,
  HubCanvasValuesQuery,
  OpportunityCanvasValuesQuery,
  SubscriptionCanvasContentUpdatedArgs,
} from '../../models/graphql-schema';
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
  extends ContainerChildProps<ICanvasValueEntities, {}, CanvasValueContainerState>,
    CanvasValueParams {}

const CanvasValueContainer: FC<CanvasValueContainerProps> = ({ children, canvasId, params }) => {
  const { isFeatureEnabled } = useConfig();
  const handleError = useApolloErrorHandler();
  const notify = useNotification();
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

  useEffect(() => {
    if (!isFeatureEnabled(FEATURE_SUBSCRIPTIONS)) {
      return;
    }

    // do not subscribe if the current user has checked out the canvas
    // unsubscribe was performed on the previous render
    if (canvas?.checkout?.lockedBy === userId) {
      return;
    }

    // 'prev' variable (TData) in updateQuery type is not useful, but also not used
    type TypedSubscribeToMore<TQueryData> = (
      options: SubscribeToMoreOptions<
        TQueryData,
        SubscriptionCanvasContentUpdatedArgs,
        CanvasContentUpdatedSubscription
      >
    ) => () => void;
    type HubSubscribeToMore = TypedSubscribeToMore<HubCanvasValuesQuery>;
    type ChallengeSubscribeToMore = TypedSubscribeToMore<ChallengeCanvasValuesQuery>;
    type OpportunitySubscribeToMore = TypedSubscribeToMore<OpportunityCanvasValuesQuery>;
    let subscribeToMore: HubSubscribeToMore | ChallengeSubscribeToMore | OpportunitySubscribeToMore;

    // todo: better type
    let getCanvasesFn: (
      state: HubCanvasValuesQuery | ChallengeCanvasValuesQuery | OpportunityCanvasValuesQuery
    ) => CanvasValueFragment[];

    if (!skipHub) {
      subscribeToMore = subHub;
      getCanvasesFn = state => (state as HubCanvasValuesQuery).hub.context?.canvases ?? [];
    } else if (!skipChallenge) {
      subscribeToMore = subChallenge;
      getCanvasesFn = state => (state as ChallengeCanvasValuesQuery).hub.challenge?.context?.canvases ?? [];
    } else if (!skipOpportunity) {
      subscribeToMore = subOpportunity;
      getCanvasesFn = state => (state as OpportunityCanvasValuesQuery).hub.opportunity?.context?.canvases ?? [];
    } else {
      // do not subscribe if data is not fetched
      return;
    }

    const unSubscribe = subscribeToMore({
      document: CanvasContentUpdatedDocument,
      variables: { canvasIDs: canvasId ? [canvasId] : undefined },
      onError: err => handleError(new ApolloError({ errorMessage: err.message })),
      updateQuery: (prev, { subscriptionData }) => {
        const canvases = getCanvasesFn(prev);

        if (!canvases) {
          return prev;
        }

        const { canvasID, value } = subscriptionData.data.canvasContentUpdated;
        const canvasIndex = canvases.findIndex(x => x.id === canvasID);

        if (canvasIndex === -1) {
          notify('Canvas content update received but the canvas was not found.', 'error');
          return prev;
        }

        const newState = cloneDeep(prev);
        const newStateCanvases = getCanvasesFn(newState);
        const canvas = newStateCanvases[canvasIndex];
        newStateCanvases[canvasIndex] = {
          ...canvas,
          value,
        };
        // todo: works only on hubs
        return newState;
      },
    });
    return () => unSubscribe && unSubscribe();
  }, [subHub, subChallenge, subOpportunity, canvasId, skipHub, skipChallenge, canvas, userId]);

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
