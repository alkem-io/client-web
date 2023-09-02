import { FC } from 'react';
import ExcalidrawWrapper from '../../../common/whiteboard/excalidraw/ExcalidrawWrapper';
import { TemplatePreviewBaseProps } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';
import { WhiteboardTemplateWithContent } from '../WhiteboardTemplateCard/WhiteboardTemplate';

interface WhiteboardTemplatePreviewProps extends TemplatePreviewBaseProps<WhiteboardTemplateWithContent> {}

const WhiteboardTemplatePreview: FC<WhiteboardTemplatePreviewProps> = ({ template }) => {
  if (!template?.content) {
    return null;
  }
  return (
    <ExcalidrawWrapper
      entities={{
        whiteboard: template,
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
