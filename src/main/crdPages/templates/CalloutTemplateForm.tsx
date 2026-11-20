/**
 * CalloutTemplateForm — the per-type form body for **Callout** templates (T025).
 *
 * Integration layer (NOT `src/crd/`): it composes the existing CRD callout-authoring connectors
 * (`FramingEditorConnector`, `ResponseDefaultsConnector`) plus the callout-form controls
 * (`FramingChipStrip`, `ResponseTypeChipStrip`, `ResponsePanel`, `ReferencesEditor`,
 * `AllowCommentsField`), all of which import Apollo / `@/domain/*` and so cannot live in the
 * design-system layer. Controlled — form state lives in `useTemplateForms` via `useCrdCalloutForm`
 * (whose result is threaded in as the `form` prop); this component never owns the lifecycle.
 *
 * Differences vs the live callout editor (`CalloutFormConnector`):
 *  - A Collabora document template is captured either blank (`collaboraDocumentType` only) or
 *    from an uploaded file, staged here and sent with the create mutation (FR-013). The upload
 *    zone is create-only: once the template exists, replacing its document's bytes is out of scope.
 *  - No publish/draft visibility, no "notify members" switch, no pre-populate link contributions —
 *    those are properties of a concrete callout, not of a template.
 *  - Creating a template: framing/response chips are fully editable. Editing an existing template
 *    (`editMode`): both strips are locked like a live callout. The framing type can only be cleared
 *    back to "none" (with a confirmation); the response type is fully fixed — it can't be switched or
 *    cleared. This mirrors `CalloutFormConnector`'s edit mode. A Form framing cannot be cleared at all.
 *  - A Form framing edits the definition only: no responses exist on a template, so the response-aware
 *    edit context (widening confirmation, type-change hint) is never passed.
 */
