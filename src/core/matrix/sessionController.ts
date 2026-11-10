import type { MatrixClient } from 'matrix-js-sdk';
import { isAppMode } from '@/core/appMode/isAppMode';
import { setActiveClient, setSessionEstablishing } from './activeClient';
import { registerActiveSession, unregisterActiveSession } from './activeSession';
import { serverSideLogout } from './logoutCleanup';
import { mintAndStore } from './mintSession';
import { quietSdkLogging } from './sdkLogging';
import { attemptSilentSso } from './ssoLogin';
import { type CredentialRecord, clearNamespace, loadActorCredentials, loadCredentials } from './storage';
import { renewTokens } from './tokenRefresh';

// matrix-js-sdk's HttpApiEvent.SessionLoggedOut: emitted when the homeserver
// rejects the access token (M_UNKNOWN_TOKEN). A string here keeps the SDK a
// lazily loaded chunk.
const SESSION_LOGGED_OUT = 'Session.logged_out';
const CLIENT_SYNC = 'sync';

// Room timelines start from the sync response; history deeper than this is
// paged in when a conversation is opened.
const INITIAL_SYNC_LIMIT = 20;

const RENEW_BEFORE_MS = 60_000;

type MatrixClientLike = {
  stopClient(): void;
  startClient(opts?: { initialSyncLimit?: number; lazyLoadMembers?: boolean }): Promise<void>;
  on(event: string, listener: (state?: string) => void): unknown;
  setAccessToken(token: string): void;
};

type SessionHandle = {
  readonly stop: () => void;
};

type SessionOptions = {
  readonly signal?: AbortSignal;
  /** The platform origin the silent-SSO callback lives on. */
  readonly platformOrigin?: string;
};

/**
 * Establishes and syncs the browser's Matrix session for the given actor:
 * resumes from a stored credential record, or runs one silent SSO round-trip
 * when none is usable, then starts the sync loop and publishes the client to
 * the read hooks. Registers the session so an Alkemio sign-out can stop it.
 *
 * The access token is renewed in place before it expires. A rejected token
 * restarts on another device's stored credential when there is one; otherwise
 * it deletes the stored credential, logs that device out on the homeserver, and
 * gets one silent SSO and restart. If that
 * restart is rejected before it has synced, the session stays stopped. A
 * restart that syncs earns a fresh recovery for the next expiry.
 */
