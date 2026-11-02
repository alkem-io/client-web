import { createClient, getHttpUriForMxc } from 'matrix-js-sdk';
import { EventDirection, OpenIDRequestState, WidgetEventCapability } from 'matrix-widget-api';
import { describe, expect, it, vi } from 'vitest';
import { allowedCapabilitiesFor, ElementCallWidgetDriver } from './ElementCallWidgetDriver';

const ROOM = '!call:matrix.example.org';
const OTHER_ROOM = '!other:matrix.example.org';
const USER = '@ann:matrix.example.org';
const DEVICE = 'DEVICE1';
const TOKEN_SERVICE = 'https://matrix.example.org/livekit/jwt';

// Event type constants of the pinned call UI (matrix-js-sdk EventType values).
const CALL_MEMBER = 'org.matrix.msc3401.call.member';
const CALL_NOTIFY = 'org.matrix.msc4075.call.notify';
const RTC_NOTIFICATION = 'org.matrix.msc4075.rtc.notification';
const RTC_DECLINE = 'org.matrix.msc4310.rtc.decline';
const RTC_MEMBERSHIP = 'org.matrix.msc4143.rtc.member';
const ENCRYPTION_KEYS = 'io.element.call.encryption_keys';

/**
 * The exact capability request of the pinned call UI in widget mode: its own
 * capability list (send/receive events, state, to-device, sticky, transports)
 * plus what the embedded chat SDK client adds for it (the room timeline and
 * the delayed-event capabilities), built with the widget library's own
 * capability helpers the way the call UI builds them.
 */
const callUiRequest = (roomId: string, userId: string, deviceId: string): Set<string> => {
  const sendEvents = [
    CALL_NOTIFY,
    RTC_NOTIFICATION,
    'org.matrix.rageshake_request',
    ENCRYPTION_KEYS,
    'm.reaction',
    'm.room.redaction',
    'io.element.call.reaction',
    RTC_DECLINE,
    RTC_MEMBERSHIP,
  ];
  const receiveEvents = sendEvents.slice(2);
  const sendStateKeys = [userId, `_${userId}_${deviceId}_m.call`, `${userId}_${deviceId}_m.call`];
  const receiveState = ['m.room.create', 'm.room.name', 'm.room.member', 'm.room.encryption', CALL_MEMBER];
  const toDevice = [
    'm.call.invite',
    'm.call.candidates',
    'm.call.answer',
    'm.call.hangup',
    'm.call.reject',
    'm.call.select_answer',
    'm.call.negotiate',
    'm.call.sdp_stream_metadata_changed',
    'org.matrix.call.sdp_stream_metadata_changed',
    'm.call.replaces',
    ENCRYPTION_KEYS,
  ];
  return new Set([
    'm.always_on_screen',
    'org.matrix.msc4039.download_file',
    `org.matrix.msc2762.timeline:${roomId}`,
    ...sendEvents.map(type => WidgetEventCapability.forRoomEvent(EventDirection.Send, type).raw),
    ...receiveEvents.map(type => WidgetEventCapability.forRoomEvent(EventDirection.Receive, type).raw),
    ...sendStateKeys.map(key => WidgetEventCapability.forStateEvent(EventDirection.Send, CALL_MEMBER, key).raw),
    ...receiveState.map(type => WidgetEventCapability.forStateEvent(EventDirection.Receive, type).raw),
    ...toDevice.map(type => WidgetEventCapability.forToDeviceEvent(EventDirection.Send, type).raw),
    ...toDevice.map(type => WidgetEventCapability.forToDeviceEvent(EventDirection.Receive, type).raw),
    'org.matrix.msc4157.send.delayed_event',
    'org.matrix.msc4157.update_delayed_event',
    'org.matrix.msc4407.send.sticky_event',
    'org.matrix.msc4407.receive.sticky_event',
    'org.matrix.msc4515.rtc_transports',
  ]);
};

