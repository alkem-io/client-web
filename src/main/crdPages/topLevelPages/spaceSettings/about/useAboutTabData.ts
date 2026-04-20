import { useEffect, useRef, useState, useTransition } from 'react';
import {
  useCreateReferenceOnProfileMutation,
  useDeleteReferenceMutation,
  useSpaceAboutDetailsQuery,
  useUpdateSpaceMutation,
  useUploadVisualMutation,
} from '@/core/apollo/generated/apollo-hooks';
import type { UpdateSpaceInput } from '@/core/apollo/generated/graphql-schema';
import type { AboutFormValues, AboutReference } from '@/crd/components/space/settings/SpaceSettingsAboutView.types';
import { buildPreviewCard, mapSpaceToAboutFormValues } from './aboutMapper';

export type { AboutFormValues };

export type AboutSaveBarState =
  | { kind: 'clean' }
  | { kind: 'dirty'; canSave: boolean }
  | { kind: 'saving' }
  | { kind: 'saveError'; message: string };

export type UseAboutTabDataResult = {
  values: AboutFormValues | null;
  previewCard: ReturnType<typeof buildPreviewCard> | null;
  saveBar: AboutSaveBarState;
  loading: boolean;
  error: Error | null;
  onChange: (patch: Partial<AboutFormValues>) => void;
  onUploadAvatar: (file: File) => void;
  onUploadPageBanner: (file: File) => void;
  onUploadCardBanner: (file: File) => void;
  pendingCrop: PendingCrop | null;
  onCropComplete: (croppedFile: File, altText: string) => void;
  onCropCancel: () => void;
  onAddReference: () => void;
  onUpdateReference: (id: string, patch: Partial<Omit<AboutReference, 'id'>>) => void;
  onRemoveReference: (id: string) => void;
  onSave: () => Promise<void>;
  onReset: () => void;
  isDirty: boolean;
};

const TEMP_PREFIX = 'temp-';
function isTempId(id: string) {
  return id.startsWith(TEMP_PREFIX);
}

/**
 * CRD About tab data hook — buffer + Save Changes model.
 *
 * All text/scalar field changes are local-only until Save Changes.
 * Image uploads fire immediately (the file picker IS the commit).
 * References: "Add" creates a local row; "Save" persists new refs
 * via createReferenceOnProfile, patches existing ones, and deletes removed ones.
 */
