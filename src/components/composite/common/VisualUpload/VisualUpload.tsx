import 'react-image-crop/dist/ReactCrop.css';
import React, { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Box, Skeleton, SxProps } from '@mui/material';
import { grey } from '@mui/material/colors';
import { useApolloErrorHandler, useNotification } from '../../../../hooks';
import { useUploadVisualMutation } from '../../../../hooks/generated/graphql';
import UploadButton from '../../../core/UploadButton';
import { Visual } from '../../../../models/graphql-schema';
import { CropDialog } from './CropDialog';

const DEFAULT_SIZE = 150;

interface VisualUploadProps {
  visual?: Visual;
  height?: number;
  width?: number;
}

/**
 * if height or width are not specified, default size would be used instead
 * @param visual
 * @param height
 * @param width
 * @constructor
 */
const VisualUpload: FC<VisualUploadProps> = ({ visual, height = DEFAULT_SIZE, width = DEFAULT_SIZE }) => {
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

interface ImageComponentProps {
  width: number;
  height: number;
  src?: string;
}

const ImageComponent: FC<ImageComponentProps> = ({ width, height, src }) => {
  const { t } = useTranslation();

  const sx: SxProps = {
    width,
    height,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 1,
    borderColor: grey[400],
  };

  return src ? (
    <img src={src} width={width} height={height} alt={''} />
  ) : (
    <Box sx={sx}>{t('components.visual-upload.no-data')}</Box>
  );
};
