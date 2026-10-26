import { useEffect, useRef, useState } from 'react';
import {
  useCreateReferenceOnProfileMutation,
  useCreateTagsetOnProfileMutation,
  useDeleteReferenceMutation,
  useUpdateUserMutation,
  useUploadVisualMutation,
  useUserQuery,
} from '@/core/apollo/generated/apollo-hooks';
import type { UpdateProfileInput, UpdateUserInput } from '@/core/apollo/generated/graphql-schema';
import { TagsetReservedName } from '@/core/apollo/generated/graphql-schema';
import { SOCIAL_LINK_KINDS } from '@/crd/components/contributor/settings/ProfileFormFields';
import type {
  UserProfileFormValues,
  UserProfileReference,
} from '@/crd/components/user/settings/UserProfileTabView.types';
import type { ReferenceRow } from '@/crd/forms/references/ReferencesEditor';
import { isValidPhoneOrEmpty } from '@/crd/lib/validators';
import type { TabUnsavedChanges } from '@/main/crdPages/utils/tabUnsavedChanges';
import {
  countReferenceChanges,
  diffProfileReferences,
  newReferenceId,
  rebaseReferences,
  saveProfileChanges,
} from '../../../common/profileChanges';
import { mapUserToProfileFormValues } from './userProfileMapper';

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

export type UseUserProfileTabDataResult = {
  values: UserProfileFormValues | null;
  loading: boolean;
  error: Error | null;
  uploadingAvatar: boolean;
  pendingAvatarCrop: PendingAvatarCrop | null;

  onChange: (patch: Partial<UserProfileFormValues>) => void;
  /** Replace the arbitrary references list — the shared ReferencesEditor owns add/edit/remove + delete-confirm. */
  onReferencesChange: (rows: ReferenceRow[]) => void;
  onUpdateRecognizedReference: (kind: 'linkedin' | 'bsky' | 'github', uri: string) => void;
  onUploadAvatar: (file: File) => void;
  onAvatarCropComplete: (croppedFile: File, altText: string) => void;
  onAvatarCropCancel: () => void;
  /** Every field is buffered and saved through the unsaved-changes bar (spec 097 Session 2026-10-22). */
  unsaved: TabUnsavedChanges;
};

const SCALAR_FIELDS = ['displayName', 'firstName', 'lastName', 'phone', 'tagline', 'city', 'country', 'bio'] as const;
const TAGSET_FIELDS = ['skills', 'keywords'] as const;

const allReferences = (values: UserProfileFormValues) => [
  ...values.references,
  ...SOCIAL_LINK_KINDS.map(kind => values.recognizedReferences[kind]),
];

/**
 * User Profile tab data hook — saved through the tab-wide unsaved-changes bar.
 *
 * Every field lives in a local buffer over the cache-derived server values
 * (`saved`); `unsaved` counts the changed fields, `saveAll` writes them all
 * and `reset` drops the buffer back to `saved`. Avatar uploads stay immediate
 * (the crop dialog's Save IS the commit).
 */
