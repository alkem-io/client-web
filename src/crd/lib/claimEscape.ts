/**
 * One Escape closes one layer: skip an Escape a higher layer already handled;
 * claim it when you act.
 *
 * For overlays that listen for Escape themselves instead of through a Radix
 * layer. Radix listens on `document` in the capture phase, so by the time a
 * bubble-phase listener runs, a Radix layer that dismissed itself has already
 * called `preventDefault()` — and this returns `false`.
 */
export const claimEscape = (e: KeyboardEvent): boolean => {
  if (e.key !== 'Escape' || e.defaultPrevented) return false;
  e.preventDefault();
  return true;
};
