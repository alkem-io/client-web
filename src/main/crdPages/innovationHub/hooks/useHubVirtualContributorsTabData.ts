import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useUpdateInnovationHubMutation } from '@/core/apollo/generated/apollo-hooks';
import type { InnovationHubSettingsFragment } from '@/core/apollo/generated/graphql-schema';
import type { HubVirtualContributorsTableRow } from '@/crd/components/innovationHub/InnovationHubVirtualContributorsTab';
import { mapInnovationHubVirtualContributorToTableRow } from '../dataMappers/mapInnovationHubResourceToTableRow';

export type UseHubVirtualContributorsTabDataResult = {
  rows: HubVirtualContributorsTableRow[];
  busy: boolean;
  add: (virtualContributorId: string) => Promise<void>;
  remove: (virtualContributorId: string) => Promise<void>;
  reorder: (orderedIds: string[]) => Promise<void>;
};

/**
 * Data + actions for the settings Virtual Contributors tab — mirrors
 * `useHubSpacesTabData`: optimistic full-replace `updateInnovationHub` on
 * `virtualContributorListFilter`, refetch, toast. The full replace rebuilds the
 * ID array from the resolved rows, which is what self-heals dangling entries
 * (FR-013).
 */
export const useHubVirtualContributorsTabData = (
  hub: InnovationHubSettingsFragment | undefined,
  refetch: () => Promise<unknown>
): UseHubVirtualContributorsTabDataResult => {
  const { t } = useTranslation('crd-innovationHub');
  const [updateInnovationHub, { loading: busy }] = useUpdateInnovationHubMutation();

  const rows = (hub?.virtualContributorListFilter ?? []).map(mapInnovationHubVirtualContributorToTableRow);

  const writeFilter = useCallback(
    async (nextIds: string[], successKey: 'added' | 'removed' | 'reordered') => {
      if (!hub) return;
      try {
        // Rebuild the optimistic list from `nextIds`; ids we have no resolved
        // data for (a freshly-added VC) are dropped from the optimistic
        // response and filled in by the refetch — better than a phantom row.
        const existingById = new Map((hub.virtualContributorListFilter ?? []).map(vc => [vc.id, vc]));
        const optimisticList = nextIds
          .map(id => existingById.get(id))
          .filter((vc): vc is NonNullable<typeof vc> => vc !== undefined);
        await updateInnovationHub({
          variables: {
            hubData: { ID: hub.id, virtualContributorListFilter: nextIds },
          },
          optimisticResponse: {
            updateInnovationHub: {
              ...hub,
              virtualContributorListFilter: optimisticList,
            },
          },
        });
        await refetch();
        const successMessage =
          successKey === 'added'
            ? t('settings.virtualContributors.toast.added')
            : successKey === 'removed'
              ? t('settings.virtualContributors.toast.removed')
              : t('settings.virtualContributors.toast.reordered');
        toast.success(successMessage);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        toast.error(`${t('settings.virtualContributors.toast.error')} ${message}`);
      }
    },
    [hub, updateInnovationHub, refetch, t]
  );

  const add = useCallback(
    async (virtualContributorId: string) => {
      const currentIds = (hub?.virtualContributorListFilter ?? []).map(vc => vc.id);
      if (currentIds.includes(virtualContributorId)) return;
      await writeFilter([...currentIds, virtualContributorId], 'added');
    },
    [hub?.virtualContributorListFilter, writeFilter]
  );

  const remove = useCallback(
    async (virtualContributorId: string) => {
      const currentIds = (hub?.virtualContributorListFilter ?? []).map(vc => vc.id);
      await writeFilter(
        currentIds.filter(id => id !== virtualContributorId),
        'removed'
      );
    },
    [hub?.virtualContributorListFilter, writeFilter]
  );

  const reorder = useCallback(
    async (orderedIds: string[]) => {
      await writeFilter(orderedIds, 'reordered');
    },
    [writeFilter]
  );

  return { rows, busy, add, remove, reorder };
};
