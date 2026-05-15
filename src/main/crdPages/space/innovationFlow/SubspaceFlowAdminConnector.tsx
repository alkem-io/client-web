import {
  refetchInnovationFlowDetailsQuery,
  useInnovationFlowSettingsQuery,
  useUpdateInnovationFlowCurrentStateMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { error as logError } from '@/core/logging/sentry/log';
import { SubspaceFlowAdminMenu, type SubspaceFlowAdminMenuState } from '@/crd/components/space/SubspaceFlowAdminMenu';
import { useSpace } from '@/domain/space/context/useSpace';
import ApplySpaceTemplateDialog from '@/domain/templates/components/Dialogs/ApplySpaceTemplateDialog';
import ImportTemplatesDialog from '@/domain/templates/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import { useFlowReplaceFlow } from './useFlowReplaceFlow';

export type SubspaceFlowAdminConnectorProps = {
  /** Innovation-flow ID used for the current-state mutation. */
  innovationFlowId: string | undefined;
  /** Collaboration ID used for the replace-from-template mutation + cache refetch. */
  collaborationId: string | undefined;
  /** All available flow states (id + displayName). */
  states: SubspaceFlowAdminMenuState[];
  /** The state id currently marked as `currentState` on the server. */
  currentStateId: string | undefined;
  /** When provided, the menu includes an "Edit flow layout" link to settings/layout. */
  editLayoutHref?: string;
};

/**
 * Wires the CRD `SubspaceFlowAdminMenu` to the existing innovation-flow
 * mutations and to the MUI `ImportTemplatesDialog` + `ApplySpaceTemplateDialog`
 * (rendered as sibling portals outside `.crd-root`, same pattern as
 * `TemplateImportConnector` for callouts). Mirrors the MUI
 * `InnovationFlowSettingsDialog` permissions — caller is responsible for the
 * `AuthorizationPrivilege.Update` gate (done in the data hook).
 */
export function SubspaceFlowAdminConnector({
  innovationFlowId,
  collaborationId,
  states,
  currentStateId,
  editLayoutHref,
}: SubspaceFlowAdminConnectorProps) {
  const {
    space: { accountId },
  } = useSpace();
  const replaceFlow = useFlowReplaceFlow({ collaborationId });

  // Fetch existing callouts count lazily — only after the admin opens the
  // import-templates dialog. By the time they pick a template (a few seconds
  // later) the data is cached, so `ApplySpaceTemplateDialog` shows the
  // destructive-option confirmation correctly. If the user picks faster than
  // the network, the count defaults to 0 and the confirm is skipped — an
  // accepted edge case to avoid up-front payload for non-admins.
  const { data: settingsData } = useInnovationFlowSettingsQuery({
    variables: { collaborationId: collaborationId ?? '' },
    skip: !replaceFlow.importDialogOpen || !collaborationId,
  });
  const existingCalloutsCount = settingsData?.lookup.collaboration?.calloutsSet.callouts?.length ?? 0;

  const [updateInnovationFlowCurrentState] = useUpdateInnovationFlowCurrentStateMutation();

  const onSetCurrentState = async (stateId: string) => {
    if (!innovationFlowId || !collaborationId) return;
    try {
      await updateInnovationFlowCurrentState({
        variables: { innovationFlowId, currentStateId: stateId },
        refetchQueries: [refetchInnovationFlowDetailsQuery({ collaborationId })],
      });
    } catch (err) {
      logError(new Error('Set current innovation flow state failed', { cause: err as Error }));
    }
  };

  return (
    <>
      <SubspaceFlowAdminMenu
        states={states}
        currentStateId={currentStateId}
        onSetCurrentState={onSetCurrentState}
        onReplaceFlowClick={replaceFlow.open}
        editLayoutHref={editLayoutHref}
      />

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
