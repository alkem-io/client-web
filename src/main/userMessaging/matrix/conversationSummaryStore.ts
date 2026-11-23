import type { MatrixClient, MatrixEvent, Room } from 'matrix-js-sdk';
import { useEffect, useSyncExternalStore } from 'react';
import { useMatrixClient } from '@/core/matrix/activeClient';
import { lastMessageOf, type ParsedMessage, type RawEvent } from './matrixEvents';
import {
  CLIENT_ROOM,
  CLIENT_SYNC,
  FAVOURITE_TAG,
  FULLY_READ,
  fetchBackward,
  fullyReadEventId,
  homeserverOf,
  isFavourite,
  liveEvents,
  notificationCount,
  ownUserId,
  ROOM_ACCOUNT_DATA,
  ROOM_LOCAL_ECHO_UPDATED,
  ROOM_REDACTION,
  ROOM_TAGS,
  ROOM_TIMELINE,
  resolveMatrixRoomId,
} from './matrixRooms';
import { BATCH_SIZES, computeUnreadCount } from './unreadCount';

type RoomSummary = {
  readonly lastMessage?: ParsedMessage;
  readonly unreadCount: number;
  /** The user has pinned the conversation (its room carries their favourite tag). */
  readonly pinned: boolean;
};

type Summaries = ReadonlyMap<string, RoomSummary>;

// matrix-adapter's batch unread lookup runs at most this many rooms at once.
const MAX_CONCURRENT_ROOMS = 10;

/**
 * Per-conversation latest message, unread count and pin, computed from sync
 * for the rooms some hook currently watches. A room is computed once when
 * first watched (or once its Matrix room appears), then again only when its
 * own timeline or read marker changes. The pin follows the room's tags.
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
  // Rooms that changed while nobody watched them.
  private readonly stale = new Set<string>();
  private readonly pinWrites = new Set<string>();

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
      ROOM_LOCAL_ECHO_UPDATED as never,
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
    // A pin made on any of the user's devices arrives as a tags change on sync.
    client.on(
      ROOM_TAGS as never,
      ((_event: MatrixEvent, room: Room) => {
        const alkemioRoomId = this.alkemioByMatrixId.get(room.roomId);
        if (alkemioRoomId) {
          this.setPinned(alkemioRoomId, isFavourite(room));
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
            // A lookup that failed before the first sync (homeserver not yet
            // reachable) left no mapping; look it up again now.
            if (this.matrixByAlkemioId.has(alkemioRoomId)) {
              this.schedule(alkemioRoomId);
            } else {
              void this.resolve(alkemioRoomId);
            }
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
      if (count > 0) {
        continue;
      }
      // Watchers re-subscribe whenever the conversation list changes; a room
      // is computed again only if it is new or changed while unwatched.
      if (!this.matrixByAlkemioId.has(alkemioRoomId)) {
        void this.resolve(alkemioRoomId);
      } else if (!this.summaries.has(alkemioRoomId) || this.stale.has(alkemioRoomId)) {
        this.schedule(alkemioRoomId);
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

  /**
   * Pins or unpins at once, then writes the user's favourite tag. Rejects, with
   * the pin back as the room has it, when the room is not known yet or the
   * write fails. A toggle during a write is ignored, so two writes can never
   * reach the homeserver out of order.
   */
  async togglePin(alkemioRoomId: string): Promise<void> {
    const matrixRoomId = this.matrixByAlkemioId.get(alkemioRoomId);
    const room = matrixRoomId ? this.client.getRoom(matrixRoomId) : null;
    const summary = this.summaries.get(alkemioRoomId);
    if (!matrixRoomId || !room || !summary) {
      throw new Error(`No Matrix room for conversation room ${alkemioRoomId}`);
    }
    if (this.pinWrites.has(alkemioRoomId)) {
      return;
    }
    const pinned = !summary.pinned;
    this.pinWrites.add(alkemioRoomId);
    this.setPinned(alkemioRoomId, pinned);
    try {
      await (pinned
        ? this.client.setRoomTag(matrixRoomId, FAVOURITE_TAG)
        : this.client.deleteRoomTag(matrixRoomId, FAVOURITE_TAG));
    } catch (error) {
      this.setPinned(alkemioRoomId, isFavourite(room));
      throw error;
    } finally {
      this.pinWrites.delete(alkemioRoomId);
    }
  }

  private setPinned(alkemioRoomId: string, pinned: boolean): void {
    const summary = this.summaries.get(alkemioRoomId);
    if (!summary || summary.pinned === pinned) {
      return;
    }
    this.publish(alkemioRoomId, { ...summary, pinned });
  }

  private publish(alkemioRoomId: string, summary: RoomSummary): void {
    const next = new Map(this.summaries);
    next.set(alkemioRoomId, summary);
    this.summaries = next;
    for (const listener of this.listeners) {
      listener();
    }
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
    if (!alkemioRoomId) {
      return;
    }
    if (this.watchers.has(alkemioRoomId)) {
      this.schedule(alkemioRoomId);
    } else {
      this.stale.add(alkemioRoomId);
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
    this.stale.delete(alkemioRoomId);
    try {
      const homeserver = homeserverOf(this.client);
      const fetchBatch = fetchBackward(this.client, matrixRoomId);
      const loaded = liveEvents(room);
      const [lastMessage, unreadCount] = await Promise.all([
        this.findLastMessage(loaded, fetchBatch, homeserver),
        computeUnreadCount({
          markerEventId: fullyReadEventId(room),
          ownUserId: ownUserId(this.client),
          loadedNewestFirst: [...loaded].reverse(),
          fetchBatch,
          notificationCount: () => notificationCount(room),
        }),
      ]);
      // An existing pin is kept: tags changes and the user's own toggle own it.
      const pinned = this.summaries.get(alkemioRoomId)?.pinned ?? isFavourite(room);
      this.publish(alkemioRoomId, { lastMessage, unreadCount, pinned });
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
    for (const batchSize of BATCH_SIZES) {
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
 * Latest message, unread count and pin per Alkemio room id, from sync. Undefined
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

/**
 * A conversation's unread count as badges show it: the conversation being
 * viewed counts as read, as it did before its count came from sync, so a new
 * message there does not flash the badge before its read marker lands.
 */
const displayedUnreadCount = (
  summaries: Summaries | undefined,
  alkemioRoomId: string,
  viewedRoomId: string | null | undefined
): number => (alkemioRoomId === viewedRoomId ? 0 : (summaries?.get(alkemioRoomId)?.unreadCount ?? 0));

export { ConversationSummaryStore, displayedUnreadCount, storeFor, useConversationSummaries };
export type { RoomSummary, Summaries };
