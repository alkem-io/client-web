import { AssistantCapabilityKind } from '@/core/apollo/generated/graphql-schema';
import type { AssistantCapabilityRowData } from '@/crd/components/user/settings/UserAssistantTabView';

/**
 * Pure mapping for the User → Settings → Assistant tab.
 *
 * The toggle list is **enumerated dynamically** from the server's
 * `platformCapabilities` query (FR-006 / FR-018) — never a hardcoded enum. A
 * brand-new server tool therefore appears automatically. Each capability's
 * effective enabled state is the user's stored `enabledCapabilities` value, or
 * the **kind-based default** when the user has no stored toggle for it:
 *
 *   - `READ`            → enabled by default
 *   - `WRITE_ADDITIVE`  → disabled by default
 *   - `WRITE_DESTRUCTIVE` → disabled by default
 *
 * (assistant-authority.md §1/§2 — read-only default; a new content-changing
 * capability defaults disabled because absence = disabled.) Local optimistic
 * overrides win over the stored value so the UI flips before the mutation
 * resolves.
 */

export type PlatformCapability = {
  name: string;
  displayName: string;
  description: string;
  kind: AssistantCapabilityKind;
};

export type StoredCapabilityToggle = {
  capability: string;
  enabled: boolean;
};

/** A capability is enabled-by-default iff it is a READ capability. */
export const defaultEnabledForKind = (kind: AssistantCapabilityKind): boolean => kind === AssistantCapabilityKind.Read;

/** Whether a capability changes content (so a confirmation gate applies, US2). */
export const isWriteKind = (kind: AssistantCapabilityKind): boolean =>
  kind === AssistantCapabilityKind.WriteAdditive || kind === AssistantCapabilityKind.WriteDestructive;

/**
 * Whether a capability is relevant to whiteboards — used to contextualize the
 * quick settings opened from the in-whiteboard assistant rail to just the
 * capabilities that affect whiteboards (the user still manages the full grant in
 * Settings → Assistant). Matched on the MCP tool name so new whiteboard/template
 * tools are included automatically (e.g. `analyze_whiteboard`, `create_whiteboard`,
 * `list_whiteboards`, `update_whiteboard_content`, `navigate_templates`).
 */
export const isWhiteboardCapability = (name: string): boolean => /whiteboard|template/i.test(name);

/**
 * Resolve the effective enabled state for a capability:
 * optimistic override → stored user value → kind default.
 */
export const resolveCapabilityEnabled = (
  capability: PlatformCapability,
  storedByName: Map<string, boolean>,
  overrides: Map<string, boolean>
): boolean => {
  if (overrides.has(capability.name)) {
    return overrides.get(capability.name) as boolean;
  }
  if (storedByName.has(capability.name)) {
    return storedByName.get(capability.name) as boolean;
  }
  return defaultEnabledForKind(capability.kind);
};

/** Index the user's stored toggles by capability name for O(1) lookup. */
export const indexStoredToggles = (stored: ReadonlyArray<StoredCapabilityToggle>): Map<string, boolean> => {
  const map = new Map<string, boolean>();
  for (const toggle of stored) {
    map.set(toggle.capability, toggle.enabled);
  }
  return map;
};

/**
 * Build the full row list for the view from the dynamic capability surface and
 * the user's current grant. Rows preserve the order returned by
 * `platformCapabilities`.
 */
export const mapAssistantCapabilities = (
  capabilities: ReadonlyArray<PlatformCapability>,
  stored: ReadonlyArray<StoredCapabilityToggle>,
  overrides: Map<string, boolean>
): AssistantCapabilityRowData[] => {
  const storedByName = indexStoredToggles(stored);
  return capabilities.map(capability => ({
    name: capability.name,
    displayName: capability.displayName,
    description: capability.description,
    kind: capability.kind,
    isWrite: isWriteKind(capability.kind),
    enabled: resolveCapabilityEnabled(capability, storedByName, overrides),
  }));
};

/**
 * Build the FULL `enabledCapabilities` payload for the mutation. We send an
 * explicit toggle for **every** enumerated capability (using the resolved
 * effective value with ALL current optimistic overrides applied) so the
 * persisted grant is complete and a previously-defaulted capability is
 * materialised the first time the user touches the tab. This mirrors the
 * notifications tab's full-group-payload approach (no partial updates).
 *
 * Passing the full `overrides` map (not just the single toggle) is what keeps
 * rapid successive toggles from clobbering each other: if A is toggled and B is
 * toggled again before the refetch settles, B's payload still carries A's
 * pending change rather than reverting it to the stale stored value.
 */
export const buildAssistantUpdatePayload = (
  capabilities: ReadonlyArray<PlatformCapability>,
  stored: ReadonlyArray<StoredCapabilityToggle>,
  overrides: Map<string, boolean>
): StoredCapabilityToggle[] => {
  const storedByName = indexStoredToggles(stored);
  return capabilities.map(capability => ({
    capability: capability.name,
    enabled: resolveCapabilityEnabled(capability, storedByName, overrides),
  }));
};