export const useUserProfileTabData = (userId: string | undefined): UseUserProfileTabDataResult => {
  const {
    data,
    loading: queryLoading,
    error: queryError,
    refetch,
  } = useUserQuery({ variables: { id: userId ?? '' }, skip: !userId });

  const user = data?.lookup.user;
  const saved: UserProfileFormValues | null = user ? mapUserToProfileFormValues(user) : null;

  const [values, setValues] = useState<UserProfileFormValues | null>(null);
  const valuesRef = useRef<UserProfileFormValues | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [pendingAvatarCrop, setPendingAvatarCrop] = useState<PendingAvatarCrop | null>(null);

  const [updateUser] = useUpdateUserMutation();
  const [createReference] = useCreateReferenceOnProfileMutation();
  const [deleteReference] = useDeleteReferenceMutation();
  const [createTagset] = useCreateTagsetOnProfileMutation();
  const [uploadVisual] = useUploadVisualMutation();

  // Seed the local buffer once when the query first resolves. Subsequent
  // cache updates flow through `saved` for change detection, but never
  // overwrite the user's edits.
  useEffect(() => {
    if (saved && valuesRef.current === null) {
      valuesRef.current = saved;
      setValues(saved);
    }
  }, [saved]);

  const update = (apply: (base: UserProfileFormValues) => UserProfileFormValues) => {
    setValues(prev => {
      const base = prev ?? valuesRef.current;
      if (!base) return prev;
      const next = apply(base);
      valuesRef.current = next;
      return next;
    });
  };

  const onChange = (patch: Partial<UserProfileFormValues>) => update(base => ({ ...base, ...patch }));

  // The shared ReferencesEditor manages the arbitrary references list (+ its own delete-confirm) and
  // emits the full list. New rows arrive without an `id`; a temp id marks them as creates.
  const onReferencesChange = (rows: ReferenceRow[]) =>
    update(base => ({
      ...base,
      references: rows.map((r, i) => ({
        id: r.id ?? newReferenceId(i),
        name: r.name,
        uri: r.uri,
        description: r.description ?? '',
        recognized: false,
      })),
    }));

  const onUpdateRecognizedReference = (kind: 'linkedin' | 'bsky' | 'github', uri: string) =>
    update(base => {
      const current = base.recognizedReferences[kind] ?? {
        id: '',
        name: kind,
        uri: '',
        description: '',
        recognized: true,
      };
      return { ...base, recognizedReferences: { ...base.recognizedReferences, [kind]: { ...current, uri } } };
    });

  // ────────────────── Avatar (FR-024 — crop + commit) ──────────────────
  // Picking a file opens the CRD `ImageCropDialog` first. Only the dialog's
  // onSave (cropped/resized file + alt text) triggers `uploadImageOnVisual`.
  // Constraints (aspect ratio + min/max dimensions) come from the raw
  // `VisualModelFull` selection on `user.profile.avatar`.

  const onUploadAvatar = (file: File) => {
    const current = valuesRef.current;
    if (!current?.avatar.id) return; // No avatar slot yet — backend hasn't seeded one.
    const visualRaw = user?.profile?.avatar;
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
    // Optimistically reflect the user-provided alt text in the local buffer.
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
  const changedTagsets =
    values && saved ? TAGSET_FIELDS.filter(f => JSON.stringify(values[f].tags) !== JSON.stringify(saved[f].tags)) : [];
  const referenceChanges =
    values && saved
      ? diffProfileReferences<UserProfileReference>(allReferences(values), allReferences(saved))
      : { created: [], edited: [], removed: [] };
  const unsavedCount = changedScalars.length + changedTagsets.length + countReferenceChanges(referenceChanges);

  const canSave =
    values !== null &&
    Boolean(values.displayName.trim() && values.firstName.trim() && values.lastName.trim()) &&
    isValidPhoneOrEmpty(values.phone);

  const saveAll = async (): Promise<boolean> => {
    const current = valuesRef.current;
    if (!current || !saved || !userId || unsavedCount === 0) return true;
    setSaving(true);
    setSaveError(null);

    // One updateUser for every changed field, existing tagset and edited reference.
    const input: UpdateUserInput = { ID: userId };
    const profileData: UpdateProfileInput = {};
    if (current.firstName !== saved.firstName) input.firstName = current.firstName;
    if (current.lastName !== saved.lastName) input.lastName = current.lastName;
    if (current.phone !== saved.phone) input.phone = current.phone;
    if (current.displayName !== saved.displayName) profileData.displayName = current.displayName;
    if (current.tagline !== saved.tagline) profileData.tagline = current.tagline;
    if (current.bio !== saved.bio) profileData.description = current.bio;
    if (current.city !== saved.city || current.country !== saved.country) {
      profileData.location = { city: current.city, country: current.country };
    }
    const existingTagsets = changedTagsets.filter(f => current[f].id);
    if (existingTagsets.length) {
      profileData.tagsets = existingTagsets.map(f => ({ ID: current[f].id ?? '', tags: current[f].tags }));
    }
    if (referenceChanges.edited.length) {
      profileData.references = referenceChanges.edited.map(r => ({
        ID: r.id,
        name: r.name,
        uri: r.uri,
        description: r.description,
      }));
    }
    if (Object.keys(profileData).length) input.profileData = profileData;

    const result = await saveProfileChanges({
      updateCore: Object.keys(input).length > 1 ? () => updateUser({ variables: { input } }) : null,
      tagsetsToCreate: changedTagsets
        .filter(f => !current[f].id)
        .map(field => ({
          field,
          create: () =>
            createTagset({
              variables: {
                input: {
                  profileID: current.profileId,
                  name: field === 'skills' ? TagsetReservedName.Skills : TagsetReservedName.Keywords,
                  tags: current[field].tags,
                },
              },
            }),
        })),
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
    // A failed refresh leaves the buffer out of step with the server (references just created would
    // be created again on retry), so it fails the Save and the page offers a reload.
    let refreshError: string | null = null;
    const freshUser = (
      await refetch().catch(err => {
        refreshError = err instanceof Error ? err.message : String(err);
        return null;
      })
    )?.data?.lookup.user;
    if (freshUser) {
      const fresh = mapUserToProfileFormValues(freshUser);
      const next: UserProfileFormValues = { ...fresh, avatar: current.avatar };
      if (result.coreFailed) {
        for (const f of SCALAR_FIELDS) next[f] = current[f];
      }
      for (const f of TAGSET_FIELDS) {
        if ((result.coreFailed && current[f].id) || result.failedTagsets.includes(f)) next[f] = current[f];
      }
      const rows = rebaseReferences(
        allReferences(fresh).filter((r): r is UserProfileReference => Boolean(r?.id)),
        referenceChanges,
        result
      );
      next.references = rows.filter(r => !r.recognized);
      next.recognizedReferences = { ...fresh.recognizedReferences };
      for (const kind of SOCIAL_LINK_KINDS) {
        const row = rows.find(r => r.recognized && r.name.toLowerCase() === kind);
        if (row) next.recognizedReferences[kind] = row;
      }
      valuesRef.current = next;
      setValues(next);
    }

    setSaving(false);
    const firstError = result.firstError ?? refreshError;
    setSaveError(firstError);
    return firstError === null;
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
    onUpdateRecognizedReference,
    onUploadAvatar,
    onAvatarCropComplete,
    onAvatarCropCancel,
    unsaved: { count: unsavedCount, canSave, saving, error: saveError, saveAll, reset },
  };
};

export default useUserProfileTabData;
