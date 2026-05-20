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
  /**
   * Bypass the `useInView` gate that lazy-loads the contribution-comments query
   * and the live subscription. Set to `true` when the caller knows the comment
   * section is visible the moment the connector mounts — e.g. inside an open
   * dialog (Phase 22 / T155, 2026-05-19). The default-`false` path keeps the
   * lazy behaviour the feed-level inline-comments flow relies on: the wrapper
   * `<div ref={ref}>` observes a slot in the feed, and the query only fires
   * once the user actually scrolls that slot into view.
   *
   * **Why this matters for the dialog path** — when the dialog connector
   * mounts a `<CalloutCommentsConnector>` for a selected post contribution,
   * the wrapper `<div ref={ref}>` ends up rendered in the parent component's
   * tree (alongside the dialog *trigger* on the feed card), NOT inside the
   * dialog's Radix portal. If the user has scrolled the feed but the dialog
   * is centred on screen, the wrapper div is off-screen and `inView` never
   * fires — the query stays skipped, the thread stays empty, and the dialog
   * shows "0 comments" even when the post has comments. `eager={true}`
   * decouples the dialog flow from feed scroll detection.
   */
  eager?: boolean;
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
  eager = false,
  children,
}: CalloutCommentsConnectorProps) {
  const { ref, inView } = useInView({ triggerOnce: true, delay: 200 });
  const effectiveInView = inView || eager;

  const { data } = useCalloutContributionCommentsQuery({
    variables: {
      contributionId: contributionId ?? '',
      includePost: true,
    },
    skip: !contributionId || Boolean(roomData) || !effectiveInView,
  });

  const room = roomData ?? data?.lookup.contribution?.post?.comments;

  // The lazy contribution-query loading state is intentionally not surfaced
  // here: useInView keeps this connector unmounted until the slot scrolls
  // into view, so the in-flight window is invisible to the user. The shared
  // hook surfaces in-flight mutation state via the inner CommentThread/Input.
  const { thread, commentInput, commentCount } = useCrdRoomComments({
    roomId,
    room,
    skipSubscription: skipSubscription ?? !effectiveInView,
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
