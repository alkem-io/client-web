import { useEffect, useRef, useState } from 'react';
import {
  useCreateReferenceOnProfileMutation,
  useCreateTagsetOnProfileMutation,
  useDeleteReferenceMutation,
  useUpdateVirtualContributorMutation,
  useUploadVisualMutation,
  useVirtualContributorQuery,
} from '@/core/apollo/generated/apollo-hooks';
import type { UpdateProfileInput, UpdateVirtualContributorInput } from '@/core/apollo/generated/graphql-schema';
import { TagsetReservedName } from '@/core/apollo/generated/graphql-schema';
import { SAVED_FLASH_MS } from '@/crd/components/common/FieldFooter';
import type {
  SectionSaveStatus,
  VcProfileFormValues,
  VcProfileReference,
  VcProfileSectionKey,
} from '@/crd/components/virtualContributor/settings/VCProfileTabView.types';
import type { ReferenceRow } from '@/crd/forms/references/ReferencesEditor';
import { mapVirtualContributorToProfileFormValues } from './vcProfileMapper';

const TEMP_PREFIX = 'temp-';
const isTempId = (id: string) => id.startsWith(TEMP_PREFIX);

export type AvatarCropConfig = {
  aspectRatio?: number;
  maxWidth?: number;
  minWidth?: number;
  maxHeight?: number;
  minHeight?: number;
};

export type PendingAvatarCrop = {
  file: File;
  config: AvatarCropConfig;
};

export type UseVcProfileTabDataResult = {
  values: VcProfileFormValues | null;
  loading: boolean;
  error: Error | null;
  dirtyByField: Partial<Record<VcProfileSectionKey, boolean>>;
  saveStatusByField: Partial<Record<VcProfileSectionKey, SectionSaveStatus>>;
  uploadingAvatar: boolean;
  pendingAvatarCrop: PendingAvatarCrop | null;

  onChange: (patch: Partial<VcProfileFormValues>) => void;
  /** Replace the references list — the shared ReferencesEditor owns add/edit/remove + delete-confirm. */
  onReferencesChange: (rows: ReferenceRow[]) => void;
  onUploadAvatar: (file: File) => void;
  onAvatarCropComplete: (croppedFile: File, altText: string) => void;
  onAvatarCropCancel: () => void;
  onSaveSection: (section: VcProfileSectionKey) => Promise<void>;
};

/**
 * Per-section save hook for the VC Profile tab — clone of
 * `useUserProfileTabData` (FR-160 mirror of FR-022). Same idle/saving/saved/
 * error state machine, same `SAVED_FLASH_MS = 1800` ms saved-flash, same
 * lazy-create flow for Keywords on first save, same references-batch flow.
 *
 * Avatar (FR-163, mirror of FR-024): file pick → opens
 * `ImageCropDialog` first; the crop dialog's onSave triggers
 * `uploadImageOnVisual` with the cropped/resized file + alt text.
 */