/** The pinned allow-list: exactly what the host grants, written out literally. */
const EXPECTED_GRANT = new Set([
  'm.always_on_screen',
  'org.matrix.msc4039.download_file',
  `org.matrix.msc2762.timeline:${ROOM}`,
  `org.matrix.msc2762.send.event:${CALL_NOTIFY}`,
  `org.matrix.msc2762.send.event:${RTC_NOTIFICATION}`,
  'org.matrix.msc2762.send.event:org.matrix.rageshake_request',
  `org.matrix.msc2762.send.event:${ENCRYPTION_KEYS}`,
  'org.matrix.msc2762.send.event:m.reaction',
  'org.matrix.msc2762.send.event:m.room.redaction',
  'org.matrix.msc2762.send.event:io.element.call.reaction',
  `org.matrix.msc2762.send.event:${RTC_DECLINE}`,
  `org.matrix.msc2762.send.event:${RTC_MEMBERSHIP}`,
  'org.matrix.msc2762.receive.event:org.matrix.rageshake_request',
  `org.matrix.msc2762.receive.event:${ENCRYPTION_KEYS}`,
  'org.matrix.msc2762.receive.event:m.reaction',
  'org.matrix.msc2762.receive.event:m.room.redaction',
  'org.matrix.msc2762.receive.event:io.element.call.reaction',
  `org.matrix.msc2762.receive.event:${RTC_DECLINE}`,
  `org.matrix.msc2762.receive.event:${RTC_MEMBERSHIP}`,
  `org.matrix.msc2762.send.state_event:${CALL_MEMBER}#${USER}`,
  `org.matrix.msc2762.send.state_event:${CALL_MEMBER}#_${USER}_${DEVICE}_m.call`,
  `org.matrix.msc2762.send.state_event:${CALL_MEMBER}#${USER}_${DEVICE}_m.call`,
  'org.matrix.msc2762.receive.state_event:m.room.create',
  'org.matrix.msc2762.receive.state_event:m.room.name',
  'org.matrix.msc2762.receive.state_event:m.room.member',
  'org.matrix.msc2762.receive.state_event:m.room.encryption',
  `org.matrix.msc2762.receive.state_event:${CALL_MEMBER}`,
  'org.matrix.msc4157.send.delayed_event',
  'org.matrix.msc4157.update_delayed_event',
  'org.matrix.msc4515.rtc_transports',
]);

type FakeEvent = {
  getId: () => string;
  getType: () => string;
  getStateKey: () => string | undefined;
  getContent: () => Record<string, unknown>;
  getEffectiveEvent: () => Record<string, unknown>;
};

const fakeEvent = (id: string, type: string, stateKey?: string, content: Record<string, unknown> = {}): FakeEvent => ({
  getId: () => id,
  getType: () => type,
  getStateKey: () => stateKey,
  getContent: () => content,
  getEffectiveEvent: () => ({ event_id: id, type, state_key: stateKey, content, room_id: ROOM }),
});

const makeClient = (timeline: FakeEvent[] = [], state: FakeEvent[] = []) => {
  const room = {
    roomId: ROOM,
    loadMembersIfNeeded: vi.fn(async () => true),
    getLiveTimeline: () => ({ getEvents: () => timeline }),
    currentState: {
      getStateEvents: (type: string, stateKey?: string) =>
        stateKey === undefined
          ? state.filter(event => event.getType() === type)
          : (state.find(event => event.getType() === type && event.getStateKey() === stateKey) ?? null),
    },
  };
  return {
    room,
    baseUrl: 'https://matrix.example.org',
    getAccessToken: () => 'access-token',
    getUserId: () => USER,
    getDeviceId: () => DEVICE,
    getRoom: vi.fn((roomId: string) => (roomId === ROOM ? room : null)),
    mxcUrlToHttp: (mxc: string, ...rest: [number?, number?, string?, boolean?, boolean?, boolean?]) =>
      getHttpUriForMxc('https://matrix.example.org', mxc, ...rest) || null,
    getOpenIdToken: vi.fn(async () => ({
      access_token: 'openid-token',
      token_type: 'Bearer',
      matrix_server_name: 'matrix.example.org',
      expires_in: 3600,
    })),
    relations: vi.fn(async () => ({ events: [fakeEvent('$rel', 'm.reaction')], nextBatch: 'n1', prevBatch: null })),
    sendStateEvent: vi.fn(async () => ({ event_id: '$state' })),
    sendEvent: vi.fn(async () => ({ event_id: '$event' })),
    redactEvent: vi.fn(async () => ({ event_id: '$redaction' })),
    _unstable_sendDelayedStateEvent: vi.fn(async () => ({ delay_id: 'delay-state' })),
    _unstable_sendDelayedEvent: vi.fn(async () => ({ delay_id: 'delay-event' })),
    doesServerSupportUnstableFeature: vi.fn(async (feature: string) => feature === 'org.matrix.msc4140'),
    http: { authedRequest: vi.fn(async () => ({})) },
  };
};

