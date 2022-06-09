import { merge } from 'lodash';
import React, { FC, useCallback, useEffect } from 'react';
import { ApolloError } from '@apollo/client';
import { useApolloErrorHandler, useConfig } from '../../hooks';
import {
  CommunicationUpdateMessageReceivedDocument,
  refetchCommunityUpdatesQuery,
  useCommunityUpdatesQuery,
  useRemoveUpdateCommunityMutation,
  useSendUpdateMutation,
} from '../../hooks/generated/graphql';
import { Message, Community, Hub, CommunicationUpdateMessageReceivedSubscription } from '../../models/graphql-schema';
import { FEATURE_SUBSCRIPTIONS } from '../../models/constants';
import { logger } from '../../services/logging/winston/logger';
import { useAuthorsDetails } from '../../domain/communication/useAuthorsDetails';
import { Author } from '../../models/discussion/author';

export interface CommunityUpdatesContainerProps {
  entities: {
    communityId?: Community['id'];
    hubId?: Hub['id'];
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
  authors: Author[];
}

const EMPTY = [];

export const CommunityUpdatesContainer: FC<CommunityUpdatesContainerProps> = ({ entities, children }) => {
  const handleError = useApolloErrorHandler();
  const { isFeatureEnabled } = useConfig();
  const { communityId, hubId } = entities;
  const { data, loading } = useCommunityUpdatesData(hubId, communityId);

  const updatesId = data?.hub.community?.communication?.updates?.id || '';

  const [sendUpdate, { loading: loadingSendUpdate }] = useSendUpdateMutation({
    onError: handleError,
    refetchQueries:
      isFeatureEnabled(FEATURE_SUBSCRIPTIONS) || !hubId || !communityId
        ? []
        : [refetchCommunityUpdatesQuery({ hubId, communityId })],
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
        refetchQueries: hubId && communityId ? [refetchCommunityUpdatesQuery({ hubId, communityId })] : [],
      });
      return update.data?.removeUpdate;
    },
    [sendUpdate, communityId, updatesId]
  );

  const onLoadMore = () => {
    throw new Error('Not implemented');
  };

  const messages = data?.hub.community?.communication?.updates?.messages || EMPTY;

  const { authors = EMPTY } = useAuthorsDetails(messages.map(m => m.sender));

  return (
    <>
      {children(
        { messages, authors },
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

const useCommunityUpdatesData = (hubNameId?: string, communityId?: string) => {
  const handleError = useApolloErrorHandler();
  const { isFeatureEnabled } = useConfig();
  const { data, loading, subscribeToMore } = useCommunityUpdatesQuery({
    variables: {
      hubId: hubNameId ?? '',
      communityId: communityId ?? '',
    },
    skip: !hubNameId || !communityId,
    onError: handleError,
  });

  const areSubscriptionsEnabled = isFeatureEnabled(FEATURE_SUBSCRIPTIONS);

  useEffect(() => {
    if (!hubNameId || !communityId || !areSubscriptionsEnabled) {
      return;
    }

    return subscribeToMore<CommunicationUpdateMessageReceivedSubscription>({
      document: CommunicationUpdateMessageReceivedDocument,
      onError: err => handleError(new ApolloError({ errorMessage: err.message })),
      updateQuery: (prev, { subscriptionData }) => {
        const oldUpdates = prev?.hub?.community?.communication?.updates;

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
          hub: {
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
  }, [areSubscriptionsEnabled, subscribeToMore, hubNameId, communityId]);

  return { data, loading };
};
