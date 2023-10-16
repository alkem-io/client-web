import { FC, useRef } from 'react';
import ExcalidrawWrapper from '../../../common/whiteboard/excalidraw/ExcalidrawWrapper';
import { TemplatePreviewBaseProps } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';
import { WhiteboardTemplateWithContent } from '../WhiteboardTemplateCard/WhiteboardTemplate';
import useWhiteboardFilesManager from '../../../common/whiteboard/excalidraw/useWhiteboardFilesManager';
import { ExcalidrawAPIRefValue } from '@alkemio/excalidraw/types/types';

interface WhiteboardTemplatePreviewProps extends TemplatePreviewBaseProps<WhiteboardTemplateWithContent> {}

const WhiteboardTemplatePreview: FC<WhiteboardTemplatePreviewProps> = ({ template }) => {
  const excalidrawApiRef = useRef<ExcalidrawAPIRefValue>(null);
  const filesManager = useWhiteboardFilesManager({ excalidrawApi: excalidrawApiRef.current });

  if (!template?.content) {
    return null;
  }
  return (
    <ExcalidrawWrapper
      ref={excalidrawApiRef}
      entities={{
        whiteboard: template,
        filesManager,
      }}
      actions={{}}
      options={{
        viewModeEnabled: true,
        UIOptions: {
          canvasActions: {
            export: false,
          },
        },
      }}
    />
  );
};

export default WhiteboardTemplatePreview;
