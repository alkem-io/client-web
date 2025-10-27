import { useUploadVisualMutation } from '@/core/apollo/generated/apollo-hooks';
import { WhiteboardPreviewImage } from './WhiteboardPreviewImagesModels';
import { VisualType } from '@/core/apollo/generated/graphql-schema';

interface VisualsIds {
  cardVisualId?: string;
  previewVisualId?: string;
}

/**
 * Receives the images exported by Excalidraw in getWhiteboardPreviewImage and uploads them if there is a visualId to upload them to.
 */
const useUploadWhiteboardVisuals = () => {
  const [uploadVisual, { loading }] = useUploadVisualMutation({});
  return {
    uploadVisuals: async (
      previewImages: WhiteboardPreviewImage[] | undefined,
      visualsIds: VisualsIds,
      whiteboardNameId: string = 'whiteboard'
    ) => {
      if (visualsIds.cardVisualId) {
        const previewImage = previewImages?.find(pi => pi.visualType === VisualType.Card);
        if (previewImage) {
          await uploadVisual({
            variables: {
              file: new File([previewImage.imageData], `/Whiteboard-${whiteboardNameId}-bannerNarrow.png`, {
                type: 'image/png',
              }),
              uploadData: {
                visualID: visualsIds.cardVisualId,
              },
            },
          });
        }
      }
      if (visualsIds.previewVisualId) {
        const previewImage = previewImages?.find(pi => pi.visualType === VisualType.WhiteboardPreview);
        if (previewImage) {
          await uploadVisual({
            variables: {
              file: new File([previewImage.imageData], `/Whiteboard-${whiteboardNameId}-whiteboard-preview.png`, {
                type: 'image/png',
              }),
              uploadData: {
                visualID: visualsIds.previewVisualId,
              },
            },
          });
        }
      }
    },
    loading,
  };
};

export default useUploadWhiteboardVisuals;
