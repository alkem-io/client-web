import { useEffect, useState } from 'react';
import useCommunityGuidelines from '@/domain/community/community/CommunityGuidelines/useCommunityGuidelines';

export type UseCommunityGuidelinesDataResult = {
  description: string;
  loading: boolean;
  submitting: boolean;
  isDirty: boolean;
  canSave: boolean;
  onDescriptionChange: (next: string) => void;
  onSave: () => Promise<void>;
};

/**
 * Drives the CRD `CommunityGuidelinesEditor`. Wraps the existing domain
 * `useCommunityGuidelines` hook so the CRD consumer only deals with plain
 * fields. `isDirty` flips true once the local value diverges from the
 * server value, and `onSave` posts the update.
 */
export function useCommunityGuidelinesData(
  communityGuidelinesId: string | undefined
): UseCommunityGuidelinesDataResult {
  const { communityGuidelines, loading, onUpdateCommunityGuidelines } = useCommunityGuidelines(communityGuidelinesId);

  const serverDescription = communityGuidelines?.description ?? '';
  const [localDescription, setLocalDescription] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Reset local state whenever the guidelines id or the server value changes.
  useEffect(() => {
    setLocalDescription(null);
  }, [communityGuidelinesId, serverDescription]);

  const description = localDescription ?? serverDescription;
  const isDirty = localDescription !== null && localDescription !== serverDescription;

  const onDescriptionChange = (next: string) => {
    setLocalDescription(next);
  };

  const onSave = async () => {
    if (!communityGuidelines || !communityGuidelinesId) return;
    setSubmitting(true);
    try {
      await onUpdateCommunityGuidelines({
        displayName: communityGuidelines.displayName,
        description,
        references: communityGuidelines.references,
      });
      setLocalDescription(null);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    description,
    loading: loading && !communityGuidelines,
    submitting,
    isDirty,
    canSave: !!communityGuidelinesId && isDirty && !submitting,
    onDescriptionChange,
    onSave,
  };
}
