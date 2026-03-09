import { differenceWith, isEmpty, isEqual } from 'lodash-es';

export const isArrayEqual = (x: unknown[] | undefined, y: unknown[] | undefined) => {
  if (x === undefined && y === undefined) {
    return true;
  } else if (x === undefined || y === undefined) {
    return false;
  } else {
    return isEmpty(differenceWith(x, y, isEqual));
  }
};
