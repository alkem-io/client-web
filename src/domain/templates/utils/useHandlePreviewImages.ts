import { useUploadWhiteboardVisuals } from '@/domain/collaboration/whiteboard/WhiteboardVisuals/useUploadWhiteboardVisuals';
import { WhiteboardPreviewImage } from '@/domain/collaboration/whiteboard/WhiteboardVisuals/WhiteboardPreviewImagesModels';

const useHandlePreviewImages = () => {
  const { uploadVisuals } = useUploadWhiteboardVisuals();

  const handlePreviewTemplates = async (
    whiteboardPreviewImages: WhiteboardPreviewImage[] | undefined,
    mutationResult?: { profile?: { cardVisual?: { id: string }; previewVisual?: { id: string } }; nameID: string }
  ) => {
    const previewImages = whiteboardPreviewImages;
    if (mutationResult && previewImages) {
      await uploadVisuals(
        previewImages,
        {
          cardVisualId: mutationResult.profile?.cardVisual?.id,
          previewVisualId: mutationResult.profile?.previewVisual?.id,
        },
        mutationResult.nameID // To upload the screenshots with the whiteboard nameId
      );
    }
  };
  return {
    handlePreviewTemplates,
  };
};

export default useHandlePreviewImages;
