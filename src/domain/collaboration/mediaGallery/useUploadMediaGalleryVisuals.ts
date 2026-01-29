import { useCallback } from 'react';
import {
  useUploadVisualMutation,
  useAddVisualToMediaGalleryMutation,
  useDeleteVisualFromMediaGalleryMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import { getMediaGalleryVisualType } from './mediaGalleryVisualType';

interface MediaGalleryFormVisual {
  id?: string;
  file?: File;
  uri?: string;
  name?: string;
  altText?: string;
  visualType?: VisualType;
  sortOrder?: number;
}

interface uploadMediaGalleryVisualsParams {
  mediaGalleryId: string | undefined;
  visuals: MediaGalleryFormVisual[] | undefined;
  existingVisualIds?: string[];

  /**
   * Reupload visuals even if they have existing id, used for creating and using callout templates in Create forms
   */
  reuploadVisuals?: boolean;
}

const useUploadMediaGalleryVisuals = () => {
  const [addVisual] = useAddVisualToMediaGalleryMutation({
    refetchQueries: ['CalloutDetails'],
  });
  const [uploadVisual, { loading: uploadLoading }] = useUploadVisualMutation({
    refetchQueries: ['CalloutDetails'],
  });
  const [deleteVisual, { loading: deleteLoading }] = useDeleteVisualFromMediaGalleryMutation({
    refetchQueries: ['CalloutDetails'],
  });

  const uploadMediaGalleryVisuals = useCallback(
    async ({ mediaGalleryId, visuals, existingVisualIds, reuploadVisuals }: uploadMediaGalleryVisualsParams) => {
      if (!mediaGalleryId) {
        return;
      }

      // Step 1: Delete visuals that were removed (exist in existingVisualIds but not in visuals)
      const currentVisualIds = visuals?.map(v => v.id).filter(Boolean) ?? [];
      const visualsToDelete = existingVisualIds?.filter(id => !currentVisualIds.includes(id)) ?? [];

      const deleteOperations = visualsToDelete.map(visualID =>
        deleteVisual({
          variables: {
            deleteData: {
              mediaGalleryID: mediaGalleryId,
              visualID,
            },
          },
        })
      );

      // Step 2: Process all visuals in parallel: create + upload for new files, or update existing
      const uploadOperations =
        visuals?.map(async (visual, index) => {
          // Case 1: New visual with file - create visual on media gallery and upload image
          if (visual.file && !visual.id) {
            const visualType = visual.visualType ?? getMediaGalleryVisualType(visual.file, visual.uri);

            // Create the visual on the media gallery
            const { data } = await addVisual({
              variables: {
                addData: {
                  mediaGalleryID: mediaGalleryId,
                  visualType,
                  sortOrder: visual.sortOrder ?? index,
                },
              },
            });

            const createdVisualId = data?.addVisualToMediaGallery?.id;
            if (!createdVisualId) {
              throw new Error('Failed to create visual on media gallery');
            }

            // Upload the image to the created visual
            await uploadVisual({
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
            await uploadVisual({
              variables: {
                file: visual.file,
                uploadData: {
                  visualID: visual.id,
                  alternativeText: visual.altText ?? visual.name ?? visual.file.name,
                },
              },
            });
          }
          // Case 3: Visuals without files (URLs only) are reuploaded - for creating callout templates and applying callout templates
          else if (reuploadVisuals && visual.id && visual.uri && !visual.file) {
            // Get the file from the URI
            const response = await fetch(visual.uri);
            const blob = await response.blob();
            const file = new File([blob], visual.name || 'visual', { type: blob.type });
            const visualType = visual.visualType ?? getMediaGalleryVisualType(file, visual.uri);

            // Create the visual on the media gallery
            const { data } = await addVisual({
              variables: {
                addData: {
                  mediaGalleryID: mediaGalleryId,
                  visualType,
                  sortOrder: visual.sortOrder ?? index,
                },
              },
            });

            const createdVisualId = data?.addVisualToMediaGallery?.id;
            if (!createdVisualId) {
              throw new Error('Failed to create visual on media gallery');
            }

            // Upload the image to the created visual
            await uploadVisual({
              variables: {
                file,
                uploadData: {
                  visualID: createdVisualId,
                  alternativeText: visual.altText ?? visual.name ?? file.name,
                },
              },
            });
          }
        }) ?? [];

      await Promise.all([...deleteOperations, ...uploadOperations]);
    },
    [addVisual, uploadVisual, deleteVisual]
  );

  return { uploadMediaGalleryVisuals, uploading: uploadLoading || deleteLoading };
};

export default useUploadMediaGalleryVisuals;
