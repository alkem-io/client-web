import { redactBreadcrumb } from './redaction';
import { attemptSilentSso } from './ssoLogin';
import { type CredentialRecord, clearNamespace, findStoredUserId, loadCredentials } from './storage';
import { refreshMatrixTokens } from './tokenRefresh';

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
  ['idle', new Set<SessionState>(['starting'])],
  ['starting', new Set<SessionState>(['ready', 'failed', 'offline'])],
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
  readonly onRooms?: (rooms: readonly RoomSummary[]) => void;
  readonly loadSdk?: () => Promise<MatrixSdkModule>;
  readonly silentSso?: (expectedLocalpart: string) => Promise<boolean>;
}

interface SessionHandle {
  readonly machine: SessionMachine;
  readonly stop: () => void;
}

const defaultLoadSdk = async (): Promise<MatrixSdkModule> =>
  (await import('matrix-js-sdk')) as unknown as MatrixSdkModule;

const establishSession = async (actorId: string, hooks: EstablishmentHooks = {}): Promise<SessionHandle> => {
  const { onState, onBreadcrumb, onRooms } = hooks;
  const loadSdk = hooks.loadSdk ?? defaultLoadSdk;
  const silentSso = hooks.silentSso ?? attemptSilentSso;

  const machine = createSessionMachine(onBreadcrumb);
  const setState = (to: SessionState): void => {
    if (machine.transition(to)) {
      onState?.(machine.state());
    }
  };
  const inertHandle: SessionHandle = { machine, stop: () => {} };

  setState('starting');

  let record: CredentialRecord | null = null;
  const storedUserId = await findStoredUserId(actorId);
  if (storedUserId) {
    record = (await loadCredentials(storedUserId)).record;
    if (record && !record.userId.toLowerCase().startsWith(`@${actorId.toLowerCase()}:`)) {
      await clearNamespace(storedUserId);
      record = null;
    }
  }

  if (record && record.expiresAt <= Date.now()) {
    try {
      const refreshed = await refreshMatrixTokens(record.homeserverUrl, record.userId, record.refreshToken);
      record = { ...record, accessToken: refreshed.accessToken, refreshToken: refreshed.refreshToken };
    } catch {
      await clearNamespace(record.userId);
      record = null;
    }
  }

  if (!record) {
    const authenticated = await silentSso(actorId.toLowerCase());
    if (authenticated) {
      const freshUserId = await findStoredUserId(actorId);
      record = freshUserId ? (await loadCredentials(freshUserId)).record : null;
    }
  }

  if (!record) {
    setState('failed');
    return inertHandle;
  }

  const credentials = record;
  const sdk = await loadSdk();
  const client = sdk.createClient({
    baseUrl: credentials.homeserverUrl,
    userId: credentials.userId,
    deviceId: credentials.deviceId,
    accessToken: credentials.accessToken,
    refreshToken: credentials.refreshToken,
    logger: silentSdkLogger,
    tokenRefreshFunction: refreshToken =>
      refreshMatrixTokens(credentials.homeserverUrl, credentials.userId, refreshToken),
  });

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

  let recovered = false;
  client.on(sdk.HttpApiEvent.SessionLoggedOut, () => {
    client.stopClient();
    void (async () => {
      await clearNamespace(credentials.userId);
      if (!recovered) {
        recovered = true;
        setState('recovering');
        await establishSession(actorId, hooks);
      }
    })();
  });

  await client.startClient({ initialSyncLimit: 10 });

  return {
    machine,
    stop: () => {
      client.stopClient();
    },
  };
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
