import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  refetchInnovationFlowDetailsQuery,
  useUpdateCollaborationFromSpaceTemplateMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { error as logError } from '@/core/logging/sentry/log';
import { useNotification } from '@/core/ui/notifications/useNotification';
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
  /**
   * Called after the replace-flow mutation succeeds. The parent should use
   * this to discard any local buffer derived from the old InnovationFlowSettings
   * data so the UI re-seeds from the refetched server state. Without it, callers
   * that buffer flow state locally would keep showing the pre-mutation phases
   * until a page reload.
   */
  onApplyComplete?: () => void;
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

export function useFlowReplaceFlow({
  collaborationId,
  onApplyComplete,
}: UseFlowReplaceFlowOptions): FlowReplaceFlowState {
  const { t } = useTranslation('crd-spaceSettings');
  const notify = useNotification();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();
  const [importing, setImporting] = useState(false);

  const [updateCollaborationFromSpaceTemplate] = useUpdateCollaborationFromSpaceTemplateMutation();

  const closeAll = () => {
    setImportDialogOpen(false);
    setSelectedTemplateId(undefined);
  };

  const onTemplateSelected = async (template: Identifiable) => {
    // Keep both the Import library + Preview dialogs open behind the Apply
    // dialog so the user can dismiss them one at a time to walk back through
    // the flow. ImportTemplatesDialog must be passed `keepPreviewOnSelect`
    // so it doesn't auto-close the preview after this callback returns.
    setSelectedTemplateId(template.id);
  };

  const onApplyDialogClose = () => {
    // Cancel / X on the Apply dialog only dismisses the Apply layer; the
    // Preview + Library remain so the admin can pick another template.
    setSelectedTemplateId(undefined);
  };

  const onApplyConfirm = async (options: ImportFlowOptions) => {
    if (!selectedTemplateId || !collaborationId) return;
    const templateId = selectedTemplateId;
    // Successful apply collapses the whole 3-dialog chain — Apply (this
    // dialog) + Preview + Library. The preview's internal state is reset by
    // ImportTemplatesDialog's `open=false` effect.
    setSelectedTemplateId(undefined);
    setImportDialogOpen(false);
    setImporting(true);
    try {
      await updateCollaborationFromSpaceTemplate({
        variables: {
          collaborationId,
          spaceTemplateId: templateId,
          addCallouts: options.addCallouts,
          deleteExistingCallouts: options.deleteExistingCallouts,
        },
        // `awaitRefetchQueries` keeps `importing` true until the refetched
        // InnovationFlowSettings result has landed in Apollo's cache, so when
        // `onApplyComplete` discards the local snapshot the seed effect picks
        // up the new server state on its next render rather than the stale one.
        awaitRefetchQueries: true,
        refetchQueries: [
          refetchInnovationFlowDetailsQuery({ collaborationId }),
          'InnovationFlowSettings',
          'CalloutsOnCalloutsSetUsingClassification',
        ],
      });
      onApplyComplete?.();
    } catch (err) {
      logError(new Error('Replace innovation flow failed', { cause: err as Error }));
      // The dialog chain has already collapsed at this point, so without a
      // visible error the admin would believe the replace succeeded. Surface
      // it; the flow is unchanged and they can retry from the button.
      notify(t('layout.replaceFlow.error'), 'error');
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
