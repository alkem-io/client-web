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
  timestamp: index,
  content: { msgtype: 'm.text', body: `message ${index}` },
});

describe('computeUnreadCount (matrix-adapter parity)', () => {
  it('counts other people’s messages back to the fully-read marker', async () => {
    const fetchBatch = roomOf([
      message(5),
      { eventId: '$r', type: 'm.reaction', sender: OTHER, timestamp: 0, content: {} },
      message(4, ME),
      { eventId: '$s', type: 'm.sticker', sender: OTHER, timestamp: 0, content: {} },
      message(3),
      message(2),
    ]);
    expect(
      await computeUnreadCount({
        markerEventId: '$3',
        ownUserId: ME,
        loadedNewestFirst: [],
        fetchBatch,
        notificationCount: () => 99,
      })
    ).toBe(2);
  });

  it('uses the homeserver count when there is no marker, without walking', async () => {
    const fetchBatch = roomOf([message(1)]);
    expect(
      await computeUnreadCount({
        markerEventId: undefined,
        ownUserId: ME,
        loadedNewestFirst: [],
        fetchBatch,
        notificationCount: () => 7,
      })
    ).toBe(7);
    expect(fetchBatch).not.toHaveBeenCalled();
  });

  it('walks in 5/10/20/50/200 batches and falls back when the marker is past ~285 events', async () => {
    const events = Array.from({ length: 400 }, (_, index) => message(400 - index));
    const fetchBatch = roomOf(events);
    const result = await computeUnreadCount({
      markerEventId: '$1',
      ownUserId: ME,
      loadedNewestFirst: [],
      fetchBatch,
      notificationCount: () => 42,
    });
    expect(result).toBe(42);
    expect((fetchBatch as ReturnType<typeof vi.fn>).mock.calls.map(call => call[1])).toEqual([5, 10, 20, 50, 200]);
  });

  it('counts everything when the room start is reached before the marker', async () => {
    const fetchBatch = roomOf([message(3), message(2), message(1)]);
    expect(
      await computeUnreadCount({
        markerEventId: '$gone',
        ownUserId: ME,
        loadedNewestFirst: [],
        fetchBatch,
        notificationCount: () => 0,
      })
    ).toBe(3);
  });

  it('falls back to the homeserver count when fetching fails', async () => {
    const fetchBatch: FetchBatch = async () => {
      throw new Error('network');
    };
    expect(
      await computeUnreadCount({
        markerEventId: '$1',
        ownUserId: ME,
        loadedNewestFirst: [],
        fetchBatch,
        notificationCount: () => 3,
      })
    ).toBe(3);
  });

  it('answers from the events already in memory without fetching when the marker is among them', async () => {
    const fetchBatch = roomOf([]);
    expect(
      await computeUnreadCount({
        markerEventId: '$2',
        ownUserId: ME,
        loadedNewestFirst: [message(4), message(3, ME), message(2), message(1)],
        fetchBatch,
        notificationCount: () => 99,
      })
    ).toBe(1);
    expect(fetchBatch).not.toHaveBeenCalled();
  });

  it('keeps the ~285-event window in memory too: a marker deeper than that falls back', async () => {
    const loaded = Array.from({ length: 400 }, (_, index) => message(400 - index));
    const fetchBatch = roomOf(loaded);
    expect(
      await computeUnreadCount({
        markerEventId: '$1',
        ownUserId: ME,
        loadedNewestFirst: loaded,
        fetchBatch,
        notificationCount: () => 42,
      })
    ).toBe(42);
  });
});

describe('computeUnreadCount with calls', () => {
  const ring = (eventId: string, timestamp: number, sender = OTHER): ScannedEvent => ({
    eventId,
    type: 'org.matrix.msc4075.rtc.notification',
    sender,
    timestamp,
    content: { notification_type: 'ring', lifetime: 30_000 },
  });
  const join = (eventId: string, timestamp: number, sender: string): ScannedEvent => ({
    eventId,
    type: 'org.matrix.msc4143.rtc.member',
    sender,
    timestamp,
    content: { member: { id: 'm', membership: 'join' } },
  });
  const count = (newestFirst: ScannedEvent[], { loaded = false, withCalls = true } = {}) => {
    const fetchBatch = roomOf(newestFirst);
    return {
      fetchBatch,
      result: computeUnreadCount({
        markerEventId: '$1',
        ownUserId: ME,
        loadedNewestFirst: loaded ? newestFirst : [],
        fetchBatch,
        notificationCount: () => 99,
        withCalls,
      }),
    };
  };

  it('counts a missed call from the other person', async () => {
    expect(await count([ring('$ring', 1_000), message(1)]).result).toBe(1);
  });

  it('does not count a ring the user answered, even when the join came in an earlier batch', async () => {
    const newestFirst = [
      ...Array.from({ length: 6 }, (_, index) => message(100 + index, ME)),
      join('$join', 2_000, ME),
      ring('$ring', 1_000),
      message(1),
    ];
    expect(await count(newestFirst).result).toBe(0);
  });

  it('does not count the user’s own ring, nor any ring where calls are not shown', async () => {
    expect(await count([ring('$ring', 1_000, ME), message(1)]).result).toBe(0);
    expect(await count([ring('$ring', 1_000), message(1)], { withCalls: false }).result).toBe(0);
  });

  it('answers from memory when the marker is loaded', async () => {
    const { fetchBatch, result } = count([ring('$ring', 1_000), message(1)], { loaded: true });
    expect(await result).toBe(1);
    expect(fetchBatch).not.toHaveBeenCalled();
  });
});
