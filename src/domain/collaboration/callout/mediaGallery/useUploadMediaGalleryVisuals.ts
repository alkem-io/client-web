import { useCallback } from 'react';
import { useUploadVisualMutation, useAddVisualToMediaGalleryMutation } from '@/core/apollo/generated/apollo-hooks';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import { getMediaGalleryVisualType } from './mediaGalleryVisualType';

interface MediaGalleryFormVisual {
  id?: string;
  file?: File;
  uri?: string;
  name?: string;
  altText?: string;
  visualType?: VisualType;
}

const useUploadMediaGalleryVisuals = () => {
  const [addVisualMutation] = useAddVisualToMediaGalleryMutation();
  const [uploadVisualMutation, { loading }] = useUploadVisualMutation();

  const uploadMediaGalleryVisuals = useCallback(
    async (mediaGalleryId: string | undefined, formVisuals: MediaGalleryFormVisual[] | undefined) => {
      if (!mediaGalleryId || !formVisuals?.length) {
        return;
      }

      // Process all visuals in parallel: create + upload for new files, or just update existing
      const operations = formVisuals.map(async visual => {
        // Case 1: New visual with file - create visual on media gallery and upload image
        if (visual.file && !visual.id) {
          const visualType = visual.visualType ?? getMediaGalleryVisualType(visual.file, visual.uri);

          // Create the visual on the media gallery
          const { data } = await addVisualMutation({
            variables: {
              addData: {
                mediaGalleryID: mediaGalleryId,
                visualType,
              },
            },
          });

          const createdVisualId = data?.addVisualToMediaGallery?.id;
          if (!createdVisualId) {
            throw new Error('Failed to create visual on media gallery');
          }

          // Upload the image to the created visual
          await uploadVisualMutation({
            variables: {
              file: visual.file,
              uploadData: {
                visualID: createdVisualId,
                alternativeText: visual.altText ?? visual.name ?? visual.file.name,
              },
            },
          });
        }
        // Case 2: Existing visual with new file - just upload the new image
        else if (visual.file && visual.id) {
          await uploadVisualMutation({
            variables: {
              file: visual.file,
              uploadData: {
                visualID: visual.id,
                alternativeText: visual.altText ?? visual.name ?? visual.file.name,
              },
            },
          });
        }
        // Case 3: Visuals without files (URLs only) are handled by the backend during callout creation/update
      });

      await Promise.all(operations);
    },
    [addVisualMutation, uploadVisualMutation]
  );

  return { uploadMediaGalleryVisuals, uploading: loading };
};

export default useUploadMediaGalleryVisuals;
