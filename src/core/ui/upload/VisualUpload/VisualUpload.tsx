import { Avatar, Box, BoxProps, Skeleton } from '@mui/material';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import 'react-image-crop/dist/ReactCrop.css';
import { useUploadVisualMutation } from '@/core/apollo/generated/apollo-hooks';
import UploadButton from '@/core/ui/button/UploadButton';
import Image from '@/core/ui/image/Image';
import { useNotification } from '@/core/ui/notifications/useNotification';
import FileUploadWrapper from '../FileUploadWrapper';
import { CropDialog } from './CropDialog';
import { VisualModelFull } from '@/domain/common/visual/model/VisualModel';
import { VisualUploadModel } from './VisualUpload.model';

const DEFAULT_SIZE = 128;

const ImagePlaceholder = ({ src, alt, ...props }: BoxProps<'img'>) => {
  const { t } = useTranslation();
  return src ? <Image src={src} alt={alt} {...props} /> : <Box {...props}>{t('components.visual-upload.no-data')}</Box>;
};

export interface VisualUploadProps {
  visual?: VisualModelFull;
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
const VisualUpload = ({ visual, height = DEFAULT_SIZE }: VisualUploadProps) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const altText = visual?.alternativeText || t('components.visual-upload.no-data');

  const [uploadVisual, { loading }] = useUploadVisualMutation({
    onCompleted: () => notify(t('components.visual-upload.success'), 'success'),
  });
  const [dialogOpened, setDialogOpened] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File>();

  const handleVisualUpload = useCallback(
    async (data: VisualUploadModel) => {
      if (visual && data.file) {
        uploadVisual({
          variables: {
            file: data.file,
            uploadData: {
              visualID: visual.id,
              alternativeText: data.altText,
            },
          },
        });
      }
    },
    [visual, uploadVisual]
  );

  function onFileSelected(file: File) {
    setSelectedFile(file);
    setDialogOpened(true);
  }

  if (!visual) return null;

  const { maxWidth, maxHeight, allowedTypes, aspectRatio } = visual;

  const missingFields = [
    !maxWidth && 'maxWidth',
    !maxHeight && 'maxHeight',
    !allowedTypes && 'allowedTypes',
    !aspectRatio && 'aspectRatio',
  ].filter(Boolean);

  if (missingFields.length) throw new Error(`Missing required fields: ${missingFields.join(', ')}`);

  const width = height * aspectRatio;

  return (
    <Box>
      <FileUploadWrapper onFileSelected={onFileSelected} allowedTypes={allowedTypes}>
        <Box marginBottom={2}>
          {loading ? (
            <Skeleton variant="rectangular">
              <Avatar sx={{ width, height }} alt={t('components.visualSegment.avatar')} />
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
                cursor: 'pointer',
                borderColor: theme => theme.palette.grey[400],
              }}
              src={visual?.uri}
              alt={altText}
            />
          )}
        </Box>
      </FileUploadWrapper>

      <Box>
        <UploadButton
          disabled={loading}
          allowedTypes={allowedTypes}
          onFileSelected={onFileSelected}
          text={t('buttons.edit')}
        />
      </Box>
      {dialogOpened && (
        <CropDialog
          open={dialogOpened}
          file={selectedFile}
          onClose={() => setDialogOpened(false)}
          onSave={handleVisualUpload}
          config={visual}
        />
      )}
    </Box>
  );
};

export default VisualUpload;
