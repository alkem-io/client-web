import { groupBy } from 'lodash';

export interface SortCalloutsParams {
  callouts: {
    id: string;
    sortOrder: number;
    flowState?: {
      currentState: string | undefined;
    };
  }[];
  availableStates: string[];
  movedCallout: {
    id: string;
    newState: string;
    insertIndex: number;
  };
}

export const sortCallouts = ({ callouts, availableStates, movedCallout }: SortCalloutsParams) => {
  const { id: calloutId, newState, insertIndex } = movedCallout;

  const sortedCalloutIds: string[] = [];
  let optimisticSortOrder = 0;
  let lastSortOrder = -1;
  const sortedCallouts = groupBy(
    // Group all the callouts except the one we are moving;
    callouts
      .filter(callout => callout.id !== calloutId)
      .map(callout => ({
        id: callout.id,
        sortOrder: callout.sortOrder,
        currentFlowState: callout.flowState?.currentState,
      })),
    callout => callout.currentFlowState
  );

  availableStates.forEach(state => {
    const calloutsInState = sortedCallouts[state] ?? [];
    if (state === newState) {
      // This is the State where the callout has been dropped, add the Id in this position
      const ids = calloutsInState.map(callout => callout.id);
      ids.splice(insertIndex, 0, calloutId);
      sortedCalloutIds.push(...ids);
      // If there is no other elments in this group, set the optimisticSortOrder = last element added in the array:
      if (calloutsInState.length === 0) {
        optimisticSortOrder = lastSortOrder + 1;
      } else if (calloutsInState.length > insertIndex) {
        // If there were other elements set a sort order slightly smaller than the one in the position where we want to insert it:
        optimisticSortOrder = calloutsInState[insertIndex].sortOrder - 0.5;
      } else {
        // If the index is too big, use the last one
        optimisticSortOrder = calloutsInState[calloutsInState.length - 1].sortOrder + 0.5;
      }
    } else {
      // Not in the destination group, just add the calloutIds to the list:
      sortedCalloutIds.push(...calloutsInState.map(callout => callout.id));
      // Keep the sort order of the last element added:
      lastSortOrder =
        calloutsInState.length > 0 ? Math.max(...calloutsInState.map(callout => callout.sortOrder)) : lastSortOrder;
    }
  });
  return { optimisticSortOrder, sortedCalloutIds };
};
