import { useUploadVisualMutation } from '@/core/apollo/generated/apollo-hooks';
import { VisualUploadModel } from '@/core/ui/upload/VisualUpload/VisualUpload.model';
import { Identifiable } from '@/core/utils/Identifiable';
import { error as logError } from '@/core/logging/sentry/log';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

const VisualTypes = ['avatar', 'cardBanner', 'banner'] as const;

interface ProfileWithVisuals {
  avatar?: Identifiable;
  cardBanner?: Identifiable;
  banner?: Identifiable;
}

interface VisualsForm {
  avatar?: VisualUploadModel;
  cardBanner?: VisualUploadModel;
  banner?: VisualUploadModel;
}

interface UseUploadVisualsOnCreateProvided {
  uploadVisuals: (
    createResult: ProfileWithVisuals | undefined,
    data: VisualsForm | undefined
  ) => Promise<unknown> | void;
}

interface UseUploadVisualsOnCreateProps {
  /**
   * The name of the entity just created (space/subspace...), to show in the error message to the user if the upload fails.
   */
  entityName?: string;
}
/**
 * Helper to upload visuals after creating an entity like a Space or Subspace.
 * It handles the upload of visuals like avatar, cardBanner, and banner.
 * The form data needs to be compatible, use the VisualUploadModel for visuals
 * And the response from the mutation should include the created visuals with their IDs.
 */
const useUploadVisualsOnCreate = ({
  entityName,
}: UseUploadVisualsOnCreateProps = {}): UseUploadVisualsOnCreateProvided => {
  const { t } = useTranslation();
  const notify = useNotification();
  const [uploadVisual] = useUploadVisualMutation();

  const uploadVisuals = useCallback(
    (createResult: ProfileWithVisuals | undefined, data: VisualsForm | undefined) => {
      try {
        const uploadPromises: Promise<unknown>[] = [];
        for (const visualType of VisualTypes) {
          if (data?.[visualType]?.file && createResult?.[visualType]?.id) {
            uploadPromises.push(
              uploadVisual({
                variables: {
                  file: data[visualType].file,
                  uploadData: {
                    visualID: createResult[visualType].id,
                    alternativeText: data[visualType].altText,
                  },
                },
              })
            );
          }
        }

        return Promise.all(uploadPromises);
      } catch (error) {
        // Space/Subspace is created anyway, just the images failed. Log the error and continue
        notify(t('components.visual-upload.entityCreatedErrorUploading', { entity: entityName }), 'error');
        if (error instanceof Error) {
          logError(error);
        } else {
          logError(`Error uploading visuals for space: ${error}`, { label: 'TempStorage' });
        }
      }
    },
    [uploadVisual, notify, t, entityName]
  );

  return { uploadVisuals };
};

export default useUploadVisualsOnCreate;
