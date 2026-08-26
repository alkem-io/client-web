import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  type BreadcrumbSink,
  createSessionMachine,
  establishSession,
  type MatrixClientLike,
  type MatrixSdkModule,
  type SessionState,
  TRANSITIONS,
} from './sessionController';
import { clearNamespace, storeCredentials } from './storage';

const allStates: readonly SessionState[] = [
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
];

describe('sessionController', () => {
  it('starts in idle', () => {
    const m = createSessionMachine();
    expect(m.state()).toBe('idle');
  });

  describe('E3 transition table — every legal row', () => {
    const cases: { from: SessionState; to: SessionState }[] = [];

    for (const [from, targets] of TRANSITIONS) {
      for (const to of targets) {
        cases.push({ from, to });
      }
    }

    for (const { from, to } of cases) {
      it(`${from} → ${to}`, () => {
        const sink = vi.fn<BreadcrumbSink>();
        const m = createSessionMachine(sink);

        if (from !== 'idle') {
          driveToState(m, from);
        }

        expect(m.transition(to)).toBe(true);
        expect(m.state()).toBe(to);
      });
    }
  });

  describe('illegal transitions rejected', () => {
    it('idle → ready is illegal', () => {
      const m = createSessionMachine();
      expect(m.transition('ready')).toBe(false);
      expect(m.state()).toBe('idle');
    });

    it('signed-out is a terminal state', () => {
      const m = createSessionMachine();
      m.transition('starting');
      m.transition('ready');
      m.transition('signed-out');
      expect(m.transition('idle')).toBe(false);
      expect(m.transition('starting')).toBe(false);
      expect(m.state()).toBe('signed-out');
    });

    it('starting → syncing is illegal (must pass through ready first)', () => {
      const m = createSessionMachine();
      m.transition('starting');
      expect(m.transition('syncing')).toBe(false);
      expect(m.state()).toBe('starting');
    });
  });

  describe('breadcrumb emission', () => {
    it('emits a breadcrumb on legal transition', () => {
      const sink = vi.fn<BreadcrumbSink>();
      const m = createSessionMachine(sink);

      m.transition('starting');

      expect(sink).toHaveBeenCalledOnce();
      expect(sink).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Matrix session: idle → starting',
          data: { from: 'idle', to: 'starting' },
        })
      );
    });

    it('emits a breadcrumb on illegal transition', () => {
      const sink = vi.fn<BreadcrumbSink>();
      const m = createSessionMachine(sink);

      m.transition('ready');

      expect(sink).toHaveBeenCalledOnce();
      expect(sink).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('illegal'),
        })
      );
    });

    it('works without a sink (no throw)', () => {
      const m = createSessionMachine();
      expect(() => m.transition('starting')).not.toThrow();
      expect(() => m.transition('ready')).not.toThrow();
    });
  });

  describe('transition table completeness', () => {
    it('every frozen state has a row in TRANSITIONS', () => {
      for (const state of allStates) {
        expect(TRANSITIONS.has(state)).toBe(true);
      }
    });
  });
});

function driveToState(m: { transition: (to: SessionState) => boolean }, target: SessionState): void {
  const paths: Record<string, SessionState[]> = {
    idle: [],
    starting: ['starting'],
    ready: ['starting', 'ready'],
    syncing: ['starting', 'ready', 'syncing'],
    reconnecting: ['starting', 'ready', 'syncing', 'reconnecting'],
    recovering: ['starting', 'ready', 'recovering'],
    failed: ['starting', 'failed'],
    'auth-required': ['starting', 'ready', 'recovering', 'auth-required'],
    'signed-out': ['starting', 'ready', 'signed-out'],
    offline: ['starting', 'offline'],
  };

  const path = paths[target];
  if (!path) {
    throw new Error(`No path to ${target}`);
  }

  for (const step of path) {
    const ok = m.transition(step);
    if (!ok) {
      throw new Error(`Failed to drive to ${target}: stuck at ${step}`);
    }
  }
}

const HOMESERVER = 'https://matrix.dev-alkem.io';

const makeSdkMock = () => {
  const handlers = new Map<string, (...args: unknown[]) => void>();
  const client: MatrixClientLike = {
    on: (event, handler) => {
      handlers.set(event, handler);
      return client;
    },
    startClient: vi.fn(async () => {}),
    stopClient: vi.fn(),
    getRooms: () => [{ roomId: '!room-a:hs', name: 'Room A' }],
  };
  const createClient = vi.fn((_opts: Parameters<MatrixSdkModule['createClient']>[0]) => client);
  const sdk: MatrixSdkModule = {
    createClient,
    ClientEvent: { Sync: 'sync' },
    HttpApiEvent: { SessionLoggedOut: 'Session.logged_out' },
    SyncState: {
      Prepared: 'PREPARED',
      Syncing: 'SYNCING',
      Error: 'ERROR',
      Catchup: 'CATCHUP',
      Reconnecting: 'RECONNECTING',
      Stopped: 'STOPPED',
    },
  };
  return { sdk, client, createClient, handlers };
};

