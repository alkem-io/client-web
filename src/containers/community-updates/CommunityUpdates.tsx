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
  const { communityId } = entities;

  const { data, loading } = useCommunityUpdatesQuery({ variables: { communityId } });
  const [sendUpdate, { loading: loadingSendUpdate }] = useSendCommunityUpdateMutation();

  const onSubmit = useCallback<CommunityUpdatesActions['onSubmit']>(
    async message => {
      const update = await sendUpdate({
        variables: { msgData: { message, communityID: communityId } },
        refetchQueries: [refetchCommunityUpdatesQuery({ communityId })],
      });
      return update.data?.messageUpdateCommunity;
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
      return update.data?.removeUpdateCommunity;
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

export function useCommunityUpdateSubscriptionSelector(community?: Partial<Community>) {
  const { entities } = useGlobalState();
  const { communityUpdateService } = entities;

  const roomId = community?.updatesRoom?.id;
  const initialMessages = community?.updatesRoom?.messages;
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
