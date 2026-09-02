import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  refetchInnovationFlowDetailsQuery,
  useSpaceTemplatesManagerQuery,
  useUpdateCollaborationFromSpaceTemplateMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { error as logError } from '@/core/logging/sentry/log';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type { ApplyFlowOptions } from '@/crd/components/space/innovationFlow/CrdApplySpaceTemplateDialog';
import type { TemplatePickerSelectProps } from '@/crd/components/templates/types';
import { useTemplatePicker } from '@/main/crdPages/templates/useTemplatePicker';

/**
 * Encapsulates the "Replace innovation flow" two-step flow:
 *   1. Open the CRD `TemplatePicker` → admin picks a Space template
 *   2. Open `CrdApplySpaceTemplateDialog` → admin picks the replace-options
 *      (replace-all / add-template / flow-only) → confirms
 *
 * Mirrors `useInnovationFlowSettings.importInnovationFlowFromSpaceTemplate`
 * (MUI) but stays standalone so it can be reused by multiple CRD surfaces
 * (subspace main page, settings/layout header) without pulling the whole
 * MUI settings hook — and now sources templates through the CRD-native
 * `useTemplatePicker` instead of the MUI `ImportTemplatesDialog`.
 */
export type UseFlowReplaceFlowOptions = {
  collaborationId: string | undefined;
  /** Level-zero space id — sources the Space-templates section of the picker. */
  levelZeroSpaceId: string | undefined;
  /** Account id — sources the Account-templates section of the picker. */
  accountId: string | undefined;
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
  /** Props to spread onto the CRD `TemplatePicker`. */
  pickerProps: TemplatePickerSelectProps;
  /** Whether the apply-template (options) dialog should be open. */
  applyDialogOpen: boolean;
  /** Whether the mutation is in flight (after user confirms). */
  importing: boolean;
  /** Open the template picker. */
  open: () => void;
  /** Called from `CrdApplySpaceTemplateDialog.onClose`. */
  onApplyDialogClose: () => void;
  /** Called from `CrdApplySpaceTemplateDialog.onConfirm`. */
  onApplyConfirm: (options: ApplyFlowOptions) => Promise<void>;
};

export function useFlowReplaceFlow({
  collaborationId,
  levelZeroSpaceId,
  accountId,
  onApplyComplete,
}: UseFlowReplaceFlowOptions): FlowReplaceFlowState {
  const { t } = useTranslation('crd-spaceSettings');
  const notify = useNotification();
  const [importing, setImporting] = useState(false);

  const { data: tmData } = useSpaceTemplatesManagerQuery({
    variables: { spaceId: levelZeroSpaceId ?? '' },
    skip: !levelZeroSpaceId,
  });
  const spaceTemplatesSetId = tmData?.lookup.space?.templatesManager?.templatesSet?.id;

  const picker = useTemplatePicker({ allowedTypes: ['space'], spaceTemplatesSetId, accountId });
  const { selectedTemplateId, clearSelection } = picker;

  const [updateCollaborationFromSpaceTemplate] = useUpdateCollaborationFromSpaceTemplateMutation();

  const onApplyDialogClose = () => {
    // Cancel / X on the Apply dialog only dismisses the Apply layer; clearing
    // the picker's selection lets the admin pick another template.
    clearSelection();
  };

  const onApplyConfirm = async (options: ApplyFlowOptions) => {
    if (!selectedTemplateId || !collaborationId) return;
    const templateId = selectedTemplateId;
    // Successful apply collapses the Apply dialog (the picker already closed on select).
    clearSelection();
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
    pickerProps: picker.pickerProps,
    applyDialogOpen: selectedTemplateId !== null,
    importing,
    open: picker.openPicker,
    onApplyDialogClose,
    onApplyConfirm,
  };
}
