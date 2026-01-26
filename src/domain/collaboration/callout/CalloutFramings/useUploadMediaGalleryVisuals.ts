import { useCallback } from 'react';
import { useUploadVisualMutation } from '@/core/apollo/generated/apollo-hooks';

const isDefined = <T>(value: T | null | undefined): value is T => value !== undefined && value !== null;

interface MediaGalleryFormVisual {
  id?: string;
  file?: File;
  name?: string;
  altText?: string;
}

interface MediaGalleryVisualResult {
  id?: string;
}

const useUploadMediaGalleryVisuals = () => {
  const [uploadVisual, { loading }] = useUploadVisualMutation();

  const uploadMediaGalleryVisuals = useCallback(
    async (
      formVisuals: MediaGalleryFormVisual[] | undefined,
      createdVisuals: MediaGalleryVisualResult[] | undefined
    ) => {
      const uploads = formVisuals
        ?.map((visual, index) => {
          const targetVisual = createdVisuals?.[index];
          if (visual.file && targetVisual?.id) {
            return uploadVisual({
              variables: {
                file: visual.file,
                uploadData: {
                  visualID: targetVisual.id,
                  alternativeText: visual.altText ?? visual.name,
                },
              },
            });
          }
          return undefined;
        })
        .filter(isDefined);

      if (uploads?.length) {
        await Promise.all(uploads);
      }
    },
    [uploadVisual]
  );

  return { uploadMediaGalleryVisuals, uploading: loading };
};

export default useUploadMediaGalleryVisuals;
