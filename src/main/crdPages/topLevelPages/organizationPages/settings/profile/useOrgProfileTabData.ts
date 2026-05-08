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
import { SAVED_FLASH_MS, type SectionSaveStatus } from '@/crd/components/common/FieldFooter';
import {
  mapOrganizationToProfileFormValues,
  type OrgProfileFormValues,
  type OrgProfileReference,
  type OrgProfileSectionKey,
} from './orgProfileMapper';

const TEMP_PREFIX = 'temp-';
const isTempId = (id: string) => id.startsWith(TEMP_PREFIX);

export type UseOrgProfileTabDataResult = {
  values: OrgProfileFormValues | null;
  loading: boolean;
  error: Error | null;
  dirtyByField: Partial<Record<OrgProfileSectionKey, boolean>>;
  saveStatusByField: Partial<Record<OrgProfileSectionKey, SectionSaveStatus>>;
  pendingReferenceDelete: { id: string; name: string } | null;
  uploadingAvatar: boolean;

  onChange: (patch: Partial<OrgProfileFormValues>) => void;
  onAddReference: () => void;
  onUpdateReference: (id: string, patch: Partial<Omit<OrgProfileReference, 'id' | 'recognized'>>) => void;
  onUpdateRecognizedReference: (kind: 'linkedin' | 'bsky' | 'github', uri: string) => void;
  onRequestRemoveReference: (id: string) => void;
  onConfirmRemoveReference: () => void;
  onCancelRemoveReference: () => void;
  onUploadAvatar: (file: File) => void;
  onSaveSection: (section: OrgProfileSectionKey) => Promise<void>;
};

