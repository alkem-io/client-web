import { without } from 'lodash';
import { Identifiable } from '../../domain/shared/types/Identifiable';

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

// Finding the item which will be 'prev' or 'next' item for the one with the provided ID.
export const findTargetItemIndex = (position: 'prev' | 'next', items: Identifiable[], id: string) => {
  const indexDelta = position === 'prev' ? -1 : 1;
  const targetCalloutIndex = items?.findIndex((callout, i) => items[i - indexDelta]?.id === id);
  if (targetCalloutIndex === -1) {
    throw new Error(`Can't find ${position} item`);
  }
  return targetCalloutIndex;
};
