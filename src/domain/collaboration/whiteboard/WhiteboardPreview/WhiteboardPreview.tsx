import React, { FC } from 'react';
import { Skeleton } from '@mui/material';
import WhiteboardWhiteboard from '../../../../common/components/composite/entities/Whiteboard/WhiteboardWhiteboard';

const WhiteboardPreview: FC<{ value: string; loading: boolean | undefined }> = ({ value, loading }) => {
  if (loading) {
    return <Skeleton variant="rectangular" />;
  }

  return (
    <WhiteboardWhiteboard
      entities={{ whiteboard: { id: '__template', value } }}
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

export default WhiteboardPreview;
