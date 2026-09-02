import { useState, useTransition } from 'react';
import { useAdminInnovationPackLazyQuery, useCreateInnovationPackMutation } from '@/core/apollo/generated/apollo-hooks';
import type { CreateInnovationPackValues } from '@/crd/components/innovationPack/types';

export type CreatedInnovationPack = {
  id: string;
  /** The new pack's profile.url — fetched via a follow-up admin query (the create mutation only returns `{ id }`). */
  url: string | undefined;
};

export type UseCreateInnovationPackArgs = {
  /** The Account that will own the new pack. Required for the mutation to fire. */
  accountId: string | undefined;
  /**
   * Called once the create mutation succeeds AND the follow-up profile-URL lookup resolves.
   * Receives the new pack's id + profile.url. The consumer typically navigates to
   * `<url>/settings` (`buildInnovationPackSettingsUrl`) to land on the CRD pack admin page.
   */
  onCreated?: (created: CreatedInnovationPack) => void;
};

export type UseCreateInnovationPackResult = {
  /** Send the create-pack mutation. Resolves with `{ id, url }`. Rejects on mutation failure. */
  create: (values: CreateInnovationPackValues) => Promise<CreatedInnovationPack | undefined>;
  creating: boolean;
};

/**
 * Wraps `useCreateInnovationPackMutation` for the CRD Account-tab "Create Innovation Pack" flow.
 * The legacy `CreateInnovationPackDialog` collects exactly `{ name, description }` and sends
 * `{ accountID, profileData: { displayName, description } }` — this hook does the same.
 *
 * Because the create mutation returns only `{ id }`, the hook does a follow-up lazy admin
 * query (`useAdminInnovationPackLazyQuery`) for the new pack so the consumer can navigate to
 * `<pack.profile.url>/settings` without waiting for the AccountInformation refetch to land.
 * If the follow-up query fails the result `url` is `undefined`; the consumer can fall back to
 * a list refresh + manual click-through.
 *
 * Refetches `AccountInformation` (the Account tab itself), `AdminInnovationPacksList` (the
 * platform-admin list), and `InnovationLibrary` (the public library page).
 */
export function useCreateInnovationPack({
  accountId,
  onCreated,
}: UseCreateInnovationPackArgs): UseCreateInnovationPackResult {
  const [creating, startCreating] = useTransition();
  const [pending, setPending] = useState(false);
  const [createMutation] = useCreateInnovationPackMutation({
    refetchQueries: ['AccountInformation', 'AdminInnovationPacksList', 'InnovationLibrary'],
  });
  const [fetchPack] = useAdminInnovationPackLazyQuery({ fetchPolicy: 'network-only' });

  const create = (values: CreateInnovationPackValues): Promise<CreatedInnovationPack | undefined> => {
    if (!accountId) {
      return Promise.reject(new Error('Missing accountId — refusing to create Innovation Pack.'));
    }
    return new Promise((resolve, reject) => {
      setPending(true);
      startCreating(() => {
        void createMutation({
          variables: {
            packData: {
              accountID: accountId,
              profileData: {
                displayName: values.name,
                description: values.description,
              },
            },
          },
        })
          .then(async result => {
            const newId = result.data?.createInnovationPack.id;
            if (!newId) {
              setPending(false);
              resolve(undefined);
              return;
            }
            // Pull the new pack's profile.url so the consumer can navigate to `<url>/settings`.
            // If this lookup fails we still resolve — the create itself succeeded.
            let url: string | undefined;
            try {
              const lookup = await fetchPack({ variables: { innovationPackId: newId } });
              url = lookup.data?.lookup.innovationPack?.profile.url;
            } catch {
              url = undefined;
            }
            setPending(false);
            const created: CreatedInnovationPack = { id: newId, url };
            onCreated?.(created);
            resolve(created);
          })
          .catch(err => {
            setPending(false);
            reject(err);
          });
      });
    });
  };

  return { create, creating: creating || pending };
}
