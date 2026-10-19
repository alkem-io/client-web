import { isMessageLike } from './matrixEvents';

/**
 * The per-room unread count exactly as matrix-adapter computes it: walk
 * backward from the newest event to the user's `m.fully_read` marker counting
 * other people's message-like events, over progressive batches (~285 events at
 * most); when there is no marker, or it is not reached within that window, use
 * the homeserver's own notification count instead.
 */

type ScannedEvent = {
  readonly eventId: string;
  readonly type: string;
  readonly sender: string;
};

type FetchBatch = (from: string | undefined, limit: number) => Promise<{ events: ScannedEvent[]; end?: string }>;

// matrix-adapter's progressive backward batches (~285 events in all).
const BATCH_SIZES = [5, 10, 20, 50, 200];
const WINDOW = BATCH_SIZES.reduce((sum, size) => sum + size, 0);

// Counts other people's message-like events until the marker, continuing a
// count already started on newer events.
const walk = (
  events: readonly ScannedEvent[],
  markerEventId: string,
  ownUserId: string,
  count = 0
): { count: number; found: boolean } => {
  for (const event of events) {
    if (event.eventId === markerEventId) {
      return { count, found: true };
    }
    if (isMessageLike(event.type) && event.sender !== ownUserId) {
      count++;
    }
  }
  return { count, found: false };
};

const countUnreadMessages = async (
  fetchBatch: FetchBatch,
  markerEventId: string,
  ownUserId: string
): Promise<{ count: number; found: boolean }> => {
  let from: string | undefined;
  let count = 0;

  for (const batchSize of BATCH_SIZES) {
    const { events, end } = await fetchBatch(from, batchSize);
    const step = walk(events, markerEventId, ownUserId, count);
    if (step.found || !end || events.length < batchSize) {
      return { count: step.count, found: true };
    }
    count = step.count;
    from = end;
  }

  return { count, found: false };
};

type UnreadInputs = {
  readonly markerEventId: string | undefined;
  readonly ownUserId: string;
  /** Events already held in memory, newest first; walked before any fetch. */
  readonly loadedNewestFirst: readonly ScannedEvent[];
  readonly fetchBatch: FetchBatch;
  /** The homeserver's notification count for the room. */
  readonly notificationCount: () => number;
};

const computeUnreadCount = async ({
  markerEventId,
  ownUserId,
  loadedNewestFirst,
  fetchBatch,
  notificationCount,
}: UnreadInputs): Promise<number> => {
  if (!markerEventId) {
    return notificationCount();
  }
  // The events already in memory answer most recomputes without a fetch; the
  // window matches the walk's own, so the result is the same either way.
  const loaded = walk(loadedNewestFirst.slice(0, WINDOW), markerEventId, ownUserId);
  if (loaded.found) {
    return loaded.count;
  }
  try {
    const { count, found } = await countUnreadMessages(fetchBatch, markerEventId, ownUserId);
    return found ? count : notificationCount();
  } catch {
    return notificationCount();
  }
};

export { BATCH_SIZES, computeUnreadCount, countUnreadMessages };
export type { FetchBatch, ScannedEvent };
