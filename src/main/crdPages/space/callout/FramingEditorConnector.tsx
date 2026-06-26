import { Settings, StickyNote } from 'lucide-react';
import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';
import { InlineWhiteboardPreview } from '@/crd/components/callout/InlineWhiteboardPreview';
import { Loading } from '@/crd/components/common/Loading';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { WhiteboardConfigCard } from '@/crd/components/whiteboard/WhiteboardConfigCard';
import {
  CollaboraDocumentTypePicker,
  type CollaboraDocumentTypeValue,
} from '@/crd/forms/callout/CollaboraDocumentTypePicker';
import {
  ContributorCollectionConfigField,
  type ContributorCollectionConfigValue,
} from '@/crd/forms/callout/ContributorCollectionConfigField';
import type { DocumentImportError } from '@/crd/forms/callout/DocumentImportZone';
import { LinkFramingFields } from '@/crd/forms/callout/LinkFramingFields';
import { MemoFramingEditor } from '@/crd/forms/callout/MemoFramingEditor';
import type { PollOptionValue } from '@/crd/forms/callout/PollOptionsEditor';
import { PollOptionsEditor } from '@/crd/forms/callout/PollOptionsEditor';
import { PollSettingsDialog } from '@/crd/forms/callout/PollSettingsDialog';
import type { MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';
import type { MediaGalleryFieldVisual } from '@/crd/forms/mediaGallery/MediaGalleryField';
import { Button } from '@/crd/primitives/button';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import buildGuestShareUrl from '@/domain/collaboration/whiteboard/utils/buildGuestShareUrl';
import {
  DefaultWhiteboardPreviewSettings,
  type WhiteboardPreviewSettings,
} from '@/domain/collaboration/whiteboard/WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';
import type { WhiteboardPreviewImage } from '@/domain/collaboration/whiteboard/WhiteboardVisuals/WhiteboardPreviewImagesModels';
import { EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';
import { CrdMemoDialog } from '@/main/crdPages/memo/CrdMemoDialog';
import CrdSingleUserWhiteboardDialog, {
  type WhiteboardWithContent,
} from '@/main/crdPages/whiteboard/CrdSingleUserWhiteboardDialog';
import CrdWhiteboardView from '@/main/crdPages/whiteboard/CrdWhiteboardView';
import { MediaGalleryFormFieldConnector } from './MediaGalleryFormFieldConnector';
import { useWhiteboardPreviewBlobUrl } from './useWhiteboardPreviewBlobUrl';

type EditWhiteboard = NonNullable<CalloutDetailsModelExtended['framing']['whiteboard']>;

const WHITEBOARD_FRAMING_TEMPLATE_ID = '__callout_framing_whiteboard';

type FramingEditorConnectorProps = {
  /**
   * Create vs edit. In edit mode, the memo and whiteboard editors are
   * replaced by "Open" buttons that launch the collaborative dialogs
   * (spec plan D13 / T048 / T048a). Content is then persisted by those
   * dialogs directly, not by the main callout form.
   */
  mode?: 'create' | 'edit';
  /** Server id of the existing memo, used by `CrdMemoDialog` on edit. */
  editMemoId?: string;
  /** Server-loaded whiteboard, used by `CrdWhiteboardView` on edit (T048). */
  editWhiteboard?: EditWhiteboard;
  /** Share URL for the callout's whiteboard panel — passed through to `CrdWhiteboardView`. */
  editWhiteboardShareUrl?: string;
  framingType: string;
  // Link fields
  linkUrl: string;
  onLinkUrlChange: (value: string) => void;
  linkUrlError?: string;
  linkDisplayName: string;
  onLinkDisplayNameChange: (value: string) => void;
  linkDisplayNameError?: string;
  // Poll fields
  pollQuestion: string;
  onPollQuestionChange: (value: string) => void;
  pollQuestionError?: string;
  pollOptions: PollOptionValue[];
  onPollOptionsChange: (options: PollOptionValue[]) => void;
  pollOptionsError?: string;
  // Poll settings
  pollAllowMultiple?: boolean;
  onPollAllowMultipleChange?: (value: boolean) => void;
  pollAllowCustomOptions?: boolean;
  onPollAllowCustomOptionsChange?: (value: boolean) => void;
  pollHideResultsUntilVoted?: boolean;
  onPollHideResultsUntilVotedChange?: (value: boolean) => void;
  pollShowVoterAvatars?: boolean;
  onPollShowVoterAvatarsChange?: (value: boolean) => void;
  // Poll status (editing existing polls)
  pollStatus?: 'open' | 'closed';
  onPollStatusChange?: (status: 'open' | 'closed') => void;
  // Whiteboard framing
  whiteboardContent?: string;
  whiteboardPreviewSettings?: WhiteboardPreviewSettings;
  whiteboardConfigured?: boolean;
  whiteboardTitle?: string;
  /**
   * Preview blobs returned from the last save of the inline whiteboard editor —
   * used to render the current canvas as a thumbnail in the inline preview
   * (MUI parity with `FormikWhiteboardPreview`). Empty array when the user
   * hasn't opened the editor yet, in which case the preview falls back to
   * `whiteboardPreviewServerUrl` (when set — Callout-template edit / callout-from-template
   * prefill) and finally to a placeholder icon.
   */
  whiteboardPreviewImages?: WhiteboardPreviewImage[];
  /**
   * Server-rendered whiteboard preview image URL — the `WHITEBOARD_PREVIEW` Visual the
   * backend stamps when content changes. Read-time fallback for the inline preview when
   * no fresh in-form blob exists yet (D16, 2026-05-18). Fresh blobs (from a just-saved
   * inline edit) take precedence — they reflect the current canvas; this URL only fills
   * the "loaded but not re-edited" gap.
   */
  whiteboardPreviewServerUrl?: string;
  onWhiteboardChange?: (
    content: string,
    previewImages: WhiteboardPreviewImage[] | undefined,
    previewSettings: WhiteboardPreviewSettings
  ) => void;
  // Memo framing (create mode) — value is the raw markdown; `onMemoMarkdownChange`
  // is wired into the form hook's `memoMarkdown` field (spec T010/T011).
  memoMarkdown?: string;
  onMemoMarkdownChange?: (value: string) => void;
  /**
   * Image-upload wiring for the create-mode memo framing editor. The memo
   * doesn't exist yet → the consumer passes a `temporaryLocation: true`
   * integration (server GCs the file if the callout create is abandoned).
   */
  memoUpload?: MarkdownUploadProps;
  // Media-gallery framing — required because a missing handler silently drops
  // user-selected files when `framingType === 'image'`.
  mediaGalleryVisuals: MediaGalleryFieldVisual[];
  onMediaGalleryVisualsChange: (next: MediaGalleryFieldVisual[]) => void;
  // Collabora document framing — drives the document-type picker shown when
  // `framingType === 'document'`. The picked type is sent inline with the
  // create-callout mutation and cannot change after the document is created.
  collaboraDocumentType: CollaboraDocumentType;
  onCollaboraDocumentTypeChange: (next: CollaboraDocumentType) => void;
  /**
   * Upload-zone wiring for the create-mode "or upload" path (FR-002 / FR-003).
   * Omitted in edit mode — once a Collabora document exists, replacing its bytes
   * is out of P1 scope.
   */
  collaboraUpload?: {
    acceptAttr: string;
    file: File | null;
    onFileChange: (file: File | null) => void;
    error: DocumentImportError | null;
    onError: (error: DocumentImportError | null) => void;
    errorMessage: string | null;
    busy?: boolean;
    labelHint: string;
    labelMaxSize: string;
    labelRemoveFile: string;
    labelOr: string;
  };
  // Contributor-collection config (feature 008) — present for the 'contributors'
  // framing only; editable in both create and edit (FR-004d).
  contributorCollection?: ContributorCollectionConfigValue;
  onContributorCollectionChange?: (value: ContributorCollectionConfigValue) => void;
  contributorCollectionError?: string;
};

export function FramingEditorConnector({
  mode = 'create',
  editMemoId,
  editWhiteboard,
  editWhiteboardShareUrl,
  framingType,
  linkUrl,
  onLinkUrlChange,
  linkUrlError,
  linkDisplayName,
  onLinkDisplayNameChange,
  linkDisplayNameError,
  pollQuestion,
  onPollQuestionChange,
  pollQuestionError,
  pollOptions,
  onPollOptionsChange,
  pollOptionsError,
  pollAllowMultiple = false,
  onPollAllowMultipleChange,
  pollAllowCustomOptions = false,
  onPollAllowCustomOptionsChange,
  pollHideResultsUntilVoted = false,
  onPollHideResultsUntilVotedChange,
  pollShowVoterAvatars = true,
  onPollShowVoterAvatarsChange,
  pollStatus,
  onPollStatusChange,
  whiteboardContent,
  whiteboardPreviewSettings,
  whiteboardTitle,
  whiteboardPreviewImages,
  whiteboardPreviewServerUrl,
  onWhiteboardChange,
  memoMarkdown = '',
  onMemoMarkdownChange,
  memoUpload,
  mediaGalleryVisuals,
  onMediaGalleryVisualsChange,
  collaboraDocumentType,
  onCollaboraDocumentTypeChange,
  collaboraUpload,
  contributorCollection,
  onContributorCollectionChange,
  contributorCollectionError,
}: FramingEditorConnectorProps) {
  const { t } = useTranslation('crd-space');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'open' | 'closed' | null>(null);
  const [whiteboardEditorOpen, setWhiteboardEditorOpen] = useState(false);
  const [memoDialogOpen, setMemoDialogOpen] = useState(false);
  const whiteboardPreviewUrl = useWhiteboardPreviewBlobUrl(whiteboardPreviewImages);

  switch (framingType) {
    case 'whiteboard': {
      // Edit mode (T048): the form does NOT track whiteboard content. The
      // "Open" button launches the collaborative `CrdWhiteboardView` against
      // the actual server whiteboard; that dialog persists changes via its
      // own mutations. The callout-update mutation never includes
      // `whiteboardContent` (see `mapFormToCalloutUpdateInput`).
      if (mode === 'edit') {
        // Render a placeholder until the whiteboard payload arrives. Falling
        // through to the create-mode single-user editor here would give the
        // user a UI that silently discards edits — the update mapper omits
        // whiteboardContent on purpose.
        if (!editWhiteboard) {
          return <Loading />;
        }
        const guestShareUrl = buildGuestShareUrl(editWhiteboard.id);
        return (
          <>
            <WhiteboardConfigCard
              title={t('callout.whiteboard')}
              status={t('framing.openWhiteboardHint')}
              actionLabel={t('framing.openWhiteboard')}
              onAction={() => setWhiteboardEditorOpen(true)}
            />
            {whiteboardEditorOpen && (
              <CrdWhiteboardView
                whiteboardId={editWhiteboard.id}
                whiteboard={editWhiteboard}
                authorization={editWhiteboard.authorization}
                whiteboardShareUrl={editWhiteboardShareUrl ?? ''}
                guestShareUrl={guestShareUrl}
                readOnlyDisplayName={true}
                displayName={whiteboardTitle || editWhiteboard.profile.displayName}
                preventWhiteboardDeletion={true}
                loadingWhiteboards={false}
                backToWhiteboards={() => setWhiteboardEditorOpen(false)}
              />
            )}
          </>
        );
      }

      // Create mode: single-user editor — the callout doesn't exist yet, so
      // there's nothing to collaborate on. Content lands in the form and is
      // sent inline with the callout-create mutation.
      const templateWhiteboard: WhiteboardWithContent = {
        id: WHITEBOARD_FRAMING_TEMPLATE_ID,
        nameID: WHITEBOARD_FRAMING_TEMPLATE_ID,
        profile: {
          id: `${WHITEBOARD_FRAMING_TEMPLATE_ID}_profile`,
          displayName: whiteboardTitle || t('callout.whiteboard'),
          storageBucket: { id: '', allowedMimeTypes: [], maxFileSize: 0 },
        },
        content: whiteboardContent ?? EmptyWhiteboardString,
        previewSettings: whiteboardPreviewSettings ?? DefaultWhiteboardPreviewSettings,
      };

      return (
        <>
          <InlineWhiteboardPreview
            onEdit={() => setWhiteboardEditorOpen(true)}
            editLabel={t('framing.edit')}
            previewImageUrl={whiteboardPreviewUrl ?? whiteboardPreviewServerUrl}
            imageAlt={whiteboardTitle || t('callout.whiteboard')}
          />
          <Suspense fallback={<Loading />}>
            <CrdSingleUserWhiteboardDialog
              entities={{ whiteboard: templateWhiteboard }}
              actions={{
                onCancel: () => setWhiteboardEditorOpen(false),
                onUpdate: async (wb, previewImages) => {
                  onWhiteboardChange?.(wb.content, previewImages, wb.previewSettings);
                  setWhiteboardEditorOpen(false);
                },
              }}
              options={{
                show: whiteboardEditorOpen,
                canEdit: true,
                canDelete: false,
                allowFilesAttached: true,
                dialogTitle: whiteboardTitle || t('callout.whiteboard'),
              }}
            />
          </Suspense>
        </>
      );
    }

    case 'memo':
      if (mode === 'edit') {
        // Same reasoning as the whiteboard branch above: in edit mode without
        // a memo id we can't open `CrdMemoDialog`, and falling through to the
        // create-mode `MemoFramingEditor` would be a write-loss trap because
        // the update mapper omits memoContent.
        if (!editMemoId) {
          return <Loading />;
        }
        return (
          <>
            <div className="p-4 border rounded-xl bg-muted/30 flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-lg"
                  style={{
                    background: 'color-mix(in srgb, var(--chart-2) 15%, transparent)',
                    color: 'var(--chart-2)',
                  }}
                >
                  <StickyNote className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-body-emphasis">{t('framing.memo')}</p>
                  <p className="text-caption text-muted-foreground">{t('framing.memoOpenHint')}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="h-8" onClick={() => setMemoDialogOpen(true)}>
                {t('framing.openMemo')}
              </Button>
            </div>
            <CrdMemoDialog open={memoDialogOpen} memoId={editMemoId} onClose={() => setMemoDialogOpen(false)} />
          </>
        );
      }
      return (
        <MemoFramingEditor
          value={memoMarkdown}
          onChange={value => onMemoMarkdownChange?.(value)}
          onImageUpload={memoUpload?.onImageUpload}
          iframeAllowedUrls={memoUpload?.iframeAllowedUrls}
          onError={memoUpload?.onError}
        />
      );

    case 'document':
      // Collabora document framing — type is fixed at creation time (Collabora
      // has no server-side conversion path between text/spreadsheet/presentation),
      // so in edit mode the picker is shown read-only as a reminder of which
      // type was provisioned. The actual document body is edited from the post
      // card / detail dialog via `CollaboraFramingEditorOverlay`.
      return (
        <CollaboraDocumentTypePicker
          value={collaboraDocumentType as CollaboraDocumentTypeValue}
          onChange={next => onCollaboraDocumentTypeChange(next as CollaboraDocumentType)}
          readOnly={mode === 'edit'}
          upload={collaboraUpload}
        />
      );

    case 'image':
      return (
        <MediaGalleryFormFieldConnector visuals={mediaGalleryVisuals} onVisualsChange={onMediaGalleryVisualsChange} />
      );

    case 'cta':
      return (
        <LinkFramingFields
          url={linkUrl}
          onUrlChange={onLinkUrlChange}
          urlError={linkUrlError}
          displayName={linkDisplayName}
          onDisplayNameChange={onLinkDisplayNameChange}
          displayNameError={linkDisplayNameError}
        />
      );

    case 'poll':
      return (
        <>
          <PollOptionsEditor
            question={pollQuestion}
            onQuestionChange={onPollQuestionChange}
            questionError={pollQuestionError}
            options={pollOptions}
            onOptionsChange={onPollOptionsChange}
            optionsError={pollOptionsError}
            pollStatus={pollStatus}
            onStatusChange={status => {
              setPendingStatus(status);
              setStatusConfirmOpen(true);
            }}
            isClosed={pollStatus === 'closed'}
            settingsSlot={
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setSettingsOpen(true)}
                aria-label={t('pollForm.settings')}
              >
                <Settings className="w-4 h-4" aria-hidden="true" />
              </Button>
            }
          />
          <PollSettingsDialog
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
            allowMultiple={pollAllowMultiple}
            onAllowMultipleChange={v => onPollAllowMultipleChange?.(v)}
            allowCustomOptions={pollAllowCustomOptions}
            onAllowCustomOptionsChange={v => onPollAllowCustomOptionsChange?.(v)}
            hideResultsUntilVoted={pollHideResultsUntilVoted}
            onHideResultsUntilVotedChange={v => onPollHideResultsUntilVotedChange?.(v)}
            showVoterAvatars={pollShowVoterAvatars}
            onShowVoterAvatarsChange={v => onPollShowVoterAvatarsChange?.(v)}
            // MUI parity (CalloutForm): poll settings are immutable once the poll is
            // created — the server's `UpdatePollInput` only allows updating `title`.
            // Show them as disabled in edit mode and when the poll is closed.
            readOnly={mode === 'edit' || pollStatus === 'closed'}
          />
          {pendingStatus && (
            <ConfirmationDialog
              open={statusConfirmOpen}
              onOpenChange={setStatusConfirmOpen}
              title={
                pendingStatus === 'closed'
                  ? t('pollForm.closePollConfirm.title')
                  : t('pollForm.reopenPollConfirm.title')
              }
              description={
                pendingStatus === 'closed'
                  ? t('pollForm.closePollConfirm.description')
                  : t('pollForm.reopenPollConfirm.description')
              }
              confirmLabel={
                pendingStatus === 'closed'
                  ? t('pollForm.closePollConfirm.confirm')
                  : t('pollForm.reopenPollConfirm.confirm')
              }
              onConfirm={() => {
                onPollStatusChange?.(pendingStatus);
                setStatusConfirmOpen(false);
                setPendingStatus(null);
              }}
              onCancel={() => {
                setStatusConfirmOpen(false);
                setPendingStatus(null);
              }}
            />
          )}
        </>
      );

    case 'contributors':
      // Contributor-collection config (feature 008). Editable in both create and
      // edit (FR-004d). The callout renders no framing body — only its config.
      if (!contributorCollection || !onContributorCollectionChange) return null;
      return (
        <ContributorCollectionConfigField
          value={contributorCollection}
          onChange={onContributorCollectionChange}
          error={contributorCollectionError}
        />
      );

    default:
      return null;
  }
}
