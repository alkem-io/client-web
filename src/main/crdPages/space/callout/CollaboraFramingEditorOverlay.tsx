import { useApolloClient } from '@apollo/client';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { FileText, FileType, Presentation, ServerOff, Sheet, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CollaboraDocumentPreviewType } from '@/crd/components/callout/CalloutCollaboraPreview';
import { CollaboraCollabFooter } from '@/crd/components/collabora/CollaboraCollabFooter';
import { CollaboraDocumentDisplayName } from '@/crd/components/collabora/CollaboraDocumentDisplayName';
import { CollaboraTopAlert } from '@/crd/components/collabora/CollaboraTopAlert';
import { openLabelKey } from '@/crd/lib/collaboraDocumentPreview';
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

type CollaboraFramingEditorOverlayProps = {
  open: boolean;
  collaboraDocumentId: string;
  title: string;
  documentType: CollaboraDocumentPreviewType;
  /** Whether the current user may rename the document (document-edit OR callout-edit). */
  canRename: boolean;
  onClose: () => void;
};

const iconByType: Record<CollaboraDocumentPreviewType, typeof FileText> = {
  text: FileText,
  spreadsheet: Sheet,
  presentation: Presentation,
  pdf: FileType,
};

/**
 * Fullscreen Collabora editor dialog rendered as a sibling of CalloutDetailDialog
 * to keep each Radix Dialog's FocusScope independent. Mirrors the CrdMemoDialog
 * sibling pattern used for memo framing.
 *
 * The whole disconnect-detection / token-refresh / recovery pipeline lives in
 * `useCollaboraEditorConnection`; this component is the view over it.
 */
export function CollaboraFramingEditorOverlay({
  open,
  collaboraDocumentId,
  title,
  documentType,
  canRename,
  onClose,
}: CollaboraFramingEditorOverlayProps) {
  const TypeIcon = iconByType[documentType];
  const { t } = useTranslation('crd-space');
  const client = useApolloClient();

  // Rename mechanics for the editable title (develop's OfficeDocs rename UX).
  const rename = useRenameCollaboraDocument({ collaboraDocumentId, displayName: title, canRename });

  // A rename from inside Collabora is persisted server-side (WOPI → server event),
  // but Apollo never observes that write, so our own title would go stale. Re-read
  // the callout's collabora document to pull the new name into the normalized cache
  // — the title here and the callout title then update in step. Cheap + idempotent.
  const refetchDocumentName = () => {
    // CalloutDetails backs the card/dialog view (the overlay's source); the
    // classification query backs the callouts list. Both carry the collabora
    // document's profile, so refetching whichever is active re-normalizes the new
    // displayName into the cache and our title updates in place.
    client.refetchQueries({ include: ['CalloutDetails', 'CalloutsOnCalloutsSetUsingClassification'] });
  };

  const { iframeRef, onAccessTokenTTL, onFetchError, reconnectNonce, footerProps, saveOutage, recovery } =
    useCollaboraEditorConnection(collaboraDocumentId, {
      // Collabora reconnects and re-emits Document_Loaded after an in-editor rename (without
      // navigating the iframe); re-read the persisted name when that happens.
      onDocumentReloaded: refetchDocumentName,
    });

  // Backstop: whatever happened inside the editor, refresh our copy on the way out.
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
          aria-describedby="collabora-editor-dialog-description"
        >
          <div className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-border bg-background gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <TypeIcon className="size-5 shrink-0 text-primary" aria-hidden="true" />
              {canRename ? (
                <>
                  {/* Keep an accessible dialog title; the visible title is the editable control. */}
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
            <DialogDescription id="collabora-editor-dialog-description" className="sr-only">
              {t(openLabelKey[documentType])}
            </DialogDescription>
            <Button variant="ghost" size="icon" onClick={handleClose} aria-label={t('contribution.close')}>
              <X className="w-5 h-5" aria-hidden="true" />
            </Button>
          </div>
          <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
            {/* A backend save-path (WOPI) outage: Collabora shows its own top banner for a network
                drop but nothing here, so we float a matching card to prompt the user to save. The
                footer carries the recovery actions. */}
            {open && saveOutage && (
              <CollaboraTopAlert icon={ServerOff} message={t('collabora.serviceUnavailable.message')} />
            )}
            {/* The editor stays mounted on disconnect (retained for context, FR-004a) — the footer
                surfaces the disconnected state alongside it rather than replacing it. */}
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

      {/* Pre-recovery warning — only shown when recovery could discard unsaved work (FR-006).
          Copy is action-specific: reconnect reopens in place, reload refreshes the whole page. */}
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
