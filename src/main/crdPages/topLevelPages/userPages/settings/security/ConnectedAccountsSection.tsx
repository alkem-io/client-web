import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type ConnectedAccountsCredentialRow,
  type ConnectedAccountsFlowMessage,
  type ConnectedAccountsProviderRow,
  ConnectedAccountsView,
} from '@/crd/components/user/settings/ConnectedAccountsView';
import { useKratosMessageCopy } from '@/main/crdPages/auth/useKratosMessageCopy';
import { type ConnectedAccountsModel, displayNameFor } from './connectedAccountsFlowAdapter';
import {
  type ConnectedAccountsMarkerLiveState,
  consumeConnectedAccountsMarker,
  resolveMarkerOutcome,
  writeConnectedAccountsMarker,
} from './connectedAccountsOutcomeMarker';

// Kratos returns this on the settings flow when a link attempt targets an identity already
// connected to a *different* Alkemio account (FR-006). The shared `kratosMessageTranslationKeys`
// registry keeps this id's existing login-context copy (the sign-in screen's duplicate-identity
// notice), so this settings-context reading is applied here instead of there.
const MESSAGE_CODE_IDENTITY_ALREADY_LINKED = 4000007;

const NS = 'crd-contributorSettings';

export type ConnectedAccountsSectionStatus = 'loading' | 'unavailable' | 'ready';

export type ConnectedAccountsSectionProps = {
  status: ConnectedAccountsSectionStatus;
  model: ConnectedAccountsModel;
  /**
   * True when the Settings flow driving this render is a *resumed* flow (a `flow` id was already on
   * the URL) rather than a freshly-provisioned one. Kratos's settings UI URL convention is
   * `<ui_url>?flow=<id>`, and that convention is what it redirects back to once a privileged-session
   * re-auth interruption completes — so this distinguishes "the identity check the person just
   * completed interrupted a link/unlink attempt" from "that attempt genuinely failed" when the
   * marker fallback resolves to `'failed'`.
   */
  flowWasResumed: boolean;
  onRetry: () => void;
};

/**
 * Integration wiring for the Connected Accounts section: translates the adapter's raw model into
 * the CRD view's props, and closes the outcome-announcement gap left when Kratos's settings-flow
 * redirect comes back without a usable flow id (`ui.messages` empty — the live defect research D5
 * anticipated as its fallback). A per-row sessionStorage marker, written just before each native
 * form submits, lets the section compare what it expected against the freshly reloaded state and
 * announce success or failure itself whenever Kratos's own flow message never arrives (FR-012,
 * FR-019). When a real Kratos message *is* present, it already explains the attempt and the marker
 * path yields to it rather than double-announcing.
 */
export function ConnectedAccountsSection({ status, model, flowWasResumed, onRetry }: ConnectedAccountsSectionProps) {
  const { t: tTyped } = useTranslation(NS);
  // Reason-key and outcome-message strings are built at runtime from the adapter's/marker's output
  // (a string, not a literal from the typed resource union) — translate via a plain signature,
  // mirroring `useKratosMessageCopy`'s own cast for the same reason.
  const t = tTyped as unknown as (key: string, options?: Record<string, unknown>) => string;
  const translateKratosMessages = useKratosMessageCopy();

  const messages: ConnectedAccountsFlowMessage[] = translateKratosMessages(model.messages).map(message =>
    message.id === MESSAGE_CODE_IDENTITY_ALREADY_LINKED
      ? {
          id: message.id,
          type: message.type,
          text: t('user.security.connectedAccounts.messages.identityAlreadyLinked'),
        }
      : { id: message.id, type: message.type, text: message.text }
  );

  const providers: ConnectedAccountsProviderRow[] = model.providers.map(row => ({
    providerId: row.providerId,
    displayName: row.displayName,
    iconSrc: row.iconSrc,
    state: row.state,
    lockedReason: row.lockedReasonKey ? t(row.lockedReasonKey) : undefined,
    action: row.action,
  }));

  const credentials: ConnectedAccountsCredentialRow[] = model.credentials.map(row => ({
    kind: row.kind,
    present: row.present,
    // Hash-only: `UserSecurityTabView` renders the `#password` / `#passkeys` anchors on this
    // same page (with `scroll-mt-60` to clear the sticky chrome). A full settings URL here
    // rendered as a plain <a> and reloaded the document to reach a section already on screen.
    manageHref: row.kind === 'password' ? '#password' : '#passkeys',
  }));

  const markerMessage = useConnectedAccountsMarkerMessage({ status, messages, providers, flowWasResumed, t });
  const allMessages = markerMessage ? [...messages, markerMessage] : messages;

  const handleProviderActionSubmit = (row: ConnectedAccountsProviderRow) => {
    if (!row.action) return;
    writeConnectedAccountsMarker(row.action.kind, row.providerId);
  };

  return (
    <ConnectedAccountsView
      status={status}
      unavailableReason={model.unavailableReasonKey ? t(model.unavailableReasonKey) : undefined}
      onRetry={onRetry}
      providers={providers}
      credentials={credentials}
      messages={allMessages}
      onProviderActionSubmit={handleProviderActionSubmit}
    />
  );
}

