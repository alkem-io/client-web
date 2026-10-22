import { useEffect, useRef, useState } from 'react';
import {
  useCreateReferenceOnProfileMutation,
  useCreateTagsetOnProfileMutation,
  useDeleteReferenceMutation,
  useOrganizationProfileInfoQuery,
  useUpdateOrganizationMutation,
  useUploadVisualMutation,
} from '@/core/apollo/generated/apollo-hooks';
import type { UpdateOrganizationInput, UpdateProfileInput } from '@/core/apollo/generated/graphql-schema';
import { TagsetReservedName } from '@/core/apollo/generated/graphql-schema';
import { SOCIAL_LINK_KINDS } from '@/crd/components/contributor/settings/ProfileFormFields';
import type { ReferenceRow } from '@/crd/forms/references/ReferencesEditor';
import { isValidEmailOrEmpty, isValidUrlOrEmpty } from '@/crd/lib/validators';
import type { TabUnsavedChanges } from '@/main/crdPages/utils/tabUnsavedChanges';
import {
  countReferenceChanges,
  diffProfileReferences,
  newReferenceId,
  rebaseReferences,
  saveProfileChanges,
} from '../../../common/profileChanges';
import {
  mapOrganizationToProfileFormValues,
  type OrgProfileFormValues,
  type OrgProfileReference,
} from './orgProfileMapper';

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

export type UseOrgProfileTabDataResult = {
  values: OrgProfileFormValues | null;
  loading: boolean;
  error: Error | null;
  uploadingAvatar: boolean;
  pendingAvatarCrop: PendingAvatarCrop | null;

  onChange: (patch: Partial<OrgProfileFormValues>) => void;
  /** Replace the arbitrary references list — the shared ReferencesEditor owns add/edit/remove + delete-confirm. */
  onReferencesChange: (rows: ReferenceRow[]) => void;
  onUpdateRecognizedReference: (kind: 'linkedin' | 'bsky' | 'github', uri: string) => void;
  onUploadAvatar: (file: File) => void;
  onAvatarCropComplete: (croppedFile: File, altText: string) => void;
  onAvatarCropCancel: () => void;
  /** Every field is buffered and saved through the unsaved-changes bar (spec 097 Session 2026-10-22). */
  unsaved: TabUnsavedChanges;
};

const PROFILE_FIELDS = ['displayName', 'tagline', 'description', 'city', 'country'] as const;
const ORG_FIELDS = ['contactEmail', 'domain', 'legalEntityName', 'website'] as const;
const SCALAR_FIELDS = [...PROFILE_FIELDS, ...ORG_FIELDS] as const;
const TAGSET_FIELDS = ['keywords', 'capabilities'] as const;

const allReferences = (values: OrgProfileFormValues) => [
  ...values.references,
  ...SOCIAL_LINK_KINDS.map(kind => values.recognizedReferences[kind]),
];

/**
 * Org Profile tab data hook — saved through the tab-wide unsaved-changes bar,
 * like `useUserProfileTabData`. Every field lives in a local buffer over the
 * cache-derived server values (`saved`); `unsaved` counts the changed fields,
 * `saveAll` writes them all and `reset` drops the buffer back to `saved`.
 * Keywords and Capabilities are separate named tagsets, lazily created on the
 * first Save. Logo uploads stay immediate (the crop dialog's Save IS the commit).
 */
