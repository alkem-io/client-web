import { without } from 'lodash';

export interface OrderUpdate {
  (ids: string[]): string[];
}

interface Insert {
  (nextItems: string[], item: string, index: number): void;
}

const UpdateOrder = (setItems: (update: OrderUpdate) => void) => (insert: Insert) => (item: string) => {
  setItems(prevItems => {
    const index = prevItems.indexOf(item);
    const nextItems = without(prevItems, item);
    insert(nextItems, item, index);
    return nextItems;
  });
};

export default UpdateOrder;

interface CalloutWithDisplayLocation {
  id: string;
  profile: {
    displayLocationTagset?: {
      tags?: string[];
    };
  };
}
// Finding the item which will be 'prev' or 'next' item for the one with the provided ID.
/**
 * We need to find the callout that we are moving in the list of all callouts loaded.
 * Then see its position between the callouts in the same group.
 * Find the previous or next callout in that group. And then find the position of that one in the list of all callouts.
 */
export const findTargetItemIndex = (
  position: 'prev' | 'next',
  allCallouts: CalloutWithDisplayLocation[] | undefined,
  nextIds: string[],
  id: string
) => {
  const group = allCallouts?.find(callout => callout.id === id)?.profile.displayLocationTagset?.tags?.[0];
  const calloutsInGroup = allCallouts?.filter(c => c.profile.displayLocationTagset?.tags?.[0] === group);
  const indexInGroup = calloutsInGroup?.findIndex(c => c.id === id) ?? -1;
  if (!calloutsInGroup || indexInGroup === -1) {
    throw new Error(`Can't find ${position} item`);
  }
  if (position === 'prev') {
    const prevCalloutId = calloutsInGroup[indexInGroup - 1].id;
    return nextIds.findIndex(id => id === prevCalloutId);
  } else if (position === 'next') {
    const nextCalloutId = calloutsInGroup[indexInGroup + 1].id;
    return nextIds.findIndex(id => id === nextCalloutId) + 1;
  }
  throw new Error(`Can't find ${position} item`);
};
