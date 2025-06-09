import { FC, useState } from 'react';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import Loading from '@/core/ui/loading/Loading';
import type { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import ExcalidrawWrapper from '@/domain/common/whiteboard/excalidraw/ExcalidrawWrapper';
import useWhiteboardFilesManager from '@/domain/common/whiteboard/excalidraw/useWhiteboardFilesManager';
import { Box } from '@mui/material';

interface TemplateContentWhiteboardPreviewProps {
  loading?: boolean;
  template?: {
    whiteboard?: {
      content: string;
    };
  };
}

const TemplateContentWhiteboardPreview: FC<TemplateContentWhiteboardPreviewProps> = ({ template, loading }) => {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const filesManager = useWhiteboardFilesManager({ excalidrawAPI });

  return (
    <>
      {loading && (
        <Box textAlign="center">
          <Loading />
        </Box>
      )}
      {!loading && (
        <PageContentBlock disablePadding sx={{ flexGrow: 1 }}>
          <ExcalidrawWrapper
            entities={{
              whiteboard: template?.whiteboard,
              filesManager,
            }}
            actions={{
              onInitApi: setExcalidrawAPI,
            }}
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
      )}
    </>
  );
};

export default TemplateContentWhiteboardPreview;
