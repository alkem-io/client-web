import { FC } from 'react';
import ExcalidrawWrapper from '../../../common/whiteboard/excalidraw/ExcalidrawWrapper';
import { TemplatePreviewBaseProps } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';
import { WhiteboardTemplateWithValue } from '../WhiteboardTemplateCard/WhiteboardTemplate';

interface WhiteboardTemplatePreviewProps extends TemplatePreviewBaseProps<WhiteboardTemplateWithValue> {}

const WhiteboardTemplatePreview: FC<WhiteboardTemplatePreviewProps> = ({ template }) => {
  if (!template?.value) {
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
