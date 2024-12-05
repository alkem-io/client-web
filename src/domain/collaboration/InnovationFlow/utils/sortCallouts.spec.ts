import { sortCallouts, SortCalloutsParams } from './sortCallouts';
import { groupBy, mapValues, sortBy } from 'lodash';
import { expect, test, describe } from 'vitest';

enum FlowStates {
  A = 'A',
  B = 'B',
  C = 'C',
}

const callouts: SortCalloutsParams['callouts'] = [
  { id: '1', sortOrder: 1, flowState: { currentState: FlowStates.A } },
  { id: '2', sortOrder: 5, flowState: { currentState: FlowStates.A } },
  { id: '3', sortOrder: 6, flowState: { currentState: FlowStates.B } },
  { id: '4', sortOrder: 4, flowState: { currentState: FlowStates.A } },
  { id: '5', sortOrder: 2, flowState: { currentState: FlowStates.A } },
  { id: '6', sortOrder: 3, flowState: { currentState: FlowStates.B } },
];

const sortAndGroup = (movedCallout: SortCalloutsParams['movedCallout']) => {
  const sourceSortedCallouts = sortBy(callouts, 'sortOrder');
  const { sortedCalloutIds, optimisticSortOrder } = sortCallouts({ callouts: sourceSortedCallouts, movedCallout });
  const resultSortedCallouts = sortedCalloutIds.map(calloutId => callouts.find(({ id }) => id === calloutId)!);
  const groupedCallouts = groupBy(resultSortedCallouts, callout => {
    return callout.id === movedCallout.id ? movedCallout.newState : callout.flowState?.currentState;
  });
  return {
    groupedCalloutIds: mapValues(groupedCallouts, callouts => callouts.map(({ id }) => id).reverse()),
    optimisticSortOrder,
  };
};

describe('sortCallouts handling grouped Callouts', () => {
  test('does not change sortedCalloutIds if the moved Callout is the only one in the target group', () => {
    expect(
      sortAndGroup({
        id: '4',
        insertIndex: 0,
        newState: FlowStates.C,
      }).groupedCalloutIds
    ).toEqual({
      // [FlowStates.A]: ['1', '5', '2'],
      // [FlowStates.B]: ['6', '3'],
      [FlowStates.C]: ['4'],
    });
  });

  test('handles the Callout that goes to the end of the target group', () => {
    expect(
      sortAndGroup({
        id: '4',
        insertIndex: 2,
        newState: FlowStates.B,
      }).groupedCalloutIds
    ).toEqual({
      // [FlowStates.A]: ['1', '5', '2'],
      [FlowStates.B]: ['6', '3', '4'],
    });
  });

  test('handles the Callout that goes to the middle of the target group', () => {
    expect(
      sortAndGroup({
        id: '4',
        insertIndex: 1,
        newState: FlowStates.B,
      }).groupedCalloutIds
    ).toEqual({
      // [FlowStates.A]: ['1', '5', '2'],
      [FlowStates.B]: ['6', '4', '3'],
    });
  });

  test('handles the Callout that goes to the top of the target group', () => {
    expect(
      sortAndGroup({
        id: '6',
        insertIndex: 0,
        newState: FlowStates.A,
      }).groupedCalloutIds
    ).toEqual({
      [FlowStates.A]: ['6', '1', '5', '4', '2'],
      // [FlowStates.B]: ['3'],
    });
  });

  test('handles the Callout that moves within the same group', () => {
    expect(
      sortAndGroup({
        id: '4',
        insertIndex: 1,
        newState: FlowStates.A,
      }).groupedCalloutIds
    ).toEqual({
      [FlowStates.A]: ['1', '4', '5', '2'],
      // [FlowStates.B]: ['6', '3'],
    });
  });

  test('handles the Callout that stays in the same place', () => {
    expect(
      sortAndGroup({
        id: '4',
        insertIndex: 2,
        newState: FlowStates.A,
      }).groupedCalloutIds
    ).toEqual({
      [FlowStates.A]: ['1', '5', '4', '2'],
      // [FlowStates.B]: ['6', '3'],
    });
  });
});

describe('sortCallouts providing optimistic sortOrder', () => {
  test('gives 0 if the moved Callout is the only one in the target group', () => {
    expect(
      sortAndGroup({
        id: '4',
        insertIndex: 0,
        newState: FlowStates.C,
      }).optimisticSortOrder
    ).toEqual(0);
  });

  test('gives max sortOrder + 1 if the Callout goes to the end (start) of the target group', () => {
    expect(
      sortAndGroup({
        id: '4',
        insertIndex: 2,
        newState: FlowStates.B,
      }).optimisticSortOrder
    ).toEqual(7);
  });

  test('for the Callout that goes to the middle of the target group, gives sortOrder in between prev and next items', () => {
    const { optimisticSortOrder } = sortAndGroup({
      id: '4',
      insertIndex: 1,
      newState: FlowStates.B,
    });
    expect(optimisticSortOrder).toBeGreaterThan(3);
    expect(optimisticSortOrder).toBeLessThan(6);
  });

  test('for the Callout that goes to the top of the target group, gives sortOrder greater that of the next item', () => {
    const { optimisticSortOrder } = sortAndGroup({
      id: '4',
      insertIndex: 0,
      newState: FlowStates.B,
    });
    expect(optimisticSortOrder).toBeGreaterThan(3);
  });
});
