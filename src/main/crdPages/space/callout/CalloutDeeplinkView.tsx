import { useState } from 'react';
import { isTaskBoardEnabled } from '@/crd/components/callout/task-board/taskBoard';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import { CalloutDetailDialogConnector } from './CalloutDetailDialogConnector';
import { TaskBoardConnector } from './TaskBoardConnector';

type CalloutDeeplinkViewProps = {
  callout: CalloutDetailsModelExtended;
  /** Deep-linked contribution (post) id, if the URL points at a specific one. */
  contributionId?: string;
  /** Deep-linked underlying post id, for post contributions. */
  postId?: string;
  /** Closes the whole deep-linked view (navigate back to the parent page). */
  onClose: () => void;
};

/**
 * Shared presentation for a deep-linked callout, so a Tasks board and a regular
 * (post-responses) callout render the SAME UI they show in the feed:
 *
 * - Tasks board → the fullscreen board. A deep-linked task additionally opens as
 *   a focused post dialog on top of the board (closing it reveals the board).
 * - Any other callout → the existing post-with-responses detail dialog.
 *
 * Board-ness is confirmed by `TaskBoardConnector`'s own query (the deep-link
 * callout model carries only the flow-state classification, not the task
 * marker), so we key off `onBoardResolved` rather than the passed model.
 */
export function CalloutDeeplinkView({ callout, contributionId, postId, onClose }: CalloutDeeplinkViewProps) {
  // null while board detection is still in flight — keep the board fullscreen in
  // that window so a board never flashes as an inline (feed-less) preview first.
  const [isBoard, setIsBoard] = useState<boolean | null>(null);
  // The task shown on top of the board (seeded from the URL, then driven by
  // clicks within the board). Undefined shows the board alone.
  const [openContributionId, setOpenContributionId] = useState<string | undefined>(contributionId);

  // Only a POSTS-only callout can be a Tasks board (the marker sits on a POSTS
  // contribution config). Anything else — and any callout when the board build
  // flag is off — takes the regular dialog directly, without firing the board
  // query or waiting on detection.
  const allowedTypes = callout.settings.contribution.allowedTypes;
  const maybeBoard =
    isTaskBoardEnabled() && allowedTypes.length === 1 && String(allowedTypes[0]).toLowerCase() === 'post';

  if (!maybeBoard) {
    return (
      <CalloutDetailDialogConnector
        open={true}
        onOpenChange={open => {
          if (!open) onClose();
        }}
        callout={callout}
        initialContributionId={contributionId}
        initialPostId={postId}
      />
    );
  }

  return (
    <>
      <TaskBoardConnector
        calloutId={callout.id}
        title={callout.framing.profile.displayName}
        fullscreen={isBoard !== false}
        onFullscreenChange={open => {
          if (!open) onClose();
        }}
        onBoardResolved={setIsBoard}
        onOpenTask={setOpenContributionId}
        fallback={null}
      />

      {/* Non-board callout: the usual post-with-responses dialog. */}
      {isBoard === false && (
        <CalloutDetailDialogConnector
          open={true}
          onOpenChange={open => {
            if (!open) onClose();
          }}
          callout={callout}
          initialContributionId={contributionId}
          initialPostId={postId}
        />
      )}

      {/* Board callout + a task: the focused post dialog on top of the board. */}
      {isBoard === true && openContributionId && (
        <CalloutDetailDialogConnector
          open={true}
          onOpenChange={open => {
            if (!open) setOpenContributionId(undefined);
          }}
          callout={callout}
          initialContributionId={openContributionId}
          initialPostId={openContributionId === contributionId ? postId : undefined}
          elevated={true}
        />
      )}
    </>
  );
}
