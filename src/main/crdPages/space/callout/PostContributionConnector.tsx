import { CrdPostContributionDialog } from '@/main/crdPages/post/CrdPostContributionDialog';

type PostContributionConnectorProps = {
  open: boolean;
  calloutId: string;
  /** Threaded through so the edit dialog can list sibling callouts in the same
   *  set as "Post location" move targets (MUI parity — `PostCalloutsInCalloutSet`). */
  calloutsSetId?: string;
  contributionId: string;
  postId: string;
  onClose: () => void;
};

export function PostContributionConnector({
  open,
  calloutId,
  calloutsSetId,
  contributionId,
  postId,
  onClose,
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
      onDeleted={onClose}
    />
  );
}
