/**
 * Same as WhiteboardContentContainer but:
 * - (Renamed value to content)
 * - Removed subscription, there's no whiteboardRtContentUpdated subscription yet
 * - Removed all the checkout
 */
import { FC } from 'react';
import { useWhiteboardRtWithContentQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import {
  WhiteboardRtDetailsFragment,
  WhiteboardRtContentFragment,
} from '../../../../core/apollo/generated/graphql-schema';

export interface WhiteboardRtWithContent
  extends Omit<WhiteboardRtContentFragment, 'id'>,
    Partial<WhiteboardRtDetailsFragment> {}

export type WhiteboardRtWithoutContent<Whiteboard extends WhiteboardRtWithContent> = Omit<Whiteboard, 'content'>;

export interface IWhiteboardRtContentEntities {
  whiteboard?: WhiteboardRtWithContent;
}

export interface WhiteboardContentContainerState {
  loadingWhiteboardContent?: boolean;
}

export interface WhiteboardContentParams {
  whiteboardId: string | undefined;
}

export interface WhiteboardRtContentContainerProps
  extends ContainerChildProps<IWhiteboardRtContentEntities, {}, WhiteboardContentContainerState>,
    WhiteboardContentParams {}

const WhiteboardRtContentContainer: FC<WhiteboardRtContentContainerProps> = ({ children, whiteboardId }) => {
  const skipWhiteboardQuery = !Boolean(whiteboardId);
  const { data: whiteboardWithContentData, loading: loadingWhiteboardWithContent } = useWhiteboardRtWithContentQuery({
    errorPolicy: 'all',
    // TODO: Check if these policies are really needed
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-and-network',
    skip: skipWhiteboardQuery,
    variables: {
      whiteboardId: whiteboardId!,
    },
  });

  const whiteboard = whiteboardWithContentData?.lookup.whiteboardRt;

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

export default WhiteboardRtContentContainer;
