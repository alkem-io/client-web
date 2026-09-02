import type { TFunction } from 'i18next';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CommentsWithMessagesModel } from '@/domain/communication/room/models/CommentsWithMessagesModel';
import { mapRoomToCommentData } from './commentDataMapper';

/**
 * Stand-in for the real `t` returned by `useTranslation()`. `formatTimeElapsed`
 * only calls `t('common.time.<format>.<key>', { count })` and
 * `t('common.time.<format>.timeAgo', { time })`, so we re-implement just
 * enough of the English `common.time.long` resource set to produce the
 * exact strings the production code does.
 */
const longFormatStrings: Record<string, string> = {
  'common.time.long.justNow': 'just now',
  'common.time.long.second_one': '{{count}} second',
  'common.time.long.second_other': '{{count}} seconds',
  'common.time.long.minute_one': '{{count}} minute',
  'common.time.long.minute_other': '{{count}} minutes',
  'common.time.long.hour_one': '{{count}} hour',
  'common.time.long.hour_other': '{{count}} hours',
  'common.time.long.day_one': '{{count}} day',
  'common.time.long.day_other': '{{count}} days',
  'common.time.long.month_one': '{{count}} month',
  'common.time.long.month_other': '{{count}} months',
  'common.time.long.year_one': '{{count}} year',
  'common.time.long.year_other': '{{count}} years',
  'common.time.long.moreThanYears_one': '> {{count}} year',
  'common.time.long.moreThanYears_other': '> {{count}} years',
};

const tStub = ((key: string, options?: { count?: number; time?: string }): string => {
  if (key === 'common.time.long.timeAgo') {
    return `${options?.time} ago`;
  }
  // Non-pluralised keys (e.g. justNow) are looked up directly first.
  if (longFormatStrings[key]) {
    return longFormatStrings[key];
  }
  const count = options?.count ?? 0;
  const pluralKey = count === 1 ? `${key}_one` : `${key}_other`;
  const template = longFormatStrings[pluralKey] ?? key;
  return template.replace('{{count}}', String(count));
}) as unknown as TFunction;

type Message = CommentsWithMessagesModel['messages'][number];

const baseMessage = (overrides: Partial<Message> & Pick<Message, 'id' | 'timestamp'>): Message => ({
  message: 'hello',
  reactions: [],
  ...overrides,
});

describe('mapRoomToCommentData', () => {
  beforeEach(() => {
    // Anchor "now" so relative-time assertions are deterministic.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-13T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns an empty list when the room is undefined', () => {
    expect(mapRoomToCommentData(undefined, { t: tStub })).toEqual([]);
  });

  it('renders sub-second diffs as "just now"', () => {
    const room: CommentsWithMessagesModel = {
      id: 'room-1',
      messagesCount: 1,
      authorization: { myPrivileges: [] },
      messages: [baseMessage({ id: 'm-1', timestamp: new Date('2026-05-13T12:00:00.000Z').getTime() })],
      vcInteractions: [],
    };

    const result = mapRoomToCommentData(room, { t: tStub });

    expect(result).toHaveLength(1);
    expect(result[0]?.timestamp).toBe('just now');
  });

  it('renders minute-level diffs in long form ("X minutes ago")', () => {
    const fiveMinutesAgo = new Date('2026-05-13T11:55:00.000Z').getTime();
    const room: CommentsWithMessagesModel = {
      id: 'room-2',
      messagesCount: 1,
      authorization: { myPrivileges: [] },
      messages: [baseMessage({ id: 'm-2', timestamp: fiveMinutesAgo })],
      vcInteractions: [],
    };

    const result = mapRoomToCommentData(room, { t: tStub });

    expect(result[0]?.timestamp).toBe('5 minutes ago');
  });

  it('renders hour-level diffs in long form ("X hours ago")', () => {
    const twoHoursAgo = new Date('2026-05-13T10:00:00.000Z').getTime();
    const room: CommentsWithMessagesModel = {
      id: 'room-3',
      messagesCount: 1,
      authorization: { myPrivileges: [] },
      messages: [baseMessage({ id: 'm-3', timestamp: twoHoursAgo })],
      vcInteractions: [],
    };

    const result = mapRoomToCommentData(room, { t: tStub });

    expect(result[0]?.timestamp).toBe('2 hours ago');
  });

  it('renders day-level diffs in long form ("X days ago")', () => {
    const threeDaysAgo = new Date('2026-05-10T12:00:00.000Z').getTime();
    const room: CommentsWithMessagesModel = {
      id: 'room-4',
      messagesCount: 1,
      authorization: { myPrivileges: [] },
      messages: [baseMessage({ id: 'm-4', timestamp: threeDaysAgo })],
      vcInteractions: [],
    };

    const result = mapRoomToCommentData(room, { t: tStub });

    expect(result[0]?.timestamp).toBe('3 days ago');
  });

  it('synthesises a placeholder for a missing parent and uses the earliest reply timestamp', () => {
    const olderReply = new Date('2026-05-13T11:50:00.000Z').getTime(); // 10 min ago
    const newerReply = new Date('2026-05-13T11:58:00.000Z').getTime(); // 2 min ago
    const room: CommentsWithMessagesModel = {
      id: 'room-5',
      messagesCount: 2,
      authorization: { myPrivileges: [] },
      messages: [
        baseMessage({ id: 'reply-1', timestamp: newerReply, threadID: 'deleted-parent' }),
        baseMessage({ id: 'reply-2', timestamp: olderReply, threadID: 'deleted-parent' }),
      ],
      vcInteractions: [],
    };

    const result = mapRoomToCommentData(room, { t: tStub });

    const placeholder = result.find(c => c.id === 'deleted-parent');
    expect(placeholder).toBeDefined();
    expect(placeholder?.isDeleted).toBe(true);
    // Placeholder should track the EARLIEST reply (10 minutes ago), not the
    // later one (2 minutes ago) — see mapper's age-comparison logic.
    expect(placeholder?.timestamp).toBe('10 minutes ago');
    expect(placeholder?.timestampMs).toBe(olderReply);
  });

  it('exposes the raw epoch ms via `timestampMs` for downstream sorting', () => {
    const messageA = new Date('2026-05-13T10:00:00.000Z').getTime();
    const messageB = new Date('2026-05-13T11:00:00.000Z').getTime();
    const room: CommentsWithMessagesModel = {
      id: 'room-6',
      messagesCount: 2,
      authorization: { myPrivileges: [] },
      messages: [baseMessage({ id: 'a', timestamp: messageA }), baseMessage({ id: 'b', timestamp: messageB })],
      vcInteractions: [],
    };

    const result = mapRoomToCommentData(room, { t: tStub });

    // The mapper preserves server insertion order; `CommentThread` re-sorts
    // by `timestampMs` for display. We only assert the field is populated
    // and correct — order is the thread component's concern.
    expect(result.find(c => c.id === 'a')?.timestampMs).toBe(messageA);
    expect(result.find(c => c.id === 'b')?.timestampMs).toBe(messageB);
  });
});
