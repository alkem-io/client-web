import { without } from 'lodash';

export interface OrderUpdate {
  (ids: string[]): string[];
}

interface Insert {
  (nextItems: string[], item: string): void;
}

const UpdateOrder = (setItems: (update: OrderUpdate) => void) => (insert: Insert) => (item: string) => {
  setItems(prevItems => {
    const nextItems = without(prevItems, item);
    insert(nextItems, item);
    return nextItems;
  });
};

export default UpdateOrder;
