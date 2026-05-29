import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useUpdateInnovationHubMutation } from '@/core/apollo/generated/apollo-hooks';
import type { InnovationHubSettingsFragment } from '@/core/apollo/generated/graphql-schema';
import {
  type HubSpacesTableRow,
  mapInnovationHubSpaceToTableRow,
  type SpaceVisibilityVariant,
} from '../dataMappers/mapInnovationHubSpaceToTableRow';

export type UseHubSpacesTabDataResult = {
  rows: HubSpacesTableRow[];
  busy: boolean;
  add: (spaceId: string) => Promise<void>;
  remove: (spaceId: string) => Promise<void>;
  reorder: (orderedIds: string[]) => Promise<void>;
};

export const useHubSpacesTabData = (
  hub: InnovationHubSettingsFragment | undefined,
  refetch: () => Promise<unknown>
): UseHubSpacesTabDataResult => {
  const { t } = useTranslation('crd-innovationHub');
  const [updateInnovationHub, { loading: busy }] = useUpdateInnovationHubMutation();

  // Resolve visibility labels here with typed `t()` calls — keeps the mapper
  // i18n-free (one job: GraphQL → plain TS, no i18n stub needed in tests).
  const visibilityLabels: Record<SpaceVisibilityVariant, string> = {
    active: t('settings.spaces.visibility.active'),
    demo: t('settings.spaces.visibility.demo'),
    inactive: t('settings.spaces.visibility.inactive'),
    archived: t('settings.spaces.visibility.archived'),
    unknown: t('settings.spaces.visibility.unknown'),
  };

  const rows = useMemo(
    () =>
      (hub?.spaceListFilter ?? []).map(space => {
        const data = mapInnovationHubSpaceToTableRow(space);
        return { ...data, visibilityLabel: visibilityLabels[data.visibility] } as HubSpacesTableRow;
      }),
    // `visibilityLabels` is reconstructed every render with i18n-stable values;
    // React Compiler handles memoization. `t` change re-renders the whole hook.
    // biome-ignore lint/correctness/useExhaustiveDependencies: see above
    [hub?.spaceListFilter, t]
  );

  const writeFilter = useCallback(
    async (nextIds: string[], successKey: 'added' | 'removed' | 'reordered') => {
      if (!hub) return;
      try {
        // Rebuild the list from `nextIds` rather than reordering the existing
        // `hub.spaceListFilter`. The previous `sortBy(..., indexOf)` approach
        // kept removed items at the front (indexOf → -1) and broke removal/
        // reordering in the optimistic UI. For ids we don't have full data
        // for (i.e. a newly-added space), drop the entry from the optimistic
        // response and let the refetch fill it in — better than a phantom row.
        const existingById = new Map((hub.spaceListFilter ?? []).map(space => [space.id, space]));
        const optimisticSpaceListFilter = nextIds
          .map(id => existingById.get(id))
          .filter((space): space is NonNullable<typeof space> => space !== undefined);
        await updateInnovationHub({
          variables: {
            hubData: { ID: hub.id, spaceListFilter: nextIds },
          },
          optimisticResponse: {
            updateInnovationHub: {
              ...hub,
              spaceListFilter: optimisticSpaceListFilter,
            },
          },
        });
        await refetch();
        const successMessage =
          successKey === 'added'
            ? t('settings.spaces.toast.added')
            : successKey === 'removed'
              ? t('settings.spaces.toast.removed')
              : t('settings.spaces.toast.reordered');
        toast.success(successMessage);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        toast.error(`${t('settings.spaces.toast.error')} ${message}`);
      }
    },
    [hub, updateInnovationHub, refetch, t]
  );

  const add = useCallback(
    async (spaceId: string) => {
      const currentIds = (hub?.spaceListFilter ?? []).map(s => s.id);
      if (currentIds.includes(spaceId)) return;
      await writeFilter([...currentIds, spaceId], 'added');
    },
    [hub?.spaceListFilter, writeFilter]
  );

  const remove = useCallback(
    async (spaceId: string) => {
      const currentIds = (hub?.spaceListFilter ?? []).map(s => s.id);
      await writeFilter(
        currentIds.filter(id => id !== spaceId),
        'removed'
      );
    },
    [hub?.spaceListFilter, writeFilter]
  );

  const reorder = useCallback(
    async (orderedIds: string[]) => {
      await writeFilter(orderedIds, 'reordered');
    },
    [writeFilter]
  );

  return { rows, busy, add, remove, reorder };
};
