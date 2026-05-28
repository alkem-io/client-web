import { sortBy } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useUpdateInnovationHubMutation } from '@/core/apollo/generated/apollo-hooks';
import type { InnovationHubSettingsFragment } from '@/core/apollo/generated/graphql-schema';
import {
  type HubSpacesTableRow,
  mapInnovationHubSpaceToTableRow,
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

  // The mapper takes a `(key: string) => string` so it stays decoupled from i18next's
  // typed-key signature. Wrap `t` here to keep the boundary clean and avoid tripping
  // TS overload resolution.
  const tFn = useCallback((key: string): string => t(key as 'settings.spaces.title'), [t]);

  const rows = useMemo(
    () => (hub?.spaceListFilter ?? []).map(space => mapInnovationHubSpaceToTableRow(space, tFn)),
    [hub?.spaceListFilter, tFn]
  );

  const writeFilter = useCallback(
    async (nextIds: string[], successKey: 'added' | 'removed' | 'reordered') => {
      if (!hub) return;
      try {
        await updateInnovationHub({
          variables: {
            hubData: { ID: hub.id, spaceListFilter: nextIds },
          },
          optimisticResponse: {
            updateInnovationHub: {
              ...hub,
              spaceListFilter: sortBy(hub.spaceListFilter, ({ id }) => nextIds.indexOf(id)),
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
