import { Replace } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useInnovationFlowSettingsQuery } from '@/core/apollo/generated/apollo-hooks';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { Button } from '@/crd/primitives/button';
import { useSpace } from '@/domain/space/context/useSpace';
import ApplySpaceTemplateDialog from '@/domain/templates/components/Dialogs/ApplySpaceTemplateDialog';
import ImportTemplatesDialog from '@/domain/templates/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import { useFlowReplaceFlow } from './useFlowReplaceFlow';

export type LayoutReplaceFlowConnectorProps = {
  collaborationId: string | undefined;
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
 * (whose CRD counterpart is the Layout tab itself). Hosts the MUI
 * `ImportTemplatesDialog` + `ApplySpaceTemplateDialog` as sibling portals.
 */
export function LayoutReplaceFlowConnector({
  collaborationId,
  onApplyComplete,
  onImportingChange,
}: LayoutReplaceFlowConnectorProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const {
    space: { accountId },
  } = useSpace();
  const replaceFlow = useFlowReplaceFlow({ collaborationId, onApplyComplete });

  // Mirror the connector's local `importing` flag up to the parent so it can
  // render the loading overlay over the columns area while the mutation +
  // refetch are in flight.
  useEffect(() => {
    onImportingChange?.(replaceFlow.importing);
  }, [replaceFlow.importing, onImportingChange]);

  const { data: settingsData } = useInnovationFlowSettingsQuery({
    variables: { collaborationId: collaborationId ?? '' },
    skip: !replaceFlow.importDialogOpen || !collaborationId,
  });
  const existingCalloutsCount = settingsData?.lookup.collaboration?.calloutsSet.callouts?.length ?? 0;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2 shrink-0"
        onClick={replaceFlow.open}
        disabled={!collaborationId || replaceFlow.importing}
      >
        <Replace aria-hidden="true" className="size-4" />
        {t('layout.replaceFlow.button')}
      </Button>

      <ImportTemplatesDialog
        open={replaceFlow.importDialogOpen}
        templateType={TemplateType.Space}
        accountId={accountId}
        enablePlatformTemplates={true}
        keepPreviewOnSelect={true}
        onClose={replaceFlow.closeAll}
        onSelectTemplate={replaceFlow.onTemplateSelected}
      />

      <ApplySpaceTemplateDialog
        open={replaceFlow.applyDialogOpen}
        onClose={replaceFlow.onApplyDialogClose}
        onConfirm={replaceFlow.onApplyConfirm}
        existingCalloutsCount={existingCalloutsCount}
      />
    </>
  );
}
