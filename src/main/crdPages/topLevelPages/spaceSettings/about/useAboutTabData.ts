import { ApolloError } from '@apollo/client';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { NotFoundError } from '@/core/40XErrorHandler/40XErrors';
import {
  useSpaceSettingsAboutQuery,
  useSpaceSettingsAddClassificationMutation,
  useSpaceSettingsAttachVisualMutation,
  useSpaceSettingsDeleteLinkMutation,
  useSpaceSettingsRemoveClassificationMutation,
  useSpaceSettingsRequestVisualUploadMutation,
  useSpaceSettingsUpdateAboutMutation,
  useSpaceSettingsUpdateClassificationMutation,
  useSpaceSettingsUpsertLinkMutation,
} from '@/core/apollo/generated-v2/apollo-hooks';
import type { UpdateAboutInput } from '@/core/apollo/generated-v2/graphql-schema';
import { NativeErrorCode } from '@/core/apollo/hooks/nativeErrorWording';
import { useApolloErrorHandler } from '@/core/apollo/hooks/useApolloErrorHandler';
import { error as logError } from '@/core/logging/sentry/log';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type { ClassificationEntryData, ClassificationTemplateOptionData } from '@/crd/components/classification/types';
import type { ImageCropConfig } from '@/crd/components/common/ImageCropDialog';
import type {
  AboutFormValues,
  AboutReference,
  AboutVisualAspectRatioBounds,
  SpaceSettingsLevel,
} from '@/crd/components/space/settings/SpaceSettingsAboutView.types';
import type { ReferenceRow } from '@/crd/forms/references/ReferencesEditor';
import { MAX_BANNER_ASPECT_RATIO, MIN_BANNER_ASPECT_RATIO } from '@/crd/lib/bannerAspectRatio';
import { errorMessage, type TabUnsavedChanges } from '@/main/crdPages/utils/tabUnsavedChanges';
import { useNativeReferenceFileUpload } from '@/main/crdPages/utils/useNativeReferenceFileUpload';
import {
  type AboutSpace,
  buildPreviewCard,
  type ClassificationSettings,
  mapNativeClassificationEntries,
  mapSpaceToAboutFormValues,
  mapVisual,
  PURPOSE_FACET,
} from './aboutMapper';

export type { AboutFormValues };

export type UseAboutTabDataResult = {
  values: AboutFormValues | null;
  previewCard: ReturnType<typeof buildPreviewCard> | null;
  loading: boolean;
  error: Error | null;
  onChange: (patch: Partial<AboutFormValues>) => void;
  onUploadAvatar: (file: File) => void;
  onUploadPageBanner: (file: File) => void;
  onUploadCardBanner: (file: File) => void;
  /** Server-defined range the page banner's aspect ratio may be set to. Null while loading. */
  pageBannerAspectRatioBounds: AboutVisualAspectRatioBounds | null;
  pendingCrop: PendingCrop | null;
  onCropComplete: (croppedFile: File, altText: string) => void;
  onCropCancel: () => void;
  /** Re-crop an already-uploaded visual. Opens the crop dialog with the existing image. */
  onRecropVisual: (key: 'avatar' | 'pageBanner' | 'cardBanner') => void;
  /** True while a re-crop save is held behind the replace-original confirmation. */
  recropConfirmOpen: boolean;
  onConfirmRecrop: () => void;
  onCancelRecropConfirm: () => void;
  /** Replace the whole references list — the shared ReferencesEditor owns add/edit/remove + its own delete-confirm. */
  onReferencesChange: (rows: ReferenceRow[]) => void;
  /** Reference file-upload (paperclip) — uploads to the space's storage bucket. */
  onReferenceFileUpload?: (file: File) => Promise<string | null>;
  referenceUploadAccept?: string;
  /** New references with a URL or description but no title — they block Save until titled. */
  untitledReferenceIds: string[];
  /** Every field except the visuals is buffered and saved through the unsaved-changes bar (spec 045 FR-005a). */
  unsaved: TabUnsavedChanges;

  // ── Classifications (D1) — staged with the rest of the tab (spec 024 Session 2026-10-22) ──
  /** Displayed entries — server entries with the staged changes applied, staged adds last. */
  classifications: ClassificationEntryData[];
  /** Ids of entries added locally and not saved yet. */
  unsavedClassificationIds: string[];
  /** Step A — stages an add. Returns `false` (and sets `classificationConflict`) on a display-label collision. */
  addClassificationFromTemplate: (template: ClassificationTemplateOptionData, displayLabel?: string) => boolean;
  /** Step B — stages the full replacement selection (FR-012d). */
  updateClassificationSelection: (entryId: string, selectedValueIDs: string[]) => void;
  /** Stages the shown/hidden toggle (FR-010b) — render-only, not an access control. */
  updateClassificationDisplay: (entryId: string, display: boolean) => void;
  /** Stages the removal; a staged add is simply dropped. Undone by Discard. */
  removeClassification: (entryId: string) => void;
  /** Set after a pick whose display label collides with an existing or staged entry (FR-011b/c). */
  classificationConflict: { templateId: string; attemptedLabel: string } | null;
  dismissClassificationConflict: () => void;
};

