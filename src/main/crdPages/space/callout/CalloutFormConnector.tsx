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
import { Columns3, Hash } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCalloutContentQuery,
  useCreateReferenceOnProfileMutation,
  useDeleteReferenceMutation,
  useSubspacesInSpaceQuery,
  useTemplateContentLazyQuery,
  useUpdateCalloutContentMutation,
  useUpdatePollStatusMutation,
} from '@/core/apollo/generated/apollo-hooks';
import {
  CalloutFramingType,
  CalloutVisibility,
  LicenseEntitlementType,
  PollStatus,
} from '@/core/apollo/generated/graphql-schema';
import { error as logError } from '@/core/logging/sentry/log';
import { SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { TaskColumnsDraftDialog } from '@/crd/components/callout/task-board/TaskColumnsDraftDialog';
import { isTaskBoardEnabled } from '@/crd/components/callout/task-board/taskBoard';
import { DiscardChangesDialog } from '@/crd/components/dialogs/DiscardChangesDialog';
import type { ContributorMapPin } from '@/crd/components/map/ContributorMap';
import { AddPostModal } from '@/crd/forms/callout/AddPostModal';
import { AllowCommentsField } from '@/crd/forms/callout/AllowCommentsField';
import type { DocumentImportError } from '@/crd/forms/callout/DocumentImportZone';
import { type DisabledChipMap, type FramingChipId, FramingChipStrip } from '@/crd/forms/callout/FramingChipStrip';
import { ResponsePanel } from '@/crd/forms/callout/ResponsePanel';
import { type DisabledResponseChipMap, ResponseTypeChipStrip } from '@/crd/forms/callout/ResponseTypeChipStrip';
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
import { ReferencesEditor } from '@/crd/forms/references/ReferencesEditor';
import { TagsInput } from '@/crd/forms/tags-input';
import { ensureHttps } from '@/crd/lib/ensureHttps';
import { Button } from '@/crd/primitives/button';
import { Label } from '@/crd/primitives/label';
import { Switch } from '@/crd/primitives/switch';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import {
  COLLABORA_IMPORT_ACCEPT_ATTR,
  COLLABORA_IMPORT_EXTENSIONS_P1,
  COLLABORA_IMPORT_MAX_BYTES,
} from '@/domain/collaboration/calloutContributions/collaboraDocument/collaboraImportFormats';
import { deriveCollaboraImportErrorMessage } from '@/domain/collaboration/calloutContributions/collaboraDocument/deriveCollaboraImportErrorMessage';
import { filenameWithoutExtension } from '@/domain/collaboration/calloutContributions/collaboraDocument/filenameWithoutExtension';
import { useRenameCollaboraDocument } from '@/domain/collaboration/calloutContributions/collaboraDocument/useRenameCollaboraDocument';
import { validateCollaboraImportFile } from '@/domain/collaboration/calloutContributions/collaboraDocument/validateCollaboraImportFile';
import { buildFlowStateClassificationTagsets } from '@/domain/collaboration/calloutsSet/Classification/ClassificationTagset.utils';
import { useCalloutCreation } from '@/domain/collaboration/calloutsSet/useCalloutCreation/useCalloutCreation';
import useUploadMediaGalleryVisuals from '@/domain/collaboration/mediaGallery/useUploadMediaGalleryVisuals';
import { usePollOptionManagement } from '@/domain/collaboration/poll/hooks/usePollOptionManagement';
import { useWhiteboardDraft } from '@/domain/collaboration/whiteboard/WhiteboardDraft/useWhiteboardDraft';
import useUploadWhiteboardVisuals from '@/domain/collaboration/whiteboard/WhiteboardVisuals/useUploadWhiteboardVisuals';
import { useSpace } from '@/domain/space/context/useSpace';
import {
  StorageConfigContextProvider,
  useStorageConfigContext,
} from '@/domain/storage/StorageBucket/StorageConfigContext';
import { useMarkdownEditorIntegration } from '@/main/crdPages/markdown/useMarkdownEditorIntegration';
import {
  diffPollOptions,
  isAddedSentinel,
  type PollOptionBefore,
  parseAddedSentinel,
} from '@/main/crdPages/space/hooks/useCrdCalloutPollOptionDiff';
import { loadCalloutTemplateFormValues } from '@/main/crdPages/templates/loadCalloutTemplateFormValues';
import { useReferenceFileUpload } from '@/main/crdPages/utils/useReferenceFileUpload';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useBeforeUnloadGuard } from '../hooks/useBeforeUnloadGuard';
import { referenceRowErrors, useCrdCalloutForm } from '../hooks/useCrdCalloutForm';
import { useCrdSpaceContributors } from '../hooks/useCrdSpaceContributors';
import { mapFormToCalloutCreationInput, mapFormToCalloutUpdateInput } from './calloutFormMapper';
import { type CrdCalloutRestrictions, clampFormValuesToRestrictions } from './calloutRestrictions';
import { healContributorCollection } from './contributorCollectionMapper';
import { mapCalloutDetailsToFormValues } from './dataMappers/mapCalloutDetailsToFormValues';
import { FramingEditorConnector } from './FramingEditorConnector';
import { ResponseDefaultsConnector } from './ResponseDefaultsConnector';
import { TemplateImportConnector } from './TemplateImportConnector';
import { omitIneligibleIds, useSelectionCandidates } from './useSelectionCandidates';

