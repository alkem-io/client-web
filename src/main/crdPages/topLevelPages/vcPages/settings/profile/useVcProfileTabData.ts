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
import type {
  VcProfileFormValues,
  VcProfileReference,
} from '@/crd/components/virtualContributor/settings/VCProfileTabView.types';
import type { ReferenceRow } from '@/crd/forms/references/ReferencesEditor';
import type { TabUnsavedChanges } from '@/main/crdPages/utils/tabUnsavedChanges';
import {
  countReferenceChanges,
  diffProfileReferences,
  newReferenceId,
  rebaseReferences,
  saveProfileChanges,
} from '../../../common/profileChanges';
import { mapVirtualContributorToProfileFormValues } from './vcProfileMapper';

const SCALAR_FIELDS = ['displayName', 'tagline', 'description'] as const;

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
  uploadingAvatar: boolean;
  pendingAvatarCrop: PendingAvatarCrop | null;

  onChange: (patch: Partial<VcProfileFormValues>) => void;
  /** Replace the references list — the shared ReferencesEditor owns add/edit/remove + delete-confirm. */
  onReferencesChange: (rows: ReferenceRow[]) => void;
  onUploadAvatar: (file: File) => void;
  onAvatarCropComplete: (croppedFile: File, altText: string) => void;
  onAvatarCropCancel: () => void;
  /** Every field is buffered and saved through the unsaved-changes bar (spec 097 Session 2026-10-22). */
  unsaved: TabUnsavedChanges;
};

/**
 * VC Profile tab data hook — saved through the tab-wide unsaved-changes bar,
 * like `useUserProfileTabData`. Every field lives in a local buffer over the
 * cache-derived server values (`saved`); `unsaved` counts the changed fields,
 * `saveAll` writes them all and `reset` drops the buffer back to `saved`. The
 * Keywords tagset is lazily created on the first Save.
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
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  const update = (apply: (base: VcProfileFormValues) => VcProfileFormValues) => {
    setValues(prev => {
      const base = prev ?? valuesRef.current;
      if (!base) return prev;
      const next = apply(base);
      valuesRef.current = next;
      return next;
    });
  };

  const onChange = (patch: Partial<VcProfileFormValues>) => update(base => ({ ...base, ...patch }));

  // The shared ReferencesEditor manages the references list (+ its own delete-confirm) and emits the
  // full list. New rows arrive without an `id`; a temp id marks them as creates.
  const onReferencesChange = (rows: ReferenceRow[]) =>
    update(base => ({
      ...base,
      references: rows.map((r, i) => ({
        id: r.id ?? newReferenceId(i),
        name: r.name,
        uri: r.uri,
        description: r.description ?? '',
      })),
    }));

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
    update(base => ({ ...base, avatar: { ...base.avatar, altText } }));
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
          update(base => ({
            ...base,
            avatar: { ...base.avatar, uri: uploaded.uri ?? null, altText: uploaded.alternativeText ?? null },
          }));
        }
      })
      .finally(() => setUploadingAvatar(false));
  };

  // ────────────────── Save / Discard (the unsaved-changes bar) ──────────────────

  const changedScalars = values && saved ? SCALAR_FIELDS.filter(f => values[f] !== saved[f]) : [];
  const keywordsChanged =
    values !== null && saved !== null && JSON.stringify(values.keywords.tags) !== JSON.stringify(saved.keywords.tags);
  const referenceChanges =
    values && saved
      ? diffProfileReferences<VcProfileReference>(values.references, saved.references)
      : { created: [], edited: [], removed: [] };
  const unsavedCount = changedScalars.length + (keywordsChanged ? 1 : 0) + countReferenceChanges(referenceChanges);

  const canSave = values !== null && Boolean(values.displayName.trim());

  const saveAll = async (): Promise<boolean> => {
    const current = valuesRef.current;
    if (!current || !saved || !vcId || unsavedCount === 0) return true;
    setSaving(true);
    setSaveError(null);

    // One updateVirtualContributor for every changed field, the existing tagset and edited references.
    const profileData: UpdateProfileInput = {};
    if (current.displayName !== saved.displayName) profileData.displayName = current.displayName;
    if (current.tagline !== saved.tagline) profileData.tagline = current.tagline;
    if (current.description !== saved.description) profileData.description = current.description;
    if (keywordsChanged && current.keywords.id) {
      profileData.tagsets = [{ ID: current.keywords.id, tags: current.keywords.tags }];
    }
    if (referenceChanges.edited.length) {
      profileData.references = referenceChanges.edited.map(r => ({
        ID: r.id,
        name: r.name,
        uri: r.uri,
        description: r.description,
      }));
    }
    const input: UpdateVirtualContributorInput = { ID: vcId, profileData };

    const result = await saveProfileChanges({
      updateCore: Object.keys(profileData).length
        ? () => updateVc({ variables: { virtualContributorData: input } })
        : null,
      tagsetsToCreate:
        keywordsChanged && !current.keywords.id
          ? [
              {
                field: 'keywords',
                create: () =>
                  createTagset({
                    variables: {
                      input: {
                        profileID: current.profileId,
                        name: TagsetReservedName.Keywords,
                        tags: current.keywords.tags,
                      },
                    },
                  }),
              },
            ]
          : [],
      references: referenceChanges,
      createReference: ref =>
        createReference({
          variables: {
            input: {
              profileID: current.profileId,
              name: ref.name || 'reference',
              uri: ref.uri,
              description: ref.description,
            },
          },
        }),
      deleteReference: ref => deleteReference({ variables: { input: { ID: ref.id } } }),
    });

    // Rebase the buffer on the fresh server values: what saved now matches the server, what
    // failed stays buffered so it stays counted and Save retries it.
    const freshVc = (await refetch().catch(() => null))?.data?.lookup.virtualContributor;
    if (freshVc) {
      const fresh = mapVirtualContributorToProfileFormValues(freshVc);
      const next: VcProfileFormValues = { ...fresh, avatar: current.avatar };
      if (result.coreFailed) {
        for (const f of SCALAR_FIELDS) next[f] = current[f];
      }
      if ((result.coreFailed && current.keywords.id) || result.failedTagsets.length) next.keywords = current.keywords;
      next.references = rebaseReferences(fresh.references, referenceChanges, result);
      valuesRef.current = next;
      setValues(next);
    }

    setSaving(false);
    setSaveError(result.firstError);
    return result.firstError === null;
  };

  const reset = () => {
    if (saved) {
      const next = { ...saved, avatar: valuesRef.current?.avatar ?? saved.avatar };
      valuesRef.current = next;
      setValues(next);
    }
    setSaveError(null);
  };

  return {
    values,
    loading: queryLoading,
    error: queryError ?? null,
    uploadingAvatar,
    pendingAvatarCrop,
    onChange,
    onReferencesChange,
    onUploadAvatar,
    onAvatarCropComplete,
    onAvatarCropCancel,
    unsaved: { count: unsavedCount, canSave, saving, error: saveError, saveAll, reset },
  };
};

export default useVcProfileTabData;
