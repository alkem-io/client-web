/**
 * Same as WhiteboardContentContainer but for Realtime Whiteboards
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
  const { data: whiteboardWithContentData, loading: loadingWhiteboardWithContent } = useWhiteboardRtWithContentQuery({
    errorPolicy: 'all',
    // Disable cache, we really want to make sure that the latest content is fetched, in case there is no one else editing at the moment
    fetchPolicy: 'network-only',
    skip: !whiteboardId,
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
