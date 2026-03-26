import {
  refetchCommunityUpdatesQuery,
  useCommunityUpdatesQuery,
  useRemoveMessageOnRoomMutation,
  useSendMessageToRoomMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { type Community, type Message, PlatformFeatureFlagName } from '@/core/apollo/generated/graphql-schema';
import useSubscribeOnRoomEvents from '@/domain/collaboration/callout/useSubscribeOnRoomEvents';
import type { AuthorModel } from '@/domain/community/user/models/AuthorModel';
import { buildAuthorFromUser } from '@/domain/community/user/utils/buildAuthorFromUser';
import { useConfig } from '@/domain/platform/config/useConfig';

export interface CommunityUpdatesActions {
  onLoadMore: () => void;
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
  authors: AuthorModel[];
}

type UseCommunityUpdatesParams = {
  communityId: string | undefined;
};

type UseCommunityUpdatesResult = {
  entities: CommunityUpdatesEntities;
  actions: CommunityUpdatesActions;
  state: CommunityUpdatesState;
};

const EMPTY: Message[] = [];

const useCommunityUpdates = ({ communityId }: UseCommunityUpdatesParams): UseCommunityUpdatesResult => {
  const { isFeatureEnabled } = useConfig();

  const { data, loading } = useCommunityUpdatesQuery({
    variables: {
      communityId: communityId ?? '',
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

  const onSubmit = async message => {
    if (!roomID) {
      throw new Error('RoomId is not defined');
    }
    const update = await sendUpdate({
      variables: { messageData: { message, roomID } },
    });
    return update.data?.sendMessageToRoom as Message;
  };

  const [removeUpdate, { loading: loadingRemoveUpdate }] = useRemoveMessageOnRoomMutation();

  const onRemove = async messageID => {
    if (!roomID) {
      throw new Error('RoomId is not defined');
    }
    const update = await removeUpdate({
      variables: { messageData: { messageID, roomID } },
      refetchQueries: [refetchCommunityUpdatesQuery({ communityId: communityId ?? '' })],
    });
    return update.data?.removeMessageOnRoom;
  };

  const onLoadMore = () => {
    throw new Error('Not implemented');
  };
  const messages = (data?.lookup.community?.communication?.updates?.messages as Message[]) || EMPTY;

  const authors: AuthorModel[] = [];
  for (const message of messages) {
    if (message.sender) {
      authors.push(buildAuthorFromUser(message.sender));
    }
  }

  return {
    entities: { messages, authors },
    actions: { onLoadMore, onSubmit, onRemove },
    state: {
      retrievingUpdateMessages: loading,
      sendingUpdateMessage: loadingSendUpdate,
      removingUpdateMessage: loadingRemoveUpdate,
    },
  };
};

export default useCommunityUpdates;
