import { useState, useTransition } from 'react';
import { useDeleteInnovationPackMutation } from '@/core/apollo/generated/apollo-hooks';

export type UseDeleteInnovationPackArgs = {
  /** Called after the delete mutation succeeds (refetch is handled here; this is for navigation/toast). */
  onDeleted?: () => void;
};

export type UseDeleteInnovationPackResult = {
  /** Delete the given pack. Resolves on success, rejects on failure. */
  deletePack: (innovationPackId: string) => Promise<void>;
  /** True while a delete is in flight. */
  deleting: boolean;
};

/**
 * Wraps `useDeleteInnovationPackMutation` for the Account-tab pack-card three-dot "Delete" action
 * (FR-042). The legacy app deletes account-owned packs from the same spot via `useAccountEntityDeletion`.
 *
 * **Deletion must go through `ConfirmationDialog`** (CRD Rule 9 — destructive actions are
 * confirmation-gated). The consumer renders the dialog and only calls `deletePack` from its
 * `onConfirm`. This hook does not render UI; it owns only the mutation + the refetch list.
 *
 * Pack delete is wired from `src/domain/community/contributor/Account/ContributorAccountView.tsx`
 * in T076 (deferred).
 */
export function useDeleteInnovationPack({
  onDeleted,
}: UseDeleteInnovationPackArgs = {}): UseDeleteInnovationPackResult {
  const [deleting, startDeleting] = useTransition();
  const [pending, setPending] = useState(false);
  const [deleteMutation] = useDeleteInnovationPackMutation({
    refetchQueries: ['AccountInformation', 'AdminInnovationPacksList', 'InnovationLibrary'],
  });

  const deletePack = (innovationPackId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setPending(true);
      startDeleting(() => {
        void deleteMutation({ variables: { innovationPackId } })
          .then(() => {
            setPending(false);
            onDeleted?.();
            resolve();
          })
          .catch(err => {
            setPending(false);
            reject(err);
          });
      });
    });
  };

  return { deletePack, deleting: deleting || pending };
}