/**
 * The full create-mode framing chip set, in display order. `contributors`
 * (feature 008) and `spaces` (feature 013) are included here but admin-gated by
 * the connector before being passed to `FramingChipStrip` (FR-004a); a non-admin
 * gets every chip except those two.
 */
const DEFAULT_FRAMING_CHIPS: FramingChipId[] = [
  'whiteboard',
  'memo',
  'document',
  'cta',
  'image',
  'poll',
  'contributors',
  'spaces',
];

/**
 * Admin-only framing chips (feature 008 `contributors`, feature 013 `spaces`).
 * Both are offered only to space admins (`permissions.canUpdate`) and only in a
 * collaboration context — never a VC knowledge base, which passes its own
 * `allowedFramingChips`. Filtered out of the default allow-list for non-admins.
 */
const ADMIN_ONLY_FRAMING_CHIPS: FramingChipId[] = ['contributors', 'spaces'];

/** The title counter stays hidden until the value gets this close to `SMALL_TEXT_LENGTH`. */
const TITLE_COUNTER_THRESHOLD = SMALL_TEXT_LENGTH - 10;

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
  /**
   * Create mode only: the active flow state's configured default callout template id
   * (`flowStateForNewCallouts.defaultCalloutTemplate.id`). When set, the form auto-prefills
   * from that template once per dialog-open (FR-086 / spec 042 Session 2026-05-20). A manual
   * "Find Template" pick or user edit afterwards is preserved — the auto-load runs once.
   */
  defaultTemplateId?: string;
  onFindTemplate?: () => void;
  /**
   * Optional feature restrictions for the create flow (e.g. a Virtual
   * Contributor's knowledge base: None-only framing, Posts/Links responses, no
   * comments, no rich media). Omitted ⇒ full feature set (no change).
   */
  restrictions?: CrdCalloutRestrictions;
};

/**
 * Outer wrapper: scopes CREATE-mode uploads to the SPACE bucket.
 *
 * In create mode the callout has no bucket yet, so markdown-image + reference uploads go to
 * `space.profile.storageBucket` with `temporaryLocation: true` (the server relocates them onto the new
 * callout on save). We mount the space-scoped `StorageConfigContextProvider` here — once — so the five
 * callout-list call sites don't each repeat it. `skip={!open}` means the auth-gated `space.profile` query
 * only fires when a create-capable member actually opens the dialog: it is never requested on a plain space
 * page load (anonymous visitors / non-members on private spaces would fail that field — see
 * `SpaceStorageConfig`'s `@include(if: $includeSpaceProfile)`).
 *
 * `useUrlResolver().spaceId` resolves the current Space *or* Subspace id (whichever the URL points at), so
 * this is correct at every level. EDIT mode is already wrapped by `CalloutEditConnector`
 * (`locationType="callout"`) and needs no space scope, so we render the inner connector directly.
 */
export function CalloutFormConnector(props: CalloutFormConnectorProps) {
  const { spaceId } = useUrlResolver();
  if (props.mode !== 'edit' && spaceId) {
    return (
      <StorageConfigContextProvider locationType="space" spaceId={spaceId} temporaryLocation={true} skip={!props.open}>
        <CalloutFormConnectorInner {...props} />
      </StorageConfigContextProvider>
    );
  }
  return <CalloutFormConnectorInner {...props} />;
}

