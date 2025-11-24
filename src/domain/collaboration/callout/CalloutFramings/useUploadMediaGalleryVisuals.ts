import { useCallback } from 'react';
import { useUploadVisualMutation } from '@/core/apollo/generated/apollo-hooks';

interface MediaGalleryFormVisual {
  id?: string;
  file?: File;
  name?: string;
}

interface MediaGalleryVisualResult {
  id?: string;
}

const useUploadMediaGalleryVisuals = () => {
  const [uploadVisual, { loading }] = useUploadVisualMutation();

  const uploadMediaGalleryVisuals = useCallback(
    async (formVisuals: MediaGalleryFormVisual[] | undefined, createdVisuals: MediaGalleryVisualResult[] | undefined) => {
      const uploads = formVisuals
        ?.map((visual, index) => {
          const targetVisual = createdVisuals?.[index];
          if (visual.file && targetVisual?.id) {
            return uploadVisual({
              variables: {
                file: visual.file,
                uploadData: {
                  visualID: targetVisual.id,
                  alternativeText: visual.name,
                },
              },
            });
          }
          return undefined;
        })
        .filter(Boolean);

      if (uploads && uploads.length) {
        await Promise.all(uploads);
      }
    },
    [uploadVisual]
  );

  return { uploadMediaGalleryVisuals, uploading: loading };
};

export default useUploadMediaGalleryVisuals;
