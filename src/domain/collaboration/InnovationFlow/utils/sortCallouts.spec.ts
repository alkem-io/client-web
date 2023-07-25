import { sortCallouts, SortCalloutsParams } from './sortCallouts';

const testDataA: SortCalloutsParams['callouts'] = [
  { id: '111', sortOrder: 1, flowState: { currentState: 'A' } },
  { id: '222', sortOrder: 2, flowState: { currentState: 'A' } },
  { id: '333', sortOrder: 3, flowState: { currentState: 'A' } },
  { id: '444', sortOrder: 4, flowState: { currentState: 'A' } },
  { id: '555', sortOrder: 5, flowState: { currentState: 'A' } },
  { id: '666', sortOrder: 6, flowState: { currentState: 'A' } },
];

const testDataB: SortCalloutsParams['callouts'] = [
  { id: '111', sortOrder: 1, flowState: { currentState: 'A' } },
  { id: '222', sortOrder: 2, flowState: { currentState: 'A' } },
  { id: '333', sortOrder: 3, flowState: { currentState: 'A' } },
  { id: '444', sortOrder: 4, flowState: { currentState: 'B' } },
  { id: '555', sortOrder: 5, flowState: { currentState: 'B' } },
  { id: '666', sortOrder: 6, flowState: { currentState: 'B' } },
];

const testDataC: SortCalloutsParams['callouts'] = [
  { id: '111', sortOrder: 1, flowState: { currentState: 'A' } },
  { id: '222', sortOrder: 2, flowState: { currentState: 'A' } },
  { id: '333', sortOrder: 3, flowState: { currentState: 'A' } },
  { id: '444', sortOrder: 4, flowState: { currentState: 'C' } },
  { id: '555', sortOrder: 5, flowState: { currentState: 'C' } },
  { id: '666', sortOrder: 6, flowState: { currentState: 'C' } },
];

const runTest = (
  callouts: SortCalloutsParams['callouts'],
  movedCallout: SortCalloutsParams['movedCallout'],
  expectedResult: { optimisticSortOrder: number; sortedCalloutIds: string[] }
) => {
  const result = sortCallouts({ callouts, movedCallout });
  expect(result).toEqual(expectedResult);
};

describe('sortCallouts', () => {
  it('with an empty list of Callouts', () => {
    runTest([], { id: '111', newState: 'B', insertIndex: 0 }, { optimisticSortOrder: 0, sortedCalloutIds: ['111'] });
  });

  it('with only one callout', () => {
    runTest(
      [{ id: '111', sortOrder: 1, flowState: { currentState: 'A' } }],
      { id: '111', newState: 'C', insertIndex: 3 },
      { optimisticSortOrder: 0, sortedCalloutIds: ['111'] }
    );
  });

  it('move 111', () => {
    runTest(
      testDataA,
      { id: '111', newState: 'C', insertIndex: 0 },
      { optimisticSortOrder: 7, sortedCalloutIds: ['222', '333', '444', '555', '666', '111'] }
    );
  });
  it('move 222', () => {
    runTest(
      testDataA,
      { id: '222', newState: 'C', insertIndex: 0 },
      { optimisticSortOrder: 7, sortedCalloutIds: ['111', '333', '444', '555', '666', '222'] }
    );
  });
  it('move 333', () => {
    runTest(
      testDataA,
      { id: '333', newState: 'E', insertIndex: 0 },
      { optimisticSortOrder: 7, sortedCalloutIds: ['111', '222', '444', '555', '666', '333'] }
    );
  });

  it('move 111 to the beginning', () => {
    runTest(
      testDataB,
      { id: '111', newState: 'B', insertIndex: 0 },
      { optimisticSortOrder: 3.5, sortedCalloutIds: ['222', '333', '111', '444', '555', '666'] }
    );
  });
  it('move 111 to the middle', () => {
    runTest(
      testDataB,
      { id: '111', newState: 'B', insertIndex: 1 },
      { optimisticSortOrder: 4.5, sortedCalloutIds: ['222', '333', '444', '111', '555', '666'] }
    );
  });
  it('move 111 to the middle 2', () => {
    runTest(
      testDataB,
      { id: '111', newState: 'B', insertIndex: 2 },
      { optimisticSortOrder: 5.5, sortedCalloutIds: ['222', '333', '444', '555', '111', '666'] }
    );
  });
  it('move 111 to the last', () => {
    runTest(
      testDataB,
      { id: '111', newState: 'B', insertIndex: 3 },
      { optimisticSortOrder: 6.5, sortedCalloutIds: ['222', '333', '444', '555', '666', '111'] }
    );
  });
  it('move 111 to another state', () => {
    runTest(
      testDataB,
      { id: '111', newState: 'C', insertIndex: 0 },
      { optimisticSortOrder: 7, sortedCalloutIds: ['222', '333', '444', '555', '666', '111'] }
    );
  });

  it('move 222 to the beginning', () => {
    runTest(
      testDataB,
      { id: '222', newState: 'B', insertIndex: 0 },
      { optimisticSortOrder: 3.5, sortedCalloutIds: ['111', '333', '222', '444', '555', '666'] }
    );
  });
  it('move 222 to the middle', () => {
    runTest(
      testDataB,
      { id: '222', newState: 'B', insertIndex: 1 },
      { optimisticSortOrder: 4.5, sortedCalloutIds: ['111', '333', '444', '222', '555', '666'] }
    );
  });
  it('move 222 to the middle 2', () => {
    runTest(
      testDataB,
      { id: '222', newState: 'B', insertIndex: 2 },
      { optimisticSortOrder: 5.5, sortedCalloutIds: ['111', '333', '444', '555', '222', '666'] }
    );
  });
  it('move 222 to the last', () => {
    runTest(
      testDataB,
      { id: '222', newState: 'B', insertIndex: 3 },
      { optimisticSortOrder: 6.5, sortedCalloutIds: ['111', '333', '444', '555', '666', '222'] }
    );
  });
  it('move 222 to another state', () => {
    runTest(
      testDataB,
      { id: '222', newState: 'C', insertIndex: 0 },
      { optimisticSortOrder: 7, sortedCalloutIds: ['111', '333', '444', '555', '666', '222'] }
    );
  });

  it('move 222 to the state in between', () => {
    runTest(
      testDataC,
      { id: '222', newState: 'B', insertIndex: 0 },
      { optimisticSortOrder: 4, sortedCalloutIds: ['111', '333', '222', '444', '555', '666'] }
    );
  });
  it('move 222 to the state after last', () => {
    runTest(
      testDataC,
      { id: '222', newState: 'D', insertIndex: 1 },
      { optimisticSortOrder: 7, sortedCalloutIds: ['111', '333', '444', '555', '666', '222'] }
    );
  });
});
