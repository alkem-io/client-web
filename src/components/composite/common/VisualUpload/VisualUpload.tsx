import 'react-image-crop/dist/ReactCrop.css';
import React, { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Box, Skeleton } from '@mui/material';
import { useApolloErrorHandler, useNotification } from '../../../../hooks';
import { useUploadVisualMutation } from '../../../../hooks/generated/graphql';
import UploadButton from '../../../core/UploadButton';
import { Visual } from '../../../../models/graphql-schema';
import { CropDialog } from './CropDialog';
import ImageComponent from '../../../../domain/shared/components/ImageComponent';

const DEFAULT_SIZE = 128;

interface VisualUploadProps {
  visual?: Visual;
  height?: number;
}

/**
 * if height or width are not specified, default size would be used instead
 * @param visual
 * @param height
 * @param width
 * @constructor
 */
const VisualUpload: FC<VisualUploadProps> = ({ visual, height = DEFAULT_SIZE }) => {
  const { t } = useTranslation();
  const handleError = useApolloErrorHandler();
  const notify = useNotification();

  const [uploadAvatar, { loading }] = useUploadVisualMutation({
    onError: handleError,
    onCompleted: () => notify(t('components.visual-upload.success'), 'success'),
  });
  const [dialogOpened, setDialogOpened] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File>();

  const handleVisualUpload = useCallback(
    async (file: File) => {
      if (visual) {
        uploadAvatar({
          variables: {
            file,
            uploadData: {
              visualID: visual.id,
            },
          },
        });
      }
    },
    [visual]
  );

  if (!visual) {
    return null;
  }

  const { maxWidth, maxHeight, allowedTypes, aspectRatio } = visual;

  if (!maxWidth || !maxHeight || !allowedTypes || !aspectRatio) {
    throw new Error(
      "'maxWidth', 'maxHeight', 'allowedTypes', 'aspectRatio' fields are required for the component to operate!"
    );
  }

  const width = height * visual.aspectRatio;

  return (
    <Box>
      <Box marginBottom={2}>
        {loading ? (
          <Skeleton variant="rectangular">
            <Avatar sx={{ width, height }} />
          </Skeleton>
        ) : (
          <ImageComponent src={visual?.uri} width={width} height={height} />
        )}
      </Box>
      {visual && (
        <Box>
          <UploadButton
            disabled={loading}
            accept={visual.allowedTypes.join(',')}
            onChange={e => {
              const file = e && e.target && e.target.files && e.target.files[0];
              if (file) {
                setSelectedFile(file);
                setDialogOpened(true);
              }
            }}
            text={t('buttons.edit')}
          />
        </Box>
      )}
      {dialogOpened && visual && (
        <CropDialog
          open={dialogOpened}
          file={selectedFile}
          onClose={() => setDialogOpened(false)}
          onSave={handleVisualUpload}
          config={{
            aspectRatio: visual.aspectRatio,
            minWidth: visual.minWidth,
            maxWidth: visual.maxWidth,
            minHeight: visual.minHeight,
            maxHeight: visual.maxHeight,
          }}
        />
      )}
    </Box>
  );
};

export default VisualUpload;