const driverFor = (client: ReturnType<typeof makeClient>) =>
  new ElementCallWidgetDriver({
    client: client as unknown as ConstructorParameters<typeof ElementCallWidgetDriver>[0]['client'],
    matrixRoomId: ROOM,
    livekitServiceUrl: TOKEN_SERVICE,
  });

describe('ElementCallWidgetDriver — capability contract with the pinned call UI', () => {
  it('grants exactly the pinned allow-list for the call UI’s real request', async () => {
    const granted = await driverFor(makeClient()).validateCapabilities(callUiRequest(ROOM, USER, DEVICE));
    expect(granted).toEqual(EXPECTED_GRANT);
    expect(allowedCapabilitiesFor(ROOM, USER, DEVICE)).toEqual(EXPECTED_GRANT);
  });

  it('drops another room, device-to-device messaging, sticky events, plain messages and stickers', async () => {
    const requested = new Set([
      `org.matrix.msc2762.timeline:${OTHER_ROOM}`,
      'org.matrix.msc2762.timeline:*',
      'org.matrix.msc3819.send.to_device:m.call.invite',
      'org.matrix.msc3819.receive.to_device:io.element.call.encryption_keys',
      'org.matrix.msc4407.send.sticky_event',
      'org.matrix.msc4407.receive.sticky_event',
      'org.matrix.msc2762.send.event:m.room.message',
      'org.matrix.msc2762.send.event:m.room.message#m.text',
      'm.sticker',
      'town.robin.msc3846.turn_servers',
      'org.matrix.msc2931.navigate',
      `org.matrix.msc2762.send.state_event:${CALL_MEMBER}#@mallory:matrix.example.org`,
      'org.matrix.msc2762.send.state_event:m.room.power_levels',
    ]);
    const granted = await driverFor(makeClient()).validateCapabilities(requested);
    expect(granted.size).toBe(0);
  });
});

