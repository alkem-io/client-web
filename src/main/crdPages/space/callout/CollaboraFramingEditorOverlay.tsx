import * as DialogPrimitive from '@radix-ui/react-dialog';
import { FileText, Presentation, Sheet, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type { CollaboraDocumentPreviewType } from '@/crd/components/callout/CalloutCollaboraPreview';
import { CollaboraCollabFooter, type CollaboraTerminalReason } from '@/crd/components/collabora/CollaboraCollabFooter';
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
import { mapCollaboraFooterProps } from '@/domain/collaboration/calloutContributions/collaboraDocument/collaboraFooterMapper';
import { useCollaboraConnectionMonitor } from '@/domain/collaboration/calloutContributions/collaboraDocument/useCollaboraConnectionMonitor';
import { useCollaboraTokenRefresh } from '@/domain/collaboration/calloutContributions/collaboraDocument/useCollaboraTokenRefresh';

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

// Alkemio server error codes (extensions.code) on the editor-URL path that mean recovery is
// impossible (FR-013). Anything else is treated as recoverable so a transient/unknown error
// never wrongly strands the user in a terminal state (research R4, fail-safe).
const TERMINAL_CODE_REASONS: Record<string, CollaboraTerminalReason> = {
  ENTITY_NOT_FOUND: 'notFound',
  RELATIONSHIP_NOT_FOUND: 'notFound',
  FORBIDDEN: 'forbidden',
};

type PendingRecovery = 'reconnect' | 'reload' | null;

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
  // impending token-expiry disconnect (an otherwise silent failure). A successful (re)issue
  // also clears any terminal state. Stable callback so the editor's fetch effect isn't
  // re-triggered.
  const [accessTokenTTL, setAccessTokenTTL] = useState<number>();
  const [terminalReason, setTerminalReason] = useState<CollaboraTerminalReason>(null);
  const handleAccessTokenTTL = useCallback((ttl: number) => {
    setAccessTokenTTL(ttl);
    setTerminalReason(null);
  }, []);
  // Classify a failed editor-URL fetch: terminal (document gone / access revoked) vs recoverable.
  const handleFetchError = useCallback((code: string | undefined) => {
    setTerminalReason(code ? (TERMINAL_CODE_REASONS[code] ?? null) : null);
  }, []);

  const { status, cause, saveStatus, connectedUsers, reconnect, reconnectNonce } = useCollaboraConnectionMonitor(
    iframeRef,
    {
      accessTokenTTL,
      terminal: terminalReason !== null,
      onError: message => notify(t('collabora.editor.error.runtime', { message }), 'error'),
      onSessionClosed: () => notify(t('collabora.editor.error.sessionClosed'), 'warning'),
    }
  );

  // Primary token-expiry handling: refresh the WOPI token in place (Collabora
  // App_TokenExpiring → Reset_Access_Token) before it expires — seamless, no remount, no lost
  // edits. `onRefreshed` pushes the new TTL (re-arming the monitor's fallback timer) and clears
  // any terminal state; a failed re-issue falls through to the terminal/recoverable mapping.
  useCollaboraTokenRefresh(iframeRef, collaboraDocumentId, {
    onRefreshed: handleAccessTokenTTL,
    onError: handleFetchError,
  });

  const footerProps = mapCollaboraFooterProps({
    connectionStatus: status,
    disconnectCause: cause,
    terminalReason,
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

  // Recovery is user-initiated and, when unsaved work could be lost, gated by a confirmation
  // (FR-006) — both remount and reload replace the retained editor.
  const [pendingRecovery, setPendingRecovery] = useState<PendingRecovery>(null);
  const performRecovery = useCallback(
    (kind: 'reconnect' | 'reload') => {
      setPendingRecovery(null);
      if (kind === 'reconnect') {
        reconnect();
      } else {
        window.location.reload();
      }
    },
    [reconnect]
  );
  const requestRecovery = useCallback(
    (kind: 'reconnect' | 'reload') => {
      if (footerProps.changesAtRisk) {
        setPendingRecovery(kind);
      } else {
        performRecovery(kind);
      }
    },
    [footerProps.changesAtRisk, performRecovery]
  );

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
                onFetchError={handleFetchError}
                reconnectNonce={reconnectNonce}
              />
            )}
          </div>
          {open && (
            <CollaboraCollabFooter
              {...footerProps}
              onReconnect={() => requestRecovery('reconnect')}
              onReload={() => requestRecovery('reload')}
            />
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>

      {/* Pre-recovery warning — only shown when recovery could discard unsaved work (FR-006). */}
      <AlertDialog open={pendingRecovery !== null} onOpenChange={o => !o && setPendingRecovery(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('collabora.footer.disconnect.warning.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('collabora.footer.disconnect.warning.body')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('collabora.footer.disconnect.warning.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => pendingRecovery && performRecovery(pendingRecovery)}>
              {t('collabora.footer.disconnect.warning.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
