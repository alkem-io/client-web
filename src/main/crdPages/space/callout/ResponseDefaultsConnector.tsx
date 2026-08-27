import { Pencil } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSpaceTemplatesManagerQuery } from '@/core/apollo/generated/apollo-hooks';
import { TemplatePicker } from '@/crd/components/templates/TemplatePicker';
import type { TemplateType } from '@/crd/components/templates/types';
import { ResponseDefaultsDialog } from '@/crd/forms/callout/ResponseDefaultsDialog';
import type { MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';
import { Button } from '@/crd/primitives/button';
import { Label } from '@/crd/primitives/label';
import type { WhiteboardDraftLifecycle } from '@/domain/collaboration/whiteboard/WhiteboardDraft/useWhiteboardDraft';
import { WhiteboardDraftEditor } from '@/domain/collaboration/whiteboard/WhiteboardDraft/WhiteboardDraftEditor';
import { useSpace } from '@/domain/space/context/useSpace';
import type { ContributionDefaults, ResponseType } from '@/main/crdPages/space/hooks/useCrdCalloutForm';
import { useTemplatePicker } from '@/main/crdPages/templates/useTemplatePicker';

type ApplyDraft = (next: Partial<ContributionDefaults>) => void;
type PickerHandle = ReturnType<typeof useTemplatePicker>;

/**
 * D20, 2026-05-19 — small inner component rendered inside the dialog's render-prop `templateSlot`.
 * Owns the picker-apply effect: when `picker.selectedTemplateContent` resolves to a freshly-picked
 * template, it applies the matching field. The apply target is **per type**:
 *
 * - `post` → the dialog's draft via `applyDraft` (D20: the markdown editor binds to the draft, so
 *   the user sees the templated description immediately, can edit it, and Save/Cancel behave).
 * - `whiteboard` → the selected template's whiteboard id. The server copies the canonical snapshot
 *   and re-homes media when the callout is saved; no Yjs bytes cross GraphQL.
 *
 * Both callbacks are stored in refs so the effect's deps stay minimal and don't re-fire on each
 * parent render. State (`appliedFor`) resets each time the dialog re-opens — fresh apply per session.
 */
function TemplateApplyButton({ applyDraft, picker }: { applyDraft: ApplyDraft; picker: PickerHandle }) {
  const { t } = useTranslation('crd-space');
  const applyDraftRef = useRef(applyDraft);
  applyDraftRef.current = applyDraft;
  const selectedContent = picker.selectedTemplateContent;
  const selectedId = picker.selectedTemplateId;
  const [appliedFor, setAppliedFor] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedContent || !selectedId || appliedFor === selectedId) return;
    setAppliedFor(selectedId);
    if (selectedContent.type === 'post') {
      applyDraftRef.current({ postDescription: selectedContent.defaultDescription });
    } else if (selectedContent.type === 'whiteboard' && selectedContent.sourceWhiteboardId) {
      applyDraftRef.current({
        sourceWhiteboardId: selectedContent.sourceWhiteboardId,
        sourceCalloutId: undefined,
        whiteboardContentAvailable: true,
        clearWhiteboardContent: false,
      });
    }
  }, [selectedContent, selectedId, appliedFor]);

  return (
    <div className="space-y-1.5">
      <Label className="text-body text-foreground">{t('responseDefaults.template')}</Label>
      <Button variant="outline" size="sm" onClick={picker.openPicker}>
        {t('responseDefaults.templatePlaceholder')}
      </Button>
    </div>
  );
}

type ResponseDefaultsConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: ResponseType;
  /** Parent space id — drives the templates-set lookup so the picker can offer the Space source section. */
  spaceId?: string;
  values: ContributionDefaults;
  onSave: (next: ContributionDefaults) => void;
  /** Image-upload wiring for the default post/memo description editor. */
  markdownUpload?: MarkdownUploadProps;
  whiteboardDraft?: WhiteboardDraftLifecycle;
};

/**
 * Wraps `ResponseDefaultsDialog` and provides the two integration-only slots:
 *
 * 1. **Template picker** — the shared CRD `TemplatePicker` in `mode:'select'`.
 *    Offers a **Post** template for the post/memo default description and a
 *    **Whiteboard** template for the default whiteboard, sourced from the
 *    space's templates set + its account + the platform library. Selecting a
 *    template applies its content to the matching contribution default.
 *
 * 2. **Whiteboard defaults** — source selection and live editing on a lazily
 *    materialized server-owned draft. GraphQL carries only the draft Whiteboard id.
 */
