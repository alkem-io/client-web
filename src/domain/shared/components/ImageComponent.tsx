import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, SxProps } from '@mui/material';
import { grey } from '@mui/material/colors';

interface ImageComponentProps {
  width: number | string;
  height: number | string;
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

export default ImageComponent;
