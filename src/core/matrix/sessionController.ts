import { registerActiveSession, unregisterActiveSession } from './activeSession';
import { cleanupMatrixUser } from './logoutCleanup';
import { createMultiTabCoordinator, type MultiTabCallbacks, type MultiTabCoordinator } from './multiTab';
import { redactBreadcrumb, redactString } from './redaction';
import { attemptSilentSso, type SilentSsoOutcome } from './ssoLogin';
import { type CredentialRecord, clearNamespace, findStoredUserId, listStoredUserIds, loadCredentials } from './storage';
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
  ['starting', new Set<SessionState>(['ready', 'failed', 'offline', 'signed-out'])],
  ['ready', new Set<SessionState>(['syncing', 'recovering', 'failed', 'offline', 'signed-out'])],
  ['syncing', new Set<SessionState>(['ready', 'reconnecting', 'recovering', 'failed', 'offline', 'signed-out'])],
  ['reconnecting', new Set<SessionState>(['ready', 'recovering', 'failed', 'offline', 'signed-out'])],
  ['recovering', new Set<SessionState>(['starting', 'auth-required', 'failed', 'offline', 'signed-out'])],
  ['failed', new Set<SessionState>(['signed-out'])],
  ['auth-required', new Set<SessionState>(['signed-out'])],
  ['signed-out', new Set<SessionState>([])],
  ['offline', new Set<SessionState>(['starting', 'recovering', 'failed', 'signed-out'])],
]);

type BreadcrumbSink = (breadcrumb: { message?: string; data?: Record<string, unknown> }) => void;

interface SessionMachine {
  readonly state: () => SessionState;
  readonly transition: (to: SessionState) => boolean;
}

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

let messagingOpened = false;
const activationListeners = new Set<() => void>();

const notifyMessagingOpened = (): void => {
  if (messagingOpened) {
    return;
  }
  messagingOpened = true;
  for (const listener of activationListeners) {
    listener();
  }
  activationListeners.clear();
};

const onMessagingOpened = (listener: () => void): (() => void) => {
  if (messagingOpened) {
    listener();
    return () => {};
  }
  activationListeners.add(listener);
  return () => {
    activationListeners.delete(listener);
  };
};

interface RoomSummary {
  readonly roomId: string;
  readonly name: string;
}

interface MatrixClientLike {
  on(event: string, handler: (...args: unknown[]) => void): unknown;
  startClient(opts?: { initialSyncLimit?: number }): Promise<void>;
  stopClient(): void;
  getRooms(): { roomId: string; name: string }[];
}

interface SdkLogger {
  trace(...msg: unknown[]): void;
  debug(...msg: unknown[]): void;
  info(...msg: unknown[]): void;
  warn(...msg: unknown[]): void;
  error(...msg: unknown[]): void;
  log(...msg: unknown[]): void;
  getChild(namespace: string): SdkLogger;
}

const silentSdkLogger: SdkLogger = {
  trace: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  log: () => {},
  getChild: () => silentSdkLogger,
};

interface MatrixSdkModule {
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
}

interface EstablishmentHooks {
  readonly onState?: (state: SessionState) => void;
  readonly onBreadcrumb?: BreadcrumbSink;
  /** Last-error reporting for diagnostics (FR-011). Always receives a redacted message. */
  readonly onError?: (redactedMessage: string) => void;
  readonly onRooms?: (rooms: readonly RoomSummary[]) => void;
  readonly loadSdk?: () => Promise<MatrixSdkModule>;
  readonly silentSso?: (expectedLocalpart: string) => Promise<SilentSsoOutcome>;
  /** Backoff schedule for the Synapse-unreachable row (contract §6). One retry per entry. */
  readonly retryDelaysMs?: readonly number[];
  readonly wait?: (ms: number) => Promise<void>;
  readonly createCoordinator?: (userId: string, callbacks: MultiTabCallbacks) => Promise<MultiTabCoordinator>;
}

interface SessionHandle {
  readonly machine: SessionMachine;
  readonly stop: () => void;
}

const defaultLoadSdk = async (): Promise<MatrixSdkModule> =>
  (await import('matrix-js-sdk')) as unknown as MatrixSdkModule;

const DEFAULT_RETRY_DELAYS_MS: readonly number[] = [5_000, 15_000, 45_000];

const establishSession = async (actorId: string, hooks: EstablishmentHooks = {}): Promise<SessionHandle> => {
  const { onState, onBreadcrumb, onRooms } = hooks;
  const loadSdk = hooks.loadSdk ?? defaultLoadSdk;
  const silentSso = hooks.silentSso ?? attemptSilentSso;
  const retryDelaysMs = hooks.retryDelaysMs ?? DEFAULT_RETRY_DELAYS_MS;
  const wait = hooks.wait ?? ((ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms)));
  const createCoordinator = hooks.createCoordinator ?? createMultiTabCoordinator;

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
  let recovered = false;
  let lastFailureReason: string | null = null;
  const handle: SessionHandle = {
    machine,
    stop: () => {
      stopped = true;
      activeClient?.stopClient();
      coordinator?.release();
      unregisterActiveSession(signOut);
    },
  };
  const signOut = (): void => {
    setState('signed-out');
    handle.stop();
  };
  registerActiveSession(signOut);

  // User-switch hygiene (contract §4, P-08b): a namespace left behind by a
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
      const outcome = await silentSso(actorId.toLowerCase());
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

  // Contract §6: Synapse unreachable → offline with bounded exponential backoff,
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
      // what drives recovery (contract §6). A server verdict must therefore be translated;
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

    client.on(sdk.HttpApiEvent.SessionLoggedOut, () => {
      client.stopClient();
      if (activeClient === client) {
        activeClient = null;
      }
      void recover(credentials.userId);
    });

    await client.startClient({ initialSyncLimit: 10 });
    if (stopped) {
      client.stopClient();
    }
  };

  // One recovery attempt per establishment: a session that dies again after a
  // fresh silent SSO would just loop, so it ends in auth-required instead.
  const recover = async (staleUserId: string): Promise<void> => {
    try {
      await clearNamespace(staleUserId);
      if (stopped || recovered) {
        return;
      }
      recovered = true;
      setState('recovering');
      const record = await acquireWithBackoff();
      if (stopped) {
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

  // Contract §5 invariant 3: a promoted tab resumes from the shared stored
  // credentials (possibly rotated by the previous leader) — never a re-login.
  const becomeLeader = async (): Promise<void> => {
    if (stopped) {
      return;
    }
    try {
      const fresh = await loadRecordForActor();
      if (stopped) {
        return;
      }
      if (!fresh) {
        setState('failed');
        return;
      }
      coordinator?.announceLeadership(machine.state());
      await startWithRecord(fresh);
    } catch {
      setState('failed');
    }
  };

  try {
    setState('starting');
    await purgeStaleNamespaces();
    const record = await acquireWithBackoff();
    if (stopped) {
      return handle;
    }
    if (!record || record === 'unreachable') {
      reportError(
        record === 'unreachable'
          ? 'establishment failed: homeserver unreachable'
          : `establishment failed: ${lastFailureReason ?? 'no credentials'}`
      );
      setState('failed');
      return handle;
    }

    coordinator = await createCoordinator(record.userId, {
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
    });
    if (stopped) {
      coordinator.release();
      return handle;
    }
    if (coordinator.role() === 'leader') {
      await startWithRecord(record);
    }
  } catch (error) {
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
