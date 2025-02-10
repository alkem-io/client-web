import { isEqual } from 'lodash';
import {
  ExcalidrawElement,
  ExcalidrawLinearElement,
  type OrderedExcalidrawElement,
} from '@alkemio/excalidraw/dist/excalidraw/element/types';

export type ExcalidrawElementDelta = Partial<ExcalidrawElement> & {
  _brand: 'delta';
};

/**
 * Detects the changes between two arrays of ExcalidrawElements, and returns the deltas
 * @return Array<ExcalidrawElementDelta> An array of the deltas between each of the elements in the array
 * @param oldArrInput
 * @param newArrInput
 */
export const detectChanges = (
  oldArrInput: ReadonlyArray<OrderedExcalidrawElement>,
  newArrInput: ReadonlyArray<OrderedExcalidrawElement>
): Array<ExcalidrawElementDelta> => {
  const oldLen = oldArrInput.length;
  const newLen = newArrInput.length;
  // if both are empty, no changes
  if (oldLen === 0 && newLen === 0) {
    return [];
  }
  // if oldArr is empty, all new are inserted
  if (oldLen === 0) {
    return newArrInput as Array<ExcalidrawElementDelta>;
  }
  // if new is empty, all elements of oldArr are deleted
  if (newLen === 0) {
    // return only the ID and mark it as deleted to conserve data
    return oldArrInput.map(item => ({
      id: item.id,
      isDeleted: true,
      // used internally
      updated: item.updated,
    })) as Array<ExcalidrawElementDelta>;
  }

  const deltas: Array<Partial<ExcalidrawElement>> = [];

  const oldElementMap = new Map(oldArrInput.map(item => [item.id, item]));
  for (const newItem of newArrInput) {
    const oldItem = oldElementMap.get(newItem.id);
    // if the new item is not in the old array, it is inserted
    if (!oldItem) {
      deltas.push(newItem);
      continue;
    }
    // a match is found - the element is updated or deleted
    // if both are deleted - ignore, since deleted elements cannot be updated
    if (oldItem.isDeleted && newItem.isDeleted) {
      continue;
    }
    // if the new item is deleted, it is considered deleted
    if (newItem.isDeleted) {
      deltas.push({ id: newItem.id, isDeleted: true, updated: newItem.updated });
      continue;
    }
    // a match is found and the item is not deleted
    // search what has been updated
    const updatedFields: Partial<ExcalidrawElement> = { id: newItem.id };
    let isUpdated = false;
    // compare every field of the new item against every field of the old item
    for (const key in newItem) {
      const typedKey = key as keyof ExcalidrawElement;
      if (
        (typeof newItem[typedKey] === 'object' && isEqual(newItem[typedKey], oldItem[typedKey])) ||
        newItem[typedKey] === oldItem[typedKey]
      ) {
        continue;
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      updatedFields[typedKey] = newItem[typedKey];
      isUpdated = true;
    }

    if (isUpdated) {
      deltas.push({
        ...updatedFields,
        // the fields below are used internally
        type: newItem.type,
        points: (newItem as ExcalidrawLinearElement)?.points,
        width: newItem.width,
        height: newItem.height,
      });
    }
  }
  return deltas as Array<ExcalidrawElementDelta>;
};
