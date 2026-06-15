import { useState, useTransition } from 'react';
import { useCreateInnovationHubMutation } from '@/core/apollo/generated/apollo-hooks';
import { InnovationHubType } from '@/core/apollo/generated/graphql-schema';
import type { CreateInnovationHubValues } from '@/crd/components/innovationHub/createInnovationHub.types';

export type UseCreateInnovationHubArgs = {
  /** The Account that will own the new hub. Required for the mutation to fire. */
  accountId: string | undefined;
  /** Called once the create mutation succeeds, with the new hub's id. No navigation (strict MUI parity). */
  onCreated?: (id: string) => void;
};

export type UseCreateInnovationHubResult = {
  /** Send the create-hub mutation. Resolves with the new hub id. Rejects on mutation failure. */
  create: (values: CreateInnovationHubValues) => Promise<string | undefined>;
  creating: boolean;
};

/**
 * Wraps `useCreateInnovationHubMutation` for the CRD Account-tab "Create Innovation Hub" flow.
 * Sends exactly what the legacy MUI dialog sends — `{ accountID, subdomain, profileData:
 * { displayName, tagline, description }, type: List, spaceListFilter: [] }` — and refetches
 * `AdminInnovationHubsList` + `AccountInformation`. The hub is always created as a List-type hub
 * with an empty space-list filter (the create dialog collects neither). No post-create navigation.
 */
export function useCreateInnovationHub({
  accountId,
  onCreated,
}: UseCreateInnovationHubArgs): UseCreateInnovationHubResult {
  const [creating, startCreating] = useTransition();
  const [pending, setPending] = useState(false);
  const [createMutation] = useCreateInnovationHubMutation({
    refetchQueries: ['AdminInnovationHubsList', 'AccountInformation'],
  });

  const create = (values: CreateInnovationHubValues): Promise<string | undefined> => {
    if (!accountId) {
      return Promise.reject(new Error('Missing accountId — refusing to create Innovation Hub.'));
    }
    return new Promise((resolve, reject) => {
      setPending(true);
      startCreating(() => {
        void createMutation({
          variables: {
            hubData: {
              accountID: accountId,
              subdomain: values.subdomain.trim(),
              profileData: {
                displayName: values.name.trim(),
                tagline: values.tagline.trim(),
                description: values.description,
              },
              type: InnovationHubType.List,
              spaceListFilter: [],
            },
          },
        })
          .then(result => {
            const newId = result.data?.createInnovationHub.id;
            setPending(false);
            if (newId) onCreated?.(newId);
            resolve(newId);
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
