import { describe, expect, test } from 'vitest';
import { computeMessageRunFlags } from './messageRuns';
import type { ChatMessage } from './types';

type Msg = Pick<ChatMessage, 'isOwn' | 'author'>;

const from = (id: string): Msg => ({ isOwn: false, author: { id, name: id } });
const own = (): Msg => ({ isOwn: true, author: { id: 'me', name: 'Me' } });
const authorless = (): Msg => ({ isOwn: false, author: undefined });

describe('computeMessageRunFlags', () => {
  test('single message from another participant: first-of-run, avatar + name', () => {
    const flags = computeMessageRunFlags([from('a')], true);
    expect(flags).toEqual([{ showAuthor: true, showAvatar: true, avatarGutter: true }]);
  });

  test('N consecutive same-sender messages: only the first shows avatar/name', () => {
    const flags = computeMessageRunFlags([from('a'), from('a'), from('a')], true);
    expect(flags).toEqual([
      { showAuthor: true, showAvatar: true, avatarGutter: true },
      { showAuthor: false, showAvatar: false, avatarGutter: true },
      { showAuthor: false, showAvatar: false, avatarGutter: true },
    ]);
  });

  test('alternation A,B,A restarts a run on every change', () => {
    const flags = computeMessageRunFlags([from('a'), from('b'), from('a')], true);
    expect(flags).toEqual([
      { showAuthor: true, showAvatar: true, avatarGutter: true },
      { showAuthor: true, showAvatar: true, avatarGutter: true },
      { showAuthor: true, showAvatar: true, avatarGutter: true },
    ]);
  });

  test('an own message breaks the run and never carries an avatar/name/gutter', () => {
    const flags = computeMessageRunFlags([from('a'), own(), from('a')], true);
    expect(flags).toEqual([
      { showAuthor: true, showAvatar: true, avatarGutter: true },
      { showAuthor: false, showAvatar: false, avatarGutter: false },
      { showAuthor: true, showAvatar: true, avatarGutter: true },
    ]);
  });

  test('an authorless message breaks the run and gets gutter-only flags', () => {
    const flags = computeMessageRunFlags([from('a'), authorless(), from('a')], true);
    expect(flags).toEqual([
      { showAuthor: true, showAvatar: true, avatarGutter: true },
      { showAuthor: false, showAvatar: false, avatarGutter: true },
      { showAuthor: true, showAvatar: true, avatarGutter: true },
    ]);
  });

  test('isGroup=false: all-false for a mixed list, regardless of sender pattern', () => {
    const flags = computeMessageRunFlags([from('a'), from('a'), own(), authorless()], false);
    expect(flags).toEqual([
      { showAuthor: false, showAvatar: false, avatarGutter: false },
      { showAuthor: false, showAvatar: false, avatarGutter: false },
      { showAuthor: false, showAvatar: false, avatarGutter: false },
      { showAuthor: false, showAvatar: false, avatarGutter: false },
    ]);
  });

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
