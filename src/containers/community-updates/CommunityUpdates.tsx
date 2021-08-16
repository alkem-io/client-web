import React, { FC, useCallback } from 'react';
import { useCommunityUpdatesQuery, useSendCommunityUpdateMutation } from '../../hooks/generated/graphql';
import { CommunicationMessageResult, Community } from '../../models/graphql-schema';

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
  onLoadMore: () => void;
  onSubmit: (message: string, communityId: Community['id']) => Promise<void>;
}

export interface CommunityUpdatesState {
  retrievingUpdateMessages: boolean;
  sendingUpdateMessage: boolean;
}

export interface CommunityUpdatesEntities {
  messages: CommunicationMessageResult[];
}

export const CommunityUpdatesContainer: FC<CommunityUpdatesContainerProps> = ({ entities, children }) => {
  const { communityId } = entities;

  const { data, loading } = useCommunityUpdatesQuery({ variables: { communityId } });
  const [sendUpdate, { loading: loadingSendUpdate }] = useSendCommunityUpdateMutation();

  const onSubmit = useCallback<CommunityUpdatesActions['onSubmit']>(
    async (message, communityId) => {
      await sendUpdate({ variables: { msgData: { message, communityID: communityId } } });
    },
    [sendUpdate]
  );

  return (
    <>
      {children(
        { messages: data?.community.updatesRoom.messages || [] },
        { onLoadMore: () => {}, onSubmit },
        {
          retrievingUpdateMessages: loading,
          sendingUpdateMessage: loadingSendUpdate,
        }
      )}
    </>
  );
};
