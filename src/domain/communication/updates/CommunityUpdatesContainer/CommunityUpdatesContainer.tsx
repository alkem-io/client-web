import React, { FC, useCallback } from 'react';
import { useConfig } from '../../../platform/config/useConfig';
import {
  refetchCommunityUpdatesQuery,
  useCommunityUpdatesQuery,
  useRemoveMessageOnRoomMutation,
  useSendMessageToRoomMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { Community, Space, Message, PlatformFeatureFlagName } from '../../../../core/apollo/generated/graphql-schema';
import { Author } from '../../../shared/components/AuthorAvatar/models/author';
import { buildAuthorFromUser } from '../../../community/user/utils/buildAuthorFromUser';
import useSubscribeOnRoomEvents from '../../../collaboration/callout/useSubscribeOnRoomEvents';

export interface CommunityUpdatesContainerProps {
  entities: {
    communityId?: Community['id'];
    spaceId?: Space['id'];
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
  const { communityId, spaceId } = entities;
  const { data, loading } = useCommunityUpdatesQuery({
    variables: {
      communityId: communityId!,
    },
    skip: !spaceId || !communityId,
  });
  useSubscribeOnRoomEvents(data?.lookup.community?.communication?.updates.id);

  const roomID = data?.lookup.community?.communication?.updates?.id;

  const [sendUpdate, { loading: loadingSendUpdate }] = useSendMessageToRoomMutation({
    refetchQueries:
      isFeatureEnabled(PlatformFeatureFlagName.Subscriptions) || !spaceId || !communityId
        ? []
        : [refetchCommunityUpdatesQuery({ communityId })],
  });

  const onSubmit = useCallback<CommunityUpdatesActions['onSubmit']>(
    async message => {
      if (!roomID) {
        throw new Error('RoomId is not defined');
      }
      const update = await sendUpdate({
        variables: { messageData: { message, roomID } },
      });
      return update.data?.sendMessageToRoom as Message;
    },
    [sendUpdate, roomID]
  );

  const [removeUpdate, { loading: loadingRemoveUpdate }] = useRemoveMessageOnRoomMutation();

  const onRemove = useCallback<CommunityUpdatesActions['onRemove']>(
    async messageID => {
      if (!roomID) {
        throw new Error('RoomId is not defined');
      }
      const update = await removeUpdate({
        variables: { messageData: { messageID, roomID } },
        refetchQueries: spaceId && communityId ? [refetchCommunityUpdatesQuery({ communityId })] : [],
      });
      return update.data?.removeMessageOnRoom;
    },
    [communityId, roomID, spaceId, removeUpdate]
  );

  const onLoadMore = () => {
    throw new Error('Not implemented');
  };
  const messages = (data?.lookup.community?.communication?.updates?.messages as Message[]) || EMPTY;

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
