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

/**
 * Sorts callouts based on their flow state and sort order.
 * Handles the movement of a callout to a new position within its flow state, adjusting the sort order accordingly.
 * Ensures that the moved callout is placed after the next sibling in the reversed sorting order.
 *
 * @param {Callout[]} params.callouts - An array of callout objects to be sorted.
 * @param {MovedCallout} params.movedCallout - An object representing the callout being moved.
 * @returns {SortCalloutsReturnType} An object containing the sorted callout IDs and the new optimisticSortOrder of the moved callout.
 * optimisticSortOrder is used to display the drop position before the server update.
 */
export const sortCallouts = ({ callouts, movedCallout }: SortCalloutsParams): SortCalloutsReturnType => {
  const { id: calloutId, newState, insertIndex } = movedCallout;

  // Group all the callouts except the one we are moving;
  const calloutsByFlowState = groupBy(callouts, callout =>
    callout.id === calloutId ? FLOW_STATE_MOVING : callout.flowState?.currentState
  );

  const hasSiblings = !!calloutsByFlowState[newState];

  if (!hasSiblings) {
    // If the Callout is the only one in the group, we don't really care about the sort order
    return {
      optimisticSortOrder: 0,
      sortedCalloutIds: [movedCallout.id],
    };
  }

  // Get the IDs of callouts in the new state, excluding the moved callout
  const sortedCalloutIds = callouts.filter(callout => callout.flowState?.currentState === newState).map(({ id }) => id);

  // reverse the callouts as the sorting display order is reversed
  const reversedSortedCallouts = sortedCalloutIds.reverse();

  const nextSibling = calloutsByFlowState[newState][insertIndex];

  pull(reversedSortedCallouts, calloutId); // Remove the moved callout ID from the sorted list

  if (nextSibling) {
    const nextSiblingGlobalIndex = reversedSortedCallouts.indexOf(nextSibling.id);

    // + 1 because of the reversed order
    reversedSortedCallouts.splice(nextSiblingGlobalIndex + 1, 0, calloutId);
    const prevSibling = insertIndex === 0 ? undefined : calloutsByFlowState[newState][insertIndex - 1];
    // prev order is always higher then the nextSibling sortOrder
    const optimisticSortOrder = prevSibling
      ? prevSibling.sortOrder - (prevSibling.sortOrder - nextSibling.sortOrder) / 2
      : nextSibling.sortOrder + 1;

    return {
      sortedCalloutIds: reversedSortedCallouts,
      optimisticSortOrder,
    };
  } else {
    const optimisticSortOrder = last(calloutsByFlowState[newState])!.sortOrder - 1;
    // unshift because of the reversed order
    sortedCalloutIds.unshift(calloutId);

    return {
      sortedCalloutIds: reversedSortedCallouts,
      optimisticSortOrder,
    };
  }
};
