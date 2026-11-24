import { useEffect, useState } from 'react';
import { isTaskBoardEnabled } from '@/crd/components/callout/task-board/taskBoard';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import type { MemoSigningRestoreIntent } from '@/main/ui/layout/MemoSigningReturnContext';
import { CalloutDetailDialogConnector } from './CalloutDetailDialogConnector';
import { TaskBoardConnector } from './TaskBoardConnector';

type CalloutDeeplinkViewProps = {
  callout: CalloutDetailsModelExtended;
  /** Deep-linked contribution (post) id, if the URL points at a specific one. */
  contributionId?: string;
  /** Deep-linked underlying post id, for post contributions. */
  postId?: string;
  memoSigningRestore?: MemoSigningRestoreIntent;
  memoSigningRouteAttemptId?: string;
  onMemoSigningRouteSettled?: (attemptId: string) => void;
  onMemoSigningRestoreConsumed?: (attemptId: string, focusTarget?: HTMLElement) => void;
  /** Closes the whole deep-linked view (navigate back to the parent page). */
  onClose: () => void;
};

/**
 * Shared presentation for a deep-linked callout: every callout opens the same
 * detail dialog (title, description, framing content, then its responses).
 *
 * - Tasks board → the board takes the place of the responses, as it does in the
 *   feed. A deep-linked task additionally opens as a focused post dialog on top
 *   (closing it reveals the callout). The board-only view opens from the dialog.
 * - Any other callout → the post-with-responses detail dialog.
 *
 * Board-ness is confirmed by `TaskBoardConnector`'s own query (the deep-link
 * callout model carries only the flow-state classification, not the task
 * marker), so we key off `onBoardResolved` rather than the passed model.
 */
export function CalloutDeeplinkView({
  callout,
  contributionId,
  postId,
  memoSigningRestore,
  memoSigningRouteAttemptId,
  onMemoSigningRouteSettled,
  onMemoSigningRestoreConsumed,
  onClose,
}: CalloutDeeplinkViewProps) {
  // null while board detection is still in flight — nothing is shown in that
  // window so a board never flashes as a plain responses grid first.
  const [isBoard, setIsBoard] = useState<boolean | null>(null);

  // Only a POSTS-only callout can be a Tasks board (the marker sits on a POSTS
  // contribution config). Anything else — and any callout when the board build
  // flag is off — takes the regular dialog directly, without firing the board
  // query or waiting on detection.
  const allowedTypes = callout.settings.contribution.allowedTypes;
  const maybeBoard =
    isTaskBoardEnabled() && allowedTypes.length === 1 && String(allowedTypes[0]).toLowerCase() === 'post';

  useEffect(() => {
    if (maybeBoard && isBoard === true && memoSigningRestore) {
      onMemoSigningRestoreConsumed?.(memoSigningRestore.attemptId);
    }
  }, [isBoard, maybeBoard, memoSigningRestore, onMemoSigningRestoreConsumed]);

  useEffect(() => {
    if (!memoSigningRouteAttemptId || (maybeBoard && isBoard === null)) return;
    onMemoSigningRouteSettled?.(memoSigningRouteAttemptId);
  }, [isBoard, maybeBoard, memoSigningRouteAttemptId, onMemoSigningRouteSettled]);

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
        memoSigningRestore={memoSigningRestore}
        onMemoSigningRestoreConsumed={onMemoSigningRestoreConsumed}
      />
    );
  }

  return (
    <>
      {/* Confirm board-ness without rendering an inline board on the page. */}
      <TaskBoardConnector calloutId={callout.id} detectOnly={true} onBoardResolved={setIsBoard} fallback={null} />

      {/* Rendered only once detection has resolved, so a board never flashes
          the plain responses grid first. */}
      {isBoard !== null && (
        <CalloutDetailDialogConnector
          open={true}
          onOpenChange={open => {
            if (!open) onClose();
          }}
          callout={callout}
          initialContributionId={contributionId}
          initialPostId={postId}
          taskBoard={isBoard}
          memoSigningRestore={isBoard ? undefined : memoSigningRestore}
          onMemoSigningRestoreConsumed={isBoard ? undefined : onMemoSigningRestoreConsumed}
        />
      )}
    </>
  );
}
