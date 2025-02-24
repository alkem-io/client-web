import {
  refetchCommunityUpdatesQuery,
  useCommunityUpdatesQuery,
  useRemoveMessageOnRoomMutation,
  useSendMessageToRoomMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { Community, Message, PlatformFeatureFlagName } from '@/core/apollo/generated/graphql-schema';
import useSubscribeOnRoomEvents from '@/domain/collaboration/callout/useSubscribeOnRoomEvents';
import { buildAuthorFromUser } from '@/domain/community/user/utils/buildAuthorFromUser';
import { useConfig } from '@/domain/platform/config/useConfig';
import { Author } from '@/domain/shared/components/AuthorAvatar/models/author';
import React, { useCallback } from 'react';

export interface CommunityUpdatesContainerProps {
  communityId: string | undefined;
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

export const CommunityUpdatesContainer = ({ communityId, children }: CommunityUpdatesContainerProps) => {
  const { isFeatureEnabled } = useConfig();

  const { data, loading } = useCommunityUpdatesQuery({
    variables: {
      communityId: communityId!,
    },
    skip: !communityId,
  });

  useSubscribeOnRoomEvents(data?.lookup.community?.communication?.updates.id);

  const roomID = data?.lookup.community?.communication?.updates?.id;

  const [sendUpdate, { loading: loadingSendUpdate }] = useSendMessageToRoomMutation({
    refetchQueries:
      isFeatureEnabled(PlatformFeatureFlagName.Subscriptions) || !communityId
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
        refetchQueries: [refetchCommunityUpdatesQuery({ communityId: communityId! })],
      });
      return update.data?.removeMessageOnRoom;
    },
    [communityId, roomID, removeUpdate]
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
