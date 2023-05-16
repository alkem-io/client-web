import { FC } from 'react';
import CanvasWhiteboard from '../../../../common/components/composite/entities/Canvas/CanvasWhiteboard';
import { TemplatePreviewBaseProps } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';
import { WhiteboardTemplateWithValue } from '../WhiteboardTemplateCard/WhiteboardTemplate';

interface WhiteboardTemplatePreviewProps extends TemplatePreviewBaseProps<WhiteboardTemplateWithValue> {}

const WhiteboardTemplatePreview: FC<WhiteboardTemplatePreviewProps> = ({ template }) => {
  if (!template?.value) {
    return null;
  }
  return (
    <CanvasWhiteboard
      entities={{
        canvas: template,
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
