import { useRef, useTransition } from 'react';
import {
  useRemoveDefaultCalloutTemplateOnInnovationFlowStateMutation,
  useSetDefaultCalloutTemplateOnInnovationFlowStateMutation,
  useUpdateCalloutFlowStateMutation,
  useUpdateInnovationFlowCurrentStateMutation,
  useUpdateInnovationFlowStateMutation,
} from '@/core/apollo/generated/apollo-hooks';
import type { ColumnMenuActions, LayoutColumnId } from '@/crd/components/space/settings/SpaceSettingsLayoutView.types';

export type UseColumnMenuOptions = {
  innovationFlowId: string;
  /** Open the shared Callout-template picker for the given flow state — the page hosts the picker. */
  onOpenDefaultCalloutTemplatePicker: (columnId: LayoutColumnId) => void;
  /** All callouts with their current flowState tag + tagset ID, needed for rename cascade. */
  callouts: ReadonlyArray<{ id: string; flowStateTagsetId: string; currentStateName: string }>;
  /** Map column ID → current displayName, needed to find the old name during rename. */
  columnNames: ReadonlyArray<{ id: string; title: string }>;
  /** Called after a successful save to update the local buffer/snapshot. */
  onColumnSaved?: (columnId: LayoutColumnId, title: string, description: string) => void;
  /**
   * Optimistic mirror for "Mark as active phase" — fired BEFORE the mutation
   * so the column kebab menu reflects the new active state immediately.
   */
  onActivePhaseChanged?: (columnId: LayoutColumnId) => void;
  /**
   * Tab/phase-delete handler from the layout data hook. Provided at every level now, including L0.
   * Passed through to `ColumnMenuActions.onDeletePhase` when defined and the removal would not
   * violate the flow's min-states limit. The positional protection of the four built-in L0 tabs is
   * enforced upstream by each column's `isDeletable` flag (the menu hides Delete for protected
   * columns), so this hook needs no level/position knowledge.
   */
  onDeleteState?: (stateId: string) => Promise<void>;
  /** Current column count and min-states, used to compute whether delete is allowed. */
  columnCount?: number;
  minimumNumberOfStates?: number;
  /**
   * Visibility toggle from the layout data hook (immediate-save, UI-only). Passed straight
   * through to `ColumnMenuActions.onToggleVisibility`. The data hook owns the optimistic
   * snapshot update + the persist mutation; this hook only forwards it. The CRD column menu
   * still gates the entry on the column carrying a known `isHidden` (capability present).
   */
  onToggleVisibility?: (columnId: LayoutColumnId, nextHidden: boolean) => Promise<void>;
};

export function useColumnMenu({
  innovationFlowId,
  onOpenDefaultCalloutTemplatePicker,
  callouts,
  columnNames,
  onColumnSaved,
  onActivePhaseChanged,
  onDeleteState,
  columnCount,
  minimumNumberOfStates,
  onToggleVisibility,
}: UseColumnMenuOptions): ColumnMenuActions {
  const [updateCurrentState] = useUpdateInnovationFlowCurrentStateMutation();
  const [setDefaultTemplate] = useSetDefaultCalloutTemplateOnInnovationFlowStateMutation();
  const [removeDefaultTemplate] = useRemoveDefaultCalloutTemplateOnInnovationFlowStateMutation();
  const [updateFlowState] = useUpdateInnovationFlowStateMutation();
  const [updateCalloutFlowState] = useUpdateCalloutFlowStateMutation();
  const [, startTransition] = useTransition();

  const onChangeActivePhase = (columnId: LayoutColumnId) => {
    if (!innovationFlowId) return;
    // Optimistic UI: flip the active-phase marker locally first so the kebab
    // menu reflects the new state immediately. The server mutation reconciles
    // asynchronously; if it fails the next InnovationFlowSettings refetch (or
    // a page reload) will restore the correct state.
    onActivePhaseChanged?.(columnId);
    startTransition(() => {
      void updateCurrentState({
        variables: { innovationFlowId, currentStateId: columnId },
      });
    });
  };

  const onSetAsDefaultCalloutTemplate = (columnId: LayoutColumnId, templateId: string | null) => {
    startTransition(() => {
      if (templateId) {
        void setDefaultTemplate({ variables: { flowStateId: columnId, templateId } });
      } else {
        void removeDefaultTemplate({ variables: { flowStateId: columnId } });
      }
    });
  };

  const onSaveColumnDetails = async (columnId: LayoutColumnId, title: string, description: string) => {
    await updateFlowState({
      variables: {
        innovationFlowStateId: columnId,
        displayName: title,
        description,
      },
    });

    // Cascade: if the title changed, retag every callout that was tagged with the old name.
    const oldName = columnNames.find(c => c.id === columnId)?.title;
    if (oldName && oldName !== title) {
      const affectedCallouts = callouts.filter(c => c.currentStateName === oldName);
      for (const callout of affectedCallouts) {
        await updateCalloutFlowState({
          variables: {
            calloutId: callout.id,
            flowStateTagsetId: callout.flowStateTagsetId,
            value: title,
          },
        });
      }
    }

    onColumnSaved?.(columnId, title, description);
  };

  // Latest values are kept in refs so the click handler re-checks the guard
  // at click time (the rendered `columnCount` lags the query refetch by one
  // commit, so two rapid kebab clicks at `min + 1` would otherwise queue two
  // deletions before the refetch lands).
  const columnCountRef = useRef(columnCount);
  columnCountRef.current = columnCount;
  const minStatesRef = useRef(minimumNumberOfStates);
  minStatesRef.current = minimumNumberOfStates;
  const isDeletingRef = useRef(false);

  const canDelete =
    !!onDeleteState &&
    typeof columnCount === 'number' &&
    typeof minimumNumberOfStates === 'number' &&
    columnCount > minimumNumberOfStates;

  const onDeletePhase =
    canDelete && onDeleteState
      ? async (columnId: LayoutColumnId) => {
          if (isDeletingRef.current) return;
          const latestCount = columnCountRef.current;
          const latestMin = minStatesRef.current;
          if (typeof latestCount !== 'number' || typeof latestMin !== 'number' || latestCount <= latestMin) {
            return;
          }
          isDeletingRef.current = true;
          try {
            await onDeleteState(columnId);
          } finally {
            isDeletingRef.current = false;
          }
        }
      : undefined;

  return {
    onChangeActivePhase,
    onSetAsDefaultCalloutTemplate,
    onOpenDefaultCalloutTemplatePicker,
    onSaveColumnDetails,
    onDeletePhase,
    onToggleVisibility,
  };
}
