import { useTranslation } from 'react-i18next';
import { useAttachVisualMutation, useRequestVisualUploadMutation } from '@/core/apollo/generated-v2/apollo-hooks';
import { error as logError } from '@/core/logging/sentry/log';
import { useNotification } from '@/core/ui/notifications/useNotification';

/** The file roles of a space's root visuals (023 FR-003; the visual_constraints names). */
export type SpaceVisualRole = 'avatar' | 'banner' | 'card';

/** A cropped image picked in a create dialog, with the alt text entered in the crop step. */
export type PendingVisual = { file: File; altText?: string };

export type SpaceVisuals = Partial<Record<SpaceVisualRole, PendingVisual>>;

type UploadedFile = { id: string };

/**
 * Uploads the visuals chosen in a create dialog once the space exists (023 FR-020), through the file contract
 * (022 FR-001/FR-002/FR-004, contracts/http.md): requestUpload on the new space, PUT the bytes to the token's
 * url, then attachFile under the role. The space is created either way; a failed upload is reported with the
 * existing "created, but the images failed" notice and logged, never dropped silently.
 */
const useUploadVisualsOnCreate = ({ entityName }: { entityName: string }) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const [requestUpload] = useRequestVisualUploadMutation();
  const [attachFile] = useAttachVisualMutation();

  const uploadVisual = async (owner: string, role: SpaceVisualRole, { file, altText }: PendingVisual) => {
    const { data } = await requestUpload({ variables: { owner, mime: file.type, size: file.size, role } });
    if (!data) throw new Error(`requestUpload returned no token for the ${role} of ${owner}`);
    const response = await fetch(data.requestUpload.url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${data.requestUpload.token}`,
        'Content-Type': file.type,
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      },
      body: file,
    });
    if (!response.ok) throw new Error(`Upload of the ${role} of ${owner} failed with HTTP ${response.status}`);
    const uploaded = (await response.json()) as UploadedFile;
    await attachFile({
      variables: { owner, file: uploaded.id, role, displayName: file.name, alt: altText || undefined },
    });
  };

  const uploadVisuals = async (owner: string, visuals: SpaceVisuals) => {
    const pending = (Object.entries(visuals) as [SpaceVisualRole, PendingVisual | undefined][]).filter(
      (entry): entry is [SpaceVisualRole, PendingVisual] => entry[1] !== undefined
    );
    const results = await Promise.allSettled(pending.map(([role, visual]) => uploadVisual(owner, role, visual)));
    const failures = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected');
    if (failures.length === 0) return;
    notify(t('components.visual-upload.entityCreatedErrorUploading', { entity: entityName }), 'error');
    for (const failure of failures) {
      logError(failure.reason instanceof Error ? failure.reason : new Error(String(failure.reason)));
    }
  };

  return { uploadVisuals };
};

export default useUploadVisualsOnCreate;
