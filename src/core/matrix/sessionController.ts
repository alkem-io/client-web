import type { MatrixClient } from 'matrix-js-sdk';
import { setActiveClient, setSessionEstablishing } from './activeClient';
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

// The loglevel-backed shape behind matrix-js-sdk's exported root logger; its
// public Logger type does not expose these.
type SdkRootLogger = {
  methodFactory: (methodName: string, level: number, loggerName: string | symbol) => (...msg: unknown[]) => void;
  rebuild(): void;
};

const SILENCED_LOG_METHODS = new Set(['trace', 'debug', 'info', 'log']);
const discard = (): void => {};
let sdkLoggingQuieted = false;

// The SDK resets every logger it creates to DEBUG, so a level cannot keep its
// per-request and per-sync chatter out of the console. Every logger inherits the
// root's methodFactory when created, including the per-room ones made after the
// client starts, so swapping the factory on the root mutes them all while
// warnings and errors still reach the console.
const quietSdkLogging = (root: SdkRootLogger): void => {
  if (sdkLoggingQuieted) {
    return;
  }
  sdkLoggingQuieted = true;
  const consoleFactory = root.methodFactory;
  root.methodFactory = (methodName, level, loggerName) =>
    SILENCED_LOG_METHODS.has(methodName) ? discard : consoleFactory(methodName, level, loggerName);
  root.rebuild();
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
    const outcome = await attemptSilentSso(actorId, { signal: abort.signal, platformOrigin });
    return outcome === 'authenticated' ? loadActorCredentials(actorId) : null;
  };

  const start = async (record: CredentialRecord): Promise<void> => {
    const [sdk, sdkLogger] = await Promise.all([
      import('matrix-js-sdk') as unknown as Promise<{
        createClient(opts: {
          baseUrl: string;
          userId: string;
          deviceId: string;
          accessToken: string;
        }): MatrixClientLike;
      }>,
      import('matrix-js-sdk/lib/logger'),
    ]);
    quietSdkLogging(sdkLogger.logger as unknown as SdkRootLogger);
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
