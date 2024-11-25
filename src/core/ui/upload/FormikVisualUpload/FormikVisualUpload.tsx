import { Box, BoxProps, Skeleton } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import 'react-image-crop/dist/ReactCrop.css';
import UploadButton from '@/core/ui/button/UploadButton';
import Image from '@/core/ui/image/Image';
import FileUploadWrapper from '../FileUploadWrapper';
import { CropDialog } from '../VisualUpload/CropDialog';
import { useField } from 'formik';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import { usePlatformVisualsConstraintsQuery } from '@/core/apollo/generated/apollo-hooks';
import { defaultVisualUrls } from '@/domain/journey/defaultVisuals/defaultVisualUrls';

const DEFAULT_SIZE = 128;

const ImagePlaceholder = ({ src, alt, ...props }: BoxProps<'img'>) => {
  const { t } = useTranslation();
  return src ? <Image src={src} alt={alt} {...props} /> : <Box {...props}>{t('components.visual-upload.no-data')}</Box>;
};

const FormikAvatarUploadSkeleton = () => {
  return (
    <Box>
      <Skeleton variant="rectangular" width={DEFAULT_SIZE} height={DEFAULT_SIZE} />
      <Box marginTop={2}>
        <Skeleton variant="text" width={DEFAULT_SIZE} />
      </Box>
    </Box>
  );
};

interface VisualWithAltText {
  file: File;
  altText?: string;
}

export interface FormikAvatarUploadProps extends BoxProps {
  name: string;
  visualType: VisualType;
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
const FormikAvatarUpload = ({
  name,
  visualType,
  height = DEFAULT_SIZE,
  altText,
  ...containerProps
}: FormikAvatarUploadProps) => {
  const { t } = useTranslation();

  const [cropDialogOpened, setCropDialogOpened] = useState(false);
  const [field, , helpers] = useField<VisualWithAltText | undefined>(name);
  const selectedFile = field.value;

  const { data: dimensionsData, loading } = usePlatformVisualsConstraintsQuery({
    variables: {
      includeAvatar: visualType === VisualType.Avatar,
      includeBanner: visualType === VisualType.Banner,
      includeCard: visualType === VisualType.Card,
      includeBannerWide: visualType === VisualType.BannerWide,
    },
  });
  const allConstraints = dimensionsData?.platform.configuration.visualTypeConstraints;
  const visualTypeConstraints =
    allConstraints?.Avatar ?? allConstraints?.Banner ?? allConstraints?.Card ?? allConstraints?.BannerWide;
  if (loading || !visualTypeConstraints) {
    return <FormikAvatarUploadSkeleton />;
  }
  const { allowedTypes, aspectRatio } = visualTypeConstraints;

  const onFileSelected = (file: File) => {
    helpers.setValue({ file, altText });
    setCropDialogOpened(true);
  };
  const handleVisualReady = (file: File, altText: string) => {
    helpers.setValue({ file, altText });
    setCropDialogOpened(true);
  };

  const width = height * aspectRatio;

  return (
    <Box {...containerProps}>
      <FileUploadWrapper onFileSelected={onFileSelected} allowedTypes={allowedTypes}>
        <Box marginBottom={2}>
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
            src={defaultVisualUrls[visualType]}
            alt={altText}
          />
        </Box>
      </FileUploadWrapper>
      <UploadButton allowedTypes={allowedTypes} onFileSelected={onFileSelected} text={t('buttons.upload')} />
      {cropDialogOpened && (
        <CropDialog
          open={cropDialogOpened}
          file={selectedFile?.file}
          onClose={() => setCropDialogOpened(false)}
          onSave={handleVisualReady}
          config={visualTypeConstraints}
        />
      )}
    </Box>
  );
};

export default FormikAvatarUpload;
