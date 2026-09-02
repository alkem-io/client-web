import { Replace } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CrdApplySpaceTemplateDialog } from '@/crd/components/space/innovationFlow/CrdApplySpaceTemplateDialog';
import { TemplatePicker } from '@/crd/components/templates/TemplatePicker';
import { Button } from '@/crd/primitives/button';
import { useSpace } from '@/domain/space/context/useSpace';
import { useFlowReplaceFlow } from './useFlowReplaceFlow';

export type LayoutReplaceFlowConnectorProps = {
  collaborationId: string | undefined;
  /**
   * Number of callouts currently attached to this collaboration. Drives the
   * destructive "replace all" confirmation in `CrdApplySpaceTemplateDialog`. Must
   * come from data the parent has already resolved (the layout tab's
   * InnovationFlowSettings query) — never a count that can still be 0 while the
   * admin confirms, which would silently skip the delete confirmation.
   */
  existingCalloutsCount: number;
  /**
   * Disables the entry-point button. The parent passes the layout buffer's
   * dirty flag here so the admin can't replace the flow (which reseeds from
   * the server and discards the buffer) while there are unsaved layout edits.
   */
  disabled?: boolean;
  /** Called after the replace mutation completes + refetches land. */
  onApplyComplete?: () => void;
  /**
   * Reports whether the replace mutation is in flight, so the parent can dim
   * the columns area and overlay a "Loading new flow…" indicator. Mirrors
   * `replaceFlow.importing` from `useFlowReplaceFlow`.
   */
  onImportingChange?: (importing: boolean) => void;
};

/**
 * "Replace innovation flow" button rendered in the Subspace settings →
 * Layout tab header (L1/L2 only — see CrdSpaceSettingsPage). Mirrors the
 * "Select Different Flow" menu item from the MUI `InnovationFlowSettingsDialog`
 * (whose CRD counterpart is the Layout tab itself). Hosts the CRD
 * `TemplatePicker` + `CrdApplySpaceTemplateDialog` as sibling portals.
 */
export function LayoutReplaceFlowConnector({
  collaborationId,
  existingCalloutsCount,
  disabled,
  onApplyComplete,
  onImportingChange,
}: LayoutReplaceFlowConnectorProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const {
    space: { accountId, levelZeroSpaceId },
  } = useSpace();
  const replaceFlow = useFlowReplaceFlow({ collaborationId, levelZeroSpaceId, accountId, onApplyComplete });

  // Mirror the connector's local `importing` flag up to the parent so it can
  // render the loading overlay over the columns area while the mutation +
  // refetch are in flight.
  useEffect(() => {
    onImportingChange?.(replaceFlow.importing);
  }, [replaceFlow.importing, onImportingChange]);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2 shrink-0"
        onClick={replaceFlow.open}
        disabled={!collaborationId || replaceFlow.importing || disabled}
      >
        <Replace aria-hidden="true" className="size-4" />
        {t('layout.replaceFlow.button')}
      </Button>

      <TemplatePicker {...replaceFlow.pickerProps} />

      <CrdApplySpaceTemplateDialog
        open={replaceFlow.applyDialogOpen}
        onClose={replaceFlow.onApplyDialogClose}
        onConfirm={replaceFlow.onApplyConfirm}
        existingCalloutsCount={existingCalloutsCount}
      />
    </>
  );
}
