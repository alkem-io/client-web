import { useEffect, useState } from 'react';
import { isTaskBoardEnabled } from '@/crd/components/callout/task-board/taskBoard';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import { useCachedPost } from '@/domain/collaboration/callout/useCalloutDetails/useCalloutDetails';
import type { MemoSigningRestoreIntent } from '@/main/ui/layout/MemoSigningReturnContext';
import { CalloutDetailDialogConnector } from './CalloutDetailDialogConnector';
import { TaskBoardDialog } from './TaskBoardDialog';

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
  // The task shown on top of the board (seeded from the URL, then driven by
  // clicks within the board). Undefined shows the board alone.
  const [openContributionId, setOpenContributionId] = useState<string | undefined>(contributionId);

  // A Tasks board is the post of content kind task_board (021 H19); the post is already in the cache.
  const contentKind = useCachedPost(callout.id)?.contentKind;
  const isBoard = isTaskBoardEnabled() && contentKind === 'task_board';

  useEffect(() => {
    if (isBoard && memoSigningRestore) {
      onMemoSigningRestoreConsumed?.(memoSigningRestore.attemptId);
    }
  }, [isBoard, memoSigningRestore, onMemoSigningRestoreConsumed]);

  useEffect(() => {
    if (!memoSigningRouteAttemptId) return;
    onMemoSigningRouteSettled?.(memoSigningRouteAttemptId);
  }, [memoSigningRouteAttemptId, onMemoSigningRouteSettled]);

  if (!isBoard) {
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
      {/* Board callout: the board dialog (with its fullscreen toggle). */}
      <TaskBoardDialog
        calloutId={callout.id}
        title={callout.framing.profile.displayName}
        open={true}
        onOpenChange={open => {
          if (!open) onClose();
        }}
        onOpenTask={setOpenContributionId}
      />

      {/* Board callout + a task: the focused post dialog on top of the board. */}
      {openContributionId && (
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