export function useAboutTabData(spaceId: string, spaceUrl: string): UseAboutTabDataResult {
  const {
    data,
    loading: queryLoading,
    error: queryError,
    refetch,
  } = useSpaceAboutDetailsQuery({ variables: { spaceId }, skip: !spaceId });

  const space = data?.lookup.space;

  const [values, setValues] = useState<AboutFormValues | null>(null);
  const [saveBar, setSaveBar] = useState<AboutSaveBarState>({ kind: 'clean' });
  const [, startTransition] = useTransition();
  const valuesRef = useRef<AboutFormValues | null>(null);
  const snapshotRef = useRef<AboutFormValues | null>(null);
  /** IDs of references that existed in the snapshot but were removed locally. */
  const deletedRefIdsRef = useRef<Set<string>>(new Set());

  const [updateSpace] = useUpdateSpaceMutation();
  const [uploadVisual] = useUploadVisualMutation();
  const [createReference] = useCreateReferenceOnProfileMutation();
  const [deleteReference] = useDeleteReferenceMutation();

  // Seed once.
  useEffect(() => {
    if (space && snapshotRef.current === null) {
      const seeded = mapSpaceToAboutFormValues(space);
      snapshotRef.current = seeded;
      valuesRef.current = seeded;
      setValues(seeded);
    }
  }, [space]);

  // Dirty check.
  const isDirty = (() => {
    if (!values || !snapshotRef.current) return false;
    return JSON.stringify(values) !== JSON.stringify(snapshotRef.current) || deletedRefIdsRef.current.size > 0;
  })();

  useEffect(() => {
    setSaveBar(prev => {
      if (prev.kind === 'saving' || prev.kind === 'saveError') return prev;
      return isDirty ? { kind: 'dirty', canSave: true } : { kind: 'clean' };
    });
  }, [isDirty]);

  const readLatest = (): AboutFormValues | null => valuesRef.current;

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

  const onRemoveReference = (id: string) => {
    if (!isTempId(id)) {
      deletedRefIdsRef.current.add(id);
    }
    setValues(prev => {
      const base = prev ?? valuesRef.current;
      if (!base) return prev;
      const next: AboutFormValues = { ...base, references: base.references.filter(r => r.id !== id) };
      valuesRef.current = next;
      return next;
    });
  };

  // ────────────────── Image uploads (immediate) ──────────────────

  const uploadVisualForField = async (key: 'avatar' | 'pageBanner' | 'cardBanner', file: File) => {
    const current = readLatest();
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
            // Also update snapshot so this doesn't count as dirty.
            if (snapshotRef.current) {
              snapshotRef.current = { ...snapshotRef.current, [key]: next[key] };
            }
            return next;
          });
        }
      });
    });
  };

  const _onUploadAvatar = (file: File) => void uploadVisualForField('avatar', file);
  const _onUploadPageBanner = (file: File) => void uploadVisualForField('pageBanner', file);
  const _onUploadCardBanner = (file: File) => void uploadVisualForField('cardBanner', file);

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

  // ────────────────── Save / Reset ──────────────────

  const onSave = async () => {
    const current = readLatest();
    if (!current) return;
    setSaveBar({ kind: 'saving' });

    try {
      // 1) Scalar profile fields.
      const profilePatch: UpdateSpaceInput = {
        ID: spaceId,
        about: {
          profile: {
            displayName: current.name,
            tagline: current.tagline,
            description: current.what,
            location: { country: current.country, city: current.city },
            tagsets: current.tagsetId ? [{ ID: current.tagsetId, tags: current.tags }] : undefined,
            references: current.references
              .filter(r => !isTempId(r.id))
              .map(r => ({ ID: r.id, name: r.title, uri: r.uri, description: r.description })),
          },
          why: current.why,
          who: current.who,
        },
      };
      await updateSpace({ variables: { input: profilePatch } });

      // 2) Create new references (temp IDs).
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

      // 3) Delete removed references.
      for (const refId of deletedRefIdsRef.current) {
        // eslint-disable-next-line no-await-in-loop
        await deleteReference({ variables: { input: { ID: refId } } });
      }
      deletedRefIdsRef.current.clear();

      // Refetch + reseed snapshot.
      const fresh = await refetch();
      const freshSpace = fresh.data?.lookup.space;
      if (freshSpace) {
        const newSnapshot = mapSpaceToAboutFormValues(freshSpace);
        snapshotRef.current = newSnapshot;
        valuesRef.current = newSnapshot;
        setValues(newSnapshot);
      }
      setSaveBar({ kind: 'clean' });
    } catch (err) {
      setSaveBar({ kind: 'saveError', message: err instanceof Error ? err.message : 'Save failed' });
    }
  };

  const onReset = () => {
    const snap = snapshotRef.current;
    if (!snap) return;
    valuesRef.current = snap;
    setValues(snap);
    deletedRefIdsRef.current.clear();
    setSaveBar({ kind: 'clean' });
  };

  const previewCard = values ? buildPreviewCard(spaceId, values, spaceUrl) : null;

  return {
    values,
    previewCard,
    saveBar,
    loading: queryLoading,
    error: queryError ?? null,
    onChange,
    onUploadAvatar: onUploadAvatarWithCrop,
    onUploadPageBanner: onUploadPageBannerWithCrop,
    onUploadCardBanner: onUploadCardBannerWithCrop,
    pendingCrop,
    onCropComplete,
    onCropCancel,
    onAddReference,
    onUpdateReference,
    onRemoveReference,
    onSave,
    onReset,
    isDirty,
  };
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
