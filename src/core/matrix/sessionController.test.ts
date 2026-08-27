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
    const silentSso = vi.fn(async () => 'timeout' as const);
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
      return 'authenticated' as const;
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
    const silentSso = vi.fn(async () => 'timeout' as const);
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
    const silentSso = vi.fn(async () => 'timeout' as const);

    await establishSession(ACTOR, { loadSdk: async () => sdk, silentSso });

    expect(silentSso).not.toHaveBeenCalled();
    const opts = createClient.mock.calls[0][0];
    expect(opts.accessToken).toBe('syt_rotated');
    expect(opts.refreshToken).toBe('syr_rotated');
  });

  it('clears the namespace and attempts silent SSO when refresh of an expired record fails', async () => {
    await seedRecord({ expiresAt: Date.now() - 1000 });
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('', { status: 401 }));
    const silentSso = vi.fn(async () => 'timeout' as const);
    const loadSdk = vi.fn();
    const states: SessionState[] = [];

    await establishSession(ACTOR, { silentSso, loadSdk, onState: s => states.push(s) });

    expect(silentSso).toHaveBeenCalledOnce();
    expect(loadSdk).not.toHaveBeenCalled();
    expect(states).toEqual(['starting', 'failed']);
  });

  it('does not call refresh for an expired record without a refresh token — clears and tries silent SSO', async () => {
    await seedRecord({ expiresAt: Date.now() - 1000, refreshToken: '' });
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const silentSso = vi.fn(async () => 'timeout' as const);
    const loadSdk = vi.fn();

    await establishSession(ACTOR, { silentSso, loadSdk });

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(silentSso).toHaveBeenCalledOnce();
  });

  it('reports a redacted error through onError when establishment fails', async () => {
    const silentSso = vi.fn(async () => {
      throw new Error('exchange failed: access_token=syt_leaky rejected');
    });
    const errors: string[] = [];

    await establishSession('actor-without-record', { silentSso, onError: message => errors.push(message) });

    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('[REDACTED]');
    expect(errors[0]).not.toContain('syt_leaky');
  });

  it('reports a descriptive error through onError when silent SSO cannot complete', async () => {
    const errors: string[] = [];

    await establishSession('actor-without-record', {
      silentSso: vi.fn(async () => 'timeout' as const),
      onError: message => errors.push(message),
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('timeout');
  });

  it('resolves to failed instead of rejecting when silent SSO throws', async () => {
    const silentSso = vi.fn(async () => {
      throw new Error('network down');
    });
    const states: SessionState[] = [];

    const handle = await establishSession('actor-without-record', { silentSso, onState: s => states.push(s) });

    expect(states).toEqual(['starting', 'failed']);
    expect(handle.machine.state()).toBe('failed');
  });

  it('stop() stops the active client', async () => {
    await seedRecord();
    const { sdk, client } = makeSdkMock();

    const handle = await establishSession(ACTOR, {
      loadSdk: async () => sdk,
      silentSso: vi.fn(async () => 'timeout' as const),
    });
    handle.stop();

    expect(client.stopClient).toHaveBeenCalled();
  });

  it('recovers exactly once after SessionLoggedOut, landing in auth-required when silent SSO fails', async () => {
    await seedRecord();
    const { sdk, handlers } = makeSdkMock();
    const silentSso = vi.fn(async () => 'timeout' as const);
    const states: SessionState[] = [];

    await establishSession(ACTOR, { loadSdk: async () => sdk, silentSso, onState: s => states.push(s) });

    handlers.get('sync')?.('PREPARED');
    handlers.get('Session.logged_out')?.();

    await vi.waitFor(() => {
      expect(states).toContain('auth-required');
    });
    expect(silentSso).toHaveBeenCalledOnce();

    handlers.get('Session.logged_out')?.();
    await new Promise(resolve => setTimeout(resolve, 20));

    expect(silentSso).toHaveBeenCalledOnce();
    expect(states).toEqual(['starting', 'ready', 'recovering', 'auth-required']);
  });

  it('maps sync errors during establishment to offline', async () => {
    await seedRecord();
    const { sdk, handlers } = makeSdkMock();
    const states: SessionState[] = [];

    await establishSession(ACTOR, {
      loadSdk: async () => sdk,
      silentSso: vi.fn(async () => 'timeout' as const),
      onState: s => states.push(s),
    });

    handlers.get('sync')?.('ERROR');
    expect(states).toEqual(['starting', 'offline']);
  });

  describe('single sync ownership (contract §5)', () => {
    type CoordinatorCallbacks = {
      onPromoted?: () => void;
      onRemoteState?: (state: string) => void;
      onRemoteLogout?: () => void;
    };

    const makeCoordinatorMock = (initialRole: 'leader' | 'follower') => {
      let role = initialRole;
      const captured: { callbacks?: CoordinatorCallbacks } = {};
      const announceLeadership = vi.fn();
      const broadcastState = vi.fn();
      const release = vi.fn();
      const coordinator = {
        role: () => role,
        announceLeadership,
        broadcastState,
        release,
      };
      const createCoordinator = vi.fn(async (_userId: string, callbacks: CoordinatorCallbacks) => {
        captured.callbacks = callbacks;
        return coordinator;
      });
      const promote = () => {
        role = 'leader';
        captured.callbacks?.onPromoted?.();
      };
      return { coordinator, createCoordinator, captured, promote, announceLeadership, broadcastState, release };
    };

    it('a follower never constructs a client and mirrors the remote leader state', async () => {
      await seedRecord();
      const { createCoordinator, captured } = makeCoordinatorMock('follower');
      const loadSdk = vi.fn();
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      const states: SessionState[] = [];

      await establishSession(ACTOR, {
        loadSdk,
        silentSso: vi.fn(async () => 'timeout' as const),
        onState: s => states.push(s),
        createCoordinator,
      });

      expect(loadSdk).not.toHaveBeenCalled();
      expect(fetchSpy).not.toHaveBeenCalled();

      captured.callbacks?.onRemoteState?.('syncing');
      expect(states[states.length - 1]).toBe('syncing');
    });

    it('promotion resumes from the shared stored credentials with no /login round-trip', async () => {
      await seedRecord();
      const { createCoordinator, promote, announceLeadership } = makeCoordinatorMock('follower');
      const { sdk, createClient } = makeSdkMock();
      const silentSso = vi.fn(async () => 'timeout' as const);
      const fetchSpy = vi.spyOn(globalThis, 'fetch');

      await establishSession(ACTOR, { loadSdk: async () => sdk, silentSso, createCoordinator });
      expect(createClient).not.toHaveBeenCalled();

      promote();

      await vi.waitFor(() => {
        expect(createClient).toHaveBeenCalledOnce();
      });
      expect(createClient.mock.calls[0][0].accessToken).toBe('syt_stored_access');
      expect(silentSso).not.toHaveBeenCalled();
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(announceLeadership).toHaveBeenCalled();
    });

    it('the leader broadcasts every lifecycle transition', async () => {
      await seedRecord();
      const { createCoordinator, broadcastState } = makeCoordinatorMock('leader');
      const { sdk, handlers } = makeSdkMock();

      await establishSession(ACTOR, {
        loadSdk: async () => sdk,
        silentSso: vi.fn(async () => 'timeout' as const),
        createCoordinator,
      });

      handlers.get('sync')?.('PREPARED');
      handlers.get('sync')?.('SYNCING');

      expect(broadcastState.mock.calls.map(call => call[0])).toEqual(['ready', 'syncing']);
    });

    it('a remote logout stops the tab and lands it in signed-out', async () => {
      await seedRecord();
      const { createCoordinator, captured } = makeCoordinatorMock('follower');
      const states: SessionState[] = [];

      const handle = await establishSession(ACTOR, {
        loadSdk: vi.fn(),
        silentSso: vi.fn(async () => 'timeout' as const),
        onState: s => states.push(s),
        createCoordinator,
      });

      captured.callbacks?.onRemoteLogout?.();

      expect(handle.machine.state()).toBe('signed-out');
      expect(states[states.length - 1]).toBe('signed-out');
    });

    it('stop() releases the coordinator lock', async () => {
      await seedRecord();
      const { createCoordinator, release } = makeCoordinatorMock('leader');
      const { sdk } = makeSdkMock();

      const handle = await establishSession(ACTOR, {
        loadSdk: async () => sdk,
        silentSso: vi.fn(async () => 'timeout' as const),
        createCoordinator,
      });
      handle.stop();

      expect(release).toHaveBeenCalled();
    });
  });

  describe('user switch & sign-out (contract §4)', () => {
    const OTHER_USER_ID = '@stale-actor:matrix.dev-alkem.io';

    afterEach(async () => {
      await clearNamespace(OTHER_USER_ID);
    });

    it("purges another user's stale namespace at establishment — full §4 sequence, then own session resumes", async () => {
      await storeCredentials({
        userId: OTHER_USER_ID,
        deviceId: 'DEV_STALE',
        accessToken: 'syt_stale_access',
        refreshToken: 'syr_stale_refresh',
        expiresAt: Date.now() + 60_000,
        homeserverUrl: HOMESERVER,
        storedAt: Date.now(),
      });
      await seedRecord();
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
      const { sdk, createClient } = makeSdkMock();

      await establishSession(ACTOR, { loadSdk: async () => sdk, silentSso: vi.fn(async () => 'timeout' as const) });

      const [url, init] = fetchSpy.mock.calls[0];
      expect(url).toBe(`${HOMESERVER}/_matrix/client/v3/logout`);
      expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer syt_stale_access');

      const { loadCredentials } = await import('./storage');
      expect((await loadCredentials(OTHER_USER_ID)).record).toBe(null);
      expect(createClient.mock.calls[0][0].userId).toBe(USER_ID);
    });

    it('stopActiveSession transitions to signed-out and stops the client', async () => {
      await seedRecord();
      const { sdk, client, handlers } = makeSdkMock();
      const states: SessionState[] = [];

      const handle = await establishSession(ACTOR, {
        loadSdk: async () => sdk,
        silentSso: vi.fn(async () => 'timeout' as const),
        onState: s => states.push(s),
      });
      handlers.get('sync')?.('PREPARED');

      const { stopActiveSession } = await import('./activeSession');
      stopActiveSession();

      expect(states).toEqual(['starting', 'ready', 'signed-out']);
      expect(handle.machine.state()).toBe('signed-out');
      expect(client.stopClient).toHaveBeenCalled();
    });
  });

  describe('contract §6 fail-closed rows', () => {
    const immediateWait = () => {
      const delays: number[] = [];
      const wait = vi.fn(async (ms: number) => {
        delays.push(ms);
      });
      return { wait, delays };
    };

    it('Synapse unreachable at establishment → offline, then bounded backoff retry recovers to ready', async () => {
      const silentSso = vi
        .fn<() => Promise<'unreachable' | 'authenticated'>>()
        .mockResolvedValueOnce('unreachable')
        .mockImplementationOnce(async () => {
          await seedRecord();
          return 'authenticated';
        });
      const { sdk, handlers } = makeSdkMock();
      const { wait, delays } = immediateWait();
      const states: SessionState[] = [];

      await establishSession(ACTOR, {
        loadSdk: async () => sdk,
        silentSso,
        onState: s => states.push(s),
        retryDelaysMs: [100, 200],
        wait,
      });

      handlers.get('sync')?.('PREPARED');
      expect(states).toEqual(['starting', 'offline', 'starting', 'ready']);
      expect(delays).toEqual([100]);
      expect(silentSso).toHaveBeenCalledTimes(2);
    });

    it('Synapse unreachable beyond the bounded retries → failed, never an auth loop', async () => {
      const silentSso = vi.fn(async () => 'unreachable' as const);
      const loadSdk = vi.fn();
      const { wait, delays } = immediateWait();
      const states: SessionState[] = [];

      await establishSession('actor-without-record', {
        silentSso,
        loadSdk,
        onState: s => states.push(s),
        retryDelaysMs: [100, 200],
        wait,
      });

      expect(states).toEqual(['starting', 'offline', 'starting', 'offline', 'starting', 'offline', 'failed']);
      expect(delays).toEqual([100, 200]);
      expect(silentSso).toHaveBeenCalledTimes(3);
      expect(loadSdk).not.toHaveBeenCalled();
    });

    it('a network failure during proactive refresh does not destroy stored tokens — retries instead', async () => {
      await seedRecord({ expiresAt: Date.now() - 1000 });
      vi.spyOn(globalThis, 'fetch')
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({ access_token: 'syt_rotated', refresh_token: 'syr_rotated', expires_in_ms: 60_000 }),
            { status: 200 }
          )
        );
      const { sdk, createClient } = makeSdkMock();
      const silentSso = vi.fn(async () => 'timeout' as const);
      const { wait } = immediateWait();
      const states: SessionState[] = [];

      await establishSession(ACTOR, {
        loadSdk: async () => sdk,
        silentSso,
        onState: s => states.push(s),
        retryDelaysMs: [100],
        wait,
      });

      expect(silentSso).not.toHaveBeenCalled();
      expect(states).toEqual(['starting', 'offline', 'starting']);
      expect(createClient.mock.calls[0][0].accessToken).toBe('syt_rotated');
    });

    it('recovery while Synapse is unreachable lands in offline/failed, not auth-required (no auth loop)', async () => {
      await seedRecord();
      const { sdk, handlers } = makeSdkMock();
      const silentSso = vi.fn(async () => 'unreachable' as const);
      const { wait } = immediateWait();
      const states: SessionState[] = [];

      await establishSession(ACTOR, {
        loadSdk: async () => sdk,
        silentSso,
        onState: s => states.push(s),
        retryDelaysMs: [100],
        wait,
      });

      handlers.get('sync')?.('PREPARED');
      handlers.get('Session.logged_out')?.();

      await vi.waitFor(() => {
        expect(states[states.length - 1]).toBe('failed');
      });
      expect(states).not.toContain('auth-required');
      expect(states).toContain('recovering');
      expect(states).toContain('offline');
      expect(silentSso).toHaveBeenCalledTimes(2);
    });

    it('recovery succeeds promptless while Kratos lives — fresh credentials, back to ready', async () => {
      await seedRecord();
      const { sdk, handlers, createClient } = makeSdkMock();
      const silentSso = vi.fn(async () => {
        await seedRecord({ accessToken: 'syt_recovered', deviceId: 'DEV2' });
        return 'authenticated' as const;
      });
      const states: SessionState[] = [];

      await establishSession(ACTOR, { loadSdk: async () => sdk, silentSso, onState: s => states.push(s) });

      handlers.get('sync')?.('PREPARED');
      handlers.get('Session.logged_out')?.();

      await vi.waitFor(() => {
        expect(states[states.length - 1]).toBe('starting');
      });
      expect(silentSso).toHaveBeenCalledOnce();
      expect(createClient).toHaveBeenCalledTimes(2);
      expect(createClient.mock.calls[1][0].accessToken).toBe('syt_recovered');
      expect(states).toEqual(['starting', 'ready', 'recovering', 'starting']);
    });
  });
});
