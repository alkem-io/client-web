import { Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSpaceTemplatesManagerQuery } from '@/core/apollo/generated/apollo-hooks';
import { TemplatePicker } from '@/crd/components/templates/TemplatePicker';
import { Button } from '@/crd/primitives/button';
import { Skeleton } from '@/crd/primitives/skeleton';
import { useSpace } from '@/domain/space/context/useSpace';
import { useTemplatePicker } from '@/main/crdPages/templates/useTemplatePicker';

type WhiteboardTemplatePickerButtonProps = {
  disabled?: boolean;
  /** Called with the picked Whiteboard template's drawing (Excalidraw JSON) so the caller can merge it. */
  onImport: (whiteboardContent: string) => void;
};

/**
 * "Find template" affordance for the whiteboard editor header — the CRD replacement for the legacy MUI
 * `WhiteboardDialogTemplatesLibrary` (FR-039 / T056). Opens the shared CRD `TemplatePicker`
 * (`mode:'select'`, Whiteboard templates) sourced from the surrounding space's templates set + its
 * account + the platform library; on select, hands the template's drawing to `onImport`. When used
 * outside a space (e.g. the public whiteboard route) `useSpace()` returns its empty default, so only
 * the platform library is offered.
 */
export function WhiteboardTemplatePickerButton({ disabled, onImport }: WhiteboardTemplatePickerButtonProps) {
  const { t } = useTranslation();
  const {
    space: { accountId, levelZeroSpaceId },
  } = useSpace();
  const { data: tmData } = useSpaceTemplatesManagerQuery({
    variables: { spaceId: levelZeroSpaceId ?? '' },
    skip: !levelZeroSpaceId,
  });
  const spaceTemplatesSetId = tmData?.lookup.space?.templatesManager?.templatesSet?.id;
  const picker = useTemplatePicker({ allowedTypes: ['whiteboard'], accountId, spaceTemplatesSetId });

  const selectedContent = picker.selectedTemplateContent;
  const selectedId = picker.selectedTemplateId;
  const [appliedFor, setAppliedFor] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedContent || selectedContent.type !== 'whiteboard' || !selectedId || appliedFor === selectedId) return;
    setAppliedFor(selectedId);
    onImport(selectedContent.whiteboardContent);
  }, [selectedContent, selectedId, appliedFor, onImport]);

  return (
    // Own Suspense boundary: the template picker pulls in the lazy `crd-templates`
    // i18n namespace, which suspends on first render. Without an isolated boundary
    // here, that suspension bubbles up to the page-level <Suspense> wrapping this
    // dialog and tears down the whole subtree — including the live Excalidraw editor.
    // Excalidraw's componentWillUnmount resets its scene, so the collaboratively
    // loaded elements are lost on remount. Keeping the suspension local protects the canvas.
    <Suspense fallback={<Skeleton role="status" aria-label={t('common.loading')} className="h-8 w-28" />}>
      <Button variant="outline" size="sm" disabled={disabled} onClick={picker.openPicker}>
        {t('buttons.find-template')}
      </Button>
      <TemplatePicker {...picker.pickerProps} />
    </Suspense>
  );
}
