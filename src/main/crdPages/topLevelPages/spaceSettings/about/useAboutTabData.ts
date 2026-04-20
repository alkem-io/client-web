import { useEffect, useRef, useState, useTransition } from 'react';
import {
  useCreateReferenceOnProfileMutation,
  useDeleteReferenceMutation,
  useSpaceAboutDetailsQuery,
  useUpdateSpaceMutation,
  useUploadVisualMutation,
} from '@/core/apollo/generated/apollo-hooks';
import type { UpdateSpaceInput } from '@/core/apollo/generated/graphql-schema';
import type {
  AboutFormValues,
  AboutReference,
  AboutSectionKey,
  AboutSectionSaveStatus,
} from '@/crd/components/space/settings/SpaceSettingsAboutView.types';
import { buildPreviewCard, mapSpaceToAboutFormValues } from './aboutMapper';

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
  pendingCrop: PendingCrop | null;
  onCropComplete: (croppedFile: File, altText: string) => void;
  onCropCancel: () => void;
  onAddReference: () => void;
  onUpdateReference: (id: string, patch: Partial<Omit<AboutReference, 'id'>>) => void;
  /** Opens the removal confirmation dialog — consumer renders the dialog. */
  onRequestRemoveReference: (id: string) => void;
  /** The reference queued for removal, if the confirmation is open. */
  pendingReferenceDelete: { id: string; title: string } | null;
  onConfirmRemoveReference: () => void;
  onCancelRemoveReference: () => void;
  /** Save a single section — only that section's fields are persisted. */
  onSaveSection: (section: AboutSectionKey) => Promise<void>;
};

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
 * There is intentionally NO global reset — dirty is derived from the Apollo
 * cache and each section clears itself when saved. If the admin leaves the
 * tab with unsaved edits, the local buffer is discarded by a hard reload.
 */
export function useAboutTabData(spaceId: string, spaceUrl: string): UseAboutTabDataResult {
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

  const [updateSpace] = useUpdateSpaceMutation();
  const [uploadVisual] = useUploadVisualMutation();
  const [createReference] = useCreateReferenceOnProfileMutation();
  const [deleteReference] = useDeleteReferenceMutation();

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

  const onAddReference = () => {
    setValues(prev => {
      const base = prev ?? valuesRef.current;
      if (!base) return prev;
      const newRef: AboutReference = {
        id: `${TEMP_PREFIX}${Date.now()}`,
        title: '',
        uri: '',
        description: '',
      };
      const next: AboutFormValues = { ...base, references: [...base.references, newRef] };
      valuesRef.current = next;
      return next;
    });
  };

  const onUpdateReference = (id: string, patch: Partial<Omit<AboutReference, 'id'>>) => {
    setValues(prev => {
      const base = prev ?? valuesRef.current;
      if (!base) return prev;
      const next: AboutFormValues = {
        ...base,
        references: base.references.map(r => (r.id === id ? { ...r, ...patch } : r)),
      };
      valuesRef.current = next;
      return next;
    });
  };

  const [pendingReferenceDelete, setPendingReferenceDelete] = useState<{ id: string; title: string } | null>(null);

  const onRequestRemoveReference = (id: string) => {
    const base = valuesRef.current;
    const ref = base?.references.find(r => r.id === id);
    if (!ref) return;
    setPendingReferenceDelete({ id, title: ref.title });
  };

  const onConfirmRemoveReference = () => {
    const pending = pendingReferenceDelete;
    if (!pending) return;
    setValues(prev => {
      const base = prev ?? valuesRef.current;
      if (!base) return prev;
      const next: AboutFormValues = { ...base, references: base.references.filter(r => r.id !== pending.id) };
      valuesRef.current = next;
      return next;
    });
    setPendingReferenceDelete(null);
  };

  const onCancelRemoveReference = () => setPendingReferenceDelete(null);

  // ────────────────── Image uploads (immediate) ──────────────────

  const uploadVisualForField = async (key: 'avatar' | 'pageBanner' | 'cardBanner', file: File) => {
    const current = valuesRef.current;
    const visual = current?.[key];
    if (!visual?.id) return;
    startTransition(() => {
      void uploadVisual({
        variables: { file, uploadData: { visualID: visual.id, alternativeText: visual.altText ?? undefined } },
      }).then(result => {
        const uploaded = result.data?.uploadImageOnVisual;
        if (uploaded) {
          setValues(prev => {
            const base = prev ?? valuesRef.current;
            if (!base) return prev;
            const next: AboutFormValues = {
              ...base,
              [key]: { ...base[key], uri: uploaded.uri, altText: uploaded.alternativeText ?? null },
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
    const profile = space?.about.profile;
    const visualRaw = key === 'avatar' ? profile?.avatar : key === 'pageBanner' ? profile?.banner : profile?.cardBanner;
    return {
      aspectRatio: visualRaw?.aspectRatio ?? 1,
      maxHeight: visualRaw?.maxHeight,
      minHeight: visualRaw?.minHeight,
      maxWidth: visualRaw?.maxWidth,
      minWidth: visualRaw?.minWidth,
    };
  };

  const onUploadAvatarWithCrop = (file: File) =>
    setPendingCrop({ key: 'avatar', file, config: buildCropConfig('avatar') });
  const onUploadPageBannerWithCrop = (file: File) =>
    setPendingCrop({ key: 'pageBanner', file, config: buildCropConfig('pageBanner') });
  const onUploadCardBannerWithCrop = (file: File) =>
    setPendingCrop({ key: 'cardBanner', file, config: buildCropConfig('cardBanner') });

  const onCropComplete = (croppedFile: File, altText: string) => {
    const crop = pendingCrop;
    setPendingCrop(null);
    if (!crop) return;
    const key = crop.key;
    setValues(prev => {
      const base = prev ?? valuesRef.current;
      if (!base) return prev;
      const next: AboutFormValues = { ...base, [key]: { ...base[key], altText } };
      valuesRef.current = next;
      return next;
    });
    void uploadVisualForField(key, croppedFile);
  };

  const onCropCancel = () => setPendingCrop(null);

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
        // eslint-disable-next-line no-await-in-loop
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
      // eslint-disable-next-line no-await-in-loop
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

  const previewCard = values ? buildPreviewCard(spaceId, values, spaceUrl) : null;

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
    pendingCrop,
    onCropComplete,
    onCropCancel,
    onAddReference,
    onUpdateReference,
    onRequestRemoveReference,
    pendingReferenceDelete,
    onConfirmRemoveReference,
    onCancelRemoveReference,
    onSaveSection,
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
  }
}

export type CropConfig = {
  aspectRatio?: number;
  maxHeight?: number;
  minHeight?: number;
  maxWidth?: number;
  minWidth?: number;
};

export type PendingCrop = {
  key: 'avatar' | 'pageBanner' | 'cardBanner';
  file: File;
  config: CropConfig;
};
