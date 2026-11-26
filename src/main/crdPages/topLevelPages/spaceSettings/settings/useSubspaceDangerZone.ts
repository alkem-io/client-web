import { useState } from 'react';
import {
  useSpaceSettingsDeleteGateQuery,
  useSpaceSettingsDeleteSpaceMutation,
} from '@/core/apollo/generated-v2/apollo-hooks';
import type { SpaceSettingsDeleteGateQuery } from '@/core/apollo/generated-v2/graphql-schema';
import { useApolloErrorHandler } from '@/core/apollo/hooks/useApolloErrorHandler';
import { ROUTE_HOME } from '@/domain/platform/routes/constants';

type DeleteGateSpace = Extract<NonNullable<SpaceSettingsDeleteGateQuery['node']>, { __typename?: 'Space' }>;

export type UseSubspaceDangerZoneResult = {
  canDelete: boolean;
  pendingDelete: boolean;
  onDelete: () => void;
  confirmDelete: () => void;
  cancelDelete: () => void;
};

/**
 * Delete-subspace danger zone for the Settings tab (L1/L2 only).
 *
 * Mirrors the legacy MUI `SpaceAdminSettingsPage` delete block: gated on the
 * space DELETE verdict (`SpaceCan.delete`), confirms before firing, runs `deleteSpace`, and on success replaces the
 * location with the parent space — the just-deleted subspace's page no longer
 * exists, and a hard navigation clears the now-stale space/subspace contexts and
 * Apollo cache (matching the MUI behaviour).
 */
export function useSubspaceDangerZone(args: {
  spaceId: string;
  parentUrl: string;
  enabled: boolean;
}): UseSubspaceDangerZoneResult {
  const { spaceId, parentUrl, enabled } = args;
  const [pendingDelete, setPendingDelete] = useState(false);

  const { data, error } = useSpaceSettingsDeleteGateQuery({
    variables: { id: spaceId },
    skip: !enabled || !spaceId,
  });
  if (enabled && spaceId && error) throw error;
  const space =
    data?.node?.id === spaceId && data.node.entityType === 'space' ? (data.node as DeleteGateSpace) : undefined;
  const canDelete = space?.can.delete ?? false;

  const handleError = useApolloErrorHandler();
  const [deleteSpace] = useSpaceSettingsDeleteSpaceMutation({
    onCompleted: () => {
      // `parentUrl` can be '' if the L0 space context is still resolving — fall back to home so we
      // never reload the just-deleted subspace route (which would 404).
      window.location.replace(parentUrl || ROUTE_HOME);
    },
    onError: handleError,
  });

  return {
    canDelete,
    pendingDelete,
    onDelete: () => setPendingDelete(true),
    confirmDelete: () => {
      void deleteSpace({ variables: { id: spaceId } });
      setPendingDelete(false);
    },
    cancelDelete: () => setPendingDelete(false),
  };
}
