import { ApolloError, SubscribeToMoreOptions } from '@apollo/client';
import { cloneDeep } from 'lodash';
import { FC, useEffect, useMemo } from 'react';
import { useApolloErrorHandler, useConfig, useNotification, useUrlParams, useUserContext } from '../../hooks';
import {
  CanvasContentUpdatedDocument,
  useChallengeCanvasValuesQuery,
  useEcoverseCanvasValuesQuery,
  useOpportunityCanvasValuesQuery,
} from '../../hooks/generated/graphql';
import { FEATURE_SUBSCRIPTIONS } from '../../models/constants';
import { ContainerProps } from '../../models/container';
import {
  Canvas,
  CanvasContentUpdatedSubscription,
  CanvasValueFragment,
  ChallengeCanvasValuesQuery,
  EcoverseCanvasValuesQuery,
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
  extends ContainerProps<ICanvasValueEntities, {}, CanvasValueContainerState>,
    CanvasValueParams {}

const CanvasValueContainer: FC<CanvasValueContainerProps> = ({ children, canvasId, params }) => {
  const { isFeatureEnabled } = useConfig();
  const handleError = useApolloErrorHandler();
  const notify = useNotification();
  const {
    ecoverseNameId: ecoverseId = '',
    challengeNameId: challengeId = '',
    opportunityNameId: opportunityId = '',
  } = useUrlParams();
  let queryOpportunityId: string | undefined = opportunityId;
  let queryChallengeId: string | undefined = challengeId;
  let queryEcoverseId: string | undefined = ecoverseId;

  const { user: userMetadata } = useUserContext();
  const userId = userMetadata?.user.id;

  if (params) {
    queryOpportunityId = params?.opportunityId;
    queryChallengeId = params?.challengeId;
    queryEcoverseId = params?.hubId;
  }

  const skipEcoverse = Boolean(queryChallengeId) || Boolean(queryOpportunityId) || !Boolean(canvasId);
  const skipChallenge = Boolean(queryOpportunityId) || !Boolean(queryChallengeId) || !Boolean(canvasId);
  const skipOpportunity = !Boolean(queryOpportunityId) || !Boolean(canvasId);

  const {
    data: ecoverseData,
    loading: loadingEcoverseCanvasValue,
    subscribeToMore: subEcoverse,
  } = useEcoverseCanvasValuesQuery({
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-and-network',
    skip: skipEcoverse,
    variables: {
      ecoverseId: queryEcoverseId,
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
      ecoverseId: queryEcoverseId,
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
    type EcoverseSubscribeToMore = TypedSubscribeToMore<EcoverseCanvasValuesQuery>;
    type ChallengeSubscribeToMore = TypedSubscribeToMore<ChallengeCanvasValuesQuery>;
    type OpportunitySubscribeToMore = TypedSubscribeToMore<OpportunityCanvasValuesQuery>;
    let subscribeToMore: EcoverseSubscribeToMore | ChallengeSubscribeToMore | OpportunitySubscribeToMore;

    // todo: better type
    let getCanvasesFn: (
      state: EcoverseCanvasValuesQuery | ChallengeCanvasValuesQuery | OpportunityCanvasValuesQuery
    ) => CanvasValueFragment[];

    if (!skipEcoverse) {
      subscribeToMore = subEcoverse;
      getCanvasesFn = state => (state as EcoverseCanvasValuesQuery).ecoverse.context?.canvases ?? [];
    } else if (!skipChallenge) {
      subscribeToMore = subChallenge;
      getCanvasesFn = state => (state as ChallengeCanvasValuesQuery).ecoverse.challenge?.context?.canvases ?? [];
    } else if (!skipOpportunity) {
      subscribeToMore = subOpportunity;
      getCanvasesFn = state => (state as OpportunityCanvasValuesQuery).ecoverse.opportunity?.context?.canvases ?? [];
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
  }, [subEcoverse, subChallenge, subOpportunity, canvasId, skipEcoverse, skipChallenge, canvas, userId]);

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
