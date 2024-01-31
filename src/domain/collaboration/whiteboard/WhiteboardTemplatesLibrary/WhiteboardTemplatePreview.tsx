import { FC, useState } from 'react';
import ExcalidrawWrapper from '../../../common/whiteboard/excalidraw/ExcalidrawWrapper';
import useWhiteboardFilesManager from '../../../common/whiteboard/excalidraw/useWhiteboardFilesManager';
import { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/types/types';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';

interface WhiteboardTemplatePreviewProps {
  template?: {
    content?: string;
  };
}

interface LoadedWhiteboardTemplateContent {
  content: string;
}

const isLoadedWhiteboardTemplateContent = (
  template: WhiteboardTemplatePreviewProps['template']
): template is LoadedWhiteboardTemplateContent => {
  return !!template?.content;
};

const WhiteboardTemplatePreview: FC<WhiteboardTemplatePreviewProps> = ({ template }) => {
  const excalidrawAPIState = useState<ExcalidrawImperativeAPI | null>(null);
  const [excalidrawAPI] = excalidrawAPIState;
  const filesManager = useWhiteboardFilesManager({ excalidrawAPI });

  if (!isLoadedWhiteboardTemplateContent(template)) {
    return null;
  }

  return (
    <PageContentBlock disablePadding sx={{ flexGrow: 1 }}>
      <ExcalidrawWrapper
        excalidrawAPI={excalidrawAPIState}
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
    </PageContentBlock>
  );
};

export default WhiteboardTemplatePreview;
