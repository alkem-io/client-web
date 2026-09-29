import type { MatrixClient } from 'matrix-js-sdk';
import { setActiveClient } from './activeClient';
import { registerActiveSession, unregisterActiveSession } from './activeSession';
import { attemptSilentSso } from './ssoLogin';
import { type CredentialRecord, clearNamespace, loadActorCredentials } from './storage';

// matrix-js-sdk's HttpApiEvent.SessionLoggedOut: emitted when the homeserver
// rejects the access token (M_UNKNOWN_TOKEN). A string here keeps the SDK a
// lazily loaded chunk.
const SESSION_LOGGED_OUT = 'Session.logged_out';
const CLIENT_SYNC = 'sync';

// Room timelines start from the sync response; history deeper than this is
// paged in when a conversation is opened.
const INITIAL_SYNC_LIMIT = 20;

type MatrixClientLike = {
  stopClient(): void;
  startClient(opts?: { initialSyncLimit?: number; lazyLoadMembers?: boolean }): Promise<void>;
  on(event: string, listener: (state?: string) => void): unknown;
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
 * A rejected token clears the stored record and gets one silent SSO and
 * restart; if that restart is rejected before it has synced, the session stays
 * stopped. A restart that syncs earns a fresh recovery for the next expiry.
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

  const stop = (): void => {
    abort.abort();
    stopClient();
    unregisterActiveSession(stop);
  };
  registerActiveSession(stop);
  signal?.addEventListener('abort', stop);

  const loadOrAcquireRecord = async (): Promise<CredentialRecord | null> => {
    const record = await loadActorCredentials(actorId);
    if (record) {
      return record;
    }
    const outcome = await attemptSilentSso(actorId, { signal: abort.signal, platformOrigin });
    return outcome === 'authenticated' ? loadActorCredentials(actorId) : null;
  };

  const start = async (record: CredentialRecord): Promise<void> => {
    const sdk = (await import('matrix-js-sdk')) as unknown as {
      createClient(opts: { baseUrl: string; userId: string; deviceId: string; accessToken: string }): MatrixClientLike;
    };
    const client = sdk.createClient({
      baseUrl: record.homeserverUrl,
      userId: record.userId,
      deviceId: record.deviceId,
      accessToken: record.accessToken,
    });
    if (abort.signal.aborted) {
      client.stopClient();
      return;
    }
    client.on(SESSION_LOGGED_OUT, () => {
      if (activeClient === client) {
        void recover(record);
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
      await clearNamespace(rejected.userId);
    } catch {
      // The record is unusable either way; a failed delete must not block recovery.
    }
    if (abort.signal.aborted || recoveryUsed) {
      return;
    }
    recoveryUsed = true;
    try {
      const record = await loadOrAcquireRecord();
      if (!abort.signal.aborted && record) {
        await start(record);
      }
    } catch {
      // Fails closed: the session stays stopped until the next page load.
    }
  };

  try {
    const record = await loadOrAcquireRecord();
    if (!abort.signal.aborted && record) {
      await start(record);
    }
  } catch {
    // Establishment failure leaves nothing to stop; the next load retries.
  }

  return { stop };
};

export { establishSession };
export type { MatrixClientLike };
