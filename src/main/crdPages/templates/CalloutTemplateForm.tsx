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
 *  - No Collabora **upload** path — a template captures a *blank-create* Collabora document
 *    (`collaboraDocumentType` only); the file-upload zone is create-callout-only.
 *  - No publish/draft visibility, no "notify members" switch, no pre-populate link contributions —
 *    those are properties of a concrete callout, not of a template.
 *  - Framing/response chips stay unlocked (a template is always "fresh").
 */
import { Hash } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AllowCommentsField } from '@/crd/forms/callout/AllowCommentsField';
import { FramingChipStrip } from '@/crd/forms/callout/FramingChipStrip';
import { ResponsePanel } from '@/crd/forms/callout/ResponsePanel';
import { ResponseTypeChipStrip } from '@/crd/forms/callout/ResponseTypeChipStrip';
import { MarkdownEditor, type MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';
import { ReferencesEditor } from '@/crd/forms/references/ReferencesEditor';
import { TagsInput } from '@/crd/forms/tags-input';
import { Label } from '@/crd/primitives/label';
import { FramingEditorConnector } from '@/main/crdPages/space/callout/FramingEditorConnector';
import { ResponseDefaultsConnector } from '@/main/crdPages/space/callout/ResponseDefaultsConnector';
import { referenceRowErrors, type UseCrdCalloutFormResult } from '@/main/crdPages/space/hooks/useCrdCalloutForm';

export type CalloutTemplateFormProps = {
  /** The `useCrdCalloutForm` instance owned by `useTemplateForms` (controlled). */
  form: UseCrdCalloutFormResult;
  /** Parent space id — passed to `ResponseDefaultsConnector` so its "apply a content template" picker can load. */
  spaceId?: string;
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
  disabled,
  onReferenceFileUpload,
  referenceUploadAccept,
  onImageUpload,
  iframeAllowedUrls,
  onError,
}: CalloutTemplateFormProps) {
  const { t } = useTranslation('crd-space');
  const { values, errors, setField } = form;
  const [defaultsOpen, setDefaultsOpen] = useState(false);

  const responseTypeSupportsDefaults =
    values.responseType === 'post' || values.responseType === 'memo' || values.responseType === 'whiteboard';

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
        <FramingChipStrip value={values.framingChip} onChange={chip => setField('framingChip', chip)} />
        <FramingEditorConnector
          mode="create"
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
          whiteboardContent={values.whiteboardContent}
          whiteboardPreviewSettings={values.whiteboardPreviewSettings}
          whiteboardPreviewImages={values.whiteboardPreviewImages}
          whiteboardPreviewServerUrl={values.whiteboardPreviewServerUrl}
          whiteboardConfigured={values.whiteboardConfigured}
          whiteboardTitle={values.title.trim() || t('callout.whiteboard')}
          onWhiteboardChange={(content, previewImages, previewSettings) => {
            setField('whiteboardContent', content);
            setField('whiteboardPreviewImages', previewImages ?? []);
            setField('whiteboardPreviewSettings', previewSettings);
            setField('whiteboardConfigured', true);
          }}
          memoMarkdown={values.memoMarkdown}
          onMemoMarkdownChange={v => setField('memoMarkdown', v)}
          memoUpload={{ onImageUpload, iframeAllowedUrls, onError }}
          mediaGalleryVisuals={values.mediaGalleryVisuals}
          onMediaGalleryVisualsChange={v => setField('mediaGalleryVisuals', v)}
          collaboraDocumentType={values.collaboraDocumentType}
          onCollaboraDocumentTypeChange={v => setField('collaboraDocumentType', v)}
        />
      </div>

      {/* Zone 2 — responses */}
      <div className="space-y-4">
        <ResponseTypeChipStrip value={values.responseType} onChange={type => setField('responseType', type)} />
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
        markdownUpload={{ onImageUpload, iframeAllowedUrls, onError }}
      />
    </div>
  );
}
