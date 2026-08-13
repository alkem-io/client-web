import { useApolloClient } from '@apollo/client';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { FileText, Presentation, ServerOff, Sheet, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CollaboraDocumentPreviewType } from '@/crd/components/callout/CalloutCollaboraPreview';
import { CollaboraCollabFooter } from '@/crd/components/collabora/CollaboraCollabFooter';
import { CollaboraDocumentDisplayName } from '@/crd/components/collabora/CollaboraDocumentDisplayName';
import { CollaboraTopAlert } from '@/crd/components/collabora/CollaboraTopAlert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/crd/primitives/alert-dialog';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogDescription, DialogTitle } from '@/crd/primitives/dialog';
import CollaboraDocumentEditor from '@/domain/collaboration/calloutContributions/collaboraDocument/CollaboraDocumentEditor';
import { useCollaboraEditorConnection } from '@/domain/collaboration/calloutContributions/collaboraDocument/useCollaboraEditorConnection';
import { useRenameCollaboraDocument } from '@/domain/collaboration/calloutContributions/collaboraDocument/useRenameCollaboraDocument';

type CollaboraContributionEditorOverlayProps = {
  open: boolean;
  collaboraDocumentId: string;
  title: string;
  documentType: CollaboraDocumentPreviewType;
  /** Whether the current user may rename the document (document-edit OR callout-edit). */
  canRename: boolean;
  /** Whether the current user may delete this document response. Omit/false hides the affordance. */
  canDelete?: boolean;
  /** Stages the delete — this component owns no confirmation UI itself (R5); the parent renders
   *  the shared `ConfirmationDialog` and only calls the actual delete mutation on confirm. */
  onDelete?: () => void;
  onClose: () => void;
};

const iconByType: Record<CollaboraDocumentPreviewType, typeof FileText> = {
  text: FileText,
  spreadsheet: Sheet,
  presentation: Presentation,
};

/**
 * Fullscreen Collabora editor dialog for a document **response** (a `CalloutContribution`,
 * not a callout framing). Sibling of `CollaboraFramingEditorOverlay` — same iframe/footer/
 * recovery-dialog structure and the same `useCollaboraEditorConnection` reuse — but its
 * post-close/rename refetch targets the contribution-list queries (`CalloutContributions`,
 * `CalloutDetails`) instead of the framing-only `CalloutsOnCalloutsSetUsingClassification`,
 * and it additionally exposes a delete affordance (a contribution document is independently
 * deletable; a framing document is not — it goes away only when the whole post is deleted).
 */
export function CollaboraContributionEditorOverlay({
  open,
  collaboraDocumentId,
  title,
  documentType,
  canRename,
  canDelete,
  onDelete,
  onClose,
}: CollaboraContributionEditorOverlayProps) {
  const TypeIcon = iconByType[documentType];
  const { t } = useTranslation('crd-space');
  const client = useApolloClient();

  const rename = useRenameCollaboraDocument({ collaboraDocumentId, displayName: title, canRename });

  // A rename from inside Collabora is persisted server-side (WOPI → server event), but Apollo
  // never observes that write, so our own title would go stale. Re-read the contribution-list
  // queries (the grid + card sources) so the new name lands in the normalized cache.
  const refetchDocumentName = () => {
    // Best-effort cache refresh — the WOPI-driven rename already persisted server-side
    // regardless of whether this refetch succeeds, so a failure here is silently dropped.
    client.refetchQueries({ include: ['CalloutContributions', 'CalloutDetails'] }).catch(() => {});
  };

  const { iframeRef, onAccessTokenTTL, onFetchError, reconnectNonce, footerProps, saveOutage, recovery } =
    useCollaboraEditorConnection(collaboraDocumentId, {
      onDocumentReloaded: refetchDocumentName,
    });

  const handleClose = () => {
    refetchDocumentName();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && handleClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex flex-col bg-background"
          aria-describedby="collabora-contribution-editor-dialog-description"
        >
          <div className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-border bg-background gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <TypeIcon className="size-5 shrink-0 text-primary" aria-hidden="true" />
              {canRename ? (
                <>
                  <DialogTitle className="sr-only">{title}</DialogTitle>
                  <CollaboraDocumentDisplayName
                    displayName={title}
                    value={rename.draft}
                    readOnly={rename.readOnly}
                    editing={rename.editing}
                    saving={rename.saving}
                    error={rename.error}
                    onChange={rename.changeDraft}
                    onEdit={rename.startEdit}
                    onSave={rename.save}
                    onCancel={rename.cancel}
                  />
                </>
              ) : (
                <DialogTitle className="text-subsection-title text-foreground truncate">{title}</DialogTitle>
              )}
            </div>
            <DialogDescription id="collabora-contribution-editor-dialog-description" className="sr-only">
              {t('callout.openDocument')}
            </DialogDescription>
            <div className="flex items-center gap-1 shrink-0">
              {canDelete && onDelete && (
                <Button variant="ghost" size="icon" onClick={onDelete} aria-label={t('deleteContribution.confirm')}>
                  <Trash2 className="w-5 h-5" aria-hidden="true" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={handleClose} aria-label={t('contribution.close')}>
                <X className="w-5 h-5" aria-hidden="true" />
              </Button>
            </div>
          </div>
          <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
            {open && saveOutage && (
              <CollaboraTopAlert icon={ServerOff} message={t('collabora.serviceUnavailable.message')} />
            )}
            {open && (
              <CollaboraDocumentEditor
                collaboraDocumentId={collaboraDocumentId}
                iframeRef={iframeRef}
                onAccessTokenTTL={onAccessTokenTTL}
                onFetchError={onFetchError}
                reconnectNonce={reconnectNonce}
              />
            )}
          </div>
          {open && (
            <CollaboraCollabFooter
              {...footerProps}
              onReconnect={() => recovery.request('reconnect')}
              onReload={() => recovery.request('reload')}
            />
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>

      <AlertDialog open={recovery.pending !== null} onOpenChange={o => !o && recovery.cancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t(
                `collabora.footer.disconnect.warning.${recovery.kind}Title` as 'collabora.footer.disconnect.warning.reconnectTitle'
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                `collabora.footer.disconnect.warning.${recovery.kind}Body` as 'collabora.footer.disconnect.warning.reconnectBody'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('collabora.footer.disconnect.warning.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={recovery.confirm}>
              {t(
                `collabora.footer.disconnect.warning.${recovery.kind}Confirm` as 'collabora.footer.disconnect.warning.reconnectConfirm'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
