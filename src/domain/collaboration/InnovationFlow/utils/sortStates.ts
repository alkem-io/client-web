export const sortBySortOrder = (a: { sortOrder: number }, b: { sortOrder: number }) => {
  return a.sortOrder - b.sortOrder;
};
