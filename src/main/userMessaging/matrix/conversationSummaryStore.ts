import type { MatrixClient, MatrixEvent, Room } from 'matrix-js-sdk';
import { useEffect, useSyncExternalStore } from 'react';
import { useMatrixClient } from '@/core/matrix/activeClient';
import { lastMessageOf, type ParsedMessage, type RawEvent } from './matrixEvents';
import {
  CLIENT_ROOM,
  CLIENT_SYNC,
  FULLY_READ,
  fetchBackward,
  fullyReadEventId,
  homeserverOf,
  liveEvents,
  notificationCount,
  ownUserId,
  ROOM_ACCOUNT_DATA,
  ROOM_REDACTION,
  ROOM_TIMELINE,
  resolveMatrixRoomId,
} from './matrixRooms';
import { computeUnreadCount } from './unreadCount';

type RoomSummary = {
  readonly lastMessage?: ParsedMessage;
  readonly unreadCount: number;
};

type Summaries = ReadonlyMap<string, RoomSummary>;

// matrix-adapter's batch unread lookup runs at most this many rooms at once.
const MAX_CONCURRENT_ROOMS = 10;
// matrix-adapter's GetLastMessage scans backward in these batches.
const LAST_MESSAGE_BATCHES = [5, 10, 20, 50, 200];

/**
 * Per-conversation latest message and unread count, computed from sync for
 * the rooms some hook currently watches. A room is computed once when first
 * watched (or once its Matrix room appears), then again only when its own
 * timeline or read marker changes.
 */
class ConversationSummaryStore {
  private readonly watchers = new Map<string, number>();
  private readonly alkemioByMatrixId = new Map<string, string>();
  private readonly matrixByAlkemioId = new Map<string, string>();
  private summaries: Summaries = new Map();
  private readonly listeners = new Set<() => void>();
  private readonly queue: string[] = [];
  private readonly queued = new Set<string>();
  private readonly inFlight = new Set<string>();
  private readonly dirty = new Set<string>();

  constructor(private readonly client: MatrixClient) {
    client.on(
      ROOM_TIMELINE as never,
      ((_event: MatrixEvent, room: Room | undefined, toStartOfTimeline: boolean) => {
        if (room && !toStartOfTimeline) {
          this.touchMatrixRoom(room.roomId);
        }
      }) as never
    );
    client.on(
      ROOM_REDACTION as never,
      ((_event: MatrixEvent, room: Room) => {
        this.touchMatrixRoom(room.roomId);
      }) as never
    );
    client.on(
      ROOM_ACCOUNT_DATA as never,
      ((event: MatrixEvent, room: Room) => {
        if (event.getType() === FULLY_READ) {
          this.touchMatrixRoom(room.roomId);
        }
      }) as never
    );
    // A watched room may resolve before the client has it (first sync, or a
    // conversation created after sync started).
    client.on(
      CLIENT_ROOM as never,
      ((room: Room) => {
        this.touchMatrixRoom(room.roomId);
      }) as never
    );
    client.on(
      CLIENT_SYNC as never,
      ((state: string) => {
        if (state === 'PREPARED') {
          for (const alkemioRoomId of this.watchers.keys()) {
            this.schedule(alkemioRoomId);
          }
        }
      }) as never
    );
  }

  /** The Alkemio room id of a watched conversation's Matrix room, if any. */
  alkemioRoomIdFor(matrixRoomId: string): string | undefined {
    const alkemioRoomId = this.alkemioByMatrixId.get(matrixRoomId);
    return alkemioRoomId && this.watchers.has(alkemioRoomId) ? alkemioRoomId : undefined;
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): Summaries => this.summaries;

  watch(alkemioRoomIds: readonly string[]): () => void {
    for (const alkemioRoomId of alkemioRoomIds) {
      const count = this.watchers.get(alkemioRoomId) ?? 0;
      this.watchers.set(alkemioRoomId, count + 1);
      if (count === 0) {
        void this.resolve(alkemioRoomId);
      }
    }
    return () => {
      for (const alkemioRoomId of alkemioRoomIds) {
        const count = (this.watchers.get(alkemioRoomId) ?? 1) - 1;
        if (count <= 0) {
          this.watchers.delete(alkemioRoomId);
        } else {
          this.watchers.set(alkemioRoomId, count);
        }
      }
    };
  }