export const useOrgProfileTabData = (organizationId: string | undefined): UseOrgProfileTabDataResult => {
  const {
    data,
    loading: queryLoading,
    error: queryError,
    refetch,
  } = useOrganizationProfileInfoQuery({
    variables: { id: organizationId ?? '' },
    skip: !organizationId,
  });

  const org = data?.lookup.organization;
  const saved: OrgProfileFormValues | null = org ? mapOrganizationToProfileFormValues(org) : null;

  const [values, setValues] = useState<OrgProfileFormValues | null>(null);
  const valuesRef = useRef<OrgProfileFormValues | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [pendingAvatarCrop, setPendingAvatarCrop] = useState<PendingAvatarCrop | null>(null);

  const [updateOrganization] = useUpdateOrganizationMutation();
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

  const update = (apply: (base: OrgProfileFormValues) => OrgProfileFormValues) => {
    setValues(prev => {
      const base = prev ?? valuesRef.current;
      if (!base) return prev;
      const next = apply(base);
      valuesRef.current = next;
      return next;
    });
  };

  const onChange = (patch: Partial<OrgProfileFormValues>) => update(base => ({ ...base, ...patch }));

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

  /**
   * Avatar upload (FR-093). Picking a file does NOT commit immediately —
   * we open the CRD `ImageCropDialog` first (parity with the MUI Org admin
   * profile + 045 About branding flow). The dialog's onSave delivers the
   * cropped/resized file + alt text; only then does `uploadImageOnVisual`
   * fire. Constraints (aspect ratio, min/max dimensions) come from the raw
   * `VisualModelFull` selection on `profile.visuals[name='AVATAR']`.
   */
  const onUploadAvatar = (file: File) => {
    const current = valuesRef.current;
    if (!current?.avatar.id) return; // No avatar slot yet — backend hasn't seeded one.
    const visualRaw = (org?.profile?.visuals ?? []).find(v => v.name === 'AVATAR');
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
      ? diffProfileReferences<OrgProfileReference>(allReferences(values), allReferences(saved))
      : { created: [], edited: [], removed: [] };
  const unsavedCount = changedScalars.length + changedTagsets.length + countReferenceChanges(referenceChanges);

  const canSave =
    values !== null &&
    Boolean(values.displayName.trim()) &&
    isValidEmailOrEmpty(values.contactEmail) &&
    isValidUrlOrEmpty(values.website);

  const saveAll = async (): Promise<boolean> => {
    const current = valuesRef.current;
    if (!current || !saved || !organizationId || unsavedCount === 0) return true;
    setSaving(true);
    setSaveError(null);

    // One updateOrganization for every changed field, existing tagset and edited reference.
    const input: UpdateOrganizationInput = { ID: organizationId };
    const profileData: UpdateProfileInput = {};
    for (const f of ORG_FIELDS) {
      if (current[f] !== saved[f]) input[f] = current[f];
    }
    if (current.displayName !== saved.displayName) profileData.displayName = current.displayName;
    if (current.tagline !== saved.tagline) profileData.tagline = current.tagline;
    if (current.description !== saved.description) profileData.description = current.description;
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
      updateCore: Object.keys(input).length > 1 ? () => updateOrganization({ variables: { input } }) : null,
      tagsetsToCreate: changedTagsets
        .filter(f => !current[f].id)
        .map(field => ({
          field,
          create: () =>
            createTagset({
              variables: {
                input: {
                  profileID: current.profileId,
                  name: field === 'keywords' ? TagsetReservedName.Keywords : TagsetReservedName.Capabilities,
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
    const freshOrg = (await refetch().catch(() => null))?.data?.lookup.organization;
    if (freshOrg) {
      const fresh = mapOrganizationToProfileFormValues(freshOrg);
      const next: OrgProfileFormValues = { ...fresh, avatar: current.avatar };
      if (result.coreFailed) {
        for (const f of SCALAR_FIELDS) next[f] = current[f];
      }
      for (const f of TAGSET_FIELDS) {
        if ((result.coreFailed && current[f].id) || result.failedTagsets.includes(f)) next[f] = current[f];
      }
      const rows = rebaseReferences(
        allReferences(fresh).filter((r): r is OrgProfileReference => Boolean(r?.id)),
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
    onUpdateRecognizedReference,
    onUploadAvatar,
    onAvatarCropComplete,
    onAvatarCropCancel,
    unsaved: { count: unsavedCount, canSave, saving, error: saveError, saveAll, reset },
  };
};

export default useOrgProfileTabData;
