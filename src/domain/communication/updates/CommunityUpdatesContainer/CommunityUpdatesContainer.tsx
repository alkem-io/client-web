import React, { FC, useCallback } from 'react';
import { useConfig } from '../../../platform/config/useConfig';
import {
  CommunicationUpdateMessageReceivedDocument,
  refetchCommunityUpdatesQuery,
  useCommunityUpdatesQuery,
  useRemoveMessageOnRoomMutation,
  useSendMessageToRoomMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import {
  CommunicationUpdateMessageReceivedSubscription,
  Community,
  CommunityUpdatesQuery,
  Hub,
  Message,
} from '../../../../core/apollo/generated/graphql-schema';
import { FEATURE_SUBSCRIPTIONS } from '../../../platform/config/features.constants';
import { Author } from '../../../shared/components/AuthorAvatar/models/author';
import UseSubscriptionToSubEntity from '../../../shared/subscriptions/useSubscriptionToSubEntity';
import { buildAuthorFromUser } from '../../../../common/utils/buildAuthorFromUser';

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
  const { isFeatureEnabled } = useConfig();
  const { communityId, hubId } = entities;
  const { data, loading } = useCommunityUpdatesData(hubId, communityId);

  const updatesId = data?.hub.community?.communication?.updates?.id || '';

  const [sendUpdate, { loading: loadingSendUpdate }] = useSendMessageToRoomMutation({
    refetchQueries:
      isFeatureEnabled(FEATURE_SUBSCRIPTIONS) || !hubId || !communityId
        ? []
        : [refetchCommunityUpdatesQuery({ hubId, communityId })],
  });

  const onSubmit = useCallback<CommunityUpdatesActions['onSubmit']>(
    async message => {
      const update = await sendUpdate({
        variables: { messageData: { message, roomID: updatesId } },
      });
      return update.data?.sendMessageToRoom as Message;
    },
    [sendUpdate, updatesId]
  );

  const [removeUpdate, { loading: loadingRemoveUpdate }] = useRemoveMessageOnRoomMutation();

  const onRemove = useCallback<CommunityUpdatesActions['onRemove']>(
    async messageId => {
      const update = await removeUpdate({
        variables: { messageData: { messageID: messageId, roomID: updatesId } },
        refetchQueries: hubId && communityId ? [refetchCommunityUpdatesQuery({ hubId, communityId })] : [],
      });
      return update.data?.removeMessageOnRoom;
    },
    [communityId, updatesId, hubId, removeUpdate]
  );

  const onLoadMore = () => {
    throw new Error('Not implemented');
  };

  const messages = (data?.hub.community?.communication?.updates?.messages as Message[]) || EMPTY;

  const authors: Author[] = [];
  for (const message of messages) {
    if (message.sender) {
      authors.push(buildAuthorFromUser(message.sender));
    }
  }
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

const useCommunicationUpdateMessageReceivedSubscription = UseSubscriptionToSubEntity<
  NonNullable<NonNullable<CommunityUpdatesQuery['hub']['community']>['communication']>['updates'],
  CommunicationUpdateMessageReceivedSubscription
>({
  subscriptionDocument: CommunicationUpdateMessageReceivedDocument,
  updateSubEntity: (updates, subscriptionData) => {
    if (updates?.id === subscriptionData.communicationUpdateMessageReceived.updatesID) {
      const { message } = subscriptionData.communicationUpdateMessageReceived;
      updates?.messages?.push(message);
    }
  },
});

const useCommunityUpdatesData = (hubNameId?: string, communityId?: string) => {
  const { data, loading, subscribeToMore } = useCommunityUpdatesQuery({
    variables: {
      hubId: hubNameId!,
      communityId: communityId!,
    },
    skip: !hubNameId || !communityId,
  });

  useCommunicationUpdateMessageReceivedSubscription(
    data,
    parent => parent?.hub?.community?.communication?.updates,
    subscribeToMore
  );

  return { data, loading };
};
