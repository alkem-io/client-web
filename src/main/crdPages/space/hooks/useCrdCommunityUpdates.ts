import type { CommunityUpdate } from '@/crd/components/space/CommunityUpdatesDialog';

const NO_UPDATES: CommunityUpdate[] = [];

/**
 * The sidebar `UpdatesSection` (latest) and `CommunityUpdatesDialog` (full list) on both Space and subspace pages. The
 * space's updates room is not served yet: the server answers no room node (resolver/boot.go bootNode; 021 S08) and its
 * messages wait for WP-MSG1 (DEP-021-UPDATES), so the widget says "not available yet" in place (`unavailable`).
 *
 * `spaceId` is the community id of legacy, which natively is the space's own id. `skip: true` reads nothing — the
 * sidebar connector passes this when the `updates` widget is not configured on the active tab (FR-019).
 */
export function useCrdCommunityUpdates(spaceId: string | undefined, skip?: boolean) {
  return {
    updates: NO_UPDATES,
    latest: undefined as CommunityUpdate | undefined,
    total: 0,
    loading: false,
    unavailable: !skip && Boolean(spaceId),
  };
}
