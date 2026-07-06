import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useUpdateInnovationHubMutation } from '@/core/apollo/generated/apollo-hooks';
import type { InnovationHubSettingsFragment } from '@/core/apollo/generated/graphql-schema';
import type { HubPacksTableRow } from '@/crd/components/innovationHub/InnovationHubPacksTab';
import { mapInnovationHubPackToTableRow } from '../dataMappers/mapInnovationHubResourceToTableRow';

export type UseHubPacksTabDataResult = {
  rows: HubPacksTableRow[];
  busy: boolean;
  add: (packId: string) => Promise<void>;
  remove: (packId: string) => Promise<void>;
  reorder: (orderedIds: string[]) => Promise<void>;
};

/**
 * Data + actions for the settings Packs tab — mirrors `useHubSpacesTabData`:
 * optimistic full-replace `updateInnovationHub` on `innovationPackListFilter`,
 * refetch, toast. The full replace rebuilds the ID array from the resolved
 * rows, which is what self-heals dangling entries (FR-013).
 */
export const useHubPacksTabData = (
  hub: InnovationHubSettingsFragment | undefined,
  refetch: () => Promise<unknown>
): UseHubPacksTabDataResult => {
  const { t } = useTranslation('crd-innovationHub');
  const [updateInnovationHub, { loading: busy }] = useUpdateInnovationHubMutation();

  const rows = (hub?.innovationPackListFilter ?? []).map(mapInnovationHubPackToTableRow);

  const writeFilter = useCallback(
    async (nextIds: string[], successKey: 'added' | 'removed' | 'reordered') => {
      if (!hub) return;
      try {
        // Rebuild the optimistic list from `nextIds`; ids we have no resolved
        // data for (a freshly-added pack) are dropped from the optimistic
        // response and filled in by the refetch — better than a phantom row.
        const existingById = new Map((hub.innovationPackListFilter ?? []).map(pack => [pack.id, pack]));
        const optimisticList = nextIds
          .map(id => existingById.get(id))
          .filter((pack): pack is NonNullable<typeof pack> => pack !== undefined);
        await updateInnovationHub({
          variables: {
            hubData: { ID: hub.id, innovationPackListFilter: nextIds },
          },
          optimisticResponse: {
            updateInnovationHub: {
              ...hub,
              innovationPackListFilter: optimisticList,
            },
          },
        });
        await refetch();
        const successMessage =
          successKey === 'added'
            ? t('settings.packs.toast.added')
            : successKey === 'removed'
              ? t('settings.packs.toast.removed')
              : t('settings.packs.toast.reordered');
        toast.success(successMessage);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        toast.error(`${t('settings.packs.toast.error')} ${message}`);
      }
    },
    [hub, updateInnovationHub, refetch, t]
  );

  const add = useCallback(
    async (packId: string) => {
      const currentIds = (hub?.innovationPackListFilter ?? []).map(pack => pack.id);
      if (currentIds.includes(packId)) return;
      await writeFilter([...currentIds, packId], 'added');
    },
    [hub?.innovationPackListFilter, writeFilter]
  );

  const remove = useCallback(
    async (packId: string) => {
      const currentIds = (hub?.innovationPackListFilter ?? []).map(pack => pack.id);
      await writeFilter(
        currentIds.filter(id => id !== packId),
        'removed'
      );
    },
    [hub?.innovationPackListFilter, writeFilter]
  );

  const reorder = useCallback(
    async (orderedIds: string[]) => {
      await writeFilter(orderedIds, 'reordered');
    },
    [writeFilter]
  );

  return { rows, busy, add, remove, reorder };
};
