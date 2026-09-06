import { useCalloutContributionQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { canRenameCollaboraDocument } from '@/domain/collaboration/calloutContributions/collaboraDocument/canRenameCollaboraDocument';
import { CollaboraContributionEditorOverlay } from './CollaboraContributionEditorOverlay';
import { toCollaboraPreviewType } from './collaboraDocumentTypeMap';

type DocumentContributionConnectorProps = {
  open: boolean;
  contributionId: string;
  /**
   * Threaded from the parent's `callout.authorization?.myPrivileges` — required for
   * `canRenameCollaboraDocument`'s document-OR-callout OR-rule to evaluate correctly
   * (research R10): an admin with UPDATE on the callout but no direct privilege on this
   * one response's document must still be able to rename it, matching the framing case.
   */
  calloutPrivileges: AuthorizationPrivilege[] | undefined;
  onClose: () => void;
  /** Omit to hide the delete affordance regardless of privileges — used by the "just created,
   *  open immediately" call site, which has no confirm-delete dialog to stage into (R5). */
  onDelete?: (contributionId: string, title: string) => void;
};

export function DocumentContributionConnector({
  open,
  contributionId,
  calloutPrivileges,
  onClose,
  onDelete,
}: DocumentContributionConnectorProps) {
  const { data } = useCalloutContributionQuery({
    variables: { contributionId, includeCollaboraDocument: true },
    skip: !open || !contributionId,
  });

  const contribution = data?.lookup.contribution;
  const document = contribution?.collaboraDocument;

  const canRename = canRenameCollaboraDocument({
    documentPrivileges: document?.authorization?.myPrivileges,
    calloutPrivileges,
    includeContentEditors: true,
  });
  // canDelete comes from the CONTRIBUTION wrapper's own privileges — matching the existing
  // canDeleteSelectedWhiteboard precedent — not the nested document's privileges.
  const canDelete = contribution?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Delete) ?? false;

  if (!open || !document) return null;

  return (
    <CollaboraContributionEditorOverlay
      open={open}
      collaboraDocumentId={document.id}
      title={document.profile.displayName}
      documentType={toCollaboraPreviewType(document.documentType)}
      canRename={canRename}
      canDelete={canDelete}
      onDelete={onDelete ? () => onDelete(contributionId, document.profile.displayName) : undefined}
      onClose={onClose}
    />
  );
}
