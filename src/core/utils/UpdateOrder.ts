import { Dispatch, SetStateAction } from 'react';
import { without } from 'lodash';

interface Insert {
  (nextItems: string[], item: string, index: number): void;
}

const UpdateOrder =
  (setItems: Dispatch<SetStateAction<string[]>>, sideEffect?: (nextItems: string[]) => void) =>
  (insert: Insert) =>
  (item: string) => {
    setItems(prevItems => {
      const index = prevItems.indexOf(item);
      const nextItems = without(prevItems, item);
      insert(nextItems, item, index);
      sideEffect?.(nextItems);
      return nextItems;
    });
  };

export default UpdateOrder;
