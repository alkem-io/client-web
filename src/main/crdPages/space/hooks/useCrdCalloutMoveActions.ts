import { useUpdateCalloutsSortOrderMutation } from '@/core/apollo/generated/apollo-hooks';
import { error as logError } from '@/core/logging/sentry/log';

export type CalloutMoveActions = {
  /** True when the callout is the first in the list — hides Move Up / Move To Top. */
  isTop: boolean;
  /** True when the callout is the last in the list — hides Move Down / Move To Bottom. */
  isBottom: boolean;
  onMoveUp?: () => Promise<void>;
  onMoveDown?: () => Promise<void>;
  onMoveToTop?: () => Promise<void>;
  onMoveToBottom?: () => Promise<void>;
};

type UseCrdCalloutMoveActionsParams = {
  calloutsSetId: string | undefined;
  /** All callout ids in the feed, sorted by current `sortOrder`. */
  orderedCalloutIds: string[];
  calloutId: string;
};

/**
 * Move-actions helper (plan D9 / T065). Given the ordered callout-id list plus
 * a callout id, returns `{ isTop, isBottom, onMove* }`. A mutation failure is
 * reported by the global error handler, with the server's reason, and leaves the cache
 * untouched — Apollo's normalized cache re-reads the original `sortOrder` on
 * the next list query.
 */
export function useCrdCalloutMoveActions({
  calloutsSetId,
  orderedCalloutIds,
  calloutId,
}: UseCrdCalloutMoveActionsParams): CalloutMoveActions {
  const [updateSortOrder, { loading: submitting }] = useUpdateCalloutsSortOrderMutation();

  const index = orderedCalloutIds.indexOf(calloutId);
  const isTop = index <= 0;
  const isBottom = index < 0 || index >= orderedCalloutIds.length - 1;

  const submit = async (nextIds: string[]) => {
    if (!calloutsSetId) return;
    // A previous move is still in flight: each handler computes `nextIds` from
    // the snapshot captured at render time, so a rapid double-click would
    // otherwise submit a stale ordering. Drop the second click — the user
    // will see the parent re-render with the new order before the next move
    // is acceptable.
    if (submitting) return;
    try {
      await updateSortOrder({
        variables: { calloutsSetID: calloutsSetId, calloutIds: nextIds },
        refetchQueries: ['CalloutsOnCalloutsSetUsingClassification'],
      });
    } catch (err) {
      logError(new Error('Callout sort-order update failed', { cause: err as Error }));
    }
  };

  const swap = (i: number, j: number): string[] => {
    const copy = [...orderedCalloutIds];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    return copy;
  };

  const moveToIndex = (target: number): string[] => {
    const copy = [...orderedCalloutIds];
    const [item] = copy.splice(index, 1);
    copy.splice(target, 0, item);
    return copy;
  };

  return {
    isTop,
    isBottom,
    onMoveUp: isTop ? undefined : () => submit(swap(index, index - 1)),
    onMoveDown: isBottom ? undefined : () => submit(swap(index, index + 1)),
    onMoveToTop: isTop ? undefined : () => submit(moveToIndex(0)),
    onMoveToBottom: isBottom ? undefined : () => submit(moveToIndex(orderedCalloutIds.length - 1)),
  };
}