/** A classification added from a template locally, written on Save. */
type StagedClassificationAdd = {
  tempId: string;
  templateId: string;
  displayLabel: string;
  cardinality: ClassificationEntryData['cardinality'];
  values: ClassificationEntryData['values'];
  selectedValueIDs: string[];
  display: boolean;
};

/**
 * FR-011a/FR-011b: the normalized label is the owner-local choice set name, checked atomically when the add is
 * written (surface.graphql:542), so a collision comes back as the native CONFLICT refusal of addClassification.
 */
function isDisplayLabelConflictError(err: unknown): boolean {
  if (!(err instanceof ApolloError)) return false;
  return err.graphQLErrors.some(gqlErr => gqlErr.extensions?.code === NativeErrorCode.CONFLICT);
}

type VisualKey = 'avatar' | 'pageBanner' | 'cardBanner';

/** Each About visual and its file role, which is also its Config.visualConstraints name (schema.sql file_roles). */
const VISUAL_ROLE: Record<VisualKey, 'avatar' | 'banner' | 'card'> = {
  avatar: 'avatar',
  pageBanner: 'banner',
  cardBanner: 'card',
};

/** A space's own references are links of role `reference` (screens-dispositions.tsv:3198). */
const REFERENCE_LINK_ROLE = 'reference';

type UploadedFile = { id: string };

const TEMP_PREFIX = 'temp-';
function isTempId(id: string) {
  return id.startsWith(TEMP_PREFIX);
}

/** FR-011c — trim, collapse whitespace runs, NFC, case-fold. Comparison only; never stored. */
function normalizeDisplayLabel(label: string) {
  return label.trim().replace(/\s+/g, ' ').normalize('NFC').toLowerCase();
}

const sameIds = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && [...a].sort().join('\u0000') === [...b].sort().join('\u0000');

const TEXT_FIELDS = ['name', 'tagline', 'what', 'why', 'who', 'city', 'country'] as const;

/**
 * CRD About tab data hook — saved through the tab-wide unsaved-changes bar.
 *
 * Every field except the visuals lives in a local buffer over the cache-derived
 * server values (`saved`); `unsaved` counts the changed fields (spec 045
 * FR-025b), `saveAll` writes them all, `reset` drops the buffer back to `saved`.
 * Classification adds / removals / selections / display toggles are staged in
 * the same way. Visual uploads stay immediate (the file pick IS the commit).
 */
