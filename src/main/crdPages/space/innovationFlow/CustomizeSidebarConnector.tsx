import { PanelLeft } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  refetchInnovationFlowSettingsQuery,
  useUpdateInnovationFlowStateSettingsMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { PhaseLayoutDialog, type PhaseLayoutValues } from '@/crd/components/space/settings/PhaseLayoutDialog';
import { SIDEBAR_WIDGET_IDS_BY_LEVEL } from '@/crd/components/space/settings/SpaceSettingsLayoutView.types';
import { Button } from '@/crd/primitives/button';
import { selectFirstFlowState } from '@/domain/collaboration/InnovationFlow/selectFirstFlowState';
import { extractUnknownSidebarEntries, resolveSidebarPlan, toWireSidebar } from '../layout/sidebarWidgetPlan';

export type CustomizeSidebarConnectorProps = {
  collaborationId: string | undefined;
  /** The flow's states as persisted on the server — never the Layout tab's unsaved column buffer. */
  innovationFlowStates:
    | ReadonlyArray<{ id: string; sortOrder: number; settings: { sidebar: readonly string[] } }>
    | undefined;
  level: 'L1' | 'L2';
  /** True while the Layout tab's structural save, a phase delete or a flow replacement is in
   *  flight — the first phase may be about to change, so the dialog cannot be opened. */
  busy?: boolean;
};

const EMPTY_VALUES: PhaseLayoutValues = { descriptionCollapsed: false, showPublishDetails: true, sidebar: [] };

/**
 * "Customize Sidebar" button + sidebar-only Layout dialog for a subspace. A subspace has one
 * sidebar for all its phases: the list stored on its FIRST phase (lowest sortOrder, ties by id,
 * hidden phases included). The dialog pre-fills from that persisted state and saves ONLY its
 * `sidebar` key, immediately, through the settings-only phase update — independent of the
 * Layout tab's Save bar, so it stays enabled while the column buffer is dirty. A pending phase
 * reorder is safe: subspace sidebar lists stay attached to their position on reorder. The
 * target phase is resolved when saving, from the latest persisted states, so a structural
 * change that lands while the dialog is open never sends the list to a phase that is no
 * longer first.
 *
 * Values outside the level's vocabulary (a top-level-only widget, Create Subspace on an L2, or
 * a value this bundle does not know) are neither shown nor offered, and are re-inserted at
 * their original index on save.
 */
export function CustomizeSidebarConnector({
  collaborationId,
  innovationFlowStates,
  level,
  busy = false,
}: CustomizeSidebarConnectorProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const [updateFlowStateSettings] = useUpdateInnovationFlowStateSettingsMutation();
  const [open, setOpen] = useState(false);
  const [openCount, setOpenCount] = useState(0);
  const [values, setValues] = useState<PhaseLayoutValues>(EMPTY_VALUES);

  const vocabulary = SIDEBAR_WIDGET_IDS_BY_LEVEL[level];

  const handleOpen = () => {
    const first = selectFirstFlowState(innovationFlowStates);
    if (!first) return;
    setValues({
      descriptionCollapsed: false,
      showPublishDetails: true,
      sidebar: resolveSidebarPlan(first.settings.sidebar, vocabulary),
      sidebarUnknown: extractUnknownSidebarEntries(first.settings.sidebar, vocabulary),
    });
    // Remount the dialog per open so it re-seeds from the latest persisted list.
    setOpenCount(count => count + 1);
    setOpen(true);
  };

  const handleSave = async (edited: PhaseLayoutValues) => {
    // The list sits at the first position, so it belongs to whichever state is first now.
    const first = selectFirstFlowState(innovationFlowStates);
    if (!first) return;
    await updateFlowStateSettings({
      variables: {
        innovationFlowStateId: first.id,
        // Sidebar only: omitting every other key leaves the phase's other settings untouched.
        settings: { sidebar: toWireSidebar(edited.sidebar, edited.sidebarUnknown) },
      },
      // The mutation selects settings.sidebar, so the normalized cache updates the subspace
      // page directly; the Layout tab's settings query is refetched to stay in step.
      refetchQueries: collaborationId ? [refetchInnovationFlowSettingsQuery({ collaborationId })] : [],
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2 shrink-0"
        onClick={handleOpen}
        disabled={busy || !innovationFlowStates || innovationFlowStates.length === 0}
      >
        <PanelLeft aria-hidden="true" className="size-4" />
        {t('layout.customizeSidebar.button')}
      </Button>

      <PhaseLayoutDialog
        key={openCount}
        open={open}
        onOpenChange={setOpen}
        phaseName=""
        values={values}
        onSave={handleSave}
        sidebarOnly={true}
        availableWidgets={vocabulary}
      />
    </>
  );
}
