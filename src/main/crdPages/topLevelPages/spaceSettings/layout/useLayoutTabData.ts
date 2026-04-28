import { useEffect, useRef, useState, useTransition } from 'react';
import {
  useInnovationFlowSettingsQuery,
  useSpaceSettingsQuery,
  useUpdateCalloutFlowStateMutation,
  useUpdateCalloutsSortOrderMutation,
  useUpdateInnovationFlowStateMutation,
  useUpdateSpaceSettingsMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { CalloutDescriptionDisplayMode } from '@/core/apollo/generated/graphql-schema';
import type {
  LayoutColumnId,
  LayoutPoolColumn,
  LayoutPostDescriptionDisplay,
  LayoutReorderTarget,
  LayoutSaveBarState,
} from '@/crd/components/space/settings/SpaceSettingsLayoutView.types';
import useInnovationFlowSettings from '@/domain/collaboration/InnovationFlow/InnovationFlowDialogs/useInnovationFlowSettings';
import { mapCollaborationToLayoutColumns } from './layoutMapper';

export type {
  LayoutPoolColumn,
  LayoutSaveBarState,
} from '@/crd/components/space/settings/SpaceSettingsLayoutView.types';

export type UseLayoutTabDataResult = {
  columns: LayoutPoolColumn[];
  postDescriptionDisplay: LayoutPostDescriptionDisplay;
  saveBar: LayoutSaveBarState;
  loading: boolean;
  error: Error | null;
  onReorder: (calloutId: string, target: LayoutReorderTarget) => void;
  onRenameColumn: (columnId: LayoutColumnId, patch: { title?: string; description?: string }) => void;
  onMoveToColumn: (calloutId: string, target: LayoutColumnId) => void;
  onPostDescriptionDisplayChange: (next: LayoutPostDescriptionDisplay) => void;
  onSave: () => void;
  onReset: () => void;
  isDirty: boolean;
  /** Update both buffer AND snapshot for a column saved via the Edit Details dialog. */
  markColumnSaved: (columnId: LayoutColumnId, title: string, description: string) => void;
  /** Underlying ids — useful for the view's useColumnMenu consumer. */
  innovationFlowId: string;
  calloutsSetId: string;
  /**
   * Phase add/delete (immediate-save) — adds a new flow state at the end (or
   * after `afterStateId` if provided) and resets the rename buffer so the
   * snapshot reseeds from the refetched query.
   */
  onCreateState: (input: { displayName: string; description: string; afterStateId?: string }) => Promise<void>;
  onDeleteState: (stateId: string) => Promise<void>;
  /** Min/max state count from the innovation-flow settings; drives Add/Delete enablement. */
  minimumNumberOfStates: number;
  maximumNumberOfStates: number;
  /** True while a structural mutation (create/delete state) is in flight. */
  isStructureMutating: boolean;
};

type Snapshot = {
  columns: LayoutPoolColumn[];
  postDescriptionDisplay: LayoutPostDescriptionDisplay;
};

function toSnapshot(columns: LayoutPoolColumn[], postDescriptionDisplay: LayoutPostDescriptionDisplay): Snapshot {
  // Deep clone so the snapshot is immune to later local mutation.
  return {
    postDescriptionDisplay,
    columns: columns.map(c => ({
      ...c,
      callouts: c.callouts.map(cb => ({ ...cb })),
    })),
  };
}

function columnsEqual(a: LayoutPoolColumn[], b: LayoutPoolColumn[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const left = a[i];
    const right = b[i];
    if (left.id !== right.id) return false;
    if (left.title !== right.title) return false;
    if (left.description !== right.description) return false;
    if (left.callouts.length !== right.callouts.length) return false;
    for (let j = 0; j < left.callouts.length; j++) {
      if (left.callouts[j].id !== right.callouts[j].id) return false;
    }
  }
  return true;
}

export function useLayoutTabData(spaceId: string): UseLayoutTabDataResult {
  // We need both the collaboration (for innovationFlow + callouts) and the
  // space settings (for calloutDescriptionDisplayMode). The collaboration id
  // is on space.collaboration.id, which we fetch via the settings query to
  // avoid a third round-trip.
  const {
    data: settingsData,
    loading: settingsLoading,
    error: settingsError,
  } = useSpaceSettingsQuery({ variables: { spaceId }, skip: !spaceId });

  const collaborationId = settingsData?.lookup.space?.collaboration.id ?? '';

  const {
    data: flowData,
    loading: flowLoading,
    error: flowError,
  } = useInnovationFlowSettingsQuery({
    variables: { collaborationId },
    skip: !collaborationId,
  });

  const [columns, setColumns] = useState<LayoutPoolColumn[]>([]);
  const [postDescriptionDisplay, setPostDescriptionDisplay] = useState<LayoutPostDescriptionDisplay>('expanded');
  const snapshotRef = useRef<Snapshot | null>(null);
  const [saveBar, setSaveBar] = useState<LayoutSaveBarState>({ kind: 'clean' });
  const [, startTransition] = useTransition();
  const [isStructureMutating, setIsStructureMutating] = useState(false);

  const [updateInnovationFlowState] = useUpdateInnovationFlowStateMutation();
  const [updateCalloutFlowState] = useUpdateCalloutFlowStateMutation();
  const [updateCalloutsSortOrder] = useUpdateCalloutsSortOrderMutation();
  const [updateSpaceSettings] = useUpdateSpaceSettingsMutation();

  // Borrow only the structural action handlers from the legacy hook —
  // they handle the create+sortOrder atomicity and refetches.
  const innovationFlowSettings = useInnovationFlowSettings({
    collaborationId,
    skip: !collaborationId,
  });

  // Seed the buffer once, from the first successful query pair.
  useEffect(() => {
    if (snapshotRef.current !== null) return;
    const collaboration = flowData?.lookup.collaboration;
    const layoutMode = settingsData?.lookup.space?.settings.layout.calloutDescriptionDisplayMode;
    if (!collaboration || !layoutMode) return;
    const nextColumns = mapCollaborationToLayoutColumns(collaboration);
    const nextDisplay: LayoutPostDescriptionDisplay =
      layoutMode === CalloutDescriptionDisplayMode.Collapsed ? 'collapsed' : 'expanded';
    snapshotRef.current = toSnapshot(nextColumns, nextDisplay);
    setColumns(nextColumns);
    setPostDescriptionDisplay(nextDisplay);
  }, [flowData, settingsData]);

  // Dirty flag — tracks whether the buffer differs from the snapshot.
  // Using state (not useMemo on a ref) so it updates when onSave/onReset clear it.
  const [isDirty, setIsDirty] = useState(false);

  // Recompute whenever columns change.
  useEffect(() => {
    const snap = snapshotRef.current;
    const dirty = snap ? !columnsEqual(snap.columns, columns) : false;
    setIsDirty(dirty);
    setSaveBar(prev => {
      if (prev.kind === 'saving' || prev.kind === 'saveError') return prev;
      return dirty ? { kind: 'dirty', canSave: true } : { kind: 'clean' };
    });
  }, [columns]);

  // ────────────────── Buffered actions ──────────────────

  const onReorder = (calloutId: string, target: LayoutReorderTarget) => {
    setColumns(prev => {
      const next = prev.map(c => ({ ...c, callouts: [...c.callouts] }));
      // Remove from wherever it is.
      let removed: LayoutPoolColumn['callouts'][number] | null = null;
      for (const col of next) {
        const idx = col.callouts.findIndex(c => c.id === calloutId);
        if (idx >= 0) {
          removed = col.callouts.splice(idx, 1)[0];
          break;
        }
      }
      if (!removed) return prev;
      const targetCol = next.find(c => c.id === target.columnId);
      if (!targetCol) return prev;
      const index = Math.max(0, Math.min(target.index, targetCol.callouts.length));
      targetCol.callouts.splice(index, 0, removed);
      return next;
    });
  };

  const onMoveToColumn = (calloutId: string, target: LayoutColumnId) => {
    setColumns(prev => {
      const targetCol = prev.find(c => c.id === target);
      if (!targetCol) return prev;
      const next = prev.map(c => ({ ...c, callouts: [...c.callouts] }));
      let removed: LayoutPoolColumn['callouts'][number] | null = null;
      for (const col of next) {
        const idx = col.callouts.findIndex(c => c.id === calloutId);
        if (idx >= 0) {
          removed = col.callouts.splice(idx, 1)[0];
          break;
        }
      }
      if (!removed) return prev;
      const mutTarget = next.find(c => c.id === target);
      if (!mutTarget) return prev;
      mutTarget.callouts.push(removed);
      return next;
    });
  };

  const onRenameColumn = (columnId: LayoutColumnId, patch: { title?: string; description?: string }) => {
    setColumns(prev =>
      prev.map(c =>
        c.id === columnId
          ? {
              ...c,
              title: patch.title !== undefined ? patch.title : c.title,
              description: patch.description !== undefined ? patch.description : c.description,
            }
          : c
      )
    );
  };

  /** Toggle fires immediately — NOT part of the Save Changes buffer. */
  const onPostDescriptionDisplayChange = (next: LayoutPostDescriptionDisplay) => {
    setPostDescriptionDisplay(next);
    if (snapshotRef.current) {
      snapshotRef.current = { ...snapshotRef.current, postDescriptionDisplay: next };
    }
    startTransition(() => {
      void updateSpaceSettings({
        variables: {
          settingsData: {
            spaceID: spaceId,
            settings: {
              layout: {
                calloutDescriptionDisplayMode:
                  next === 'collapsed'
                    ? CalloutDescriptionDisplayMode.Collapsed
                    : CalloutDescriptionDisplayMode.Expanded,
              },
            },
          },
        },
      });
    });
  };

  // ────────────────── Save / Reset ──────────────────

  const onReset = () => {
    const snap = snapshotRef.current;
    if (!snap) return;
    setColumns(snap.columns.map(c => ({ ...c, callouts: c.callouts.map(cb => ({ ...cb })) })));
    setPostDescriptionDisplay(snap.postDescriptionDisplay);
    setIsDirty(false);
    setSaveBar({ kind: 'clean' });
  };

  /** Update both buffer and snapshot for a column saved directly via the Edit Details dialog. */
  const markColumnSaved = (columnId: LayoutColumnId, title: string, description: string) => {
    const updateCol = (cols: LayoutPoolColumn[]) =>
      cols.map(c => (c.id === columnId ? { ...c, title, description } : c));
    setColumns(prev => updateCol(prev));
    if (snapshotRef.current) {
      snapshotRef.current = {
        ...snapshotRef.current,
        columns: updateCol(snapshotRef.current.columns),
      };
    }
    setIsDirty(false);
  };

  const onSave = async () => {
    const snap = snapshotRef.current;
    if (!snap) return;
    setSaveBar({ kind: 'saving' });

    try {
      // 1) Column renames — only fire when title or description actually changed.
      const renames = columns.filter(col => {
        const prior = snap.columns.find(p => p.id === col.id);
        return prior && (prior.title !== col.title || prior.description !== col.description);
      });
      for (const col of renames) {
        await updateInnovationFlowState({
          variables: {
            innovationFlowStateId: col.id,
            displayName: col.title,
            description: col.description,
          },
        });
      }

      // 2) Callout moves — only retag callouts that actually changed column.
      //    A callout needs retagging if:
      //    (a) it was dragged to a different column (its snapshot column title ≠ its buffer column title), OR
      //    (b) it stayed in the same column but that column's title was renamed.
      //    We use the SNAPSHOT's column titles to detect changes (not the buffer's).
      const titleRenameMap = new Map<string, string>(); // old title → new title
      for (const col of renames) {
        const prior = snap.columns.find(p => p.id === col.id);
        if (prior && prior.title !== col.title) {
          titleRenameMap.set(prior.title, col.title);
        }
      }

      const calloutMoves: Array<{ calloutId: string; flowStateTagsetId: string; value: string }> = [];
      for (const col of columns) {
        for (const callout of col.callouts) {
          const prior = findCalloutInSnapshot(snap.columns, callout.id);
          if (!prior) continue;
          // What tag does this callout currently carry on the server?
          const serverTag = prior.columnTitle;
          // What tag should it carry after save?
          const targetTag = col.title;
          // Only issue a mutation if the tag will actually change.
          if (serverTag !== targetTag) {
            calloutMoves.push({
              calloutId: callout.id,
              flowStateTagsetId: callout.flowStateTagsetId,
              value: targetTag,
            });
          }
        }
      }
      for (const move of calloutMoves) {
        await updateCalloutFlowState({ variables: move });
      }

      // 3) Within-column reorders — only fire for columns whose order changed.
      const calloutsSetId = flowData?.lookup.collaboration?.calloutsSet.id ?? '';
      if (calloutsSetId) {
        for (const col of columns) {
          const prior = snap.columns.find(p => p.id === col.id);
          if (!prior) continue;
          const orderChanged =
            prior.callouts.length !== col.callouts.length ||
            prior.callouts.some((c, i) => c.id !== col.callouts[i]?.id);
          if (orderChanged) {
            await updateCalloutsSortOrder({
              variables: { calloutsSetID: calloutsSetId, calloutIds: col.callouts.map(c => c.id) },
            });
          }
        }
      }

      // No refetch needed — update the snapshot to match the buffer directly.
      // We know exactly what the server state is now (our buffer was accepted).
      snapshotRef.current = toSnapshot(columns, postDescriptionDisplay);
      setIsDirty(false);
      setSaveBar({ kind: 'clean' });
    } catch (err) {
      setSaveBar({
        kind: 'saveError',
        message: err instanceof Error ? err.message : 'Save failed',
      });
    }
  };

  // Structural actions — fire immediately, then reset the rename buffer so the
  // seed effect re-seeds from the refetched query.
  const resetSnapshotForReseed = () => {
    snapshotRef.current = null;
    setIsDirty(false);
    setSaveBar({ kind: 'clean' });
  };

  const onCreateState = async ({
    displayName,
    description,
    afterStateId,
  }: {
    displayName: string;
    description: string;
    afterStateId?: string;
  }): Promise<void> => {
    setIsStructureMutating(true);
    try {
      await innovationFlowSettings.actions.createState(
        { displayName, description, sortOrder: 0, settings: { allowNewCallouts: true } },
        afterStateId
      );
      resetSnapshotForReseed();
    } finally {
      setIsStructureMutating(false);
    }
  };

  const onDeleteState = async (stateId: string): Promise<void> => {
    setIsStructureMutating(true);
    try {
      // The backend rejects deleting the currently-active state. If the user
      // targets the active phase, advance the active state to the *adjacent*
      // surviving state first, then delete: prefer the next state by sortOrder
      // (so phase progression continues forward), and fall back to the
      // previous state when the active phase being deleted is the last one.
      const flow = innovationFlowSettings.data.innovationFlow;
      if (flow?.currentState?.id === stateId) {
        const deleted = (flow.states ?? []).find(s => s.id === stateId);
        const remaining = (flow.states ?? []).filter(s => s.id !== stateId).sort((a, b) => a.sortOrder - b.sortOrder);
        const nextActive =
          remaining.find(s => s.sortOrder > (deleted?.sortOrder ?? -1)) ?? remaining[remaining.length - 1];
        if (nextActive) {
          await innovationFlowSettings.actions.updateInnovationFlowCurrentState(nextActive.id);
        }
      }
      await innovationFlowSettings.actions.deleteState(stateId);
      resetSnapshotForReseed();
    } finally {
      setIsStructureMutating(false);
    }
  };

  const flowSettings = innovationFlowSettings.data.innovationFlow?.settings;

  return {
    columns,
    postDescriptionDisplay,
    saveBar,
    loading: settingsLoading || flowLoading,
    error: settingsError ?? flowError ?? null,
    onReorder,
    onRenameColumn,
    onMoveToColumn,
    onPostDescriptionDisplayChange,
    onSave,
    onReset,
    isDirty,
    markColumnSaved,
    innovationFlowId: flowData?.lookup.collaboration?.innovationFlow.id ?? '',
    calloutsSetId: flowData?.lookup.collaboration?.calloutsSet.id ?? '',
    onCreateState,
    onDeleteState,
    minimumNumberOfStates: flowSettings?.minimumNumberOfStates ?? 0,
    maximumNumberOfStates: flowSettings?.maximumNumberOfStates ?? Number.POSITIVE_INFINITY,
    isStructureMutating,
  };
}

function findCalloutInSnapshot(columns: LayoutPoolColumn[], calloutId: string): { columnTitle: string } | null {
  for (const col of columns) {
    if (col.callouts.some(c => c.id === calloutId)) {
      return { columnTitle: col.title };
    }
  }
  return null;
}
