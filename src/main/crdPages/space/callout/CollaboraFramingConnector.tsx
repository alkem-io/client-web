import { useState } from 'react';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { CalloutCollaboraPreview } from '@/crd/components/callout/CalloutCollaboraPreview';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import { CollaboraFramingReplaceConnector } from './CollaboraFramingReplaceConnector';
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
 *
 * A user with edit rights can also **replace** the document's backing file from
 * here without opening the editor (workspace#014-officedocs-replace-file, FR-001).
 */
export function CollaboraFramingConnector({ callout, onOpen }: CollaboraFramingConnectorProps) {
  const [replaceOpen, setReplaceOpen] = useState(false);
  const collaboraDocument = callout.framing.collaboraDocument;
  if (!collaboraDocument) return null;

  // Edit-rights gate (FR-002). The callout's UPDATE privilege is the flag the
  // client already reads to authorize framing edits (mirrors the MediaGallery
  // framing surface, `canEditMediaGallery`). The document's own UPDATE is
  // re-checked server-side at mutation time (defense in depth).
  const canReplace = callout.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false;

  const currentTitle = collaboraDocument.profile?.displayName ?? callout.framing.profile.displayName;

  return (
    <>
      <CalloutCollaboraPreview
        documentType={toCollaboraPreviewType(collaboraDocument.documentType)}
        onOpen={onOpen}
        onReplace={canReplace ? () => setReplaceOpen(true) : undefined}
      />
      {canReplace && (
        <CollaboraFramingReplaceConnector
          open={replaceOpen}
          onOpenChange={setReplaceOpen}
          collaboraDocumentId={collaboraDocument.id}
          currentDocumentType={collaboraDocument.documentType}
          currentTitle={currentTitle}
        />
      )}
    </>
  );
}
