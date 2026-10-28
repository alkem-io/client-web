import type { MatrixClient, MatrixEvent } from 'matrix-js-sdk';
import {
  type Capability,
  type IOpenIDUpdate,
  type IReadEventRelationsResult,
  type IRoomEvent,
  type IRtcTransportsResult,
  type ISendDelayedEventDetails,
  type ISendEventDetails,
  type ITurnServer,
  OpenIDRequestState,
  type SimpleObservable,
  WidgetDriver,
} from 'matrix-widget-api';

// Event types the pinned call UI exchanges, copied from the chat SDK's
// constants as strings so the SDK stays a lazily loaded chunk.
const CALL_MEMBER = 'org.matrix.msc3401.call.member';
const SEND_ONLY_EVENT_TYPES = ['org.matrix.msc4075.call.notify', 'org.matrix.msc4075.rtc.notification'];
const SEND_AND_RECEIVE_EVENT_TYPES = [
  'org.matrix.rageshake_request',
  'io.element.call.encryption_keys',
  'm.reaction',
  'm.room.redaction',
  'io.element.call.reaction',
  'org.matrix.msc4310.rtc.decline',
  'org.matrix.msc4143.rtc.member',
];
const RECEIVE_STATE_TYPES = ['m.room.create', 'm.room.name', 'm.room.member', 'm.room.encryption', CALL_MEMBER];

/**
 * Every capability the host may grant the call UI, for one room, user and
 * device. Anything the call UI asks for beyond this is refused — in particular
 * device-to-device messaging and sticky events (the pinned chat server
 * supports neither, and the rooms are unencrypted), plain messages, and every
 * other room.
 */
const allowedCapabilitiesFor = (roomId: string, userId: string, deviceId: string): Set<Capability> =>
  new Set<Capability>([
    'm.always_on_screen',
    // The call UI loads participants' avatars through the host; only chat server media is served.
    'org.matrix.msc4039.download_file',
    `org.matrix.msc2762.timeline:${roomId}`,
    ...[...SEND_ONLY_EVENT_TYPES, ...SEND_AND_RECEIVE_EVENT_TYPES].map(type => `org.matrix.msc2762.send.event:${type}`),
    ...SEND_AND_RECEIVE_EVENT_TYPES.map(type => `org.matrix.msc2762.receive.event:${type}`),
    ...[userId, `_${userId}_${deviceId}_m.call`, `${userId}_${deviceId}_m.call`].map(
      stateKey => `org.matrix.msc2762.send.state_event:${CALL_MEMBER}#${stateKey}`
    ),
    ...RECEIVE_STATE_TYPES.map(type => `org.matrix.msc2762.receive.state_event:${type}`),
    'org.matrix.msc4157.send.delayed_event',
    'org.matrix.msc4157.update_delayed_event',
    'org.matrix.msc4515.rtc_transports',
  ]);

type DelayedEventAction = 'cancel' | 'restart' | 'send';

/** The part of the platform's Matrix client the driver uses, typed loosely enough for arbitrary event types. */
type CallHostClient = {
  baseUrl: string;
  getAccessToken(): string | null;
  getUserId(): string | null;
  getDeviceId(): string | null;
  getRoom: MatrixClient['getRoom'];
  mxcUrlToHttp: MatrixClient['mxcUrlToHttp'];
  getOpenIdToken: MatrixClient['getOpenIdToken'];
  relations: MatrixClient['relations'];
  sendStateEvent(roomId: string, eventType: string, content: unknown, stateKey: string): Promise<{ event_id: string }>;
  sendEvent(roomId: string, eventType: string, content: unknown): Promise<{ event_id: string }>;
  _unstable_sendDelayedStateEvent(
    roomId: string,
    delayOpts: { delay: number },
    eventType: string,
    content: unknown,
    stateKey: string
  ): Promise<{ delay_id: string }>;
  _unstable_sendDelayedEvent(
    roomId: string,
    delayOpts: { delay: number },
    threadId: string | null,
    eventType: string,
    content: unknown
  ): Promise<{ delay_id: string }>;
  // The update form with the action in the body is the one the pinned chat server serves.
  _unstable_updateDelayedEvent(delayId: string, action: DelayedEventAction): Promise<unknown>;
};

type DriverOptions = {
  client: MatrixClient;
  /** The one room the call takes place in; the call UI can reach no other. */
  matrixRoomId: string;
  livekitServiceUrl: string;
};

const notSupported = (what: string) => Promise.reject(new Error(`${what} is not supported by this host`));

const toRoomEvent = (event: MatrixEvent): IRoomEvent => event.getEffectiveEvent() as unknown as IRoomEvent;

async function* noTurnServers(): AsyncGenerator<ITurnServer> {
  // The call UI does not ask for TURN servers; media relays come from the token service.
}

