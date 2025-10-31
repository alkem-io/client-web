import { useUpdateWhiteboardPreviewSettingsMutation } from '@/core/apollo/generated/apollo-hooks';
import { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import useGenerateWhiteboardVisuals from '../WhiteboardVisuals/useGenerateWhiteboardVisuals';
import useUploadWhiteboardVisuals from '../WhiteboardVisuals/useUploadWhiteboardVisuals';
import { WhiteboardPreviewMode, WhiteboardPreviewSettings } from '@/core/apollo/generated/graphql-schema';
import { PreviewImageDimensions } from '../WhiteboardVisuals/WhiteboardPreviewImagesModels';
import { Identifiable } from '@/core/utils/Identifiable';
import useEnsurePresence from '@/core/utils/ensurePresence';

interface useUpdateWhiteboardPreviewSettingsProps {
  whiteboard:
    | {
        id: string;
        nameID: string;
        profile: {
          preview?: Identifiable & PreviewImageDimensions;
          visual?: Identifiable & PreviewImageDimensions;
        };
      }
    | undefined;
  excalidrawAPI: ExcalidrawImperativeAPI | null;
}

const useUpdateWhiteboardPreviewSettings = ({ whiteboard, excalidrawAPI }: useUpdateWhiteboardPreviewSettingsProps) => {
  const ensurePresence = useEnsurePresence();
  const [handleUpdateWhiteboardPreviewSettings] = useUpdateWhiteboardPreviewSettingsMutation();
  const { generateWhiteboardVisuals } = useGenerateWhiteboardVisuals(excalidrawAPI);
  const { uploadVisuals } = useUploadWhiteboardVisuals();

  const updateWhiteboardPreviewSettings = async (previewSettings: WhiteboardPreviewSettings) => {
    const whiteboardId = ensurePresence(whiteboard?.id);

    await handleUpdateWhiteboardPreviewSettings({
      variables: {
        whiteboardId,
        previewSettings,
      },
    });
    if (previewSettings.mode === WhiteboardPreviewMode.Fixed) {
      const previewImages = await generateWhiteboardVisuals(
        {
          profile: {
            preview: whiteboard?.profile.preview,
            visual: whiteboard?.profile.visual,
          },
          previewSettings,
        },
        true
      );
      await uploadVisuals(
        previewImages,
        {
          cardVisualId: whiteboard?.profile.visual?.id,
          previewVisualId: whiteboard?.profile.preview?.id,
        },
        whiteboard?.nameID
      );
    }
  };

  return { updateWhiteboardPreviewSettings };
};

export default useUpdateWhiteboardPreviewSettings;
