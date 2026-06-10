import { useState } from 'react';
import { useDeleteSpaceMutation, useSpacePrivilegesQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { ROUTE_HOME } from '@/domain/platform/routes/constants';

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
 * space `Delete` privilege, confirms before firing, and on success replaces the
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

  const { data } = useSpacePrivilegesQuery({
    variables: { spaceId },
    skip: !enabled || !spaceId,
  });
  const privileges = data?.lookup.space?.authorization?.myPrivileges ?? [];
  const canDelete = privileges.includes(AuthorizationPrivilege.Delete);

  const [deleteSpace] = useDeleteSpaceMutation({
    onCompleted: () => {
      // `parentUrl` can be '' if the L0 space context is still resolving — fall back to home so we
      // never reload the just-deleted subspace route (which would 404).
      window.location.replace(parentUrl || ROUTE_HOME);
    },
  });

  return {
    canDelete,
    pendingDelete,
    onDelete: () => setPendingDelete(true),
    confirmDelete: () => {
      void deleteSpace({ variables: { spaceId } });
      setPendingDelete(false);
    },
    cancelDelete: () => setPendingDelete(false),
  };
}