/**
 * Hosts the embedded call UI on the platform's own Matrix session: the call UI
 * never logs in itself, it asks the host through the widget API, and the host
 * answers only for the call's room.
 */
class ElementCallWidgetDriver extends WidgetDriver {
  private readonly client: CallHostClient;
  private readonly roomId: string;
  private readonly livekitServiceUrl: string;
  private readonly allowed: Set<Capability>;
  /** Delayed leaves of this device's call membership that are still waiting on the chat server. */
  private readonly pendingLeaves = new Set<string>();

  constructor({ client, matrixRoomId, livekitServiceUrl }: DriverOptions) {
    super();
    this.client = client as unknown as CallHostClient;
    this.roomId = matrixRoomId;
    this.livekitServiceUrl = livekitServiceUrl;
    this.allowed = allowedCapabilitiesFor(matrixRoomId, client.getUserId() ?? '', client.getDeviceId() ?? '');
  }

  public validateCapabilities(requested: Set<Capability>): Promise<Set<Capability>> {
    return Promise.resolve(new Set([...requested].filter(capability => this.allowed.has(capability))));
  }

  private targetRoom(roomId?: string | null): string {
    const target = roomId ?? this.roomId;
    if (target !== this.roomId) {
      throw new Error('The call can only reach its own room');
    }
    return target;
  }

  public async sendEvent(
    eventType: string,
    content: unknown,
    stateKey: string | null = null,
    roomId: string | null = null
  ): Promise<ISendEventDetails> {
    const target = this.targetRoom(roomId);
    const response =
      stateKey !== null && stateKey !== undefined
        ? await this.client.sendStateEvent(target, eventType, content, stateKey)
        : await this.client.sendEvent(target, eventType, content);
    return { roomId: target, eventId: response.event_id };
  }

  public async sendDelayedEvent(
    delay: number,
    eventType: string,
    content: unknown,
    stateKey: string | null = null,
    roomId: string | null = null
  ): Promise<ISendDelayedEventDetails> {
    const target = this.targetRoom(roomId);
    const response =
      stateKey !== null && stateKey !== undefined
        ? await this.client._unstable_sendDelayedStateEvent(target, { delay }, eventType, content, stateKey)
        : await this.client._unstable_sendDelayedEvent(target, { delay }, null, eventType, content);
    if (eventType === CALL_MEMBER && stateKey !== null && stateKey !== undefined) {
      this.pendingLeaves.add(response.delay_id);
    }
    return { roomId: target, delayId: response.delay_id };
  }

  public async cancelScheduledDelayedEvent(delayId: string): Promise<void> {
    this.pendingLeaves.delete(delayId);
    await this.client._unstable_updateDelayedEvent(delayId, 'cancel');
  }

  public async restartScheduledDelayedEvent(delayId: string): Promise<void> {
    await this.client._unstable_updateDelayedEvent(delayId, 'restart');
  }

  public async sendScheduledDelayedEvent(delayId: string): Promise<void> {
    this.pendingLeaves.delete(delayId);
    await this.client._unstable_updateDelayedEvent(delayId, 'send');
  }

