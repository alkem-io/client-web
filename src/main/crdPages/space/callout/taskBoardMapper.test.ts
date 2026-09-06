import { describe, expect, it } from 'vitest';
import type { TaskBoardCalloutFragment, TaskBoardContributionFragment } from '@/core/apollo/generated/graphql-schema';
import { CalloutContributionType } from '@/core/apollo/generated/graphql-schema';
import { applyMoveToCounts, contributionColumnTag, mapTaskBoardColumns } from './taskBoardMapper';

const callout = {
  id: 'callout-1',
  settings: { contribution: { allowedTypes: [CalloutContributionType.Post] } },
  classification: { id: 'c', tagsets: [{ id: 't', name: 'task', allowedValues: ['Backlog', 'To do', 'Done'] }] },
  taskColumnCounts: [
    { column: 'Backlog', count: 5 },
    { column: 'To do', count: 0 },
    { column: 'Done', count: 2 },
  ],
} as unknown as TaskBoardCalloutFragment;

function contribution(id: string, column: string, extra: Record<string, unknown> = {}): TaskBoardContributionFragment {
  return {
    id,
    sortOrder: 1,
    classification: { id: `cl-${id}`, tagsets: [{ id: `ts-${id}`, name: 'task', tags: [column] }] },
    post: {
      id: `post-${id}`,
      createdBy: undefined,
      profile: { id: `p-${id}`, displayName: `Task ${id}`, description: undefined, tagset: undefined },
      comments: { id: `r-${id}`, messagesCount: 0 },
      ...extra,
    },
  } as unknown as TaskBoardContributionFragment;
}

describe('mapTaskBoardColumns', () => {
  it('orders columns from the marker tagset and counts from taskColumnCounts', () => {
    const columns = mapTaskBoardColumns(callout, []);
    expect(columns.map(c => c.name)).toEqual(['Backlog', 'To do', 'Done']);
    expect(columns.map(c => c.count)).toEqual([5, 0, 2]);
  });

  it('groups contributions under their column, keeping the count independent of card count', () => {
    const columns = mapTaskBoardColumns(callout, [contribution('a', 'Backlog'), contribution('b', 'Done')]);
    const backlog = columns.find(c => c.name === 'Backlog');
    expect(backlog?.cards.map(card => card.id)).toEqual(['a']);
    // Count stays authoritative even though only one card is present.
    expect(backlog?.count).toBe(5);
  });

  it('maps description, tags, and comment count into the card model', () => {
    const rich = contribution('a', 'Backlog', {
      createdBy: { id: 'u', profile: { id: 'pu', displayName: 'Ada', avatar: { id: 'v', uri: 'http://a' } } },
      profile: { id: 'pa', displayName: 'Rich task', description: 'desc', tagset: { id: 'tg', tags: ['x'] } },
      comments: { id: 'rr', messagesCount: 4 },
    });
    const columns = mapTaskBoardColumns(callout, [rich]);
    const card = columns.find(c => c.name === 'Backlog')?.cards[0];
    expect(card).toMatchObject({
      title: 'Rich task',
      description: 'desc',
      tags: ['x'],
      commentCount: 4,
    });
    // Task cards intentionally carry no author (a column can hold contributions
    // from many members — a single avatar would be misleading). R2.
    expect(card).not.toHaveProperty('author');
  });
});

describe('contributionColumnTag', () => {
  it('returns the task tag', () => {
    expect(contributionColumnTag(contribution('a', 'Done'))).toBe('Done');
  });
});

describe('applyMoveToCounts', () => {
  const counts = [
    { column: 'Backlog', count: 3 },
    { column: 'Done', count: 1 },
  ];

  it('decrements the source and increments the destination', () => {
    expect(applyMoveToCounts(counts, 'Backlog', 'Done')).toEqual([
      { column: 'Backlog', count: 2 },
      { column: 'Done', count: 2 },
    ]);
  });

  it('only increments the destination when the source is unknown', () => {
    expect(applyMoveToCounts(counts, undefined, 'Done')).toEqual([
      { column: 'Backlog', count: 3 },
      { column: 'Done', count: 2 },
    ]);
  });

  it('is case-insensitive and clamps the source at zero', () => {
    expect(
      applyMoveToCounts(
        [
          { column: 'Backlog', count: 0 },
          { column: 'Done', count: 2 },
        ],
        'backlog',
        'DONE'
      )
    ).toEqual([
      { column: 'Backlog', count: 0 },
      { column: 'Done', count: 3 },
    ]);
  });

  it('is a no-op when source and destination normalize to the same column', () => {
    // A task tagged "to do" renders in the "To do" column; dropping it back there
    // must not decrement (nor increment) the count.
    expect(applyMoveToCounts([{ column: 'To do', count: 4 }], 'to do', 'To do')).toEqual([
      { column: 'To do', count: 4 },
    ]);
  });

  it('does not mutate the input', () => {
    const original = [{ column: 'Backlog', count: 3 }];
    applyMoveToCounts(original, 'Backlog', 'Done');
    expect(original).toEqual([{ column: 'Backlog', count: 3 }]);
  });
});
