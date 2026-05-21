import { useEffect, useState } from 'react';
import { useCreateReferenceOnProfileMutation } from '@/core/apollo/generated/apollo-hooks';
import type {
  CommunityGuidelinesEditorValue,
  CommunityGuidelinesReferenceRow,
} from '@/crd/components/space/settings/CommunityGuidelinesEditor';
import useCommunityGuidelines from '@/domain/community/community/CommunityGuidelines/useCommunityGuidelines';
import { useStorageConfigContext } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { useReferenceFileUpload } from '@/main/crdPages/utils/useReferenceFileUpload';

export type UseCommunityGuidelinesDataResult = {
  value: CommunityGuidelinesEditorValue;
  loading: boolean;
  submitting: boolean;
  isDirty: boolean;
  canSave: boolean;
  onChange: (patch: Partial<CommunityGuidelinesEditorValue>) => void;
  onSave: () => Promise<void>;
  /** Apply a community-guidelines template (id) to the live guidelines — overwrites title/body/references on the server. */
  onApplyTemplate: (templateId: string) => Promise<void>;
  /** True when there is any user-authored content (title / body / a link) — used to gate the apply-template confirm. */
  hasContent: boolean;
  /** Per-row paperclip file-attach for the references editor (D24) — uploads to the space bucket, resolves the stored URL. */
  onReferenceFileUpload: ((file: File) => Promise<string | null>) | undefined;
  /** `accept` attribute for the references file picker, derived from the bucket's allowed mime types. */
  referenceUploadAccept: string | undefined;
};

const toEditorReferences = (
  refs: ReadonlyArray<{ id: string; name: string; description?: string; uri: string }>
): CommunityGuidelinesReferenceRow[] =>
  refs.map(r => ({ id: r.id, name: r.name, uri: r.uri, description: r.description }));

const EMPTY_VALUE: CommunityGuidelinesEditorValue = { title: '', body: '', references: [] };

/**
 * Drives the CRD `CommunityGuidelinesEditor` (FR-038). Wraps the domain `useCommunityGuidelines`
 * hook: maps `CommunityGuidelines.profile.{displayName,description,references}` ⇄ the editor value,
 * tracks local edits, and forwards save / apply-template. `apply-template` delegates to the domain
 * hook's `onSelectCommunityGuidelinesTemplate` (which handles the reference remove/recreate cascade
 * server-side).
 */
export function useCommunityGuidelinesData(
  communityGuidelinesId: string | undefined
): UseCommunityGuidelinesDataResult {
  const { communityGuidelines, profileId, loading, onUpdateCommunityGuidelines, onSelectCommunityGuidelinesTemplate } =
    useCommunityGuidelines(communityGuidelinesId);
  const [createReferenceOnProfile] = useCreateReferenceOnProfileMutation();
  // The Community tab renders inside the space's ambient `StorageConfigContextProvider`, so reference
  // file uploads land in the space's own bucket (`temporaryLocation: true`) — same path as the About tab
  // references and the Innovation Pack form (spec 098 D24 / FR-038).
  const { onFileUpload: onReferenceFileUpload, accept: referenceUploadAccept } = useReferenceFileUpload(
    useStorageConfigContext()
  );

  const serverValue: CommunityGuidelinesEditorValue = communityGuidelines
    ? {
        title: communityGuidelines.displayName,
        body: communityGuidelines.description ?? '',
        references: toEditorReferences(communityGuidelines.references),
      }
    : EMPTY_VALUE;
  // A stable signature of the server value so the local buffer resets when the server data actually changes.
  const serverSignature = JSON.stringify(serverValue);

  const [localValue, setLocalValue] = useState<CommunityGuidelinesEditorValue | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Reset the local edit buffer whenever the guidelines id or the server data changes.
  useEffect(() => {
    setLocalValue(null);
  }, [communityGuidelinesId, serverSignature]);

  const value = localValue ?? serverValue;
  const isDirty = localValue !== null && JSON.stringify(localValue) !== serverSignature;
  const hasContent = value.title.trim().length > 0 || value.body.trim().length > 0 || value.references.length > 0;

  const onChange = (patch: Partial<CommunityGuidelinesEditorValue>) => {
    setLocalValue({ ...value, ...patch });
  };

  const onSave = async () => {
    if (!communityGuidelines || !communityGuidelinesId) return;
    setSubmitting(true);
    try {
      // The bulk-update mutation keys on existing reference IDs only, so a row that the user added in this
      // editing session has no ID and would be silently dropped. Create those rows first via
      // `createReferenceOnProfile` (mirroring `useInnovationPackAdmin`), then issue the bulk update with the
      // existing rows. The CG query refetch triggered by `onUpdateCommunityGuidelines` reseeds the new rows
      // from the server on the next render.
      const newRefs = value.references.filter(r => !r.id);
      if (newRefs.length > 0 && profileId) {
        for (const ref of newRefs) {
          await createReferenceOnProfile({
            variables: {
              input: {
                profileID: profileId,
                name: ref.name,
                uri: ref.uri,
                description: ref.description ?? '',
              },
            },
          });
        }
      }
      await onUpdateCommunityGuidelines({
        displayName: value.title,
        description: value.body,
        references: value.references.flatMap(r =>
          r.id ? [{ id: r.id, name: r.name, uri: r.uri, description: r.description }] : []
        ),
      });
      setLocalValue(null);
    } finally {
      setSubmitting(false);
    }
  };

  const onApplyTemplate = async (templateId: string) => {
    setSubmitting(true);
    try {
      await onSelectCommunityGuidelinesTemplate({ id: templateId });
      setLocalValue(null);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    value,
    loading: loading && !communityGuidelines,
    submitting,
    isDirty,
    canSave: !!communityGuidelinesId && isDirty && !submitting,
    onChange,
    onSave,
    onApplyTemplate,
    hasContent,
    onReferenceFileUpload,
    referenceUploadAccept,
  };
}
