import React, { FC } from 'react';
import { Box, BoxProps } from '@mui/material';
import useImageErrorHandler from './useImageErrorHandler';

export type ImageProps = BoxProps<'img'>;

const Image: FC<ImageProps> = ({ onError, ...props }) => {
  const reportImageError = useImageErrorHandler();

  const handleError = err => {
    reportImageError(props.src, err);
    onError?.(err);
  };

  return <Box component="img" onError={handleError} {...props} />;
};

export default Image;
