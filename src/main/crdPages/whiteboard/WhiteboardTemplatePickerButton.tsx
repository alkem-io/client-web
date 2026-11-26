import { Suspense, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TemplatePicker } from '@/crd/components/templates/TemplatePicker';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Skeleton } from '@/crd/primitives/skeleton';
import { useSpace } from '@/domain/space/context/useSpace';
import { servedSpaceTemplatesSetId, useTemplatePicker } from '@/main/crdPages/templates/useTemplatePicker';

type WhiteboardTemplatePickerButtonProps = {
  disabled?: boolean;
  onImport: (sourceWhiteboardId: string) => Promise<void>;
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
  const { t: tSpace } = useTranslation('crd-space');
  const {
    space: { accountId, levelZeroSpaceId },
  } = useSpace();
  // In a space, its templates are not served yet (servedSpaceTemplatesSetId): the picker says so in place, sending
  // nothing. Outside a space the picker offers its other sources, as legacy.
  const spaceTemplatesSetId = servedSpaceTemplatesSetId(levelZeroSpaceId);
  const pickerAvailable = !levelZeroSpaceId || Boolean(spaceTemplatesSetId);
  const [unavailableOpen, setUnavailableOpen] = useState(false);
  const picker = useTemplatePicker({ allowedTypes: ['whiteboard'], accountId, spaceTemplatesSetId });
  const [importing, setImporting] = useState(false);
  const consumedSelection = useRef<typeof picker.selectedTemplateContent>(null);

  const selectedContent = picker.selectedTemplateContent;
  const selectedId = picker.selectedTemplateId;
  useEffect(() => {
    if (!selectedContent) {
      consumedSelection.current = null;
      return;
    }
    if (selectedContent.type !== 'whiteboard' || !selectedId || consumedSelection.current === selectedContent) {
      return;
    }
    const sourceWhiteboardID = selectedContent.sourceWhiteboardId;
    if (!sourceWhiteboardID) return;
    consumedSelection.current = selectedContent;
    picker.clearSelection();
    setImporting(true);
    void onImport(sourceWhiteboardID).finally(() => {
      setImporting(false);
    });
  }, [selectedContent, selectedId, picker, onImport]);

  return (
    // Own Suspense boundary: the template picker pulls in the lazy `crd-templates`
    // i18n namespace, which suspends on first render. Without an isolated boundary
    // here, that suspension bubbles up to the page-level <Suspense> wrapping this
    // dialog and tears down the whole subtree — including the live Excalidraw editor.
    // Excalidraw's componentWillUnmount resets its scene, so the collaboratively
    // loaded elements are lost on remount. Keeping the suspension local protects the canvas.
    <Suspense fallback={<Skeleton role="status" aria-label={t('common.loading')} className="h-8 w-28" />}>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || importing}
        onClick={pickerAvailable ? picker.openPicker : () => setUnavailableOpen(true)}
      >
        {t('buttons.find-template')}
      </Button>
      {pickerAvailable ? (
        <TemplatePicker {...picker.pickerProps} />
      ) : (
        <Dialog open={unavailableOpen} onOpenChange={setUnavailableOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('buttons.find-template')}</DialogTitle>
            </DialogHeader>
            <p className="text-body text-muted-foreground py-6 text-center">{tSpace('tabs.unavailable')}</p>
          </DialogContent>
        </Dialog>
      )}
    </Suspense>
  );
}
