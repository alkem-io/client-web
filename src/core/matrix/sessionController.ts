import {
  notifyMessagingOpened,
  onMessagingOpened,
  registerActiveSession,
  unregisterActiveSession,
} from './activeSession';
import { cleanupMatrixUser } from './logoutCleanup';
import {
  createMultiTabCoordinator,
  type MultiTabCallbacks,
  type MultiTabCoordinator,
  onProfileSignOut,
  withEstablishLock,
} from './multiTab';
import { redactBreadcrumb, redactString } from './redaction';
import { attemptSilentSso, type SilentSsoOutcome } from './ssoLogin';
import {
  type CredentialRecord,
  canEnumerateNamespaces,
  clearNamespace,
  findStoredUserId,
  listStoredUserIds,
  loadCredentials,
} from './storage';
import { refreshMatrixTokens, TokenRefreshError } from './tokenRefresh';

const SESSION_STATES = [
  'idle',
  'starting',
  'ready',
  'syncing',
  'reconnecting',
  'recovering',
  'failed',
  'auth-required',
  'signed-out',
  'offline',
] as const;

type SessionState = (typeof SESSION_STATES)[number];

const TRANSITIONS: ReadonlyMap<SessionState, ReadonlySet<SessionState>> = new Map([
  ['idle', new Set<SessionState>(['starting', 'signed-out'])],
  ['starting', new Set<SessionState>(['ready', 'recovering', 'failed', 'offline', 'signed-out'])],
  ['ready', new Set<SessionState>(['syncing', 'reconnecting', 'recovering', 'failed', 'offline', 'signed-out'])],
  ['syncing', new Set<SessionState>(['ready', 'reconnecting', 'recovering', 'failed', 'offline', 'signed-out'])],
  ['reconnecting', new Set<SessionState>(['ready', 'recovering', 'failed', 'offline', 'signed-out'])],
  ['recovering', new Set<SessionState>(['starting', 'auth-required', 'failed', 'offline', 'signed-out'])],
  ['failed', new Set<SessionState>(['signed-out'])],
  ['auth-required', new Set<SessionState>(['signed-out'])],
  ['signed-out', new Set<SessionState>([])],
  ['offline', new Set<SessionState>(['starting', 'recovering', 'failed', 'signed-out'])],
]);

type BreadcrumbSink = (breadcrumb: { message?: string; data?: Record<string, unknown> }) => void;

type SessionMachine = {
  readonly state: () => SessionState;
  readonly transition: (to: SessionState) => boolean;
};

const createSessionMachine = (onBreadcrumb?: BreadcrumbSink): SessionMachine => {
  let current: SessionState = 'idle';

  return {
    state: () => current,
    transition: (to: SessionState) => {
      const allowed = TRANSITIONS.get(current);
      if (!allowed || !allowed.has(to)) {
        if (onBreadcrumb) {
          onBreadcrumb(
            redactBreadcrumb({
              message: `Matrix session: illegal transition ${current} → ${to}`,
              data: { from: current, to, allowed: allowed ? [...allowed] : [] },
            })
          );
        }
        return false;
      }

      const from = current;
      current = to;

      if (onBreadcrumb) {
        onBreadcrumb(
          redactBreadcrumb({
            message: `Matrix session: ${from} → ${to}`,
            data: { from, to },
          })
        );
      }

      return true;
    },
  };
};

type RoomSummary = {
  readonly roomId: string;
  readonly name: string;
};

type MatrixClientLike = {
  on(event: string, handler: (...args: unknown[]) => void): unknown;
  startClient(opts?: { initialSyncLimit?: number }): Promise<void>;
  stopClient(): void;
  getRooms(): { roomId: string; name: string }[];
};

type SdkLogger = {
  trace(...msg: unknown[]): void;
  debug(...msg: unknown[]): void;
  info(...msg: unknown[]): void;
  warn(...msg: unknown[]): void;
  error(...msg: unknown[]): void;
  log(...msg: unknown[]): void;
  getChild(namespace: string): SdkLogger;
};

const silentSdkLogger: SdkLogger = {
  trace: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  log: () => {},
  getChild: () => silentSdkLogger,
};

