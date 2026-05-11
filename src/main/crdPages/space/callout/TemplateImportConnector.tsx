import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { TemplatePicker } from '@/crd/components/templates/TemplatePicker';
import type { TemplateContent } from '@/crd/components/templates/types';
import { useSpace } from '@/domain/space/context/useSpace';
import type { CalloutFormValues } from '@/main/crdPages/space/hooks/useCrdCalloutForm';
import { useTemplatePicker } from '@/main/crdPages/templates/useTemplatePicker';

type CalloutTemplateContent = Extract<TemplateContent, { type: 'callout' }>;

type TemplateImportConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Whether the parent form has user-entered content. When true, selecting a template triggers the
   * overwrite-confirm dialog before prefilling. When false, the template loads directly.
   */
  isFormDirty: boolean;
  /** Called with the mapped CRD form values after the user confirms. */
  onTemplateSelected: (values: Partial<CalloutFormValues>) => void;
};

/**
 * CRD `TemplateContent['callout']` → partial CRD callout-form values (the picker preview already
 * resolved framing kind, contributions, comment settings, defaults for us). `framingKind`/`responseType`
 * use the same string literals as the CRD callout form, so no casts are needed.
 */
function mapCalloutContentToFormValues(tc: CalloutTemplateContent): Partial<CalloutFormValues> {
  const firstAllowed = tc.allowedContributionTypes[0];
  const responseType: CalloutFormValues['responseType'] =
    firstAllowed === 'post' || firstAllowed === 'whiteboard' || firstAllowed === 'link' ? firstAllowed : 'none';
  return {
    title: tc.framingTitle,
    description: tc.framingDescription,
    framingChip: tc.framingKind,
    framingCommentsEnabled: tc.commentsEnabled,
    linkUrl: tc.framingLinks?.[0]?.uri ?? '',
    linkDisplayName: tc.framingLinks?.[0]?.name ?? '',
    memoMarkdown: tc.framingMemoContent ?? '',
    whiteboardContent: tc.framingWhiteboardContent ?? '',
    whiteboardConfigured: tc.framingKind === 'whiteboard',
    responseType,
    contributionDefaults: {
      defaultDisplayName: '',
      postDescription: tc.defaultPostDescription ?? '',
      whiteboardContent: tc.defaultWhiteboardContent ?? '',
    },
  };
}

/**
 * Wires the CRD `TemplatePicker` (mode='select', callout templates) to the CRD callout form.
 * On selection the picker hook lazily fetches + maps the template content; this connector then
 * (after the overwrite-confirm when the form is dirty) hands the mapped values to the parent.
 *
 * NOTE: the Space source section is omitted here (only Account/Platform) — wiring the owning
 * space's templates-set id into the picker is a follow-up; see `specs/098-crd-templates/assumptions.md` C3.
 */
export function TemplateImportConnector({
  open,
  onOpenChange,
  isFormDirty,
  onTemplateSelected,
}: TemplateImportConnectorProps) {
  const { t } = useTranslation('crd-space');
  const {
    space: { accountId },
  } = useSpace();
  const picker = useTemplatePicker({ allowedTypes: ['callout'], accountId, open, onOpenChange });
  const [pendingValues, setPendingValues] = useState<Partial<CalloutFormValues> | null>(null);
  const [appliedFor, setAppliedFor] = useState<string | null>(null);

  // When the picker lazily resolves the selected template's content, apply it (or stage the overwrite-confirm).
  const selectedContent = picker.selectedTemplateContent;
  const selectedId = picker.selectedTemplateId;
  useEffect(() => {
    if (!selectedContent || selectedContent.type !== 'callout' || !selectedId || appliedFor === selectedId) return;
    setAppliedFor(selectedId);
    const values = mapCalloutContentToFormValues(selectedContent);
    if (isFormDirty) {
      setPendingValues(values);
    } else {
      onTemplateSelected(values);
      onOpenChange(false);
    }
  }, [selectedContent, selectedId, appliedFor, isFormDirty, onTemplateSelected, onOpenChange]);

  const confirmOverwrite = () => {
    if (pendingValues) {
      onTemplateSelected(pendingValues);
      onOpenChange(false);
    }
    setPendingValues(null);
  };

  return (
    <>
      <TemplatePicker {...picker.pickerProps} />
      <ConfirmationDialog
        open={pendingValues !== null}
        onOpenChange={o => !o && setPendingValues(null)}
        title={t('findTemplate.overwriteTitle')}
        description={t('findTemplate.overwriteDescription')}
        confirmLabel={t('findTemplate.overwriteConfirm')}
        cancelLabel={t('dialogs.cancel')}
        onConfirm={confirmOverwrite}
        onCancel={() => setPendingValues(null)}
      />
    </>
  );
}
