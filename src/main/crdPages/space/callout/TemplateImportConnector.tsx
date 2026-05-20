import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSpaceTemplatesManagerQuery, useTemplateContentLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { TemplatePicker } from '@/crd/components/templates/TemplatePicker';
import { useSpace } from '@/domain/space/context/useSpace';
import type { CalloutFormValues } from '@/main/crdPages/space/hooks/useCrdCalloutForm';
import { loadCalloutTemplateFormValues } from '@/main/crdPages/templates/loadCalloutTemplateFormValues';
import { useTemplatePicker } from '@/main/crdPages/templates/useTemplatePicker';

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
 * Wires the CRD `TemplatePicker` (mode='select', callout templates) to the CRD callout-creation form.
 * Sources: the owning level-zero space's templates set + the space's account + the platform library.
 * On selection the connector re-fetches the picked template's **full** callout content (the picker's
 * preview shape is lossy — no poll settings / tags / contribution actors) and maps it via the same
 * `calloutTemplateContentToFormValues` the Callout-template editor uses, so every framing kind
 * (incl. Collabora-document and poll) round-trips faithfully. The overwrite-confirm runs first when
 * the form is dirty.
 */
export function TemplateImportConnector({
  open,
  onOpenChange,
  isFormDirty,
  onTemplateSelected,
}: TemplateImportConnectorProps) {
  const { t } = useTranslation('crd-space');
  const {
    space: { accountId, levelZeroSpaceId },
  } = useSpace();
  const { data: tmData } = useSpaceTemplatesManagerQuery({
    variables: { spaceId: levelZeroSpaceId ?? '' },
    skip: !levelZeroSpaceId,
  });
  const spaceTemplatesSetId = tmData?.lookup.space?.templatesManager?.templatesSet?.id;
  const picker = useTemplatePicker({ allowedTypes: ['callout'], accountId, spaceTemplatesSetId, open, onOpenChange });
  const [getTemplateContent] = useTemplateContentLazyQuery();
  const [pendingValues, setPendingValues] = useState<Partial<CalloutFormValues> | null>(null);
  // 2026-05-19 — use a ref (not state) to track "which selectedId has the effect already fetched for".
  // The previous `appliedFor` state had a subtle bug: calling `setAppliedFor(selectedId)` inside the
  // effect's synchronous body triggered a re-render → React then fired the *cleanup* of the still-in-
  // flight effect (because `appliedFor` is in deps) → `cancelled = true` → when the async fetch
  // eventually resolved the apply step was silently skipped. Net effect: the picker closed but the
  // form was never populated. Tracking the latest pick in a ref decouples the staleness check from
  // React's effect lifecycle — refs don't trigger re-renders so the effect stays alive through the
  // full async chain, while a *newer* pick (which DOES re-fire the effect by changing `selectedId`)
  // still supersedes via the ref check at each await boundary.
  const fetchedForRef = useRef<string | null>(null);
  const selectedId = picker.selectedTemplateId;
  const { clearSelection } = picker;

  // FR-084: a template pick is a one-shot, consume-once event. After the connector consumes a
  // selection (direct apply, overwrite-confirm, or overwrite-cancel/dismiss) it clears the picker's
  // `selectedTemplateId` so re-picking the *same* template is a real null→id transition again — without
  // this, `setSelectedTemplateId(sameId)` is a no-op and the flow never re-runs. The ref guard resets
  // here whenever the selection clears, so the next pick of the same id is allowed to fetch again.
  const consumeSelection = () => {
    fetchedForRef.current = null;
    clearSelection();
  };

  // When the user picks a template, re-fetch its full callout content and apply (or stage the overwrite-confirm).
  // D18, 2026-05-18: when the template carries a server-rendered whiteboard preview, fetch the image as
  // a `Blob` and seed `whiteboardPreviewImages` so `CalloutFormConnector`'s post-create upload step carries
  // it through to the new callout's `WHITEBOARD_PREVIEW` Visual. Fetch failures are non-fatal (the form
  // still shows the server URL via the D16 fallback; the new callout just ends up with no preview image).
  useEffect(() => {
    // Selection cleared (initial, or after a consume) — reset the per-id guard so the same template
    // can be picked again later and re-run the fetch/confirm flow.
    if (!selectedId) {
      fetchedForRef.current = null;
      return;
    }
    if (fetchedForRef.current === selectedId) return;
    fetchedForRef.current = selectedId;
    void loadCalloutTemplateFormValues(getTemplateContent, selectedId).then(values => {
      // If a newer pick has superseded this one, the ref's `current` will no longer match.
      if (fetchedForRef.current !== selectedId || !values) return;
      if (isFormDirty) {
        setPendingValues(values);
      } else {
        onTemplateSelected(values);
        onOpenChange(false);
        consumeSelection();
      }
    });
  }, [selectedId, isFormDirty, onTemplateSelected, onOpenChange, getTemplateContent, clearSelection]);

  const confirmOverwrite = () => {
    if (pendingValues) {
      onTemplateSelected(pendingValues);
      onOpenChange(false);
    }
    setPendingValues(null);
    consumeSelection();
  };

  const cancelOverwrite = () => {
    setPendingValues(null);
    consumeSelection();
  };

  return (
    <>
      <TemplatePicker {...picker.pickerProps} />
      <ConfirmationDialog
        open={pendingValues !== null}
        onOpenChange={o => !o && cancelOverwrite()}
        title={t('findTemplate.overwriteTitle')}
        description={t('findTemplate.overwriteDescription')}
        confirmLabel={t('findTemplate.overwriteConfirm')}
        cancelLabel={t('dialogs.cancel')}
        onConfirm={confirmOverwrite}
        onCancel={cancelOverwrite}
      />
    </>
  );
}