/**
 * Per-section save hook for the Org Profile tab — parallel to
 * `useUserProfileTabData` (User Profile / 045 About). Holds local form
 * values + per-section status; each `onSaveSection(k)` fires ONE targeted
 * mutation (only that section's fields), then merges the freshly-saved
 * slice back into the local buffer to preserve unsaved edits in OTHER
 * sections.
 *
 * Tagsets (Q-rename / Skills→Keywords for User; Keywords + Capabilities
 * for Org): each named tagset is its own per-section save — saving
 * Keywords MUST NOT touch Capabilities and vice versa. Lazy-create the
 * tagset on first save when the org doesn't yet have it.
 *
 * Failure semantics (FR-022 / FR-092):
 * - `saving` → `error` on hard failure. The section stays dirty + an
 *   inline error persists until any field in the section is edited again.
 *
 * References (FR-025 / Rule #9):
 * - Trash sets `pendingReferenceDelete`; only the dialog's Confirm queues
 *   the row for deletion in the local buffer.
 * - The actual `deleteReference` fires only on the References-section
 *   Save (in the same batch as create / update).
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

  const [saveStatusByField, setSaveStatusByField] = useState<Partial<Record<OrgProfileSectionKey, SectionSaveStatus>>>(
    {}
  );
  const savedFlashTimers = useRef<Partial<Record<OrgProfileSectionKey, ReturnType<typeof setTimeout>>>>({});

  const [pendingReferenceDelete, setPendingReferenceDelete] = useState<{ id: string; name: string } | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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

  useEffect(
    () => () => {
      for (const timer of Object.values(savedFlashTimers.current)) {
        if (timer) clearTimeout(timer);
      }
    },
    []
  );

  const arrayEq = <T>(a: ReadonlyArray<T>, b: ReadonlyArray<T>) => JSON.stringify(a) === JSON.stringify(b);

  const referencesEqual = (a: OrgProfileFormValues | null, b: OrgProfileFormValues | null): boolean => {
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

  const dirtyByField: Partial<Record<OrgProfileSectionKey, boolean>> = (() => {
    if (!values || !saved) return {};
    return {
      displayName: values.displayName !== saved.displayName,
      tagline: values.tagline !== saved.tagline,
      description: values.description !== saved.description,
      location: values.city !== saved.city || values.country !== saved.country,
      keywords: !arrayEq(values.keywords.tags, saved.keywords.tags),
      capabilities: !arrayEq(values.capabilities.tags, saved.capabilities.tags),
      contactEmail: values.contactEmail !== saved.contactEmail,
      domain: values.domain !== saved.domain,
      legalEntityName: values.legalEntityName !== saved.legalEntityName,
      website: values.website !== saved.website,
      references: !referencesEqual(values, saved),
    };
  })();

  const clearSectionErrorIfPresent = (section: OrgProfileSectionKey) => {
    setSaveStatusByField(prev => {
      const current = prev[section];
      if (!current || current.kind !== 'error') return prev;
      const next = { ...prev };
      delete next[section];
      return next;
    });
  };

  const onChange = (patch: Partial<OrgProfileFormValues>) => {
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
    if ('city' in patch || 'country' in patch) clearSectionErrorIfPresent('location');
    if ('keywords' in patch) clearSectionErrorIfPresent('keywords');
    if ('capabilities' in patch) clearSectionErrorIfPresent('capabilities');
    if ('contactEmail' in patch) clearSectionErrorIfPresent('contactEmail');
    if ('domain' in patch) clearSectionErrorIfPresent('domain');
    if ('legalEntityName' in patch) clearSectionErrorIfPresent('legalEntityName');
    if ('website' in patch) clearSectionErrorIfPresent('website');
    if ('references' in patch || 'recognizedReferences' in patch) clearSectionErrorIfPresent('references');
  };

  const onAddReference = () => {
    setValues(prev => {
      const base = prev ?? valuesRef.current;
      if (!base) return prev;
      const newRef: OrgProfileReference = {
        id: `${TEMP_PREFIX}${Date.now()}`,
        name: '',
        uri: '',
        description: '',
        recognized: false,
      };
      const next = { ...base, references: [...base.references, newRef] };
      valuesRef.current = next;
      return next;
    });
    clearSectionErrorIfPresent('references');
  };

  const onUpdateReference = (id: string, patch: Partial<Omit<OrgProfileReference, 'id' | 'recognized'>>) => {
    setValues(prev => {
      const base = prev ?? valuesRef.current;
      if (!base) return prev;
      const next = {
        ...base,
        references: base.references.map(r => (r.id === id ? { ...r, ...patch } : r)),
      };
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

  const onRequestRemoveReference = (id: string) => {
    const base = valuesRef.current;
    const ref = base?.references.find(r => r.id === id);
    if (!ref) return;
    setPendingReferenceDelete({ id, name: ref.name || ref.uri || 'this reference' });
  };

  const onConfirmRemoveReference = () => {
    const pending = pendingReferenceDelete;
    if (!pending) return;
    setValues(prev => {
      const base = prev ?? valuesRef.current;
      if (!base) return prev;
      const next = { ...base, references: base.references.filter(r => r.id !== pending.id) };
      valuesRef.current = next;
      return next;
    });
    setPendingReferenceDelete(null);
    clearSectionErrorIfPresent('references');
  };

  const onCancelRemoveReference = () => setPendingReferenceDelete(null);

  const onUploadAvatar = (file: File) => {
    const current = valuesRef.current;
    const visual = current?.avatar;
    if (!visual?.id) return;
    setUploadingAvatar(true);
    void uploadVisual({
      variables: {
        file,
        uploadData: {
          visualID: visual.id,
          alternativeText: visual.altText ?? undefined,
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

  const setSectionStatus = (section: OrgProfileSectionKey, status: SectionSaveStatus) => {
    setSaveStatusByField(prev => ({ ...prev, [section]: status }));
  };

  const flashSaved = (section: OrgProfileSectionKey) => {
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

  /**
   * Build the `updateOrganization` mutation input for a single non-tagset
   * non-references section. Tagsets + references take their own paths.
   */
  const buildOrgPatch = (
    section: OrgProfileSectionKey,
    current: OrgProfileFormValues
  ): UpdateOrganizationInput | null => {
    if (!organizationId) return null;
    const base: UpdateOrganizationInput = { ID: organizationId };
    switch (section) {
      case 'displayName':
        return { ...base, profileData: { displayName: current.displayName } };
      case 'tagline':
        return { ...base, profileData: { tagline: current.tagline } };
      case 'description':
        return { ...base, profileData: { description: current.description } };
      case 'location':
        return {
          ...base,
          profileData: { location: { city: current.city, country: current.country } },
        };
      case 'contactEmail':
        return { ...base, contactEmail: current.contactEmail };
      case 'domain':
        return { ...base, domain: current.domain };
      case 'legalEntityName':
        return { ...base, legalEntityName: current.legalEntityName };
      case 'website':
        return { ...base, website: current.website };
      case 'keywords':
      case 'capabilities':
      case 'references':
        return null;
    }
  };

  const saveTagsetSection = async (
    section: 'keywords' | 'capabilities',
    current: OrgProfileFormValues
  ): Promise<void> => {
    if (!organizationId) return;
    const tagset = current[section];
    const reservedName = section === 'keywords' ? TagsetReservedName.Keywords : TagsetReservedName.Capabilities;

    if (!tagset.id) {
      if (!current.profileId) return;
      const result = await createTagset({
        variables: { input: { profileID: current.profileId, name: reservedName, tags: tagset.tags } },
      });
      const newId = result.data?.createTagsetOnProfile?.id;
      if (newId) {
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

    await updateOrganization({
      variables: {
        input: {
          ID: organizationId,
          profileData: { tagsets: [{ ID: tagset.id, tags: tagset.tags }] },
        },
      },
    });
  };

  const collectExistingReferencePatches = (current: OrgProfileFormValues): UpdateProfileInput['references'] => {
    const all = [
      ...(['linkedin', 'bsky', 'github'] as const)
        .map(kind => current.recognizedReferences[kind])
        .filter((r): r is OrgProfileReference => Boolean(r) && Boolean(r?.id)),
      ...current.references.filter(r => !isTempId(r.id) && r.id),
    ];
    return all.map(r => ({
      ID: r.id,
      name: r.name,
      uri: r.uri,
      description: r.description,
    }));
  };

  const collectNewReferences = (current: OrgProfileFormValues): Array<OrgProfileReference> => {
    const recognizedRefs = (['linkedin', 'bsky', 'github'] as const)
      .map(kind => current.recognizedReferences[kind])
      .filter((r): r is OrgProfileReference => r !== null);
    const newRecognized = recognizedRefs
      .filter(r => r.id === '' && r.uri.trim() !== '')
      .map(r => ({ ...r, name: r.name || r.id }));
    const newArbitrary = current.references.filter(r => isTempId(r.id) && r.name.trim());
    return [...newRecognized, ...newArbitrary];
  };

  const collectRemovedReferenceIds = (current: OrgProfileFormValues, savedNow: OrgProfileFormValues): string[] => {
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
        .filter((r): r is OrgProfileReference => Boolean(r) && Boolean(r?.id)),
    ];
    return savedAll.filter(r => r.id && !isTempId(r.id) && !currentIds.has(r.id)).map(r => r.id);
  };

  const saveReferencesSection = async (current: OrgProfileFormValues, savedNow: OrgProfileFormValues) => {
    if (!organizationId) return;

    const existingPatches = collectExistingReferencePatches(current);
    if (existingPatches && existingPatches.length > 0) {
      await updateOrganization({
        variables: { input: { ID: organizationId, profileData: { references: existingPatches } } },
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

  const onSaveSection = async (section: OrgProfileSectionKey) => {
    const current = valuesRef.current;
    const savedNow = saved;
    if (!current || !savedNow || !organizationId) return;

    setSectionStatus(section, { kind: 'saving' });

    try {
      if (section === 'keywords' || section === 'capabilities') {
        await saveTagsetSection(section, current);
      } else if (section === 'references') {
        await saveReferencesSection(current, savedNow);
      } else {
        const patch = buildOrgPatch(section, current);
        if (patch) {
          await updateOrganization({ variables: { input: patch } });
        }
      }

      const fresh = await refetch();
      const freshOrg = fresh.data?.lookup.organization;
      if (freshOrg) {
        const freshValues = mapOrganizationToProfileFormValues(freshOrg);
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
    pendingReferenceDelete,
    uploadingAvatar,
    onChange,
    onAddReference,
    onUpdateReference,
    onUpdateRecognizedReference,
    onRequestRemoveReference,
    onConfirmRemoveReference,
    onCancelRemoveReference,
    onUploadAvatar,
    onSaveSection,
  };
};

const mergeSavedSection = (
  buffer: OrgProfileFormValues,
  fresh: OrgProfileFormValues,
  section: OrgProfileSectionKey
): OrgProfileFormValues => {
  switch (section) {
    case 'displayName':
      return { ...buffer, displayName: fresh.displayName };
    case 'tagline':
      return { ...buffer, tagline: fresh.tagline };
    case 'description':
      return { ...buffer, description: fresh.description };
    case 'location':
      return { ...buffer, city: fresh.city, country: fresh.country };
    case 'keywords':
      return { ...buffer, keywords: fresh.keywords };
    case 'capabilities':
      return { ...buffer, capabilities: fresh.capabilities };
    case 'contactEmail':
      return { ...buffer, contactEmail: fresh.contactEmail };
    case 'domain':
      return { ...buffer, domain: fresh.domain };
    case 'legalEntityName':
      return { ...buffer, legalEntityName: fresh.legalEntityName };
    case 'website':
      return { ...buffer, website: fresh.website };
    case 'references':
      return {
        ...buffer,
        references: fresh.references,
        recognizedReferences: fresh.recognizedReferences,
      };
  }
};

export default useOrgProfileTabData;
