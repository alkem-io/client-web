import { useUploadVisualMutation } from '@/core/apollo/generated/apollo-hooks';
import { error as logError } from '@/core/logging/sentry/log';
import type { VisualUploadModel } from '@/core/ui/upload/VisualUpload/VisualUpload.model';
import type { Identifiable } from '@/core/utils/Identifiable';

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
  uploadVisuals: (createResult: ProfileWithVisuals | undefined, data: VisualsForm | undefined) => Promise<void>;
}

/**
 * Helper to upload visuals after creating an entity like a Space or Subspace.
 * It handles the upload of visuals like avatar, cardBanner, and banner.
 * The form data needs to be compatible, use the VisualUploadModel for visuals
 * And the response from the mutation should include the created visuals with their IDs.
 */
const useUploadVisualsOnCreate = (): UseUploadVisualsOnCreateProvided => {
  const [uploadVisual] = useUploadVisualMutation();

  const uploadVisuals = async (createResult: ProfileWithVisuals | undefined, data: VisualsForm | undefined) => {
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

      // Wait for every upload to settle, not just the first failure: the caller
      // treats this promise as the end of the create sequence (dialog close,
      // navigation), so it must not resolve while another upload is still running.
      // A rejection is rethrown inside the try so it lands in the catch below,
      // rather than escaping to the caller as if the entity had not been created.
      const results = await Promise.allSettled(uploadPromises);
      const failure = results.find((result): result is PromiseRejectedResult => result.status === 'rejected');
      if (failure) {
        throw failure.reason;
      }
    } catch (error) {
      // Space/Subspace is created anyway, just the images failed. Each failed upload is reported by
      // the global error handler, with the server's reason; log the error and continue.
      if (error instanceof Error) {
        logError(error);
      } else {
        logError(`Error uploading visuals for space: ${error}`, { label: 'TempStorage' });
      }
    }
  };

  return { uploadVisuals };
};

export default useUploadVisualsOnCreate;
