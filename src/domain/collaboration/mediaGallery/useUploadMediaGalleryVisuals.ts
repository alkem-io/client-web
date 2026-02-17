import { useCallback } from 'react';
import { useApolloClient } from '@apollo/client';
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

  /**
   * Original sortOrder values for existing visuals (keyed by visual id).
   * When a visual's sortOrder differs from the original, it will be deleted and re-added with the new sortOrder.
   */
  originalSortOrders?: Record<string, number>;
}

const useUploadMediaGalleryVisuals = () => {
  const apolloClient = useApolloClient();
  const [addVisual] = useAddVisualToMediaGalleryMutation();
  const [uploadVisual, { loading: uploadLoading }] = useUploadVisualMutation();
  const [deleteVisual, { loading: deleteLoading }] = useDeleteVisualFromMediaGalleryMutation();

  const uploadMediaGalleryVisuals = useCallback(
    async ({
      mediaGalleryId,
      visuals,
      existingVisualIds,
      reuploadVisuals,
      originalSortOrders,
    }: uploadMediaGalleryVisualsParams) => {
      if (!mediaGalleryId || !visuals) {
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

      // Fetches an image from a URI, creates a new visual on the media gallery, and uploads the image to it.
      const fetchAndCreateVisual = async (visual: MediaGalleryFormVisual, sortOrder: number) => {
        const response = await fetch(visual.uri!);
        if (!response.ok) {
          throw new Error(`Failed to fetch visual from ${visual.uri}: ${response.status} ${response.statusText}`);
        }
        const blob = await response.blob();
        const file = new File([blob], visual.name || 'visual', { type: blob.type });
        const visualType = visual.visualType ?? getMediaGalleryVisualType(file, visual.uri);

        const { data } = await addVisual({
          variables: {
            addData: {
              mediaGalleryID: mediaGalleryId,
              visualType,
              sortOrder,
            },
          },
        });

        const createdVisualId = data?.addVisualToMediaGallery?.id;
        if (!createdVisualId) {
          throw new Error('Failed to create visual on media gallery');
        }

        await uploadVisual({
          variables: {
            file,
            uploadData: {
              visualID: createdVisualId,
              alternativeText: visual.altText ?? visual.name ?? file.name,
            },
          },
        });
      };

      // Step 2: Process all visuals in parallel: create + upload for new files, or update existing
      const uploadOperations =
        visuals?.map(async (visual, index) => {
          // Case 1: New visual with file - create visual on media gallery and upload image
          if (visual.file && !visual.id) {
            const visualType = visual.visualType ?? getMediaGalleryVisualType(visual.file, visual.uri);

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
            await fetchAndCreateVisual(visual, visual.sortOrder ?? index);
          }
          // Case 4: Existing visual with changed sortOrder - delete and re-add with new sortOrder.
          // TODO: Replace with a dedicated updateVisualSortOrder mutation when the server supports it.
          else if (
            originalSortOrders &&
            visual.id &&
            visual.uri &&
            !visual.file &&
            visual.sortOrder !== undefined &&
            originalSortOrders[visual.id] !== undefined &&
            visual.sortOrder !== originalSortOrders[visual.id]
          ) {
            await deleteVisual({
              variables: {
                deleteData: {
                  mediaGalleryID: mediaGalleryId,
                  visualID: visual.id,
                },
              },
            });
            await fetchAndCreateVisual(visual, visual.sortOrder);
          }
        }) ?? [];

      // Use allSettled so all operations are attempted even if some fail.
      // Individual mutation errors are already handled by the global Apollo error handler
      // which shows notifications with proper error codes (numericCode) to the user.
      await Promise.allSettled([...deleteOperations, ...uploadOperations]);

      // Refetch relevant queries to update the UI regardless of individual failures,
      // so that successfully processed visuals are reflected in the cache.
      await apolloClient.refetchQueries({
        include: ['CalloutDetails', 'TemplateContent'],
      });
    },
    [addVisual, uploadVisual, deleteVisual, apolloClient]
  );

  return { uploadMediaGalleryVisuals, uploading: uploadLoading || deleteLoading };
};

export default useUploadMediaGalleryVisuals;