describe('establishSession', () => {
  const ACTOR = 'abc-123';
  const USER_ID = `@${ACTOR}:matrix.dev-alkem.io`;

  const seedRecord = (overrides: Partial<Parameters<typeof storeCredentials>[0]> = {}) =>
    storeCredentials({
      userId: USER_ID,
      deviceId: 'DEV1',
      accessToken: 'syt_stored_access',
      refreshToken: 'syr_stored_refresh',
      expiresAt: Date.now() + 60_000,
      homeserverUrl: HOMESERVER,
      storedAt: Date.now(),
      ...overrides,
    });

  afterEach(async () => {
    vi.restoreAllMocks();
    await clearNamespace(USER_ID);
  });

  it('attempts silent SSO when no stored record exists and fails closed — SDK never loaded', async () => {
    const silentSso = vi.fn(async () => false);
    const loadSdk = vi.fn();
    const states: SessionState[] = [];

    await establishSession('actor-without-record', { silentSso, loadSdk, onState: s => states.push(s) });

    expect(silentSso).toHaveBeenCalledOnce();
    expect(loadSdk).not.toHaveBeenCalled();
    expect(states).toEqual(['starting', 'failed']);
  });

  it('resumes after a successful silent SSO seeds fresh credentials', async () => {
    const silentSso = vi.fn(async () => {
      await seedRecord();
      return true;
    });
    const { sdk, createClient } = makeSdkMock();

    await establishSession(ACTOR, { loadSdk: async () => sdk, silentSso });

    expect(silentSso).toHaveBeenCalledOnce();
    expect(createClient).toHaveBeenCalledOnce();
    const opts = createClient.mock.calls[0][0];
    expect(opts.accessToken).toBe('syt_stored_access');
  });

  it('resumes from a valid stored record without any SSO round-trip', async () => {
    await seedRecord();
    const { sdk, client, createClient, handlers } = makeSdkMock();
    const silentSso = vi.fn(async () => false);
    const states: SessionState[] = [];
    const rooms: unknown[] = [];

    await establishSession(ACTOR, {
      loadSdk: async () => sdk,
      silentSso,
      onState: s => states.push(s),
      onRooms: r => rooms.push(...r),
    });

    expect(silentSso).not.toHaveBeenCalled();
    expect(createClient).toHaveBeenCalledOnce();
    const opts = createClient.mock.calls[0][0];
    expect(opts.baseUrl).toBe(HOMESERVER);
    expect(opts.userId).toBe(USER_ID);
    expect(opts.deviceId).toBe('DEV1');
    expect(opts.accessToken).toBe('syt_stored_access');
    expect(client.startClient).toHaveBeenCalledOnce();

    handlers.get('sync')?.('PREPARED');
    expect(states).toEqual(['starting', 'ready']);
    expect(rooms).toEqual([{ roomId: '!room-a:hs', name: 'Room A' }]);
  });

  it('refreshes an expired record before resuming', async () => {
    await seedRecord({ expiresAt: Date.now() - 1000 });
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({ access_token: 'syt_rotated', refresh_token: 'syr_rotated', expires_in_ms: 60_000 }),
        { status: 200 }
      )
    );
    const { sdk, createClient } = makeSdkMock();
    const silentSso = vi.fn(async () => false);

    await establishSession(ACTOR, { loadSdk: async () => sdk, silentSso });

    expect(silentSso).not.toHaveBeenCalled();
    const opts = createClient.mock.calls[0][0];
    expect(opts.accessToken).toBe('syt_rotated');
    expect(opts.refreshToken).toBe('syr_rotated');
  });

  it('clears the namespace and attempts silent SSO when refresh of an expired record fails', async () => {
    await seedRecord({ expiresAt: Date.now() - 1000 });
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('', { status: 401 }));
    const silentSso = vi.fn(async () => false);
    const loadSdk = vi.fn();
    const states: SessionState[] = [];

    await establishSession(ACTOR, { silentSso, loadSdk, onState: s => states.push(s) });

    expect(silentSso).toHaveBeenCalledOnce();
    expect(loadSdk).not.toHaveBeenCalled();
    expect(states).toEqual(['starting', 'failed']);
  });

  it('maps sync errors during establishment to offline', async () => {
    await seedRecord();
    const { sdk, handlers } = makeSdkMock();
    const states: SessionState[] = [];

    await establishSession(ACTOR, {
      loadSdk: async () => sdk,
      silentSso: vi.fn(async () => false),
      onState: s => states.push(s),
    });

    handlers.get('sync')?.('ERROR');
    expect(states).toEqual(['starting', 'offline']);
  });
});
