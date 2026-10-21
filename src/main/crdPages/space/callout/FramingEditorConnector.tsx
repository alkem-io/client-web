import { Crop, FileText, Presentation, Settings, Sheet, StickyNote, Wand2 } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type CollaboraDocumentType, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { InlineWhiteboardPreview } from '@/crd/components/callout/InlineWhiteboardPreview';
import { CollaboraDocumentDisplayName } from '@/crd/components/collabora/CollaboraDocumentDisplayName';
import { Loading } from '@/crd/components/common/Loading';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import type { ContributorMapFixedView, ContributorMapPin } from '@/crd/components/map/ContributorMap';
import { WhiteboardConfigCard } from '@/crd/components/whiteboard/WhiteboardConfigCard';
import { ContributorSelector } from '@/crd/forms/ContributorSelector';
import { CalloutCardVariantField } from '@/crd/forms/callout/CalloutCardVariantField';
import { CalloutSelectionField } from '@/crd/forms/callout/CalloutSelectionField';
import {
  CollaboraDocumentTypePicker,
  type CollaboraDocumentTypeValue,
} from '@/crd/forms/callout/CollaboraDocumentTypePicker';
import {
  ContributorCollectionConfigField,
  type ContributorCollectionConfigValue,
} from '@/crd/forms/callout/ContributorCollectionConfigField';
import type { DocumentImportError } from '@/crd/forms/callout/DocumentImportZone';
import { FormQuestionsEditor } from '@/crd/forms/callout/FormQuestionsEditor';
import { FormSettingsDialog } from '@/crd/forms/callout/FormSettingsDialog';
import { LinkFramingFields } from '@/crd/forms/callout/LinkFramingFields';
import { MemoFramingEditor } from '@/crd/forms/callout/MemoFramingEditor';
import type { PollOptionValue } from '@/crd/forms/callout/PollOptionsEditor';
import { PollOptionsEditor } from '@/crd/forms/callout/PollOptionsEditor';
import { PollSettingsDialog } from '@/crd/forms/callout/PollSettingsDialog';
import { SpaceSelector } from '@/crd/forms/callout/SpaceSelector';
import type { FormQuestionValue, FormSettingsValue } from '@/crd/forms/callout/types';
import type { MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';
import type { MediaGalleryFieldVisual } from '@/crd/forms/mediaGallery/MediaGalleryField';
import { Button } from '@/crd/primitives/button';

// Lazy-load ContributorMap so the MapLibre GL chunk stays out of
// the dialog bundle until the map-view control is first opened.
const LazyContributorMap = lazy(() => import('@/crd/components/map/ContributorMap'));

import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import type { UseRenameCollaboraDocumentResult } from '@/domain/collaboration/calloutContributions/collaboraDocument/useRenameCollaboraDocument';
import buildGuestShareUrl from '@/domain/collaboration/whiteboard/utils/buildGuestShareUrl';
import type { WhiteboardDraftLifecycle } from '@/domain/collaboration/whiteboard/WhiteboardDraft/useWhiteboardDraft';
import { useWhiteboardDraftPreviewUrl } from '@/domain/collaboration/whiteboard/WhiteboardDraft/useWhiteboardDraftPreviewUrl';
import { WhiteboardDraftEditor } from '@/domain/collaboration/whiteboard/WhiteboardDraft/WhiteboardDraftEditor';
import type { WhiteboardPreviewImage } from '@/domain/collaboration/whiteboard/WhiteboardVisuals/WhiteboardPreviewImagesModels';
import { CrdMemoDialog } from '@/main/crdPages/memo/CrdMemoDialog';
import CrdWhiteboardView from '@/main/crdPages/whiteboard/CrdWhiteboardView';
import { MediaGalleryFormFieldConnector } from './MediaGalleryFormFieldConnector';
import { useWhiteboardPreviewBlobUrl } from './useWhiteboardPreviewBlobUrl';

/**
 * What the editor knows about an existing Form's responses (edit mode only). Nothing is locked by them: they
 * decide whether widening the visibility asks for confirmation and whether a type change shows its hint.
 */
export type FormEditContext = {
  /** The visibility currently saved on the server. */
  savedVisibility: FormSettingsValue['visibility'];
  /** Whether this editor reads every response; when false the count says nothing about the Form. */
  canReadAll: boolean;
  responseCount: number;
  /** The (sub)space whose members "Space members" refers to. */
  spaceName: string;
};

type EditWhiteboard = NonNullable<CalloutDetailsModelExtended['framing']['whiteboard']>;

// Icon + label for the read-only existing-document box shown in edit mode.
const collaboraDocIconByType: Record<CollaboraDocumentTypeValue, typeof FileText> = {
  WORDPROCESSING: FileText,
  SPREADSHEET: Sheet,
  PRESENTATION: Presentation,
};
// The picker's row sub-line names the candidate's level (084 FR-028): the
// platform's three levels, one key each.
const spaceLevelLabelKeyByLevel = {
  [SpaceLevel.L0]: 'forms.selection.spacePicker.levelSpace',
  [SpaceLevel.L1]: 'forms.selection.spacePicker.levelSubspace',
  [SpaceLevel.L2]: 'forms.selection.spacePicker.levelSubsubspace',
} as const;

const collaboraDocLabelKeyByType: Record<
  CollaboraDocumentTypeValue,
  'callout.documentText' | 'callout.documentSpreadsheet' | 'callout.documentPresentation'
> = {
  WORDPROCESSING: 'callout.documentText',
  SPREADSHEET: 'callout.documentSpreadsheet',
  PRESENTATION: 'callout.documentPresentation',
};

/**
 * Existing-document box shown in the callout edit dialog (edit mode), with inline
 * rename. Reaching the edit dialog already requires callout-edit rights — which
 * carry the framing document's Update privilege — so rename is permitted here.
 *
 * The rename state is owned by the parent form (`CalloutFormConnector`) and passed
 * in as `rename`, so the form's Save button drives the commit (there is no separate
 * ✓/✕ here — `showActions={false}`); the pencil just opens the input.
 */
function CollaboraDocumentEditBox({
  displayName,
  documentType,
  rename,
}: {
  displayName: string;
  documentType: CollaboraDocumentTypeValue;
  rename: UseRenameCollaboraDocumentResult;
}) {
  const { t } = useTranslation('crd-space');
  const DocIcon = collaboraDocIconByType[documentType] ?? FileText;
  const typeLabel = t(collaboraDocLabelKeyByType[documentType] ?? 'callout.documentText');
  return (
    <div className="p-4 border rounded-xl bg-muted/30 flex items-center gap-3 animate-in fade-in">
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
        <DocIcon className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <CollaboraDocumentDisplayName
          displayName={displayName}
          value={rename.draft}
          readOnly={rename.readOnly}
          editing={rename.editing}
          saving={rename.saving}
          error={rename.error}
          showActions={false}
          onChange={rename.changeDraft}
          onEdit={rename.startEdit}
          onSave={rename.save}
          onCancel={rename.cancel}
        />
        <p className="text-caption text-muted-foreground">{typeLabel}</p>
      </div>
    </div>
  );
}

type FramingEditorConnectorProps = {
  /**
   * Create vs edit. In edit mode, the memo and whiteboard editors are
   * replaced by "Open" buttons that launch the collaborative dialogs
   * (spec plan D13 / T048 / T048a). Content is then persisted by those
   * dialogs directly, not by the main callout form.
   */
  mode?: 'create' | 'edit';
  /** Parent callout id used to preserve memo-signing return intent. */
  calloutId?: string;
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
  // Form framing: the definition is bound to the form values in both modes. In edit mode it is saved
  // through the dedicated form mutation by the parent, never with the Post.
  formTitle?: string;
  onFormTitleChange?: (title: string) => void;
  formDescription?: string;
  onFormDescriptionChange?: (description: string) => void;
  formQuestions?: FormQuestionValue[];
  onFormQuestionsChange?: (questions: FormQuestionValue[]) => void;
  /** Builder errors in the `FormQuestionsEditor` contract (`title`, `description`, `questions`, `<index>.prompt`, …). */
  formQuestionsErrors?: Record<string, string | undefined>;
  formSettings?: FormSettingsValue;
  onFormSettingsChange?: (settings: FormSettingsValue) => void;
  /** Edit mode only; undefined for a Form being created. */
  formEditContext?: FormEditContext;
  // Whiteboard framing
  whiteboardConfigured?: boolean;
  /** Persisted live draft lifecycle for create mode. */
  whiteboardDraft?: WhiteboardDraftLifecycle;
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
  /** Existing Collabora document's id + display name — power the inline rename in the edit-mode box. */
  editCollaboraDocumentId?: string;
  editCollaboraDocumentDisplayName?: string;
  /**
   * Rename state for the edit-mode document box, owned by the parent form so its
   * Save button commits the rename. Present only for a document-framing callout in
   * edit mode; when absent, the box falls back to a read-only display.
   */
  collaboraRename?: UseRenameCollaboraDocumentResult;
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
  // Custom selection (feature 025) — present for 'contributors' and 'spaces' framing.
  selectionMode?: 'auto' | 'custom';
  onSelectionModeChange?: (next: 'auto' | 'custom') => void;
  selectedIds?: string[];
  onSelectedIdsChange?: (ids: string[]) => void;
  /**
   * Card variant — present for the 'spaces' framing only. Defaults to
   * 'compact' when the consumer omits it (e.g. the template form did not pass it
   * before this feature).
   */
  cardVariant?: 'compact' | 'expanded';
  onCardVariantChange?: (next: 'compact' | 'expanded') => void;
  /**
   * Picker candidates + search for the contributors chip (feature 025, T005).
   * Derived by `useSelectionCandidates` in `CalloutFormConnector` and passed in
   * so `FramingEditorConnector` stays free of Apollo hooks (CRD connector rules).
   */
  contributorCandidates?: import('./useSelectionCandidates').SelectionCandidate[];
  resolveContributorChips?: (
    selectedIds: string[]
  ) => import('@/crd/forms/ContributorSelector').ContributorSelectorInvitee[];
  contributorCandidatesLoading?: boolean;
  /**
   * The account-scoped space candidate model for the spaces chip (feature 084,
   * T102). Derived by `useAccountSpaceCandidates` in `CalloutFormConnector` so
   * this connector stays free of Apollo hooks (CRD connector rules).
   */
  spaceCandidates?: import('./useAccountSpaceCandidates').UseAccountSpaceCandidatesResult;
  /**
   * Whether this editor may change the spaces chip's manual selection — i.e. is
   * a space admin of the host space, which is the privilege the candidate query
   * is gated on. False only in EDIT mode, for a callout creator who has since
   * been demoted and still holds UPDATE on the callout itself; the whole
   * manual-selection block is then not rendered (084 FR-009a), and the stored
   * selection is still submitted unchanged on save (084 FR-014).
   */
  canEditSpaceSelection?: boolean;
  /**
   * Map pins for the map-view capture control.
   * In edit mode: the default-type contributor cards derived by `CalloutFormConnector`.
   * In create mode: empty (pinless preview).
   */
  contributorMapPins?: ContributorMapPin[];
  /**
   * Current fixed map view from the form state. null = automatic framing.
   * Passed in from `CalloutFormConnector` so the control can show the current state
   * without having access to the full `ContributorCollectionConfig` (which includes mapView
   * but is not the type flowing through `ContributorCollectionConfigField`).
   */
  contributorMapView?: ContributorMapFixedView | null;
  /**
   * Callback to update the fixed map view.
   * Called with the new view (object = fix it, null = reset to automatic).
   */
  onContributorMapViewChange?: (view: ContributorMapFixedView | null) => void;
};

type DraftInlineWhiteboardPreviewProps = {
  draftWhiteboardID: string | undefined;
  onEdit: () => void;
  editLabel: string;
  previewImageUrl: string | undefined;
  imageAlt: string;
  disabled: boolean;
};

/** Prefers the draft's own stored preview once a draft exists. */
const DraftInlineWhiteboardPreview = ({
  draftWhiteboardID,
  previewImageUrl,
  ...props
}: DraftInlineWhiteboardPreviewProps) =>
  draftWhiteboardID ? (
    <StoredDraftInlineWhiteboardPreview
      draftWhiteboardID={draftWhiteboardID}
      previewImageUrl={previewImageUrl}
      {...props}
    />
  ) : (
    <InlineWhiteboardPreview previewImageUrl={previewImageUrl} {...props} />
  );

const StoredDraftInlineWhiteboardPreview = ({
  draftWhiteboardID,
  previewImageUrl,
  ...props
}: DraftInlineWhiteboardPreviewProps & { draftWhiteboardID: string }) => {
  const draftPreviewUrl = useWhiteboardDraftPreviewUrl(draftWhiteboardID);
  return <InlineWhiteboardPreview previewImageUrl={draftPreviewUrl ?? previewImageUrl} {...props} />;
};

export function FramingEditorConnector({
  mode = 'create',
  calloutId,
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
  formTitle = '',
  onFormTitleChange,
  formDescription = '',
  onFormDescriptionChange,
  formQuestions = [],
  onFormQuestionsChange,
  formQuestionsErrors,
  formSettings,
  onFormSettingsChange,
  formEditContext,
  whiteboardTitle,
  whiteboardDraft,
  whiteboardPreviewImages,
  whiteboardPreviewServerUrl,
  memoMarkdown = '',
  onMemoMarkdownChange,
  memoUpload,
  mediaGalleryVisuals,
  onMediaGalleryVisualsChange,
  collaboraDocumentType,
  onCollaboraDocumentTypeChange,
  editCollaboraDocumentId,
  editCollaboraDocumentDisplayName,
  collaboraRename,
  collaboraUpload,
  contributorCollection,
  onContributorCollectionChange,
  contributorCollectionError,
  selectionMode = 'auto',
  onSelectionModeChange,
  selectedIds = [],
  onSelectedIdsChange,
  cardVariant = 'compact',
  onCardVariantChange,
  contributorCandidates = [],
  resolveContributorChips,
  contributorCandidatesLoading = false,
  spaceCandidates,
  canEditSpaceSelection = true,
  contributorMapPins = [],
  contributorMapView = null,
  onContributorMapViewChange,
}: FramingEditorConnectorProps) {
  const { t } = useTranslation('crd-space');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'open' | 'closed' | null>(null);
  const [whiteboardEditorOpen, setWhiteboardEditorOpen] = useState(false);
  const [memoDialogOpen, setMemoDialogOpen] = useState(false);
  // Feature 025: search query state for the contributor picker. Must live at
  // function top-level (Rules of Hooks — no hooks inside switch cases). The
  // spaces picker holds its own query (084 T105).
  const [contributorSearchQuery, setContributorSearchQuery] = useState('');
  // Map-view capture control state.
  // Must live at function top-level (Rules of Hooks — no state inside switch cases).
  const [mapViewControlOpen, setMapViewControlOpen] = useState(false);
  const [capturedView, setCapturedView] = useState<ContributorMapFixedView | null>(null);
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

      // Create mode uses a real server-owned Whiteboard draft. Its Yjs content
      // stays on the collaboration transport; the final create mutation carries
      // only the draft id.
      const openDraft = async () => {
        const draft = await whiteboardDraft?.materialize();
        if (draft) setWhiteboardEditorOpen(true);
      };
      return (
        <>
          <DraftInlineWhiteboardPreview
            draftWhiteboardID={whiteboardDraft?.handle?.whiteboardID}
            onEdit={() => void openDraft()}
            editLabel={t('framing.edit')}
            previewImageUrl={whiteboardPreviewUrl ?? whiteboardPreviewServerUrl}
            imageAlt={whiteboardTitle || t('callout.whiteboard')}
            disabled={!whiteboardDraft || whiteboardDraft.loading}
          />
          {whiteboardEditorOpen && whiteboardDraft?.handle && (
            <WhiteboardDraftEditor
              whiteboardID={whiteboardDraft.handle.whiteboardID}
              displayName={whiteboardTitle || t('callout.whiteboard')}
              onClose={() => setWhiteboardEditorOpen(false)}
            />
          )}
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
            <CrdMemoDialog
              open={memoDialogOpen}
              memoId={editMemoId}
              signingOrigin={calloutId ? { kind: 'framing', calloutId } : undefined}
              onClose={() => setMemoDialogOpen(false)}
            />
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

    case 'document': {
      // Collabora document framing. The document body is edited from the post
      // card / detail dialog via `CollaboraFramingEditorOverlay`.
      if (mode === 'edit') {
        // The document already exists, so the "Create new" type picker no longer
        // applies: show the existing document with inline rename (the pencil),
        // consistent with the editor title bar.
        const docType = collaboraDocumentType as CollaboraDocumentTypeValue;
        if (editCollaboraDocumentId && collaboraRename) {
          return (
            <CollaboraDocumentEditBox
              displayName={editCollaboraDocumentDisplayName ?? ''}
              documentType={docType}
              rename={collaboraRename}
            />
          );
        }
        // Fallback when the document id isn't available: read-only box.
        const DocIcon = collaboraDocIconByType[docType] ?? FileText;
        return (
          <div className="p-4 border rounded-xl bg-muted/30 flex items-center gap-3 animate-in fade-in">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <DocIcon className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-body-emphasis truncate">
                {editCollaboraDocumentDisplayName || t(collaboraDocLabelKeyByType[docType] ?? 'callout.documentText')}
              </p>
              <p className="text-caption text-muted-foreground">
                {t(collaboraDocLabelKeyByType[docType] ?? 'callout.documentText')}
              </p>
            </div>
          </div>
        );
      }
      // Create mode — type picker + upload (type is fixed at creation time).
      return (
        <CollaboraDocumentTypePicker
          value={collaboraDocumentType as CollaboraDocumentTypeValue}
          onChange={next => onCollaboraDocumentTypeChange(next as CollaboraDocumentType)}
          upload={collaboraUpload}
        />
      );
    }

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

    case 'form': {
      // The Form has responses, or may have them because this editor cannot read the count.
      const formMayHaveResponses = formEditContext
        ? !formEditContext.canReadAll || formEditContext.responseCount > 0
        : false;
      return (
        <>
          <FormQuestionsEditor
            title={formTitle}
            onTitleChange={next => onFormTitleChange?.(next)}
            description={formDescription}
            onDescriptionChange={next => onFormDescriptionChange?.(next)}
            questions={formQuestions}
            onChange={next => onFormQuestionsChange?.(next)}
            errors={formQuestionsErrors}
            // Per-question answer presence is not loaded: every persisted question gets the hint.
            answeredHintQuestionIds={
              formMayHaveResponses ? formQuestions.flatMap(question => (question.id ? [question.id] : [])) : []
            }
            settingsSlot={
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setSettingsOpen(true)}
                aria-label={t('formForm.settingsButton')}
              >
                <Settings className="w-4 h-4" aria-hidden="true" />
              </Button>
            }
          />
          {formSettings && (
            <FormSettingsDialog
              open={settingsOpen}
              onOpenChange={setSettingsOpen}
              visibility={formSettings.visibility}
              onVisibilityChange={visibility => onFormSettingsChange?.({ ...formSettings, visibility })}
              responseMode={formSettings.responseMode}
              onResponseModeChange={responseMode => onFormSettingsChange?.({ ...formSettings, responseMode })}
              state={formSettings.state}
              onStateChange={state => onFormSettingsChange?.({ ...formSettings, state })}
              defaultCollapsed={formSettings.defaultCollapsed}
              onDefaultCollapsedChange={defaultCollapsed =>
                onFormSettingsChange?.({ ...formSettings, defaultCollapsed })
              }
              confirmWidening={formEditContext?.savedVisibility === 'ADMINS' && formMayHaveResponses}
              existingResponseCount={formEditContext?.canReadAll ? formEditContext.responseCount : undefined}
              spaceName={formEditContext?.spaceName ?? ''}
            />
          )}
        </>
      );
    }

    case 'contributors': {
      // Contributor-collection config (feature 008). Editable in both create and
      // edit (FR-004d). The callout renders no framing body — only its config.
      // Fail fast on an incomplete call site rather than silently rendering
      // nothing — these props are required whenever framingType === 'contributors'.
      if (!contributorCollection || !onContributorCollectionChange) {
        throw new Error(
          "FramingEditorConnector: the 'contributors' framing requires `contributorCollection` and `onContributorCollectionChange` props."
        );
      }

      // #10418: an `eligible: false` chip only means "not in the candidate set",
      // and before the candidate set has arrived that is "not loaded yet", not
      // "no longer a member" — relabelling then collapses every chip to the same
      // "No longer available" string. Mirrors `SpaceSelector.tsx:156`.
      const candidatesPending = contributorCandidatesLoading && contributorCandidates.length === 0;
      // Feature 025: build the ContributorSelector chip list from selectedIds
      // resolved against the candidate set (stale ids → eligible: false).
      // An order-preserving map: `handleContributorRemove` indexes into this array
      // positionally, so a stale entry is relabelled in place, never filtered out.
      const contributorChips = (resolveContributorChips ? resolveContributorChips(selectedIds) : []).map(chip => {
        if (chip.kind === 'email' || chip.eligible !== false) return chip;
        // An unresolved chip carries the raw uuid as its displayName, so "keep
        // its own identity" would print the uuid. While pending the chip must
        // claim nothing in either direction: a neutral "loading" label, and no
        // ineligible marker to alarm with. Same semantics as SpaceSelector's
        // pending branch (`SpaceSelector.tsx:294-301`).
        return candidatesPending
          ? { ...chip, displayName: t('forms.selection.loading'), eligible: true }
          : { ...chip, displayName: t('forms.selection.noLongerAvailable') };
      });
      // Selected entries stay in the results as ticked toggle rows (088,
      // superseding 084 FR-006), so no already-selected filter here — only the
      // query filter, because results show on search alone (operator ruling).
      const contributorSearchResults = contributorCandidates
        .filter(c => {
          if (!contributorSearchQuery.trim()) return true;
          return c.displayName.toLowerCase().includes(contributorSearchQuery.toLowerCase());
        })
        .map(c => ({
          userId: c.id,
          displayName: c.displayName,
          avatarUrl: c.avatarUrl,
          typeLabel: t(`contributors.types.${c.kind}` as 'contributors.types.user'),
        }));

      // A result row is a toggle: clicking a ticked row deselects it, which is
      // the same end state as removing its chip.
      const handleContributorSelect = (userId: string) => {
        onSelectedIdsChange?.(
          selectedIds.includes(userId) ? selectedIds.filter(id => id !== userId) : [...selectedIds, userId]
        );
      };
      const handleContributorRemove = (index: number) => {
        const chip = contributorChips[index];
        if (!chip) return;
        const chipId = chip.kind === 'user' ? chip.userId : chip.kind !== 'email' ? chip.id : undefined;
        if (!chipId) return;
        onSelectedIdsChange?.(selectedIds.filter(id => id !== chipId));
      };

      return (
        <div className="space-y-4">
          <CalloutSelectionField
            mode={selectionMode}
            onModeChange={next => onSelectionModeChange?.(next)}
            label={t('forms.selection.label')}
            autoDescription={t('forms.selection.contributors.autoDescription')}
            customDescription={t('forms.selection.contributors.customDescription')}
            pickerSlot={
              <ContributorSelector
                selectedContributors={contributorChips}
                searchResults={contributorSearchResults}
                searchQuery={contributorSearchQuery}
                onSearchChange={setContributorSearchQuery}
                onSelectUser={handleContributorSelect}
                onRemoveContributor={handleContributorRemove}
                loading={contributorCandidatesLoading}
                allowEmailInvites={false}
                chipsPosition="above"
                rowSelection="toggle"
                clearSearchAriaLabel={t('forms.selection.clearSearch')}
                ineligibleLabel={t('forms.selection.noLongerAvailable')}
                placeholder={t('forms.selection.searchPlaceholder')}
                searchAriaLabel={t('forms.selection.searchAriaLabel')}
                noResultsLabel={t('forms.selection.noResults')}
                loadingLabel={t('forms.selection.loading')}
                loadMoreLabel={t('forms.selection.loadMore')}
                removeAriaLabel={name => t('forms.selection.removeAriaLabel', { name })}
                validationErrorLabel={() => ''}
              />
            }
          />
          {/* Type config, shown in both selection modes: in custom mode the configured
              types are what bounds the picker's candidates (084 FR-002/FR-004). */}
          <ContributorCollectionConfigField
            value={contributorCollection}
            onChange={onContributorCollectionChange}
            error={contributorCollectionError}
          />
          {/* Map-view capture control. Only shown when the config has
              at least one locatable type. Virtual contributors are
              not geocoded and therefore cannot anchor a meaningful fixed view. */}
          {/* Only render when the parent wired a change handler. The callout TEMPLATE
              editor does not (the map view is intentionally not persisted on templates), so showing the
              capture control there would be a dead-end control. */}
          {onContributorMapViewChange && contributorCollection.types.some(tp => tp !== 'virtualContributor') && (
            <div className="space-y-2">
              <button
                type="button"
                className="flex items-center gap-2 text-body-emphasis cursor-pointer hover:text-foreground transition-colors"
                aria-expanded={mapViewControlOpen}
                onClick={() => {
                  // Clear a camera captured in a previous open session so a stale view
                  // can't be applied after a close/reopen cycle.
                  setCapturedView(null);
                  setMapViewControlOpen(prev => !prev);
                }}
                aria-label={t('contributors.mapView.controlAriaLabel')}
              >
                {/* Mirror the whiteboard preview-selection icons: automatic ⇒ Wand2, a
                    chosen (custom) framing ⇒ Crop (see PreviewSettingsDialog). Not a pin. */}
                {contributorMapView ? (
                  <Crop className="size-4 shrink-0" aria-hidden="true" />
                ) : (
                  <Wand2 className="size-4 shrink-0" aria-hidden="true" />
                )}
                <span>
                  {contributorMapView ? t('contributors.mapView.stateFixed') : t('contributors.mapView.stateAutomatic')}
                </span>
              </button>
              <p className="text-caption text-muted-foreground">{t('contributors.mapView.helper')}</p>
              {mapViewControlOpen && (
                <div className="space-y-2">
                  <p className="text-caption text-muted-foreground">{t('contributors.mapView.captureHint')}</p>
                  <div className="h-48 rounded-md overflow-hidden border border-border">
                    <Suspense fallback={<Loading />}>
                      <LazyContributorMap
                        pins={contributorMapPins}
                        fixedView={contributorMapView ?? undefined}
                        onViewChange={setCapturedView}
                        ariaLabel={t('contributors.mapView.mapAriaLabel')}
                      />
                    </Suspense>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!capturedView}
                      onClick={() => {
                        if (capturedView) {
                          onContributorMapViewChange?.(capturedView);
                        }
                      }}
                    >
                      {t('contributors.mapView.useCurrent')}
                    </Button>
                    {contributorMapView && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onContributorMapViewChange?.(null)}
                      >
                        {t('contributors.mapView.resetAuto')}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    case 'spaces': {
      // Feature 084: manual selection over every space of the host space's
      // account the editor may READ (T102), replacing 025's host-only subspace
      // source. `canEditSpaceSelection` decides whether the block renders at all
      // (FR-009a) — not which of its parts do.
      // The picker takes plain values only (CRD rule 4), so the level label is
      // translated and the ancestor chain flattened to names here.
      const spaceItems = (spaceCandidates?.candidates ?? []).map(candidate => ({
        id: candidate.id,
        displayName: candidate.displayName,
        levelLabel: t(spaceLevelLabelKeyByLevel[candidate.level]),
        ancestorPath: candidate.ancestorPath.map(ancestor => ancestor.displayName),
        isHost: candidate.isHost,
        inHostTree: candidate.inHostTree,
        hasNameClash: candidate.hasNameClash,
      }));

      const handleSpaceToggle = (id: string) =>
        onSelectedIdsChange?.(
          selectedIds.includes(id) ? selectedIds.filter(entry => entry !== id) : [...selectedIds, id]
        );

      return (
        <div className="space-y-4">
          {canEditSpaceSelection && (
            <div className="space-y-2">
              <p className="text-body-emphasis text-foreground">{t('forms.selection.spaces.fieldTitle')}</p>
              <CalloutSelectionField
                mode={selectionMode}
                onModeChange={next => onSelectionModeChange?.(next)}
                label={t('forms.selection.spaces.switchLabel')}
                autoDescription={t('forms.selection.spaces.autoDescription')}
                customDescription={t('forms.selection.spaces.customDescription')}
                pickerSlot={
                  <SpaceSelector
                    items={spaceItems}
                    selectedIds={selectedIds}
                    onToggle={handleSpaceToggle}
                    onClearSelection={() => onSelectedIdsChange?.([])}
                    loading={spaceCandidates?.loading ?? false}
                    loadFailed={Boolean(spaceCandidates?.error)}
                    searchPlaceholder={t('forms.selection.spacePicker.searchPlaceholder')}
                    searchAriaLabel={t('forms.selection.spacePicker.searchAriaLabel')}
                    clearSearchAriaLabel={t('forms.selection.clearSearch')}
                    loadingLabel={t('forms.selection.loading')}
                    noMatchesLabel={t('forms.selection.spacePicker.noMatches')}
                    accountEmptyLabel={t('forms.selection.spacePicker.accountEmpty')}
                    loadFailedLabel={t('forms.selection.spacePicker.loadFailed')}
                    chipsEmptyLabel={t('forms.selection.spacePicker.chipsEmpty')}
                    unresolvedLabel={t('forms.selection.noLongerAvailable')}
                    chipContextLabel={parentName => t('forms.selection.spacePicker.chipContext', { parentName })}
                    inThisSpaceLabel={t('forms.selection.spacePicker.badgeInThisSpace')}
                    calloutIsHereLabel={t('forms.selection.spacePicker.badgeCalloutIsHere')}
                    pathLabel={(level, path) => t('forms.selection.spacePicker.pathSubLine', { level, path })}
                    removeAriaLabel={(name, parentName) =>
                      parentName
                        ? t('forms.selection.spacePicker.removeInParentAriaLabel', { name, parentName })
                        : t('forms.selection.removeAriaLabel', { name })
                    }
                    selectedCountLabel={count =>
                      count === 0
                        ? t('forms.selection.spacePicker.noneSelected')
                        : t('forms.selection.spacePicker.selectedCount', { count })
                    }
                    clearSelectionLabel={t('forms.selection.spacePicker.clearSelection')}
                  />
                }
              />
            </div>
          )}
          {/* "Expanded card" switch — placed immediately after the
              complete Manual selection block (its switch, description and, when
              on, its picker). */}
          <CalloutCardVariantField
            expanded={cardVariant === 'expanded'}
            onExpandedChange={on => onCardVariantChange?.(on ? 'expanded' : 'compact')}
            label={t('forms.cardVariant.label')}
            description={t('forms.cardVariant.description')}
          />
        </div>
      );
    }

    default:
      return null;
  }
}
