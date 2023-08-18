import { FC, useEffect } from 'react';
import { useUserContext } from '../../../community/contributor/user';
import {
  WhiteboardContentUpdatedDocument,
  useWhiteboardLockedByDetailsQuery,
  useWhiteboardWithValueQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import {
  WhiteboardContentUpdatedSubscription,
  WhiteboardDetailsFragment,
  WhiteboardValueFragment,
  SubscriptionWhiteboardContentUpdatedArgs,
  WhiteboardCheckoutStateEnum,
  WhiteboardLockedByDetailsQuery,
} from '../../../../core/apollo/generated/graphql-schema';
import UseSubscriptionToSubEntity from '../../../shared/subscriptions/useSubscriptionToSubEntity';

export interface WhiteboardWithValue extends Omit<WhiteboardValueFragment, 'id'>, Partial<WhiteboardDetailsFragment> {}

export type WhiteboardWithoutValue<Whiteboard extends WhiteboardWithValue> = Omit<Whiteboard, 'value'>;

export interface IWhiteboardValueEntities {
  whiteboard?: WhiteboardWithValue;
  isWhiteboardCheckedOutByMe: boolean;
  isWhiteboardAvailable: boolean;
  lockedBy: WhiteboardLockedByDetailsQuery['users'][0] | undefined;
}

export interface WhiteboardValueContainerState {
  loadingWhiteboardValue?: boolean;
}

export interface WhiteboardValueParams {
  whiteboardId: string | undefined;
}

export interface WhiteboardValueContainerProps
  extends ContainerChildProps<IWhiteboardValueEntities, {}, WhiteboardValueContainerState>,
    WhiteboardValueParams {
  onWhiteboardValueLoaded?: (whiteboard: WhiteboardWithValue) => void;
}

const useSubscribeToWhiteboard = UseSubscriptionToSubEntity<
  WhiteboardValueFragment & WhiteboardDetailsFragment,
  WhiteboardContentUpdatedSubscription,
  SubscriptionWhiteboardContentUpdatedArgs
>({
  subscriptionDocument: WhiteboardContentUpdatedDocument,
  getSubscriptionVariables: whiteboard => ({ whiteboardIDs: [whiteboard.id] }),
  updateSubEntity: (whiteboard, subscriptionData) => {
    if (whiteboard && subscriptionData.whiteboardContentUpdated.whiteboardID === whiteboard.id) {
      whiteboard.value = subscriptionData.whiteboardContentUpdated.value;
    }
  },
});

const WhiteboardValueContainer: FC<WhiteboardValueContainerProps> = ({
  children,
  whiteboardId,
  onWhiteboardValueLoaded,
}) => {
  const { user: userMetadata } = useUserContext();
  const userId = userMetadata?.user.id;

  const skipWhiteboardQuery = !Boolean(whiteboardId);
  const {
    data: whiteboardWithValueData,
    loading: loadingWhiteboardWithValue,
    subscribeToMore: subscribeToWhiteboard,
  } = useWhiteboardWithValueQuery({
    errorPolicy: 'all',
    // TODO: Check if these policies are really needed
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-and-network',
    skip: skipWhiteboardQuery,
    variables: {
      whiteboardId: whiteboardId!,
    },
  });

  const whiteboard = whiteboardWithValueData?.lookup.whiteboard;

  useEffect(() => {
    if (whiteboard) {
      onWhiteboardValueLoaded?.(whiteboard);
    }
  }, [whiteboard, onWhiteboardValueLoaded]);

  const skipWhiteboardSubscription = !whiteboardId || whiteboard?.checkout?.lockedBy === userId;

  useSubscribeToWhiteboard(whiteboardWithValueData, data => data?.lookup.whiteboard, subscribeToWhiteboard, {
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
          loadingWhiteboardValue: loadingWhiteboardWithValue,
        },
        {}
      )}
    </>
  );
};

export default WhiteboardValueContainer;
