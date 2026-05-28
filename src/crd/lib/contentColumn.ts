/**
 * Single source of truth for the centered content band's grid placement.
 *
 * Every space/subspace shell surface (the global Header, SpaceHeader,
 * SubspaceHeader, SpaceSettingsHeader, the SpaceShell body, and the subspace
 * settings outlet) renders inside a `grid grid-cols-12` and needs to make the
 * same single decision: sit in the inset band (one empty gutter column per
 * side) or fill all 12 columns (the per-space "Wide layout" toggle).
 *
 * Keeping the decision here means the design baseline changes in one place
 * instead of six, and the header/body always stay vertically aligned.
 *
 * Returns only the responsive (`lg:`) column classes — the caller keeps the
 * mobile base (`col-span-12`) and any extras (`min-w-0`, `flex …`) and composes
 * via `cn()`.
 *
 * @param fullWidth `true` → `lg:col-span-12` (full width); `false`/omitted →
 *                   `lg:col-start-2 lg:col-span-10` (inset band).
 */
export function contentColumnClass(fullWidth?: boolean): string {
  return fullWidth ? 'lg:col-span-12' : 'lg:col-start-2 lg:col-span-10';
}
