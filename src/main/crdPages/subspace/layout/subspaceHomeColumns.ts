/**
 * Grid placement for the subspace home's sidebar + content track, composing the
 * two orthogonal toggles. Literal class strings (one per combination) so the
 * Tailwind scanner emits them — never build `lg:col-start-${n}` dynamically.
 *
 * - `fullWidth`: removes the empty edge gutter column on each side
 *   (sidebar shifts col 2 → col 1; content extends to the last column).
 * - `collapsed`: shrinks the sidebar from 2 columns to a 1-column rail; the
 *   freed column goes to the content area.
 * - `hasSidebar`: false when the sidebar list is empty — the content takes the
 *   whole track (still inside the edge gutters unless `fullWidth`).
 */
export function subspaceHomeColumns(
  fullWidth: boolean,
  collapsed: boolean,
  hasSidebar: boolean
): { sidebar: string; main: string } {
  if (!hasSidebar) {
    return { sidebar: '', main: fullWidth ? 'lg:col-start-1 lg:col-span-12' : 'lg:col-start-2 lg:col-span-10' };
  }
  if (fullWidth) {
    return collapsed
      ? { sidebar: 'lg:col-start-1 lg:col-span-1', main: 'lg:col-start-2 lg:col-span-11' }
      : { sidebar: 'lg:col-start-1 lg:col-span-2', main: 'lg:col-start-3 lg:col-span-10' };
  }
  return collapsed
    ? { sidebar: 'lg:col-start-2 lg:col-span-1', main: 'lg:col-start-3 lg:col-span-9' }
    : { sidebar: 'lg:col-start-2 lg:col-span-2', main: 'lg:col-start-4 lg:col-span-8' };
}