function CalloutFormConnectorInner({
  open,
  onOpenChange,
  mode = 'create',
  calloutId,
  calloutsSetId,
  editCallout,
  activeFlowStateName,
  defaultTemplateId,
  onFindTemplate,
  restrictions,
}: CalloutFormConnectorProps) {
  const { t } = useTranslation('crd-space');
  const { t: tTaskBoard } = useTranslation('crd-taskBoard');

  // Restriction-driven create-mode defaults: any comment toggle that is hidden
  // must still submit `false`, so seed the empty form accordingly.
  const restrictionOverrides =
    mode === 'create'
      ? {
          ...(restrictions?.disableFramingComments ? { framingCommentsEnabled: false } : {}),
          ...(restrictions?.disableContributionComments ? { contributionCommentsEnabled: false } : {}),
        }
      : undefined;
  const form = useCrdCalloutForm(restrictionOverrides);

  // Space context — `permissions.canUpdate` is the space-admin signal that gates
  // the contributors framing chip; `entitlements` gates the office-documents chip
  // (read further below). `spaceContextLoading` is the entitlements query flag.
  const { space, entitlements, permissions, loading: spaceContextLoading } = useSpace();
  const roleSetId = space.about.membership?.roleSetID;
  const { spaceId } = useUrlResolver();

  // The "Contributors" (008) and "Subspaces" (013) framing chips are admin-only
  // (FR-004a) and offered only in space/community (collaboration) callout contexts
  // — never a VC knowledge base (FR-004d/FR-004f). The VC-KB flow passes
  // `restrictions.allowedFramingChips = []` (None-only), so it never lists them;
  // any other explicit `allowedFramingChips` likewise opts in deliberately. For the
  // default collaboration flow we build the allow-list explicitly so the two admin
  // chips are gated to space admins instead of shown to everyone. Neither chip is
  // level-restricted — both appear on L0 and L1 collaboration spaces (a Subspaces
  // callout on an L1 lists that space's subspaces); only auto-provisioning is
  // L0-only (server-side, FR-004e).
  const isSpaceAdmin = permissions.canUpdate;
  const framingAllowList: FramingChipId[] | undefined = (() => {
    if (mode !== 'create') return undefined; // edit mode: never hide an existing type
    if (restrictions?.allowedFramingChips) return restrictions.allowedFramingChips;
    // Default collaboration flow: all chips, with the admin-only chips gated.
    return isSpaceAdmin
      ? DEFAULT_FRAMING_CHIPS
      : DEFAULT_FRAMING_CHIPS.filter(chip => !ADMIN_ONLY_FRAMING_CHIPS.includes(chip));
  })();
  const hideFramingZone = mode === 'create' && Array.isArray(framingAllowList) && framingAllowList.length === 0;
  const responseAllowList = mode === 'create' ? restrictions?.allowedResponseChips : undefined;
  // Comment-visibility and rich-media restrictions are create-only too — in edit
  // mode an existing callout keeps its full controls regardless of `restrictions`.
  const showFramingComments = mode !== 'create' || !restrictions?.disableFramingComments;
  const showContributionComments = mode !== 'create' || !restrictions?.disableContributionComments;
  const disableRichMedia = mode === 'create' && Boolean(restrictions?.disableRichMedia);
  const { values, errors, setField, setValues, validate, reset, prefill, dirty } = form;

  const framingWhiteboardDraft = useWhiteboardDraft({
    scope: { type: 'calloutsSet', id: calloutsSetId },
    handle: values.framingWhiteboardDraft,
    onHandleChange: handle => setField('framingWhiteboardDraft', handle),
    source: { sourceWhiteboardID: values.editMeta?.whiteboardId },
  });
  const defaultWhiteboardDraft = useWhiteboardDraft({
    scope: { type: 'calloutsSet', id: calloutsSetId },
    handle: values.contributionDefaults.whiteboardDraft,
    onHandleChange: handle =>
      setValues(current => ({
        ...current,
        contributionDefaults: { ...current.contributionDefaults, whiteboardDraft: handle },
      })),
    source: {
      sourceWhiteboardID: values.contributionDefaults.sourceWhiteboardId,
      sourceCalloutID: values.contributionDefaults.sourceCalloutId,
    },
  });

  // Feature 025: contributor candidates for the custom-selection picker (T005).
  // Only fetched when the contributors chip is active AND the dialog is open.
  const isContributorsChip = values.framingChip === 'contributors';
  const isSpacesChip = values.framingChip === 'spaces';
  const {
    candidates: contributorCandidates,
    loading: contributorCandidatesLoading,
    resolveChips: resolveContributorChips,
    refetch: refetchContributorCandidates,
  } = useSelectionCandidates({
    roleSetId,
    // contributorTypes governs what the PICKER displays (FR-005); eligibility
    // checking inside useSelectionCandidates uses all types (FR-011).
    contributorTypes: values.contributorCollection.types,
    skip: !open || !isContributorsChip || !roleSetId,
  });

  // Feature 025: subspace candidates for the spaces chip (T006).
  // Reuses `useSubspacesInSpaceQuery` (already-shipped, host-scoped — R-6).
  const {
    data: subspacesData,
    loading: subspaceCandidatesLoading,
    refetch: refetchSubspaceCandidates,
  } = useSubspacesInSpaceQuery({
    variables: { spaceId: spaceId ?? '' },
    skip: !open || !isSpacesChip || !spaceId,
  });
  const subspaceCandidates = (subspacesData?.lookup.space?.subspaces ?? []).map(s => ({
    id: s.id,
    displayName: s.about.profile?.displayName ?? s.id,
    avatarUrl: s.about.profile?.avatar?.uri ?? undefined,
  }));

  // Contributor map pins for the map-view capture control.
  // Edit mode only: derive from the default-type contributor cards. In create mode
  // calloutId is undefined so the hook skips cleanly (the no-op path).
  const { defaultType: mapPinsDefaultType, getCards: getMapPinCards } = useCrdSpaceContributors(
    mode === 'edit' && isContributorsChip ? calloutId : undefined
  );
  const contributorMapPins: ContributorMapPin[] = (getMapPinCards(mapPinsDefaultType) ?? [])
    .filter(card => card.latitude !== undefined && card.longitude !== undefined)
    .map(card => ({
      id: card.id,
      name: card.name,
      avatarUrl: card.avatarUrl,
      roleLabel: card.roleLabel,
      href: card.href,
      latitude: card.latitude as number,
      longitude: card.longitude as number,
    }));

  const [discardOpen, setDiscardOpen] = useState(false);
  const [defaultsOpen, setDefaultsOpen] = useState(false);
  const [columnsDraftOpen, setColumnsDraftOpen] = useState(false);
  const [importTemplateOpen, setImportTemplateOpen] = useState(false);
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
  const officeDocumentsEnabled =
    spaceContextLoading || entitlements.includes(LicenseEntitlementType.SpaceFlagOfficeDocuments);
  const disabledChips: DisabledChipMap | undefined = officeDocumentsEnabled
    ? undefined
    : { document: { tooltip: t('framing.officeDocumentsNotEnabled') } };
  // The same office-documents entitlement gates the "Document" *response* type:
  // a callout must not offer document contributions on a space that lacks the
  // SPACE_FLAG_OFFICE_DOCUMENTS feature, mirroring the framing gate above.
  const responseDisabledChips: DisabledResponseChipMap | undefined = officeDocumentsEnabled
    ? undefined
    : { document: { tooltip: t('framing.officeDocumentsNotEnabled') } };

  // Image (markdown toolbar + paste/drop) and reference-file upload both read the ambient storage bucket,
  // which differs by mode:
  //   • CREATE → the SPACE bucket (`space.profile.storageBucket`), scoped by the outer wrapper above, with
  //     `temporaryLocation: true`. The callout doesn't exist yet, so the server relocates the files onto its
  //     bucket on save. A regular member has `FILE_UPLOAD` on the SPACE bucket (but not on ABOUT).
  //   • EDIT → the callout's own bucket, scoped by `CalloutEditConnector` (`locationType="callout"`), with
  //     `temporaryLocation: false` — the editor writes to it directly.
  // satisfies spec 042 callout-dialog FR-31 / FR-50.
  const temporaryUpload = mode === 'create';
  const ambientStorageConfig = useStorageConfigContext();
  const markdownIntegration = useMarkdownEditorIntegration({ temporaryLocation: temporaryUpload });
  const editorMarkdownUpload = {
    onImageUpload: markdownIntegration.onImageUpload,
    iframeAllowedUrls: markdownIntegration.iframeAllowedUrls,
    onError: markdownIntegration.onError,
  };
  const referenceUpload = useReferenceFileUpload(ambientStorageConfig, { temporaryLocation: temporaryUpload });

  const { handleCreateCallout, loading: creating } = useCalloutCreation({ calloutsSetId });
  const [updateCalloutContent, { loading: updating }] = useUpdateCalloutContentMutation();

  // Inline-rename state for the framing Collabora document, owned here (not in the
  // edit box) so the form's Save button commits any pending rename alongside the
  // rest of the edit. Instantiated with empty ids for non-document callouts, where
  // it stays idle (`editing` never opens, so `save()` is never invoked).
  const editCollaboraDocument = mode === 'edit' ? editCallout?.framing.collaboraDocument : undefined;
  const collaboraRename = useRenameCollaboraDocument({
    collaboraDocumentId: editCollaboraDocument?.id ?? '',
    displayName: editCollaboraDocument?.profile?.displayName ?? '',
    canRename: true,
  });
  const [createReferenceOnProfile] = useCreateReferenceOnProfileMutation();
  const [deleteReference] = useDeleteReferenceMutation();
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

  // Create-mode auto-prefill from the active flow state's default callout template (FR-086).
  // Runs once per dialog-open (guarded by the ref, reset on close), reusing the same
  // template-content→form-values path the manual "Find Template" picker uses. A manual pick
  // or user edit afterwards is preserved — the guard prevents re-applying within a session.
  const [getTemplateContent] = useTemplateContentLazyQuery();
  const prefilledDefaultTemplateIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!open) {
      prefilledDefaultTemplateIdRef.current = null;
      return;
    }
    if (mode !== 'create' || !defaultTemplateId) return;
    if (prefilledDefaultTemplateIdRef.current === defaultTemplateId) return;
    prefilledDefaultTemplateIdRef.current = defaultTemplateId;
    void loadCalloutTemplateFormValues(getTemplateContent, defaultTemplateId).then(values => {
      // Bail if the dialog closed or the default changed while the content was loading.
      if (!values || prefilledDefaultTemplateIdRef.current !== defaultTemplateId) return;
      // Clamp the template to the active restrictions so a default template can't
      // reintroduce a disallowed framing / response type or re-enable comments.
      prefill(clampFormValuesToRestrictions(values, restrictions));
    });
  }, [open, mode, defaultTemplateId, getTemplateContent, prefill, restrictions]);

  // --- Collabora import staging -----------------------------------------
  const setCollaboraImportFile = (file: File | null) => {
    if (!file) {
      setField('collaboraUploadFile', null);
      return;
    }
    const validation = validateCollaboraImportFile([file]);
    if (!validation.ok) {
      setCollaboraImportError(validation.error);
      // Don't stage the file when validation fails — pre-check before any network call.
      setField('collaboraUploadFile', null);
      return;
    }
    setCollaboraImportError(null);
    setField('collaboraUploadFile', file);
    // Auto-prefill the post title from the filename when the title is empty.
    // Pure convenience default: the post title and the document's own name
    // are independent — the server always derives the document's name from
    // the uploaded file, regardless of what the post title ends up as.
    if (!values.title.trim()) {
      setField('title', filenameWithoutExtension(file.name));
    }
  };

  const formatList = COLLABORA_IMPORT_EXTENSIONS_P1.join(', ');
  const capMb = Math.round(COLLABORA_IMPORT_MAX_BYTES / (1024 * 1024));
  const collaboraImportErrorMessage: string | null = deriveCollaboraImportErrorMessage(
    collaboraImportError,
    t,
    formatList,
    capMb
  );

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
  const submitting =
    creating || updating || mediaGalleryUploading || framingWhiteboardDraft.loading || defaultWhiteboardDraft.loading;

  const createAndUpload = async (visibility: CalloutVisibility) => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) return;

    // Strip ineligible (stale) selectedIds before serialising — mirrors the update
    // path (tasks T005/T006; the server rejects out-of-scope ids on create too).
    // Same loading guard as in saveEdit: if candidates aren't loaded yet, skip
    // the strip and let the server be the authority (corr-client-3 / qual-client-1).
    const isCollectionChipForCreate = values.framingChip === 'contributors' || values.framingChip === 'spaces';
    // Unresolved = still loading OR skipped for a missing id (see saveEdit).
    const candidatesUnresolvedForCreate =
      isCollectionChipForCreate &&
      values.selectionMode === 'custom' &&
      (values.framingChip === 'contributors'
        ? contributorCandidatesLoading || !roleSetId
        : subspaceCandidatesLoading || !spaceId);

    const eligibleSelectedIdsForCreate = (() => {
      if (values.selectionMode !== 'custom') return values.selectedIds;
      if (candidatesUnresolvedForCreate) return values.selectedIds;
      if (values.framingChip === 'contributors') {
        const chips = resolveContributorChips(values.selectedIds);
        return omitIneligibleIds(values.selectedIds, chips);
      }
      if (values.framingChip === 'spaces') {
        const candidateIds = new Set(subspaceCandidates.map(c => c.id));
        return values.selectedIds.filter(id => candidateIds.has(id));
      }
      return values.selectedIds;
    })();
    const valuesForCreate =
      eligibleSelectedIdsForCreate !== values.selectedIds
        ? { ...values, selectedIds: eligibleSelectedIdsForCreate }
        : values;

    const { input, whiteboardPreviewImages, collaboraUploadFile } = mapFormToCalloutCreationInput(valuesForCreate, {
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
      framingWhiteboardDraft.consumed();
      defaultWhiteboardDraft.consumed();
      reset();
      onOpenChange(false);
    }
  };

  // --- Edit path ---------------------------------------------------------
  const pollId = editData?.lookup.callout?.framing.poll?.id ?? values.editMeta?.pollId;
  const pollMgmt = usePollOptionManagement({ pollId: pollId ?? '' });

  // Poll open/closed status. Unlike the option edits (which are diffed and flushed
  // on save), the status toggle applies immediately on confirm — matching the
  // pre-CRD MUI behaviour. The mutation returns `...PollDetails`, so the Apollo
  // cache updates `framing.poll.status` and the form re-renders from it; there is
  // no local status field to keep in sync.
  const pollStatus = editData?.lookup.callout?.framing.poll?.status;
  const [updatePollStatus] = useUpdatePollStatusMutation();

  const handlePollStatusChange = async (status: 'open' | 'closed') => {
    if (!pollId) return;
    const nextStatus = status === 'closed' ? PollStatus.Closed : PollStatus.Open;
    try {
      await updatePollStatus({ variables: { statusData: { pollID: pollId, status: nextStatus } } });
      notify(
        status === 'closed' ? t('pollForm.statusChange.closeSuccess') : t('pollForm.statusChange.reopenSuccess'),
        'success'
      );
    } catch (err) {
      logError(new Error('Poll status change failed', { cause: err as Error }));
      notify(t('pollForm.statusChange.failed'), 'error');
    }
  };

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

    // Commit a pending framing-document rename as part of Save (the edit box has
    // no ✓ of its own). Only when the input is open; unchanged is a no-op inside
    // the hook. On validation/save failure keep the dialog open — the box shows
    // the inline error — and abort the rest of the save.
    if (collaboraRename.editing) {
      const renamed = await collaboraRename.save();
      if (!renamed) return;
    }

    // New references added in edit mode have no server id yet, so they can't
    // travel through `UpdateReferenceInput` (which requires `ID`). Persist them
    // via the dedicated `createReferenceOnProfile` mutation against the framing
    // profile before the bulk update; existing rows still flow through the
    // update payload below.
    const framingProfileId = editData?.lookup.callout?.framing.profile.id;
    const newReferenceRows = values.referenceRows.filter(
      row => !row.id && row.name.trim().length > 0 && row.uri.trim().length > 0
    );
    if (framingProfileId && newReferenceRows.length > 0) {
      try {
        for (const row of newReferenceRows) {
          await createReferenceOnProfile({
            variables: {
              input: {
                profileID: framingProfileId,
                name: row.name.trim(),
                uri: ensureHttps(row.uri),
                description: row.description?.trim() || undefined,
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

    // Removed references — rows present at edit-open but no longer in the form. The bulk
    // `updateCallout` only upserts existing references by `ID` (it can't delete), so removed rows
    // need an explicit `deleteReference`. Diff the open-time snapshot (`editMeta.originalReferenceIds`)
    // against the current rows — mirrors the callout-template + CG branches in `useTemplateForms`.
    const originalReferenceIds = values.editMeta?.originalReferenceIds ?? [];
    const currentReferenceIds = new Set(values.referenceRows.flatMap(row => (row.id ? [row.id] : [])));
    const removedReferenceIds = originalReferenceIds.filter(id => !currentReferenceIds.has(id));
    if (removedReferenceIds.length > 0) {
      try {
        for (const id of removedReferenceIds) {
          await deleteReference({ variables: { input: { ID: id } } });
        }
      } catch (err) {
        logError(new Error('Callout reference deletion failed', { cause: err as Error }));
        notify(t('callout.referencesSaveFailed'), 'error');
        return;
      }
    }

    // Strip ineligible (stale) selectedIds before serialising — the server strictly
    // rejects out-of-scope ids (spec FR-006/SC-005, tasks T005/T006).
    // For Contributors framing: resolve chips against the live candidate set so
    // ids whose member has since left the community are filtered out.
    // For Spaces framing: any id not present in subspaceCandidates is stale.
    //
    // SAFETY GUARD (corr-client-3 / qual-client-1): if the relevant candidate
    // query is still in flight (cache miss, slow network) the candidate set is
    // empty and stripping against it would wipe every stored id — silently
    // destroying the admin's curated list.  When candidates are not yet loaded
    // we skip the strip and let the server be the authority (server rejects
    // foreign / non-member ids on every write anyway — FR-006).
    const isCollectionChip = values.framingChip === 'contributors' || values.framingChip === 'spaces';
    // The candidate set is "unresolved" while it is still loading OR while its query
    // was skipped for a missing id (roleSetId / spaceId) — in that state the candidate
    // list is empty, so stripping would wrongly erase the whole custom selection.
    const candidatesUnresolved =
      isCollectionChip &&
      values.selectionMode === 'custom' &&
      (values.framingChip === 'contributors'
        ? contributorCandidatesLoading || !roleSetId
        : subspaceCandidatesLoading || !spaceId);

    const eligibleSelectedIds = (() => {
      if (values.selectionMode !== 'custom') return values.selectedIds;
      // Skip the strip while the candidate set is unresolved.
      if (candidatesUnresolved) return values.selectedIds;
      if (values.framingChip === 'contributors') {
        const chips = resolveContributorChips(values.selectedIds);
        return omitIneligibleIds(values.selectedIds, chips);
      }
      if (values.framingChip === 'spaces') {
        const candidateIds = new Set(subspaceCandidates.map(c => c.id));
        return values.selectedIds.filter(id => candidateIds.has(id));
      }
      return values.selectedIds;
    })();
    const valuesForUpdate =
      eligibleSelectedIds !== values.selectedIds ? { ...values, selectedIds: eligibleSelectedIds } : values;

    const { input, whiteboardPreviewImages } = mapFormToCalloutUpdateInput(valuesForUpdate, { calloutId });

    let result: Awaited<ReturnType<typeof updateCalloutContent>>;
    try {
      // A selection/framing change alters the rendered callout view + its collection,
      // whose data comes from separate queries; refetch the callout details and the
      // collection queries (and wait) so the view reflects the save in-session instead
      // of only after a reload.
      const collectionRefetch =
        input.framing?.type === CalloutFramingType.Contributors
          ? ['ContributorCollectionConfig', 'ContributorCollectionByType']
          : input.framing?.type === CalloutFramingType.Spaces
            ? ['SpaceCollectionSubspaces']
            : [];
      result = await updateCalloutContent({
        variables: { calloutData: input },
        refetchQueries: ['CalloutsSetTags', 'CalloutDetails', ...collectionRefetch],
        awaitRefetchQueries: collectionRefetch.length > 0,
      });
    } catch (err) {
      logError(new Error('Callout update mutation failed', { cause: err as Error }));
      // Surface the failure so the admin knows the save did not go through (T005
      // mid-race rejection recovery / spec Edge Case 'Concurrent churn').
      notify(t('callout.updateFailed'), 'error');
      // Reload membership/subspace data so any concurrent change (e.g. a member
      // who left between load and save) is reflected.  On the next save attempt
      // the updated candidate set will strip the now-departed entry and the re-
      // save can succeed (corr-client-2 / T005 concurrent-churn recovery).
      if (values.selectionMode === 'custom') {
        if (values.framingChip === 'contributors') {
          refetchContributorCandidates();
        } else if (values.framingChip === 'spaces') {
          void refetchSubspaceCandidates();
        }
      }
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

  const discardWhiteboardDrafts = async () => {
    const [framingDiscarded, defaultDiscarded] = await Promise.all([
      framingWhiteboardDraft.discard(),
      defaultWhiteboardDraft.discard(),
    ]);
    return framingDiscarded && defaultDiscarded;
  };

  const requestClose = (nextOpen: boolean) => {
    if (nextOpen) {
      onOpenChange(true);
      return;
    }
    if (dirty && !submitting) {
      setDiscardOpen(true);
      return;
    }
    void discardWhiteboardDrafts().then(discarded => {
      if (!discarded) return;
      reset();
      onOpenChange(false);
    });
  };

  const handleDiscardConfirm = async () => {
    const discarded = await discardWhiteboardDrafts();
    if (!discarded) return;
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
          maxLength: SMALL_TEXT_LENGTH,
          counterThreshold: TITLE_COUNTER_THRESHOLD,
        }}
        descriptionSlot={
          <MarkdownEditor
            value={values.description}
            onChange={v => setField('description', v)}
            placeholder={t('forms.descriptionPlaceholder')}
            onImageUpload={disableRichMedia ? undefined : editorMarkdownUpload.onImageUpload}
            iframeAllowedUrls={editorMarkdownUpload.iframeAllowedUrls}
            onError={editorMarkdownUpload.onError}
            hideImageOptions={disableRichMedia}
          />
        }
        framingZoneSlot={
          hideFramingZone ? undefined : (
            <div className="space-y-4">
              <FramingChipStrip
                value={values.framingChip}
                allowedChips={framingAllowList}
                onChange={chip => {
                  // In edit mode the strip only ever emits `'none'` (clearing the
                  // framing, after the confirmation dialog); type-switching is
                  // disabled. In create mode any chip can fire.
                  // When switching framing AWAY from 'document', clear any staged
                  // upload so the file does not persist invisibly under another
                  // framing type (Edge Case in spec.md).
                  if (chip !== 'document' && values.framingChip === 'document') {
                    setField('collaboraUploadFile', null);
                    setCollaboraImportError(null);
                  }
                  if (chip !== 'whiteboard' && values.framingChip === 'whiteboard') {
                    void framingWhiteboardDraft.discard();
                  }
                  setField('framingChip', chip);
                }}
                editMode={mode === 'edit'}
                disabledChips={disabledChips}
              />
              <FramingEditorConnector
                mode={mode}
                editMemoId={values.editMeta?.memoId}
                editWhiteboard={mode === 'edit' ? editCallout?.framing.whiteboard : undefined}
                editWhiteboardShareUrl={mode === 'edit' ? editCallout?.framing.profile.url : undefined}
                editCollaboraDocumentId={mode === 'edit' ? editCallout?.framing.collaboraDocument?.id : undefined}
                editCollaboraDocumentDisplayName={
                  mode === 'edit' ? editCallout?.framing.collaboraDocument?.profile?.displayName : undefined
                }
                collaboraRename={editCollaboraDocument ? collaboraRename : undefined}
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
                // Only an existing poll has a status to toggle — a poll being created is
                // always open, so the toggle stays hidden until there is a `pollId`.
                pollStatus={pollStatus === PollStatus.Closed ? 'closed' : pollId ? 'open' : undefined}
                onPollStatusChange={handlePollStatusChange}
                whiteboardConfigured={values.whiteboardConfigured}
                whiteboardTitle={values.title.trim() || t('callout.whiteboard')}
                whiteboardDraft={framingWhiteboardDraft}
                whiteboardPreviewImages={values.whiteboardPreviewImages}
                whiteboardPreviewServerUrl={values.whiteboardPreviewServerUrl}
                memoMarkdown={values.memoMarkdown}
                onMemoMarkdownChange={v => setField('memoMarkdown', v)}
                memoUpload={editorMarkdownUpload}
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
                contributorCollection={values.contributorCollection}
                onContributorCollectionChange={v =>
                  setField(
                    'contributorCollection',
                    // Preserve the current mapView when the CRD type-config field
                    // changes (it only emits types/defaultType/defaultView — the
                    // capture control handles mapView separately).
                    healContributorCollection({ ...v, mapView: values.contributorCollection.mapView })
                  )
                }
                contributorCollectionError={errors.contributorCollection}
                selectionMode={values.selectionMode}
                onSelectionModeChange={next => setField('selectionMode', next)}
                selectedIds={values.selectedIds}
                onSelectedIdsChange={ids => setField('selectedIds', ids)}
                contributorCandidates={contributorCandidates}
                resolveContributorChips={resolveContributorChips}
                contributorCandidatesLoading={contributorCandidatesLoading}
                subspaceCandidates={subspaceCandidates}
                subspaceCandidatesLoading={subspaceCandidatesLoading}
                contributorMapPins={contributorMapPins}
                contributorMapView={values.contributorCollection.mapView}
                onContributorMapViewChange={view =>
                  setField('contributorCollection', {
                    ...values.contributorCollection,
                    mapView: view,
                  })
                }
              />
            </div>
          )
        }
        responsesZoneSlot={
          <div className="space-y-4">
            <ResponseTypeChipStrip
              value={values.responseType}
              allowedChips={responseAllowList}
              disabledChips={responseDisabledChips}
              onChange={type => {
                // Locked in edit mode (see framing strip) — only fires during
                // create, so the response type can't be changed or cleared on
                // an existing callout. Picking a real response type also leaves
                // the Tasks board (they are mutually exclusive selections).
                setValues(prev => ({ ...prev, responseType: type, taskBoard: false }));
              }}
              // Tasks is a sibling chip of the response types (create only), not a
              // separate switch. Selecting it makes the callout a POST-only board;
              // it seeds responseType='post' so the Posts config panel (members /
              // admins / comments / defaults) renders. Deselecting clears both.
              // A Tasks board is post-based (selecting it seeds responseType='post'),
              // so only offer it when posts are actually allowed by the response
              // restrictions — otherwise it would create a post board the
              // restriction forbids.
              showTasksChip={
                mode === 'create' && isTaskBoardEnabled() && (!responseAllowList || responseAllowList.includes('post'))
              }
              tasksActive={values.taskBoard}
              tasksLabel={tTaskBoard('create.option')}
              onSelectTasks={() =>
                setValues(prev =>
                  prev.taskBoard
                    ? { ...prev, taskBoard: false, responseType: 'none' }
                    : { ...prev, taskBoard: true, responseType: 'post' }
                )
              }
              locked={mode === 'edit'}
            />
            <ResponsePanel
              type={values.responseType}
              allowedActors={values.allowedActors}
              onAllowedActorsChange={v => setField('allowedActors', v)}
              contributionCommentsEnabled={values.contributionCommentsEnabled}
              onContributionCommentsEnabledChange={v => setField('contributionCommentsEnabled', v)}
              showContributionComments={showContributionComments}
              prePopulateLinkRows={mode === 'create' ? values.prePopulateLinkRows : undefined}
              onPrePopulateLinkRowsChange={mode === 'create' ? v => setField('prePopulateLinkRows', v) : undefined}
              prePopulateLinkErrors={errors as Record<string, string | undefined>}
              prePopulateLinkFileUpload={referenceUpload.onFileUpload}
              prePopulateLinkUploadAccept={referenceUpload.accept}
              onSetDefaults={responseTypeSupportsDefaults ? () => setDefaultsOpen(true) : undefined}
              disabled={submitting}
            />
            {values.taskBoard && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setColumnsDraftOpen(true)}
                disabled={submitting}
              >
                <Columns3 className="w-4 h-4" aria-hidden="true" />
                {tTaskBoard('columns.manage')}
              </Button>
            )}
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
                minLength={2}
                formatTooShortErrorMessage={min => t('forms.tagsTooShort', { min })}
                icon={<Hash className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />}
              />
            </div>
            {showFramingComments && (
              <AllowCommentsField
                value={values.framingCommentsEnabled}
                onChange={v => setField('framingCommentsEnabled', v)}
                disabled={submitting}
              />
            )}
            <ReferencesEditor
              rows={values.referenceRows}
              onChange={rows => setField('referenceRows', rows)}
              errors={referenceRowErrors(errors)}
              disabled={submitting}
              onFileUpload={referenceUpload.onFileUpload}
              uploadAccept={referenceUpload.accept}
            />
          </div>
        }
        notifySwitchSlot={notifySwitch}
        onSubmit={mode === 'create' ? handlePublish : handleSaveEdit}
        onSaveDraft={mode === 'create' ? handleSaveDraft : undefined}
        onFindTemplate={mode === 'create' ? handleFindTemplate : undefined}
      />
      <DiscardChangesDialog open={discardOpen} onOpenChange={setDiscardOpen} onConfirm={handleDiscardConfirm} />
      <TaskColumnsDraftDialog
        open={columnsDraftOpen}
        onOpenChange={setColumnsDraftOpen}
        columns={values.taskBoardColumns}
        onSave={columns => setField('taskBoardColumns', columns)}
      />
      <ResponseDefaultsConnector
        open={defaultsOpen}
        onOpenChange={setDefaultsOpen}
        type={values.responseType}
        spaceId={space.levelZeroSpaceId}
        values={values.contributionDefaults}
        onSave={next => setField('contributionDefaults', next)}
        whiteboardDraft={mode === 'create' ? defaultWhiteboardDraft : undefined}
        markdownUpload={editorMarkdownUpload}
      />
      {mode === 'create' && (
        <TemplateImportConnector
          open={importTemplateOpen}
          onOpenChange={setImportTemplateOpen}
          isFormDirty={dirty}
          onTemplateSelected={values => prefill(clampFormValuesToRestrictions(values, restrictions))}
        />
      )}
    </>
  );
}
