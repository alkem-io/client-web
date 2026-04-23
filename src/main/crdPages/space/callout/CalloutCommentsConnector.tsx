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
  /**
   * Override the default subscription gate. When omitted, the subscription
   * starts once the connector scrolls into view (`!inView`) — the dialog path
   * relies on this. The list-view path passes `!commentsExpanded` so the live
   * subscription only starts after the user has expanded the inline footer
   * at least once, and stays active afterwards (sticky).
   */
  skipSubscription?: boolean;
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
  skipSubscription,
  children,
}: CalloutCommentsConnectorProps) {
  const { ref, inView } = useInView({ triggerOnce: true, delay: 200 });

  const { data } = useCalloutContributionCommentsQuery({
    variables: {
      contributionId: contributionId ?? '',
      includePost: true,
    },
    skip: !contributionId || Boolean(roomData) || !inView,
  });

  const room = roomData ?? data?.lookup.contribution?.post?.comments;

  // The lazy contribution-query loading state is intentionally not surfaced
  // here: useInView keeps this connector unmounted until the slot scrolls
  // into view, so the in-flight window is invisible to the user. The shared
  // hook surfaces in-flight mutation state via the inner CommentThread/Input.
  const { thread, commentInput, commentCount } = useCrdRoomComments({
    roomId,
    room,
    skipSubscription: skipSubscription ?? !inView,
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
