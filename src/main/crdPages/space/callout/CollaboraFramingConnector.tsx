import { CalloutCollaboraPreview } from '@/crd/components/callout/CalloutCollaboraPreview';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import { toCollaboraPreviewType } from './collaboraDocumentTypeMap';

type CollaboraFramingConnectorProps = {
  callout: CalloutDetailsModelExtended;
  onOpen: () => void;
};

/**
 * Renders the inline Collabora document framing preview inside a CalloutDetailDialog.
 * The editor dialog itself is rendered as a sibling of CalloutDetailDialog by
 * CalloutDetailDialogConnector — keeping both Radix dialogs' FocusScopes
 * independent avoids the nested-dialog pointer-events / focus-trap issue
 * (same pattern as MemoFramingConnector).
 */
export function CollaboraFramingConnector({ callout, onOpen }: CollaboraFramingConnectorProps) {
  const collaboraDocument = callout.framing.collaboraDocument;
  if (!collaboraDocument) return null;

  return (
    <CalloutCollaboraPreview documentType={toCollaboraPreviewType(collaboraDocument.documentType)} onOpen={onOpen} />
  );
}
