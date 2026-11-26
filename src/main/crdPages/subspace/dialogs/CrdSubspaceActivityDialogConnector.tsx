import { CrdSpaceActivityDialogConnector } from '../../space/dialogs/CrdSpaceActivityDialogConnector';

type CrdSubspaceActivityDialogConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** A native space has no collaboration wrapper: this is the subspace's own id. */
  collaborationId: string | undefined;
};

/** The subspace activity dialog is the space activity dialog of this subspace (021 T021; its D7 read is T016). */
export function CrdSubspaceActivityDialogConnector({
  open,
  onOpenChange,
  collaborationId,
}: CrdSubspaceActivityDialogConnectorProps) {
  return <CrdSpaceActivityDialogConnector open={open} onOpenChange={onOpenChange} spaceId={collaborationId} />;
}
