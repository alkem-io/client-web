import { FC } from 'react';
import {
  useWhiteboardSavedSubscription,
  useWhiteboardWithoutContentQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import {
  WhiteboardDetailsFragment,
  WhiteboardContentFragment,
  PlatformFeatureFlagName,
} from '../../../../core/apollo/generated/graphql-schema';
import { useApolloErrorHandler } from '../../../../core/apollo/hooks/useApolloErrorHandler';
import { useConfig } from '../../../platform/config/useConfig';
import EmptyWhiteboard from '../../../common/whiteboard/EmptyWhiteboard';

export interface WhiteboardWithContent
  extends Omit<WhiteboardContentFragment, 'id'>,
    Partial<WhiteboardDetailsFragment> {}

export type WhiteboardWithoutContent<Whiteboard extends WhiteboardWithContent> = Omit<Whiteboard, 'content'>;

export interface IWhiteboardContentEntities {
  whiteboard?: Partial<WhiteboardWithContent>;
}

export interface WhiteboardContentContainerState {
  loadingWhiteboardContent?: boolean;
}

export interface WhiteboardContentParams {
  whiteboardId: string | undefined;
}

export interface WhiteboardContentContainerProps
  extends ContainerChildProps<IWhiteboardContentEntities, {}, WhiteboardContentContainerState>,
    WhiteboardContentParams {}

const WhiteboardContentContainer: FC<WhiteboardContentContainerProps> = ({ children, whiteboardId }) => {
  const handleError = useApolloErrorHandler();
  const { isFeatureEnabled } = useConfig();
  const areSubscriptionsEnabled = isFeatureEnabled(PlatformFeatureFlagName.Subscriptions);

  const { data: whiteboardWithContentData, loading: loadingWhiteboardWithContent } = useWhiteboardWithoutContentQuery({
    errorPolicy: 'all',
    // Disable cache, we really want to make sure that the latest content is fetched, in case there is no one else editing at the moment
    fetchPolicy: 'network-only',
    skip: !whiteboardId,
    variables: {
      whiteboardId: whiteboardId!,
    },
  });

  useWhiteboardSavedSubscription({
    shouldResubscribe: true,
    variables: { whiteboardId: whiteboardId! }, // Ensured by skip
    skip: !whiteboardId,
    onSubscriptionData: ({ subscriptionData, client }) => {
      if (subscriptionData.error) {
        return handleError(subscriptionData.error);
      }
      if (!areSubscriptionsEnabled) {
        return;
      }

      const data = subscriptionData?.data;

      if (!data) {
        return;
      }

      const whiteboardRefId = client.cache.identify({
        id: whiteboardId,
        __typename: 'Whiteboard',
      });

      if (!whiteboardRefId) {
        return;
      }
      client.cache.modify({
        id: whiteboardRefId,
        fields: {
          updatedDate(currentUpdatedDate = undefined) {
            return data.whiteboardSaved.updatedDate ?? currentUpdatedDate;
          },
        },
      });
    },
  });

  const whiteboard = {
    ...whiteboardWithContentData?.lookup.whiteboard,
    content: JSON.stringify(EmptyWhiteboard),
  };

  return (
    <>
      {children(
        {
          whiteboard,
        },
        {
          loadingWhiteboardContent: loadingWhiteboardWithContent,
        },
        {}
      )}
    </>
  );
};

export default WhiteboardContentContainer;
