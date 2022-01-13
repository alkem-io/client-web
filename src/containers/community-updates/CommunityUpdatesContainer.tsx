import { merge } from 'lodash';
import React, { FC, useCallback, useEffect, useMemo } from 'react';
import { ApolloError } from '@apollo/client';
import { useApolloErrorHandler, useConfig } from '../../hooks';
import {
  CommunicationUpdateMessageReceivedDocument,
  refetchCommunityUpdatesQuery,
  useCommunityUpdatesQuery,
  useRemoveUpdateCommunityMutation,
  useSendUpdateMutation,
} from '../../hooks/generated/graphql';
import {
  Message,
  Community,
  User,
  Ecoverse,
  CommunicationUpdateMessageReceivedSubscription,
} from '../../models/graphql-schema';
import { FEATURE_SUBSCRIPTIONS } from '../../models/constants';
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

export const CommunityUpdatesContainer: FC<CommunityUpdatesContainerProps> = ({ entities, children }) => {
  const handleError = useApolloErrorHandler();
  const { isFeatureEnabled } = useConfig();
  const { communityId, ecoverseId } = entities;
  const { data, loading } = useCommunityUpdatesData(ecoverseId, communityId);

  const updatesId = data?.ecoverse.community?.communication?.updates?.id || '';

  const [sendUpdate, { loading: loadingSendUpdate }] = useSendUpdateMutation({
    onError: handleError,
    refetchQueries: isFeatureEnabled(FEATURE_SUBSCRIPTIONS)
      ? []
      : [refetchCommunityUpdatesQuery({ ecoverseId, communityId })],
  });

  const onSubmit = useCallback<CommunityUpdatesActions['onSubmit']>(
    async message => {
      const update = await sendUpdate({
        variables: { msgData: { message, updatesID: updatesId } },
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

  const onLoadMore = () => {
    throw new Error('Not implemented');
  };

  const messages = data?.ecoverse.community?.communication?.updates?.messages || [];
  const senders = useMemo(() => messages.map(m => ({ id: m.sender })), [messages]);

  return (
    <>
      {children(
        { messages, senders },
        { onLoadMore, onSubmit, onRemove },
        {
          retrievingUpdateMessages: loading,
          sendingUpdateMessage: loadingSendUpdate,
          removingUpdateMessage: loadingRemoveUpdate,
        }
      )}
    </>
  );
};

const useCommunityUpdatesData = (ecoverseNameId?: string, communityId?: string) => {
  const handleError = useApolloErrorHandler();
  const { isFeatureEnabled } = useConfig();
  const { data, loading, subscribeToMore } = useCommunityUpdatesQuery({
    variables: {
      ecoverseId: ecoverseNameId ?? '',
      communityId: communityId ?? '',
    },
    skip: !ecoverseNameId || !communityId,
    onError: handleError,
  });

  useEffect(() => {
    if (!ecoverseNameId || !communityId || !isFeatureEnabled(FEATURE_SUBSCRIPTIONS)) {
      return;
    }

    const unSubscribe = subscribeToMore<CommunicationUpdateMessageReceivedSubscription>({
      document: CommunicationUpdateMessageReceivedDocument,
      onError: err => handleError(new ApolloError({ errorMessage: err.message })),
      updateQuery: (prev, { subscriptionData }) => {
        const oldUpdates = prev?.ecoverse?.community?.communication?.updates;

        if (!oldUpdates) {
          return prev;
        }

        const newUpdate = subscriptionData.data.communicationUpdateMessageReceived;

        if (oldUpdates.id !== newUpdate.updatesID) {
          logger.error(
            `Current updateId (${oldUpdates.id}) is not matching the incoming updateId (${newUpdate.updatesID})`
          );
          return prev;
        }

        const oldMessages = oldUpdates.messages ?? [];
        const newMessage = newUpdate.message;

        return merge({}, prev, {
          ecoverse: {
            community: {
              communication: {
                updates: {
                  messages: [...oldMessages, newMessage],
                },
              },
            },
          },
        });
      },
    });
    return () => unSubscribe && unSubscribe();
  }, [isFeatureEnabled, subscribeToMore, ecoverseNameId, communityId]);

  return { data, loading };
};
