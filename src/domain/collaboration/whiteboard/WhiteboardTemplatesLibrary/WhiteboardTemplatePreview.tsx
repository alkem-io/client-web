import { FC, useRef } from 'react';
import ExcalidrawWrapper from '../../../common/whiteboard/excalidraw/ExcalidrawWrapper';
import useWhiteboardFilesManager from '../../../common/whiteboard/excalidraw/useWhiteboardFilesManager';
import { ExcalidrawAPIRefValue } from '@alkemio/excalidraw/types/types';
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
  const excalidrawApiRef = useRef<ExcalidrawAPIRefValue>(null);
  const filesManager = useWhiteboardFilesManager({ excalidrawApi: excalidrawApiRef.current });

  if (!isLoadedWhiteboardTemplateContent(template)) {
    return null;
  }

  return (
    <PageContentBlock disablePadding sx={{ flexGrow: 1 }}>
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
    </PageContentBlock>
  );
};

export default WhiteboardTemplatePreview;
