import { describe, expect, it, vi } from 'vitest';
import { computeUnreadCount, type FetchBatch, type ScannedEvent } from './unreadCount';

const ME = '@me:hs';
const OTHER = '@other:hs';

// A room's events newest-first, served in the backward batches the walk asks for.
const roomOf = (newestFirst: ScannedEvent[]) => {
  const fetchBatch: FetchBatch = vi.fn(async (from, limit) => {
    const start = from ? Number(from) : 0;
    const events = newestFirst.slice(start, start + limit);
    const next = start + events.length;
    return { events, end: next < newestFirst.length ? String(next) : undefined };
  });
  return fetchBatch;
};

const message = (index: number, sender = OTHER): ScannedEvent => ({
  eventId: `$${index}`,
  type: 'm.room.message',
  sender,
});

describe('computeUnreadCount (matrix-adapter parity)', () => {
  it('counts other people’s messages back to the fully-read marker', async () => {
    const fetchBatch = roomOf([
      message(5),
      { eventId: '$r', type: 'm.reaction', sender: OTHER },
      message(4, ME),
      { eventId: '$s', type: 'm.sticker', sender: OTHER },
      message(3),
      message(2),
    ]);
    expect(
      await computeUnreadCount({ markerEventId: '$3', ownUserId: ME, fetchBatch, notificationCount: () => 99 })
    ).toBe(2);
  });

  it('uses the homeserver count when there is no marker, without walking', async () => {
    const fetchBatch = roomOf([message(1)]);
    expect(
      await computeUnreadCount({ markerEventId: undefined, ownUserId: ME, fetchBatch, notificationCount: () => 7 })
    ).toBe(7);
    expect(fetchBatch).not.toHaveBeenCalled();
  });

  it('walks in 5/10/20/50/200 batches and falls back when the marker is past ~285 events', async () => {
    const events = Array.from({ length: 400 }, (_, index) => message(400 - index));
    const fetchBatch = roomOf(events);
    const result = await computeUnreadCount({
      markerEventId: '$1',
      ownUserId: ME,
      fetchBatch,
      notificationCount: () => 42,
    });
    expect(result).toBe(42);
    expect((fetchBatch as ReturnType<typeof vi.fn>).mock.calls.map(call => call[1])).toEqual([5, 10, 20, 50, 200]);
  });

  it('counts everything when the room start is reached before the marker', async () => {
    const fetchBatch = roomOf([message(3), message(2), message(1)]);
    expect(
      await computeUnreadCount({ markerEventId: '$gone', ownUserId: ME, fetchBatch, notificationCount: () => 0 })
    ).toBe(3);
  });

  it('falls back to the homeserver count when fetching fails', async () => {
    const fetchBatch: FetchBatch = async () => {
      throw new Error('network');
    };
    expect(
      await computeUnreadCount({ markerEventId: '$1', ownUserId: ME, fetchBatch, notificationCount: () => 3 })
    ).toBe(3);
  });
});