export const useVcProfileTabData = (vcId: string | undefined): UseVcProfileTabDataResult => {
  const {
    data,
    loading: queryLoading,
    error: queryError,
    refetch,
  } = useVirtualContributorQuery({
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { id: vcId! },
    skip: !vcId,
  });

  const vc = data?.lookup.virtualContributor;
  const saved: VcProfileFormValues | null = vc ? mapVirtualContributorToProfileFormValues(vc) : null;

  const [values, setValues] = useState<VcProfileFormValues | null>(null);
  const valuesRef = useRef<VcProfileFormValues | null>(null);

  const [saveStatusByField, setSaveStatusByField] = useState<Partial<Record<VcProfileSectionKey, SectionSaveStatus>>>(
    {}
  );
  const savedFlashTimers = useRef<Partial<Record<VcProfileSectionKey, ReturnType<typeof setTimeout>>>>({});

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [pendingAvatarCrop, setPendingAvatarCrop] = useState<PendingAvatarCrop | null>(null);

  const [updateVc] = useUpdateVirtualContributorMutation();
  const [createReference] = useCreateReferenceOnProfileMutation();
  const [deleteReference] = useDeleteReferenceMutation();
  const [createTagset] = useCreateTagsetOnProfileMutation();
  const [uploadVisual] = useUploadVisualMutation();

  useEffect(() => {
    if (saved && valuesRef.current === null) {
      valuesRef.current = saved;
      setValues(saved);
    }
  }, [saved]);

  useEffect(
    () => () => {
      for (const timer of Object.values(savedFlashTimers.current)) {
        if (timer) clearTimeout(timer);
      }
    },
    []
  );

  // ────────────────── Dirty map (per section) ──────────────────

  const arrayEq = <T>(a: ReadonlyArray<T>, b: ReadonlyArray<T>) => JSON.stringify(a) === JSON.stringify(b);

  const dirtyByField: Partial<Record<VcProfileSectionKey, boolean>> = (() => {
    if (!values || !saved) return {};
    return {
      displayName: values.displayName !== saved.displayName,
      tagline: values.tagline !== saved.tagline,
      description: values.description !== saved.description,
      keywords: !arrayEq(values.keywords.tags, saved.keywords.tags),
      references: !arrayEq(values.references, saved.references),
    };
  })();

  // ────────────────── Local mutations ──────────────────

  const clearSectionErrorIfPresent = (section: VcProfileSectionKey) => {
    setSaveStatusByField(prev => {
      const current = prev[section];
      if (!current || current.kind !== 'error') return prev;
      const next = { ...prev };
      delete next[section];
      return next;
    });
  };

  const onChange = (patch: Partial<VcProfileFormValues>) => {
    setValues(prev => {
      const base = prev ?? valuesRef.current;
      if (!base) return prev;
      const next = { ...base, ...patch };
      valuesRef.current = next;
      return next;
    });
    if ('displayName' in patch) clearSectionErrorIfPresent('displayName');
    if ('tagline' in patch) clearSectionErrorIfPresent('tagline');
    if ('description' in patch) clearSectionErrorIfPresent('description');
    if ('keywords' in patch) clearSectionErrorIfPresent('keywords');
    if ('references' in patch) clearSectionErrorIfPresent('references');
  };

  // The shared ReferencesEditor manages the references list (+ its own delete-confirm) and emits the
  // full list. New rows arrive without an `id`; assign a temp id so the per-section save diffs them
  // as creates.
  const onReferencesChange = (rows: ReferenceRow[]) => {
    setValues(prev => {
      const base = prev ?? valuesRef.current;
      if (!base) return prev;
      const mapped: VcProfileReference[] = rows.map((r, i) => ({
        id: r.id ?? `${TEMP_PREFIX}${Date.now()}-${i}`,
        name: r.name,
        uri: r.uri,
        description: r.description ?? '',
      }));
      const next = { ...base, references: mapped };
      valuesRef.current = next;
      return next;
    });
    clearSectionErrorIfPresent('references');
  };

  // ────────────────── Avatar (FR-163 — crop + commit) ──────────────────

  const onUploadAvatar = (file: File) => {
    const current = valuesRef.current;
    if (!current?.avatar.id) return;
    const visualRaw = vc?.profile?.avatar;
    setPendingAvatarCrop({
      file,
      config: {
        aspectRatio: visualRaw?.aspectRatio ?? 1,
        maxWidth: visualRaw?.maxWidth,
        minWidth: visualRaw?.minWidth,
        maxHeight: visualRaw?.maxHeight,
        minHeight: visualRaw?.minHeight,
      },
    });
  };

  const onAvatarCropCancel = () => setPendingAvatarCrop(null);

  const onAvatarCropComplete = (croppedFile: File, altText: string) => {
    const current = valuesRef.current;
    if (!current?.avatar.id) {
      setPendingAvatarCrop(null);
      return;
    }
    const visualId = current.avatar.id;
    setPendingAvatarCrop(null);
    setValues(prev => {
      const base = prev ?? valuesRef.current;
      if (!base) return prev;
      const next = { ...base, avatar: { ...base.avatar, altText } };
      valuesRef.current = next;
      return next;
    });
    setUploadingAvatar(true);
    void uploadVisual({
      variables: {
        file: croppedFile,
        uploadData: {
          visualID: visualId,
          alternativeText: altText || undefined,
        },
      },
    })
      .then(result => {
        const uploaded = result.data?.uploadImageOnVisual;
        if (uploaded) {
          setValues(prev => {
            const base = prev ?? valuesRef.current;
            if (!base) return prev;
            const next = {
              ...base,
              avatar: {
                ...base.avatar,
                uri: uploaded.uri ?? null,
                altText: uploaded.alternativeText ?? null,
              },
            };
            valuesRef.current = next;
            return next;
          });
        }
      })
      .finally(() => setUploadingAvatar(false));
  };

  // ────────────────── Per-section save ──────────────────

  const setSectionStatus = (section: VcProfileSectionKey, status: SectionSaveStatus) => {
    setSaveStatusByField(prev => ({ ...prev, [section]: status }));
  };

  const flashSaved = (section: VcProfileSectionKey) => {
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

  const buildVcPatch = (
    section: VcProfileSectionKey,
    current: VcProfileFormValues
  ): UpdateVirtualContributorInput | null => {
    if (!vcId) return null;
    const base: UpdateVirtualContributorInput = { ID: vcId };
    switch (section) {
      case 'displayName':
        return { ...base, profileData: { displayName: current.displayName } };
      case 'tagline':
        return { ...base, profileData: { tagline: current.tagline } };
      case 'description':
        return { ...base, profileData: { description: current.description } };
      case 'keywords':
      case 'references':
        return null;
    }
  };

  const saveKeywordsSection = async (current: VcProfileFormValues): Promise<void> => {
    if (!vcId) return;
    const tagset = current.keywords;

    if (!tagset.id) {
      if (!current.profileId) return;
      const result = await createTagset({
        variables: { input: { profileID: current.profileId, name: TagsetReservedName.Keywords, tags: tagset.tags } },
      });
      const newId = result.data?.createTagsetOnProfile?.id;
      if (newId) {
        setValues(prev => {
          const base = prev ?? valuesRef.current;
          if (!base) return prev;
          const next = { ...base, keywords: { ...base.keywords, id: newId } };
          valuesRef.current = next;
          return next;
        });
      }
      return;
    }

    await updateVc({
      variables: {
        virtualContributorData: { ID: vcId, profileData: { tagsets: [{ ID: tagset.id, tags: tagset.tags }] } },
      },
    });
  };

  const collectExistingReferencePatches = (current: VcProfileFormValues): UpdateProfileInput['references'] => {
    return current.references
      .filter(r => !isTempId(r.id) && r.id)
      .map(r => ({
        ID: r.id,
        name: r.name,
        uri: r.uri,
        description: r.description,
      }));
  };

  const collectNewReferences = (current: VcProfileFormValues): Array<VcProfileReference> =>
    current.references.filter(r => isTempId(r.id) && r.name.trim());

  const collectRemovedReferenceIds = (current: VcProfileFormValues, savedNow: VcProfileFormValues): string[] => {
    const currentIds = new Set(current.references.map(r => r.id));
    return savedNow.references.filter(r => r.id && !isTempId(r.id) && !currentIds.has(r.id)).map(r => r.id);
  };

  const saveReferencesSection = async (current: VcProfileFormValues, savedNow: VcProfileFormValues) => {
    if (!vcId) return;

    const existingPatches = collectExistingReferencePatches(current);
    if (existingPatches && existingPatches.length > 0) {
      await updateVc({
        variables: { virtualContributorData: { ID: vcId, profileData: { references: existingPatches } } },
      });
    }

    const toCreate = collectNewReferences(current);
    for (const ref of toCreate) {
      await createReference({
        variables: {
          input: {
            profileID: current.profileId,
            name: ref.name || 'reference',
            uri: ref.uri,
            description: ref.description,
          },
        },
      });
    }

    const removedIds = collectRemovedReferenceIds(current, savedNow);
    for (const id of removedIds) {
      await deleteReference({ variables: { input: { ID: id } } });
    }
  };

  const onSaveSection = async (section: VcProfileSectionKey) => {
    const current = valuesRef.current;
    const savedNow = saved;
    if (!current || !savedNow || !vcId) return;

    setSectionStatus(section, { kind: 'saving' });

    try {
      if (section === 'keywords') {
        await saveKeywordsSection(current);
      } else if (section === 'references') {
        await saveReferencesSection(current, savedNow);
      } else {
        const patch = buildVcPatch(section, current);
        if (patch) {
          await updateVc({ variables: { virtualContributorData: patch } });
        }
      }

      const fresh = await refetch();
      const freshVc = fresh.data?.lookup.virtualContributor;
      if (freshVc) {
        const freshValues = mapVirtualContributorToProfileFormValues(freshVc);
        setValues(prev => {
          const base = prev ?? valuesRef.current;
          const merged = base ? mergeSavedSection(base, freshValues, section) : freshValues;
          valuesRef.current = merged;
          return merged;
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

  return {
    values,
    loading: queryLoading,
    error: queryError ?? null,
    dirtyByField,
    saveStatusByField,
    uploadingAvatar,
    pendingAvatarCrop,
    onChange,
    onReferencesChange,
    onUploadAvatar,
    onAvatarCropComplete,
    onAvatarCropCancel,
    onSaveSection,
  };
};

const mergeSavedSection = (
  buffer: VcProfileFormValues,
  fresh: VcProfileFormValues,
  section: VcProfileSectionKey
): VcProfileFormValues => {
  switch (section) {
    case 'displayName':
      return { ...buffer, displayName: fresh.displayName };
    case 'tagline':
      return { ...buffer, tagline: fresh.tagline };
    case 'description':
      return { ...buffer, description: fresh.description };
    case 'keywords':
      return { ...buffer, keywords: fresh.keywords };
    case 'references':
      return { ...buffer, references: fresh.references };
  }
};

export default useVcProfileTabData;
