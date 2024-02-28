import { FC } from 'react';
import { useWhiteboardWithContentQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import { WhiteboardDetailsFragment, WhiteboardContentFragment } from '../../../../core/apollo/generated/graphql-schema';

export interface WhiteboardWithContent
  extends Omit<WhiteboardContentFragment, 'id'>,
    Partial<WhiteboardDetailsFragment> {}

export type WhiteboardWithoutContent<Whiteboard extends WhiteboardWithContent> = Omit<Whiteboard, 'content'>;

export interface IWhiteboardContentEntities {
  whiteboard?: WhiteboardWithContent;
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
  const { data: whiteboardWithContentData, loading: loadingWhiteboardWithContent } = useWhiteboardWithContentQuery({
    errorPolicy: 'all',
    // Disable cache, we really want to make sure that the latest content is fetched, in case there is no one else editing at the moment
    fetchPolicy: 'network-only',
    skip: !whiteboardId,
    variables: {
      whiteboardId: whiteboardId!,
    },
  });

  const whiteboard = whiteboardWithContentData?.lookup.whiteboard;

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
