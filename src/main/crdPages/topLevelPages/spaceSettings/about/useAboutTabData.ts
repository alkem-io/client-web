import { ApolloError } from '@apollo/client';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useAddClassificationEntryFromTemplateMutation,
  useCreateReferenceOnProfileMutation,
  useDefaultVisualTypeConstraintsQuery,
  useDeleteClassificationEntryMutation,
  useDeleteReferenceMutation,
  useSpaceAboutDetailsQuery,
  useUpdateClassificationEntryDisplayMutation,
  useUpdateClassificationEntrySelectionMutation,
  useUpdateSpaceMutation,
  useUploadVisualMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { type UpdateSpaceInput, VisualType } from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type { ClassificationEntryData } from '@/crd/components/classification/types';
import type { ImageCropConfig } from '@/crd/components/common/ImageCropDialog';
import type {
  AboutFormValues,
  AboutReference,
  AboutSectionKey,
  AboutSectionSaveStatus,
  AboutVisualAspectRatioBounds,
  SpaceSettingsLevel,
} from '@/crd/components/space/settings/SpaceSettingsAboutView.types';
import type { ReferenceRow } from '@/crd/forms/references/ReferencesEditor';
import { MAX_BANNER_ASPECT_RATIO, MIN_BANNER_ASPECT_RATIO } from '@/crd/lib/bannerAspectRatio';
import { useStorageConfigContext } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { useReferenceFileUpload } from '@/main/crdPages/utils/useReferenceFileUpload';
import { buildPreviewCard, mapClassificationEntries, mapSpaceToAboutFormValues } from './aboutMapper';

export type { AboutFormValues };

export type UseAboutTabDataResult = {
  values: AboutFormValues | null;
  previewCard: ReturnType<typeof buildPreviewCard> | null;
  loading: boolean;
  error: Error | null;
  /** Which sections differ from the server-saved value. */
  dirtyByField: Partial<Record<AboutSectionKey, boolean>>;
  /** Per-section ephemeral save status (saving / saved / error). */
  saveStatusByField: Partial<Record<AboutSectionKey, AboutSectionSaveStatus>>;
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
  /** Save a single section — only that section's fields are persisted. */
  onSaveSection: (section: AboutSectionKey) => Promise<void>;
  /** True when any section differs from the server-saved value. */
  isDirty: boolean;
  /** Persist every dirty section (used by the tab-switch guard's "Save"). */
  onSaveAll: () => Promise<void>;
  /** Discard all local edits back to the server-saved snapshot (guard's "Discard"). */
  onResetAll: () => void;

  // ── Classifications (D1) — each action commits on its own (FR-006a) ──
  classifications: ClassificationEntryData[];
  /** Entry ids with a selection write in flight — pass through as `disabled` on their value selector. */
  classificationSelectionPendingIds: string[];
  /** Step A — add from a template. Resolves `false` (and sets `classificationConflict`) on a display-label collision. */
  addClassificationFromTemplate: (templateId: string, displayLabel?: string) => Promise<boolean>;
  /** Step B — full-replacement selection write (FR-012d). */
  updateClassificationSelection: (entryId: string, selectedValueIDs: string[]) => Promise<void>;
  /** The shown/hidden toggle (FR-010b) — render-only, not an access control. */
  updateClassificationDisplay: (entryId: string, display: boolean) => Promise<void>;
  /** Permanent removal (FR-014b) — the caller is expected to have already confirmed. */
  removeClassification: (entryId: string) => Promise<void>;
  /** Set after a failed add whose server error was a display-label conflict (FR-011b). */
  classificationConflict: { templateId: string; attemptedLabel: string } | null;
  dismissClassificationConflict: () => void;
  classificationSubmitting: boolean;
  /** True right after a selection write failed against a concurrently-removed entry. */
  classificationRemovedError: boolean;
  dismissClassificationRemovedError: () => void;
};

/**
 * FR-011a/FR-011b's server-side display-label conflict has no dedicated error
 * code — it is a `ValidationException` (`BAD_USER_INPUT`) like any other
 * classification validation failure, so it is identified by its stable
 * message text rather than a code alone.
 */
