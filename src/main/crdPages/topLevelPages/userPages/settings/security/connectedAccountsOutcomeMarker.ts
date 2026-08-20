import type {
  ConnectedAccountsProviderAction,
  ConnectedAccountsProviderRow,
} from '@/crd/components/user/settings/ConnectedAccountsView';

export type ConnectedAccountsMarkerAction = ConnectedAccountsProviderAction['kind'];

export type ConnectedAccountsMarker = {
  action: ConnectedAccountsMarkerAction;
  provider: string;
  ts: number;
};

/** The live state of the marker's provider once the redirect has landed and the section has
 *  reloaded its data — `'absent'` when the provider no longer appears in the reloaded list at all. */
export type ConnectedAccountsMarkerLiveState = ConnectedAccountsProviderRow['state'] | 'absent';

export type ConnectedAccountsMarkerOutcome = 'linked' | 'unlinked' | 'failed';

const STORAGE_KEY = 'alkemio.connectedAccounts.outcomeMarker';

/**
 * How long a marker is trusted to describe the redirect that follows it (research D5's documented
 * fallback for when Kratos's `return_to` does not carry the settings flow id back). Long enough to
 * cover a real provider round trip plus a re-auth resume — a wallet-based provider confirmation can
 * involve a separate device (open an app, scan, confirm with a PIN), so the bound is set to match
 * Kratos's own settings-flow lifetime rather than an arbitrarily short clock; short enough that a
 * marker left behind by an abandoned tab still doesn't resurface on some unrelated much-later visit
 * to the section. `consumeConnectedAccountsMarker`'s read-once semantics — not this bound — are what
 * actually stop a marker from resurfacing on a later, unrelated visit.
 */
const MAX_MARKER_AGE_MS = 15 * 60 * 1000;

function isConnectedAccountsMarker(value: unknown): value is ConnectedAccountsMarker {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    (candidate.action === 'link' || candidate.action === 'unlink') &&
    typeof candidate.provider === 'string' &&
    candidate.provider.length > 0 &&
    typeof candidate.ts === 'number'
  );
}

/**
 * Records that a Connected Accounts row's native form is about to submit, so the section can
 * announce the outcome after the full-page redirect that follows. Must be called before the form
 * navigates away — the caller does not (and must not) call `preventDefault`; this only piggybacks
 * on the native POST, it never replaces it.
 */
export function writeConnectedAccountsMarker(action: ConnectedAccountsMarkerAction, provider: string): void {
  try {
    const marker: ConnectedAccountsMarker = { action, provider, ts: Date.now() };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(marker));
  } catch {
    // sessionStorage can throw (private browsing, storage disabled). The announcement is
    // best-effort: a write failure just means nothing will be read back later, not a broken submit.
  }
}

/** Reads a marker without clearing it. Returns `null` for a missing, malformed, or stale entry —
 *  a stale/malformed marker is treated exactly like no marker at all, never announced. */
export function readConnectedAccountsMarker(now: number = Date.now()): ConnectedAccountsMarker | null {
  let raw: string | null;
  try {
    raw = sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isConnectedAccountsMarker(parsed)) return null;
  // A timestamp in the future is as untrustworthy as one that is too old.
  if (parsed.ts > now || now - parsed.ts > MAX_MARKER_AGE_MS) return null;
  return parsed;
}

/** Removes any marker, fresh or stale. Safe to call even when none exists. */
export function clearConnectedAccountsMarker(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // See writeConnectedAccountsMarker — best-effort.
  }
}

/**
 * Reads and clears a marker in one step — the shape the integration layer actually needs: a marker
 * is meant to explain exactly one redirect, so once it has been read for that purpose it must not
 * be read again for a later one.
 */
export function consumeConnectedAccountsMarker(now: number = Date.now()): ConnectedAccountsMarker | null {
  const marker = readConnectedAccountsMarker(now);
  clearConnectedAccountsMarker();
  return marker;
}

/**
 * Resolves what a marker's expectation says actually happened, purely from the live provider state
 * loaded after the redirect — never from Kratos copy, which is exactly what the marker exists to
 * cover for. Returns `null` when there is no marker to resolve.
 */
export function resolveMarkerOutcome(
  marker: ConnectedAccountsMarker | null,
  currentState: ConnectedAccountsMarkerLiveState
): ConnectedAccountsMarkerOutcome | null {
  if (!marker) return null;
  if (marker.action === 'link') {
    return currentState === 'connected' || currentState === 'connected-locked' ? 'linked' : 'failed';
  }
  return currentState === 'not-connected' || currentState === 'absent' ? 'unlinked' : 'failed';
}
