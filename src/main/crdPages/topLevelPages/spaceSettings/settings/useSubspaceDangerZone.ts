import { useState } from 'react';
import { useDeleteSpaceMutation, useSpacePrivilegesQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

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
      window.location.replace(parentUrl);
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
