/**
 * Pass it to JavaScript's `Array.sort` function to sort an array of objects by their `sortOrder` property ascending.
 * @returns number for Array.prototype.sort
 */
export const sortBySortOrder = (a: { sortOrder: number }, b: { sortOrder: number }): number => {
  return a.sortOrder - b.sortOrder;
};
