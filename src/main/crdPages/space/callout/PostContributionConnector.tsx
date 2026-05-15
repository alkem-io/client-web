import { CrdPostContributionDialog } from '@/main/crdPages/post/CrdPostContributionDialog';

type PostContributionConnectorProps = {
  open: boolean;
  calloutId: string;
  /** Threaded through so the edit dialog can list sibling callouts in the same
   *  set as "Post location" move targets (MUI parity — `PostCalloutsInCalloutSet`). */
  calloutsSetId?: string;
  contributionId: string;
  postId: string;
  /** Fires when the edit dialog is dismissed (Cancel / X / Save). The inline
   *  preview in the parent dialog stays selected. */
  onClose: () => void;
  /** Fires after a successful delete. Distinct from `onClose` so the parent can
   *  also clear its selected-post preview (otherwise the user sees the cached
   *  preview of a post that no longer exists). */
  onDeleted?: () => void;
};

export function PostContributionConnector({
  open,
  calloutId,
  calloutsSetId,
  contributionId,
  postId,
  onClose,
  onDeleted,
}: PostContributionConnectorProps) {
  if (!open) return null;
  return (
    <CrdPostContributionDialog
      open={open}
      onOpenChange={isOpen => {
        if (!isOpen) onClose();
      }}
      mode="edit"
      calloutId={calloutId}
      calloutsSetId={calloutsSetId}
      postId={postId}
      contributionId={contributionId}
      onDeleted={onDeleted}
    />
  );
}
