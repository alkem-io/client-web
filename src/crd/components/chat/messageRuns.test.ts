import { describe, expect, test } from 'vitest';
import { computeMessageRunFlags } from './messageRuns';
import type { ChatMessage } from './types';

type Msg = Pick<ChatMessage, 'isOwn' | 'author' | 'timestampMs'>;

// Local wall-clock times, so day boundaries hold in every test timezone.
const at = (day: number, hours: number, minutes = 0) => new Date(2026, 9, day, hours, minutes).getTime();
const T0 = at(14, 9);
const MIN = 60 * 1000;

const from = (id: string, timestampMs = T0): Msg => ({ isOwn: false, author: { id, name: id }, timestampMs });
const own = (timestampMs = T0): Msg => ({ isOwn: true, author: { id: 'me', name: 'Me' }, timestampMs });
const authorless = (timestampMs = T0): Msg => ({ isOwn: false, author: undefined, timestampMs });

const positions = (messages: Msg[], isGroup = true) =>
  computeMessageRunFlags(messages, isGroup).map(flags => flags.groupPosition);

describe('computeMessageRunFlags — avatar and name (group threads only)', () => {
  test('single message from another participant: avatar + name, gutter', () => {
    const [flags] = computeMessageRunFlags([from('a')], true);
    expect(flags).toMatchObject({ showAuthor: true, showAvatar: true, avatarGutter: true });
  });

  test('N consecutive same-sender messages within 5 minutes: only the first shows avatar/name', () => {
    const flags = computeMessageRunFlags([from('a', T0), from('a', T0 + MIN), from('a', T0 + 2 * MIN)], true);
    expect(flags.map(f => [f.showAuthor, f.showAvatar, f.avatarGutter])).toEqual([
      [true, true, true],
      [false, false, true],
      [false, false, true],
    ]);
  });

  test('alternation A,B,A restarts a group on every change', () => {
    const flags = computeMessageRunFlags([from('a'), from('b'), from('a')], true);
    expect(flags.map(f => f.showAuthor)).toEqual([true, true, true]);
  });

  test('an own message breaks the group and never carries an avatar/name/gutter', () => {
    const flags = computeMessageRunFlags([from('a'), own(), from('a')], true);
    expect(flags.map(f => [f.showAuthor, f.showAvatar, f.avatarGutter])).toEqual([
      [true, true, true],
      [false, false, false],
      [true, true, true],
    ]);
  });

  test('an authorless message breaks the group and gets gutter-only flags', () => {
    const flags = computeMessageRunFlags([from('a'), authorless(), from('a')], true);
    expect(flags.map(f => [f.showAuthor, f.showAvatar, f.avatarGutter])).toEqual([
      [true, true, true],
      [false, false, true],
      [true, true, true],
    ]);
  });

  test('1:1 threads show no avatar, name or gutter, whatever the sender pattern', () => {
    const flags = computeMessageRunFlags([from('a'), from('a'), own(), authorless()], false);
    for (const f of flags) {
      expect(f).toMatchObject({ showAuthor: false, showAvatar: false, avatarGutter: false });
    }
  });

  test('a gap over 5 minutes shows the avatar and name again', () => {
    const flags = computeMessageRunFlags([from('a', T0), from('a', T0 + 6 * MIN)], true);
    expect(flags.map(f => f.showAuthor)).toEqual([true, true]);
  });
});

describe('computeMessageRunFlags — grouping by sender and time', () => {
  test('same sender within 5 minutes of the previous message groups (first / middle / last)', () => {
    expect(positions([from('a', T0), from('a', T0 + 4 * MIN), from('a', T0 + 8 * MIN)])).toEqual([
      'first',
      'middle',
      'last',
    ]);
  });

  test('exactly 5 minutes still groups; just over 5 minutes breaks', () => {
    expect(positions([from('a', T0), from('a', T0 + 5 * MIN)])).toEqual(['first', 'last']);
    expect(positions([from('a', T0), from('a', T0 + 5 * MIN + 1)])).toEqual(['single', 'single']);
  });

  test('6 minutes apart breaks the group', () => {
    expect(positions([from('a', T0), from('a', T0 + 6 * MIN)])).toEqual(['single', 'single']);
  });

  test('own consecutive messages group too', () => {
    expect(positions([own(T0), own(T0 + MIN)])).toEqual(['first', 'last']);
  });

  test('1:1 threads group as well (corners), without avatars', () => {
    expect(positions([from('a', T0), from('a', T0 + MIN)], false)).toEqual(['first', 'last']);
  });

  test('another sender in between breaks the group', () => {
    expect(positions([from('a', T0), from('b', T0 + MIN), from('a', T0 + 2 * MIN)])).toEqual([
      'single',
      'single',
      'single',
    ]);
  });

  test('a midnight crossing breaks the group even within 5 minutes', () => {
    expect(positions([from('a', at(14, 23, 58)), from('a', at(15, 0, 1))])).toEqual(['single', 'single']);
  });

  test('authorless messages never group', () => {
    expect(positions([authorless(T0), authorless(T0 + MIN)])).toEqual(['single', 'single']);
  });
});

describe('computeMessageRunFlags — day starts and pauses', () => {
  test('the first message with a time starts a day', () => {
    const flags = computeMessageRunFlags([from('a', T0), from('a', T0 + MIN)], true);
    expect(flags.map(f => f.dayStart)).toEqual([true, false]);
  });

  test('a new local day starts a day, not a pause', () => {
    const flags = computeMessageRunFlags([from('a', at(14, 23, 0)), from('a', at(15, 9, 0))], true);
    expect(flags.map(f => [f.dayStart, f.afterPause])).toEqual([
      [true, false],
      [true, false],
    ]);
  });

  test('a gap of 1 hour or more on the same day marks a pause; 59 minutes does not', () => {
    const pause = computeMessageRunFlags([from('a', T0), own(T0 + 61 * MIN)], true);
    expect(pause.map(f => f.afterPause)).toEqual([false, true]);
    const exact = computeMessageRunFlags([from('a', T0), own(T0 + 60 * MIN)], true);
    expect(exact.map(f => f.afterPause)).toEqual([false, true]);
    const short = computeMessageRunFlags([from('a', T0), own(T0 + 59 * MIN)], true);
    expect(short.map(f => f.afterPause)).toEqual([false, false]);
  });

  test('a message without a time (synthetic intro) starts nothing; the next real message starts the day', () => {
    const flags = computeMessageRunFlags([from('vc', 0), from('vc', T0)], false);
    expect(flags.map(f => [f.dayStart, f.afterPause, f.groupPosition])).toEqual([
      [false, false, 'single'],
      [true, false, 'single'],
    ]);
  });
});

describe('computeMessageRunFlags — contract', () => {
  test('empty list returns an empty array', () => {
    expect(computeMessageRunFlags([], true)).toEqual([]);
  });

  test('does not mutate the input', () => {
    const messages = [from('a'), from('a')];
    const snapshot = JSON.parse(JSON.stringify(messages));
    computeMessageRunFlags(messages, true);
    expect(messages).toEqual(snapshot);
  });
});
