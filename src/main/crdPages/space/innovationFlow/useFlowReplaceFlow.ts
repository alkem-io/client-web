import { useState } from 'react';
import {
  refetchInnovationFlowDetailsQuery,
  useUpdateCollaborationFromSpaceTemplateMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { error as logError } from '@/core/logging/sentry/log';
import type { Identifiable } from '@/core/utils/Identifiable';
import type { ImportFlowOptions } from '@/domain/collaboration/InnovationFlow/InnovationFlowDialogs/useInnovationFlowSettings';

/**
 * Encapsulates the "Replace innovation flow" two-step flow:
 *   1. Open `ImportTemplatesDialog` → admin picks a Space template
 *   2. Open `ApplySpaceTemplateDialog` → admin picks the replace-options
 *      (replace-all / add-template / flow-only) → confirms
 *
 * Mirrors `useInnovationFlowSettings.importInnovationFlowFromSpaceTemplate`
 * (MUI) but stays standalone so it can be reused by multiple CRD surfaces
 * (subspace main page, settings/layout header) without pulling the whole
 * MUI settings hook.
 */
export type UseFlowReplaceFlowOptions = {
  collaborationId: string | undefined;
};

export type FlowReplaceFlowState = {
  /** Whether the import-templates dialog should be open. */
  importDialogOpen: boolean;
  /** Whether the apply-template (options) dialog should be open. */
  applyDialogOpen: boolean;
  /** Whether the mutation is in flight (after user confirms). */
  importing: boolean;
  /** Open the import dialog. */
  open: () => void;
  /** Close any open dialog and reset internal state. */
  closeAll: () => void;
  /** Called from `ImportTemplatesDialog.onSelectTemplate`. */
  onTemplateSelected: (template: Identifiable) => Promise<void>;
  /** Called from `ApplySpaceTemplateDialog.onClose`. */
  onApplyDialogClose: () => void;
  /** Called from `ApplySpaceTemplateDialog.onConfirm`. */
  onApplyConfirm: (options: ImportFlowOptions) => Promise<void>;
};

export function useFlowReplaceFlow({ collaborationId }: UseFlowReplaceFlowOptions): FlowReplaceFlowState {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();
  const [importing, setImporting] = useState(false);

  const [updateCollaborationFromSpaceTemplate] = useUpdateCollaborationFromSpaceTemplateMutation();

  const closeAll = () => {
    setImportDialogOpen(false);
    setSelectedTemplateId(undefined);
  };

  const onTemplateSelected = async (template: Identifiable) => {
    setSelectedTemplateId(template.id);
    setImportDialogOpen(false);
  };

  const onApplyDialogClose = () => {
    setSelectedTemplateId(undefined);
  };

  const onApplyConfirm = async (options: ImportFlowOptions) => {
    if (!selectedTemplateId || !collaborationId) return;
    const templateId = selectedTemplateId;
    // Close dialogs immediately and surface loading on the trigger.
    setSelectedTemplateId(undefined);
    setImporting(true);
    try {
      await updateCollaborationFromSpaceTemplate({
        variables: {
          collaborationId,
          spaceTemplateId: templateId,
          addCallouts: options.addCallouts,
          deleteExistingCallouts: options.deleteExistingCallouts,
        },
        refetchQueries: [
          refetchInnovationFlowDetailsQuery({ collaborationId }),
          'InnovationFlowSettings',
          'CalloutsOnCalloutsSetUsingClassification',
        ],
      });
    } catch (err) {
      logError(new Error('Replace innovation flow failed', { cause: err as Error }));
    } finally {
      setImporting(false);
    }
  };

  return {
    importDialogOpen,
    applyDialogOpen: !!selectedTemplateId,
    importing,
    open: () => setImportDialogOpen(true),
    closeAll,
    onTemplateSelected,
    onApplyDialogClose,
    onApplyConfirm,
  };
}
