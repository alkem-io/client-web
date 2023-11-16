import { FC, useEffect } from 'react';
import { useUserContext } from '../../../community/user';
import {
  WhiteboardContentUpdatedDocument,
  useWhiteboardLockedByDetailsQuery,
  useWhiteboardWithContentQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import {
  WhiteboardContentUpdatedSubscription,
  WhiteboardDetailsFragment,
  WhiteboardContentFragment,
  SubscriptionWhiteboardContentUpdatedArgs,
  WhiteboardCheckoutStateEnum,
  WhiteboardLockedByDetailsQuery,
} from '../../../../core/apollo/generated/graphql-schema';
import UseSubscriptionToSubEntity from '../../../../core/apollo/subscriptions/useSubscriptionToSubEntity';

export interface WhiteboardWithContent
  extends Omit<WhiteboardContentFragment, 'id'>,
    Partial<WhiteboardDetailsFragment> {}

export type WhiteboardWithoutContent<Whiteboard extends WhiteboardWithContent> = Omit<Whiteboard, 'content'>;

export interface IWhiteboardContentEntities {
  whiteboard?: WhiteboardWithContent;
  isWhiteboardCheckedOutByMe: boolean;
  isWhiteboardAvailable: boolean;
  lockedBy: WhiteboardLockedByDetailsQuery['users'][0] | undefined;
}

export interface WhiteboardContentContainerState {
  loadingWhiteboardContent?: boolean;
}

export interface WhiteboardContentParams {
  whiteboardId: string | undefined;
}

export interface WhiteboardContentContainerProps
  extends ContainerChildProps<IWhiteboardContentEntities, {}, WhiteboardContentContainerState>,
    WhiteboardContentParams {
  onWhiteboardContentLoaded?: (whiteboard: WhiteboardWithContent) => void;
}

const useSubscribeToWhiteboard = UseSubscriptionToSubEntity<
  WhiteboardContentFragment & WhiteboardDetailsFragment,
  WhiteboardContentUpdatedSubscription,
  SubscriptionWhiteboardContentUpdatedArgs
>({
  subscriptionDocument: WhiteboardContentUpdatedDocument,
  getSubscriptionVariables: whiteboard => ({ whiteboardIDs: [whiteboard.id] }),
  updateSubEntity: (whiteboard, subscriptionData) => {
    if (whiteboard && subscriptionData.whiteboardContentUpdated.whiteboardID === whiteboard.id) {
      whiteboard.content = subscriptionData.whiteboardContentUpdated.content;
    }
  },
});

const WhiteboardContentContainer: FC<WhiteboardContentContainerProps> = ({
  children,
  whiteboardId,
  onWhiteboardContentLoaded,
}) => {
  const { user: userMetadata } = useUserContext();
  const userId = userMetadata?.user.id;

  const skipWhiteboardQuery = !Boolean(whiteboardId);
  const {
    data: whiteboardWithContentData,
    loading: loadingWhiteboardContent,
    subscribeToMore: subscribeToWhiteboard,
  } = useWhiteboardWithContentQuery({
    errorPolicy: 'all',
    // Disable cache, we really want to make sure that the latest content is fetched
    fetchPolicy: 'network-only',
    skip: skipWhiteboardQuery,
    variables: {
      whiteboardId: whiteboardId!,
    },
  });

  const whiteboard = whiteboardWithContentData?.lookup.whiteboard;

  useEffect(() => {
    if (whiteboard) {
      onWhiteboardContentLoaded?.(whiteboard);
    }
  }, [whiteboard, onWhiteboardContentLoaded]);

  const skipWhiteboardSubscription = !whiteboardId || whiteboard?.checkout?.lockedBy === userId;

  useSubscribeToWhiteboard(whiteboardWithContentData, data => data?.lookup.whiteboard, subscribeToWhiteboard, {
    skip: skipWhiteboardSubscription,
  });

  const { data: lockedByDetailsData } = useWhiteboardLockedByDetailsQuery({
    variables: { ids: [whiteboard?.checkout?.lockedBy!] },
    skip: !whiteboard?.checkout?.lockedBy,
  });

  const isWhiteboardCheckedOutByMe =
    whiteboard?.checkout?.status === WhiteboardCheckoutStateEnum.CheckedOut && whiteboard.checkout.lockedBy === userId;
  const isWhiteboardAvailable = whiteboard?.checkout?.status === WhiteboardCheckoutStateEnum.Available;

  return (
    <>
      {children(
        {
          whiteboard,
          isWhiteboardCheckedOutByMe,
          isWhiteboardAvailable,
          lockedBy: lockedByDetailsData?.users.find(user => user.id === whiteboard?.checkout?.lockedBy),
        },
        {
          loadingWhiteboardContent,
        },
        {}
      )}
    </>
  );
};

export default WhiteboardContentContainer;