function isDisplayLabelConflictError(err: unknown): boolean {
  if (!(err instanceof ApolloError)) return false;
  return err.graphQLErrors.some(gqlErr => /display label already exists/i.test(gqlErr.message));
}

const TEMP_PREFIX = 'temp-';
function isTempId(id: string) {
  return id.startsWith(TEMP_PREFIX);
}

/** How long the "Saved" confirmation lingers next to a section's Save button. */
const SAVED_FLASH_MS = 1800;

/**
 * CRD About tab data hook — per-section save model.
 *
 * Each editable section (name, tagline, what, why, who, location, tags,
 * references) exposes its own Save handler. The handler sends ONLY that
 * section's patch via updateSpace. Branding uploads remain immediate
 * (the file picker IS the commit).
 *
 * Dirty is derived from the Apollo cache and each section clears itself when
 * saved. `onSaveAll` / `onResetAll` exist for the tab-switch guard: switching
 * away with unsaved edits prompts the discard dialog, which either persists
 * every dirty section or drops the local buffer back to the cached snapshot.
 */
export function useAboutTabData(spaceId: string, spaceUrl: string, level: SpaceSettingsLevel): UseAboutTabDataResult {
  const {
    data,
    loading: queryLoading,
    error: queryError,
    refetch,
  } = useSpaceAboutDetailsQuery({ variables: { spaceId }, skip: !spaceId });

  const space = data?.lookup.space;
  /** Server-saved view of the form — recomputed on every render from the cache. */
  const saved: AboutFormValues | null = space ? mapSpaceToAboutFormValues(space) : null;

  const [values, setValues] = useState<AboutFormValues | null>(null);
  const valuesRef = useRef<AboutFormValues | null>(null);
  const [, startTransition] = useTransition();

  const [saveStatusByField, setSaveStatusByField] = useState<Partial<Record<AboutSectionKey, AboutSectionSaveStatus>>>(
    {}
  );
  const savedFlashTimers = useRef<Partial<Record<AboutSectionKey, ReturnType<typeof setTimeout>>>>({});

  const { t } = useTranslation('crd-spaceSettings');
  const notify = useNotification();

  const [updateSpace] = useUpdateSpaceMutation();
  const [uploadVisual] = useUploadVisualMutation();
  const [createReference] = useCreateReferenceOnProfileMutation();
  const [deleteReference] = useDeleteReferenceMutation();
  const [addClassificationEntryFromTemplate] = useAddClassificationEntryFromTemplateMutation();
  const [updateClassificationEntrySelection] = useUpdateClassificationEntrySelectionMutation();
  const [updateClassificationEntryDisplay] = useUpdateClassificationEntryDisplayMutation();
  const [deleteClassificationEntry] = useDeleteClassificationEntryMutation();

  // The allowed ratio range is a property of the visual TYPE, so it comes from
  // the platform config rather than from this space's own visual row.
  const { data: bannerConstraintsData } = useDefaultVisualTypeConstraintsQuery({
    variables: { visualType: VisualType.Banner },
    skip: level !== 'L0',
  });
  const bannerConstraints = bannerConstraintsData?.platform.configuration.defaultVisualTypeConstraints;
  // Fall back to the local mirror of the server defaults rather than to `null`.
  // `null` reads as "this visual has no adjustable shape" and silently removes
  // the slider, so a failed or still-loading platform-config query would take
  // the whole feature away for the session with nothing shown to explain it.
  const pageBannerAspectRatioBounds: AboutVisualAspectRatioBounds | null =
    level === 'L0'
      ? {
          min: bannerConstraints?.minAspectRatio ?? MIN_BANNER_ASPECT_RATIO,
          max: bannerConstraints?.maxAspectRatio ?? MAX_BANNER_ASPECT_RATIO,
        }
      : null;

  // Reference file upload (paperclip) — the space settings tab is always rendered inside the
  // ambient space StorageConfigContextProvider, so the bucket resolves from context.
  const { onFileUpload: onReferenceFileUpload, accept: referenceUploadAccept } = useReferenceFileUpload(
    useStorageConfigContext()
  );

  // Seed once when the query first resolves. Subsequent cache updates are
  // picked up via `saved` (for dirty detection) without overwriting user edits.
  useEffect(() => {
    if (saved && valuesRef.current === null) {
      valuesRef.current = saved;
      setValues(saved);
    }
  }, [saved]);

  useEffect(() => {
    return () => {
      for (const timer of Object.values(savedFlashTimers.current)) {
        if (timer) clearTimeout(timer);
      }
    };
  }, []);

  // ────────────────── Dirty map (per section) ──────────────────

  const dirtyByField: Partial<Record<AboutSectionKey, boolean>> = (() => {
    if (!values || !saved) return {};
    return {
      name: values.name !== saved.name,
      tagline: values.tagline !== saved.tagline,
      what: values.what !== saved.what,
      why: values.why !== saved.why,
      who: values.who !== saved.who,
      location: values.city !== saved.city || values.country !== saved.country,
      tags: JSON.stringify(values.tags) !== JSON.stringify(saved.tags),
      references: JSON.stringify(values.references) !== JSON.stringify(saved.references),
    };
  })();

  // ────────────────── Local changes ──────────────────

  const onChange = (patch: Partial<AboutFormValues>) => {
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

  const uploadVisualForField = async (
    key: 'avatar' | 'pageBanner' | 'cardBanner',
    file: File,
    // Passed explicitly rather than read back off `valuesRef`: the caller queues
    // a `setValues` for this same alt text, and that updater runs at render, not
    // at dispatch, so the ref still holds the pre-edit value at this point.
    altText: string
  ) => {
    const current = valuesRef.current;
    const visual = current?.[key];
    if (!visual?.id) return;
    startTransition(() => {
      void uploadVisual({
        variables: { file, uploadData: { visualID: visual.id, alternativeText: altText || undefined } },
      }).then(result => {
        const uploaded = result.data?.uploadImageOnVisual;
        if (uploaded) {
          setValues(prev => {
            const base = prev ?? valuesRef.current;
            if (!base) return prev;
            const next: AboutFormValues = {
              ...base,
              [key]: {
                ...base[key],
                uri: uploaded.uri,
                altText: uploaded.alternativeText ?? null,
                // The server derives the stored ratio from the uploaded pixels
                // (the crop is cut to the slider's ratio, so they agree to the
                // 0.1 the DB keeps); take its value as the truth so local state
                // and the Apollo cache never disagree.
                aspectRatio: uploaded.aspectRatio,
              },
            };
            valuesRef.current = next;
            return next;
          });
        }
      });
    });
  };

  // ────────────────── Crop dialog integration ──────────────────

  const [pendingCrop, setPendingCrop] = useState<PendingCrop | null>(null);

  const buildCropConfig = (key: 'avatar' | 'pageBanner' | 'cardBanner'): CropConfig => {
    // Read aspectRatio from local form state (values) if available,
    // which ensures slider changes are immediately used in the crop dialog.
    let aspectRatio: number | undefined;
    if (values) {
      const visual = key === 'avatar' ? values.avatar : key === 'pageBanner' ? values.pageBanner : values.cardBanner;
      aspectRatio = visual.aspectRatio;
    }

    // Read min/max constraints from Apollo cache (they never change during editing).
    const profile = space?.about.profile;
    const visualRaw = key === 'avatar' ? profile?.avatar : key === 'pageBanner' ? profile?.banner : profile?.cardBanner;

    // Page banner is the only visual with adjustable aspect ratio.
    const aspectRatioBounds = key === 'pageBanner' ? (pageBannerAspectRatioBounds ?? undefined) : undefined;

    // A stored banner ratio describes an uploaded image's shape — the server
    // derives it from the pixels the crop dialog cut. With no image the row
    // still carries the server's creation default (6), chosen by nobody;
    // passing it through would open the first-ever crop on 6 instead of the
    // dialog's own default (the bounds' max, 10).
    const hasImage = Boolean(values?.[key]?.uri ?? visualRaw?.uri);

    return {
      aspectRatio: key === 'pageBanner' && !hasImage ? undefined : (aspectRatio ?? visualRaw?.aspectRatio ?? 1),
      maxHeight: visualRaw?.maxHeight,
      minHeight: visualRaw?.minHeight,
      maxWidth: visualRaw?.maxWidth,
      minWidth: visualRaw?.minWidth,
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

  // ────────────────── Per-section save ──────────────────

  const setSectionStatus = (section: AboutSectionKey, status: AboutSectionSaveStatus) => {
    setSaveStatusByField(prev => ({ ...prev, [section]: status }));
  };

  const flashSaved = (section: AboutSectionKey) => {
    setSectionStatus(section, { kind: 'saved', at: Date.now() });
    const existing = savedFlashTimers.current[section];
    if (existing) clearTimeout(existing);
    savedFlashTimers.current[section] = setTimeout(() => {
      setSaveStatusByField(prev => {
        const next = { ...prev };
        delete next[section];
        return next;
      });
      delete savedFlashTimers.current[section];
    }, SAVED_FLASH_MS);
  };

  /** Build a narrow UpdateSpaceInput that carries only the fields for a single section. */
  const buildSectionPatch = (section: AboutSectionKey, current: AboutFormValues): UpdateSpaceInput | null => {
    switch (section) {
      case 'name':
        return { ID: spaceId, about: { profile: { displayName: current.name } } };
      case 'tagline':
        return { ID: spaceId, about: { profile: { tagline: current.tagline } } };
      case 'what':
        return { ID: spaceId, about: { profile: { description: current.what } } };
      case 'why':
        return { ID: spaceId, about: { why: current.why } };
      case 'who':
        return { ID: spaceId, about: { who: current.who } };
      case 'location':
        return {
          ID: spaceId,
          about: { profile: { location: { country: current.country, city: current.city } } },
        };
      case 'tags':
        if (!current.tagsetId) return null;
        return {
          ID: spaceId,
          about: { profile: { tagsets: [{ ID: current.tagsetId, tags: current.tags }] } },
        };
      case 'references':
        return null; // handled via dedicated create/delete/patch flow below
      case 'classifications':
        // Never buffered: each classification action commits on its own via its own mutation
        // (FR-006a) — `onSaveSection('classifications')` is never called, but the key still
        // needs an exhaustive case here.
        return null;
    }
  };

  const saveReferencesSection = async (current: AboutFormValues, savedRefs: AboutReference[]) => {
    // 1) Patch existing (non-temp) references.
    const existing = current.references.filter(r => !isTempId(r.id));
    if (existing.length) {
      await updateSpace({
        variables: {
          input: {
            ID: spaceId,
            about: {
              profile: {
                references: existing.map(r => ({
                  ID: r.id,
                  name: r.title,
                  uri: r.uri,
                  description: r.description,
                })),
              },
            },
          },
        },
      });
    }

    // 2) Create new references (temp IDs with a title).
    for (const ref of current.references) {
      if (isTempId(ref.id) && ref.title.trim()) {
        await createReference({
          variables: {
            input: { profileID: current.profileId, name: ref.title, uri: ref.uri, description: ref.description },
          },
        });
      }
    }

    // 3) Delete removed references (present in saved snapshot but missing now).
    const currentIds = new Set(current.references.map(r => r.id));
    const removed = savedRefs.filter(r => !isTempId(r.id) && !currentIds.has(r.id));
    for (const ref of removed) {
      await deleteReference({ variables: { input: { ID: ref.id } } });
    }
  };

  const onSaveSection = async (section: AboutSectionKey) => {
    const current = valuesRef.current;
    const savedNow = saved;
    if (!current || !savedNow) return;

    setSectionStatus(section, { kind: 'saving' });

    try {
      if (section === 'references') {
        await saveReferencesSection(current, savedNow.references);
      } else {
        const patch = buildSectionPatch(section, current);
        if (patch) {
          await updateSpace({ variables: { input: patch } });
        }
      }

      // Sync local buffer with the server. Refetch so the cache has the
      // canonical state (and so newly-created references get their real IDs
      // in place of temp ones).
      const fresh = await refetch();
      const freshSpace = fresh.data?.lookup.space;
      if (freshSpace) {
        const freshValues = mapSpaceToAboutFormValues(freshSpace);
        setValues(prev => {
          const base = prev ?? valuesRef.current;
          if (!base) return freshValues;
          // Keep edits on OTHER sections, overwrite just the section we saved.
          const next = mergeSavedSection(base, freshValues, section);
          valuesRef.current = next;
          return next;
        });
      }

      flashSaved(section);
    } catch (err) {
      setSectionStatus(section, {
        kind: 'error',
        message: err instanceof Error ? err.message : 'Save failed',
      });
    }
  };

  const isDirty = Object.values(dirtyByField).some(Boolean);

  const onSaveAll = async () => {
    const sections = (Object.keys(dirtyByField) as AboutSectionKey[]).filter(section => dirtyByField[section]);
    for (const section of sections) {
      await onSaveSection(section);
    }
  };

  // The per-section model has no global reset — discarding means dropping the
  // local buffer back to the cache-derived snapshot. Temp (unsaved) references
  // disappear because they only exist in the buffer.
  const onResetAll = () => {
    if (!saved) return;
    setValues(saved);
    valuesRef.current = saved;
    // Drop any pending saved-flash timers and per-section status so the UI
    // doesn't keep showing stale "saved"/"error" chips after a discard.
    for (const timer of Object.values(savedFlashTimers.current)) {
      if (timer) clearTimeout(timer);
    }
    savedFlashTimers.current = {};
    setSaveStatusByField({});
  };

  const previewCard = values ? buildPreviewCard(spaceId, values, spaceUrl, level) : null;

  // ────────────────── Classifications (D1: about.classifications[].values[]) ──────────────────
  // Each action commits on its own, immediately (FR-006a) — never buffered with the rest of the
  // About form. Cache normalization keeps single-entry updates in sync for free; add/remove change
  // the array's membership, which normalization can't do on its own, so those two refetch.
  //
  // A selection write is a full-replacement mutation (FR-012d): the checkbox only visually ticks
  // once the mutation round trip resolves and the cache updates. Without buffering the in-flight
  // intent locally, two clicks inside one round trip would both compute their "next selection" off
  // the same stale `entry.selectedValueIDs`, so the second write would silently clobber the first.
  // `classificationSelectionOverrides` holds the latest locally-applied selection per entry while
  // its write is in flight, so consecutive toggles compose off the last user intent, not the last
  // server response.
  const [classificationSelectionOverrides, setClassificationSelectionOverrides] = useState<Record<string, string[]>>(
    {}
  );

  const classifications = space
    ? mapClassificationEntries(space).map(entry =>
        entry.id in classificationSelectionOverrides
          ? { ...entry, selectedValueIDs: classificationSelectionOverrides[entry.id] }
          : entry
      )
    : [];

  /** Entries with a selection write currently in flight (drives the value selector's `disabled`). */
  const classificationSelectionPendingIds = Object.keys(classificationSelectionOverrides);

  const [classificationConflict, setClassificationConflict] = useState<{
    templateId: string;
    attemptedLabel: string;
  } | null>(null);
  const [classificationSubmitting, setClassificationSubmitting] = useState(false);
  const [classificationRemovedError, setClassificationRemovedError] = useState(false);

  /** Returns `true` on success (the caller may close the picker); `false` on a display-label conflict. */
  const addClassificationFromTemplate = async (templateId: string, displayLabel?: string): Promise<boolean> => {
    setClassificationSubmitting(true);
    try {
      await addClassificationEntryFromTemplate({
        variables: { classificationData: { spaceID: spaceId, templateID: templateId, displayLabel } },
      });
      await refetch();
      setClassificationConflict(null);
      return true;
    } catch (err) {
      if (isDisplayLabelConflictError(err)) {
        setClassificationConflict({ templateId, attemptedLabel: displayLabel ?? '' });
        return false;
      }
      // Any other failure surfaces via the Apollo error link / global handler.
      return false;
    } finally {
      setClassificationSubmitting(false);
    }
  };

  const updateClassificationSelection = async (entryId: string, selectedValueIDs: string[]) => {
    // Apply the intended selection locally right away — see the `classificationSelectionOverrides`
    // comment above the `classifications` derivation for why this has to happen before the mutation
    // is awaited, not after it resolves.
    setClassificationSelectionOverrides(prev => ({ ...prev, [entryId]: selectedValueIDs }));
    setSectionStatus('classifications', { kind: 'saving' });
    try {
      await updateClassificationEntrySelection({
        variables: { classificationData: { classificationEntryID: entryId, selectedValueIDs } },
      });
      flashSaved('classifications');
    } catch (err) {
      setSectionStatus('classifications', { kind: 'idle' });
      // A concurrently-removed entry fails the write against a now-deleted id — refetch so the UI
      // drops the stale entry instead of silently re-creating it (Edge Cases: concurrent removal).
      if (err instanceof ApolloError) {
        setClassificationRemovedError(true);
        await refetch();
      }
    } finally {
      // Only clear the override if it is still the one THIS call set. A slower, earlier write
      // resolving after a faster, later one must not wipe out the newer local selection while the
      // later write is still in flight — array identity (not a deep-equal) is enough here because
      // `selectedValueIDs` is the exact reference each call closed over above.
      setClassificationSelectionOverrides(prev => {
        if (prev[entryId] !== selectedValueIDs) return prev;
        const next = { ...prev };
        delete next[entryId];
        return next;
      });
    }
  };

  const updateClassificationDisplay = async (entryId: string, display: boolean) => {
    await updateClassificationEntryDisplay({
      variables: { classificationData: { classificationEntryID: entryId, display } },
    });
  };

  const removeClassification = async (entryId: string) => {
    await deleteClassificationEntry({ variables: { classificationData: { ID: entryId } } });
    await refetch();
  };

  const dismissClassificationConflict = () => setClassificationConflict(null);
  const dismissClassificationRemovedError = () => setClassificationRemovedError(false);

  return {
    values,
    previewCard,
    loading: queryLoading,
    error: queryError ?? null,
    dirtyByField,
    saveStatusByField,
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
    onSaveSection,
    isDirty,
    onSaveAll,
    onResetAll,
    classifications,
    classificationSelectionPendingIds,
    addClassificationFromTemplate,
    updateClassificationSelection,
    updateClassificationDisplay,
    removeClassification,
    classificationConflict,
    dismissClassificationConflict,
    classificationSubmitting,
    classificationRemovedError,
    dismissClassificationRemovedError,
  };
}

/**
 * Overlay the freshly-saved section's values onto the current buffer, so the
 * user's unsaved edits in other sections are preserved after a per-section save.
 */
function mergeSavedSection(buffer: AboutFormValues, fresh: AboutFormValues, section: AboutSectionKey): AboutFormValues {
  switch (section) {
    case 'name':
      return { ...buffer, name: fresh.name };
    case 'tagline':
      return { ...buffer, tagline: fresh.tagline };
    case 'what':
      return { ...buffer, what: fresh.what };
    case 'why':
      return { ...buffer, why: fresh.why };
    case 'who':
      return { ...buffer, who: fresh.who };
    case 'location':
      return { ...buffer, city: fresh.city, country: fresh.country };
    case 'tags':
      return { ...buffer, tags: fresh.tags, tagsetId: fresh.tagsetId };
    case 'references':
      return { ...buffer, references: fresh.references };
    case 'classifications':
      // `onSaveSection` never runs for this key (see `buildSectionPatch`) — `AboutFormValues`
      // doesn't even carry a classifications field to merge. Exhaustive case only.
      return buffer;
  }
}

/**
 * Alias rather than a re-declaration: this value goes straight into
 * `ImageCropDialog`'s `config` prop, and the hand-copied version this replaces
 * had already fallen a field behind the dialog it configures.
 */
export type CropConfig = ImageCropConfig;

export type PendingCrop = {
  key: 'avatar' | 'pageBanner' | 'cardBanner';
  file: File;
  config: CropConfig;
  /** The visual's current alt text, so the dialog opens with it instead of blank. */
  altText: string;
  selectedAspectRatio?: number;
  /** True when the crop source is the already-uploaded visual, whose original the save overwrites. */
  isRecrop?: boolean;
};
