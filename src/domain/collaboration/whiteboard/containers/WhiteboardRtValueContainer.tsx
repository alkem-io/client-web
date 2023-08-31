/**
 * Same as WhiteboardValueContainer but:
 * - Renamed value to content
 * - Removed subscription, there's no whiteboardRtContentUpdated subscription yet
 * - Removed all the checkout
 */
import { FC, useEffect } from 'react';
import { useWhiteboardRtWithContentQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import {
  WhiteboardRtDetailsFragment,
  WhiteboardRtContentFragment,
} from '../../../../core/apollo/generated/graphql-schema';

export interface WhiteboardRtWithContent
  extends Omit<WhiteboardRtContentFragment, 'id'>,
    Partial<WhiteboardRtDetailsFragment> {}

export type WhiteboardRtWithoutContent<Whiteboard extends WhiteboardRtWithContent> = Omit<Whiteboard, 'value'>;

export interface IWhiteboardRtValueEntities {
  whiteboard?: WhiteboardRtWithContent;
}

export interface WhiteboardValueContainerState {
  loadingWhiteboardValue?: boolean;
}

export interface WhiteboardValueParams {
  calloutId: string | undefined; //!! TEMPORARY
  whiteboardId: string | undefined;
}

export interface WhiteboardRtValueContainerProps
  extends ContainerChildProps<IWhiteboardRtValueEntities, {}, WhiteboardValueContainerState>,
    WhiteboardValueParams {
  onWhiteboardValueLoaded?: (whiteboard: WhiteboardRtWithContent) => void;
}

const WhiteboardRtValueContainer: FC<WhiteboardRtValueContainerProps> = ({
  children,
  calloutId,
  whiteboardId,
  onWhiteboardValueLoaded,
}) => {
  const skipWhiteboardQuery = !Boolean(calloutId);
  const { data: whiteboardWithValueData, loading: loadingWhiteboardWithValue } = useWhiteboardRtWithContentQuery({
    errorPolicy: 'all',
    // TODO: Check if these policies are really needed
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-and-network',
    skip: skipWhiteboardQuery,
    variables: {
      calloutId: calloutId!,
      //whiteboardId: whiteboardId!,
    },
  });

  const whiteboard = whiteboardWithValueData?.lookup.callout?.whiteboardRt;

  useEffect(() => {
    if (whiteboard) {
      onWhiteboardValueLoaded?.(whiteboard);
    }
  }, [whiteboard, onWhiteboardValueLoaded]);

  return (
    <>
      {children(
        {
          whiteboard,
        },
        {
          loadingWhiteboardValue: loadingWhiteboardWithValue,
        },
        {}
      )}
    </>
  );
};

export default WhiteboardRtValueContainer;
