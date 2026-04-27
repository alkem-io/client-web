/**
 * CalloutFormConnector — create / edit callout form integration layer.
 *
 * Owns the data + side-effect glue between the presentational `AddPostModal` (CRD) and
 * the GraphQL mutations. In `mode="create"` it wires `useCalloutCreation`; in `mode="edit"`
 * it fetches via `useCalloutContentQuery`, prefills the form through `mapCalloutDetailsToFormValues`,
 * and dispatches `useUpdateCalloutContentMutation` with poll-option diffing + media-gallery diff.
 *
 * Composes these sibling connectors:
 *   - `FramingEditorConnector`    — framing-specific editors (text/whiteboard/link/poll/memo/media)
 *   - `ResponseDefaultsConnector` — response-type defaults dialog (Posts / Memos / Whiteboards)
 *   - `TemplateImportConnector`   — "Find template" MUI dialog (rendered outside `.crd-root`)
 *
 * The form state lives in `useCrdCalloutForm`; `calloutFormMapper` builds the create/update
 * payloads. Dirty tracking drives the `DiscardChangesDialog` + `useBeforeUnloadGuard`.
 */
import { Hash } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCalloutContentQuery, useUpdateCalloutContentMutation } from '@/core/apollo/generated/apollo-hooks';
import { CalloutFramingType, CalloutVisibility } from '@/core/apollo/generated/graphql-schema';
import { error as logError } from '@/core/logging/sentry/log';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { DiscardChangesDialog } from '@/crd/components/dialogs/DiscardChangesDialog';
import { AddPostModal } from '@/crd/forms/callout/AddPostModal';
import { AllowCommentsField } from '@/crd/forms/callout/AllowCommentsField';
import { FramingChipStrip } from '@/crd/forms/callout/FramingChipStrip';
import { ReferencesEditor } from '@/crd/forms/callout/ReferencesEditor';
import { ResponsePanel } from '@/crd/forms/callout/ResponsePanel';
import { ResponseTypeChipStrip } from '@/crd/forms/callout/ResponseTypeChipStrip';
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
import { Label } from '@/crd/primitives/label';
import { Switch } from '@/crd/primitives/switch';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import { buildFlowStateClassificationTagsets } from '@/domain/collaboration/calloutsSet/Classification/ClassificationTagset.utils';
import { useCalloutCreation } from '@/domain/collaboration/calloutsSet/useCalloutCreation/useCalloutCreation';
import useUploadMediaGalleryVisuals from '@/domain/collaboration/mediaGallery/useUploadMediaGalleryVisuals';
import { usePollOptionManagement } from '@/domain/collaboration/poll/hooks/usePollOptionManagement';
import useUploadWhiteboardVisuals from '@/domain/collaboration/whiteboard/WhiteboardVisuals/useUploadWhiteboardVisuals';
import {
  diffPollOptions,
  isAddedSentinel,
  type PollOptionBefore,
  parseAddedSentinel,
} from '@/main/crdPages/space/hooks/useCrdCalloutPollOptionDiff';
import { useBeforeUnloadGuard } from '../hooks/useBeforeUnloadGuard';
import { useCrdCalloutForm } from '../hooks/useCrdCalloutForm';
import { mapFormToCalloutCreationInput, mapFormToCalloutUpdateInput } from './calloutFormMapper';
import { mapCalloutDetailsToFormValues } from './dataMappers/mapCalloutDetailsToFormValues';
import { FramingEditorConnector } from './FramingEditorConnector';
import { ResponseDefaultsConnector } from './ResponseDefaultsConnector';
import { TemplateImportConnector } from './TemplateImportConnector';

type CalloutFormConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'create' | 'edit';
  calloutId?: string;
  calloutsSetId?: string;
  /** Space id used by `ResponseDefaultsConnector` to fetch content templates. */
  spaceId?: string;
  /**
   * Edit-mode only: the rich callout from the parent. Threaded through to
   * `FramingEditorConnector` so the whiteboard "Open" button (T048) can launch
   * the collaborative `CrdWhiteboardView` against the actual server whiteboard.
   * `useCalloutContentQuery` doesn't return the full `WhiteboardDetails` shape,
   * so we rely on the callout the list/detail layer already loaded.
   */
  editCallout?: CalloutDetailsModelExtended;
  /**
   * Display name of the innovation-flow state to attach the new callout to. When set,
   * the callout is classified into that flow state so it appears under the active phase
   * tab. When undefined the callout is created without a phase classification (legacy /
   * single-phase callouts sets). Create mode only.
   */
  activeFlowStateName?: string;
  onFindTemplate?: () => void;
};

