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
import { SAVED_FLASH_MS } from '@/crd/components/common/FieldFooter';
import type {
  SectionSaveStatus,
  UserProfileFormValues,
  UserProfileReference,
  UserProfileSectionKey,
} from '@/crd/components/user/settings/UserProfileTabView.types';
import type { ReferenceRow } from '@/crd/forms/references/ReferencesEditor';
import { mapUserToProfileFormValues } from './userProfileMapper';

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

export type UseUserProfileTabDataResult = {
  values: UserProfileFormValues | null;
  loading: boolean;
  error: Error | null;
  dirtyByField: Partial<Record<UserProfileSectionKey, boolean>>;
  saveStatusByField: Partial<Record<UserProfileSectionKey, SectionSaveStatus>>;
  uploadingAvatar: boolean;
  pendingAvatarCrop: PendingAvatarCrop | null;

  onChange: (patch: Partial<UserProfileFormValues>) => void;
  /** Replace the arbitrary references list — the shared ReferencesEditor owns add/edit/remove + delete-confirm. */
  onReferencesChange: (rows: ReferenceRow[]) => void;
  onUpdateRecognizedReference: (kind: 'linkedin' | 'bsky' | 'github', uri: string) => void;
  onUploadAvatar: (file: File) => void;
  onAvatarCropComplete: (croppedFile: File, altText: string) => void;
  onAvatarCropCancel: () => void;
  onSaveSection: (section: UserProfileSectionKey) => Promise<void>;
};

