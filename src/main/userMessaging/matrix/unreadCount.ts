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

const BATCH_SIZES = [5, 10, 20, 50, 200];

const countUnreadMessages = async (
  fetchBatch: FetchBatch,
  markerEventId: string,
  ownUserId: string
): Promise<{ count: number; found: boolean }> => {
  let from: string | undefined;
  let count = 0;

  for (const batchSize of BATCH_SIZES) {
    const { events, end } = await fetchBatch(from, batchSize);
    for (const event of events) {
      if (event.eventId === markerEventId) {
        return { count, found: true };
      }
      if (isMessageLike(event.type) && event.sender !== ownUserId) {
        count++;
      }
    }
    if (!end || events.length < batchSize) {
      return { count, found: true };
    }
    from = end;
  }

  return { count, found: false };
};

type UnreadInputs = {
  readonly markerEventId: string | undefined;
  readonly ownUserId: string;
  readonly fetchBatch: FetchBatch;
  /** The homeserver's notification count for the room. */
  readonly notificationCount: () => number;
};

const computeUnreadCount = async ({
  markerEventId,
  ownUserId,
  fetchBatch,
  notificationCount,
}: UnreadInputs): Promise<number> => {
  if (!markerEventId) {
    return notificationCount();
  }
  try {
    const { count, found } = await countUnreadMessages(fetchBatch, markerEventId, ownUserId);
    return found ? count : notificationCount();
  } catch {
    return notificationCount();
  }
};

export { computeUnreadCount, countUnreadMessages };
export type { FetchBatch, ScannedEvent };
