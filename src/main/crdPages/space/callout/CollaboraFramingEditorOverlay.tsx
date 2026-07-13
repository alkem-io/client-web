import { useApolloClient } from '@apollo/client';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { FileText, Presentation, ServerOff, Sheet, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type { CollaboraDocumentPreviewType } from '@/crd/components/callout/CalloutCollaboraPreview';
import { CollaboraCollabFooter, type CollaboraTerminalReason } from '@/crd/components/collabora/CollaboraCollabFooter';
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
import { mapCollaboraFooterProps } from '@/domain/collaboration/calloutContributions/collaboraDocument/collaboraFooterMapper';
import { useCollaboraConnectionMonitor } from '@/domain/collaboration/calloutContributions/collaboraDocument/useCollaboraConnectionMonitor';
import { useCollaboraSaveHealth } from '@/domain/collaboration/calloutContributions/collaboraDocument/useCollaboraSaveHealth';
import { useCollaboraTokenRefresh } from '@/domain/collaboration/calloutContributions/collaboraDocument/useCollaboraTokenRefresh';
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
  canRename,
  onClose,
}: CollaboraFramingEditorOverlayProps) {
  const TypeIcon = iconByType[documentType];
  const { t } = useTranslation('crd-space');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isAuthenticated } = useAuthenticationContext();
  const notify = useNotification();
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
      // Collabora reconnects and re-emits Document_Loaded after an in-editor rename (without
      // navigating the iframe). The monitor forwards that postMessage so the rename feature and
      // the connection state share a single subscription; use it to re-read the persisted name.
      onDocumentReloaded: refetchDocumentName,
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

  // A WOPI/save-path outage is silent (Collabora keeps editing + buffering); the probe detects it.
  // Fold it into the single shared connection indicator as a `service` disconnect — same look as a
  // network/Collabora drop — rather than a separate banner. Network/Collabora drops already set a
  // disconnect status, so only override when otherwise connected/connecting.
  const { serviceUnavailable } = useCollaboraSaveHealth(collaboraDocumentId, saveStatus);
  const saveOutage = serviceUnavailable && (status === 'connected' || status === 'connecting');
  const effectiveStatus = saveOutage ? 'disconnected' : status;
  const effectiveCause = saveOutage ? 'service' : cause;

  // Backstop: whatever happened inside the editor, refresh our copy on the way out.
  const handleClose = () => {
    refetchDocumentName();
    onClose();
  };

  const footerProps = mapCollaboraFooterProps({
    connectionStatus: effectiveStatus,
    disconnectCause: effectiveCause,
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
          <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
            {/* A backend save-path (WOPI) outage: Collabora shows its own top banner for a network
                drop but nothing here, so we float a matching card to prompt the user to save. The
                footer carries the recovery actions. */}
            {open && saveOutage && (
              <CollaboraTopAlert icon={ServerOff} message={t('collabora.serviceUnavailable.message')} />
            )}
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