type MatrixSdkModule = {
  createClient(opts: {
    baseUrl: string;
    userId: string;
    deviceId: string;
    accessToken: string;
    refreshToken: string;
    logger?: SdkLogger;
    tokenRefreshFunction: (
      refreshToken: string
    ) => Promise<{ accessToken: string; refreshToken?: string; expiry?: Date }>;
  }): MatrixClientLike;
  ClientEvent: { Sync: string };
  HttpApiEvent: { SessionLoggedOut: string };
  /** Thrown from tokenRefreshFunction to make the SDK treat the failure as a logout (emit SessionLoggedOut), not a transient error. */
  TokenRefreshLogoutError: new (
    cause?: Error
  ) => Error;
  SyncState: {
    Prepared: string;
    Syncing: string;
    Error: string;
    Catchup: string;
    Reconnecting: string;
    Stopped: string;
  };
};

type EstablishmentHooks = {
  readonly onState?: (state: SessionState) => void;
  readonly onBreadcrumb?: BreadcrumbSink;
  /** Last-error reporting for diagnostics. Always receives a redacted message. */
  readonly onError?: (redactedMessage: string) => void;
  readonly onRooms?: (rooms: readonly RoomSummary[]) => void;
  readonly loadSdk?: () => Promise<MatrixSdkModule>;
  readonly silentSso?: (expectedLocalpart: string, signal: AbortSignal) => Promise<SilentSsoOutcome>;
  /** Backoff schedule while Synapse is unreachable. One retry per entry. */
  readonly retryDelaysMs?: readonly number[];
  readonly wait?: (ms: number) => Promise<void>;
  readonly createCoordinator?: (userId: string, callbacks: MultiTabCallbacks) => Promise<MultiTabCoordinator>;
  /** A server logout within this long of the last recovery is terminal rather than recovered again. */
  readonly recoveryCooldownMs?: number;
  readonly now?: () => number;
  /** Aborting stops the session at any point, including while it is still being established. */
  readonly signal?: AbortSignal;
};

type SessionHandle = {
  readonly machine: SessionMachine;
  readonly stop: () => void;
};

const defaultLoadSdk = async (): Promise<MatrixSdkModule> =>
  (await import('matrix-js-sdk')) as unknown as MatrixSdkModule;

const DEFAULT_RETRY_DELAYS_MS: readonly number[] = [5_000, 15_000, 45_000];
const DEFAULT_RECOVERY_COOLDOWN_MS = 10 * 60_000;

