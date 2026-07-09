import { useApolloClient } from '@apollo/client';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { FileText, Presentation, Sheet, X } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type { CollaboraDocumentPreviewType } from '@/crd/components/callout/CalloutCollaboraPreview';
import { CollaboraCollabFooter } from '@/crd/components/collabora/CollaboraCollabFooter';
import { CollaboraDocumentDisplayName } from '@/crd/components/collabora/CollaboraDocumentDisplayName';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogDescription, DialogTitle } from '@/crd/primitives/dialog';
import CollaboraDocumentEditor from '@/domain/collaboration/calloutContributions/collaboraDocument/CollaboraDocumentEditor';
import { mapCollaboraFooterProps } from '@/domain/collaboration/calloutContributions/collaboraDocument/collaboraFooterMapper';
import { useCollaboraPostMessage } from '@/domain/collaboration/calloutContributions/collaboraDocument/useCollaboraPostMessage';
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
};

/**
 * Fullscreen Collabora editor dialog rendered as a sibling of CalloutDetailDialog
 * to keep each Radix Dialog's FocusScope independent. Mirrors the CrdMemoDialog
 * sibling pattern used for memo framing.
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isAuthenticated } = useAuthenticationContext();
  const notify = useNotification();
  const client = useApolloClient();

  const rename = useRenameCollaboraDocument({ collaboraDocumentId, displayName: title, canRename });

  const { connectionStatus, saveStatus, connectedUsers } = useCollaboraPostMessage(iframeRef, {
    onError: message => notify(t('collabora.editor.error.runtime', { message }), 'error'),
    onSessionClosed: () => notify(t('collabora.editor.error.sessionClosed'), 'warning'),
  });

  // A rename from inside Collabora is persisted server-side (WOPI → server event),
  // but Apollo never observes that write, so our own title would go stale. Re-read
  // the callout's collabora document to pull the new name into the normalized cache
  // — the title here and the callout title then update in step. Cheap + idempotent.
  const refetchDocumentName = () => {
    client.refetchQueries({ include: ['CalloutsOnCalloutsSetUsingClassification', 'CalloutContent'] });
  };

  // Collabora reloads the iframe after an in-editor rename; the iframe's onLoad is a
  // plain DOM signal for that (independent of Collabora's postMessages). Skip the
  // first (initial open — name already current); refetch on every reload after.
  const loadCountRef = useRef(0);
  const handleIframeLoad = () => {
    loadCountRef.current += 1;
    if (loadCountRef.current > 1) {
      refetchDocumentName();
    }
  };

  // Backstop: whatever happened inside the editor, refresh our copy on the way out.
  const handleClose = () => {
    refetchDocumentName();
    onClose();
  };

  const footerProps = mapCollaboraFooterProps({
    connectionStatus,
    saveStatus,
    connectedUsers,
    isAuthenticated,
    // Framing edit privileges are enforced by the server via the editor URL; the client
    // can't distinguish read-only from read-write after the URL is issued, so we optimistically
    // assume editable for authenticated users. The footer still falls back to the server's
    // readonly behavior inside the iframe itself.
    hasEditPrivilege: isAuthenticated,
    isContribution: false,
    hasDeletePrivileges: false,
  });

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
              {t('callout.openDocument')}
            </DialogDescription>
            <Button variant="ghost" size="icon" onClick={handleClose} aria-label={t('contribution.close')}>
              <X className="w-5 h-5" aria-hidden="true" />
            </Button>
          </div>
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {open && (
              <CollaboraDocumentEditor
                collaboraDocumentId={collaboraDocumentId}
                iframeRef={iframeRef}
                onLoad={handleIframeLoad}
              />
            )}
          </div>
          {open && <CollaboraCollabFooter {...footerProps} />}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}
