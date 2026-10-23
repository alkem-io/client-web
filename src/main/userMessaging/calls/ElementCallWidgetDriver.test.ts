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
    getLiveTimeline: () => ({ getEvents: () => timeline }),
    currentState: {
      getStateEvents: (type: string, stateKey?: string) =>
        stateKey === undefined
          ? state.filter(event => event.getType() === type)
          : (state.find(event => event.getType() === type && event.getStateKey() === stateKey) ?? null),
    },
  };
  return {
    getUserId: () => USER,
    getDeviceId: () => DEVICE,
    getRoom: vi.fn((roomId: string) => (roomId === ROOM ? room : null)),
    getOpenIdToken: vi.fn(async () => ({
      access_token: 'openid-token',
      token_type: 'Bearer',
      matrix_server_name: 'matrix.example.org',
      expires_in: 3600,
    })),
    relations: vi.fn(async () => ({ events: [fakeEvent('$rel', 'm.reaction')], nextBatch: 'n1', prevBatch: null })),
    sendStateEvent: vi.fn(async () => ({ event_id: '$state' })),
    sendEvent: vi.fn(async () => ({ event_id: '$event' })),
    _unstable_sendDelayedStateEvent: vi.fn(async () => ({ delay_id: 'delay-state' })),
    _unstable_sendDelayedEvent: vi.fn(async () => ({ delay_id: 'delay-event' })),
    _unstable_updateDelayedEvent: vi.fn(async () => ({})),
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
    await driver.sendScheduledDelayedEvent('d3');
    expect(client._unstable_updateDelayedEvent.mock.calls).toEqual([
      ['d1', 'cancel'],
      ['d2', 'restart'],
      ['d3', 'send'],
    ]);
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
    await expect(driver.downloadFile()).rejects.toThrow();
    await expect(driver.getRtcLivekitToken()).rejects.toThrow();
    await expect(driver.delegateRtcLivekitDelayedLeave()).rejects.toThrow();
    await expect(driver.navigate()).resolves.toBeUndefined();
    expect((await driver.getTurnServers().next()).done).toBe(true);
    expect(driver.getKnownRooms()).toEqual([ROOM]);
  });
});