type UseConnectedAccountsMarkerMessageArgs = {
  status: ConnectedAccountsSectionStatus;
  messages: ConnectedAccountsFlowMessage[];
  providers: ConnectedAccountsProviderRow[];
  flowWasResumed: boolean;
  t: (key: string, options?: Record<string, unknown>) => string;
};

/**
 * Consumes the sessionStorage marker (once, the first time the section reaches a settled `ready`
 * state after mount) and turns it into a synthetic flow message when Kratos's own `ui.messages`
 * came back empty. Guarded by a ref rather than a narrow dependency array so a marker is resolved
 * exactly once per mount regardless of how many times `messages`/`providers` are recreated by
 * upstream re-renders — `consumeConnectedAccountsMarker` already makes a second read a no-op, but
 * the ref avoids re-deriving the outcome and flashing a second, possibly different, message.
 */
function useConnectedAccountsMarkerMessage({
  status,
  messages,
  providers,
  flowWasResumed,
  t,
}: UseConnectedAccountsMarkerMessageArgs): ConnectedAccountsFlowMessage | undefined {
  const [markerMessage, setMarkerMessage] = useState<ConnectedAccountsFlowMessage | undefined>(undefined);
  const processedRef = useRef(false);

  useEffect(() => {
    // Consume on the first *settled* render, not the first `ready` one. A redirect that
    // lands while the flow or the auth-methods query is failing settles as `unavailable`,
    // and leaving the marker in place there lets a 15-minute-old attempt announce itself
    // on some later, unrelated visit to the section. Read it once the outcome is knowable
    // either way, and only turn it into a message when the section can actually show the
    // state that message claims.
    if (status === 'loading') return;
    if (processedRef.current) return;
    processedRef.current = true;

    const marker = consumeConnectedAccountsMarker();
    if (!marker) return;
    if (status !== 'ready') return;
    // A rendered Kratos flow message already explains this attempt — Kratos's ERROR returns keep
    // their flow id, so `messages` is non-empty exactly when that's the case. Don't layer a second,
    // possibly conflicting, announcement over it.
    if (messages.length > 0) return;

    const providerRow = providers.find(row => row.providerId === marker.provider);
    const currentState: ConnectedAccountsMarkerLiveState = providerRow ? providerRow.state : 'absent';
    const outcome = resolveMarkerOutcome(marker, currentState);
    if (!outcome) return;

    const providerName = providerRow?.displayName ?? displayNameFor(marker.provider);

    if (outcome === 'linked') {
      setMarkerMessage({
        id: -1,
        type: 'success',
        text: t('user.security.connectedAccounts.messages.linked', { provider: providerName }),
      });
      return;
    }
    if (outcome === 'unlinked') {
      setMarkerMessage({
        id: -2,
        type: 'success',
        text: t('user.security.connectedAccounts.messages.unlinked', { provider: providerName }),
      });
      return;
    }
    if (flowWasResumed) {
      // The provider state did not reach the marker's expected outcome, but this render is a
      // *resumed* flow (a `flow` id was already on the URL) — Kratos's own convention for landing
      // back here once a privileged-session re-auth interruption completes. Nothing
      // has actually failed: the person just finished confirming their identity, and the original
      // link/unlink attempt was never (re-)submitted. Calling this "failed" would be a lie; instead
      // point back at the pending action rather than layering a red error over a routine identity
      // check.
      const pendingKey =
        marker.action === 'link'
          ? 'user.security.connectedAccounts.messages.reauthRequiredConnect'
          : 'user.security.connectedAccounts.messages.reauthRequiredDisconnect';
      setMarkerMessage({ id: -4, type: 'info', text: t(pendingKey, { provider: providerName }) });
      return;
    }

    const failedKey =
      marker.action === 'link'
        ? 'user.security.connectedAccounts.messages.connectFailed'
        : 'user.security.connectedAccounts.messages.disconnectFailed';
    setMarkerMessage({ id: -3, type: 'error', text: t(failedKey, { provider: providerName }) });
  }, [status, messages, providers, flowWasResumed, t]);

  return markerMessage;
}

export default ConnectedAccountsSection;