export function CalloutFormConnector({
  open,
  onOpenChange,
  mode = 'create',
  calloutId,
  calloutsSetId,
  spaceId,
  editCallout,
  activeFlowStateName,
  onFindTemplate,
}: CalloutFormConnectorProps) {
  const { t } = useTranslation('crd-space');
  const form = useCrdCalloutForm();
  const { values, errors, setField, validate, reset, prefill, dirty } = form;
  const [discardOpen, setDiscardOpen] = useState(false);
  const [defaultsOpen, setDefaultsOpen] = useState(false);
  const [importTemplateOpen, setImportTemplateOpen] = useState(false);

  useBeforeUnloadGuard(open && dirty);

  const { handleCreateCallout, loading: creating } = useCalloutCreation({ calloutsSetId });
  const [updateCalloutContent, { loading: updating }] = useUpdateCalloutContentMutation();
  const { uploadVisuals: uploadWhiteboardVisuals } = useUploadWhiteboardVisuals();
  const { uploadMediaGalleryVisuals, uploading: mediaGalleryUploading } = useUploadMediaGalleryVisuals();
  const notify = useNotification();

  // --- Edit mode: fetch + prefill ----------------------------------------
  const { data: editData, loading: loadingCallout } = useCalloutContentQuery({
    // biome-ignore lint/style/noNonNullAssertion: skip guards the nullable id
    variables: { calloutId: calloutId! },
    skip: mode !== 'edit' || !calloutId || !open,
    fetchPolicy: 'network-only',
  });

  // Track original poll options + media-gallery snapshot for diffing on save.
  const originalPollOptions: PollOptionBefore[] =
    editData?.lookup.callout?.framing.poll?.options
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(o => ({ id: o.id, text: o.text })) ?? [];
  const originalVisualIds = editData?.lookup.callout?.framing.mediaGallery?.visuals.map(v => v.id) ?? [];
  const originalSortOrders = Object.fromEntries(
    editData?.lookup.callout?.framing.mediaGallery?.visuals.map(v => [v.id, v.sortOrder ?? 0]) ?? []
  );

  // Prefill guard: only run once per data payload per open dialog session.
  const prefilledCalloutIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (mode !== 'edit' || !open) {
      prefilledCalloutIdRef.current = null;
      return;
    }
    const callout = editData?.lookup.callout;
    if (callout && prefilledCalloutIdRef.current !== callout.id) {
      prefill(mapCalloutDetailsToFormValues(editData));
      prefilledCalloutIdRef.current = callout.id;
    }
  }, [mode, open, editData, prefill]);

  // Reset the guard so reopening the dialog re-runs prefill on the next data.
  useEffect(() => {
    if (!open) prefilledCalloutIdRef.current = null;
  }, [open]);

  // --- Create path -------------------------------------------------------
  const submitting = creating || updating || mediaGalleryUploading;

  const createAndUpload = async (visibility: CalloutVisibility) => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) return;

    const { input, whiteboardPreviewImages } = mapFormToCalloutCreationInput(values, {
      visibility,
      whiteboardFallbackDisplayName: t('callout.whiteboard'),
    });

    // Flow-state classification: tag the new callout with the active phase so it
    // appears under the right tab. No-op when called from a non-flow-state page.
    const flowStateTagsets = buildFlowStateClassificationTagsets(activeFlowStateName);
    if (flowStateTagsets) {
      input.classification = { tagsets: flowStateTagsets };
    }

    let result: Awaited<ReturnType<typeof handleCreateCallout>>;
    try {
      result = await handleCreateCallout(input);
    } catch (err) {
      logError(new Error('Callout creation mutation failed', { cause: err as Error }));
      return;
    }
    if (!result) return;

    try {
      if (input.framing.type === CalloutFramingType.Whiteboard && whiteboardPreviewImages) {
        const whiteboard = result.framing.whiteboard;
        if (whiteboard?.profile) {
          await uploadWhiteboardVisuals(
            whiteboardPreviewImages,
            {
              cardVisualId: whiteboard.profile.visual?.id,
              previewVisualId: whiteboard.profile.preview?.id,
            },
            result.nameID
          );
        }
      }

      if (input.framing.type === CalloutFramingType.MediaGallery) {
        const mediaGalleryId = result.framing.mediaGallery?.id;
        if (mediaGalleryId && values.mediaGalleryVisuals.length > 0) {
          await uploadMediaGalleryVisuals({
            mediaGalleryId,
            visuals: values.mediaGalleryVisuals,
            reuploadVisuals: true,
          });
        }
      }
    } catch (err) {
      logError(new Error('Callout post-create visual upload failed', { cause: err as Error }));
      notify(t('callout.uploadAfterCreateFailed'), 'error');
    } finally {
      reset();
      onOpenChange(false);
    }
  };

  // --- Edit path ---------------------------------------------------------
  const pollId = editData?.lookup.callout?.framing.poll?.id ?? values.editMeta?.pollId;
  const pollMgmt = usePollOptionManagement({ pollId: pollId ?? '' });

  const runPollOptionDiff = async () => {
    if (!pollId) return;
    const diff = diffPollOptions(originalPollOptions, values.pollOptions);
    if (!diff.toAdd.length && !diff.toRemove.length && !diff.toUpdate.length && !diff.orderedIds.length) {
      return;
    }

    // 1. Adds (before removes — never drop below the server's min).
    const addedIdsByIndex = new Map<number, string>();
    const knownIds = new Set(originalPollOptions.map(o => o.id));
    for (const add of diff.toAdd) {
      const res = await pollMgmt.addOption(add.text);
      const addedPoll = res.data?.addPollOption;
      if (addedPoll) {
        const newOpt = addedPoll.options.find(o => !knownIds.has(o.id));
        if (newOpt) {
          addedIdsByIndex.set(add.index, newOpt.id);
          knownIds.add(newOpt.id);
        }
      }
    }
    // 2. Removes.
    for (const id of diff.toRemove) await pollMgmt.removeOption(id);
    // 3. Updates.
    for (const upd of diff.toUpdate) await pollMgmt.updateOption(upd.id, upd.text);
    // 4. Reorder — substitute sentinels with their resolved server ids.
    if (diff.orderedIds.length > 1) {
      const resolved = diff.orderedIds
        .map(id => {
          if (!isAddedSentinel(id)) return id;
          const idx = parseAddedSentinel(id);
          return idx !== undefined ? addedIdsByIndex.get(idx) : undefined;
        })
        .filter((v): v is string => Boolean(v));
      if (resolved.length > 1) await pollMgmt.reorderOptions(resolved);
    }
  };

  const saveEdit = async () => {
    if (!calloutId) return;
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) return;

    const { input, whiteboardPreviewImages } = mapFormToCalloutUpdateInput(values, { calloutId });

    let result: Awaited<ReturnType<typeof updateCalloutContent>>;
    try {
      result = await updateCalloutContent({
        variables: { calloutData: input },
        refetchQueries: ['CalloutsSetTags'],
      });
    } catch (err) {
      logError(new Error('Callout update mutation failed', { cause: err as Error }));
      return;
    }
    const updated = result.data?.updateCallout;
    if (!updated) return;

    // Media gallery diff — mirrors MUI EditCalloutDialog lines 305-316.
    const mediaGalleryId = updated.framing.mediaGallery?.id;
    if (mediaGalleryId && values.mediaGalleryVisuals.length > 0) {
      try {
        await uploadMediaGalleryVisuals({
          mediaGalleryId,
          visuals: values.mediaGalleryVisuals,
          existingVisualIds: originalVisualIds,
          originalSortOrders,
        });
      } catch (err) {
        logError(new Error('Callout media-gallery upload failed', { cause: err as Error }));
        notify(t('callout.uploadAfterCreateFailed'), 'error');
      }
    }

    // Whiteboard preview upload if the content was edited inline.
    if (whiteboardPreviewImages && updated.framing.whiteboard?.profile) {
      await uploadWhiteboardVisuals(whiteboardPreviewImages, {
        previewVisualId: updated.framing.whiteboard.profile.preview?.id,
      });
    }

    // Poll option diff — leave the dialog open on failure so the user can
    // retry; everything else has already been persisted.
    try {
      await runPollOptionDiff();
    } catch (err) {
      logError(new Error('Poll option save failed', { cause: err as Error }));
      notify(t('callout.pollOptionsSaveFailed'), 'error');
      return;
    }

    reset();
    onOpenChange(false);
  };

  const handlePublish = () => createAndUpload(CalloutVisibility.Published);
  const handleSaveDraft = () => createAndUpload(CalloutVisibility.Draft);
  const handleSaveEdit = () => saveEdit();

  const requestClose = (nextOpen: boolean) => {
    if (nextOpen) {
      onOpenChange(true);
      return;
    }
    if (dirty && !submitting) {
      setDiscardOpen(true);
      return;
    }
    reset();
    onOpenChange(false);
  };

  const handleDiscardConfirm = () => {
    setDiscardOpen(false);
    reset();
    onOpenChange(false);
  };

  // Find Template — default behaviour opens the built-in connector; a parent
  // can still override via the `onFindTemplate` prop.
  const handleFindTemplate = onFindTemplate ?? (() => setImportTemplateOpen(true));

  const canSubmit = values.title.trim().length > 0;
  const notifySwitch =
    mode === 'create' && canSubmit ? (
      <div className="flex items-center gap-2">
        <Switch
          id="add-post-notify-members"
          checked={values.notifyMembers}
          onCheckedChange={v => setField('notifyMembers', v)}
          disabled={submitting}
        />
        <Label htmlFor="add-post-notify-members" className="text-body text-muted-foreground">
          {t('forms.notifyMembers')}
        </Label>
      </div>
    ) : null;

  const responseTypeSupportsDefaults =
    values.responseType === 'post' || values.responseType === 'memo' || values.responseType === 'whiteboard';

  return (
    <>
      <AddPostModal
        open={open}
        onOpenChange={requestClose}
        mode={mode}
        dirty={dirty}
        submitting={submitting || loadingCallout}
        canSubmit={canSubmit}
        title={{
          value: values.title,
          onChange: v => setField('title', v),
          error: errors.title,
        }}
        descriptionSlot={
          <MarkdownEditor
            value={values.description}
            onChange={v => setField('description', v)}
            placeholder={t('forms.descriptionPlaceholder')}
          />
        }
        framingZoneSlot={
          <div className="space-y-4">
            <FramingChipStrip
              value={values.framingChip}
              onChange={chip => setField('framingChip', chip)}
              locked={mode === 'edit'}
            />
            <FramingEditorConnector
              mode={mode}
              editMemoId={values.editMeta?.memoId}
              editWhiteboard={mode === 'edit' ? editCallout?.framing.whiteboard : undefined}
              editWhiteboardShareUrl={mode === 'edit' ? editCallout?.framing.profile.url : undefined}
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
              mediaGalleryVisuals={values.mediaGalleryVisuals}
              onMediaGalleryVisualsChange={v => setField('mediaGalleryVisuals', v)}
            />
          </div>
        }
        responsesZoneSlot={
          <div className="space-y-4">
            <ResponseTypeChipStrip
              value={values.responseType}
              onChange={type => setField('responseType', type)}
              locked={mode === 'edit'}
            />
            <ResponsePanel
              type={values.responseType}
              allowedActors={values.allowedActors}
              onAllowedActorsChange={v => setField('allowedActors', v)}
              contributionCommentsEnabled={values.contributionCommentsEnabled}
              onContributionCommentsEnabledChange={v => setField('contributionCommentsEnabled', v)}
              prePopulateLinkRows={mode === 'create' ? values.prePopulateLinkRows : undefined}
              onPrePopulateLinkRowsChange={mode === 'create' ? v => setField('prePopulateLinkRows', v) : undefined}
              prePopulateLinkErrors={errors as Record<string, string | undefined>}
              onSetDefaults={responseTypeSupportsDefaults ? () => setDefaultsOpen(true) : undefined}
              disabled={submitting}
            />
          </div>
        }
        moreOptionsSlot={
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="add-post-tags" className="text-caption text-muted-foreground">
                {t('forms.tagsLabel')}
              </Label>
              <div className="relative">
                <Hash
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  id="add-post-tags"
                  type="text"
                  value={values.tags}
                  onChange={e => setField('tags', e.target.value)}
                  placeholder={t('forms.tagsPlaceholder')}
                  disabled={submitting}
                  className="w-full pl-8 h-9 px-3 border border-border rounded-md bg-background text-control focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                />
              </div>
            </div>
            <AllowCommentsField
              value={values.framingCommentsEnabled}
              onChange={v => setField('framingCommentsEnabled', v)}
              disabled={submitting}
            />
            <ReferencesEditor
              rows={values.referenceRows}
              onChange={v => setField('referenceRows', v)}
              errors={errors as Record<string, string | undefined>}
              disabled={submitting}
            />
          </div>
        }
        notifySwitchSlot={notifySwitch}
        onSubmit={mode === 'create' ? handlePublish : handleSaveEdit}
        onSaveDraft={mode === 'create' ? handleSaveDraft : undefined}
        onFindTemplate={mode === 'create' ? handleFindTemplate : undefined}
      />
      <DiscardChangesDialog open={discardOpen} onOpenChange={setDiscardOpen} onConfirm={handleDiscardConfirm} />
      <ResponseDefaultsConnector
        open={defaultsOpen}
        onOpenChange={setDefaultsOpen}
        type={values.responseType}
        spaceId={spaceId}
        values={values.contributionDefaults}
        onSave={next => setField('contributionDefaults', next)}
      />
      {mode === 'create' && (
        <TemplateImportConnector
          open={importTemplateOpen}
          onOpenChange={setImportTemplateOpen}
          isFormDirty={dirty}
          onTemplateSelected={values => prefill(values)}
        />
      )}
    </>
  );
}
