import { type RefObject, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type { CollaboraTerminalReason } from '@/crd/components/collabora/CollaboraCollabFooter';
import { type CollaboraFooterMappedProps, mapCollaboraFooterProps } from './collaboraFooterMapper';
import { useCollaboraConnectionMonitor } from './useCollaboraConnectionMonitor';
import type { CollaboraConnectionStatus, DisconnectCause } from './useCollaboraPostMessage';
import { type CollaboraRecovery, type CollaboraRecoveryKind, useCollaboraRecovery } from './useCollaboraRecovery';
import { useCollaboraSaveHealth } from './useCollaboraSaveHealth';
import { useCollaboraTokenRefresh } from './useCollaboraTokenRefresh';

// Alkemio server error codes (extensions.code) on the editor-URL path that mean recovery is
// impossible (FR-013). Anything else is treated as recoverable so a transient/unknown error
// never wrongly strands the user in a terminal state (research R4, fail-safe).
const TERMINAL_CODE_REASONS: Record<string, CollaboraTerminalReason> = {
  ENTITY_NOT_FOUND: 'notFound',
  RELATIONSHIP_NOT_FOUND: 'notFound',
  FORBIDDEN: 'forbidden',
};

/**
 * Folds backend problems into the shared connection state. Pure so the precedence rule is
 * unit-testable: a save-path outage or a recoverable fetch failure only overrides an
 * *otherwise-live* editor — a real network/Collabora drop already owns a disconnect status and
 * keeps its own cause. Only the confirmed save-path outage drives the top alert (`saveOutage`).
 */
export function resolveEffectiveConnection(
  status: CollaboraConnectionStatus,
  cause: DisconnectCause | null,
  serviceUnavailable: boolean,
  recoverableFetchError = false
): { status: CollaboraConnectionStatus; cause: DisconnectCause | null; saveOutage: boolean } {
  const live = status === 'connected' || status === 'connecting';
  const saveOutage = serviceUnavailable && live;
  // A recoverable (non-terminal) editor-URL fetch failure means the session can't come up right
  // now — surface a service disconnect so Reconnect appears immediately, rather than leaving the
  // editor's own error panel with no recovery action until the connect-timeout backstop fires.
  const backendDown = saveOutage || (recoverableFetchError && live);
  return {
    status: backendDown ? 'disconnected' : status,
    cause: backendDown ? 'service' : cause,
    saveOutage,
  };
}

export type CollaboraEditorConnection = {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  /** Pass to the editor: records the fresh WOPI token TTL and clears any terminal state. */
  onAccessTokenTTL: (accessTokenTTL: number) => void;
  /** Pass to the editor: classifies a failed editor-URL fetch as terminal vs recoverable. */
  onFetchError: (code: string | undefined) => void;
  /** Pass to the editor: remounts the iframe on a user-initiated reconnect. */
  reconnectNonce: number;
  /** Ready-to-spread props for `CollaboraCollabFooter`. */
  footerProps: CollaboraFooterMappedProps;
  /** True while a silent save-path outage is being surfaced (drives the top alert). */
  saveOutage: boolean;
  /** User-initiated recovery + its action-specific pre-recovery warning. */
  recovery: CollaboraRecovery;
};

/**
 * Composes the whole disconnect-recovery pipeline for one embedded Collabora editor into a
 * single connection facade, so the overlay stays a thin view:
 *
 * - **prevent** token expiry (`useCollaboraTokenRefresh` — in-place `Reset_Access_Token`),
 * - **detect** drops (`useCollaboraConnectionMonitor` — postMessage + online/offline + TTL),
 * - **detect** a silent save-path outage (`useCollaboraSaveHealth`) and fold it in,
 * - **map** the result to footer props, and
 * - **orchestrate** user-initiated recovery + its warning (`useCollaboraRecovery`).
 *
 * @param onDocumentReloaded forwarded to the monitor's single postMessage subscription — fires
 *   when Collabora re-emits `Document_Loaded` after an in-editor rename (used to re-read the name).
 */
export function useCollaboraEditorConnection(
  collaboraDocumentId: string,
  { onDocumentReloaded }: { onDocumentReloaded?: () => void } = {}
): CollaboraEditorConnection {
  const { t } = useTranslation('crd-space');
  const notify = useNotification();
  const { isAuthenticated } = useAuthenticationContext();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // The editor-URL query returns the WOPI token TTL (the monitor's expiry-timer input) and, on a
  // successful (re)issue, proves the document is reachable → clear any terminal state. Stable
  // callbacks so the editor's fetch effect isn't needlessly re-triggered.
  const [accessTokenTTL, setAccessTokenTTL] = useState<number>();
  const [terminalReason, setTerminalReason] = useState<CollaboraTerminalReason>(null);
  const [recoverableFetchError, setRecoverableFetchError] = useState(false);
  const onAccessTokenTTL = (ttl: number) => {
    setAccessTokenTTL(ttl);
    setTerminalReason(null);
    setRecoverableFetchError(false);
  };
  const onFetchError = (code: string | undefined) => {
    const reason = code ? (TERMINAL_CODE_REASONS[code] ?? null) : null;
    setTerminalReason(reason);
    // A fetch failure with no terminal mapping is recoverable — surface it as a service
    // disconnect (below) so the recovery affordance appears right away.
    setRecoverableFetchError(reason === null);
  };

  const { status, cause, saveStatus, connectedUsers, reconnect, reconnectNonce } = useCollaboraConnectionMonitor(
    iframeRef,
    {
      accessTokenTTL,
      terminal: terminalReason !== null,
      onError: message => notify(t('collabora.editor.error.runtime', { message }), 'error'),
      onSessionClosed: () => notify(t('collabora.editor.error.sessionClosed'), 'warning'),
      onDocumentReloaded,
    }
  );

  // Primary token-expiry handling: refresh the WOPI token in place before it expires — seamless,
  // no remount, no lost edits. `onRefreshed` re-arms the monitor's fallback timer and clears any
  // terminal state; a failed re-issue falls through to the terminal/recoverable mapping.
  useCollaboraTokenRefresh(iframeRef, collaboraDocumentId, {
    onRefreshed: onAccessTokenTTL,
    onError: onFetchError,
  });

  const { serviceUnavailable } = useCollaboraSaveHealth(collaboraDocumentId, saveStatus);
  const {
    status: effectiveStatus,
    cause: effectiveCause,
    saveOutage,
  } = resolveEffectiveConnection(status, cause, serviceUnavailable, recoverableFetchError);

  const footerProps = mapCollaboraFooterProps({
    connectionStatus: effectiveStatus,
    disconnectCause: effectiveCause,
    terminalReason,
    saveStatus,
    connectedUsers,
    isAuthenticated,
    // Framing edit privileges are enforced by the server via the editor URL; the client can't
    // distinguish read-only from read-write after the URL is issued, so we optimistically assume
    // editable for authenticated users. The iframe itself still enforces the server's readonly.
    hasEditPrivilege: isAuthenticated,
    isContribution: false,
    hasDeletePrivileges: false,
  });

  const perform = (kind: CollaboraRecoveryKind) => {
    if (kind === 'reconnect') {
      reconnect();
    } else {
      window.location.reload();
    }
  };
  const recovery = useCollaboraRecovery(footerProps.changesAtRisk, perform);

  return { iframeRef, onAccessTokenTTL, onFetchError, reconnectNonce, footerProps, saveOutage, recovery };
}