import { Hash } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWhiteboardDetailsByIdQuery } from '@/core/apollo/generated/apollo-hooks';
import { AllowCommentsField } from '@/crd/forms/callout/AllowCommentsField';
import type { DocumentImportError } from '@/crd/forms/callout/DocumentImportZone';
import { type FramingChipId, FramingChipStrip } from '@/crd/forms/callout/FramingChipStrip';
import { ResponsePanel } from '@/crd/forms/callout/ResponsePanel';
import { ResponseTypeChipStrip } from '@/crd/forms/callout/ResponseTypeChipStrip';
import { MarkdownEditor, type MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';
import { ReferencesEditor } from '@/crd/forms/references/ReferencesEditor';
import { TagsInput } from '@/crd/forms/tags-input';
import { Label } from '@/crd/primitives/label';
import {
  COLLABORA_IMPORT_ACCEPT_ATTR,
  COLLABORA_IMPORT_EXTENSIONS_P1,
  COLLABORA_IMPORT_MAX_BYTES,
} from '@/domain/collaboration/calloutContributions/collaboraDocument/collaboraImportFormats';
import { deriveCollaboraImportErrorMessage } from '@/domain/collaboration/calloutContributions/collaboraDocument/deriveCollaboraImportErrorMessage';
import { validateCollaboraImportFile } from '@/domain/collaboration/calloutContributions/collaboraDocument/validateCollaboraImportFile';
import type { WhiteboardDraftLifecycle } from '@/domain/collaboration/whiteboard/WhiteboardDraft/useWhiteboardDraft';
import { healContributorCollection } from '@/main/crdPages/space/callout/contributorCollectionMapper';
import { FramingEditorConnector } from '@/main/crdPages/space/callout/FramingEditorConnector';
import { ResponseDefaultsConnector } from '@/main/crdPages/space/callout/ResponseDefaultsConnector';
import {
  formQuestionErrors,
  referenceRowErrors,
  type UseCrdCalloutFormResult,
} from '@/main/crdPages/space/hooks/useCrdCalloutForm';

/** Every framing chip. A Poll or Form template captures the definition only, never votes or responses. */
const TEMPLATE_FRAMING_CHIPS: FramingChipId[] = [
  'whiteboard',
  'memo',
  'document',
  'cta',
  'image',
  'poll',
  'contributors',
  'spaces',
  'form',
];

/** Framing kinds that cannot be cleared once the template exists, as on a live Post. */
const FIXED_KIND_FRAMING_CHIPS: FramingChipId[] = ['form'];

export type CalloutTemplateFormProps = {
  /** The `useCrdCalloutForm` instance owned by `useTemplateForms` (controlled). */
  form: UseCrdCalloutFormResult;
  /**
   * Editing an existing template (vs. creating a new one). When true the framing type is locked —
   * it can only be cleared to "none" via the active chip's X (with a confirmation), never switched.
   */
  editMode?: boolean;
  /** Parent space id — passed to `ResponseDefaultsConnector` so its "apply a content template" picker can load. */
  spaceId?: string;
  framingWhiteboardDraft?: WhiteboardDraftLifecycle;
  defaultWhiteboardDraft?: WhiteboardDraftLifecycle;
  /** Disable every control while the template create/update mutation is in flight. */
  disabled?: boolean;
  /**
   * Per-row paperclip file-attach for the "More options" References editor (D24). Wired by
   * `useTemplateForms`' `referenceUpload` arg to the holder bucket (`temporaryLocation: true`); omit to
   * hide the paperclip (read-only / provider-less callers). Mirrors the live Create-Callout dialog.
   */
  onReferenceFileUpload?: (file: File) => Promise<string | null>;
  /** `accept` attribute for the references file picker. */
  referenceUploadAccept?: string;
} & MarkdownUploadProps;

export function CalloutTemplateForm({
  form,
  spaceId,
  framingWhiteboardDraft,
  defaultWhiteboardDraft,
  disabled,
  editMode,
  onReferenceFileUpload,
  referenceUploadAccept,
  onImageUpload,
  iframeAllowedUrls,
  onError,
}: CalloutTemplateFormProps) {
  const { t } = useTranslation('crd-space');
  const { values, errors, setField } = form;
  const [defaultsOpen, setDefaultsOpen] = useState(false);
  const [importError, setImportError] = useState<DocumentImportError | null>(null);
  const editableWhiteboardId = editMode ? values.editMeta?.whiteboardId : undefined;
  const { data: whiteboardData } = useWhiteboardDetailsByIdQuery({
    variables: { whiteboardId: editableWhiteboardId ?? '' },
    skip: !editableWhiteboardId,
  });
  const editableWhiteboard = whiteboardData?.lookup.whiteboard;

  const responseTypeSupportsDefaults =
    values.responseType === 'post' || values.responseType === 'memo' || values.responseType === 'whiteboard';

  // Collabora upload staging, copied from the third shipped consumer of these primitives
  // (`DocumentContributionAddConnector`). The file is held on the form values and sent with the
  // create-template mutation by `useTemplateForms`.
  const collaboraFormatList = COLLABORA_IMPORT_EXTENSIONS_P1.join(', ');
  const collaboraCapMb = Math.round(COLLABORA_IMPORT_MAX_BYTES / (1024 * 1024));
  const collaboraErrorMessage = deriveCollaboraImportErrorMessage(importError, t, collaboraFormatList, collaboraCapMb);

  const handleCollaboraFileChange = (next: File | null) => {
    if (!next) {
      setField('collaboraUploadFile', null);
      return;
    }
    // Client-side pre-check BEFORE any network call.
    const validation = validateCollaboraImportFile([next]);
    if (!validation.ok) {
      setImportError(validation.error);
      setField('collaboraUploadFile', null);
      return;
    }
    setImportError(null);
    setField('collaboraUploadFile', next);
  };

  // Leaving the 'document' chip abandons the staged file, exactly as
  // CalloutFormConnector's chip-switch guard does on the live-callout side.
  // Without this the file survives a chip round-trip and `useTemplateForms`
  // still sends it with the template — a template editor cannot replace a
  // created template's document bytes, so the wrong file would be permanent.
  const handleFramingChipChange = (chip: typeof values.framingChip) => {
    if (chip !== 'document' && values.framingChip === 'document') {
      setField('collaboraUploadFile', null);
      setImportError(null);
    }
    setField('framingChip', chip);
  };

  return (
    <div className="space-y-6">
      {/* Framing title — the callout's framing.profile.displayName (distinct from the template name). */}
      <div className="space-y-1.5">
        <Label htmlFor="callout-template-framing-title" className="text-caption text-muted-foreground">
          {t('forms.titleLabel')}
        </Label>
        <input
          id="callout-template-framing-title"
          type="text"
          value={values.title}
          onChange={e => setField('title', e.target.value)}
          disabled={disabled}
          className="w-full h-9 px-3 border border-border rounded-md bg-background text-control focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
        />
        {errors.title && <p className="text-caption text-destructive">{errors.title}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="callout-template-framing-description" className="text-caption text-muted-foreground">
          {t('forms.descriptionLabel')}
        </Label>
        <MarkdownEditor
          value={values.description}
          onChange={v => setField('description', v)}
          placeholder={t('forms.descriptionPlaceholder')}
          onImageUpload={onImageUpload}
          iframeAllowedUrls={iframeAllowedUrls}
          onError={onError}
        />
      </div>

      {/* Zone 1 — framing */}
      <div className="space-y-4">
        <FramingChipStrip
          value={values.framingChip}
          onChange={handleFramingChipChange}
          editMode={editMode}
          allowedChips={TEMPLATE_FRAMING_CHIPS}
          fixedKindChips={FIXED_KIND_FRAMING_CHIPS}
        />
        <FramingEditorConnector
          mode={editMode ? 'edit' : 'create'}
          editMemoId={editMode ? values.editMeta?.memoId : undefined}
          editWhiteboard={editableWhiteboard}
          editWhiteboardShareUrl={editableWhiteboard?.profile.url ?? undefined}
          framingType={values.framingChip}
          linkUrl={values.linkUrl}
          onLinkUrlChange={v => setField('linkUrl', v)}
          linkUrlError={errors.linkUrl}
          linkDisplayName={values.linkDisplayName}
          onLinkDisplayNameChange={v => setField('linkDisplayName', v)}
          linkDisplayNameError={errors.linkDisplayName}
          pollQuestion={values.pollQuestion}
          onPollQuestionChange={v => setField('pollQuestion', v)}
          pollQuestionError={errors.pollQuestion}
          pollOptions={values.pollOptions}
          onPollOptionsChange={v => setField('pollOptions', v)}
          pollOptionsError={errors.pollOptions}
          pollAllowMultiple={values.pollAllowMultiple}
          onPollAllowMultipleChange={v => setField('pollAllowMultiple', v)}
          pollAllowCustomOptions={values.pollAllowCustomOptions}
          onPollAllowCustomOptionsChange={v => setField('pollAllowCustomOptions', v)}
          pollHideResultsUntilVoted={values.pollHideResultsUntilVoted}
          onPollHideResultsUntilVotedChange={v => setField('pollHideResultsUntilVoted', v)}
          pollShowVoterAvatars={values.pollShowVoterAvatars}
          onPollShowVoterAvatarsChange={v => setField('pollShowVoterAvatars', v)}
          formTitle={values.formTitle}
          onFormTitleChange={v => setField('formTitle', v)}
          formDescription={values.formDescription}
          onFormDescriptionChange={v => setField('formDescription', v)}
          formQuestions={values.formQuestions}
          onFormQuestionsChange={v => setField('formQuestions', v)}
          formQuestionsErrors={formQuestionErrors(errors)}
          formSettings={values.formSettings}
          onFormSettingsChange={v => setField('formSettings', v)}
          whiteboardPreviewImages={values.whiteboardPreviewImages}
          whiteboardPreviewServerUrl={values.whiteboardPreviewServerUrl}
          whiteboardConfigured={values.whiteboardConfigured}
          whiteboardTitle={values.title.trim() || t('callout.whiteboard')}
          whiteboardDraft={editMode ? undefined : framingWhiteboardDraft}
          memoMarkdown={values.memoMarkdown}
          onMemoMarkdownChange={v => setField('memoMarkdown', v)}
          memoUpload={{ onImageUpload, iframeAllowedUrls, onError }}
          mediaGalleryVisuals={values.mediaGalleryVisuals}
          onMediaGalleryVisualsChange={v => setField('mediaGalleryVisuals', v)}
          collaboraDocumentType={values.collaboraDocumentType}
          onCollaboraDocumentTypeChange={v => setField('collaboraDocumentType', v)}
          collaboraUpload={
            editMode
              ? undefined
              : {
                  acceptAttr: COLLABORA_IMPORT_ACCEPT_ATTR,
                  file: values.collaboraUploadFile,
                  onFileChange: handleCollaboraFileChange,
                  onError: setImportError,
                  error: importError,
                  errorMessage: collaboraErrorMessage,
                  busy: disabled,
                  labelHint: t('callout.documentImportHint'),
                  labelMaxSize: t('callout.documentImportMaxSize', { cap: collaboraCapMb }),
                  labelRemoveFile: t('callout.documentImportRemoveFile'),
                  labelOr: t('callout.documentImportOr'),
                }
          }
          contributorCollection={values.contributorCollection}
          onContributorCollectionChange={v =>
            setField(
              'contributorCollection',
              // Preserve mapView — the CRD type-config field
              // only emits types/defaultType/defaultView.
              healContributorCollection({ ...v, mapView: values.contributorCollection.mapView })
            )
          }
          contributorCollectionError={errors.contributorCollection}
          cardVariant={values.cardVariant}
          onCardVariantChange={v => setField('cardVariant', v)}
        />
      </div>

      {/* Zone 2 — responses */}
      <div className="space-y-4">
        <ResponseTypeChipStrip
          value={values.responseType}
          onChange={type => setField('responseType', type)}
          locked={editMode}
        />
        <ResponsePanel
          type={values.responseType}
          allowedActors={values.allowedActors}
          onAllowedActorsChange={v => setField('allowedActors', v)}
          contributionCommentsEnabled={values.contributionCommentsEnabled}
          onContributionCommentsEnabledChange={v => setField('contributionCommentsEnabled', v)}
          prePopulateLinkErrors={errors as Record<string, string | undefined>}
          onSetDefaults={responseTypeSupportsDefaults ? () => setDefaultsOpen(true) : undefined}
          disabled={disabled}
        />
      </div>

      {/* Zone 3 — more options.
          NOTE — there are **two** tag sets in a Callout template (FR-020):
            (a) the *template's* tags — `commonValue.tags`, rendered by the dialog shell
                (`TemplateFormDialog`). Drive the template gallery's tag filter.
            (b) the *captured callout's* tags — `values.tags` (this form's `useCrdCalloutForm` value),
                rendered below. Applied to every callout created from this template.
          Both are persisted; the integration layer (`useTemplateForms` / `calloutFormMapper`) maps
          each to the right tagset (template profile vs. callout framing). The two tag inputs are
          intentionally separate; do not collapse them.
          Mirrors the live callout-creation form (`CalloutFormConnector.tsx` "moreOptionsSlot"). */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="callout-template-tags" className="text-caption text-muted-foreground">
            {t('forms.tagsLabel')}
          </Label>
          <TagsInput
            value={values.tags}
            onChange={tags => setField('tags', tags)}
            placeholder={t('forms.tagsPlaceholder')}
            minLength={2}
            formatTooShortErrorMessage={min => t('forms.tagsTooShort', { min })}
            icon={<Hash aria-hidden="true" className="w-3.5 h-3.5 text-muted-foreground" />}
          />
        </div>
        <AllowCommentsField
          value={values.framingCommentsEnabled}
          onChange={v => setField('framingCommentsEnabled', v)}
          disabled={disabled}
        />
        <ReferencesEditor
          rows={values.referenceRows}
          onChange={rows => setField('referenceRows', rows)}
          errors={referenceRowErrors(errors)}
          disabled={disabled}
          onFileUpload={onReferenceFileUpload}
          uploadAccept={referenceUploadAccept}
        />
      </div>

      <ResponseDefaultsConnector
        open={defaultsOpen}
        onOpenChange={setDefaultsOpen}
        type={values.responseType}
        spaceId={spaceId}
        values={values.contributionDefaults}
        onSave={next => setField('contributionDefaults', next)}
        whiteboardDraft={defaultWhiteboardDraft}
        markdownUpload={{ onImageUpload, iframeAllowedUrls, onError }}
      />
    </div>
  );
}
