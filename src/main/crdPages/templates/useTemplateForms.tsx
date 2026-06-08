import type { ReactNode } from 'react';
import { useEffect, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCreateReferenceOnProfileMutation,
  useCreateTemplateFromSpaceMutation,
  useCreateTemplateMutation,
  useDeleteReferenceMutation,
  useSpaceTemplateContentLazyQuery,
  useUpdateCalloutTemplateMutation,
  useUpdateCommunityGuidelinesMutation,
  useUpdateTemplateFromSpaceMutation,
  useUpdateTemplateMutation,
  useUrlResolverLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  type CreateProfileInput,
  type CreateReferenceInput,
  TemplateType as GqlTemplateType,
  UrlType,
} from '@/core/apollo/generated/graphql-schema';
import { CommunityGuidelinesTemplateForm } from '@/crd/components/templates/forms/CommunityGuidelinesTemplateForm';
import { PostTemplateForm } from '@/crd/components/templates/forms/PostTemplateForm';
import { SpaceTemplateForm } from '@/crd/components/templates/forms/SpaceTemplateForm';
import type {
  ReferenceRow,
  TemplateCommonValues,
  TemplateContent,
  TemplateFormErrors,
  TemplateFormValues,
  TemplateType,
} from '@/crd/components/templates/types';
import type { MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';
import { ensureHttps } from '@/crd/lib/ensureHttps';
import useUploadMediaGalleryVisuals from '@/domain/collaboration/mediaGallery/useUploadMediaGalleryVisuals';
import useUploadWhiteboardVisuals from '@/domain/collaboration/whiteboard/WhiteboardVisuals/useUploadWhiteboardVisuals';
import type { WhiteboardPreviewImage } from '@/domain/collaboration/whiteboard/WhiteboardVisuals/WhiteboardPreviewImagesModels';
import useHandlePreviewImages from '@/domain/templates/utils/useHandlePreviewImages';
import {
  type CalloutFormValues,
  EMPTY_CALLOUT_FORM_VALUES,
  useCrdCalloutForm,
} from '@/main/crdPages/space/hooks/useCrdCalloutForm';
import { CalloutTemplateForm } from './CalloutTemplateForm';
import {
  type CalloutTemplateMapperFallbacks,
  calloutFormValuesToCreateCalloutInput,
  calloutFormValuesToUpdateCalloutEntityInput,
} from './calloutTemplateMapper';
import { mapSpaceContentFromSpace } from './templateContentMapper';
import { WhiteboardTemplateFormConnector } from './WhiteboardTemplateFormConnector';

// ---------------------------------------------------------------------------
// Empty per-type values
// ---------------------------------------------------------------------------

const EMPTY_COMMON: TemplateCommonValues = { name: '', description: '', tags: [] };

function emptyValuesFor(type: TemplateType): TemplateFormValues {
  switch (type) {
    case 'post':
      return { ...EMPTY_COMMON, type: 'post', defaultDescription: '' };
    case 'whiteboard':
      return { ...EMPTY_COMMON, type: 'whiteboard', whiteboardContent: '' };
    case 'communityGuidelines':
      return { ...EMPTY_COMMON, type: 'communityGuidelines', title: '', guidelinesMarkdown: '', references: [] };
    case 'space':
      return { ...EMPTY_COMMON, type: 'space', recursive: true };
    case 'callout':
      return {
        ...EMPTY_COMMON,
        type: 'callout',
        framingKind: 'none',
        framingTitle: '',
        framingDescription: '',
        allowedContributionTypes: [],
        commentsEnabled: true,
      };
  }
}

// ---------------------------------------------------------------------------
// CRD form values → generated create-mutation inputs (no loose casts)
// ---------------------------------------------------------------------------

function toReferencesData(rows: ReferenceRow[]): CreateReferenceInput[] | undefined {
  if (rows.length === 0) return undefined;
  return rows.map((r, i) => ({
    name: r.name || `Reference ${i + 1}`,
    uri: r.uri || undefined,
    description: r.description || undefined,
  }));
}

function toProfileData(values: TemplateFormValues): CreateProfileInput {
  return { displayName: values.name, description: values.description || undefined };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Image-upload wiring for the per-type template description editors, keyed by
 * form intent. Templates have no storage bucket while being **created** (the
 * server GCs abandoned uploads → `temporaryLocation: true`); an **edited**
 * template uploads against the ambient holder bucket (`temporaryLocation:
 * false`) — mirrors MUI. Passed in by the callsites that sit under a
 * `StorageConfigContextProvider`; left undefined by read-only / test callers so
 * `useTemplateForms` stays provider-agnostic (no throwing hook deep in a hook
 * used by the public profile page + unit tests).
 */
export type TemplateMarkdownUploadByIntent = {
  create?: MarkdownUploadProps;
  edit?: MarkdownUploadProps;
};

/**
 * References paperclip file-upload for the CG template form (D24). Unlike the markdown upload it is
 * not split by intent: `useReferenceFileUpload` always uploads with `temporaryLocation: true` to the
 * holder bucket, so the same callback serves both create (file lands temporarily until the template
 * exists) and edit. Passed in by the provider-wrapped callsites; left undefined by read-only / test
 * callers so `useTemplateForms` stays provider-agnostic.
 */
export type TemplateReferenceUpload = {
  onFileUpload?: (file: File) => Promise<string | null>;
  accept?: string;
};

export type UseTemplateFormsArgs = {
  templatesSetId: string | undefined;
  /** Parent space id — threaded through the Callout template form's `ResponseDefaultsConnector`. */
  spaceId?: string;
  /** Called after a successful create/update so the consumer can refetch / react. */
  onSaved?: () => void;
  /** Markdown image-upload wiring per intent. Optional — see {@link TemplateMarkdownUploadByIntent}. */
  markdownUpload?: TemplateMarkdownUploadByIntent;
  /** References paperclip file-upload (CG template form). Optional — see {@link TemplateReferenceUpload}. */
  referenceUpload?: TemplateReferenceUpload;
};

export type UseTemplateFormsResult = {
  open: boolean;
  intent: 'create' | 'edit';
  type: TemplateType;
  commonValue: TemplateCommonValues;
  commonErrors: TemplateFormErrors;
  onCommonChange: (next: TemplateCommonValues) => void;
  perTypeFormSlot: ReactNode;
  submitting: boolean;
  isDirty: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  /** Open the create dialog for a type (blank values). Callout delegates to `openCreateCallout()`. */
  openCreate: (type: TemplateType) => void;
  /** Open the create dialog pre-filled (used by the "save X as a template" flows). Not for callout — use `openCreateCallout`. */
  openCreatePrefilled: (values: TemplateFormValues) => void;
  /**
   * Open the edit dialog for an existing template, pre-filled. `subEntityId` is the id of the per-type
   * sub-entity that has its own update mutation (the CommunityGuidelines id for a CG template; unused otherwise).
   * `tagsetId` is the id of the template profile's `defaultTagset` — required to update tags on save
   * (`UpdateProfileInput` carries tags via a `tagsets: UpdateTagsetInput[]` array, not a top-level field).
   * `cgContext` (CG-only) carries the CG entity's profile id and the original reference id snapshot —
   * needed so add/remove references on save can route to `createReferenceOnProfile` / `deleteReference`
   * (the CG update mutation only updates existing references by id).
   * Not for callout — use `openEditCallout`.
   */
  openEdit: (
    templateId: string,
    values: TemplateFormValues,
    subEntityId?: string,
    tagsetId?: string,
    cgContext?: { profileId: string; originalReferenceIds: string[] },
    /**
     * Space-template only: the captured-structure preview, pre-mapped from the template's own
     * `contentSpace`. Seeded directly (no live-space fetch) because a `contentSpace` id is not a
     * real `Space` and can't be resolved via the `SpaceTemplateContent` query.
     */
    spacePreview?: Extract<TemplateContent, { type: 'space' }>
  ) => void;
  /**
   * Fire the create mutation directly for an arbitrary values object (used by duplicate / import-from-library).
   * Not validated, not wrapped in a transition — the caller owns the spinner. Rejects on failure. Not for callout.
   */
  submitValues: (values: TemplateFormValues) => Promise<void>;
  // ── Callout-specific (the callout body lives in a dedicated `useCrdCalloutForm` instance) ──
  /** Open the create dialog for a Callout template, optionally pre-filled (used by Duplicate and "save callout as template"). */
  openCreateCallout: (prefill?: { common?: Partial<TemplateCommonValues>; body?: Partial<CalloutFormValues> }) => void;
  /**
   * Open the edit dialog for an existing Callout template. `calloutId` is the template's underlying `Callout` id.
   * `tagsetId` is the template profile's `defaultTagset` id — required to update template-level tags on save.
   */
  openEditCallout: (
    templateId: string,
    calloutId: string,
    common: Partial<TemplateCommonValues>,
    body: Partial<CalloutFormValues>,
    tagsetId?: string
  ) => void;
  /** Fire the create-callout-template mutation directly (used by Duplicate / import-from-library). Rejects on failure. */
  submitCalloutCopy: (common: Partial<TemplateCommonValues>, body: Partial<CalloutFormValues>) => Promise<void>;
};

/**
 * Per-type template-form lifecycle (integration layer). Owns the form state, validation, and the
 * create/edit mutations; assembles the `perTypeFormSlot` and hands it to `TemplateFormDialog`.
 *
 * Post / Community Guidelines / Whiteboard / Space carry their values in `TemplateFormValues`; the
 * **Callout** body is large and reuses the live callout-authoring stack, so it lives in a dedicated
 * `useCrdCalloutForm` instance (rendered via `CalloutTemplateForm`). Space edit is profile-only
 * (re-capture isn't wired); CG edit can't add new references via that mutation (existing rows only).
 */
export function useTemplateForms({
  templatesSetId,
  spaceId,
  onSaved,
  markdownUpload,
  referenceUpload,
}: UseTemplateFormsArgs): UseTemplateFormsResult {
  const { t } = useTranslation('crd-templates');
  const { t: tSpace } = useTranslation('crd-space');
  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState<'create' | 'edit'>('create');
  const [editTemplateId, setEditTemplateId] = useState<string | null>(null);
  const [editSubEntityId, setEditSubEntityId] = useState<string | null>(null);
  const [editCalloutId, setEditCalloutId] = useState<string | null>(null);
  /**
   * Id of the template's `profile.defaultTagset`, captured when opening the edit dialog. Used to
   * build `UpdateProfileInput.tagsets` on submit — the only path to update a template's tags via
   * `updateTemplate` (`UpdateProfileInput` has no top-level `tags` field; tags live on a tagset).
   */
  const [editTagsetId, setEditTagsetId] = useState<string | null>(null);
  /**
   * Community Guidelines edit context, captured when opening the edit dialog for a CG template.
   * The `updateCommunityGuidelines` mutation only updates *existing* references (by `ID`); adding
   * and removing references requires `createReferenceOnProfile` and `deleteReference` against the
   * CG entity's own profile id — so we snapshot the profile id + the original reference id set at
   * open time and replay the diff against `current.references` on submit.
   */
  const [editCgProfileId, setEditCgProfileId] = useState<string | null>(null);
  const [editOriginalCgReferenceIds, setEditOriginalCgReferenceIds] = useState<string[]>([]);
  const [values, setValues] = useState<TemplateFormValues>(() => emptyValuesFor('post'));
  const [errors, setErrors] = useState<TemplateFormErrors>({});
  const [pristine, setPristine] = useState(true);
  const [submitting, startSubmitting] = useTransition();
  const calloutForm = useCrdCalloutForm();
  // Preview screenshots the whiteboard editor generated on save (Whiteboard templates) — uploaded against
  // the template's profile visuals after the create/update mutation so the screenshot becomes the card image.
  const [whiteboardTemplatePreviewImages, setWhiteboardTemplatePreviewImages] = useState<WhiteboardPreviewImage[]>([]);
  const { handlePreviewTemplates } = useHandlePreviewImages();

  // Space-template URL-paste source picker (mirrors legacy MUI `SpaceContentFromSpaceUrlForm`):
  // the user pastes a space URL, clicks "Use this space" → resolve URL → fetch space content →
  // check Update privilege → commit the resolved space id + display details into the form value.
  const [spaceSourceUrl, setSpaceSourceUrl] = useState('');
  const [spaceSourceUrlError, setSpaceSourceUrlError] = useState<string | undefined>(undefined);
  const [spaceSourceResolving, setSpaceSourceResolving] = useState(false);
  const [spaceSourceDisplayName, setSpaceSourceDisplayName] = useState<string | undefined>(undefined);
  const [spaceSourceAvatarUrl, setSpaceSourceAvatarUrl] = useState<string | undefined>(undefined);
  // Read-only preview of the structure that will be captured from the resolved source space
  // (innovation-flow phases, starter callouts, nested subspaces) — mirrors the legacy MUI
  // `TemplateContentSpacePreview`. Populated alongside displayName/avatar whenever a source is
  // resolved (URL paste) or pre-filled (save-a-subspace-as-template).
  const [spaceCapturedStructure, setSpaceCapturedStructure] = useState<
    Extract<TemplateContent, { type: 'space' }> | undefined
  >(undefined);
  // The Space template's `sourceSpaceId` at edit-open time — used on submit to decide whether to
  // re-capture content from a new source (`updateTemplateFromSpace`) or just update the profile.
  const [spaceSourceInitialSpaceId, setSpaceSourceInitialSpaceId] = useState<string | undefined>(undefined);

  const [createTemplate] = useCreateTemplateMutation({ refetchQueries: ['AllTemplatesInTemplatesSet'] });
  const [createTemplateFromSpace] = useCreateTemplateFromSpaceMutation({
    refetchQueries: ['AllTemplatesInTemplatesSet'],
  });
  const [updateTemplate] = useUpdateTemplateMutation({ refetchQueries: ['AllTemplatesInTemplatesSet'] });
  const [updateTemplateFromSpace] = useUpdateTemplateFromSpaceMutation({
    refetchQueries: ['AllTemplatesInTemplatesSet'],
  });
  const [updateCalloutTemplate] = useUpdateCalloutTemplateMutation({ refetchQueries: ['AllTemplatesInTemplatesSet'] });
  // D17, 2026-05-18 — Callout templates with whiteboard framing need a post-mutation upload step
  // to persist the inline-editor's preview blobs against the whiteboard's `WHITEBOARD_PREVIEW`
  // Visual; without it the server stores updated content but the preview image stays stale.
  // Mirrors the live callout connector (`CalloutFormConnector` create/edit paths).
  const { uploadVisuals: uploadWhiteboardVisuals } = useUploadWhiteboardVisuals();
  // Callout templates with media-gallery framing need a post-create upload step to re-store the
  // source gallery's images against the freshly-created MediaGallery entity — the create mutation
  // only stamps the framing type and returns the gallery id. Mirrors the live callout connector
  // (`CalloutFormConnector` media-gallery post-create path).
  const { uploadMediaGalleryVisuals } = useUploadMediaGalleryVisuals();
  const [updateCommunityGuidelines] = useUpdateCommunityGuidelinesMutation({
    refetchQueries: ['AllTemplatesInTemplatesSet'],
  });
  // CG reference add/remove — the legacy editor fires these immediately at user-interaction time,
  // but our CRD form batches them on save; the trailing `updateCommunityGuidelines.refetchQueries`
  // is what ultimately repopulates the cache so per-call refetches aren't needed here.
  const [createReferenceOnProfile] = useCreateReferenceOnProfileMutation();
  const [deleteReference] = useDeleteReferenceMutation();
  const [resolveUrl] = useUrlResolverLazyQuery();
  const [fetchSpaceContent] = useSpaceTemplateContentLazyQuery();

  const calloutFallbacks: CalloutTemplateMapperFallbacks = {
    whiteboardFallbackDisplayName: tSpace('callout.whiteboard'),
    collaboraFallbackDisplayName: tSpace('callout.defaultDocumentName'),
  };

  const commonValue: TemplateCommonValues = {
    name: values.name,
    description: values.description,
    tags: values.tags,
  };
  const onCommonChange = (next: TemplateCommonValues) => {
    setPristine(false);
    setValues(prev => ({ ...prev, ...next }));
  };
  const onPerTypeChange = (next: TemplateFormValues) => {
    setPristine(false);
    setValues(next);
  };

  const resetSpaceSourceState = () => {
    setSpaceSourceUrl('');
    setSpaceSourceUrlError(undefined);
    setSpaceSourceResolving(false);
    setSpaceSourceDisplayName(undefined);
    setSpaceSourceAvatarUrl(undefined);
    setSpaceCapturedStructure(undefined);
    setSpaceSourceInitialSpaceId(undefined);
  };

  const reset = (type: TemplateType, initial?: TemplateFormValues) => {
    setIntent('create');
    setEditTemplateId(null);
    setEditSubEntityId(null);
    setEditCalloutId(null);
    setEditTagsetId(null);
    setEditCgProfileId(null);
    setEditOriginalCgReferenceIds([]);
    setValues(initial ?? emptyValuesFor(type));
    setErrors({});
    setPristine(true);
    setWhiteboardTemplatePreviewImages([]);
    resetSpaceSourceState();
    if (initial && initial.type === 'space') setSpaceSourceInitialSpaceId(initial.sourceSpaceId);
    setOpen(true);
  };
  const openEdit = (
    templateId: string,
    initial: TemplateFormValues,
    subEntityId?: string,
    tagsetId?: string,
    cgContext?: { profileId: string; originalReferenceIds: string[] },
    spacePreview?: Extract<TemplateContent, { type: 'space' }>
  ) => {
    setIntent('edit');
    setEditTemplateId(templateId);
    setEditSubEntityId(subEntityId ?? null);
    setEditCalloutId(null);
    setEditTagsetId(tagsetId ?? null);
    setEditCgProfileId(cgContext?.profileId ?? null);
    setEditOriginalCgReferenceIds(cgContext?.originalReferenceIds ?? []);
    setValues(initial);
    setErrors({});
    setPristine(true);
    setWhiteboardTemplatePreviewImages([]);
    resetSpaceSourceState();
    if (initial.type === 'space') {
      setSpaceSourceInitialSpaceId(initial.sourceSpaceId);
      // Seed the captured-structure preview from the template's own contentSpace — no live-space
      // fetch (the back-fill effect only runs when `sourceSpaceId` is a real space, e.g. after the
      // user re-selects a source via the URL picker).
      if (spacePreview) setSpaceCapturedStructure(spacePreview);
    }
    setOpen(true);
  };
  const openCreateCallout: UseTemplateFormsResult['openCreateCallout'] = prefill => {
    setIntent('create');
    setEditTemplateId(null);
    setEditSubEntityId(null);
    setEditCalloutId(null);
    setEditTagsetId(null);
    setValues({ ...emptyValuesFor('callout'), ...prefill?.common });
    if (prefill?.body) calloutForm.prefill(prefill.body);
    else calloutForm.reset();
    setErrors({});
    setPristine(true);
    setOpen(true);
  };
  const openEditCallout: UseTemplateFormsResult['openEditCallout'] = (
    templateId,
    calloutId,
    common,
    body,
    tagsetId
  ) => {
    setIntent('edit');
    setEditTemplateId(templateId);
    setEditSubEntityId(null);
    setEditCalloutId(calloutId);
    setEditTagsetId(tagsetId ?? null);
    setValues({ ...emptyValuesFor('callout'), ...common });
    calloutForm.prefill(body);
    setErrors({});
    setPristine(true);
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    setErrors({});
    setWhiteboardTemplatePreviewImages([]);
    setEditTagsetId(null);
    setEditCgProfileId(null);
    setEditOriginalCgReferenceIds([]);
    resetSpaceSourceState();
  };

  /**
   * URL-paste source picker — mirrors legacy MUI `SpaceContentFromSpaceUrlForm`:
   * (1) resolve the pasted URL → must be a Space type, (2) fetch space content + display details,
   * (3) require Update privilege on the resolved space, then commit `sourceSpaceId` into the form.
   */
  const onSpaceUrlChange = (next: string) => {
    setSpaceSourceUrl(next);
    if (spaceSourceUrlError) setSpaceSourceUrlError(undefined);
  };
  const onUseSpaceUrl = async () => {
    setSpaceSourceUrlError(undefined);
    const trimmed = spaceSourceUrl.trim();
    if (!trimmed) {
      setSpaceSourceUrlError(t('form.space.urlLoader.errors.required'));
      return;
    }
    setSpaceSourceResolving(true);
    try {
      const { data, error } = await resolveUrl({ variables: { url: trimmed } });
      if (error) {
        setSpaceSourceUrlError(error.message);
        return;
      }
      if (data?.urlResolver.type !== UrlType.Space) {
        setSpaceSourceUrlError(t('form.space.urlLoader.errors.invalidUrl'));
        return;
      }
      const resolvedSpaceId = data.urlResolver.space?.id;
      if (!resolvedSpaceId) {
        setSpaceSourceUrlError(t('form.space.urlLoader.errors.notFound'));
        return;
      }
      const { data: contentData, error: contentError } = await fetchSpaceContent({
        variables: { spaceId: resolvedSpaceId },
      });
      if (contentError) {
        setSpaceSourceUrlError(contentError.message);
        return;
      }
      const space = contentData?.lookup.space;
      const privileges = space?.authorization?.myPrivileges ?? [];
      if (!privileges.includes(AuthorizationPrivilege.Update)) {
        setSpaceSourceUrlError(t('form.space.urlLoader.errors.noRights'));
        return;
      }
      setSpaceSourceDisplayName(space?.about?.profile?.displayName);
      setSpaceSourceAvatarUrl(space?.about?.profile?.avatar?.uri);
      setSpaceCapturedStructure(space ? mapSpaceContentFromSpace(space) : undefined);
      setValues(prev => (prev.type === 'space' ? { ...prev, sourceSpaceId: resolvedSpaceId } : prev));
      setPristine(false);
      setSpaceSourceUrl('');
    } finally {
      setSpaceSourceResolving(false);
    }
  };

  // Back-fill the displayName / avatarUrl / captured-structure preview of an already-resolved source
  // space when the dialog opens with a pre-set source — both on edit-open and on the "save a subspace
  // as a template" create flow (the URL-paste flow sets these directly in `onUseSpaceUrl`).
  const editingSpaceSourceSpaceId = values.type === 'space' ? values.sourceSpaceId : undefined;
  useEffect(() => {
    if (!open) return;
    if (!editingSpaceSourceSpaceId) return;
    if (spaceSourceDisplayName !== undefined) return;
    let cancelled = false;
    void fetchSpaceContent({ variables: { spaceId: editingSpaceSourceSpaceId } }).then(({ data }) => {
      if (cancelled) return;
      const space = data?.lookup.space;
      if (!space) return;
      setSpaceSourceDisplayName(space.about?.profile?.displayName);
      setSpaceSourceAvatarUrl(space.about?.profile?.avatar?.uri);
      setSpaceCapturedStructure(mapSpaceContentFromSpace(space));
    });
    return () => {
      cancelled = true;
    };
  }, [open, editingSpaceSourceSpaceId, spaceSourceDisplayName, fetchSpaceContent]);

  /**
   * D17, 2026-05-18 — post-save upload of the inline-editor's whiteboard preview blobs against the
   * whiteboard's `WHITEBOARD_PREVIEW` Visual. Mirrors `CalloutFormConnector`'s live-callout step.
   * Reads `previewVisual.id` from the mutation result (both `CreateTemplate` and
   * `UpdateCalloutTemplate` already return it as an alias of `visual(type: WHITEBOARD_PREVIEW)`).
   * No-op when (a) the framing isn't a whiteboard, (b) no fresh in-form blobs exist, or
   * (c) the response didn't surface a preview Visual id.
   */
  type WhiteboardUploadHandle =
    | {
        nameID?: string;
        profile?: { previewVisual?: { id: string } | null | undefined } | null | undefined;
      }
    | null
    | undefined;
  const uploadCalloutWhiteboardPreview = async (cv: CalloutFormValues, whiteboard: WhiteboardUploadHandle) => {
    if (cv.framingChip !== 'whiteboard') return;
    if (!cv.whiteboardPreviewImages || cv.whiteboardPreviewImages.length === 0) return;
    const previewVisualId = whiteboard?.profile?.previewVisual?.id;
    if (!previewVisualId) return;
    await uploadWhiteboardVisuals(cv.whiteboardPreviewImages, { previewVisualId }, whiteboard?.nameID);
  };

  /**
   * Post-create upload of a media-gallery callout's images onto the new template's MediaGallery.
   * The create mutation only sets the framing type and returns the gallery id — the visuals must be
   * re-stored separately. `reuploadVisuals` makes the helper fetch each source visual by `uri` and
   * recreate it on the template gallery (the form values carry `id`/`uri` but no `File`). Mirrors the
   * live callout connector. No-op when the framing isn't a media gallery, there are no visuals, or
   * the response didn't surface a gallery id.
   */
  const uploadCalloutMediaGallery = async (cv: CalloutFormValues, mediaGalleryId: string | undefined) => {
    if (cv.framingChip !== 'image') return;
    if (!mediaGalleryId || cv.mediaGalleryVisuals.length === 0) return;
    await uploadMediaGalleryVisuals({ mediaGalleryId, visuals: cv.mediaGalleryVisuals, reuploadVisuals: true });
  };

  const submitCreate = async (current: TemplateFormValues, setId: string) => {
    const profileData = toProfileData(current);
    const tags = current.tags.length > 0 ? current.tags : undefined;
    switch (current.type) {
      case 'post':
        await createTemplate({
          variables: {
            templatesSetId: setId,
            type: GqlTemplateType.Post,
            profileData,
            tags,
            postDefaultDescription: current.defaultDescription || undefined,
          },
        });
        return;
      case 'communityGuidelines':
        await createTemplate({
          variables: {
            templatesSetId: setId,
            type: GqlTemplateType.CommunityGuidelines,
            profileData,
            tags,
            communityGuidelinesData: {
              profile: {
                displayName: current.title,
                description: current.guidelinesMarkdown || undefined,
                referencesData: toReferencesData(current.references),
              },
            },
          },
        });
        return;
      case 'whiteboard': {
        const wantsPreview = whiteboardTemplatePreviewImages.length > 0;
        const result = await createTemplate({
          variables: {
            templatesSetId: setId,
            type: GqlTemplateType.Whiteboard,
            profileData,
            tags,
            whiteboard: { content: current.whiteboardContent || undefined, profile: { displayName: current.name } },
            includeProfileVisuals: wantsPreview,
          },
        });
        if (wantsPreview && result.data?.createTemplate) {
          await handlePreviewTemplates(whiteboardTemplatePreviewImages, result.data.createTemplate);
        }
        return;
      }
      case 'space':
        if (!current.sourceSpaceId) throw new Error('A source space is required to create a Space template');
        await createTemplateFromSpace({
          variables: {
            templatesSetId: setId,
            spaceId: current.sourceSpaceId,
            profileData,
            tags,
            recursive: current.recursive,
          },
        });
        return;
      case 'callout': {
        const calloutData = calloutFormValuesToCreateCalloutInput(calloutForm.values, calloutFallbacks);
        const result = await createTemplate({
          variables: { templatesSetId: setId, type: GqlTemplateType.Callout, profileData, tags, calloutData },
        });
        // Best-effort post-create uploads: the template already exists, so an upload failure must not
        // bubble and keep the dialog open — that invites a retry and a duplicate template. Mirror the
        // copy path; upload errors surface via the Apollo error link / global handler.
        try {
          await uploadCalloutWhiteboardPreview(
            calloutForm.values,
            result.data?.createTemplate?.callout?.framing?.whiteboard
          );
        } catch {
          // Intentionally swallowed — see comment above.
        }
        try {
          await uploadCalloutMediaGallery(
            calloutForm.values,
            result.data?.createTemplate?.callout?.framing?.mediaGallery?.id
          );
        } catch {
          // Intentionally swallowed — see comment above.
        }
        return;
      }
    }
  };

  /** Fire the create-callout-template mutation directly for arbitrary common + body values (Duplicate / import). */
  const submitCalloutCopy = async (common: Partial<TemplateCommonValues>, body: Partial<CalloutFormValues>) => {
    if (!templatesSetId) throw new Error('No templates set');
    const merged: CalloutFormValues = { ...EMPTY_CALLOUT_FORM_VALUES, ...body };
    const calloutData = calloutFormValuesToCreateCalloutInput(merged, calloutFallbacks);
    const result = await createTemplate({
      variables: {
        templatesSetId,
        type: GqlTemplateType.Callout,
        profileData: { displayName: common.name ?? merged.title, description: common.description || undefined },
        tags: common.tags && common.tags.length > 0 ? common.tags : undefined,
        calloutData,
      },
    });
    // Carries the freshly-generated inline-editor blobs through when present (typical no-op for
    // Duplicate, but Save-As-from-an-edited-source can land here with non-empty blobs).
    try {
      await uploadCalloutWhiteboardPreview(merged, result.data?.createTemplate?.callout?.framing?.whiteboard);
      await uploadCalloutMediaGallery(merged, result.data?.createTemplate?.callout?.framing?.mediaGallery?.id);
    } catch {
      // Errors are surfaced by the Apollo error link / global handler; don't fail the copy after create.
    }
  };

  const submitEdit = async (
    current: TemplateFormValues,
    templateId: string,
    subEntityId: string | null,
    tagsetId: string | null,
    cgProfileId: string | null,
    cgOriginalReferenceIds: string[]
  ) => {
    // Template-level tags travel via `UpdateProfileInput.tagsets` (an `UpdateTagsetInput[]` keyed by
    // the existing tagset id). Without the id we can't update tags — log a quiet skip rather than
    // sending a no-op input the server would reject.
    const profile = {
      displayName: current.name,
      description: current.description || undefined,
      tagsets: tagsetId ? [{ ID: tagsetId, tags: current.tags }] : undefined,
    };
    switch (current.type) {
      case 'post':
        await updateTemplate({
          variables: { templateId, profile, postDefaultDescription: current.defaultDescription || undefined },
        });
        return;
      case 'whiteboard': {
        const wantsPreview = whiteboardTemplatePreviewImages.length > 0;
        const result = await updateTemplate({
          variables: {
            templateId,
            profile,
            whiteboardContent: current.whiteboardContent || undefined,
            includeProfileVisuals: wantsPreview,
          },
        });
        if (wantsPreview && result.data?.updateTemplate) {
          await handlePreviewTemplates(whiteboardTemplatePreviewImages, result.data.updateTemplate);
        }
        return;
      }
      case 'space':
        // Profile-only update by default. When the user re-selected a source via the URL-paste
        // picker after opening the dialog (sourceSpaceId differs from the initial), also fire
        // `updateTemplateFromSpace` to re-capture the structure from the newly chosen source.
        await updateTemplate({ variables: { templateId, profile } });
        if (current.sourceSpaceId && current.sourceSpaceId !== spaceSourceInitialSpaceId) {
          await updateTemplateFromSpace({
            variables: { templateId, spaceId: current.sourceSpaceId, recursive: current.recursive },
          });
        }
        return;
      case 'communityGuidelines': {
        await updateTemplate({ variables: { templateId, profile } });
        if (subEntityId) {
          // Diff the form state against the snapshot captured at edit-open time. The CG update
          // mutation can only *update existing* references (keyed by their `ID`); rows added in
          // the form (no `id`) go through `createReferenceOnProfile`, rows removed in the form
          // (id in snapshot but no longer present) go through `deleteReference`.
          const currentReferenceIds = new Set(current.references.flatMap((r): string[] => (r.id ? [r.id] : [])));
          const deletedIds = cgOriginalReferenceIds.filter(id => !currentReferenceIds.has(id));
          const newRows = current.references.filter(r => !r.id);

          if (deletedIds.length > 0) {
            await Promise.all(deletedIds.map(id => deleteReference({ variables: { input: { ID: id } } })));
          }
          if (cgProfileId && newRows.length > 0) {
            await Promise.all(
              newRows.map(r =>
                createReferenceOnProfile({
                  variables: {
                    input: {
                      profileID: cgProfileId,
                      name: r.name || 'Reference',
                      uri: r.uri || undefined,
                      description: r.description || undefined,
                    },
                  },
                })
              )
            );
          }

          await updateCommunityGuidelines({
            variables: {
              communityGuidelinesData: {
                communityGuidelinesID: subEntityId,
                profile: {
                  displayName: current.title,
                  description: current.guidelinesMarkdown || undefined,
                  // Existing references only; adds/removes were handled above.
                  references: current.references.flatMap(r =>
                    r.id
                      ? [{ ID: r.id, name: r.name, uri: r.uri || undefined, description: r.description || undefined }]
                      : []
                  ),
                },
              },
            },
          });
        }
        return;
      }
      case 'callout': {
        if (!editCalloutId) throw new Error('Missing callout id for Callout template edit');
        await updateTemplate({ variables: { templateId, profile } });

        // References live on the callout's framing profile. The callout update mutation can only
        // *update existing* references (keyed by `ID`); it neither creates rows added in the form
        // (no `id`) nor deletes rows removed in the form. Diff against the snapshot captured at
        // edit-open (editMeta) and route adds → `createReferenceOnProfile`, removes →
        // `deleteReference`, before the update — mirroring the communityGuidelines branch above.
        const { editMeta, referenceRows } = calloutForm.values;
        const framingProfileId = editMeta?.framingProfileId;
        const originalReferenceIds = editMeta?.originalReferenceIds ?? [];
        const currentReferenceIds = new Set(referenceRows.flatMap((r): string[] => (r.id ? [r.id] : [])));
        const deletedReferenceIds = originalReferenceIds.filter(id => !currentReferenceIds.has(id));
        const newReferenceRows = referenceRows.filter(
          r => !r.id && r.name.trim().length > 0 && r.uri.trim().length > 0
        );

        if (deletedReferenceIds.length > 0) {
          await Promise.all(deletedReferenceIds.map(id => deleteReference({ variables: { input: { ID: id } } })));
        }
        if (framingProfileId && newReferenceRows.length > 0) {
          await Promise.all(
            newReferenceRows.map(r =>
              createReferenceOnProfile({
                variables: {
                  input: {
                    profileID: framingProfileId,
                    name: r.name.trim() || 'Reference',
                    uri: ensureHttps(r.uri),
                    description: r.description?.trim() || undefined,
                  },
                },
              })
            )
          );
        }

        const result = await updateCalloutTemplate({
          variables: { calloutData: calloutFormValuesToUpdateCalloutEntityInput(calloutForm.values, editCalloutId) },
        });
        // D17, 2026-05-18 — persist the inline-editor's whiteboard preview blobs against the
        // whiteboard's `WHITEBOARD_PREVIEW` Visual; otherwise the server keeps the previous
        // image even though the content was updated.
        await uploadCalloutWhiteboardPreview(calloutForm.values, result.data?.updateCallout?.framing?.whiteboard);
        return;
      }
    }
  };

  const onSubmit = () => {
    if (!templatesSetId) return;
    const errs: TemplateFormErrors = {};
    if (!values.name.trim()) errs.name = t('form.common.nameRequired');
    // Description is mandatory for every template type — mirrors the legacy MUI `TemplateFormBase`,
    // where `profile.description` is a required field across all template forms.
    if (!values.description.trim()) errs.description = t('form.common.descriptionRequired');
    if (values.type === 'communityGuidelines' && !values.title.trim())
      errs.title = t('form.communityGuidelines.titleRequired');
    // A source space is only required when CREATING a space template (the structure must be captured
    // from somewhere). Editing is profile-only by default; re-capture is opt-in via the URL picker.
    if (intent === 'create' && values.type === 'space' && !values.sourceSpaceId)
      errs.sourceSpaceId = t('form.space.sourceRequired');
    setErrors(errs);
    const calloutErrors = values.type === 'callout' ? calloutForm.validate() : {};
    if (Object.keys(errs).length > 0 || Object.keys(calloutErrors).length > 0) return;
    const current = values;
    const setId = templatesSetId;
    const editId = editTemplateId;
    const subEntityId = editSubEntityId;
    const tagsetId = editTagsetId;
    const cgProfileId = editCgProfileId;
    const cgOriginalReferenceIds = editOriginalCgReferenceIds;
    startSubmitting(async () => {
      try {
        if (intent === 'edit' && editId) {
          await submitEdit(current, editId, subEntityId, tagsetId, cgProfileId, cgOriginalReferenceIds);
        } else {
          await submitCreate(current, setId);
        }
        close();
        onSaved?.();
      } catch {
        // surfaced by the Apollo error link / global handler; keep the dialog open
      }
    });
  };

  // Pick the upload wiring for the current intent (create → temporary bucket,
  // edit → holder bucket). `{}` when the callsite is provider-less (read-only
  // listing / tests) so the editor simply renders without the upload affordance.
  const markdownUploadProps: MarkdownUploadProps = markdownUpload?.[intent] ?? {};

  let perTypeFormSlot: ReactNode = null;
  switch (values.type) {
    case 'post':
      perTypeFormSlot = (
        <PostTemplateForm value={values} errors={errors} onChange={onPerTypeChange} {...markdownUploadProps} />
      );
      break;
    case 'communityGuidelines':
      perTypeFormSlot = (
        <CommunityGuidelinesTemplateForm
          value={values}
          errors={errors}
          onChange={onPerTypeChange}
          onReferenceFileUpload={referenceUpload?.onFileUpload}
          referenceUploadAccept={referenceUpload?.accept}
          {...markdownUploadProps}
        />
      );
      break;
    case 'whiteboard':
      perTypeFormSlot = (
        <WhiteboardTemplateFormConnector
          value={values}
          onChange={onPerTypeChange}
          onPreviewImagesChange={setWhiteboardTemplatePreviewImages}
          disabled={submitting}
        />
      );
      break;
    case 'space':
      perTypeFormSlot = (
        <SpaceTemplateForm
          value={values}
          errors={errors}
          onChange={onPerTypeChange}
          url={spaceSourceUrl}
          onUrlChange={onSpaceUrlChange}
          onUseUrl={() => void onUseSpaceUrl()}
          urlResolving={spaceSourceResolving}
          urlError={spaceSourceUrlError}
          sourceDisplayName={spaceSourceDisplayName}
          sourceAvatarUrl={spaceSourceAvatarUrl}
          capturedStructure={spaceCapturedStructure}
        />
      );
      break;
    case 'callout':
      perTypeFormSlot = (
        <CalloutTemplateForm
          form={calloutForm}
          spaceId={spaceId}
          disabled={submitting}
          onReferenceFileUpload={referenceUpload?.onFileUpload}
          referenceUploadAccept={referenceUpload?.accept}
          {...markdownUploadProps}
        />
      );
      break;
  }

  return {
    open,
    intent,
    type: values.type,
    commonValue,
    commonErrors: errors,
    onCommonChange,
    perTypeFormSlot,
    submitting,
    isDirty: !pristine || (values.type === 'callout' && calloutForm.dirty),
    onSubmit,
    onCancel: close,
    openCreate: type => (type === 'callout' ? openCreateCallout() : reset(type)),
    openCreatePrefilled: initial => reset(initial.type, initial),
    openEdit,
    submitValues: vals =>
      templatesSetId ? submitCreate(vals, templatesSetId) : Promise.reject(new Error('No templates set')),
    openCreateCallout,
    openEditCallout,
    submitCalloutCopy,
  };
}
