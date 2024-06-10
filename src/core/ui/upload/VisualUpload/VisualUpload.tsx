import 'react-image-crop/dist/ReactCrop.css';
import React, { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Box, BoxProps, Skeleton } from '@mui/material';
import { useNotification } from '../../notifications/useNotification';
import { useUploadVisualMutation } from '../../../apollo/generated/apollo-hooks';
import UploadButton from '../../button/UploadButton';
import { CropDialog } from './CropDialog';
import Image from '../../image/Image';

const DEFAULT_SIZE = 128;

const ImagePlaceholder: FC<BoxProps<'img'>> = ({ src, alt, ...props }) => {
  const { t } = useTranslation();
  return src ? <Image src={src} alt={alt} {...props} /> : <Box {...props}>{t('components.visual-upload.no-data')}</Box>;
};

export interface VisualUploadProps {
  visual?: {
    id: string;
    allowedTypes: string[];
    alternativeText?: string;
    aspectRatio: number;
    maxHeight: number;
    maxWidth: number;
    minHeight: number;
    minWidth: number;
    uri: string;
  };
  height?: number;
  altText?: string;
}

/**
 * if height or width are not specified, default size would be used instead
 * @param visual
 * @param height
 * @param width
 * @constructor
 */
const VisualUpload: FC<VisualUploadProps> = ({ visual, height = DEFAULT_SIZE, altText }) => {
  const { t } = useTranslation();
  const notify = useNotification();

  const [uploadVisual, { loading }] = useUploadVisualMutation({
    onCompleted: () => notify(t('components.visual-upload.success'), 'success'),
  });
  const [dialogOpened, setDialogOpened] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File>();

  const handleVisualUpload = useCallback(
    async (file: File, altText: string) => {
      if (visual) {
        uploadVisual({
          variables: {
            file,
            uploadData: {
              visualID: visual.id,
              alternativeText: altText,
            },
          },
        });
      }
    },
    [visual, uploadVisual]
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
          <ImagePlaceholder
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 1,
              width,
              height,
              borderColor: theme => theme.palette.grey[400],
            }}
            src={visual?.uri}
            alt={altText}
          />
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