describe('ElementCallWidgetDriver — host behaviour', () => {
  it('answers transport discovery with the one configured token service', async () => {
    await expect(driverFor(makeClient()).getRtcTransports()).resolves.toEqual({
      rtc_transports: [{ type: 'livekit', livekit_service_url: TOKEN_SERVICE }],
    });
  });

  it('sends a state event into the call room and refuses any other room', async () => {
    const client = makeClient();
    const driver = driverFor(client);
    const content = { application: 'm.call' };

    await expect(driver.sendEvent(CALL_MEMBER, content, `_${USER}_${DEVICE}_m.call`, ROOM)).resolves.toEqual({
      roomId: ROOM,
      eventId: '$state',
    });
    expect(client.sendStateEvent).toHaveBeenCalledWith(ROOM, CALL_MEMBER, content, `_${USER}_${DEVICE}_m.call`);

    await expect(driver.sendEvent(CALL_MEMBER, content, USER, OTHER_ROOM)).rejects.toThrow();
    expect(client.sendStateEvent).toHaveBeenCalledTimes(1);
  });

  it('sends a room event into the call room when no room is named', async () => {
    const client = makeClient();
    await expect(driverFor(client).sendEvent('m.reaction', { key: '👍' })).resolves.toEqual({
      roomId: ROOM,
      eventId: '$event',
    });
    expect(client.sendEvent).toHaveBeenCalledWith(ROOM, 'm.reaction', { key: '👍' });
  });

  it('sends a redaction through the redact endpoint, naming the redacted event, as the reference host does', async () => {
    const client = makeClient();
    await expect(driverFor(client).sendEvent('m.room.redaction', { redacts: '$raised-hand' })).resolves.toEqual({
      roomId: ROOM,
      eventId: '$redaction',
    });
    expect(client.redactEvent).toHaveBeenCalledWith(ROOM, '$raised-hand');
    expect(client.sendEvent).not.toHaveBeenCalled();
  });

  it('schedules a delayed state event and returns its delay id', async () => {
    const client = makeClient();
    const content = {};
    await expect(
      driverFor(client).sendDelayedEvent(8000, CALL_MEMBER, content, `_${USER}_${DEVICE}_m.call`, ROOM)
    ).resolves.toEqual({ roomId: ROOM, delayId: 'delay-state' });
    expect(client._unstable_sendDelayedStateEvent).toHaveBeenCalledWith(
      ROOM,
      { delay: 8000 },
      CALL_MEMBER,
      content,
      `_${USER}_${DEVICE}_m.call`
    );
  });

  it('schedules a delayed room event when there is no state key', async () => {
    const client = makeClient();
    await expect(driverFor(client).sendDelayedEvent(500, 'm.reaction', { key: 'x' })).resolves.toEqual({
      roomId: ROOM,
      delayId: 'delay-event',
    });
    expect(client._unstable_sendDelayedEvent).toHaveBeenCalledWith(ROOM, { delay: 500 }, null, 'm.reaction', {
      key: 'x',
    });
  });

  it('maps delayed-event updates to the body-form update the pinned chat server serves', async () => {
    const client = makeClient();
    const driver = driverFor(client);
    await driver.cancelScheduledDelayedEvent('d1');
    await driver.restartScheduledDelayedEvent('d2');
    await driver.sendScheduledDelayedEvent('d/3');
    const prefix = { prefix: '/_matrix/client/unstable/org.matrix.msc4140' };
    expect(client.http.authedRequest.mock.calls).toEqual([
      ['POST', '/delayed_events/d1', undefined, { action: 'cancel' }, prefix],
      ['POST', '/delayed_events/d2', undefined, { action: 'restart' }, prefix],
      ['POST', '/delayed_events/d%2F3', undefined, { action: 'send' }, prefix],
    ]);
  });

  it('refuses delayed-event updates without a request when the chat server lacks delayed events', async () => {
    const client = makeClient();
    client.doesServerSupportUnstableFeature.mockResolvedValue(false);
    await expect(driverFor(client).restartScheduledDelayedEvent('d1')).rejects.toThrow();
    expect(client.http.authedRequest).not.toHaveBeenCalled();
  });

  it.each([
    ['cancel', 'cancelScheduledDelayedEvent'],
    ['restart', 'restartScheduledDelayedEvent'],
    ['send', 'sendScheduledDelayedEvent'],
  ] as const)('sends the %s update of a delayed event once, with the session token', async (action, method) => {
    // The real chat client, so a request it sends without the token is visible here.
    const fetchFn = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).includes('/_matrix/client/versions')) {
        return Response.json({ versions: ['v1.11'], unstable_features: { 'org.matrix.msc4140': true } });
      }
      // The pinned chat server refuses an update without the token.
      return new Headers(init?.headers).has('Authorization')
        ? Response.json({})
        : Response.json({ errcode: 'M_MISSING_TOKEN', error: 'Missing access token' }, { status: 401 });
    });
    const client = createClient({
      baseUrl: 'https://matrix.example.org',
      accessToken: 'access-token',
      userId: USER,
      deviceId: DEVICE,
      fetchFn: fetchFn as unknown as typeof fetch,
    });
    const driver = new ElementCallWidgetDriver({ client, matrixRoomId: ROOM, livekitServiceUrl: TOKEN_SERVICE });

    await driver[method]('delay-1');

    const updates = fetchFn.mock.calls.filter(([input]) => String(input).includes('/delayed_events/'));
    expect(updates).toHaveLength(1);
    const [input, init] = updates[0];
    expect(String(input)).toBe(
      'https://matrix.example.org/_matrix/client/unstable/org.matrix.msc4140/delayed_events/delay-1'
    );
    expect(init?.method).toBe('POST');
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer access-token');
    expect(JSON.parse(String(init?.body))).toEqual({ action });
  });

  it('fires the scheduled leave at once, in a request that outlives the page, when the page goes away', async () => {
    const client = makeClient();
    const fetchMock = vi.fn(async () => new Response('{}'));
    vi.stubGlobal('fetch', fetchMock);
    try {
      const driver = driverFor(client);
      await driver.sendDelayedEvent(3600000, CALL_MEMBER, {}, `_${USER}_${DEVICE}_m.call`, ROOM);
      driver.sendPendingLeavesNow();
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://matrix.example.org/_matrix/client/unstable/org.matrix.msc4140/delayed_events/delay-state',
        {
          method: 'POST',
          keepalive: true,
          headers: { Authorization: 'Bearer access-token', 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'send' }),
        }
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('sends nothing on page exit for a leave already cancelled or sent, or for other delayed events', async () => {
    const client = makeClient();
    const fetchMock = vi.fn(async () => new Response('{}'));
    vi.stubGlobal('fetch', fetchMock);
    try {
      const driver = driverFor(client);
      client._unstable_sendDelayedStateEvent.mockResolvedValueOnce({ delay_id: 'cancelled' });
      await driver.sendDelayedEvent(8000, CALL_MEMBER, {}, `_${USER}_${DEVICE}_m.call`, ROOM);
      await driver.cancelScheduledDelayedEvent('cancelled');
      client._unstable_sendDelayedStateEvent.mockResolvedValueOnce({ delay_id: 'sent' });
      await driver.sendDelayedEvent(8000, CALL_MEMBER, {}, `_${USER}_${DEVICE}_m.call`, ROOM);
      await driver.sendScheduledDelayedEvent('sent');
      await driver.sendDelayedEvent(500, 'm.reaction', { key: 'x' });
      driver.sendPendingLeavesNow();
      expect(fetchMock).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('publishes the identity assertion of the platform session to the call UI', async () => {
    const client = makeClient();
    const update = vi.fn();
    driverFor(client).askOpenID({ update } as never);
    await vi.waitFor(() => expect(update).toHaveBeenCalled());
    expect(update).toHaveBeenCalledWith({
      state: OpenIDRequestState.Allowed,
      token: {
        access_token: 'openid-token',
        token_type: 'Bearer',
        matrix_server_name: 'matrix.example.org',
        expires_in: 3600,
      },
    });
  });

  it('blocks the identity assertion when the session cannot issue one', async () => {
    const client = makeClient();
    client.getOpenIdToken.mockRejectedValueOnce(new Error('offline'));
    const update = vi.fn();
    driverFor(client).askOpenID({ update } as never);
    await vi.waitFor(() => expect(update).toHaveBeenCalledWith({ state: OpenIDRequestState.Blocked }));
  });

  it('reads state of the call room only', async () => {
    const member = fakeEvent('$m1', CALL_MEMBER, `_${USER}_${DEVICE}_m.call`);
    const name = fakeEvent('$n1', 'm.room.name', '');
    const driver = driverFor(makeClient([], [member, name]));

    await expect(driver.readRoomState(ROOM, CALL_MEMBER, undefined)).resolves.toEqual([member.getEffectiveEvent()]);
    await expect(driver.readRoomState(ROOM, 'm.room.name', '')).resolves.toEqual([name.getEffectiveEvent()]);
    await expect(driver.readRoomState(ROOM, 'm.room.name', 'missing')).resolves.toEqual([]);
    await expect(driver.readRoomState(OTHER_ROOM, CALL_MEMBER, undefined)).resolves.toEqual([]);
    await expect(driver.readStateEvents(CALL_MEMBER, undefined, 0, [OTHER_ROOM])).resolves.toEqual([]);
  });

  it('loads the room members the chat session has not loaded yet before answering a member read', async () => {
    const known = fakeEvent('$known', 'm.room.member', '@known:matrix.example.org');
    const lazy = fakeEvent('$lazy', 'm.room.member', '@lazy:matrix.example.org');
    const state = [known];
    const client = makeClient([], state);
    let finishLoading: () => void = () => {};
    client.room.loadMembersIfNeeded.mockImplementationOnce(
      () =>
        new Promise<boolean>(resolve => {
          finishLoading = () => {
            state.push(lazy);
            resolve(true);
          };
        })
    );
    const read = driverFor(client).readRoomState(ROOM, 'm.room.member', undefined);
    await Promise.resolve();
    finishLoading();

    await expect(read).resolves.toEqual([known.getEffectiveEvent(), lazy.getEffectiveEvent()]);
  });

  it('answers a member read with the members it has when loading the rest fails', async () => {
    const known = fakeEvent('$known', 'm.room.member', '@known:matrix.example.org');
    const client = makeClient([], [known]);
    client.room.loadMembersIfNeeded.mockRejectedValueOnce(new Error('offline'));
    await expect(driverFor(client).readRoomState(ROOM, 'm.room.member', undefined)).resolves.toEqual([
      known.getEffectiveEvent(),
    ]);
  });

  it('loads no members for reads of other state', async () => {
    const client = makeClient();
    await driverFor(client).readRoomState(ROOM, CALL_MEMBER, undefined);
    expect(client.room.loadMembersIfNeeded).not.toHaveBeenCalled();
  });

  it('reads the call room timeline newest first, honouring type, state key, limit and since', async () => {
    const timeline = [
      fakeEvent('$1', 'm.reaction'),
      fakeEvent('$2', 'm.reaction'),
      fakeEvent('$3', 'm.room.message', undefined, { msgtype: 'm.text' }),
      fakeEvent('$4', 'm.reaction'),
      fakeEvent('$5', CALL_MEMBER, USER),
    ];
    const driver = driverFor(makeClient(timeline));
    const ids = (events: { event_id?: unknown }[]) => events.map(event => event.event_id);

    expect(ids(await driver.readRoomTimeline(ROOM, 'm.reaction', undefined, undefined, 0, undefined))).toEqual([
      '$4',
      '$2',
      '$1',
    ]);
    expect(ids(await driver.readRoomTimeline(ROOM, 'm.reaction', undefined, undefined, 2, undefined))).toEqual([
      '$4',
      '$2',
    ]);
    expect(ids(await driver.readRoomTimeline(ROOM, 'm.reaction', undefined, undefined, 0, '$2'))).toEqual(['$4']);
    expect(ids(await driver.readRoomTimeline(ROOM, CALL_MEMBER, undefined, USER, 0, undefined))).toEqual(['$5']);
    expect(ids(await driver.readRoomTimeline(ROOM, 'm.room.message', 'm.notice', undefined, 0, undefined))).toEqual([]);
    expect(await driver.readRoomTimeline(OTHER_ROOM, 'm.reaction', undefined, undefined, 0, undefined)).toEqual([]);
  });

  it('reads relations in the call room only', async () => {
    const client = makeClient();
    const driver = driverFor(client);
    await expect(driver.readEventRelations('$parent', ROOM, 'm.annotation')).resolves.toEqual({
      chunk: [fakeEvent('$rel', 'm.reaction').getEffectiveEvent()],
      nextBatch: 'n1',
      prevBatch: undefined,
    });
    await expect(driver.readEventRelations('$parent', OTHER_ROOM)).rejects.toThrow();
  });

  it('neutralises device-to-device messages and refuses sticky events, files and token delegation', async () => {
    const driver = driverFor(makeClient());
    await expect(driver.sendToDevice()).resolves.toBeUndefined();
    await expect(driver.sendStickyEvent()).rejects.toThrow();
    await expect(driver.sendDelayedStickyEvent()).rejects.toThrow();
    await expect(driver.readStickyEvents()).rejects.toThrow();
    await expect(driver.uploadFile()).rejects.toThrow();
    await expect(driver.getRtcLivekitToken()).rejects.toThrow();
    await expect(driver.delegateRtcLivekitDelayedLeave()).rejects.toThrow();
    await expect(driver.navigate()).resolves.toBeUndefined();
    expect((await driver.getTurnServers().next()).done).toBe(true);
    expect(driver.getKnownRooms()).toEqual([ROOM]);
  });

  it('downloads media of the chat server through its authenticated media endpoint, as the platform session', async () => {
    const fetchMock = vi.fn(async () => new Response('avatar-bytes'));
    vi.stubGlobal('fetch', fetchMock);
    try {
      const { file } = await driverFor(makeClient()).downloadFile('mxc://matrix.example.org/abc123');
      expect(fetchMock).toHaveBeenCalledWith(
        'https://matrix.example.org/_matrix/client/v1/media/download/matrix.example.org/abc123?allow_redirect=true',
        {
          headers: { Authorization: 'Bearer access-token' },
        }
      );
      // fetch's Blob and jsdom's global Blob can come from different realms, so
      // `instanceof Blob` depends on the runtime; check the brand instead.
      expect(Object.prototype.toString.call(file)).toBe('[object Blob]');
      expect((file as Blob).size).toBe('avatar-bytes'.length);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('refuses to download anything that is not chat server media, without a request', async () => {
    const fetchMock = vi.fn(async () => new Response('x'));
    vi.stubGlobal('fetch', fetchMock);
    try {
      const driver = driverFor(makeClient());
      await expect(driver.downloadFile('https://elsewhere.example.com/avatar.png')).rejects.toThrow();
      await expect(driver.downloadFile('mxc://matrix.example.org/../../_synapse/admin')).rejects.toThrow();
      expect(fetchMock).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it.each([
    ['refused', () => Promise.resolve(new Response('{}', { status: 500 }))],
    ['unreachable', () => Promise.reject(new TypeError('Failed to fetch'))],
    [
      'cut off while reading',
      () =>
        Promise.resolve(
          new Response(
            new ReadableStream({
              start(controller) {
                controller.error(new TypeError('network error'));
              },
            })
          )
        ),
    ],
  ])('fails a download that was %s again for the rest of the call, without a request', async (_, answer) => {
    const fetchMock = vi.fn(answer);
    vi.stubGlobal('fetch', fetchMock);
    try {
      const driver = driverFor(makeClient());
      await expect(driver.downloadFile('mxc://matrix.example.org/broken')).rejects.toThrow();
      await expect(driver.downloadFile('mxc://matrix.example.org/broken')).rejects.toThrow();
      expect(fetchMock).toHaveBeenCalledTimes(1);

      // Other media of the call, and the same media in another call, are still fetched.
      fetchMock.mockImplementation(async () => new Response('avatar-bytes'));
      await expect(driver.downloadFile('mxc://matrix.example.org/fine')).resolves.toBeDefined();
      await expect(driverFor(makeClient()).downloadFile('mxc://matrix.example.org/broken')).resolves.toBeDefined();
      expect(fetchMock).toHaveBeenCalledTimes(3);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('shares one request among downloads of the same media that overlap, and fetches it afresh after a success', async () => {
    let answer: (response: Response) => void = () => undefined;
    const fetchMock = vi.fn(() => new Promise<Response>(resolve => (answer = resolve)));
    vi.stubGlobal('fetch', fetchMock);
    try {
      const driver = driverFor(makeClient());
      const first = driver.downloadFile('mxc://matrix.example.org/broken');
      const second = driver.downloadFile('mxc://matrix.example.org/broken');
      answer(new Response('{}', { status: 500 }));
      await expect(first).rejects.toThrow('status 500');
      await expect(second).rejects.toThrow('status 500');
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const third = driver.downloadFile('mxc://matrix.example.org/fine');
      const fourth = driver.downloadFile('mxc://matrix.example.org/fine');
      answer(new Response('avatar-bytes'));
      await expect(third).resolves.toBeDefined();
      await expect(fourth).resolves.toBeDefined();
      expect(fetchMock).toHaveBeenCalledTimes(2);

      const fifth = driver.downloadFile('mxc://matrix.example.org/fine');
      answer(new Response('avatar-bytes'));
      await expect(fifth).resolves.toBeDefined();
      expect(fetchMock).toHaveBeenCalledTimes(3);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('fails the download when the chat server refuses it, so the call UI falls back to initials', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}', { status: 404 }))
    );
    try {
      await expect(driverFor(makeClient()).downloadFile('mxc://matrix.example.org/gone')).rejects.toThrow();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