  /**
   * Leaves the call now when the page goes away (reload, close, navigation):
   * the call UI's own leave does not survive the unload, and its delayed leave
   * may be set to fire much later. `keepalive` lets the browser finish the
   * request after the page is gone, which the chat client's own requests can't.
   */
  public sendPendingLeavesNow(): void {
    const accessToken = this.client.getAccessToken();
    for (const delayId of this.pendingLeaves) {
      fetch(
        `${this.client.baseUrl}/_matrix/client/unstable/org.matrix.msc4140/delayed_events/${encodeURIComponent(delayId)}`,
        {
          method: 'POST',
          keepalive: true,
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'send' }),
        }
      ).catch(() => {
        // The page is going away; a leave that does not arrive still fires when its delay runs out.
      });
    }
    this.pendingLeaves.clear();
  }

  public sendStickyEvent(): Promise<ISendEventDetails> {
    return notSupported('Sticky events');
  }

  public sendDelayedStickyEvent(): Promise<ISendDelayedEventDetails> {
    return notSupported('Sticky events');
  }

  public readStickyEvents(): Promise<IRoomEvent[]> {
    return notSupported('Sticky events');
  }

  // The rooms are unencrypted and end-to-end encryption is off in the call UI,
  // so there is nothing to relay between devices.
  public sendToDevice(): Promise<void> {
    return Promise.resolve();
  }

  public readRoomState(roomId: string, eventType: string, stateKey: string | undefined): Promise<IRoomEvent[]> {
    if (roomId !== this.roomId) {
      return Promise.resolve([]);
    }
    const state = this.client.getRoom(roomId)?.currentState;
    if (!state) {
      return Promise.resolve([]);
    }
    const events =
      stateKey === undefined
        ? state.getStateEvents(eventType)
        : [state.getStateEvents(eventType, stateKey)].filter((event): event is MatrixEvent => event !== null);
    return Promise.resolve(events.map(toRoomEvent));
  }

  public async readStateEvents(
    eventType: string,
    stateKey: string | undefined,
    limit: number,
    roomIds: string[] | null = null
  ): Promise<IRoomEvent[]> {
    if (roomIds !== null && !roomIds.includes(this.roomId)) {
      return [];
    }
    const events = await this.readRoomState(this.roomId, eventType, stateKey);
    return limit > 0 ? events.slice(0, limit) : events;
  }

  public readRoomTimeline(
    roomId: string,
    eventType: string,
    msgtype: string | undefined,
    stateKey: string | undefined,
    limit: number,
    since: string | undefined
  ): Promise<IRoomEvent[]> {
    if (roomId !== this.roomId) {
      return Promise.resolve([]);
    }
    const timeline = this.client.getRoom(roomId)?.getLiveTimeline().getEvents() ?? [];
    const results: MatrixEvent[] = [];
    const max = limit > 0 ? limit : Number.POSITIVE_INFINITY;
    // Newest first, stopping at the event the call UI has already seen.
    for (let index = timeline.length - 1; index >= 0 && results.length < max; index--) {
      const event = timeline[index];
      if (since !== undefined && event.getId() === since) {
        break;
      }
      if (event.getType() !== eventType || event.getStateKey() !== stateKey) {
        continue;
      }
      if (msgtype !== undefined && event.getContent().msgtype !== msgtype) {
        continue;
      }
      results.push(event);
    }
    return Promise.resolve(results.map(toRoomEvent));
  }

  public readRoomEvents(
    eventType: string,
    msgtype: string | undefined,
    limit: number,
    roomIds: string[] | null = null,
    since?: string
  ): Promise<IRoomEvent[]> {
    if (roomIds !== null && !roomIds.includes(this.roomId)) {
      return Promise.resolve([]);
    }
    return this.readRoomTimeline(this.roomId, eventType, msgtype, undefined, limit, since);
  }

  public async readEventRelations(
    eventId: string,
    roomId?: string,
    relationType?: string,
    eventType?: string,
    from?: string,
    to?: string,
    limit?: number,
    direction?: 'f' | 'b'
  ): Promise<IReadEventRelationsResult> {
    const target = this.targetRoom(roomId);
    const result = await this.client.relations(target, eventId, relationType ?? null, eventType ?? null, {
      from,
      to,
      limit,
      dir: direction as NonNullable<Parameters<MatrixClient['relations']>[4]>['dir'],
    });
    return {
      chunk: result.events.map(toRoomEvent),
      nextBatch: result.nextBatch ?? undefined,
      prevBatch: result.prevBatch ?? undefined,
    };
  }

  /** The call UI proves who the user is to the token service with an identity assertion from the platform's session. */
  public askOpenID(observer: SimpleObservable<IOpenIDUpdate>): void {
    this.client
      .getOpenIdToken()
      .then(token => observer.update({ state: OpenIDRequestState.Allowed, token }))
      .catch(() => observer.update({ state: OpenIDRequestState.Blocked }));
  }

  public getRtcTransports(): Promise<IRtcTransportsResult> {
    return Promise.resolve({
      rtc_transports: [{ type: 'livekit', livekit_service_url: this.livekitServiceUrl }],
    });
  }

  public getTurnServers(): AsyncGenerator<ITurnServer> {
    return noTurnServers();
  }

  public navigate(): Promise<void> {
    return Promise.resolve();
  }

  public uploadFile(): Promise<{ contentUri: string }> {
    return notSupported('Uploading files');
  }

  /** Media of the chat server only, fetched with the platform's session as the chat server requires. */
  public async downloadFile(contentUri: string): Promise<{ file: XMLHttpRequestBodyInit }> {
    // Not a valid chat server media address (including any other URL) yields no address at all.
    const url = this.client.mxcUrlToHttp(contentUri, undefined, undefined, undefined, false, true, true);
    if (!url) {
      throw new Error('Only chat server media can be downloaded');
    }
    const response = await fetch(url, { headers: { Authorization: `Bearer ${this.client.getAccessToken()}` } });
    if (!response.ok) {
      throw new Error(`Downloading the media failed with status ${response.status}`);
    }
    return { file: await response.blob() };
  }

  public getRtcLivekitToken(): Promise<never> {
    return notSupported('Fetching a media token through the host');
  }

  public delegateRtcLivekitDelayedLeave(): Promise<never> {
    return notSupported('Delegating the delayed leave');
  }

  public getKnownRooms(): string[] {
    return [this.roomId];
  }
}

export { allowedCapabilitiesFor, ElementCallWidgetDriver };