  private async resolve(alkemioRoomId: string): Promise<void> {
    const matrixRoomId = await resolveMatrixRoomId(this.client, alkemioRoomId);
    if (!matrixRoomId || !this.watchers.has(alkemioRoomId)) {
      return;
    }
    this.alkemioByMatrixId.set(matrixRoomId, alkemioRoomId);
    this.matrixByAlkemioId.set(alkemioRoomId, matrixRoomId);
    this.schedule(alkemioRoomId);
  }

  private touchMatrixRoom(matrixRoomId: string): void {
    const alkemioRoomId = this.alkemioByMatrixId.get(matrixRoomId);
    if (alkemioRoomId && this.watchers.has(alkemioRoomId)) {
      this.schedule(alkemioRoomId);
    }
  }

  private schedule(alkemioRoomId: string): void {
    // One computation per room at a time: a change during a run re-runs it
    // afterwards, so an older result can never land after a newer one.
    if (this.inFlight.has(alkemioRoomId)) {
      this.dirty.add(alkemioRoomId);
      return;
    }
    if (!this.queued.has(alkemioRoomId)) {
      this.queued.add(alkemioRoomId);
      this.queue.push(alkemioRoomId);
    }
    this.drain();
  }

  private drain(): void {
    while (this.inFlight.size < MAX_CONCURRENT_ROOMS && this.queue.length > 0) {
      const alkemioRoomId = this.queue.shift() as string;
      this.queued.delete(alkemioRoomId);
      this.inFlight.add(alkemioRoomId);
      void this.compute(alkemioRoomId).finally(() => {
        this.inFlight.delete(alkemioRoomId);
        if (this.dirty.delete(alkemioRoomId)) {
          this.schedule(alkemioRoomId);
        }
        this.drain();
      });
    }
  }

  private async compute(alkemioRoomId: string): Promise<void> {
    const matrixRoomId = this.matrixByAlkemioId.get(alkemioRoomId);
    const room = matrixRoomId ? this.client.getRoom(matrixRoomId) : null;
    if (!matrixRoomId || !room) {
      return;
    }
    try {
      const homeserver = homeserverOf(this.client);
      const fetchBatch = fetchBackward(this.client, matrixRoomId);
      const [lastMessage, unreadCount] = await Promise.all([
        this.findLastMessage(liveEvents(room), fetchBatch, homeserver),
        computeUnreadCount({
          markerEventId: fullyReadEventId(room),
          ownUserId: ownUserId(this.client),
          fetchBatch,
          notificationCount: () => notificationCount(room),
        }),
      ]);
      const next = new Map(this.summaries);
      next.set(alkemioRoomId, { lastMessage, unreadCount });
      this.summaries = next;
      for (const listener of this.listeners) {
        listener();
      }
    } catch {
      // Left as it was; the room's next change recomputes it.
    }
  }

  private async findLastMessage(
    live: RawEvent[],
    fetchBatch: ReturnType<typeof fetchBackward>,
    homeserver: string
  ): Promise<ParsedMessage | undefined> {
    const local = lastMessageOf(live, homeserver);
    if (local) {
      return local;
    }
    let from: string | undefined;
    for (const batchSize of LAST_MESSAGE_BATCHES) {
      const { events, end } = await fetchBatch(from, batchSize);
      const found = lastMessageOf([...events].reverse(), homeserver);
      if (found) {
        return found;
      }
      if (!end || events.length < batchSize) {
        return undefined;
      }
      from = end;
    }
    return undefined;
  }
}

const stores = new WeakMap<MatrixClient, ConversationSummaryStore>();

const storeFor = (client: MatrixClient): ConversationSummaryStore => {
  let store = stores.get(client);
  if (!store) {
    store = new ConversationSummaryStore(client);
    stores.set(client, store);
  }
  return store;
};

const EMPTY: Summaries = new Map();
const noSubscription = () => () => {};

/**
 * Latest message and unread count per Alkemio room id, from sync. Undefined
 * while no Matrix client is established.
 */
const useConversationSummaries = (alkemioRoomIds: readonly string[]): Summaries | undefined => {
  const client = useMatrixClient();
  const store = client ? storeFor(client) : null;
  const watchKey = [...alkemioRoomIds].sort().join(',');

  useEffect(() => {
    if (!store || watchKey === '') {
      return;
    }
    return store.watch(watchKey.split(','));
  }, [store, watchKey]);

  const summaries = useSyncExternalStore(store?.subscribe ?? noSubscription, store?.getSnapshot ?? (() => EMPTY));
  return store ? summaries : undefined;
};

export { ConversationSummaryStore, storeFor, useConversationSummaries };
export type { RoomSummary, Summaries };
