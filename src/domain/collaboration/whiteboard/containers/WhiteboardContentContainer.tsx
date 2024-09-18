import { FC, useMemo } from 'react';
import { useWhiteboardWithoutContentQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import { WhiteboardDetailsFragment, WhiteboardContentFragment } from '../../../../core/apollo/generated/graphql-schema';
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
  const { data: whiteboardWithContentData, loading: loadingWhiteboardWithContent } = useWhiteboardWithoutContentQuery({
    errorPolicy: 'all',
    // Disable cache, we really want to make sure that the latest content is fetched, in case there is no one else editing at the moment
    fetchPolicy: 'network-only',
    skip: !whiteboardId,
    variables: {
      whiteboardId: whiteboardId!,
    },
  });

  const whiteboard = useMemo(() => {
    if (whiteboardWithContentData?.lookup.whiteboard) {
      return {
        ...whiteboardWithContentData.lookup.whiteboard,
        content: JSON.stringify(EmptyWhiteboard),
      };
    }
    return undefined;
  }, [whiteboardWithContentData]);

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
