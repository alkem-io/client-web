const compareIds = (a: string | undefined, b: string | undefined): number => {
  if (a === undefined || b === undefined) return 0;
  const left = a.toLowerCase();
  const right = b.toLowerCase();
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
};

/**
 * Pass it to JavaScript's `Array.sort` function to sort an array of objects by their `sortOrder` property ascending.
 *
 * Ties are broken by `id` ascending (when both carry one), using a plain lowercase code-unit
 * comparison — never `localeCompare`, whose result depends on the runtime locale. This mirrors
 * the server's ordering rule, so client and server agree on which innovation-flow state is
 * "first" even when two states share a `sortOrder`.
 * @returns number for Array.prototype.sort
 */
export const sortBySortOrder = (
  a: { sortOrder: number; id?: string },
  b: { sortOrder: number; id?: string }
): number => {
  return a.sortOrder - b.sortOrder || compareIds(a.id, b.id);
};