const establishSession = async (
  actorId: string,
  { signal, platformOrigin }: SessionOptions = {}
): Promise<SessionHandle> => {
  let activeClient: MatrixClientLike | null = null;
  let recoveryUsed = false;
  // Cancels an in-flight silent SSO: its iframe would otherwise go on to
  // persist fresh credentials after this session has already been stopped.
  const abort = new AbortController();

  const stopClient = (): void => {
    activeClient?.stopClient();
    activeClient = null;
    setActiveClient(null);
  };

  // A session that was stopped must not clear the flag a newer session has set.
  const finishEstablishing = (): void => {
    if (!abort.signal.aborted) {
      setSessionEstablishing(false);
    }
  };

  const stop = (): void => {
    abort.abort();
    setSessionEstablishing(false);
    stopClient();
    unregisterActiveSession(stop);
  };
  registerActiveSession(stop);
  if (signal?.aborted) {
    stop();
  }
  signal?.addEventListener('abort', stop);

  const loadOrAcquireRecord = async (): Promise<CredentialRecord | null> => {
    const record = await loadActorCredentials(actorId);
    if (record) {
      return record;
    }
    // The app skips silent SSO entirely: no identity-origin cookie exists in
    // this WebView's jar, so the iframe cannot complete — and on Android the
    // attempt is actively harmful, because the shell intercepts the iframe's
    // hop through identity.<host>/login and navigates the MAIN WebView to a
    // "Sign in to continue" landing. See workspace#091 spec FR-014.
    if (!isAppMode()) {
      const outcome = await attemptSilentSso(actorId, { signal: abort.signal, platformOrigin });
      if (outcome === 'authenticated') {
        return loadActorCredentials(actorId);
      }
    }
    // M3 mandates this leg for the app; reached in a BROWSER only after SSO
    // fails, which is the one credential-issuance path this feature adds
    // there — spec R-7(b).
    return mintAndStore(abort.signal);
  };

  const start = async (record: CredentialRecord): Promise<void> => {
    await quietSdkLogging();
    const sdk = (await import('matrix-js-sdk')) as unknown as {
      createClient(opts: {
        baseUrl: string;
        userId: string;
        deviceId: string;
        accessToken: string;
        fetchFn?: typeof fetch;
      }): MatrixClientLike;
    };
    let current = record;
    let renewal: Promise<void> | undefined;

    const renewIfDue = async (): Promise<void> => {
      if (
        current.refreshToken === undefined ||
        current.expiresAt === undefined ||
        Date.now() < current.expiresAt - RENEW_BEFORE_MS
      ) {
        return;
      }
      renewal ??= renewTokens(current)
        .then(
          tokens => {
            if (activeClient !== client) {
              return;
            }
            if (tokens) {
              current = { ...current, ...tokens };
              client.setAccessToken(tokens.accessToken);
            } else {
              void recover(current);
            }
          },
          // Transient: a later request tries again.
          () => undefined
        )
        .finally(() => {
          renewal = undefined;
        });
      // Still valid: the renewal finishes in the background.
      if (Date.now() < current.expiresAt) {
        return;
      }
      await renewal;
      if (Date.now() >= current.expiresAt) {
        // Never send a token known to be dead; the SDK treats this as a connection error and retries.
        throw new TypeError('Matrix access token expired');
      }
    };

    const fetchFn: typeof fetch = async (input, init) => {
      // The token the SDK built this request's header with.
      const sentWith = current.accessToken;
      await renewIfDue();
      if (current.accessToken !== sentWith) {
        const headers = new Headers(init?.headers);
        if (headers.get('Authorization') === `Bearer ${sentWith}`) {
          headers.set('Authorization', `Bearer ${current.accessToken}`);
        }
        init = { ...init, headers };
      }
      return fetch(input, init);
    };

    const client = sdk.createClient({
      baseUrl: record.homeserverUrl,
      userId: record.userId,
      deviceId: record.deviceId,
      accessToken: record.accessToken,
      fetchFn,
    });
    if (abort.signal.aborted) {
      client.stopClient();
      return;
    }
    client.on(SESSION_LOGGED_OUT, () => {
      if (activeClient === client) {
        void recover(current);
      }
    });
    client.on(CLIENT_SYNC, state => {
      if (state === 'PREPARED') {
        recoveryUsed = false;
      }
    });
    activeClient = client;
    setActiveClient(client as unknown as MatrixClient);
    await client.startClient({ initialSyncLimit: INITIAL_SYNC_LIMIT, lazyLoadMembers: true });
  };

  const recover = async (rejected: CredentialRecord): Promise<void> => {
    stopClient();
    try {
      const stored = await loadCredentials(rejected.userId);
      if (!stored || stored.deviceId === rejected.deviceId) {
        await clearNamespace(rejected.userId);
        // A refused renewal can mean a thief rotated this device's refresh
        // chain. Logging out with the last access token ends that chain only
        // if the thief has not yet refreshed again: a second rotation deletes
        // this token on Synapse, and the logout fails (accepted residual R-5).
        void serverSideLogout(rejected);
      }
    } catch {
      // The record is unusable either way; a failed delete must not block recovery.
    }
    if (abort.signal.aborted || recoveryUsed) {
      return;
    }
    recoveryUsed = true;
    setSessionEstablishing(true);
    try {
      const record = await loadOrAcquireRecord();
      if (!abort.signal.aborted && record) {
        await start(record);
      }
    } catch {
      // Fails closed: the session stays stopped until the next page load.
    } finally {
      finishEstablishing();
    }
  };

  if (!abort.signal.aborted) {
    setSessionEstablishing(true);
  }
  try {
    const record = await loadOrAcquireRecord();
    if (!abort.signal.aborted && record) {
      await start(record);
    }
  } catch {
    // Establishment failure leaves nothing to stop; the next load retries.
  } finally {
    finishEstablishing();
  }

  return { stop };
};

export { establishSession };
export type { MatrixClientLike };
