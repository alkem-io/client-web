import { CrdPostContributionDialog } from '@/main/crdPages/post/CrdPostContributionDialog';

type PostContributionConnectorProps = {
  open: boolean;
  calloutId: string;
  contributionId: string;
  postId: string;
  onClose: () => void;
};

export function PostContributionConnector({
  open,
  calloutId,
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
      postId={postId}
      contributionId={contributionId}
      onDeleted={onClose}
    />
  );
}
