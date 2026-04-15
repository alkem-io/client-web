import type { ReactNode } from 'react';
import { useInView } from 'react-intersection-observer';
import { useCalloutContributionCommentsQuery } from '@/core/apollo/generated/apollo-hooks';
import type { CommentsWithMessagesModel } from '@/domain/communication/room/models/CommentsWithMessagesModel';
import { useCrdRoomComments } from '../hooks/useCrdRoomComments';

type CalloutCommentsConnectorProps = {
  roomId: string;
  calloutId?: string;
  contributionId?: string;
  roomData?: CommentsWithMessagesModel;
  children?: (slots: { thread: ReactNode; commentInput: ReactNode | null; commentCount: number }) => ReactNode;
};

/**
 * Lazy-loading wrapper around `useCrdRoomComments` for callout/contribution
 * comments. Owns the intersection-observer gate + the contribution Apollo
 * query; everything else (mutations, subscription, rendering) lives in the
 * shared hook (see research.md R4).
 */
export function CalloutCommentsConnector({
  roomId,
  calloutId: _calloutId,
  contributionId,
  roomData,
  children,
}: CalloutCommentsConnectorProps) {
  const { ref, inView } = useInView({ triggerOnce: true, delay: 200 });

  const { data, loading } = useCalloutContributionCommentsQuery({
    variables: {
      contributionId: contributionId ?? '',
      includePost: true,
    },
    skip: !contributionId || Boolean(roomData) || !inView,
  });

  const room = roomData ?? data?.lookup.contribution?.post?.comments;

  const { thread, commentInput, commentCount } = useCrdRoomComments({
    roomId,
    room,
    skipSubscription: !inView,
    externalLoading: loading,
  });

  if (children) {
    return <div ref={ref}>{children({ thread, commentInput, commentCount })}</div>;
  }

  return (
    <div ref={ref} className="space-y-4">
      {thread}
      {commentInput}
    </div>
  );
}
