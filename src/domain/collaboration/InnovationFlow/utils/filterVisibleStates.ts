/**
 * A flow state carries a `settings` object. The member-facing visibility flag (`visible`) is
 * not yet present in the generated GraphQL types (the server field ships separately —
 * alkem-io/server#6138 — until then it is simply absent from responses), so the constraint only
 * requires the presence of a `settings` object and reads `visible` off it defensively.
 */
type StateWithSettings = {
  settings: object;
};

const getVisible = (state: StateWithSettings): boolean | undefined => {
  const visible = (state.settings as { visible?: boolean | null }).visible;
  return typeof visible === 'boolean' ? visible : undefined;
};

/**
 * Filters innovation-flow states (phases/tabs) for the live phase/tab navigation.
 *
 * - Hidden phases are removed for everyone, including admins — the live nav is the member-facing
 *   surface. Admins still see and unhide hidden phases in the management surface (Settings →
 *   Layout), where they are listed with a "hidden" badge; this selector is not that surface.
 * - When the platform does not expose the per-phase `visible` flag (no state carries a boolean
 *   `visible`), filtering is a no-op and everyone sees all phases (graceful degradation).
 * - Otherwise only phases whose `visible` is not explicitly `false` are kept.
 *
 * Hiding is UI-only: this never affects authorization or content access — it only controls what
 * appears in the phase navigation (anyone with a direct URL still reaches it).
 */
export const filterVisibleStates = <T extends StateWithSettings>(states: T[]): T[] => {
  const capabilityAvailable = states.some(state => getVisible(state) !== undefined);
  if (!capabilityAvailable) {
    return states;
  }

  return states.filter(state => getVisible(state) !== false);
};
