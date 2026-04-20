import { useCallback, useTransition } from 'react';
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
  availablePostTemplates: ReadonlyArray<{ id: string; label: string }>;
  /** All callouts with their current flowState tag + tagset ID, needed for rename cascade. */
  callouts: ReadonlyArray<{ id: string; flowStateTagsetId: string; currentStateName: string }>;
  /** Map column ID → current displayName, needed to find the old name during rename. */
  columnNames: ReadonlyArray<{ id: string; title: string }>;
  /** Called after a successful save to update the local buffer/snapshot. */
  onColumnSaved?: (columnId: LayoutColumnId, title: string, description: string) => void;
};

export function useColumnMenu({
  innovationFlowId,
  availablePostTemplates,
  callouts,
  columnNames,
  onColumnSaved,
}: UseColumnMenuOptions): ColumnMenuActions {
  const [updateCurrentState] = useUpdateInnovationFlowCurrentStateMutation();
  const [setDefaultTemplate] = useSetDefaultCalloutTemplateOnInnovationFlowStateMutation();
  const [removeDefaultTemplate] = useRemoveDefaultCalloutTemplateOnInnovationFlowStateMutation();
  const [updateFlowState] = useUpdateInnovationFlowStateMutation();
  const [updateCalloutFlowState] = useUpdateCalloutFlowStateMutation();
  const [, startTransition] = useTransition();

  const onChangeActivePhase = useCallback(
    (columnId: LayoutColumnId) => {
      if (!innovationFlowId) return;
      startTransition(() => {
        void updateCurrentState({
          variables: { innovationFlowId, currentStateId: columnId },
        });
      });
    },
    [innovationFlowId, updateCurrentState]
  );

  const onSetAsDefaultPostTemplate = useCallback(
    (columnId: LayoutColumnId, templateId: string | null) => {
      startTransition(() => {
        if (templateId) {
          void setDefaultTemplate({ variables: { flowStateId: columnId, templateId } });
        } else {
          void removeDefaultTemplate({ variables: { flowStateId: columnId } });
        }
      });
    },
    [removeDefaultTemplate, setDefaultTemplate]
  );

  const onSaveColumnDetails = useCallback(
    async (columnId: LayoutColumnId, title: string, description: string) => {
      // 1) Rename the innovation flow state.
      await updateFlowState({
        variables: {
          innovationFlowStateId: columnId,
          displayName: title,
          description,
        },
      });

      // 2) Cascade: if the title changed, retag every callout that was tagged with the old name.
      const oldName = columnNames.find(c => c.id === columnId)?.title;
      if (oldName && oldName !== title) {
        const affectedCallouts = callouts.filter(c => c.currentStateName === oldName);
        for (const callout of affectedCallouts) {
          // eslint-disable-next-line no-await-in-loop
          await updateCalloutFlowState({
            variables: {
              calloutId: callout.id,
              flowStateTagsetId: callout.flowStateTagsetId,
              value: title,
            },
          });
        }
      }

      // 3) Update local state so the UI reflects the change immediately.
      onColumnSaved?.(columnId, title, description);
    },
    [callouts, columnNames, onColumnSaved, updateCalloutFlowState, updateFlowState]
  );

  return {
    onChangeActivePhase,
    onSetAsDefaultPostTemplate,
    onSaveColumnDetails,
    availablePostTemplates,
  };
}