export function useAboutTabData(spaceId: string, spaceUrl: string, level: SpaceSettingsLevel): UseAboutTabDataResult {
  const {
    data,
    loading: queryLoading,
    error: queryError,
    refetch,
  } = useSpaceSettingsAboutQuery({ variables: { id: spaceId }, skip: !spaceId });
  const space: AboutSpace | undefined =
    data?.node?.id === spaceId && data.node.entityType === 'space' ? (data.node as AboutSpace) : undefined;
  /** Server-saved view of the form — recomputed on every render from the cache. */
  const saved: AboutFormValues | null = space ? mapSpaceToAboutFormValues(space) : null;

  const [values, setValues] = useState<AboutFormValues | null>(null);
  const valuesRef = useRef<AboutFormValues | null>(null);
  // A read that fails before the form is seeded is shown, never an endless spinner; once seeded, a failed refresh
  // after Save is reported through the save-failed dialog instead.
  if (spaceId && values === null && queryError) throw queryError;
  if (spaceId && values === null && data && !queryLoading && !data.node) throw new NotFoundError();
  const [, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { t } = useTranslation('crd-spaceSettings');
  const { t: tCommon } = useTranslation('crd-common');
  const notify = useNotification();
  const handleError = useApolloErrorHandler();

  const [updateAbout] = useSpaceSettingsUpdateAboutMutation();
  const [upsertLink] = useSpaceSettingsUpsertLinkMutation();
  const [deleteLink] = useSpaceSettingsDeleteLinkMutation();
  const [requestUpload] = useSpaceSettingsRequestVisualUploadMutation();
  const [attachVisual] = useSpaceSettingsAttachVisualMutation();
  const [addClassification] = useSpaceSettingsAddClassificationMutation();
  const [updateClassification] = useSpaceSettingsUpdateClassificationMutation();
  const [removeClassificationEntry] = useSpaceSettingsRemoveClassificationMutation();

  // The allowed ratio range is a property of the visual's slot type, so it comes from Config.visualConstraints
  // (one row per file role) rather than from this space's own image.
  const constraintOf = (key: VisualKey) =>
    data?.config.visualConstraints.find(constraint => constraint.name === VISUAL_ROLE[key]);
  const bannerConstraints = level === 'L0' ? constraintOf('pageBanner') : undefined;
  // Fall back to the local mirror of the server defaults rather than to `null`.
  // `null` reads as "this visual has no adjustable shape" and silently removes
  // the slider, so a still-loading config read would take the whole feature away
  // for the session with nothing shown to explain it.
  const pageBannerAspectRatioBounds: AboutVisualAspectRatioBounds | null =
    level === 'L0'
      ? {
          min: bannerConstraints?.minAspectRatio ?? MIN_BANNER_ASPECT_RATIO,
          max: bannerConstraints?.maxAspectRatio ?? MAX_BANNER_ASPECT_RATIO,
        }
      : null;

  // Reference file upload (paperclip) — the space settings tab is always rendered inside the
  // ambient space StorageConfigContextProvider, so the bucket resolves from context.
  const { onFileUpload: onReferenceFileUpload, accept: referenceUploadAccept } = useNativeReferenceFileUpload();

  // Seed once when the query first resolves. Subsequent cache updates are
  // picked up via `saved` (for dirty detection) without overwriting user edits.
  useEffect(() => {
    if (saved && valuesRef.current === null) {
      valuesRef.current = saved;
      setValues(saved);
    }
  }, [saved]);

  // ────────────────── Changed fields (FR-025b) ──────────────────

  const changedTextFields = values && saved ? TEXT_FIELDS.filter(field => values[field] !== saved[field]) : [];
  const tagsChanged = !!values && !!saved && JSON.stringify(values.tags) !== JSON.stringify(saved.tags);
  const referenceChanges = (() => {
    if (!values || !saved) return { created: [], edited: [], removed: [] };
    const savedById = new Map(saved.references.map(r => [r.id, r] as const));
    const currentIds = new Set(values.references.map(r => r.id));
    return {
      // A new row is only created once it has a title — same rule the save has always applied.
      created: values.references.filter(r => isTempId(r.id) && r.title.trim()),
      edited: values.references.filter(r => {
        const prior = savedById.get(r.id);
        return !!prior && (prior.title !== r.title || prior.uri !== r.uri || prior.description !== r.description);
      }),
      removed: saved.references.filter(r => !currentIds.has(r.id)),
    };
  })();

  // A new row with a URL or description but no title can't be created; it blocks Save (and shows an
  // error) instead of being skipped and then dropped by the post-save rebase.
  const untitledReferenceIds = (values?.references ?? [])
    .filter(r => isTempId(r.id) && !r.title.trim() && (r.uri.trim() || r.description.trim()))
    .map(r => r.id);

  // ────────────────── Local changes ──────────────────

  const onChange = (patch: Partial<AboutFormValues>) => {
    setSaveError(null);
    setValues(prev => {
      const base = prev ?? valuesRef.current;
      if (!base) return prev;
      const next = { ...base, ...patch };
      valuesRef.current = next;
      return next;
    });
  };

  // The shared ReferencesEditor manages rows + its own delete-confirm and emits the full list.
  // New rows arrive without an `id`; assign a temp id so the per-section save diffs them as creates.
  const onReferencesChange = (rows: ReferenceRow[]) => {
    setSaveError(null);
    setValues(prev => {
      const base = prev ?? valuesRef.current;
      if (!base) return prev;
      const mapped: AboutReference[] = rows.map((r, i) => ({
        id: r.id ?? `${TEMP_PREFIX}${Date.now()}-${i}`,
        title: r.name,
        uri: r.uri,
        description: r.description ?? '',
      }));
      const next: AboutFormValues = { ...base, references: mapped };
      valuesRef.current = next;
      return next;
    });
  };

  // ────────────────── Image uploads (immediate) ──────────────────

  /**
   * Replaces the image in a slot through the file contract, as useUploadVisualsOnCreate: requestUpload on the space
   * under the slot's role, PUT the bytes to the token's url, then attachFile under that role with the alt text; the
   * server takes the ratio from the cropped image. A failure is shown, never dropped silently.
   */
  const uploadVisual = async (key: VisualKey, file: File, altText: string) => {
    const role = VISUAL_ROLE[key];
    const { data: token } = await requestUpload({
      variables: { owner: spaceId, mime: file.type, size: file.size, role },
    });
    if (!token) throw new Error(`requestUpload returned no token for the ${role} of ${spaceId}`);
    const response = await fetch(token.requestUpload.url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token.requestUpload.token}`,
        'Content-Type': file.type,
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      },
      body: file,
    });
    if (!response.ok) throw new Error(`Upload of the ${role} of ${spaceId} failed with HTTP ${response.status}`);
    const uploaded = (await response.json()) as UploadedFile;
    const { data: attached } = await attachVisual({
      variables: {
        owner: spaceId,
        file: uploaded.id,
        role,
        displayName: file.name,
        alt: altText || undefined,
      },
    });
    const node = attached?.attachFile;
    return node && node.entityType === 'space' && 'about' in node ? node.about[role] : undefined;
  };

  const uploadVisualForField = async (
    key: VisualKey,
    file: File,
    // Passed explicitly rather than read back off `valuesRef`: the caller queues
    // a `setValues` for this same alt text, and that updater runs at render, not
    // at dispatch, so the ref still holds the pre-edit value at this point.
    altText: string
  ) => {
    startTransition(() => {
      void uploadVisual(key, file, altText)
        .then(uploaded => {
          if (!uploaded) return;
          setValues(prev => {
            const base = prev ?? valuesRef.current;
            if (!base) return prev;
            // The server derives the stored ratio from the uploaded pixels (the crop is cut to the slider's
            // ratio); take its value as the truth so local state and the Apollo cache never disagree.
            const next: AboutFormValues = { ...base, [key]: mapVisual(uploaded, key === 'pageBanner') };
            valuesRef.current = next;
            return next;
          });
        })
        .catch(err => {
          if (err instanceof ApolloError) {
            handleError(err);
            return;
          }
          // The byte PUT to the file service failed: shown with the transport wording, and logged.
          notify(tCommon('apollo.errors.network.generic'), 'error');
          logError(err instanceof Error ? err : new Error(String(err)));
        });
    });
  };

  // ────────────────── Crop dialog integration ──────────────────

  const [pendingCrop, setPendingCrop] = useState<PendingCrop | null>(null);

  const buildCropConfig = (key: VisualKey): CropConfig => {
    // Read aspectRatio from local form state (values) if available,
    // which ensures slider changes are immediately used in the crop dialog.
    let aspectRatio: number | undefined;
    if (values) {
      const visual = key === 'avatar' ? values.avatar : key === 'pageBanner' ? values.pageBanner : values.cardBanner;
      aspectRatio = visual.aspectRatio;
    }

    // The slot's limits come from its Config.visualConstraints row (they never change during editing).
    const constraint = constraintOf(key);

    // Page banner is the only visual with adjustable aspect ratio.
    const aspectRatioBounds = key === 'pageBanner' ? (pageBannerAspectRatioBounds ?? undefined) : undefined;

    // A stored banner ratio describes an uploaded image's shape — the server
    // derives it from the pixels the crop dialog cut. With no image there is
    // no ratio chosen by anybody, so the first-ever crop opens on the dialog's
    // own default (the bounds' max) instead.
    const hasImage = Boolean(values?.[key]?.uri);

    return {
      aspectRatio: key === 'pageBanner' && !hasImage ? undefined : (aspectRatio ?? constraint?.aspectRatio ?? 1),
      maxHeight: constraint?.maxHeight,
      minHeight: constraint?.minHeight,
      maxWidth: constraint?.maxWidth,
      minWidth: constraint?.minWidth,
      aspectRatioBounds,
      // Only the page banner refuses an undersized source: it is the page's
      // largest image, where upscaling is most visible. The avatar and card
      // banner keep the resizer's upscale path they have always had.
      blockBelowMinSize: key === 'pageBanner',
    };
  };

  // A newly picked file replaces the image, not its description, so the dialog
  // opens on the alt text the visual already has.
  const currentAltText = (key: 'avatar' | 'pageBanner' | 'cardBanner') => values?.[key]?.altText ?? '';

  const onUploadAvatarWithCrop = (file: File) =>
    setPendingCrop({ key: 'avatar', file, config: buildCropConfig('avatar'), altText: currentAltText('avatar') });
  const onUploadPageBannerWithCrop = (file: File) =>
    setPendingCrop({
      key: 'pageBanner',
      file,
      config: buildCropConfig('pageBanner'),
      altText: currentAltText('pageBanner'),
    });
  const onUploadCardBannerWithCrop = (file: File) =>
    setPendingCrop({
      key: 'cardBanner',
      file,
      config: buildCropConfig('cardBanner'),
      altText: currentAltText('cardBanner'),
    });

  // Re-crop an already-uploaded visual (existing file with URI).
  const onRecropVisual = (key: 'avatar' | 'pageBanner' | 'cardBanner') => {
    const visual = values?.[key];
    if (!visual?.uri) return;
    // Fetch the existing image, convert to File, and open crop dialog.
    fetch(visual.uri)
      .then(r => r.blob())
      .then(blob => {
        const fileName = visual.uri?.split('/').pop() ?? `${key}.jpg`;
        const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' });
        setPendingCrop({ key, file, config: buildCropConfig(key), altText: currentAltText(key), isRecrop: true });
      })
      .catch(() => {
        // The image is fetched from the storage host, so this fails on CORS, on
        // a 403 for a private space's document, or on any network blip. Without
        // a message the crop button is simply inert and the admin cannot tell it
        // apart from a slow load.
        notify(t('about.branding.recropFailed'), 'error');
      });
  };

  // A re-crop save waiting on the replace-original confirmation. The crop
  // dialog stays open underneath, so cancelling the confirmation drops the
  // user back into the crop they already framed.
  const [pendingRecropSave, setPendingRecropSave] = useState<{ file: File; altText: string } | null>(null);

  // Only the alt text is written here. The ratio the dialog was cut to lands
  // in `values` together with `uri` once the upload resolves (see
  // `uploadVisualForField`): writing it now would have the preview claim a
  // shape the server does not hold yet — and keep claiming it after a failed
  // upload, with the old image letterboxed into the new box.
  const commitCrop = (crop: PendingCrop, croppedFile: File, altText: string) => {
    setPendingCrop(null);
    setPendingRecropSave(null);
    const key = crop.key;
    setValues(prev => {
      const base = prev ?? valuesRef.current;
      if (!base) return prev;
      const next: AboutFormValues = {
        ...base,
        [key]: { ...base[key], altText },
      };
      valuesRef.current = next;
      return next;
    });
    void uploadVisualForField(key, croppedFile, altText);
  };

  const onCropComplete = (croppedFile: File, altText: string) => {
    if (!pendingCrop) return;
    if (pendingCrop.isRecrop) {
      // Re-cropping overwrites the stored original irreversibly (#10148), so
      // the upload waits for an explicit confirmation. A fresh upload commits
      // straight away — the original is still on the user's disk.
      setPendingRecropSave({ file: croppedFile, altText });
      return;
    }
    commitCrop(pendingCrop, croppedFile, altText);
  };

  const onConfirmRecrop = () => {
    if (!pendingCrop || !pendingRecropSave) return;
    commitCrop(pendingCrop, pendingRecropSave.file, pendingRecropSave.altText);
  };

  const onCancelRecropConfirm = () => setPendingRecropSave(null);

  const onCropCancel = () => {
    setPendingCrop(null);
    setPendingRecropSave(null);
  };

  const previewCard = values ? buildPreviewCard(spaceId, values, spaceUrl, level) : null;

  // ────────────────── Classifications (D1: about.classifications[].values[]) ──────────────────
  // Staged like every other About field (spec 024 Session 2026-10-22): nothing is written until
  // Save, Discard drops it all. Value ids are copied verbatim from the template (FR-010c), so a
  // staged add can be rendered — and its values picked — from the template the picker returned.

  const [stagedAdds, setStagedAdds] = useState<StagedClassificationAdd[]>([]);
  const [stagedRemovals, setStagedRemovals] = useState<string[]>([]);
  const [selectionOverrides, setSelectionOverrides] = useState<Record<string, string[]>>({});
  const [displayOverrides, setDisplayOverrides] = useState<Record<string, boolean>>({});
  const [classificationConflict, setClassificationConflict] = useState<{
    templateId: string;
    attemptedLabel: string;
  } | null>(null);

  const serverClassifications = space ? mapNativeClassificationEntries(space) : [];
  const keptClassifications = serverClassifications.filter(entry => !stagedRemovals.includes(entry.id));
  // Only removals of entries the server still holds are pending: one already deleted elsewhere
  // (a failed removal, refetched) has nothing left to save, so it must not stay counted.
  const pendingRemovals = stagedRemovals.filter(id => serverClassifications.some(entry => entry.id === id));
  const lastSortOrder = serverClassifications.reduce((max, entry) => Math.max(max, entry.sortOrder), 0);
  const classifications: ClassificationEntryData[] = [
    ...keptClassifications.map(entry => ({
      ...entry,
      selectedValueIDs: selectionOverrides[entry.id] ?? entry.selectedValueIDs,
      display: displayOverrides[entry.id] ?? entry.display,
    })),
    ...stagedAdds.map((add, index) => ({
      id: add.tempId,
      displayLabel: add.displayLabel,
      cardinality: add.cardinality,
      values: add.values,
      selectedValueIDs: add.selectedValueIDs,
      display: add.display,
      sortOrder: lastSortOrder + index + 1,
    })),
  ];
  const changedClassifications = keptClassifications.filter(
    entry =>
      (entry.id in selectionOverrides && !sameIds(selectionOverrides[entry.id], entry.selectedValueIDs)) ||
      (entry.id in displayOverrides && displayOverrides[entry.id] !== entry.display)
  );

  const addClassificationFromTemplate = (template: ClassificationTemplateOptionData, displayLabel?: string) => {
    const label = displayLabel ?? template.displayLabel;
    const normalized = normalizeDisplayLabel(label);
    // FR-011a/b checked at pick time against what the Space will hold after Save; the server
    // re-checks when the add is written.
    const taken = [...keptClassifications.map(entry => entry.displayLabel), ...stagedAdds.map(add => add.displayLabel)];
    if (taken.some(existing => normalizeDisplayLabel(existing) === normalized)) {
      setClassificationConflict({ templateId: template.id, attemptedLabel: label });
      return false;
    }
    setSaveError(null);
    setClassificationConflict(null);
    setStagedAdds(prev => [
      ...prev,
      {
        tempId: `${TEMP_PREFIX}classification-${Date.now()}`,
        templateId: template.id,
        displayLabel: label,
        cardinality: template.cardinality,
        values: template.values,
        selectedValueIDs: [],
        display: true,
      },
    ]);
    return true;
  };

  const updateClassificationSelection = (entryId: string, selectedValueIDs: string[]) => {
    setSaveError(null);
    if (isTempId(entryId)) {
      setStagedAdds(prev => prev.map(add => (add.tempId === entryId ? { ...add, selectedValueIDs } : add)));
    } else {
      setSelectionOverrides(prev => ({ ...prev, [entryId]: selectedValueIDs }));
    }
  };

  const updateClassificationDisplay = (entryId: string, display: boolean) => {
    setSaveError(null);
    if (isTempId(entryId)) {
      setStagedAdds(prev => prev.map(add => (add.tempId === entryId ? { ...add, display } : add)));
    } else {
      setDisplayOverrides(prev => ({ ...prev, [entryId]: display }));
    }
  };

  const removeClassification = (entryId: string) => {
    setSaveError(null);
    if (isTempId(entryId)) {
      setStagedAdds(prev => prev.filter(add => add.tempId !== entryId));
    } else {
      setStagedRemovals(prev => [...prev, entryId]);
    }
  };

  const resetClassifications = () => {
    setStagedAdds([]);
    setStagedRemovals([]);
    setSelectionOverrides({});
    setDisplayOverrides({});
    setClassificationConflict(null);
  };

  /** The stored instance settings of each served entry, so a display toggle rewrites only `visible`. */
  const settingsOf = (entryId: string): ClassificationSettings =>
    ((space?.classifications ?? []).find(entry => entry.id === entryId)?.settings ?? {}) as ClassificationSettings;

  /** Writes the staged classification changes; returns the error of the first failure, if any. */
  const saveClassifications = async (): Promise<string | null> => {
    const errors: string[] = [];
    const fail = (err: unknown) => {
      errors.push(isDisplayLabelConflictError(err) ? t('classifications.picker.conflict.title') : errorMessage(err));
    };

    // Removals first, so a label freed by a removal is free for an add in the same Save.
    const failedRemovals: string[] = [];
    for (const entryId of pendingRemovals) {
      try {
        await removeClassificationEntry({ variables: { id: entryId } });
      } catch (err) {
        failedRemovals.push(entryId);
        fail(err);
      }
    }

    const failedAdds: StagedClassificationAdd[] = [];
    const createdAdds: StagedClassificationAdd[] = [];
    for (const add of stagedAdds) {
      try {
        await addClassification({
          variables: { space: spaceId, template: add.templateId, label: add.displayLabel },
        });
        createdAdds.push(add);
      } catch (err) {
        failedAdds.push(add);
        fail(err);
      }
    }

    // The add copies the template's vocabulary into the space; the staged picks and the hidden flag are written on
    // the created entry, found by its label, its values matched to the picked template values by their text.
    const pendingCreated = createdAdds.filter(add => add.selectedValueIDs.length > 0 || !add.display);
    const createdSelections: Record<string, string[]> = {};
    const createdDisplays: Record<string, boolean> = {};
    if (pendingCreated.length > 0) {
      const fresh = await refetch().catch(err => {
        fail(err);
        return null;
      });
      const freshSpace = fresh?.data?.node?.entityType === 'space' ? (fresh.data.node as AboutSpace) : undefined;
      for (const add of pendingCreated) {
        const created = (freshSpace?.classifications ?? []).find(
          entry => normalizeDisplayLabel(entry.label) === normalizeDisplayLabel(add.displayLabel)
        );
        if (!created) {
          fail(new Error(`The added classification "${add.displayLabel}" is not on the space after the add`));
          continue;
        }
        const pickedLabels = add.values.filter(v => add.selectedValueIDs.includes(v.id)).map(v => v.label);
        const selected = created.values.filter(v => pickedLabels.includes(v.value)).map(v => v.id);
        try {
          await updateClassification({
            variables: {
              id: created.id,
              selected: add.selectedValueIDs.length > 0 ? selected : undefined,
              settings: add.display ? undefined : { ...(created.settings as ClassificationSettings), visible: false },
            },
          });
        } catch (err) {
          // The entry now exists; a failed follow-up write is retried as an ordinary override.
          if (add.selectedValueIDs.length > 0) createdSelections[created.id] = selected;
          if (!add.display) createdDisplays[created.id] = false;
          fail(err);
        }
      }
    }

    const failedSelections: Record<string, string[]> = {};
    const failedDisplays: Record<string, boolean> = {};
    for (const entry of changedClassifications) {
      const selection = selectionOverrides[entry.id];
      const display = displayOverrides[entry.id];
      const selectionChanged = !!selection && !sameIds(selection, entry.selectedValueIDs);
      const displayChanged = display !== undefined && display !== entry.display;
      try {
        await updateClassification({
          variables: {
            id: entry.id,
            selected: selectionChanged ? selection : undefined,
            settings: displayChanged ? { ...settingsOf(entry.id), visible: display } : undefined,
          },
        });
      } catch (err) {
        if (selectionChanged) failedSelections[entry.id] = selection;
        if (displayChanged) failedDisplays[entry.id] = display;
        fail(err);
      }
    }

    setStagedRemovals(failedRemovals);
    setStagedAdds(failedAdds);
    setSelectionOverrides({ ...failedSelections, ...createdSelections });
    setDisplayOverrides({ ...failedDisplays, ...createdDisplays });
    return errors[0] ?? null;
  };

  // ────────────────── Save / Discard (the unsaved-changes bar) ──────────────────

  const unsavedCount =
    changedTextFields.length +
    (tagsChanged ? 1 : 0) +
    referenceChanges.created.length +
    referenceChanges.edited.length +
    referenceChanges.removed.length +
    untitledReferenceIds.length +
    stagedAdds.length +
    pendingRemovals.length +
    changedClassifications.length;

  const saveAll = async (): Promise<boolean> => {
    const current = valuesRef.current;
    if (!current || !saved || unsavedCount === 0) return true;
    if (untitledReferenceIds.length > 0) return false;
    const { created, edited, removed } = referenceChanges;
    setSaving(true);
    setSaveError(null);
    let firstError: string | null = null;

    // 1) One updateSpace for every changed text / location / purpose / tag field.
    let coreFailed = false;
    const about: UpdateAboutInput = {};
    if (current.name !== saved.name) about.displayName = current.name;
    if (current.tagline !== saved.tagline) about.tagline = current.tagline;
    if (current.what !== saved.what) about.description = current.what;
    if (current.city !== saved.city || current.country !== saved.country) {
      about.location = { country: current.country, city: current.city };
    }
    // core.purpose requires both keys, so a change to either writes the pair.
    if (current.why !== saved.why || current.who !== saved.who) {
      about.facets = [{ ...PURPOSE_FACET, value: { why: current.why, who: current.who } }];
    }
    const aboutChanged = Object.keys(about).length > 0;
    if (aboutChanged || tagsChanged) {
      try {
        await updateAbout({
          variables: {
            id: spaceId,
            about: aboutChanged ? about : undefined,
            tags: tagsChanged ? current.tags : undefined,
          },
        });
      } catch (err) {
        coreFailed = true;
        firstError ??= errorMessage(err);
      }
    }

    // 2) References are the space's links: each created, edited or removed one is its own write; an edited link
    // keeps its role.
    const roleOf = new Map((space?.links ?? []).map(link => [link.id, link.role] as const));
    const failedCreates: AboutReference[] = [];
    const failedEdits = new Map<string, AboutReference>();
    for (const ref of created) {
      try {
        await upsertLink({
          variables: {
            owner: spaceId,
            role: REFERENCE_LINK_ROLE,
            uri: ref.uri,
            title: ref.title,
            description: ref.description,
          },
        });
      } catch (err) {
        failedCreates.push(ref);
        firstError ??= errorMessage(err);
      }
    }
    for (const ref of edited) {
      try {
        await upsertLink({
          variables: {
            owner: spaceId,
            id: ref.id,
            role: roleOf.get(ref.id) ?? REFERENCE_LINK_ROLE,
            uri: ref.uri,
            title: ref.title,
            description: ref.description,
          },
        });
      } catch (err) {
        failedEdits.set(ref.id, ref);
        firstError ??= errorMessage(err);
      }
    }
    for (const ref of removed) {
      try {
        await deleteLink({ variables: { id: ref.id } });
      } catch (err) {
        firstError ??= errorMessage(err);
      }
    }

    // 3) Classifications.
    const classificationError = await saveClassifications();
    firstError ??= classificationError;

    // Rebase the buffer on the fresh server values: what saved now matches the server, what
    // failed stays buffered so it stays counted and Save retries it.
    // A failed refresh leaves the buffer out of step with the server (writes that succeeded are no
    // longer staged, yet don't appear either), so it fails the Save and the page offers a reload.
    const fresh = (
      await refetch().catch(err => {
        firstError ??= errorMessage(err);
        return null;
      })
    )?.data?.node;
    if (fresh && fresh.entityType === 'space') {
      const freshValues = mapSpaceToAboutFormValues(fresh as AboutSpace);
      const removedIds = new Set(removed.map(r => r.id));
      const next: AboutFormValues = {
        ...current,
        ...(coreFailed ? {} : pickSavedFields(freshValues)),
        references: [
          ...freshValues.references
            // A removal that failed stays removed in the buffer.
            .filter(r => !removedIds.has(r.id))
            // An edit that failed stays edited.
            .map(r => failedEdits.get(r.id) ?? r),
          ...failedCreates,
        ],
      };
      valuesRef.current = next;
      setValues(next);
    }

    setSaving(false);
    setSaveError(firstError);
    return firstError === null;
  };

  const dismissClassificationConflict = () => setClassificationConflict(null);

  const reset = () => {
    if (saved) {
      setValues(saved);
      valuesRef.current = saved;
    }
    resetClassifications();
    setSaveError(null);
  };

  return {
    values,
    previewCard,
    loading: queryLoading,
    error: queryError ?? null,
    onChange,
    onUploadAvatar: onUploadAvatarWithCrop,
    onUploadPageBanner: onUploadPageBannerWithCrop,
    onUploadCardBanner: onUploadCardBannerWithCrop,
    pageBannerAspectRatioBounds,
    pendingCrop,
    onCropComplete,
    onCropCancel,
    onRecropVisual,
    recropConfirmOpen: pendingRecropSave !== null,
    onConfirmRecrop,
    onCancelRecropConfirm,
    onReferencesChange,
    onReferenceFileUpload,
    referenceUploadAccept,
    untitledReferenceIds,
    unsaved: {
      count: unsavedCount,
      canSave: untitledReferenceIds.length === 0,
      saving,
      error: saveError,
      saveAll,
      reset,
    },
    classifications,
    unsavedClassificationIds: stagedAdds.map(add => add.tempId),
    addClassificationFromTemplate,
    updateClassificationSelection,
    updateClassificationDisplay,
    removeClassification,
    classificationConflict,
    dismissClassificationConflict,
  };
}

/** The fields the single `updateSpace` call writes — taken from the server once it succeeded. */
function pickSavedFields(fresh: AboutFormValues): Partial<AboutFormValues> {
  const { name, tagline, what, why, who, city, country, tags, tagsetId } = fresh;
  return { name, tagline, what, why, who, city, country, tags, tagsetId };
}

/**
 * Alias rather than a re-declaration: this value goes straight into
 * `ImageCropDialog`'s `config` prop, and the hand-copied version this replaces
 * had already fallen a field behind the dialog it configures.
 */
export type CropConfig = ImageCropConfig;

export type PendingCrop = {
  key: VisualKey;
  file: File;
  config: CropConfig;
  /** The visual's current alt text, so the dialog opens with it instead of blank. */
  altText: string;
  selectedAspectRatio?: number;
  /** True when the crop source is the already-uploaded visual, whose original the save overwrites. */
  isRecrop?: boolean;
};
