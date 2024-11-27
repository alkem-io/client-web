import { Box, BoxProps, Skeleton } from '@mui/material';
import { useMemo, useState } from 'react';
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
import { Caption } from '../../typography';
import { gutters } from '../../grid/utils';

const DEFAULT_SIZE = 70;

const ImagePlaceholder = ({ src, alt, ...props }: BoxProps<'img'>) => {
  const { t } = useTranslation();
  return src ? <Image src={src} alt={alt} {...props} /> : <Box {...props}>{t('components.visual-upload.no-data')}</Box>;
};

const FormikAvatarUploadSkeleton = ({ height = DEFAULT_SIZE, ...containerProps }: { height?: number } & BoxProps) => {
  return (
    <Box {...containerProps}>
      <Skeleton variant="rectangular" width={height * 2} height={height} />
      <Box marginTop={2}>
        <Skeleton variant="text" width={height * 2} />
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

  const imageUrl = useMemo(() => {
    if (selectedFile?.file) {
      return URL.createObjectURL(selectedFile.file);
    }
    return defaultVisualUrls[visualType];
  }, [selectedFile, visualType, defaultVisualUrls]);

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
    visualType === VisualType.Avatar
      ? allConstraints?.Avatar
      : visualType === VisualType.Banner
      ? allConstraints?.Banner
      : visualType === VisualType.Card
      ? allConstraints?.Card
      : visualType === VisualType.BannerWide
      ? allConstraints?.BannerWide
      : undefined;

  if (loading || !visualTypeConstraints) {
    return <FormikAvatarUploadSkeleton height={height} {...containerProps} />;
  }
  const { maxHeight, maxWidth, allowedTypes, aspectRatio } = visualTypeConstraints;

  const onFileSelected = (file: File) => {
    helpers.setValue({ file, altText });
    setCropDialogOpened(true);
  };
  const handleVisualReady = (file: File, altText: string) => {
    helpers.setValue({ file, altText });
    setCropDialogOpened(false);
  };

  const width = height * aspectRatio;

  return (
    <Box {...containerProps}>
      <FileUploadWrapper onFileSelected={onFileSelected} allowedTypes={allowedTypes}>
        <Box display="flex" flexDirection="row" gap={gutters()} marginBottom={gutters()}>
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
            src={imageUrl}
            alt={altText}
          />
          <Box>
            <Caption>{t(`pages.visualEdit.${visualType}.title`)}</Caption>
            <Caption>
              {t(`pages.visualEdit.${visualType}.description1`, { width: maxWidth, height: maxHeight })}
            </Caption>
          </Box>
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