/**
 * Per-section save hook for the User Profile tab — parallel to 045's
 * `useAboutTabData`. Holds local form values + per-section status; each
 * `onSaveSection(k)` fires ONE targeted mutation (only that section's
 * fields), then merges the freshly-saved slice back into the local buffer
 * to preserve unsaved edits in OTHER sections.
 *
 * Failure semantics (FR-022):
 * - `saving` → `error` on hard failure. The section stays dirty with the
 *   user's typed values preserved + an inline error message. The error
 *   persists until the admin edits any field in the section again, at
 *   which point `onChange` clears the error and re-enables Save.
 *
 * References (FR-025 / Rule #9):
 * - Trash sets `pendingReferenceDelete`; only the dialog's Confirm queues
 *   the row for deletion in the local buffer.
 * - The actual `deleteReference` mutation fires only on the
 *   References-section Save (in the same batch as create / update).
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

  const [saveStatusByField, setSaveStatusByField] = useState<Partial<Record<UserProfileSectionKey, SectionSaveStatus>>>(
    {}
  );
  const savedFlashTimers = useRef<Partial<Record<UserProfileSectionKey, ReturnType<typeof setTimeout>>>>({});

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [pendingAvatarCrop, setPendingAvatarCrop] = useState<PendingAvatarCrop | null>(null);

  const [updateUser] = useUpdateUserMutation();
  const [createReference] = useCreateReferenceOnProfileMutation();
  const [deleteReference] = useDeleteReferenceMutation();
  const [createTagset] = useCreateTagsetOnProfileMutation();
  const [uploadVisual] = useUploadVisualMutation();

  // Seed the local buffer once when the query first resolves. Subsequent
  // cache updates flow through `saved` for dirty detection, but never
  // overwrite the user's edits.
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

  const referencesEqual = (a: UserProfileFormValues | null, b: UserProfileFormValues | null): boolean => {
    if (!a || !b) return true;
    if (a.references.length !== b.references.length) return false;
    if (!arrayEq(a.references, b.references)) return false;
    const recognizedKinds = ['linkedin', 'bsky', 'github'] as const;
    return recognizedKinds.every(k => {
      const aRef = a.recognizedReferences[k];
      const bRef = b.recognizedReferences[k];
      return (aRef?.uri ?? '') === (bRef?.uri ?? '');
    });
  };

  const dirtyByField: Partial<Record<UserProfileSectionKey, boolean>> = (() => {
    if (!values || !saved) return {};
    return {
      displayName: values.displayName !== saved.displayName,
      firstName: values.firstName !== saved.firstName,
      lastName: values.lastName !== saved.lastName,
      phone: values.phone !== saved.phone,
      tagline: values.tagline !== saved.tagline,
      location: values.city !== saved.city || values.country !== saved.country,
      bio: values.bio !== saved.bio,
      skills: !arrayEq(values.skills.tags, saved.skills.tags),
      keywords: !arrayEq(values.keywords.tags, saved.keywords.tags),
      references: !referencesEqual(values, saved),
    };
  })();

  // ────────────────── Local mutations ──────────────────

  /** Clear the section's error status when the user edits it again. */
  const clearSectionErrorIfPresent = (section: UserProfileSectionKey) => {
    setSaveStatusByField(prev => {
      const current = prev[section];
      if (!current || current.kind !== 'error') return prev;
      const next = { ...prev };
      delete next[section];
      return next;
    });
  };

  const onChange = (patch: Partial<UserProfileFormValues>) => {
    setValues(prev => {
      const base = prev ?? valuesRef.current;
      if (!base) return prev;
      const next = { ...base, ...patch };
      valuesRef.current = next;
      return next;
    });
    // Heuristic: any single-field change clears that field's error.
    if ('displayName' in patch) clearSectionErrorIfPresent('displayName');
    if ('firstName' in patch) clearSectionErrorIfPresent('firstName');
    if ('lastName' in patch) clearSectionErrorIfPresent('lastName');
    if ('phone' in patch) clearSectionErrorIfPresent('phone');
    if ('tagline' in patch) clearSectionErrorIfPresent('tagline');
    if ('city' in patch || 'country' in patch) clearSectionErrorIfPresent('location');
    if ('bio' in patch) clearSectionErrorIfPresent('bio');
    if ('skills' in patch) clearSectionErrorIfPresent('skills');
    if ('keywords' in patch) clearSectionErrorIfPresent('keywords');
    if ('references' in patch || 'recognizedReferences' in patch) clearSectionErrorIfPresent('references');
  };

  // The shared ReferencesEditor manages the arbitrary references list (+ its own delete-confirm) and
  // emits the full list. New rows arrive without an `id`; assign a temp id so the per-section save
  // diffs them as creates. Recognized social links are handled separately (onUpdateRecognizedReference).
  const onReferencesChange = (rows: ReferenceRow[]) => {
    setValues(prev => {
      const base = prev ?? valuesRef.current;
      if (!base) return prev;
      const mapped: UserProfileReference[] = rows.map((r, i) => ({
        id: r.id ?? `${TEMP_PREFIX}${Date.now()}-${i}`,
        name: r.name,
        uri: r.uri,
        description: r.description ?? '',
        recognized: false,
      }));
      const next = { ...base, references: mapped };
      valuesRef.current = next;
      return next;
    });
    clearSectionErrorIfPresent('references');
  };

  const onUpdateRecognizedReference = (kind: 'linkedin' | 'bsky' | 'github', uri: string) => {
    setValues(prev => {
      const base = prev ?? valuesRef.current;
      if (!base) return prev;
      const current = base.recognizedReferences[kind] ?? {
        id: '',
        name: kind,
        uri: '',
        description: '',
        recognized: true,
      };
      const next = {
        ...base,
        recognizedReferences: {
          ...base.recognizedReferences,
          [kind]: { ...current, uri },
        },
      };
      valuesRef.current = next;
      return next;
    });
    clearSectionErrorIfPresent('references');
  };

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

  const setSectionStatus = (section: UserProfileSectionKey, status: SectionSaveStatus) => {
    setSaveStatusByField(prev => ({ ...prev, [section]: status }));
  };

  const flashSaved = (section: UserProfileSectionKey) => {
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

  const buildUserPatch = (section: UserProfileSectionKey, current: UserProfileFormValues): UpdateUserInput | null => {
    if (!userId) return null;
    const base: UpdateUserInput = { ID: userId };
    switch (section) {
      case 'displayName':
        return { ...base, profileData: { displayName: current.displayName } };
      case 'firstName':
        return { ...base, firstName: current.firstName };
      case 'lastName':
        return { ...base, lastName: current.lastName };
      case 'phone':
        return { ...base, phone: current.phone };
      case 'tagline':
        return { ...base, profileData: { tagline: current.tagline } };
      case 'location':
        return {
          ...base,
          profileData: { location: { city: current.city, country: current.country } },
        };
      case 'bio':
        return { ...base, profileData: { description: current.bio } };
      case 'skills':
      case 'keywords':
        // Tagset sections take a separate path — they may need to lazy-create
        // the tagset before the patch can be issued. See `saveTagsetSection`.
        return null;
      case 'references':
        return null; // handled via the dedicated batch path
    }
  };

  /**
   * Save one named profile tagset (`Skills` / `Keywords`). When the tagset
   * doesn't yet exist on the profile, fires `createTagsetOnProfile` first
   * and adopts the returned id into the buffer; otherwise patches the
   * tagset entry in `profileData.tagsets` via `updateUser`.
   */
  const saveTagsetSection = async (section: 'skills' | 'keywords', current: UserProfileFormValues): Promise<void> => {
    if (!userId) return;
    const tagset = current[section];
    const reservedName = section === 'skills' ? TagsetReservedName.Skills : TagsetReservedName.Keywords;

    if (!tagset.id) {
      if (!current.profileId) return;
      const result = await createTagset({
        variables: { input: { profileID: current.profileId, name: reservedName, tags: tagset.tags } },
      });
      const newId = result.data?.createTagsetOnProfile?.id;
      if (newId) {
        // Adopt the newly-created id so future saves on this section patch
        // the existing tagset rather than re-creating it.
        setValues(prev => {
          const base = prev ?? valuesRef.current;
          if (!base) return prev;
          const next = { ...base, [section]: { ...base[section], id: newId } };
          valuesRef.current = next;
          return next;
        });
      }
      return;
    }

    await updateUser({
      variables: { input: { ID: userId, profileData: { tagsets: [{ ID: tagset.id, tags: tagset.tags }] } } },
    });
  };

  const collectExistingReferencePatches = (current: UserProfileFormValues): UpdateProfileInput['references'] => {
    const all = [
      ...(['linkedin', 'bsky', 'github'] as const)
        .map(kind => current.recognizedReferences[kind])
        .filter((r): r is UserProfileReference => Boolean(r) && Boolean(r?.id)),
      ...current.references.filter(r => !isTempId(r.id) && r.id),
    ];
    return all.map(r => ({
      ID: r.id,
      name: r.name,
      uri: r.uri,
      description: r.description,
    }));
  };

  const collectNewReferences = (current: UserProfileFormValues): Array<UserProfileReference> => {
    const recognizedRefs = (['linkedin', 'bsky', 'github'] as const)
      .map(kind => current.recognizedReferences[kind])
      .filter((r): r is UserProfileReference => r !== null);
    const newRecognized = recognizedRefs
      .filter(r => r.id === '' && r.uri.trim() !== '')
      .map(r => ({ ...r, name: r.name || r.id }));
    const newArbitrary = current.references.filter(r => isTempId(r.id) && r.name.trim());
    return [...newRecognized, ...newArbitrary];
  };

  const collectRemovedReferenceIds = (current: UserProfileFormValues, savedNow: UserProfileFormValues): string[] => {
    const currentIds = new Set([
      ...current.references.map(r => r.id),
      ...(['linkedin', 'bsky', 'github'] as const)
        .map(kind => current.recognizedReferences[kind]?.id)
        .filter((id): id is string => Boolean(id)),
    ]);
    const savedAll = [
      ...savedNow.references,
      ...(['linkedin', 'bsky', 'github'] as const)
        .map(kind => savedNow.recognizedReferences[kind])
        .filter((r): r is UserProfileReference => Boolean(r) && Boolean(r?.id)),
    ];
    return savedAll.filter(r => r.id && !isTempId(r.id) && !currentIds.has(r.id)).map(r => r.id);
  };

  const saveReferencesSection = async (current: UserProfileFormValues, savedNow: UserProfileFormValues) => {
    if (!userId) return;

    // 1) Patch existing.
    const existingPatches = collectExistingReferencePatches(current);
    if (existingPatches && existingPatches.length > 0) {
      await updateUser({
        variables: { input: { ID: userId, profileData: { references: existingPatches } } },
      });
    }

    // 2) Create new.
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

    // 3) Delete removed.
    const removedIds = collectRemovedReferenceIds(current, savedNow);
    for (const id of removedIds) {
      await deleteReference({ variables: { input: { ID: id } } });
    }
  };

  const onSaveSection = async (section: UserProfileSectionKey) => {
    const current = valuesRef.current;
    const savedNow = saved;
    if (!current || !savedNow || !userId) return;

    setSectionStatus(section, { kind: 'saving' });

    try {
      if (section === 'skills' || section === 'keywords') {
        await saveTagsetSection(section, current);
      } else if (section === 'references') {
        await saveReferencesSection(current, savedNow);
      } else {
        const patch = buildUserPatch(section, current);
        if (patch) {
          await updateUser({ variables: { input: patch } });
        }
      }

      // Resync the local buffer with the server. The freshly-fetched values
      // overwrite ONLY the section we just saved; unsaved edits in other
      // sections are preserved.
      const fresh = await refetch();
      const freshUser = fresh.data?.lookup.user;
      if (freshUser) {
        const freshValues = mapUserToProfileFormValues(freshUser);
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
    onUpdateRecognizedReference,
    onUploadAvatar,
    onAvatarCropComplete,
    onAvatarCropCancel,
    onSaveSection,
  };
};

/**
 * Overlay the freshly-saved section's values onto the current buffer, so
 * the user's unsaved edits in other sections are preserved after a
 * per-section save (mirrors 045's `mergeSavedSection`).
 */
const mergeSavedSection = (
  buffer: UserProfileFormValues,
  fresh: UserProfileFormValues,
  section: UserProfileSectionKey
): UserProfileFormValues => {
  switch (section) {
    case 'displayName':
      return { ...buffer, displayName: fresh.displayName };
    case 'firstName':
      return { ...buffer, firstName: fresh.firstName };
    case 'lastName':
      return { ...buffer, lastName: fresh.lastName };
    case 'phone':
      return { ...buffer, phone: fresh.phone };
    case 'tagline':
      return { ...buffer, tagline: fresh.tagline };
    case 'location':
      return { ...buffer, city: fresh.city, country: fresh.country };
    case 'bio':
      return { ...buffer, bio: fresh.bio };
    case 'skills':
      return { ...buffer, skills: fresh.skills };
    case 'keywords':
      return { ...buffer, keywords: fresh.keywords };
    case 'references':
      return {
        ...buffer,
        references: fresh.references,
        recognizedReferences: fresh.recognizedReferences,
      };
  }
};

export default useUserProfileTabData;
