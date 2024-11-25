import { groupBy, last, pull } from 'lodash';

export interface SortCalloutsParams {
  callouts: {
    id: string;
    sortOrder: number;
    flowState?: {
      currentState: string | undefined;
    };
  }[];
  movedCallout: {
    id: string;
    newState: string;
    insertIndex: number;
  };
}

type SortCalloutsReturnType = {
  sortedCalloutIds: string[];
  optimisticSortOrder: number;
};

const FLOW_STATE_MOVING = Symbol('Moving');

export const sortCallouts = ({ callouts, movedCallout }: SortCalloutsParams): SortCalloutsReturnType => {
  const { id: calloutId, newState, insertIndex } = movedCallout;

  const calloutsByFlowState = groupBy(
    // Group all the callouts except the one we are moving;
    callouts,
    callout => (callout.id === calloutId ? FLOW_STATE_MOVING : callout.flowState?.currentState)
  );

  const hasSiblings = !!calloutsByFlowState[newState];

  if (!hasSiblings) {
    // If the Callout is the only one in the group, we don't really care about the sort order
    return {
      optimisticSortOrder: 0,
      sortedCalloutIds: [movedCallout.id],
    };
  }

  const sortedCalloutIds = callouts.filter(callout => callout.flowState?.currentState === newState).map(({ id }) => id);
  const nextSibling = calloutsByFlowState[newState][insertIndex];

  pull(sortedCalloutIds, calloutId);

  if (nextSibling) {
    const nextSiblingGlobalIndex = sortedCalloutIds.indexOf(nextSibling.id);
    sortedCalloutIds.splice(nextSiblingGlobalIndex, 0, calloutId);
    const prevSibling = insertIndex === 0 ? undefined : calloutsByFlowState[newState][insertIndex - 1];
    const optimisticSortOrder = prevSibling
      ? nextSibling.sortOrder - (nextSibling.sortOrder - prevSibling.sortOrder) / 2
      : nextSibling.sortOrder - 1;
    return {
      sortedCalloutIds,
      optimisticSortOrder,
    };
  } else {
    const optimisticSortOrder = last(calloutsByFlowState[newState])!.sortOrder + 1;
    sortedCalloutIds.push(calloutId);
    return {
      sortedCalloutIds,
      optimisticSortOrder,
    };
  }
};
