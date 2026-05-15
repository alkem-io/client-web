import { Replace } from 'lucide-react';
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
};

/**
 * "Replace innovation flow" button rendered in the Space/Subspace settings →
 * Layout tab header. Mirrors the "Select Different Flow" menu item from the
 * MUI `InnovationFlowSettingsDialog` (whose CRD counterpart is the Layout
 * tab itself). Hosts the MUI `ImportTemplatesDialog` + `ApplySpaceTemplateDialog`
 * as sibling portals, same approach as `SubspaceFlowAdminConnector`.
 */
export function LayoutReplaceFlowConnector({ collaborationId }: LayoutReplaceFlowConnectorProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const {
    space: { accountId },
  } = useSpace();
  const replaceFlow = useFlowReplaceFlow({ collaborationId });

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
