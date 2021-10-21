import { useSelector } from '@xstate/react/lib/useSelector';
import { unionWith, uniqBy } from 'lodash';
import React, { FC, useCallback, useMemo } from 'react';
import { useApolloErrorHandler, useGlobalState, useNotification, useUserContext } from '../../hooks';
import {
  refetchCommunityUpdatesQuery,
  useCommunityUpdatesQuery,
  useOnMessageReceivedSubscription,
  useRemoveUpdateCommunityMutation,
  useSendCommunityUpdateMutation,
} from '../../hooks/generated/graphql';
import { CommunicationMessageResult, Community } from '../../models/graphql-schema';
import { ADD_MESSAGE } from '../../state/global/entities/communityUpdateMachine';
import { DocumentNode, useQuery } from '@apollo/client';
import { logger } from '../../services/logging/winston/logger';

export interface CommunityUpdatesContainerProps {
  entities: {
    communityId: Community['id'];
  };
  children: (
    entities: CommunityUpdatesEntities,
    actions: CommunityUpdatesActions,
    loading: CommunityUpdatesState
  ) => React.ReactNode;
}

export interface CommunityUpdatesActions {
  onLoadMore: () => void; // TODO will be implemented in a separate issue
  onSubmit: (message: string, communityId: Community['id']) => Promise<string | undefined>;
  onRemove: (messageId: string, communityId: Community['id']) => Promise<string | undefined>;
}

export interface CommunityUpdatesState {
  retrievingUpdateMessages: boolean;
  sendingUpdateMessage: boolean;
  removingUpdateMessage: boolean;
}

export interface CommunityUpdatesEntities {
  messages: CommunicationMessageResult[];
}

export const CommunityUpdatesContainer: FC<CommunityUpdatesContainerProps> = ({ entities, children }) => {
  const handleError = useApolloErrorHandler();
  const { communityId } = entities;

  const { data, loading } = useCommunityUpdatesQuery({ variables: { communityId } });
  const [sendUpdate, { loading: loadingSendUpdate }] = useSendCommunityUpdateMutation({
    onError: handleError,
  });

  const onSubmit = useCallback<CommunityUpdatesActions['onSubmit']>(
    async message => {
      const update = await sendUpdate({
        variables: { msgData: { message, communityID: communityId } },
        refetchQueries: [refetchCommunityUpdatesQuery({ communityId })],
      });
      return update.data?.sendMessageToCommunityUpdates;
    },
    [sendUpdate, communityId]
  );

  const [removeUpdate, { loading: loadingRemoveUpdate }] = useRemoveUpdateCommunityMutation();

  const onRemove = useCallback<CommunityUpdatesActions['onRemove']>(
    async messageId => {
      const update = await removeUpdate({
        variables: { msgData: { messageId, communityID: communityId } },
        refetchQueries: [refetchCommunityUpdatesQuery({ communityId })],
      });
      return update.data?.removeMessageFromCommunityUpdates;
    },
    [sendUpdate, communityId]
  );

  return (
    <>
      {children(
        { messages: data?.community.updatesRoom?.messages || [] },
        { onLoadMore: () => {}, onSubmit, onRemove },
        {
          retrievingUpdateMessages: loading,
          sendingUpdateMessage: loadingSendUpdate,
          removingUpdateMessage: loadingRemoveUpdate,
        }
      )}
    </>
  );
};

export function useUpdateSubscription() {
  const handleError = useApolloErrorHandler();
  const { entities } = useGlobalState();
  const { communityUpdateService } = entities;
  const notify = useNotification();
  const { user } = useUserContext();

  return useOnMessageReceivedSubscription({
    shouldResubscribe: true,
    onSubscriptionData: options => {
      if (options.subscriptionData.error) {
        handleError(options.subscriptionData.error);
        return;
      }

      const subData = options.subscriptionData.data?.messageReceived;
      if (!subData) return;

      communityUpdateService.send({
        type: ADD_MESSAGE,
        payload: subData,
      });

      const communityId = subData.communityId;
      let communityName = subData.roomName;
      if (communityId) {
        communityName = user?.communities[communityId] || communityName;
      }

      notify(`You just received an update in ${communityName}`);
    },
  });
}

// Need the container in order to conditionally use the subscription
export const CommunityUpdatesSubscriptionContainer: FC<{}> = ({ children }) => {
  try {
    useUpdateSubscription();
  } catch (error) {
    // need to find a way to capture globally all subscription failures
    logger.error('Failed subscribing for community updates. Failing gracefully.');
  }

  return <>{children}</>;
};

export function useCommunityUpdateSubscriptionSelector(
  initialMessages?: CommunicationMessageResult[],
  roomId?: string
) {
  const { entities } = useGlobalState();
  const { communityUpdateService } = entities;

  const messages =
    useSelector(communityUpdateService, state => {
      return state.context.messagesByRoom[roomId || ''];
    }) || [];

  const zippedMessages = useMemo(() => {
    // merge them based on timestamp... unfortunately there is an ID mismatch when
    // an event is reported live against an event retrieved from a room api
    const mergedMessages = unionWith(messages, initialMessages, (x1, x2) => x1.timestamp === x2.timestamp);
    const uniqMessages = uniqBy(mergedMessages, x => x.timestamp);
    return uniqMessages;
  }, [initialMessages, messages]);

  return zippedMessages;
}

export interface CommunityUpdatesDataContainerProps<TQuery, TVariables> {
  entities: {
    variables: TVariables;
    document: DocumentNode;
    messageSelector: (query?: TQuery) => CommunicationMessageResult[];
    roomIdSelector: (query?: TQuery) => string;
  };
  children: (entities: CommunityUpdatesDataEntities, loading: CommunityUpdatesDataState) => React.ReactNode;
}

export interface CommunityUpdatesDataState {
  retrievingUpdateMessages: boolean;
}

export interface CommunityUpdatesDataEntities {
  messages: CommunicationMessageResult[];
}

// TODO - need to merge this into the CommunityUpdatesContainer once
// the communityIds are present everywhere accross the application
// Need the container in order to conditionally use the subscription
export const CommunityUpdatesDataContainer = <TQuery, TVariables>({
  children,
  entities,
}: CommunityUpdatesDataContainerProps<TQuery, TVariables>) => {
  const { document, variables, messageSelector, roomIdSelector } = entities;
  const { data, loading } = useQuery<TQuery, TVariables>(document, { variables });
  const messages = useMemo(() => messageSelector(data), [data, messageSelector]);
  const roomId = roomIdSelector(data);

  const updateMessages = useCommunityUpdateSubscriptionSelector(messages, roomId);

  return <>{children({ messages: updateMessages }, { retrievingUpdateMessages: loading })}</>;
};