export function ResponseDefaultsConnector({
  open,
  onOpenChange,
  type,
  spaceId,
  values,
  onSave,
  markdownUpload,
  whiteboardDraft,
}: ResponseDefaultsConnectorProps) {
  const { t } = useTranslation('crd-space');
  const [whiteboardEditorSession, setWhiteboardEditorSession] = useState<number>();
  const dialogSessionRef = useRef(0);
  const initialDraftID = useRef<string | undefined>(undefined);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open !== wasOpen.current) {
      dialogSessionRef.current += 1;
      if (open) {
        initialDraftID.current = values.whiteboardDraft?.whiteboardID;
      }
    }
    wasOpen.current = open;
  }, [open, values.whiteboardDraft?.whiteboardID]);
  const {
    space: { accountId },
  } = useSpace();

  // Resolve the space's templates set so the picker can offer the Space source section.
  const { data: tmData } = useSpaceTemplatesManagerQuery({ variables: { spaceId: spaceId ?? '' }, skip: !spaceId });
  const spaceTemplatesSetId = tmData?.lookup.space?.templatesManager?.templatesSet?.id;
  const pickerType: TemplateType = type === 'whiteboard' ? 'whiteboard' : 'post';
  const picker = useTemplatePicker({ allowedTypes: [pickerType], spaceTemplatesSetId, accountId });

  // D20, 2026-05-19 — template-apply target is per type. `post` writes the dialog's draft via the
  // render-prop slot's `applyDraft` helper (the markdown editor binds to the draft, so the value is
  // visible/editable and Save/Cancel behave). This replaced the old
  // `onSave({...values, postDescription: ...})` route, which bypassed the draft and (a) didn't
  // populate `defaultDescription` (no sync effect for that field), (b) was overwritten by the
  // dialog's stale draft on Save, and (c) leaked to the parent on Cancel.
  const supportsTemplate = type === 'post' || type === 'memo' || type === 'whiteboard';
  const templateSlot = supportsTemplate
    ? ({ applyDraft }: { applyDraft: ApplyDraft }) => <TemplateApplyButton applyDraft={applyDraft} picker={picker} />
    : undefined;

  const whiteboardSlot =
    type === 'whiteboard' && whiteboardDraft
      ? ({ draft, applyDraft }: { draft: ContributionDefaults; applyDraft: ApplyDraft }) => {
          const openEditor = async () => {
            const dialogSession = dialogSessionRef.current;
            const materialized = await whiteboardDraft.materialize({
              sourceWhiteboardID: draft.sourceWhiteboardId,
              sourceCalloutID: draft.sourceCalloutId,
            });
            if (!materialized || dialogSessionRef.current !== dialogSession) return;
            applyDraft({
              whiteboardDraft: materialized,
              whiteboardContentAvailable: true,
              clearWhiteboardContent: false,
            });
            setWhiteboardEditorSession(dialogSession);
          };
          return (
            <>
              <Button variant="outline" size="sm" disabled={whiteboardDraft.loading} onClick={() => void openEditor()}>
                <Pencil className="size-4" aria-hidden="true" />
                {t('framing.edit')}
              </Button>
              {open && whiteboardEditorSession === dialogSessionRef.current && whiteboardDraft.handle && (
                <WhiteboardDraftEditor
                  whiteboardID={whiteboardDraft.handle.whiteboardID}
                  displayName={draft.defaultDisplayName || t('callout.whiteboard')}
                  draftLifecycle={whiteboardDraft}
                  onClose={() => setWhiteboardEditorSession(undefined)}
                />
              )}
            </>
          );
        }
      : undefined;

  const cancelWhiteboardDraft = async () => {
    dialogSessionRef.current += 1;
    setWhiteboardEditorSession(undefined);
    if (!whiteboardDraft) {
      return true;
    }
    if (whiteboardDraft.handle && whiteboardDraft.handle.whiteboardID === initialDraftID.current) {
      return true;
    }
    return whiteboardDraft.discard();
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      dialogSessionRef.current += 1;
      setWhiteboardEditorSession(undefined);
    }
    onOpenChange(nextOpen);
  };

  return (
    <>
      <ResponseDefaultsDialog
        open={open}
        onOpenChange={handleDialogOpenChange}
        type={type}
        values={values}
        onSave={onSave}
        templateSlot={templateSlot}
        whiteboardSlot={whiteboardSlot}
        onCancel={type === 'whiteboard' ? cancelWhiteboardDraft : undefined}
        disabled={whiteboardDraft?.loading}
        onImageUpload={markdownUpload?.onImageUpload}
        iframeAllowedUrls={markdownUpload?.iframeAllowedUrls}
        onError={markdownUpload?.onError}
      />
      <TemplatePicker {...picker.pickerProps} />
    </>
  );
}
