import * as DialogPrimitive from '@radix-ui/react-dialog';
import { FileText, Presentation, Sheet, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type { CollaboraDocumentPreviewType } from '@/crd/components/callout/CalloutCollaboraPreview';
import { CollaboraCollabFooter } from '@/crd/components/collabora/CollaboraCollabFooter';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogDescription, DialogTitle } from '@/crd/primitives/dialog';
import CollaboraDocumentEditor from '@/domain/collaboration/calloutContributions/collaboraDocument/CollaboraDocumentEditor';
import { mapCollaboraFooterProps } from '@/domain/collaboration/calloutContributions/collaboraDocument/collaboraFooterMapper';
import { useCollaboraConnectionMonitor } from '@/domain/collaboration/calloutContributions/collaboraDocument/useCollaboraConnectionMonitor';

type CollaboraFramingEditorOverlayProps = {
  open: boolean;
  collaboraDocumentId: string;
  title: string;
  documentType: CollaboraDocumentPreviewType;
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
  onClose,
}: CollaboraFramingEditorOverlayProps) {
  const TypeIcon = iconByType[documentType];
  const { t } = useTranslation('crd-space');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isAuthenticated } = useAuthenticationContext();
  const notify = useNotification();

  // The editor-URL query returns the WOPI token TTL; the monitor uses it to detect an
  // impending token-expiry disconnect (an otherwise silent failure). Stable callback so the
  // editor's fetch effect isn't re-triggered.
  const [accessTokenTTL, setAccessTokenTTL] = useState<number>();
  const handleAccessTokenTTL = useCallback((ttl: number) => setAccessTokenTTL(ttl), []);

  const { status, cause, saveStatus, connectedUsers } = useCollaboraConnectionMonitor(iframeRef, {
    accessTokenTTL,
    onError: message => notify(t('collabora.editor.error.runtime', { message }), 'error'),
    onSessionClosed: () => notify(t('collabora.editor.error.sessionClosed'), 'warning'),
  });

  const footerProps = mapCollaboraFooterProps({
    connectionStatus: status,
    disconnectCause: cause,
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
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex flex-col bg-background"
          aria-describedby="collabora-editor-dialog-description"
        >
          <div className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-border bg-background gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <TypeIcon className="size-5 shrink-0 text-primary" aria-hidden="true" />
              <DialogTitle className="text-subsection-title text-foreground truncate">{title}</DialogTitle>
            </div>
            <DialogDescription id="collabora-editor-dialog-description" className="sr-only">
              {t('callout.openDocument')}
            </DialogDescription>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('contribution.close')}>
              <X className="w-5 h-5" aria-hidden="true" />
            </Button>
          </div>
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {/* The editor stays mounted on disconnect (retained for manual copy, FR-004a) — the
                footer surfaces the disconnected state alongside it rather than replacing it. */}
            {open && (
              <CollaboraDocumentEditor
                collaboraDocumentId={collaboraDocumentId}
                iframeRef={iframeRef}
                onAccessTokenTTL={handleAccessTokenTTL}
              />
            )}
          </div>
          {open && <CollaboraCollabFooter {...footerProps} />}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}
