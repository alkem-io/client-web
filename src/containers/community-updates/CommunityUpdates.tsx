import { useSelector } from '@xstate/react/lib/useSelector';
import { unionWith, uniqBy } from 'lodash';
import React, { FC, useCallback, useMemo } from 'react';
import { useApolloErrorHandler, useGlobalState, useNotification } from '../../hooks';
import {
  refetchCommunityUpdatesQuery,
  useCommunityUpdatesQuery,
  useCommunicationUpdateMessageReceivedSubscription,
  useRemoveUpdateCommunityMutation,
  useSendUpdateMutation,
} from '../../hooks/generated/graphql';
import { Message, Community, User, Ecoverse, Scalars } from '../../models/graphql-schema';
import { ADD_MESSAGE } from '../../state/global/entities/communityUpdateMachine';
import { logger } from '../../services/logging/winston/logger';

export interface CommunityUpdatesContainerProps {
  entities: {
    communityId: Community['id'];
    ecoverseId: Ecoverse['id'];
  };
  children: (
    entities: CommunityUpdatesEntities,
    actions: CommunityUpdatesActions,
    loading: CommunityUpdatesState
  ) => React.ReactNode;
}

export interface CommunityUpdatesActions {
  onLoadMore: () => void; // TODO will be implemented in a separate issue
  onSubmit: (message: string, communityId: Community['id']) => Promise<Message | undefined>;
  onRemove: (messageId: string, communityId: Community['id']) => Promise<string | undefined>;
}

export interface CommunityUpdatesState {
  retrievingUpdateMessages: boolean;
  sendingUpdateMessage: boolean;
  removingUpdateMessage: boolean;
}

export interface CommunityUpdatesEntities {
  messages: Message[];
  senders: Pick<User, 'id'>[];
}

// todo: only actions are used from here; unify with CommunityUpdatesDataContainer
export const CommunityUpdatesContainer: FC<CommunityUpdatesContainerProps> = ({ entities, children }) => {
  const handleError = useApolloErrorHandler();
  const { communityId, ecoverseId } = entities;

  const { data, loading } = useCommunityUpdatesQuery({ variables: { ecoverseId, communityId } });
  const updatesId = data?.ecoverse.community?.communication?.updates?.id || '';

  const [sendUpdate, { loading: loadingSendUpdate }] = useSendUpdateMutation({
    onError: handleError,
  });

  const onSubmit = useCallback<CommunityUpdatesActions['onSubmit']>(
    async message => {
      const update = await sendUpdate({
        variables: { msgData: { message, updatesID: updatesId } },
        refetchQueries: [refetchCommunityUpdatesQuery({ ecoverseId, communityId })],
      });
      return update.data?.sendUpdate;
    },
    [sendUpdate, communityId, updatesId]
  );

  const [removeUpdate, { loading: loadingRemoveUpdate }] = useRemoveUpdateCommunityMutation();

  const onRemove = useCallback<CommunityUpdatesActions['onRemove']>(
    async messageId => {
      const update = await removeUpdate({
        variables: { msgData: { messageID: messageId, updatesID: updatesId } },
        refetchQueries: [refetchCommunityUpdatesQuery({ ecoverseId, communityId })],
      });
      return update.data?.removeUpdate;
    },
    [sendUpdate, communityId, updatesId]
  );

  const messages = data?.ecoverse.community?.communication?.updates?.messages || [];
  const senders = useMemo(() => messages.map(m => ({ id: m.sender })), [messages]);

  return (
    <>
      {children(
        { messages, senders },
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

  return useCommunicationUpdateMessageReceivedSubscription({
    shouldResubscribe: true,
    onSubscriptionData: options => {
      if (options.subscriptionData.error) {
        handleError(options.subscriptionData.error);
        return;
      }

      const subData = options.subscriptionData.data?.communicationUpdateMessageReceived;
      if (!subData) return;

      communityUpdateService.send({
        type: ADD_MESSAGE,
        payload: subData,
      });

      notify('You just received an update');
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

export function useCommunityUpdateSubscriptionSelector(initialMessages?: Message[], roomId?: string) {
  const { entities } = useGlobalState();
  const { communityUpdateService } = entities;

  const messages =
    useSelector(communityUpdateService, state => {
      return state.context.messagesByUpdate[roomId || ''];
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

export interface CommunityUpdatesDataContainerProps {
  entities: {
    ecoverseId?: Scalars['UUID_NAMEID'];
    communityId?: Scalars['UUID'];
  };
  children: (entities: CommunityUpdatesDataEntities, loading: CommunityUpdatesDataState) => React.ReactNode;
}

export interface CommunityUpdatesDataState {
  retrievingUpdateMessages: boolean;
}

export interface CommunityUpdatesDataEntities {
  messages: Message[];
  senders: Pick<User, 'id'>[];
}

// TODO - need to merge this into the CommunityUpdatesContainer once
// the communityIds are present everywhere across the application
// Need the container in order to conditionally use the subscription
export const CommunityUpdatesDataContainer = ({ children, entities }: CommunityUpdatesDataContainerProps) => {
  const handleError = useApolloErrorHandler();
  const { ecoverseId = '', communityId = '' } = entities;
  const { data, loading } = useCommunityUpdatesQuery({
    variables: { ecoverseId, communityId },
    skip: !ecoverseId || !communityId,
    onError: handleError,
  });
  const oldMessages = data?.ecoverse?.community?.communication?.updates?.messages ?? [];
  const roomId = data?.ecoverse?.community?.communication?.updates?.id;

  const messages = useCommunityUpdateSubscriptionSelector(oldMessages, roomId);
  const senders = useMemo(() => messages.map(m => ({ id: m.sender })), [messages]);

  return <>{children({ messages, senders }, { retrievingUpdateMessages: loading })}</>;
};