const establishSession = async (actorId: string, hooks: EstablishmentHooks = {}): Promise<SessionHandle> => {
  const { onState, onBreadcrumb, onRooms } = hooks;
  const loadSdk = hooks.loadSdk ?? defaultLoadSdk;
  const silentSso =
    hooks.silentSso ??
    ((expectedLocalpart: string, signal: AbortSignal) => attemptSilentSso(expectedLocalpart, { signal }));
  const retryDelaysMs = hooks.retryDelaysMs ?? DEFAULT_RETRY_DELAYS_MS;
  const wait = hooks.wait ?? ((ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms)));
  const createCoordinator = hooks.createCoordinator ?? createMultiTabCoordinator;
  const recoveryCooldownMs = hooks.recoveryCooldownMs ?? DEFAULT_RECOVERY_COOLDOWN_MS;
  const now = hooks.now ?? Date.now;

  let coordinator: MultiTabCoordinator | null = null;
  const reportError = (message: unknown): void => {
    const raw = message instanceof Error ? message.message : String(message);
    hooks.onError?.(redactString(raw));
  };
  const machine = createSessionMachine(onBreadcrumb);
  const setState = (to: SessionState): void => {
    if (machine.transition(to)) {
      onState?.(machine.state());
      if (coordinator?.role() === 'leader') {
        coordinator.broadcastState(machine.state());
      }
    }
  };

  let activeClient: MatrixClientLike | null = null;
  let stopped = false;
  // Set by sign-out, which owns the lock release until its cleanup finishes.
  let releaseDeferred = false;
  // Credentials acquired after a sign-out must not outlive it.
  let signedOut = false;
  let lastRecoveryAt: number | null = null;
  let lastFailureReason: string | null = null;
  // Cancels an in-flight silent SSO: its iframe would otherwise go on to
  // persist fresh credentials after sign-out cleanup has already run.
  const ssoAbort = new AbortController();
  const releaseCoordinator = (): void => {
    coordinator?.release();
  };
  const shutdown = (): void => {
    stopped = true;
    ssoAbort.abort();
    activeClient?.stopClient();
    unregisterActiveSession(signOut);
    stopListeningForSignOut();
  };
  const handle: SessionHandle = {
    machine,
    stop: () => {
      shutdown();
      releaseCoordinator();
    },
  };
  const signOut = (): (() => void) => {
    setState('signed-out');
    signedOut = true;
    releaseDeferred = true;
    shutdown();
    return releaseCoordinator;
  };
  registerActiveSession(signOut);
  // Another tab signed out: this one stops too, even mid-acquisition.
  // Ignored once stopped: the signing-out tab hears its own announcement, and
  // must keep its sync lock until its cleanup releases it.
  const stopListeningForSignOut = onProfileSignOut(() => {
    if (stopped) {
      return;
    }
    setState('signed-out');
    signedOut = true;
    handle.stop();
  });
  if (hooks.signal?.aborted) {
    handle.stop();
  }
  hooks.signal?.addEventListener('abort', () => handle.stop());

  // An acquisition still running at sign-out may have stored credentials after
  // the sign-out cleanup listed the namespaces (a refresh landing, an SSO
  // callback winning the race with its frame's removal). Once it has settled,
  // retire whatever it left the way sign-out would have.
  const discardIfSignedOut = async (): Promise<void> => {
    if (!signedOut) {
      return;
    }
    const userId = await findStoredUserId(actorId);
    if (userId) {
      await cleanupMatrixUser(userId);
    }
  };

  // User-switch hygiene: a namespace left behind by a
  // different user (unclean switch, crash before cleanup) is fully retired —
  // bounded server-side logout, local wipe, cross-tab fan-out.
  const purgeStaleNamespaces = async (): Promise<void> => {
    const ownPrefix = `@${actorId.toLowerCase()}:`;
    const userIds = await listStoredUserIds();
    for (const userId of userIds) {
      if (!userId.toLowerCase().startsWith(ownPrefix)) {
        await cleanupMatrixUser(userId);
      }
    }
  };

  const loadRecordForActor = async (): Promise<CredentialRecord | null> => {
    const storedUserId = await findStoredUserId(actorId);
    if (!storedUserId) {
      return null;
    }
    const record = (await loadCredentials(storedUserId)).record;
    if (record && !record.userId.toLowerCase().startsWith(`@${actorId.toLowerCase()}:`)) {
      await clearNamespace(storedUserId);
      return null;
    }
    return record;
  };

  const acquireRecord = async (): Promise<CredentialRecord | null | 'unreachable'> => {
    let record = await loadRecordForActor();

    if (record && record.expiresAt <= Date.now()) {
      if (record.refreshToken) {
        try {
          const refreshed = await refreshMatrixTokens(record.homeserverUrl, record.userId, record.refreshToken);
          record = { ...record, accessToken: refreshed.accessToken, refreshToken: refreshed.refreshToken };
        } catch (error) {
          if (error instanceof TokenRefreshError) {
            // The server rejected the token — the stored pair is dead.
            await clearNamespace(record.userId);
            record = null;
          } else {
            // Network failure: the tokens may be perfectly valid — never destroy them.
            return 'unreachable';
          }
        }
      } else {
        await clearNamespace(record.userId);
        record = null;
      }
    }

    if (!record) {
      const outcome = await silentSso(actorId.toLowerCase(), ssoAbort.signal);
      if (outcome === 'unreachable') {
        return 'unreachable';
      }
      if (outcome === 'authenticated') {
        record = await loadRecordForActor();
      } else {
        lastFailureReason = `silent SSO ${outcome}`;
      }
    }

    return record;
  };

  // Synapse unreachable → offline with bounded exponential backoff,
  // one retry per configured delay, never an auth loop.
  const acquireWithBackoff = async (): Promise<CredentialRecord | null | 'unreachable'> => {
    for (let attempt = 0; ; attempt++) {
      const result = await acquireRecord();
      if (stopped) {
        return null;
      }
      if (result !== 'unreachable') {
        return result;
      }
      setState('offline');
      if (attempt >= retryDelaysMs.length) {
        return 'unreachable';
      }
      await wait(retryDelaysMs[attempt]);
      if (stopped) {
        return null;
      }
      setState('starting');
    }
  };

  const startWithRecord = async (credentials: CredentialRecord): Promise<void> => {
    const sdk = await loadSdk();
    const client = sdk.createClient({
      baseUrl: credentials.homeserverUrl,
      userId: credentials.userId,
      deviceId: credentials.deviceId,
      accessToken: credentials.accessToken,
      refreshToken: credentials.refreshToken,
      logger: silentSdkLogger,
      // The SDK classifies a thrown refresh error as transient (keep retrying) unless it is
      // its own TokenRefreshLogoutError — only then does it emit SessionLoggedOut, which is
      // what drives recovery. A server verdict must therefore be translated;
      // a network failure stays untranslated so the sync loop keeps retrying.
      tokenRefreshFunction: async refreshToken => {
        try {
          return await refreshMatrixTokens(credentials.homeserverUrl, credentials.userId, refreshToken);
        } catch (error) {
          if (error instanceof TokenRefreshError) {
            throw new sdk.TokenRefreshLogoutError(error);
          }
          throw error;
        }
      },
    });
    activeClient = client;

    client.on(sdk.ClientEvent.Sync, (...args) => {
      const syncState = args[0];
      if (syncState === sdk.SyncState.Prepared) {
        if (machine.state() === 'offline') {
          setState('starting');
        }
        setState('ready');
        onRooms?.(client.getRooms().map(room => ({ roomId: room.roomId, name: room.name })));
        return;
      }
      if (syncState === sdk.SyncState.Syncing) {
        if (machine.state() === 'ready') {
          setState('syncing');
        } else if (machine.state() === 'reconnecting') {
          setState('ready');
        }
        return;
      }
      if (syncState === sdk.SyncState.Error || syncState === sdk.SyncState.Catchup) {
        if (machine.state() === 'starting') {
          setState('offline');
        } else if (machine.state() === 'ready' || machine.state() === 'syncing') {
          setState('reconnecting');
        }
      }
    });

    // The SDK emits this once per request that failed on the dead token; only
    // the first one for this client may start a recovery.
    client.on(sdk.HttpApiEvent.SessionLoggedOut, () => {
      if (activeClient !== client) {
        return;
      }
      activeClient = null;
      client.stopClient();
      void recover(credentials.userId);
    });

    await client.startClient({ initialSyncLimit: 10 });
    if (stopped) {
      client.stopClient();
    }
  };

  // At most one recovery per cooldown window: a session that dies again right
  // after a fresh silent SSO would just loop, so that repeat is terminal. One
  // that lived past the window (the server's session cap, an overnight sleep)
  // is a new failure and gets its own recovery.
  const recover = async (staleUserId: string): Promise<void> => {
    try {
      await clearNamespace(staleUserId);
      if (stopped) {
        return;
      }
      if (lastRecoveryAt !== null && now() - lastRecoveryAt < recoveryCooldownMs) {
        // The client is already stopped, so a machine still reporting a live
        // state would be lying — fail closed wherever the table still allows it.
        if (TRANSITIONS.get(machine.state())?.has('failed')) {
          reportError('session closed by the server again after recovery');
          setState('failed');
        }
        return;
      }
      lastRecoveryAt = now();
      setState('recovering');
      const record = await withEstablishLock(actorId, acquireWithBackoff);
      if (stopped) {
        await discardIfSignedOut();
        return;
      }
      if (record === 'unreachable') {
        setState('failed');
        return;
      }
      if (!record) {
        // Promptless SSO could not complete: Kratos is gone (auth-required) —
        // unless backoff cycles moved the machine off `recovering`, where the
        // table has no auth-required edge and failed is the fail-closed exit.
        setState(machine.state() === 'recovering' ? 'auth-required' : 'failed');
        return;
      }
      if (machine.state() !== 'starting') {
        setState('starting');
      }
      await startWithRecord(record);
    } catch (error) {
      reportError(error);
      setState('failed');
    }
  };

  // A promoted tab resumes from the shared stored
  // credentials (possibly rotated by the previous leader) — never a re-login.
  const becomeLeader = async (): Promise<void> => {
    if (stopped) {
      return;
    }
    try {
      // Resumes from the stored pair when it is usable; as the leader now, this
      // tab is also the one entitled to refresh it or, if the previous leader
      // could not persist it, to re-establish.
      const fresh = await withEstablishLock(actorId, acquireWithBackoff);
      if (stopped) {
        await discardIfSignedOut();
        return;
      }
      if (!fresh || fresh === 'unreachable') {
        setState('failed');
        releaseCoordinator();
        return;
      }
      coordinator?.announceLeadership(machine.state());
      await startWithRecord(fresh);
    } catch {
      setState('failed');
      releaseCoordinator();
    }
  };

  const coordinatorCallbacks: MultiTabCallbacks = {
    onPromoted: () => {
      void becomeLeader();
    },
    onRemoteState: state => {
      if (coordinator?.role() !== 'leader' && (SESSION_STATES as readonly string[]).includes(state)) {
        onState?.(state as SessionState);
      }
    },
    onRemoteLogout: () => {
      setState('signed-out');
      handle.stop();
    },
  };

  // Only the leader may touch credentials: a refresh rotates the single-use
  // refresh token under the running leader, and a silent SSO mints a device.
  // With stored credentials the election runs first and a follower stops here;
  // without them (nobody can be leading) the SSO runs, then the election.
  const electAndAcquire = async (): Promise<CredentialRecord | null | 'unreachable' | 'follower'> => {
    const storedUserId = await findStoredUserId(actorId);
    if (storedUserId) {
      coordinator = await createCoordinator(storedUserId, coordinatorCallbacks);
      if (coordinator.role() !== 'leader') {
        return 'follower';
      }
    }
    const record = await acquireWithBackoff();
    if (stopped || !record || record === 'unreachable') {
      return record;
    }
    if (coordinator && storedUserId !== record.userId) {
      coordinator.release();
      coordinator = null;
    }
    if (!coordinator) {
      coordinator = await createCoordinator(record.userId, coordinatorCallbacks);
      if (coordinator.role() !== 'leader') {
        return 'follower';
      }
    }
    return record;
  };

  try {
    setState('starting');
    if (!canEnumerateNamespaces()) {
      reportError('establishment failed: browser cannot list IndexedDB databases');
      setState('failed');
      return handle;
    }
    await purgeStaleNamespaces();
    const record = await withEstablishLock(actorId, electAndAcquire);
    if (stopped) {
      await discardIfSignedOut();
      if (!releaseDeferred) {
        releaseCoordinator();
      }
      return handle;
    }
    if (record === 'follower') {
      return handle;
    }
    if (!record || record === 'unreachable') {
      releaseCoordinator();
      reportError(
        record === 'unreachable'
          ? 'establishment failed: homeserver unreachable'
          : `establishment failed: ${lastFailureReason ?? 'no credentials'}`
      );
      setState('failed');
      return handle;
    }
    await startWithRecord(record);
  } catch (error) {
    if (!releaseDeferred) {
      releaseCoordinator();
    }
    reportError(error);
    setState('failed');
  }

  return handle;
};

export {
  createSessionMachine,
  establishSession,
  notifyMessagingOpened,
  onMessagingOpened,
  SESSION_STATES,
  TRANSITIONS,
};
export type {
  SessionState,
  SessionMachine,
  BreadcrumbSink,
  EstablishmentHooks,
  SessionHandle,
  RoomSummary,
  MatrixSdkModule,
  MatrixClientLike,
};
