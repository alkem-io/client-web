import React, { FC } from 'react';
import { Skeleton } from '@mui/material';
import CanvasWhiteboard from '../../../common/components/composite/entities/Canvas/CanvasWhiteboard';

const CanvasPreview: FC<{ value: string; loading: boolean | undefined }> = ({ value, loading }) => {
  if (loading) {
    return <Skeleton variant="rectangular" />;
  }

  return (
    <CanvasWhiteboard
      entities={{ canvas: { id: '__template', value } }}
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
export default CanvasPreview;
