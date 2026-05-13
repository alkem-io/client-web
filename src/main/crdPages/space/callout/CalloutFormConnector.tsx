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
import { ApolloError } from '@apollo/client';
import { Hash } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCalloutContentQuery,
  useCreateReferenceOnProfileMutation,
  useUpdateCalloutContentMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { CalloutFramingType, CalloutVisibility, LicenseEntitlementType } from '@/core/apollo/generated/graphql-schema';
import { error as logError } from '@/core/logging/sentry/log';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { DiscardChangesDialog } from '@/crd/components/dialogs/DiscardChangesDialog';
import { AddPostModal } from '@/crd/forms/callout/AddPostModal';
import { AllowCommentsField } from '@/crd/forms/callout/AllowCommentsField';
import type { DocumentImportError } from '@/crd/forms/callout/DocumentImportZone';
import { type DisabledChipMap, FramingChipStrip } from '@/crd/forms/callout/FramingChipStrip';
import { ReferencesEditor } from '@/crd/forms/callout/ReferencesEditor';
import { ResponsePanel } from '@/crd/forms/callout/ResponsePanel';
import { ResponseTypeChipStrip } from '@/crd/forms/callout/ResponseTypeChipStrip';
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
import { TagsInput } from '@/crd/forms/tags-input';
import { ensureHttps } from '@/crd/lib/ensureHttps';
import { Label } from '@/crd/primitives/label';
import { Switch } from '@/crd/primitives/switch';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import {
  COLLABORA_IMPORT_ACCEPT_ATTR,
  COLLABORA_IMPORT_EXTENSIONS_P1,
  COLLABORA_IMPORT_MAX_BYTES,
} from '@/domain/collaboration/calloutContributions/collaboraDocument/collaboraImportFormats';
import { filenameWithoutExtension } from '@/domain/collaboration/calloutContributions/collaboraDocument/filenameWithoutExtension';
import { validateCollaboraImportFile } from '@/domain/collaboration/calloutContributions/collaboraDocument/validateCollaboraImportFile';
import { buildFlowStateClassificationTagsets } from '@/domain/collaboration/calloutsSet/Classification/ClassificationTagset.utils';
import { useCalloutCreation } from '@/domain/collaboration/calloutsSet/useCalloutCreation/useCalloutCreation';
import useUploadMediaGalleryVisuals from '@/domain/collaboration/mediaGallery/useUploadMediaGalleryVisuals';
import { usePollOptionManagement } from '@/domain/collaboration/poll/hooks/usePollOptionManagement';
import useUploadWhiteboardVisuals from '@/domain/collaboration/whiteboard/WhiteboardVisuals/useUploadWhiteboardVisuals';
import { useSpace } from '@/domain/space/context/useSpace';
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
  // Pending "switch to None" confirmation — edit-mode only. Changing the
  // framing type or response type to None permanently removes the existing
  // memo/document/whiteboard/post-collection on save, and the lock then
  // prevents adopting a different type. The user is warned before the chip
  // visibly toggles (not at save time), so they can cancel without losing
  // their existing context.
  const [pendingClearKind, setPendingClearKind] = useState<'framing' | 'response' | null>(null);
  // Import-zone validation error (client pre-check OR server FORMAT_NOT_SUPPORTED /
  // STORAGE_UPLOAD_FAILED). Cleared on successful re-stage and on framing-type
  // change (handled inside the FramingChipStrip onChange wrapper below).
  const [collaboraImportError, setCollaboraImportError] = useState<DocumentImportError | null>(null);

  useBeforeUnloadGuard(open && dirty);

  // Collabora "Document" framing is gated by the SPACE_FLAG_OFFICE_DOCUMENTS
  // entitlement on the parent space (level-zero). SpaceContextProvider runs the
  // entitlements query at that level and exposes both the result and a loading
  // flag. While loading, leave the chip enabled so the user doesn't see a
  // disabled flash on first paint; once the query resolves, the entitlement
  // is the final authority.
  const { entitlements, loading: spaceContextLoading } = useSpace();
  const officeDocumentsEnabled =
    spaceContextLoading || entitlements.includes(LicenseEntitlementType.SpaceFlagOfficeDocuments);
  const disabledChips: DisabledChipMap | undefined = officeDocumentsEnabled
    ? undefined
    : { document: { tooltip: t('framing.officeDocumentsNotEnabled') } };

  const { handleCreateCallout, loading: creating } = useCalloutCreation({ calloutsSetId });
  const [updateCalloutContent, { loading: updating }] = useUpdateCalloutContentMutation();
  const [createReferenceOnProfile] = useCreateReferenceOnProfileMutation();
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
  // The same effect resets the guard whenever the dialog closes or leaves edit
  // mode, so reopening picks up fresh data.
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

  // --- Collabora import staging -----------------------------------------
  const setCollaboraImportFile = (file: File | null) => {
    if (!file) {
      setField('collaboraUploadFile', null);
      setField('collaboraAutoPrefilledTitle', undefined);
      return;
    }
    const validation = validateCollaboraImportFile([file]);
    if (!validation.ok) {
      setCollaboraImportError(validation.error);
      // Don't stage the file when validation fails — pre-check before any network call.
      setField('collaboraUploadFile', null);
      setField('collaboraAutoPrefilledTitle', undefined);
      return;
    }
    setCollaboraImportError(null);
    setField('collaboraUploadFile', file);
    // Auto-prefill the post title from the filename when the title is empty.
    // Captures the prefilled value so the submit-time mapper can decide whether
    // to send the displayName explicitly or rely on the server's filename
    // derivation (FR-004a + FR-004b).
    if (!values.title.trim()) {
      const prefilled = filenameWithoutExtension(file.name);
      setField('title', prefilled);
      setField('collaboraAutoPrefilledTitle', prefilled);
    } else {
      setField('collaboraAutoPrefilledTitle', undefined);
    }
  };

  const formatList = COLLABORA_IMPORT_EXTENSIONS_P1.join(', ');
  const capMb = Math.round(COLLABORA_IMPORT_MAX_BYTES / (1024 * 1024));
  const collaboraImportErrorMessage: string | null = collaboraImportError
    ? (() => {
        switch (collaboraImportError.kind) {
          case 'extension':
            return t('callout.documentImportErrorUnsupported', { formats: formatList });
          case 'size':
            return t('callout.documentImportErrorTooLarge', { cap: capMb });
          case 'multiple-files':
            return t('callout.documentImportErrorMultiple');
          case 'folder':
            return t('callout.documentImportErrorFolder');
          default:
            return null;
        }
      })()
    : null;

  // Map server errors raised by the create-callout mutation to the appropriate
  // surface. FORMAT_NOT_SUPPORTED + STORAGE_UPLOAD_FAILED render inline near the
  // upload zone (same i18n keys as the client pre-check). STORAGE_SERVICE_UNAVAILABLE
  // is a transport-level concern → dialog-level toast (FR-011, no auto-retry).
  // Anything else falls through to the existing dialog-level error toast.
  // Decisions are driven by the structured `extensions.code` on each
  // `graphQLError` — never by the error's combined message.
  const handleSubmitError = (err: unknown) => {
    const handledCodes = ['FORMAT_NOT_SUPPORTED', 'STORAGE_UPLOAD_FAILED', 'STORAGE_SERVICE_UNAVAILABLE'] as const;
    const code =
      err instanceof ApolloError
        ? err.graphQLErrors.find(gqlErr =>
            handledCodes.includes(gqlErr.extensions?.code as (typeof handledCodes)[number])
          )?.extensions?.code
        : undefined;

    if (code === 'FORMAT_NOT_SUPPORTED') {
      setCollaboraImportError({ kind: 'extension', received: '' });
      return;
    }
    if (code === 'STORAGE_UPLOAD_FAILED') {
      setCollaboraImportError({
        kind: 'size',
        bytes: values.collaboraUploadFile?.size ?? 0,
        maxBytes: COLLABORA_IMPORT_MAX_BYTES,
      });
      return;
    }
    if (code === 'STORAGE_SERVICE_UNAVAILABLE') {
      notify(t('callout.documentImportErrorServiceUnavailable'), 'error');
      return;
    }
    // Generic fall-through — log + let the existing dialog-level toast surface
    // whatever the connector previously showed for unknown errors.
    logError(new Error('Callout creation mutation failed', { cause: err as Error }));
  };

  // --- Create path -------------------------------------------------------
  const submitting = creating || updating || mediaGalleryUploading;

  const createAndUpload = async (visibility: CalloutVisibility) => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) return;

    const { input, whiteboardPreviewImages, collaboraUploadFile } = mapFormToCalloutCreationInput(values, {
      visibility,
      whiteboardFallbackDisplayName: t('callout.whiteboard'),
      collaboraFallbackDisplayName: t('callout.defaultDocumentName'),
    });

    // Flow-state classification: tag the new callout with the active phase so it
    // appears under the right tab. No-op when called from a non-flow-state page.
    const flowStateTagsets = buildFlowStateClassificationTagsets(activeFlowStateName);
    if (flowStateTagsets) {
      input.classification = { tagsets: flowStateTagsets };
    }

    let result: Awaited<ReturnType<typeof handleCreateCallout>>;
    try {
      // Collabora-document framing's upload path attaches the file as the second
      // arg; blank-create path passes nothing extra. The `apollo-upload-client`
      // link auto-promotes the request to multipart when a `file` variable is
      // present (`apollo-require-preflight: true` is set globally on the link).
      result = await handleCreateCallout(input, collaboraUploadFile);
    } catch (err) {
      handleSubmitError(err);
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

    // New references added in edit mode have no server id yet, so they can't
    // travel through `UpdateReferenceInput` (which requires `ID`). Persist them
    // via the dedicated `createReferenceOnProfile` mutation against the framing
    // profile before the bulk update; existing rows still flow through the
    // update payload below.
    const framingProfileId = editData?.lookup.callout?.framing.profile.id;
    const newReferenceRows = values.referenceRows.filter(
      row => !row.id && row.title.trim().length > 0 && row.url.trim().length > 0
    );
    if (framingProfileId && newReferenceRows.length > 0) {
      try {
        for (const row of newReferenceRows) {
          await createReferenceOnProfile({
            variables: {
              input: {
                profileID: framingProfileId,
                name: row.title.trim(),
                uri: ensureHttps(row.url),
                description: row.description.trim() || undefined,
              },
            },
          });
        }
      } catch (err) {
        logError(new Error('Callout reference creation failed', { cause: err as Error }));
        notify(t('callout.referencesSaveFailed'), 'error');
        return;
      }
    }

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
              onChange={chip => {
                // Edit-mode + transition to None: warn before the chip visibly
                // clears. Once saved the framing is gone and the lock prevents
                // adopting a different type, so this is the user's last chance
                // to back out.
                if (mode === 'edit' && chip === 'none' && values.framingChip !== 'none') {
                  setPendingClearKind('framing');
                  return;
                }
                // When switching framing AWAY from 'document', clear any staged
                // upload so the file does not persist invisibly under another
                // framing type (Edge Case in spec.md).
                if (chip !== 'document' && values.framingChip === 'document') {
                  setField('collaboraUploadFile', null);
                  setField('collaboraAutoPrefilledTitle', undefined);
                  setCollaboraImportError(null);
                }
                setField('framingChip', chip);
              }}
              locked={mode === 'edit'}
              disabledChips={disabledChips}
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
              whiteboardConfigured={values.whiteboardConfigured}
              whiteboardTitle={values.title.trim() || t('callout.whiteboard')}
              whiteboardPreviewImages={values.whiteboardPreviewImages}
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
              collaboraDocumentType={values.collaboraDocumentType}
              onCollaboraDocumentTypeChange={v => setField('collaboraDocumentType', v)}
              collaboraUpload={
                mode === 'create'
                  ? {
                      acceptAttr: COLLABORA_IMPORT_ACCEPT_ATTR,
                      file: values.collaboraUploadFile,
                      onFileChange: setCollaboraImportFile,
                      error: collaboraImportError,
                      onError: setCollaboraImportError,
                      errorMessage: collaboraImportErrorMessage,
                      busy: creating,
                      labelHint: t('callout.documentImportHint'),
                      labelMaxSize: t('callout.documentImportMaxSize', { cap: capMb }),
                      labelRemoveFile: t('callout.documentImportRemoveFile'),
                      labelOr: t('callout.documentImportOr'),
                    }
                  : undefined
              }
            />
          </div>
        }
        responsesZoneSlot={
          <div className="space-y-4">
            <ResponseTypeChipStrip
              value={values.responseType}
              onChange={type => {
                // Same warning rule as the framing strip — see comment there.
                if (mode === 'edit' && type === 'none' && values.responseType !== 'none') {
                  setPendingClearKind('response');
                  return;
                }
                setField('responseType', type);
              }}
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
              <Label className="text-caption text-muted-foreground">{t('forms.tagsLabel')}</Label>
              <TagsInput
                value={values.tags}
                onChange={tags => setField('tags', tags)}
                placeholder={t('forms.tagsPlaceholder')}
                icon={<Hash className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />}
              />
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
      <ConfirmationDialog
        open={pendingClearKind !== null}
        onOpenChange={open => {
          if (!open) setPendingClearKind(null);
        }}
        title={t('callout.clearTypeConfirm.title')}
        description={t('callout.clearTypeConfirm.description')}
        confirmLabel={t('callout.clearTypeConfirm.confirm')}
        cancelLabel={t('dialogs.cancel')}
        variant="destructive"
        onConfirm={() => {
          if (pendingClearKind === 'framing') {
            // Clearing the framing — also drop any staged Collabora upload so
            // it doesn't reattach when the user picks a new type next session.
            if (values.framingChip === 'document') {
              setField('collaboraUploadFile', null);
              setField('collaboraAutoPrefilledTitle', undefined);
              setCollaboraImportError(null);
            }
            setField('framingChip', 'none');
          } else if (pendingClearKind === 'response') {
            setField('responseType', 'none');
          }
          setPendingClearKind(null);
        }}
      />
      <ResponseDefaultsConnector
        open={defaultsOpen}
        onOpenChange={setDefaultsOpen}
        type={values.responseType}
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
