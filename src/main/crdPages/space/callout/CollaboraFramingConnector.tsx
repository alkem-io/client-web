import { CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';
import {
  CalloutCollaboraPreview,
  type CollaboraDocumentPreviewType,
} from '@/crd/components/callout/CalloutCollaboraPreview';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';

type CollaboraFramingConnectorProps = {
  callout: CalloutDetailsModelExtended;
  onOpen: () => void;
};

const documentTypeMap: Record<CollaboraDocumentType, CollaboraDocumentPreviewType> = {
  [CollaboraDocumentType.TextDocument]: 'text',
  [CollaboraDocumentType.Spreadsheet]: 'spreadsheet',
  [CollaboraDocumentType.Presentation]: 'presentation',
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

  const documentType = documentTypeMap[collaboraDocument.documentType as CollaboraDocumentType] ?? 'text';

  return <CalloutCollaboraPreview documentType={documentType} onOpen={onOpen} />;
}
