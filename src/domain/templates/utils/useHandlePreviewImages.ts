import {
  useUploadWhiteboardVisuals,
  WhiteboardPreviewImage,
} from '@/domain/collaboration/whiteboard/WhiteboardPreviewImages/WhiteboardPreviewImages';

const useHandlePreviewImages = () => {
  const { uploadVisuals } = useUploadWhiteboardVisuals();

  const handlePreviewTemplates = async (
    values: { whiteboardPreviewImages?: WhiteboardPreviewImage[] },
    mutationResult?: { profile?: { cardVisual?: { id: string }; previewVisual?: { id: string } }; nameID: string }
  ) => {
    const previewImages = values.whiteboardPreviewImages;
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
